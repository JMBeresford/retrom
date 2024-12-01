use std::time::Duration;

use reqwest::StatusCode;
use retrom_codegen::retrom::{Game, NewGameMetadata, NewPlatformMetadata, Platform};
use tower::{
    retry::{
        backoff::{Backoff, ExponentialBackoff, ExponentialBackoffMaker, MakeBackoff},
        Policy,
    },
    util::rng::HasherRng,
};

pub mod igdb;
pub mod steam;

pub trait MetadataProvider<Query, Data> {
    async fn search_metadata(&self, query: Query) -> Option<Data>;
}

pub trait GameMetadataProvider<Query> {
    async fn get_game_metadata(&self, game: Game, query: Option<Query>) -> Option<NewGameMetadata>;
    async fn search_game_metadata(&self, query: Query) -> Vec<NewGameMetadata>;
}

pub trait PlatformMetadataProvider<Query> {
    async fn get_platform_metadata(
        &self,
        platform: Platform,
        query: Option<Query>,
    ) -> Option<NewPlatformMetadata>;

    async fn search_platform_metadata(&self, query: Query) -> Vec<NewPlatformMetadata>;
}

#[derive(Clone)]
pub struct RetryAttempts {
    attempts_left: usize,
    backoff: ExponentialBackoff,
}

impl RetryAttempts {
    pub fn new(attempts_left: usize) -> Self {
        let backoff = ExponentialBackoffMaker::new(
            Duration::from_millis(500),
            Duration::from_millis(5000),
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
        result: &mut Result<reqwest::Response, reqwest::Error>,
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
