use std::{
    env,
    time::{Duration, Instant},
};

use tokio::sync::{mpsc, oneshot, RwLock};
use tower::{retry::Policy, Service, ServiceExt};
use tracing::{debug, error, instrument, Instrument, Level};

use crate::config::IGDBConfig;

const IGDB_CONCURRENT_REQUESTS_LIMIT: usize = 8;

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

type IGDBSenderMsg = (
    reqwest::Request,
    oneshot::Sender<Result<reqwest::Response, reqwest::StatusCode>>,
);

pub struct IGDBProvider {
    auth: RwLock<IGDBAuth>,
    user: IGDBConfig,
    request_tx: mpsc::Sender<IGDBSenderMsg>,
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

#[derive(Clone)]
struct RetryAttempts {
    attempts_left: usize,
    wait: u64,
}

impl Policy<reqwest::Request, reqwest::Response, reqwest::Error> for RetryAttempts {
    type Future = futures_util::future::Ready<Self>;

    fn retry(
        &self,
        _req: &reqwest::Request,
        result: Result<&reqwest::Response, &reqwest::Error>,
    ) -> Option<Self::Future> {
        match result.is_ok_and(|res| res.status().is_success()) {
            true => None,
            false => {
                if self.attempts_left > 0 {
                    std::thread::sleep(Duration::from_millis(self.wait));

                    Some(futures_util::future::ready(RetryAttempts {
                        attempts_left: self.attempts_left - 1,
                        wait: self.wait * 2,
                    }))
                } else {
                    None
                }
            }
        }
    }

    fn clone_request(&self, req: &reqwest::Request) -> Option<reqwest::Request> {
        req.try_clone()
    }
}

impl IGDBProvider {
    pub fn new(config: IGDBConfig) -> Self {
        let http_client = reqwest::Client::new();

        let (tx, mut rx) = mpsc::channel::<IGDBSenderMsg>(IGDB_CONCURRENT_REQUESTS_LIMIT);

        let retries = RetryAttempts {
            attempts_left: 5,
            wait: 1000,
        };

        let svc = tower::ServiceBuilder::new()
            .buffer(IGDB_CONCURRENT_REQUESTS_LIMIT)
            .concurrency_limit(IGDB_CONCURRENT_REQUESTS_LIMIT)
            .rate_limit(4, Duration::from_secs(1))
            .retry(retries)
            .service(tower::service_fn(move |req| http_client.execute(req)));

        tokio::spawn(
            async move {
                let mut svc = svc.clone();
                while let Some((req, resp_tx)) = rx.recv().await {
                    let res = match svc.ready().await {
                        Ok(svc) => match svc.call(req).await {
                            Ok(res) => Ok(res),
                            Err(e) => {
                                error!("Failed to make IGDB request: {:?}", e);
                                Err(reqwest::StatusCode::INTERNAL_SERVER_ERROR)
                            }
                        },
                        Err(e) => {
                            error!("Failed to make IGDB request: {:?}", e);
                            Err(reqwest::StatusCode::INTERNAL_SERVER_ERROR)
                        }
                    };

                    match resp_tx.send(res) {
                        Ok(_) => {}
                        Err(e) => error!("Failed to send response: {:?}", e),
                    }
                }
            }
            .instrument(tracing::info_span!("IGDBProviderService")),
        );

        Self {
            auth: RwLock::new(IGDBAuth::new(None, Duration::from_secs(0))),
            user: config,
            request_tx: tx,
        }
    }

    #[instrument(level = Level::DEBUG, skip_all)]
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

    #[instrument(level = Level::DEBUG, skip_all)]
    async fn refresh_token(&self) -> Result<(), reqwest::StatusCode> {
        let url = reqwest::Url::parse_with_params(
            &oauth2_url(),
            &[
                ("client_id", &self.user.client_id),
                ("client_secret", &self.user.client_secret),
                ("grant_type", &"client_credentials".to_string()),
            ],
        )
        .expect("Could not parse URL");

        let req = reqwest::Request::new(reqwest::Method::POST, url);

        let (tx, rx) = oneshot::channel();

        match self.request_tx.clone().send((req, tx)).await {
            Ok(_) => {}
            Err(e) => {
                error!("Failed to send request: {:?}", e);
                return Err(reqwest::StatusCode::INTERNAL_SERVER_ERROR);
            }
        }

        match rx.await.expect("Failed to receive response") {
            Ok(res) => {
                let token_res: IGDBTokenResponse =
                    res.json().await.expect("Could not parse response");

                {
                    let mut auth = self.auth.write().await;

                    auth.token = Some(token_res.access_token);
                    auth.token_expires_in = Duration::from_secs(token_res.expires_in);
                }
            }
            Err(e) => return Err(e),
        };

        Ok(())
    }

    #[instrument(level = Level::DEBUG, skip_all)]
    pub async fn maybe_refresh_token(&self) {
        if self.token_is_expired().await {
            debug!("Token expired, refreshing.");
            match self.refresh_token().await {
                Ok(_) => debug!("Token refreshed."),
                Err(e) => error!("Could not refresh token: {:?}", e),
            }
        }
    }

    #[instrument(level = Level::DEBUG, skip_all, fields(query = query.clone()))]
    pub async fn make_request(
        &self,
        path: String,
        query: String,
    ) -> Result<reqwest::Response, reqwest::StatusCode> {
        self.maybe_refresh_token().await;
        let auth = self.auth.read().await;
        let token = auth.token.clone().expect("No token found");

        let url =
            reqwest::Url::parse(&format!("{}/{}", base_url(), path)).expect("Could not parse URL");

        let mut req = reqwest::Request::new(reqwest::Method::POST, url);

        req.headers_mut()
            .insert("Client-ID", self.user.client_id.parse().unwrap());

        req.headers_mut().insert(
            "Authorization",
            format!("Bearer {}", token).parse().unwrap(),
        );

        req.body_mut().replace(query.clone().into());

        let (tx, rx) = oneshot::channel();

        match self.request_tx.clone().send((req, tx)).await {
            Ok(_) => {}
            Err(e) => {
                error!("Failed to send request: {:?}", e);
                return Err(reqwest::StatusCode::INTERNAL_SERVER_ERROR);
            }
        }

        match rx.await.expect("Failed to receive response") {
            Ok(res) => Ok(res),
            Err(e) => {
                error!("Failed to make IGDB request: {:?}", e);
                Err(reqwest::StatusCode::INTERNAL_SERVER_ERROR)
            }
        }
    }
}

fn base_url() -> String {
    env::var("IGDB_BASE_URL").unwrap_or("https://api.igdb.com/v4".into())
}

fn oauth2_url() -> String {
    env::var("IGDB_OAUTH2_URL").unwrap_or("https://id.twitch.tv/oauth2/token".into())
}
