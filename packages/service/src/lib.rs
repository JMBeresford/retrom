use crate::{grpc::metadata::MetadataServiceHandlers, providers::igdb::provider::IGDBProvider};
use db::get_db_url;
use diesel_async::pooled_connection::AsyncDieselConnectionManager;
use either::Either;
use generated::retrom::{
    game_service_server::GameServiceServer, library_service_server::LibraryServiceServer,
    metadata_service_server::MetadataServiceServer, platform_service_server::PlatformServiceServer,
    FILE_DESCRIPTOR_SET,
};
use grpc::{
    games::GameServiceHandlers, library::LibraryServiceHandlers, platforms::PlatformServiceHandlers,
};
use http::header::CONTENT_TYPE;
use hyper::{service::make_service_fn, Server};
use std::{
    convert::Infallible,
    net::SocketAddr,
    pin::Pin,
    sync::Arc,
    task::{Context, Poll},
};
use tonic::transport::Server as TonicServer;
use tower::Service;
use tracing::info;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod grpc;
mod providers;
mod rest;

pub async fn start_service() -> Result<(), Box<dyn std::error::Error>> {
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
    let igdb_client = Arc::new(IGDBProvider::new());

    let rest_service = warp::service(rest::rest_service(pool_state.clone()));

    let reflection_service = tonic_reflection::server::Builder::configure()
        .register_encoded_file_descriptor_set(FILE_DESCRIPTOR_SET)
        .build()
        .unwrap();

    let library_service = LibraryServiceServer::new(LibraryServiceHandlers::new(
        pool_state.clone(),
        igdb_client.clone(),
    ));
    let metadata_service = MetadataServiceServer::new(MetadataServiceHandlers::new(
        pool_state.clone(),
        igdb_client.clone(),
    ));
    let game_service = GameServiceServer::new(GameServiceHandlers::new(pool_state.clone()));
    let platform_service =
        PlatformServiceServer::new(PlatformServiceHandlers::new(pool_state.clone()));

    let grpc_service = TonicServer::builder()
        .trace_fn(|_| tracing::info_span!("service"))
        .add_service(reflection_service)
        .add_service(library_service)
        .add_service(game_service)
        .add_service(platform_service)
        .add_service(metadata_service)
        .into_service();

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
    req.headers()
        .get(CONTENT_TYPE)
        .map(|content_type| content_type.as_bytes())
        .filter(|content_type| content_type.starts_with(b"application/grpc"))
        .is_some()
}
