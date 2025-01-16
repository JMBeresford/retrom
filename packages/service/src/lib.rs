use core::panic;
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
use tokio::task::JoinHandle;
use tower::Service;
use tracing::Instrument;

#[cfg(feature = "embedded_db")]
use retrom_db::embedded::DB_NAME;

pub mod config;
mod grpc;
mod providers;
mod rest;

pub const DEFAULT_PORT: i32 = 5101;
pub const DEFAULT_DB_URL: &str = "postgres://postgres:postgres@localhost/retrom";
const CARGO_VERSION: &str = env!("CARGO_PKG_VERSION");

#[tracing::instrument]
pub async fn get_server(db_params: Option<&str>) -> (JoinHandle<()>, SocketAddr) {
    let config_manager = match crate::config::ServerConfigManager::new() {
        Ok(config) => Arc::new(config),
        Err(err) => {
            tracing::error!("Could not load configuration: {:#?}", err);
            exit(1)
        }
    };

    let (mut port, mut db_url) = (DEFAULT_PORT, DEFAULT_DB_URL.to_string());

    let conn_config = config_manager.get_config().await.connection;
    if let Some(config_port) = conn_config.as_ref().and_then(|conn| conn.port) {
        port = config_port;
        tracing::info!("Using port from configuration: {}", port);
    }

    if let Some(config_db_url) = conn_config.as_ref().and_then(|conn| conn.db_url.clone()) {
        db_url = config_db_url;
        tracing::info!("Using database url from configuration: {}", db_url);
    }

    let mut addr: SocketAddr = format!("0.0.0.0:{port}").parse().unwrap();

    #[cfg(feature = "embedded_db")]
    let mut psql = None;

    #[cfg(feature = "embedded_db")]
    {
        let config_db_url = conn_config.and_then(|conn| conn.db_url);

        if config_db_url.is_none() {
            use retrom_db::embedded::PgCtlFailsafeOperations;

            let mut db_url_with_params = db_url.clone();
            if let Some(db_params) = db_params {
                db_url_with_params.push_str(db_params);
            }

            psql.replace(
                match retrom_db::embedded::start_embedded_db(&db_url_with_params).await {
                    Ok(psql) => psql,
                    Err(why) => {
                        tracing::error!("Could not start embedded db: {:#?}", why);
                        panic!("Could not start embedded db");
                    }
                },
            );

            // Port may be random, so get new db_url from running instance
            if let Some(psql) = &psql {
                db_url = psql.settings().url(DB_NAME);
            }
        } else {
            tracing::debug!("Opting out of embedded db");
        }
    }

    let pool_config = AsyncDieselConnectionManager::<diesel_async::AsyncPgConnection>::new(&db_url);
    let pool = deadpool::managed::Pool::builder(pool_config)
        .build()
        .expect("Could not create pool");

    tokio::task::spawn_blocking(move || {
        let mut conn = retry(retry::delay::Exponential::from_millis(100), || {
            match retrom_db::get_db_connection_sync(&db_url) {
                Ok(conn) => retry::OperationResult::Ok(conn),
                Err(diesel::ConnectionError::BadConnection(err)) => {
                    tracing::info!("Error connecting to database, is the server running and accessible? Retrying...");
                    retry::OperationResult::Retry(err)
                },
                _ => retry::OperationResult::Err("Could not connect to database".to_string())
            }
        }).expect("Could not connect to database");

        let migrations = run_migrations(&mut conn).expect("Could not run migrations");

        migrations
            .into_iter()
            .for_each(|migration| tracing::info!("Ran migration: {}", migration));
    })
    .instrument(tracing::info_span!("run_migrations"))
    .await
    .expect("Could not run migrations");

    let pool_state = Arc::new(pool);

    let rest_service = warp::service(rest::rest_service(pool_state.clone()));
    let grpc_service = grpc::grpc_service(pool_state.clone(), config_manager);

    tracing::info!(
        "Starting Retrom {} service at: {}",
        CARGO_VERSION,
        addr.to_string()
    );

    check_version_announcements().await;

    let mut binding = Server::try_bind(&addr);

    while binding.is_err() {
        let port = addr.port();

        tracing::warn!("Could not bind to port {}, trying port {}", port, port + 1);
        let new_port = port + 1;
        addr.set_port(new_port);
        binding = Server::try_bind(&addr);
    }

    let server = binding.unwrap().serve(make_service_fn(move |_| {
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
    }));

    let port = server.local_addr();

    let handle: JoinHandle<()> = tokio::spawn(
        async move {
            if let Err(why) = server.await {
                tracing::error!("Server error: {}", why);
            }

            #[cfg(feature = "embedded_db")]
            if let Some(psql_running) = psql {
                use retrom_db::embedded::PgCtlFailsafeOperations;

                if let Err(why) = psql_running.failsafe_stop().await {
                    tracing::error!("Could not stop embedded db: {}", why);
                }

                tracing::info!("Embedded db stopped");
            }

            tracing::info!("Server stopped");
        }
        .instrument(tracing::info_span!("server_handle")),
    );

    (handle, port)
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

async fn check_version_announcements() {
    let url = "https://raw.githubusercontent.com/JMBeresford/retrom/refs/heads/main/version-announcements.json";

    let res = match reqwest::get(url).await {
        Ok(res) => res,
        Err(err) => {
            tracing::error!("Could not fetch version announcements: {}", err);
            return;
        }
    };

    if !res.status().is_success() {
        tracing::error!("Could not fetch version announcements: {}", res.status());
        return;
    }

    let json = match res
        .json::<retrom_codegen::retrom::VersionAnnouncementsPayload>()
        .await
    {
        Ok(json) => json,
        Err(err) => {
            tracing::error!("Could not parse version announcements: {}", err);
            return;
        }
    };

    json.announcements.iter().for_each(|announcement| {
        announcement.versions.iter().for_each(|version| {
            if version == CARGO_VERSION {
                match announcement.level.as_str() {
                    "info" => tracing::info!("Version announcement: {}", announcement.message),
                    "warn" | "warning" => {
                        tracing::warn!("Version announcement: {}", announcement.message)
                    }
                    "error" => tracing::error!("Version announcement: {}", announcement.message),
                    _ => tracing::debug!("Skipping version announcement: {}", announcement.message),
                }
            }
        });
    });
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
