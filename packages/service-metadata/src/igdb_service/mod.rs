use retrom_codegen::retrom::services::metadata::v1::{
    igdb_service_server::IgdbService, GetIgdbGameMetadataRequest, GetIgdbGameMetadataResponse,
    GetIgdbPlatformMetadataRequest, GetIgdbPlatformMetadataResponse, ListIgdbGameMetadataRequest,
    ListIgdbGameMetadataResponse, ListIgdbPlatformMetadataRequest,
    ListIgdbPlatformMetadataResponse, SearchIgdbGamesRequest, SearchIgdbGamesResponse,
    SearchIgdbPlatformsRequest, SearchIgdbPlatformsResponse,
};
use retrom_db::DbPool;
use retrom_service_common::metadata_providers::{
    igdb::provider::{
        IGDBProvider, IgdbSearchData, IgdbSearchQuery, IgdbSearchType, IGDB_PROVIDER_ID,
    },
    GameMetadataProvider, GameMetadataSearchParams, PlatformMetadataProvider,
    PlatformMetadataSearchParams,
};
use sqlx::QueryBuilder;
use std::sync::Arc;
use tonic::{Request, Response, Status};
use tracing::instrument;

pub(crate) mod router;

#[derive(Clone)]
pub struct IgdbServiceHandlers {
    pub igdb_client: Arc<IGDBProvider>,
    db_pool: DbPool,
}

impl IgdbServiceHandlers {
    pub fn new(igdb_client: Arc<IGDBProvider>, db_pool: DbPool) -> Self {
        Self {
            igdb_client,
            db_pool,
        }
    }
}

#[tonic::async_trait]
impl IgdbService for IgdbServiceHandlers {
    #[instrument(skip(self))]
    async fn search_igdb_games(
        &self,
        request: Request<SearchIgdbGamesRequest>,
    ) -> Result<Response<SearchIgdbGamesResponse>, Status> {
        let search = request
            .into_inner()
            .search
            .ok_or_else(|| Status::invalid_argument("Search request is required"))?;

        let query = IgdbSearchQuery {
            search_type: IgdbSearchType::Game,
            request: search,
        };

        let result = match self.igdb_client.search_metadata(query).await {
            Some(IgdbSearchData::Game(result)) => Some(result),
            _ => None,
        };

        Ok(Response::new(SearchIgdbGamesResponse { result }))
    }

    #[instrument(skip(self))]
    async fn search_igdb_platforms(
        &self,
        request: Request<SearchIgdbPlatformsRequest>,
    ) -> Result<Response<SearchIgdbPlatformsResponse>, Status> {
        let search = request
            .into_inner()
            .search
            .ok_or_else(|| Status::invalid_argument("Search request is required"))?;

        let query = IgdbSearchQuery {
            search_type: IgdbSearchType::Platform,
            request: search,
        };

        let result = match self.igdb_client.search_metadata(query).await {
            Some(IgdbSearchData::Platform(result)) => Some(result),
            _ => None,
        };

        Ok(Response::new(SearchIgdbPlatformsResponse { result }))
    }

    #[instrument(skip(self))]
    async fn get_igdb_game_metadata(
        &self,
        request: Request<GetIgdbGameMetadataRequest>,
    ) -> Result<Response<GetIgdbGameMetadataResponse>, Status> {
        let request = request.into_inner();
        let game_id = request.game_id;
        let provider_platform_id = request.igdb_platform_id;

        let name: Option<String> =
            QueryBuilder::new("select name from game_metadata where game_id = ")
                .push_bind(&game_id)
                .push("order by provider_id desc")
                .build_query_scalar()
                .fetch_optional(&self.db_pool)
                .await
                .map_err(|e| Status::internal(format!("Database error: {}", e)))?;

        let provider_game_id: Option<String> =
            QueryBuilder::new("select provider_game_id from game_metadata where game_id = ")
                .push_bind(&game_id)
                .push(" and provider_id = ")
                .push_bind(IGDB_PROVIDER_ID)
                .build_query_scalar()
                .fetch_optional(&self.db_pool)
                .await
                .map_err(|e| Status::internal(format!("Database error: {}", e)))?;

        let params = GameMetadataSearchParams {
            game_id: game_id.clone(),
            name,
            provider_game_id: provider_game_id.and_then(|id| id.parse::<u64>().ok()),
            provider_platform_id,
        };

        let result = self
            .igdb_client
            .get_game_metadata(params)
            .await
            .map_err(|e| Status::internal(format!("IGDB Provider error: {}", e)))?;

        let game_metadata = self.igdb_client.to_game_metadata(&game_id, result).into();

        Ok(Response::new(GetIgdbGameMetadataResponse { game_metadata }))
    }

    #[instrument(skip(self))]
    async fn list_igdb_game_metadata(
        &self,
        request: Request<ListIgdbGameMetadataRequest>,
    ) -> Result<Response<ListIgdbGameMetadataResponse>, Status> {
        let request = request.into_inner();
        let game_id = request.game_id;
        let search = request
            .search
            .ok_or_else(|| Status::invalid_argument("Search request is required"))?;

        let all_matches = self
            .igdb_client
            .search_game_metadata(search)
            .await
            .map_err(|e| Status::internal(format!("IGDB Provider error: {}", e)))?;

        let game_metadata = all_matches
            .into_iter()
            .map(|igdb_match| self.igdb_client.to_game_metadata(&game_id, igdb_match))
            .collect();

        Ok(Response::new(ListIgdbGameMetadataResponse {
            game_metadata,
        }))
    }

    #[instrument(skip(self))]
    async fn get_igdb_platform_metadata(
        &self,
        request: Request<GetIgdbPlatformMetadataRequest>,
    ) -> Result<Response<GetIgdbPlatformMetadataResponse>, Status> {
        let request = request.into_inner();
        let platform_id = request.platform_id;

        let provider_platform_id: Option<String> = QueryBuilder::new(
            "select provider_platform_id from platform_metadata where platform_id = ",
        )
        .push_bind(&platform_id)
        .push(" and provider_id = ")
        .push_bind(IGDB_PROVIDER_ID)
        .build_query_scalar()
        .fetch_optional(&self.db_pool)
        .await
        .map_err(|e| Status::internal(format!("Database error: {}", e)))?;

        let name: Option<String> =
            QueryBuilder::new("select name from platform_metadata where platform_id = ")
                .push_bind(&platform_id)
                .push("order by provider_id desc")
                .build_query_scalar()
                .fetch_optional(&self.db_pool)
                .await
                .map_err(|e| Status::internal(format!("Database error: {}", e)))?;

        let params = PlatformMetadataSearchParams {
            platform_id: platform_id.clone(),
            provider_platform_id: provider_platform_id.and_then(|id| id.parse::<u64>().ok()),
            name,
        };

        let platform_metadata = self
            .igdb_client
            .get_platform_metadata(params)
            .await
            .map(|platform| {
                self.igdb_client
                    .to_platform_metadata(&platform_id, platform)
            })
            .map_err(|e| Status::internal(format!("IGDB Provider error: {}", e)))?
            .into();

        Ok(Response::new(GetIgdbPlatformMetadataResponse {
            platform_metadata,
        }))
    }

    #[instrument(skip(self))]
    async fn list_igdb_platform_metadata(
        &self,
        request: Request<ListIgdbPlatformMetadataRequest>,
    ) -> Result<Response<ListIgdbPlatformMetadataResponse>, Status> {
        let request = request.into_inner();
        let platform_id = request.platform_id;
        let search = request
            .search
            .ok_or_else(|| Status::invalid_argument("Search request is required"))?;

        let all_matches = self
            .igdb_client
            .search_platform_metadata(search)
            .await
            .map_err(|e| Status::internal(format!("IGDB Provider error: {}", e)))?;

        let platform_metadata = all_matches
            .into_iter()
            .map(|igdb_match| {
                self.igdb_client
                    .to_platform_metadata(&platform_id, igdb_match)
            })
            .collect();

        Ok(Response::new(ListIgdbPlatformMetadataResponse {
            platform_metadata,
        }))
    }
}
