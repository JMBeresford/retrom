use reqwest::StatusCode;
use retrom_codegen::retrom::services::metadata::v1::{GameMetadataView, PlatformMetadataView};
use std::time::Duration;
use tower::{
    retry::{
        backoff::{Backoff, ExponentialBackoff, ExponentialBackoffMaker, MakeBackoff},
        Policy,
    },
    util::rng::HasherRng,
};

pub mod igdb;
pub mod steam;

#[derive(Debug, thiserror::Error)]
pub enum MetadataProviderError {
    #[error("HTTP error: {0}")]
    HttpError(#[from] reqwest::Error),
    #[error("No matches found")]
    NoMatchesFound,
    #[error("Invalid search parameters: {0}")]
    InvalidSearchParams(String),
    #[error("Status code error: {0}")]
    StatusCodeError(StatusCode),
    #[error("MetadataProviderError: {0}")]
    Other(String),
}

impl From<StatusCode> for MetadataProviderError {
    fn from(status: StatusCode) -> Self {
        MetadataProviderError::StatusCodeError(status)
    }
}

pub type Result<T> = std::result::Result<T, MetadataProviderError>;

#[derive(Debug)]
pub struct GameMetadataSearchParams<Id> {
    /// The Retrom ID of the game we're trying to get metadata for.
    pub game_id: String,
    /// The provider's canonical ID of the game, used for search queries.
    pub provider_game_id: Option<Id>,
    /// The name of the game, used for search queries.
    pub name: Option<String>,
    /// The provider's canonical ID for the platform the game is on, used for search queries.
    pub provider_platform_id: Option<Id>,
}

/// A trait for game metadata providers. This is used to abstract over different
/// metadata providers, such as IGDB, Steam, etc.
pub trait GameMetadataProvider {
    /// The value type that the provider uses to identify games.
    /// For example, IGDB uses an integer ID, while other providers
    /// might use a string slug.
    type ProviderGameId;

    /// The type of the game model that the provider uses to represent games. This type
    /// should encapsulate all the information that the provider returns for a game, including
    /// metadata, artwork, screenshots, videos, etc.
    type GameModel;

    /// The type of the search query used for searching game metadata.
    type SearchQuery;

    /// Get a best match result for a game based on the provided naive search parameters. The provider
    /// should use the the information in the parameters to find the best possible match for the
    /// game, and return a single [Self::GameModel] that represents the game's metadata in full.
    ///
    /// For robust searching with more potentially more complex search parameters, the provider
    /// should implement `search_game_metadata` and `to_game_metadata` to return a list of possible
    /// matches and convert them into a format that can be used by the rest of the application.
    fn get_game_metadata(
        &self,
        params: GameMetadataSearchParams<Self::ProviderGameId>,
    ) -> impl std::future::Future<Output = Result<Self::GameModel>>;

    /// Get a list of search results for a game based on the provided search query. The provider
    /// should use the information in the search query to find a list of possible matches for the
    /// game, and return them in the provider's native search result format. This is used for cases
    /// where we want to present the user with a list of possible matches to choose from, rather than
    /// trying to automatically determine the best match.
    fn search_game_metadata(
        &self,
        query: Self::SearchQuery,
    ) -> impl std::future::Future<Output = Result<Vec<Self::GameModel>>>;

    /// Convert a search result from the provider's native format into a [GameMetadataView]
    /// that can be used by the rest of the application.
    fn to_game_metadata(&self, game_id: &str, native_metadata: Self::GameModel)
        -> GameMetadataView;
}

#[derive(Debug)]
pub struct PlatformMetadataSearchParams<Id> {
    /// The Retrom ID of the platform we're trying to get metadata for.
    pub platform_id: String,
    /// The provider's canonical ID of the platform, used for search queries.
    pub provider_platform_id: Option<Id>,
    /// The name of the platform, used for search queries.
    pub name: Option<String>,
}

/// A trait for platform metadata providers. This is used to abstract over different
/// metadata providers, such as IGDB, Steam, etc.
pub trait PlatformMetadataProvider {
    /// The value type that the provider uses to identify platforms. For example, IGDB uses an
    /// integer ID, while other providers might use a string slug.
    type ProviderPlatformId;
    /// The type of the platform model that the provider uses to represent platforms. This type
    /// should encapsulate all the information that the provider returns for a platform, including
    /// metadata, logo, etc.
    type PlatformModel;
    /// The type of the search query used for searching platform metadata.
    type SearchQuery;

    /// Get a best match result for a platform based on the provided naive search parameters. The
    /// provider should use the information in the parameters to find the best possible match for
    /// the platform, and return a single [Self::PlatformModel] that represents the platform's
    /// metadata in full.
    ///
    /// For robust searching with more potentially more complex search parameters, the provider
    /// should implement `search_platform_metadata` and `to_platform_metadata` to return a list of
    /// possible matches and convert them into a format that can be used by the rest of the
    /// application.
    fn get_platform_metadata(
        &self,
        params: PlatformMetadataSearchParams<Self::ProviderPlatformId>,
    ) -> impl std::future::Future<Output = Result<Self::PlatformModel>>;

    /// Get a list of search results for a platform based on the provided search query. The provider
    /// should use the information in the search query to find a list of possible matches for the
    /// platform, and return them in the provider's native search result format. This is used for
    /// cases where we want to present the user with a list of possible matches to choose from,
    /// rather than trying to automatically determine the best match.
    fn search_platform_metadata(
        &self,
        query: Self::SearchQuery,
    ) -> impl std::future::Future<Output = Result<Vec<Self::PlatformModel>>>;

    /// Convert a search result from the provider's native format into a [PlatformMetadataView]
    /// that can be used by the rest of the application.
    fn to_platform_metadata(
        &self,
        platform_id: &str,
        native_metadata: Self::PlatformModel,
    ) -> PlatformMetadataView;
}

#[derive(Clone)]
pub struct RetryAttempts {
    attempts_left: usize,
    backoff: ExponentialBackoff,
}

impl RetryAttempts {
    pub fn new(attempts_left: usize) -> Self {
        let backoff = ExponentialBackoffMaker::new(
            Duration::from_millis(200),
            Duration::from_millis(1000),
            1.25,
            HasherRng::default(),
        )
        .unwrap()
        .make_backoff();

        Self {
            attempts_left,
            backoff,
        }
    }
}

impl Policy<reqwest::Request, reqwest::Response, reqwest::Error> for RetryAttempts {
    type Future = tokio::time::Sleep;

    fn retry(
        &mut self,
        _req: &mut reqwest::Request,
        result: &mut std::result::Result<reqwest::Response, reqwest::Error>,
    ) -> Option<Self::Future> {
        let result = result.as_ref();
        match result.is_ok_and(|res| res.status() != StatusCode::TOO_MANY_REQUESTS) {
            true => None,
            false => {
                if self.attempts_left > 0 {
                    self.attempts_left -= 1;

                    tracing::info!(
                        "Retrying request {}, attempts left: {}",
                        _req.url(),
                        self.attempts_left
                    );

                    Some(self.backoff.next_backoff())
                } else {
                    None
                }
            }
        }
    }

    fn clone_request(&mut self, req: &reqwest::Request) -> Option<reqwest::Request> {
        req.try_clone()
    }
}
