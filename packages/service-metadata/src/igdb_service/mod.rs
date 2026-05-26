use retrom_codegen::retrom::services::metadata::v1::{
    igdb_service_server::IgdbService, GetIgdbGameSearchResultsRequest,
    GetIgdbGameSearchResultsResponse,
};
use retrom_db::DbPool;
use retrom_service_common::metadata_providers::igdb::provider::IGDBProvider;
use std::sync::Arc;
use tonic::{Request, Response, Status};

pub(crate) mod router;

#[derive(Clone)]
pub struct IgdbServiceHandlers {
    pub db_pool: DbPool,
    pub igdb_client: Arc<IGDBProvider>,
}

impl IgdbServiceHandlers {
    pub fn new(db_pool: DbPool, igdb_client: Arc<IGDBProvider>) -> Self {
        Self {
            db_pool,
            igdb_client,
        }
    }
}

#[tonic::async_trait]
impl IgdbService for IgdbServiceHandlers {
    async fn get_igdb_game_search_results(
        &self,
        request: Request<GetIgdbGameSearchResultsRequest>,
    ) -> Result<Response<GetIgdbGameSearchResultsResponse>, Status> {
        let request = request.into_inner();
        let query = match request.query {
            Some(query) => query,
            None => {
                return Err(Status::invalid_argument("Query is required"));
            }
        };

        let mut conn = self
            .db_pool
            .get()
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        let game = match schema::games::table
            .find(query.game_id)
            .first::<retrom::Game>(&mut conn)
            .await
        {
            Ok(game) => game,
            Err(why) => {
                return Err(Status::internal(why.to_string()));
            }
        };

        let igdb_client = self.igdb_client.clone();
        let search_results = igdb_client.search_game_metadata(query).await;

        let metadata = search_results
            .into_iter()
            .map(|mut meta| {
                meta.game_id = Some(game.id);
                meta
            })
            .collect();

        Ok(Response::new(GetIgdbGameSearchResultsResponse { metadata }))
    }

    async fn get_igdb_platform_search_results(
        &self,
        request: Request<GetIgdbPlatformSearchResultsRequest>,
    ) -> Result<Response<GetIgdbPlatformSearchResultsResponse>, Status> {
        {
            let request = request.into_inner();
            let query = match request.query {
                Some(query) => query,
                None => {
                    return Err(Status::invalid_argument("Query is required"));
                }
            };

            let mut conn = self
                .db_pool
                .get()
                .await
                .map_err(|why| Status::internal(why.to_string()))?;

            let platform = match schema::platforms::table
                .find(query.platform_id)
                .first::<retrom::Platform>(&mut conn)
                .await
            {
                Ok(platform) => platform,
                Err(why) => {
                    return Err(Status::internal(why.to_string()));
                }
            };

            let igdb_provider = self.igdb_client.clone();

            let metadata = igdb_provider
                .search_platform_metadata(query)
                .await
                .into_iter()
                .map(|mut meta| {
                    meta.platform_id = Some(platform.id);
                    meta
                })
                .collect();

            Ok(Response::new(GetIgdbPlatformSearchResultsResponse {
                metadata,
            }))
        }
    }

    async fn get_igdb_search(
        &self,
        request: Request<GetIgdbSearchRequest>,
    ) -> Result<Response<GetIgdbSearchResponse>, Status> {
        let request = request.into_inner();
        let search_type = IgdbSearchType::try_from(request.search_type)
            .map_err(|_| Status::invalid_argument("Invalid search type provided"))?;

        let igdb_provider = self.igdb_client.clone();

        let data = igdb_provider.search_metadata(request).await;

        let search_results = match data {
            Some(IgdbSearchData::Game(matches)) => {
                let games = matches
                    .games
                    .into_iter()
                    .map(|game| igdb_provider.igdb_game_to_metadata(game))
                    .collect();

                SearchResults::GameMatches(IgdbSearchGameResponse { games })
            }
            Some(IgdbSearchData::Platform(matches)) => {
                let platforms = matches
                    .platforms
                    .into_iter()
                    .map(|platform| igdb_provider.igdb_platform_to_metadata(platform))
                    .collect();

                SearchResults::PlatformMatches(IgdbSearchPlatformResponse { platforms })
            }
            None => match search_type {
                IgdbSearchType::Game => {
                    SearchResults::GameMatches(IgdbSearchGameResponse { games: vec![] })
                }
                IgdbSearchType::Platform => {
                    SearchResults::PlatformMatches(IgdbSearchPlatformResponse { platforms: vec![] })
                }
            },
        }
        .into();

        Ok(Response::new(GetIgdbSearchResponse { search_results }))
    }
}
