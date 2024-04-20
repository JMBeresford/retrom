use std::{
    env,
    time::{Duration, Instant},
};

#[derive(Debug, serde::Deserialize)]
struct IGDBTokenResponse {
    access_token: String,
    expires_in: u64,
}

pub struct IGDBToken {
    token: String,
    expires_in: Duration,
    created_at: Instant,
}

pub struct IGDBProvider {
    token: Option<IGDBToken>,
    http_client: reqwest::Client,
    base_url: String,
    oauth2_url: String,
}

impl IGDBToken {
    pub fn new(token: String, expires_in: Duration) -> Self {
        Self {
            token,
            expires_in,
            created_at: Instant::now(),
        }
    }
}

impl IGDBProvider {
    pub fn new() -> Self {
        let http_client = reqwest::Client::new();
        let base_url = env::var("IGDB_BASE_URL").unwrap_or("https://api.igdb.com/v4".into());
        let oauth2_url =
            env::var("IGDB_OAUTH2_URL").unwrap_or("https://id.twitch.tv/oauth2/token".into());

        Self {
            token: None,
            http_client,
            base_url,
            oauth2_url,
        }
    }

    pub fn token_is_expired(&self) -> bool {
        match &self.token {
            Some(token) => {
                let elapsed = token.created_at.elapsed();
                elapsed > token.expires_in
            }
            None => true,
        }
    }

    pub async fn refresh_token(&mut self) -> Result<(), reqwest::Error> {
        let client_id = env::var("IGDB_CLIENT_ID").expect("IGDB_CLIENT_ID not set");
        let client_secret = env::var("IGDB_CLIENT_SECRET").expect("IGDB_CLIENT_SECRET not set");

        if !self.token_is_expired() {
            return Ok(());
        }

        let res = self
            .http_client
            .post(&self.oauth2_url)
            .query(&[
                ("client_id", client_id),
                ("client_secret", client_secret),
                ("grant_type", "client_credentials".to_string()),
            ])
            .send();

        match res.await {
            Ok(res) => {
                let token_res: IGDBTokenResponse =
                    res.json().await.expect("Could not parse response");

                self.token = Some(IGDBToken::new(
                    token_res.access_token,
                    Duration::from_secs(token_res.expires_in),
                ));
            }
            Err(e) => return Err(e),
        };

        Ok(())
    }

    pub async fn make_request(
        &mut self,
        path: String,
        query: String,
    ) -> Result<reqwest::Response, reqwest::Error> {
        self.refresh_token().await.expect("Could not refresh token");
        let token = self.token.as_ref().expect("Token not set");
        let client_id = env::var("IGDB_CLIENT_ID").expect("IGDB_CLIENT_ID not set");

        let res = self
            .http_client
            .post(&format!("{}/{}", self.base_url, path))
            .header("Client-ID", client_id)
            .header("Authorization", format!("Bearer {}", token.token))
            .body(query)
            .send()
            .await;

        match res {
            Ok(res) => Ok(res),
            Err(e) => return Err(e),
        }
    }

    pub async fn get_games(
        &mut self,
        search_string: String,
    ) -> Result<igdb::GameResult, reqwest::Error> {
        let query = format!(
            "fields name, cover.url; search \"{}\"; limit 10;",
            search_string
        );

        let res = match self.make_request("games.pb".into(), query).await {
            Ok(res) => Ok(res),
            Err(e) => return Err(e),
        };

        let bytes = match res {
            Ok(res) => res.bytes().await.expect("Could not parse response"),

            Err(e) => return Err(e),
        };

        Ok(igdb::GameResult::decode(bytes).expect("Could not decode response"))
    }
}
