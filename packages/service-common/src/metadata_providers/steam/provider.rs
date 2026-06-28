use crate::{
    config::ServerConfigManager,
    metadata_providers::{steam::models, RetryAttempts},
};
use std::{str::FromStr, sync::Arc, time::Duration};
use tokio::sync::{mpsc, oneshot};
use tower::{Service, ServiceExt};
use tracing::{instrument, Instrument};

pub const STEAM_PLATFORM_ID: &str = "00000000-0000-0000-0000-000000000001";
pub const STEAM_PROVIDER_ID: &str = "00000000-0000-0000-0000-000000000003";

type SteamSenderMsg = (
    reqwest::Request,
    oneshot::Sender<Result<reqwest::Response, reqwest::StatusCode>>,
);

pub struct SteamWebApiProvider {
    base_url: String,
    store_base_url: String,
    request_tx: mpsc::Sender<SteamSenderMsg>,
    config_manager: Arc<ServerConfigManager>,
}

impl SteamWebApiProvider {
    pub fn new(config_manager: Arc<ServerConfigManager>) -> Self {
        let base_url = "https://api.steampowered.com".into();
        let store_base_url = "https://store.steampowered.com/api".into();
        let http_client = reqwest::Client::new();

        let (tx, mut rx) = mpsc::channel::<SteamSenderMsg>(100);

        let retries = RetryAttempts::new(5);

        let svc = tower::ServiceBuilder::new()
            .buffer(20)
            .concurrency_limit(10)
            .rate_limit(300, Duration::from_secs(5 * 60))
            .retry(retries)
            .service_fn(move |req| http_client.execute(req));

        tokio::spawn(
            async move {
                let mut svc = svc.clone();
                while let Some((req, resp_tx)) = rx.recv().await {
                    let res = match svc.ready().await {
                        Ok(svc) => match svc.call(req).await {
                            Ok(res) => Ok(res),
                            Err(e) => {
                                tracing::error!("Failed to make Steam request: {:?}", e);
                                Err(reqwest::StatusCode::INTERNAL_SERVER_ERROR)
                            }
                        },
                        Err(e) => {
                            tracing::error!("Failed to make Steam request: {:?}", e);
                            Err(reqwest::StatusCode::INTERNAL_SERVER_ERROR)
                        }
                    };

                    match resp_tx.send(res) {
                        Ok(_) => {}
                        Err(e) => tracing::error!("Failed to send response: {:?}", e),
                    }
                }
            }
            .instrument(tracing::info_span!("SteamProviderService")),
        );

        Self {
            request_tx: tx,
            config_manager,
            base_url,
            store_base_url,
        }
    }

    #[instrument(skip(self))]
    pub async fn get_app_details(
        &self,
        app_id: u32,
    ) -> Result<models::AppDetails, reqwest::StatusCode> {
        let path = self.store_base_url.to_string() + "/appdetails";

        let mut url = reqwest::Url::from_str(&path).expect("Invalid Base URL");

        url.query_pairs_mut()
            .append_pair("appids", &app_id.to_string());

        tracing::debug!("Requesting App Details for App ID: {}", app_id);

        let req = reqwest::Request::new(reqwest::Method::GET, url);

        let mut res = self
            .make_request(req)
            .await?
            .json::<models::AppDetailsResponse>()
            .await
            .map_err(|e| {
                e.status()
                    .unwrap_or(reqwest::StatusCode::INTERNAL_SERVER_ERROR)
            })?;

        let app_details = match res.remove(&app_id.to_string()) {
            Some(details) => match details.data {
                Some(data) => data,
                None => return Err(reqwest::StatusCode::NOT_FOUND),
            },
            None => return Err(reqwest::StatusCode::NOT_FOUND),
        };

        Ok(app_details)
    }

    #[instrument(skip(self))]
    pub async fn get_owned_games(
        &self,
    ) -> Result<models::GetOwnedGamesResponse, reqwest::StatusCode> {
        let path = self.base_url.to_string() + "/IPlayerService/GetOwnedGames/v1/";
        let mut url = reqwest::Url::from_str(&path).expect("Invalid Base URL");
        let config = self.config_manager.get_config().await;

        let user = match config.steam {
            Some(steam) => steam,
            None => return Err(reqwest::StatusCode::UNAUTHORIZED),
        };

        url.query_pairs_mut().append_pair("key", &user.api_key);
        url.query_pairs_mut().append_pair("steamid", &user.user_id);
        url.query_pairs_mut()
            .append_pair("include_appinfo", "true")
            .append_pair("include_played_free_games", "true");

        let req = reqwest::Request::new(reqwest::Method::GET, url);
        let res = self.make_request(req).await?;

        res.json::<models::GetOwnedGamesResponse>()
            .await
            .map_err(|e| {
                e.status()
                    .unwrap_or(reqwest::StatusCode::INTERNAL_SERVER_ERROR)
            })
    }

    async fn make_request(
        &self,
        req: reqwest::Request,
    ) -> Result<reqwest::Response, reqwest::StatusCode> {
        let (tx, rx) = oneshot::channel();

        match self.request_tx.clone().send((req, tx)).await {
            Ok(_) => {}
            Err(e) => {
                tracing::error!("Failed to send request: {:?}", e);
                return Err(reqwest::StatusCode::INTERNAL_SERVER_ERROR);
            }
        }

        match rx.await.expect("Failed to receive response") {
            Ok(res) => Ok(res),
            Err(e) => {
                tracing::error!("Failed to make Steam request: {:?}", e);
                Err(reqwest::StatusCode::INTERNAL_SERVER_ERROR)
            }
        }
    }
}
