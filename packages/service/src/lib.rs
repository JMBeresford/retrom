use axum::Router;
use retrom_codegen::retrom::utils::v1::VersionAnnouncementsPayload;
use retrom_rest_service::rest_service;
use retrom_service_clients::router::clients_router;
use retrom_service_common::{
    emulator_js, reflection::reflection_router, svc_definitions::DEFAULT_RETROM_SVC_PORT,
};
use retrom_service_config::router::config_router;
use retrom_service_emulators::router::emulators_router;
use retrom_service_files::router::files_router;
use retrom_service_jobs::router::jobs_router;
use retrom_service_library::router::library_router;
use retrom_service_metadata::router::metadata_router;
use retrom_service_saves::router::saves_router;
use retrom_service_tags::router::tags_router;
use retrom_webdav_service::webdav_service;
use std::{net::SocketAddr, process::exit};
use tokio::{net::TcpListener, task::JoinHandle};
use tracing::Instrument;

use crate::reverse_proxy::reverse_proxy;

mod reverse_proxy;

const CARGO_VERSION: &str = env!("CARGO_PKG_VERSION");

#[tracing::instrument(name = "root_span")]
pub async fn get_server() -> (JoinHandle<Result<(), std::io::Error>>, SocketAddr) {
    let _ = emulator_js::EmulatorJs::new().await;

    let svc_port = match std::env::var("RETROM_SVC_PORT") {
        Ok(port_str) => match port_str.parse::<u16>() {
            Ok(port) => Some(port),
            Err(_) => {
                tracing::warn!("Invalid RETROM_SVC_PORT value '{port_str}'",);
                None
            }
        },
        Err(_) => None,
    };

    let svc_port = match svc_port {
        Some(port) => port,
        None => {
            tracing::info!("Using default RETROM_SVC_PORT: {DEFAULT_RETROM_SVC_PORT}",);
            std::env::set_var("RETROM_SVC_PORT", DEFAULT_RETROM_SVC_PORT.to_string());
            DEFAULT_RETROM_SVC_PORT
        }
    };

    let mut addr: SocketAddr = format!("0.0.0.0:{svc_port}")
        .parse()
        .expect("Could not parse address");

    let db_pool = {
        let mut delay_ms = 100u64;
        loop {
            match retrom_db::connect().await {
                Ok(pool) => break pool,
                Err(e @ retrom_db::Error::ConnectionError(_)) => {
                    tracing::info!(
                        "Error connecting to database, is the server running and accessible? \
                         Retrying in {delay_ms}ms...: {e}"
                    );
                    tokio::time::sleep(std::time::Duration::from_millis(delay_ms)).await;
                    delay_ms = (delay_ms * 2).min(5_000);
                }
                Err(e) => {
                    tracing::error!("Error connecting to database: {e}");
                    exit(1);
                }
            }
        }
    };

    retrom_db::run_migrations(&db_pool)
        .await
        .unwrap_or_else(|e| {
            tracing::error!("Could not run migrations: {e:#?}");
            exit(1)
        });

    let rest_service = rest_service(db_pool.clone());
    let webdav_service = webdav_service(Some("/dav"));
    let grpc_service = Router::new().nest(
        "/api/v1",
        reflection_router()
            .merge(config_router(None))
            .merge(clients_router(db_pool.clone()))
            .merge(emulators_router(db_pool.clone()))
            .merge(files_router())
            .merge(jobs_router())
            .merge(library_router(db_pool.clone()))
            .merge(metadata_router(db_pool.clone()))
            .merge(saves_router(db_pool.clone()))
            .merge(tags_router(db_pool)),
    );

    let router = rest_service
        .merge(reverse_proxy())
        .merge(webdav_service)
        .merge(grpc_service.clone());

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
            let (tx, rx) = tokio::sync::oneshot::channel::<()>();

            let handle = tokio::spawn(async move {
                axum::serve(listener, router)
                    .with_graceful_shutdown(async {
                        rx.await.ok();
                    })
                    .await
            });

            tokio::select! {
                _ = handle => {
                    tracing::info!("Server exited");
                }
                _ = shutdown_signal() => {
                    tx.send(()).ok();
                    tracing::info!("Shutdown signal received");
                }
            }

            tracing::info!("Server stopped");

            Ok::<(), std::io::Error>(())
        }
        .instrument(tracing::info_span!("retrom_server")),
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

    let json = match res.json::<VersionAnnouncementsPayload>().await {
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
