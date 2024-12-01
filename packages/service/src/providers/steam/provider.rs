use std::{
    str::FromStr,
    time::Duration,
};

use chrono::DateTime;
use retrom_codegen::{retrom, timestamp::Timestamp};
use tokio::sync::{mpsc, oneshot};
use tower::{Service, ServiceExt};
use tracing::{instrument, Instrument};

use crate::{
    config::SteamConfig,
    providers::{steam::models, RetryAttempts},
};

type SteamSenderMsg = (
    reqwest::Request,
    oneshot::Sender<Result<reqwest::Response, reqwest::StatusCode>>,
);

pub struct SteamWebApiProvider {
    base_url: String,
    store_base_url: String,
    request_tx: mpsc::Sender<SteamSenderMsg>,
    user: SteamConfig,
}

impl SteamWebApiProvider {
    pub fn new(user: SteamConfig) -> Self {
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
            user,
            base_url,
            store_base_url,
        }
    }

    pub fn app_details_to_game_metadata(
        &self,
        app: models::Game,
        app_details: models::AppDetails,
    ) -> retrom::NewGameMetadata {
        let video_urls: Vec<String> = app_details
            .movies
            .map(|movies| {
                movies
                    .into_iter()
                    .filter_map(|movie| {
                        movie
                            .webm
                            .map(|quality| quality.max.clone())
                            .or(movie.mp4.map(|quality| quality.max.clone()))
                            .flatten()
                    })
                    .collect()
            })
            .unwrap_or_default();

        let screenshot_urls: Vec<String> = app_details
            .screenshots
            .map(|screenshots| {
                screenshots
                    .into_iter()
                    .map(|screenshot| screenshot.path_full)
                    .collect()
            })
            .unwrap_or_default();

        let mut artwork_urls: Vec<String> = vec![];

        if let Some(ref header_url) = app_details.header_image {
            artwork_urls.push(header_url.clone());
        }

        if let Some(ref background_url) = app_details.background_raw {
            artwork_urls.push(background_url.clone());
        }

        let cover_url = app_details.steam_appid.map(|id| {
            format!(
                "https://steamcdn-a.akamaihd.net/steam/apps/{}/library_600x900_2x.jpg",
                id
            )
        });

        let icon_url = app.img_icon_url.map(|icon_id| {
            format!(
                "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/{}/{}.jpg",
                app.appid, icon_id
            )
        });

        let background_url = Some(format!(
            "https://steamcdn-a.akamaihd.net/steam/apps/{}/library_hero.jpg",
            app.appid
        ));

        let last_played = if app.rtime_last_played > 0 {
            let dt = DateTime::from_timestamp(app.rtime_last_played, 0);

            dt.map(|dt| Timestamp {
                seconds: dt.timestamp(),
                nanos: 0,
            })
        } else {
            None
        };

        let minutes_played = if app.playtime_forever > 0 {
            Some(app.playtime_forever)
        } else {
            None
        };

        retrom::NewGameMetadata {
            description: app_details.short_description,
            name: app_details.name,
            cover_url,
            background_url,
            links: app_details
                .website
                .map(|website| vec![website])
                .unwrap_or_default(),
            icon_url,
            artwork_urls,
            screenshot_urls,
            video_urls,
            last_played,
            minutes_played,
            ..Default::default()
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

        if let Some(api_key) = &self.user.api_key {
            url.query_pairs_mut().append_pair("key", api_key);
        }

        if let Some(user_id) = &self.user.user_id {
            url.query_pairs_mut().append_pair("steamid", user_id);
        }

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
