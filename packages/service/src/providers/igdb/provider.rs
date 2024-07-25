use std::{
    env,
    time::{Duration, Instant},
};

use tokio::sync::RwLock;
use tracing::{debug, error, info, instrument, Level};

#[derive(Debug, serde::Deserialize)]
struct IGDBTokenResponse {
    access_token: String,
    expires_in: u64,
}

pub struct IGDBAuth {
    token: Option<String>,
    token_expires_in: Duration,
    token_created_at: Instant,
}

pub struct IGDBProvider {
    auth: RwLock<IGDBAuth>,
    pub http_client: reqwest::Client,
}

impl IGDBAuth {
    pub fn new(token: Option<String>, expires_in: Duration) -> Self {
        Self {
            token,
            token_expires_in: expires_in,
            token_created_at: Instant::now(),
        }
    }
}

impl IGDBProvider {
    pub fn new() -> Self {
        let http_client = reqwest::Client::new();

        Self {
            auth: RwLock::new(IGDBAuth::new(None, Duration::from_secs(0))),
            http_client,
        }
    }

    pub async fn token_is_expired(&self) -> bool {
        let auth = self.auth.read().await;

        match &auth.token {
            Some(_) => {
                let elapsed = auth.token_created_at.elapsed();
                elapsed > auth.token_expires_in
            }
            None => true,
        }
    }

    async fn refresh_token(&self) -> Result<(), reqwest::Error> {
        let mut auth = self.auth.write().await;

        let res = self
            .http_client
            .post(oauth2_url())
            .query(&[
                ("client_id", client_id()),
                ("client_secret", client_secret()),
                ("grant_type", "client_credentials".to_string()),
            ])
            .send();

        match res.await {
            Ok(res) => {
                let token_res: IGDBTokenResponse =
                    res.json().await.expect("Could not parse response");

                auth.token = Some(token_res.access_token);
                auth.token_expires_in = Duration::from_secs(token_res.expires_in);
            }
            Err(e) => return Err(e),
        };

        Ok(())
    }

    pub async fn maybe_refresh_token(&self) {
        if self.token_is_expired().await {
            debug!("Token expired, refreshing.");
            match self.refresh_token().await {
                Ok(_) => debug!("Token refreshed."),
                Err(e) => error!("Could not refresh token: {:?}", e),
            }
        }
    }

    #[instrument(level = Level::DEBUG, skip_all)]
    pub async fn make_request(
        &self,
        path: String,
        query: String,
    ) -> Result<reqwest::Response, reqwest::Error> {
        self.maybe_refresh_token().await;
        let auth = self.auth.read().await;
        let token = auth.token.clone().expect("No token found");

        let res = self
            .http_client
            .post(format!("{}/{}", base_url(), path))
            .header("Client-ID", client_id())
            .header("Authorization", format!("Bearer {}", token))
            .body(query)
            .send()
            .await;

        match res {
            Ok(res) => Ok(res),
            Err(e) => return Err(e),
        }
    }
}

fn client_id() -> String {
    env::var("IGDB_CLIENT_ID").expect("IGDB_CLIENT_ID not set")
}

fn client_secret() -> String {
    env::var("IGDB_CLIENT_SECRET").expect("IGDB_CLIENT_SECRET not set")
}

fn base_url() -> String {
    env::var("IGDB_BASE_URL").unwrap_or("https://api.igdb.com/v4".into())
}

fn oauth2_url() -> String {
    env::var("IGDB_OAUTH2_URL").unwrap_or("https://id.twitch.tv/oauth2/token".into())
}
