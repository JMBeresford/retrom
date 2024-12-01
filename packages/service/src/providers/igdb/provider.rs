use std::{
    env,
    time::{Duration, Instant},
};

use crate::providers::MetadataProvider;
use crate::{config::IGDBConfig, providers::RetryAttempts};
use prost::Message;
use retrom_codegen::{
    igdb,
    retrom::{
        get_igdb_search_request::IgdbSearchType,
        igdb_fields::Selector,
        igdb_filters::{FilterOperator, FilterValue},
        GetIgdbSearchRequest,
    },
};
use tokio::sync::{mpsc, oneshot, RwLock};
use tower::{Service, ServiceExt};
use tracing::{debug, error, instrument, Instrument, Level};

const IGDB_CONCURRENT_REQUESTS_LIMIT: usize = 8;

pub enum IgdbSearchData {
    Game(igdb::GameResult),
    Platform(igdb::PlatformResult),
}

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
    pub game_fields: Vec<String>,
    pub platform_fields: Vec<String>,
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
    pub fn new(config: IGDBConfig) -> Self {
        let http_client = reqwest::Client::new();

        let (tx, mut rx) = mpsc::channel::<IGDBSenderMsg>(IGDB_CONCURRENT_REQUESTS_LIMIT);

        let retries = RetryAttempts::new(5);

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

        let game_fields = vec![
            "name".to_string(),
            "cover.url".to_string(),
            "artworks.url".to_string(),
            "artworks.height".to_string(),
            "artworks.width".to_string(),
            "summary".to_string(),
            "websites.url".to_string(),
            "websites.trusted".to_string(),
            "videos.name".to_string(),
            "videos.video_id".to_string(),
        ];

        let platform_fields = vec![
            "name".to_string(),
            "summary".to_string(),
            "platform_logo.url".to_string(),
            "websites.url".to_string(),
            "websites.trusted".to_string(),
        ];

        Self {
            auth: RwLock::new(IGDBAuth::new(None, Duration::from_secs(0))),
            user: config,
            request_tx: tx,
            game_fields,
            platform_fields,
        }
    }

    #[instrument(level = Level::DEBUG, skip_all)]
    async fn token_is_expired(&self) -> bool {
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
    async fn maybe_refresh_token(&self) {
        if self.token_is_expired().await {
            debug!("Token expired, refreshing.");
            match self.refresh_token().await {
                Ok(_) => debug!("Token refreshed."),
                Err(e) => error!("Could not refresh token: {:?}", e),
            }
        }
    }

    #[instrument(level = Level::DEBUG, skip_all, fields(query = query.clone()))]
    async fn make_request(
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

impl MetadataProvider<GetIgdbSearchRequest, IgdbSearchData> for IGDBProvider {
    #[instrument(level = Level::DEBUG, skip_all)]
    async fn search_metadata(&self, request: GetIgdbSearchRequest) -> Option<IgdbSearchData> {
        let search_type = request.search_type();

        let search_clause = match request.search.map(|search| search.value) {
            Some(value) => {
                if value.is_empty() {
                    "".into()
                } else {
                    format!("search \"{value}\";")
                }
            }
            None => "".to_string(),
        };

        let fields = request.fields.as_ref();

        let fields_clause = match fields.and_then(|fields| fields.selector.as_ref()) {
            Some(Selector::Include(fields)) => {
                if fields.value.is_empty() {
                    "".into()
                } else {
                    format!("fields {};", fields.value.join(", "))
                }
            }
            Some(Selector::Exclude(fields)) => {
                if fields.value.is_empty() {
                    "".into()
                } else {
                    format!("fields *; exclude {};", fields.value.join(", "))
                }
            }
            None => "".to_string(),
        };

        let filters_clause = match request.filters.map(|filters| filters.filters) {
            Some(filters) => {
                if filters.is_empty() {
                    "".into()
                } else {
                    format!(
                        "where {};",
                        filters
                            .into_iter()
                            .map(render_filter_operation)
                            .collect::<Vec<String>>()
                            .join(" | ")
                    )
                }
            }
            None => "".to_string(),
        };

        let pagination = request.pagination.as_ref();

        let limit_clause = match pagination.map(|pagination| &pagination.limit) {
            Some(Some(limit)) => format!("limit {limit};"),
            _ => "".to_string(),
        };

        let offset_clause = match pagination.map(|pagination| &pagination.offset) {
            Some(Some(offset)) => format!("offset {offset};"),
            _ => "".to_string(),
        };

        let query =
            format!("{search_clause}{fields_clause}{filters_clause}{limit_clause}{offset_clause}",);

        let target = match search_type {
            IgdbSearchType::Game => "games.pb".into(),
            IgdbSearchType::Platform => "platforms.pb".into(),
        };

        let res = match self.make_request(target, query).await {
            Ok(res) => res,
            Err(why) => {
                error!("Could not make request: {:?}", why);
                return None;
            }
        };

        let bytes = match res.bytes().await {
            Ok(bytes) => bytes,
            Err(why) => {
                error!("Could not get bytes: {:?}", why);
                return None;
            }
        };

        match search_type {
            IgdbSearchType::Game => {
                let matches = match igdb::GameResult::decode(bytes) {
                    Ok(matches) => matches,
                    Err(why) => {
                        error!("Could not decode response: {:?}", why);
                        return None;
                    }
                };

                IgdbSearchData::Game(matches).into()
            }
            IgdbSearchType::Platform => {
                let matches = match igdb::PlatformResult::decode(bytes) {
                    Ok(matches) => matches,
                    Err(why) => {
                        error!("Could not decode response: {:?}", why);
                        return None;
                    }
                };

                IgdbSearchData::Platform(matches).into()
            }
        }
    }
}

fn render_filter_operation(igdb_filter: (String, FilterValue)) -> String {
    let (field, filter) = igdb_filter;

    let value = &filter.value;
    let operator = filter.operator();

    match operator {
        FilterOperator::Equal => format!("{field} = {value}"),
        FilterOperator::NotEqual => format!("{field} != {value}"),
        FilterOperator::LessThan => format!("{field} < {value}"),
        FilterOperator::LessThanOrEqual => format!("{field} <= {value}"),
        FilterOperator::GreaterThan => format!("{field} > {value}"),
        FilterOperator::GreaterThanOrEqual => format!("{field} >= {value}"),
        FilterOperator::PrefixMatch => format!("{field} ~ {value}*"),
        FilterOperator::SuffixMatch => format!("{field} ~ *{value}"),
        FilterOperator::InfixMatch => format!("{field} ~ *{value}*"),
        FilterOperator::All => format!("{field} = [{value}]"),
        FilterOperator::Any => format!("{field} = ({value})"),
        FilterOperator::NotAll => format!("{field} = ![{value}]"),
        FilterOperator::None => format!("{field} = !({value})"),
        FilterOperator::Exact => format!("{field} = {{{value}}}"),
    }
}
