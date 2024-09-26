use diesel_async::pooled_connection::AsyncDieselConnectionManager;
use either::Either;
use http::header::{ACCESS_CONTROL_REQUEST_HEADERS, CONTENT_TYPE};
use hyper::{service::make_service_fn, Server};
use retrom_db::run_migrations;
use retry::retry;
use std::{
    convert::Infallible,
    net::SocketAddr,
    pin::Pin,
    process::exit,
    sync::Arc,
    task::{Context, Poll},
};
use tower::Service;
use tracing::{error, info, Instrument};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod config;
mod grpc;
mod providers;
mod rest;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info,".into())
                .add_directive("tokio_postgres=info".parse().unwrap())
                .add_directive("hyper=info".parse().unwrap()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let server_config = match crate::config::ServerConfig::new() {
        Ok(config) => config,
        Err(err) => {
            error!("Could not load configuration: {}", err);
            exit(1)
        }
    };

    let port = server_config.connection.port;
    let db_url = server_config.connection.db_url.clone();
    let addr: SocketAddr = format!("0.0.0.0:{port}").parse().unwrap();

    let pool_config = AsyncDieselConnectionManager::<diesel_async::AsyncPgConnection>::new(&db_url);
    let pool = deadpool::managed::Pool::builder(pool_config)
        .build()
        .expect("Could not create pool");

    tokio::task::spawn_blocking(move || {
        let mut conn = retry(retry::delay::Exponential::from_millis(100), || {
            match retrom_db::get_db_connection_sync(&db_url) {
                Ok(conn) => retry::OperationResult::Ok(conn),
                Err(diesel::ConnectionError::BadConnection(err)) => {
                    info!("Error connecting to database, is the server running and accessible? Retrying...");
                    retry::OperationResult::Retry(err)
                },
                _ => retry::OperationResult::Err("Could not connect to database".to_string())
            }
        }).expect("Could not connect to database");

        let migrations = run_migrations(&mut conn).expect("Could not run migrations");

        migrations
            .into_iter()
            .for_each(|migration| info!("Ran migration: {}", migration));
    })
    .instrument(tracing::info_span!("run_migrations"))
    .await
    .expect("Could not run migrations");

    let pool_state = Arc::new(pool);

    let rest_service = warp::service(rest::rest_service(pool_state.clone()));
    let grpc_service = grpc::grpc_service(pool_state.clone(), Arc::new(server_config));

    info!("Starting server at: {}", addr.to_string());
    Server::bind(&addr)
        .serve(make_service_fn(move |_| {
            let mut rest_service = rest_service.clone();
            let mut grpc_service = grpc_service.clone();
            std::future::ready(Ok::<_, Infallible>(tower::service_fn(
                move |req: hyper::Request<hyper::Body>| match is_grpc_request(&req) {
                    false => Either::Left({
                        let res = rest_service.call(req);
                        Box::pin(async move {
                            let res = res.await.map(|res| res.map(EitherBody::Left))?;
                            Ok::<_, Error>(res)
                        })
                    }),
                    true => Either::Right({
                        let res = grpc_service.call(req);
                        Box::pin(async move {
                            let res = res.await.map(|res| res.map(EitherBody::Right))?;
                            Ok::<_, Error>(res)
                        })
                    }),
                },
            )))
        }))
        .await?;

    Ok(())
}

type Error = Box<dyn std::error::Error + Send + Sync + 'static>;

enum EitherBody<A, B> {
    Left(A),
    Right(B),
}

impl<A, B> http_body::Body for EitherBody<A, B>
where
    A: http_body::Body + Send + Unpin,
    B: http_body::Body<Data = A::Data> + Send + Unpin,
    A::Error: Into<Error>,
    B::Error: Into<Error>,
{
    type Data = A::Data;
    type Error = Box<dyn std::error::Error + Send + Sync + 'static>;

    fn is_end_stream(&self) -> bool {
        match self {
            EitherBody::Left(b) => b.is_end_stream(),
            EitherBody::Right(b) => b.is_end_stream(),
        }
    }

    fn poll_data(
        self: Pin<&mut Self>,
        cx: &mut Context<'_>,
    ) -> Poll<Option<Result<Self::Data, Self::Error>>> {
        match self.get_mut() {
            EitherBody::Left(b) => Pin::new(b).poll_data(cx).map(map_option_err),
            EitherBody::Right(b) => Pin::new(b).poll_data(cx).map(map_option_err),
        }
    }

    fn poll_trailers(
        self: Pin<&mut Self>,
        cx: &mut Context<'_>,
    ) -> Poll<Result<Option<http::HeaderMap>, Self::Error>> {
        match self.get_mut() {
            EitherBody::Left(b) => Pin::new(b).poll_trailers(cx).map_err(Into::into),
            EitherBody::Right(b) => Pin::new(b).poll_trailers(cx).map_err(Into::into),
        }
    }
}

fn map_option_err<T, U: Into<Error>>(err: Option<Result<T, U>>) -> Option<Result<T, Error>> {
    err.map(|e| e.map_err(Into::into))
}

fn is_grpc_request(req: &hyper::Request<hyper::Body>) -> bool {
    let is_grpc = req
        .headers()
        .get(CONTENT_TYPE)
        .map(|content_type| content_type.as_bytes())
        .filter(|content_type| content_type.starts_with(b"application/grpc"))
        .is_some();

    let is_grpc_preflight = req.method() == hyper::Method::OPTIONS
        && req
            .headers()
            .get(ACCESS_CONTROL_REQUEST_HEADERS)
            .map(|headers| {
                headers
                    .to_str()
                    .ok()
                    .map(|headers| headers.contains("content-type") && headers.contains("grpc"))
            })
            .is_some();

    is_grpc || is_grpc_preflight
}
