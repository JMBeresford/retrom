use crate::{config::ServerConfigManager, metadata_providers::RetryAttempts};
use prost::Message;
use retrom_codegen::{
    igdb,
    retrom::{
        providers::igdb::v1::{
            igdb_fields::Selector,
            igdb_filters::{FilterOperator, FilterValue},
        },
        services::metadata::v1::IgdbSearchRequest,
    },
};
use std::{
    env,
    sync::Arc,
    time::{Duration, Instant},
};
use tokio::sync::{mpsc, oneshot, RwLock};
use tower::{Service, ServiceExt};
use tracing::{debug, error, instrument, Instrument, Level};

pub const IGDB_PROVIDER_ID: &str = "00000000-0000-0000-0000-000000000002";
const IGDB_CONCURRENT_REQUESTS_LIMIT: usize = 8;

/// Which IGDB endpoint a search targets. Replaces the proto-defined search-type enum so the
/// provider stays decoupled from the gRPC request shape.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum IgdbSearchType {
    Game,
    Platform,
}

/// A raw IGDB search paired with the endpoint to target. [`IgdbSearchRequest`] carries the
/// search query, filters, fields, and pagination.
pub struct IgdbSearchQuery {
    pub search_type: IgdbSearchType,
    pub request: IgdbSearchRequest,
}

pub enum IgdbSearchData {
    Game(igdb::GameResult),
    Platform(igdb::PlatformResult),
}

/// The default set of IGDB fields requested for game searches. Callers building raw IGDB
/// search requests should include these to receive fully-populated game results (cover,
/// artwork, screenshots, videos, genres, franchises, similar games).
pub fn default_game_fields() -> Vec<String> {
    [
        "name",
        "cover.url",
        "artworks.url",
        "artworks.height",
        "artworks.width",
        "screenshots.url",
        "summary",
        "websites.url",
        "websites.trusted",
        "videos.name",
        "videos.video_id",
        "genres.name",
        "genres.slug",
        "franchises.name",
        "franchises.slug",
        "similar_games",
    ]
    .into_iter()
    .map(String::from)
    .collect()
}

/// The default set of IGDB fields requested for platform searches. Callers building raw IGDB
/// search requests should include these to receive fully-populated platform results (logo,
/// platform family).
pub fn default_platform_fields() -> Vec<String> {
    [
        "name",
        "summary",
        "platform_logo.url",
        "websites.url",
        "websites.trusted",
        "platform_family.name",
        "platform_family.slug",
    ]
    .into_iter()
    .map(String::from)
    .collect()
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
    config_manager: Arc<ServerConfigManager>,
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
    pub fn new(config_manager: Arc<ServerConfigManager>) -> Self {
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

        let game_fields = default_game_fields();
        let platform_fields = default_platform_fields();

        Self {
            auth: RwLock::new(IGDBAuth::new(None, Duration::from_secs(0))),
            config_manager,
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
        let config = self.config_manager.get_config().await;

        let user = match config.igdb {
            Some(user) => user,
            None => {
                return Err(reqwest::StatusCode::FORBIDDEN);
            }
        };

        let url = reqwest::Url::parse_with_params(
            &oauth2_url(),
            &[
                ("client_id", &user.client_id),
                ("client_secret", &user.client_secret),
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
                let res = res.error_for_status().map_err(|e| {
                    error!(
                        "Failed to refresh token, are your IGDB credentials correct? {:?}",
                        e
                    );
                    e.status()
                        .unwrap_or(reqwest::StatusCode::INTERNAL_SERVER_ERROR)
                })?;

                let token_res: IGDBTokenResponse = match res.json().await {
                    Ok(json) => json,
                    Err(e) => {
                        error!("Failed to parse JSON: {:?}", e);
                        return Err(reqwest::StatusCode::INTERNAL_SERVER_ERROR);
                    }
                };

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
    async fn maybe_refresh_token(&self) -> Result<(), reqwest::StatusCode> {
        if self.token_is_expired().await {
            debug!("Token expired, refreshing.");
            self.refresh_token().await?;
        }

        Ok(())
    }

    #[instrument(level = Level::DEBUG, skip_all, fields(query = query.clone()))]
    async fn make_request(
        &self,
        path: String,
        query: String,
    ) -> Result<reqwest::Response, reqwest::StatusCode> {
        self.maybe_refresh_token().await?;
        let auth = self.auth.read().await;
        let token = auth.token.clone().expect("No token found");

        let url =
            reqwest::Url::parse(&format!("{}/{}", base_url(), path)).expect("Could not parse URL");

        let mut req = reqwest::Request::new(reqwest::Method::POST, url);

        let config = self.config_manager.get_config().await;
        let user = match config.igdb {
            Some(user) => user,
            None => {
                return Err(reqwest::StatusCode::FORBIDDEN);
            }
        };

        req.headers_mut()
            .insert("Client-ID", user.client_id.parse().unwrap());

        req.headers_mut()
            .insert("Authorization", format!("Bearer {token}").parse().unwrap());

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

    #[instrument(level = Level::DEBUG, skip_all)]
    pub async fn search_metadata(&self, query: IgdbSearchQuery) -> Option<IgdbSearchData> {
        let IgdbSearchQuery {
            search_type,
            request,
        } = query;

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
            Err(reqwest::StatusCode::FORBIDDEN) => {
                // fail silently in case user opts out of IGDB metadata
                debug!("Forbidden, are your IGDB credentials correct?");
                return None;
            }
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

fn base_url() -> String {
    env::var("IGDB_BASE_URL").unwrap_or("https://api.igdb.com/v4".into())
}

fn oauth2_url() -> String {
    env::var("IGDB_OAUTH2_URL").unwrap_or("https://id.twitch.tv/oauth2/token".into())
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
