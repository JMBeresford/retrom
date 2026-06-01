use retrom_codegen::retrom::services::metadata::v1::{
    get_igdb_search_request::IgdbSearchType, get_igdb_search_response::SearchResults,
    igdb_service_server::IgdbService, GetIgdbGameSearchResultsRequest,
    GetIgdbGameSearchResultsResponse, GetIgdbPlatformSearchResultsRequest,
    GetIgdbPlatformSearchResultsResponse, GetIgdbSearchRequest, GetIgdbSearchResponse,
    IgdbSearchGameResponse, IgdbSearchPlatformResponse,
};
use retrom_db::{DbPool, RetromDB};
use retrom_service_common::metadata_providers::{
    igdb::provider::{IGDBProvider, IgdbSearchData},
    GameMetadataProvider, MetadataProvider as MetadataProviderTrait, PlatformMetadataProvider,
};
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

        let mut builder =
            sqlx::QueryBuilder::<RetromDB>::new("select exists(select 1 from games where id = ");
        builder.push_bind(query.game_id.to_string()).push(")");

        let game_exists: bool = builder
            .build_query_scalar()
            .fetch_one(&self.db_pool)
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        if !game_exists {
            return Err(Status::not_found(format!(
                "Game not found: {}",
                query.game_id
            )));
        }

        let game_id = query.game_id.to_string();
        let igdb_client = self.igdb_client.clone();
        let search_results = igdb_client.search_game_metadata(query).await;

        let metadata = search_results
            .into_iter()
            .filter_map(|game| {
                let mut meta = igdb_client.igdb_game_to_metadata(game).ok()?;
                meta.provider_game_id = game_id.clone();

                Some(meta)
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

            let mut builder = sqlx::QueryBuilder::<RetromDB>::new(
                "select exists(select 1 from platforms where id = ",
            );
            builder.push_bind(query.platform_id.to_string()).push(")");

            let platform_exists: bool = builder
                .build_query_scalar()
                .fetch_one(&self.db_pool)
                .await
                .map_err(|why| Status::internal(why.to_string()))?;

            if !platform_exists {
                return Err(Status::not_found(format!(
                    "Platform not found: {}",
                    query.platform_id
                )));
            }

            let platform_id = query.platform_id.to_string();
            let igdb_provider = self.igdb_client.clone();

            let metadata = igdb_provider
                .search_platform_metadata(query)
                .await
                .into_iter()
                .map(|mut meta| {
                    meta.platform_id = platform_id.clone();
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
                    .filter_map(|game| igdb_provider.igdb_game_to_metadata(game).ok())
                    .collect();

                SearchResults::GameMatches(IgdbSearchGameResponse { games })
            }
            Some(IgdbSearchData::Platform(matches)) => {
                let platforms = matches
                    .platforms
                    .into_iter()
                    .filter_map(|platform| igdb_provider.igdb_platform_to_metadata(platform).ok())
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
