use diesel_async::pooled_connection::AsyncDieselConnectionManager;
use either::Either;
use http::header::{ACCESS_CONTROL_REQUEST_HEADERS, CONTENT_TYPE};
use hyper::{service::make_service_fn, Server};
use retrom_db::get_db_url;
use std::{
    convert::Infallible,
    net::SocketAddr,
    pin::Pin,
    sync::Arc,
    task::{Context, Poll},
};
use tower::Service;
use tracing::info;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod grpc;
mod providers;
mod rest;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info,".into())
                .add_directive("tokio_postgres=info".parse().unwrap()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let addr: SocketAddr = "0.0.0.0:5001".parse().unwrap();

    let db_url = get_db_url();

    let config = AsyncDieselConnectionManager::<diesel_async::AsyncPgConnection>::new(db_url);
    let pool = bb8::Pool::builder()
        .max_size(15)
        .build(config)
        .await
        .expect("Could not create pool");

    let pool_state = Arc::new(pool);

    let rest_service = warp::service(rest::rest_service(pool_state.clone()));
    let grpc_service = grpc::grpc_service(pool_state.clone());

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
                headers.to_str().ok().and_then(|headers| {
                    Some(headers.contains("content-type") && headers.contains("grpc"))
                })
            })
            .is_some();

    is_grpc || is_grpc_preflight
}
