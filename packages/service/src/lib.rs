use diesel_async::pooled_connection::AsyncDieselConnectionManager;
use http::header::{ACCESS_CONTROL_REQUEST_HEADERS, CONTENT_TYPE};
use hyper::{body::Incoming, Request};
use hyper_util::rt::{TokioExecutor, TokioIo};
use opentelemetry_otlp::OTEL_EXPORTER_OTLP_ENDPOINT;
use retrom_db::run_migrations;
use retrom_grpc_service::grpc_service;
use retrom_rest_service::rest_service;
use retrom_service_common::{config::ServerConfigManager, emulator_js};
use retrom_webdav_service::webdav_service;
use retry::retry;
use std::{convert::Infallible, net::SocketAddr, process::exit, sync::Arc};
use tokio::{net::TcpListener, task::JoinHandle};
use tower::{service_fn, ServiceExt};
use tracing::{info_span, Instrument};

#[cfg(feature = "embedded_db")]
use retrom_db::embedded::DB_NAME;

pub const DEFAULT_PORT: i32 = 5101;
pub const DEFAULT_DB_URL: &str = "postgres://postgres:postgres@localhost/retrom";
const CARGO_VERSION: &str = env!("CARGO_PKG_VERSION");

#[tracing::instrument(name = "root_span")]
pub async fn get_server(
    db_params: Option<&str>,
) -> (JoinHandle<Result<(), std::io::Error>>, SocketAddr) {
    let _ = emulator_js::EmulatorJs::new().await;
    let config_manager = match ServerConfigManager::new() {
        Ok(config) => Arc::new(config),
        Err(err) => {
            tracing::error!("Could not load configuration: {:#?}", err);
            exit(1)
        }
    };

    if config_manager
        .get_config()
        .await
        .telemetry
        .is_some_and(|t| t.enabled)
    {
        tracing::info!(
            "OpenTelemetry Tracing enabled: {:#?}",
            std::env::var(OTEL_EXPORTER_OTLP_ENDPOINT).unwrap_or("endpoint unset".into())
        );
    } else {
        tracing::warn!("OpenTelemetry Tracing is disabled, no telemetry data will be collected.");
    }

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
        use core::panic;
        let config_db_url = conn_config.and_then(|conn| conn.db_url);

        if config_db_url.is_none() {
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

    // pool used for REST service endpoints
    let pool = deadpool::managed::Pool::builder(pool_config)
        .max_size(
            std::thread::available_parallelism()
                .unwrap_or(std::num::NonZero::new(2_usize).unwrap())
                .into(),
        )
        .build()
        .expect("Could not create pool");

    let db_url_clone = db_url.clone();
    tokio::task::spawn_blocking(move || {
        let mut conn = retry(retry::delay::Exponential::from_millis(100), || {
            match retrom_db::get_db_connection_sync(&db_url_clone) {
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
    .await
    .expect("Could not run migrations");

    let pool_state = Arc::new(pool);

    let rest_service = rest_service(pool_state.clone());
    let grpc_service = grpc_service(&db_url, config_manager);
    let webdav_service = webdav_service(Some("/dav"));

    tracing::info!(
        "Starting Retrom {} service at: {}",
        CARGO_VERSION,
        addr.to_string()
    );

    check_version_announcements().await;

    let mut listener = TcpListener::bind(&addr).await;
    while listener.is_err() {
        let port = addr.port();

        tracing::warn!("Could not bind to port {}, trying port {}", port, port + 1);
        let new_port = port + 1;
        addr.set_port(new_port);
        listener = TcpListener::bind(&addr).await;
    }

    let listener = listener.expect("Could not bind to address");
    let port = listener.local_addr().expect("Could not get local address");

    let handle: JoinHandle<_> = tokio::spawn(
        async move {
            let server = async {
                loop {
                    let (socket, addr) = listener
                        .accept()
                        .await
                        .expect("Could not accept connection");

                    let grpc_service = grpc_service.clone();
                    let rest_service = rest_service.clone();
                    let webdav_service = webdav_service.clone();

                    tokio::spawn(
                        async move {
                            let socket = TokioIo::new(socket);

                            let hyper_service =
                                hyper::service::service_fn(move |req: Request<Incoming>| {
                                    let is_grpc = req
                                        .headers()
                                        .get(CONTENT_TYPE)
                                        .map(|content_type| content_type.as_bytes())
                                        .filter(|content_type| {
                                            content_type.starts_with(b"application/grpc")
                                        })
                                        .is_some();

                                    let is_grpc_preflight = req.method() == hyper::Method::OPTIONS
                                        && req
                                            .headers()
                                            .get(ACCESS_CONTROL_REQUEST_HEADERS)
                                            .map(|headers| {
                                                headers.to_str().ok().map(|headers| {
                                                    headers.contains("content-type")
                                                        && headers.contains("grpc")
                                                })
                                            })
                                            .is_some();

                                    if is_grpc || is_grpc_preflight {
                                        tracing::debug!(
                                            "Routing request to gRPC service: {} {}",
                                            req.method(),
                                            req.uri().path()
                                        );
                                        grpc_service.clone().oneshot(req)
                                    } else if req.uri().path().starts_with("/dav") {
                                        tracing::debug!(
                                            "Routing request to WebDAV service: {} {}",
                                            req.method(),
                                            req.uri().path()
                                        );

                                        webdav_service.clone().oneshot(req)
                                    } else {
                                        tracing::debug!(
                                            "Routing request to REST service: {} {}",
                                            req.method(),
                                            req.uri().path()
                                        );

                                        rest_service.clone().oneshot(req)
                                    }
                                });

                            if let Err(err) =
                                hyper_util::server::conn::auto::Builder::new(TokioExecutor::new())
                                    .serve_connection(socket, hyper_service)
                                    .await
                            {
                                tracing::error!("Error serving connection for {}: {}", addr, err);
                            }
                        }
                        .instrument(info_span!("connection", %addr)),
                    );
                }
            }
            .instrument(info_span!("server_loop"));

            tokio::select! {
                _ = server => {
                    tracing::info!("Server exited");
                }
                _ = shutdown_signal() => {
                    tracing::info!("Shutdown signal received");
                }
            }

            #[cfg(feature = "embedded_db")]
            if let Some(psql_running) = psql {
                if let Err(why) = psql_running.stop().await {
                    tracing::error!("Could not stop embedded db: {}", why);
                }

                tracing::info!("Embedded db stopped");
            }

            tracing::info!("Server stopped");

            Ok::<(), std::io::Error>(())
        }
        .instrument(tracing::info_span!("server_task")),
    );

    (handle, port)
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

async fn shutdown_signal() {
    #[cfg(windows)]
    {
        let _ = tokio::signal::ctrl_c().await;
        tracing::info!("Received Ctrl+C, shutting down...");
    }

    #[cfg(not(windows))]
    {
        use futures::stream::StreamExt;
        use signal_hook::consts::signal::*;
        use signal_hook_tokio::Signals;

        let mut signals =
            Signals::new([SIGTERM, SIGINT, SIGQUIT]).expect("Could not create signal handler");

        let handle = signals.handle();
        let handle_signals = async move {
            while let Some(signal) = signals.next().await {
                match signal {
                    SIGTERM | SIGINT | SIGQUIT => {
                        break;
                    }
                    _ => {}
                }
            }
        };

        tokio::select! {
             _ = handle_signals => {
                tracing::info!("Received termination signal, shutting down...");
            }
            _ = tokio::signal::ctrl_c() => {
                tracing::info!("Received Ctrl+C, shutting down...");
            }
        }

        handle.close();
    }
}
