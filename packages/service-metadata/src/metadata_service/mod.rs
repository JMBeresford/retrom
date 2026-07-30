use crate::metadata_service::game_metadata::{
    game_metadata_from_rows, insert_game_metadata, rows_from_game_metadata,
    select_game_metadata_artworks, select_game_metadata_links, select_game_metadata_screenshots,
    select_game_metadata_videos, select_similar_games, upsert_game_artworks, upsert_game_links,
    upsert_game_screenshots, upsert_game_videos, upsert_similar_games,
};
use crate::metadata_service::platform_metadata::{
    insert_platform_metadata, platform_metadata_from_rows, rows_from_platform_metadata,
    update_platform_metadata as update_platform_metadata_row,
};
use futures::{
    future::{join_all, try_join_all},
    FutureExt,
};
use retrom_codegen::retrom::{
    providers::igdb::v1::{
        igdb_filters::{FilterOperator, FilterValue},
        IgdbFilters,
    },
    services::{
        config::v1::{
            config_service_client::ConfigServiceClient, GetServerConfigRequest, MetadataConfig,
        },
        jobs::v1::JobStatus,
        metadata::v1::{
            igdb_service_client::IgdbServiceClient, metadata_service_server::MetadataService,
            steam_service_client::SteamServiceClient, BulkCreateGameMetadataRequest,
            BulkCreateGameMetadataResponse, BulkCreatePlatformMetadataRequest,
            BulkCreatePlatformMetadataResponse, BulkGetGameMetadataRequest,
            BulkGetGameMetadataResponse, BulkGetPlatformMetadataRequest,
            BulkGetPlatformMetadataResponse, CreateGameMetadataRequest,
            CreatePlatformMetadataRequest, DownloadGameMetadataRequest,
            DownloadGameMetadataResponse, DownloadPlatformMetadataRequest,
            DownloadPlatformMetadataResponse, GameMetadata, GameMetadataRow,
            GetGameMetadataRequest, GetIgdbGameMetadataRequest, GetIgdbPlatformMetadataRequest,
            GetPlatformMetadataRequest, GetSteamGameMetadataRequest, IgdbSearchRequest,
            ListGameMetadataRequest, ListGameMetadataResponse, ListPlatformMetadataRequest,
            ListPlatformMetadataResponse, PlatformMetadata, PurgeLocalMetadataRequest,
            PurgeLocalMetadataResponse, StatLocalMetadataRequest, StatLocalMetadataResponse,
            UpdateGameMetadataRequest, UpdatePlatformMetadataRequest,
        },
        tags::v1::tags_service_client::TagsServiceClient,
    },
};
use retrom_db::DbPool;
use retrom_service_common::{
    grpc_clients::{
        igdb_svc::get_igdb_svc_client, steam_svc::get_steam_svc_client,
        tags_svc::get_tags_svc_client,
    },
    media_cache::{cacheable_media::CacheableMetadata, MediaCache},
    metadata_providers::igdb::provider::IGDB_PROVIDER_ID,
    retrom_dirs::RetromDirs,
};
use retrom_service_jobs::job_manager::JobManager;
use sqlx::QueryBuilder;
use std::{
    collections::{HashMap, HashSet},
    fmt::Display,
    future::Future,
    sync::Arc,
};
use tokio::try_join;
use tonic::{transport::Channel, Request, Response, Status};
use tracing::{error, Instrument};
use walkdir::WalkDir;

mod game_metadata;
mod platform_metadata;
pub(crate) mod router;

#[derive(Clone)]
pub struct MetadataServiceHandlers {
    pub db_pool: DbPool,
    pub media_cache: Arc<MediaCache>,
    pub job_manager: Arc<JobManager>,
    config_client: ConfigServiceClient<Channel>,
    igdb_svc_client: IgdbServiceClient<tonic::transport::Channel>,
    steam_svc_client: SteamServiceClient<tonic::transport::Channel>,
    tags_svc_client: TagsServiceClient<tonic::transport::Channel>,
}

impl MetadataServiceHandlers {
    pub fn new(
        db_pool: DbPool,
        media_cache: Arc<MediaCache>,
        job_manager: Arc<JobManager>,
        config_client: ConfigServiceClient<Channel>,
    ) -> Self {
        Self {
            db_pool,
            media_cache,
            job_manager,
            config_client,
            igdb_svc_client: get_igdb_svc_client(None),
            steam_svc_client: get_steam_svc_client(None),
            tags_svc_client: get_tags_svc_client(None),
        }
    }

    async fn handle_get_game_metadata(
        db_pool: DbPool,
        request: GetGameMetadataRequest,
    ) -> Result<GameMetadata, Status> {
        let id = request.id;

        let mut builder = QueryBuilder::new("select * from game_metadata where id = ");

        builder.push_bind(&id);
        builder.push(" limit 1 ");

        let row: GameMetadataRow = builder
            .build_query_as()
            .fetch_one(&db_pool)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        let (artworks, screenshots, videos, links, similar_games) = try_join!(
            select_game_metadata_artworks(&db_pool, &row.id),
            select_game_metadata_screenshots(&db_pool, &row.id),
            select_game_metadata_videos(&db_pool, &row.id),
            select_game_metadata_links(&db_pool, &row.id),
            select_similar_games(&db_pool, &row.game_id)
        )?;

        Ok(game_metadata_from_rows(
            row,
            artworks,
            screenshots,
            videos,
            links,
            similar_games,
        ))
    }

    async fn handle_create_game_metadata(
        db_pool: DbPool,
        request: CreateGameMetadataRequest,
    ) -> Result<GameMetadata, Status> {
        let metadata = match request.metadata {
            Some(metadata) => metadata,
            None => {
                return Err(Status::invalid_argument(
                    "metadata field is required for creating game metadata".to_string(),
                ));
            }
        };

        if metadata.game.trim().is_empty() {
            return Err(Status::invalid_argument(
                "game field is required for creating game metadata".to_string(),
            ));
        }

        if metadata.provider.trim().is_empty() {
            return Err(Status::invalid_argument(
                "provider field is required for creating game metadata".to_string(),
            ));
        }

        let (row, artwork_rows, screenshot_rows, video_rows, link_rows, similar_game_rows) =
            rows_from_game_metadata(metadata);

        let (row, artwork_rows, screenshot_rows, video_rows, link_rows, similar_game_rows) = try_join!(
            insert_game_metadata(&db_pool, &row),
            upsert_game_artworks(&db_pool, artwork_rows),
            upsert_game_screenshots(&db_pool, screenshot_rows),
            upsert_game_videos(&db_pool, video_rows),
            upsert_game_links(&db_pool, link_rows),
            upsert_similar_games(&db_pool, similar_game_rows)
        )?;

        Ok(game_metadata_from_rows(
            row,
            artwork_rows,
            screenshot_rows,
            video_rows,
            link_rows,
            similar_game_rows,
        ))
    }

    async fn cache_metadata<T: CacheableMetadata>(
        &self,
        metadata: &T,
        job_name: &str,
        config: Option<MetadataConfig>,
    ) -> Result<(), Status> {
        if let Err(e) = metadata.clean_cache().await {
            error!("Failed to clean cache for metadata: {}", e);
        }

        let tasks = metadata
            .get_cacheable_media_opts()
            .into_iter()
            .map({
                let cache = self.media_cache.clone();
                move |opt| {
                    let cache = cache.clone();
                    async move { cache.cache_media_file(&opt, config).await }
                }
            })
            .collect();

        spawn_cache_job(self.job_manager.clone(), job_name.to_string(), tasks).await;

        Ok(())
    }

    async fn handle_update_game_metadata(
        db_pool: DbPool,
        request: UpdateGameMetadataRequest,
    ) -> Result<GameMetadata, Status> {
        let field_mask: HashSet<String> = request
            .update_mask
            .unwrap_or_default()
            .paths
            .into_iter()
            .collect();

        let metadata = match request.metadata {
            Some(metadata) => metadata,
            None => {
                return Err(Status::invalid_argument(
                    "metadata field is required for updating game metadata".to_string(),
                ));
            }
        };

        let empty_mask = field_mask.is_empty();

        let (row, artworks, screenshots, videos, links, similar_games) =
            rows_from_game_metadata(metadata);

        let row_future = game_metadata::update_game_metadata(&db_pool, &row, &field_mask);

        let artwork_rows_future = async {
            if empty_mask || field_mask.contains("artworks") {
                game_metadata::upsert_game_artworks(&db_pool, artworks).await
            } else {
                Ok(vec![])
            }
        };

        let screenshot_rows_future = async {
            if empty_mask || field_mask.contains("screenshots") {
                game_metadata::upsert_game_screenshots(&db_pool, screenshots).await
            } else {
                Ok(vec![])
            }
        };

        let video_rows_future = async {
            if empty_mask || field_mask.contains("videos") {
                game_metadata::upsert_game_videos(&db_pool, videos).await
            } else {
                Ok(vec![])
            }
        };

        let link_rows_future = async {
            if empty_mask || field_mask.contains("links") {
                game_metadata::upsert_game_links(&db_pool, links).await
            } else {
                Ok(vec![])
            }
        };

        let similar_game_rows_future = async {
            if empty_mask || field_mask.contains("similar_games") {
                game_metadata::upsert_similar_games(&db_pool, similar_games).await
            } else {
                Ok(vec![])
            }
        };

        let (row, artwork_rows, screenshot_rows, video_rows, link_rows, similar_game_rows) = try_join!(
            row_future,
            artwork_rows_future,
            screenshot_rows_future,
            video_rows_future,
            link_rows_future,
            similar_game_rows_future
        )?;

        Ok(game_metadata_from_rows(
            row,
            artwork_rows,
            screenshot_rows,
            video_rows,
            link_rows,
            similar_game_rows,
        ))
    }

    async fn handle_get_platform_metadata(
        db_pool: DbPool,
        request: GetPlatformMetadataRequest,
    ) -> Result<PlatformMetadata, Status> {
        let id = request.id;

        let mut builder = QueryBuilder::new("select * from platform_metadata where id = ");
        builder.push_bind(&id);
        builder.push(" limit 1");

        let row: retrom_codegen::retrom::services::metadata::v1::PlatformMetadataRow = builder
            .build_query_as()
            .fetch_one(&db_pool)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        Ok(platform_metadata_from_rows(row))
    }

    async fn handle_create_platform_metadata(
        db_pool: DbPool,
        request: CreatePlatformMetadataRequest,
    ) -> Result<PlatformMetadata, Status> {
        let metadata = match request.metadata {
            Some(metadata) => metadata,
            None => {
                return Err(Status::invalid_argument(
                    "metadata field is required for creating platform metadata".to_string(),
                ));
            }
        };

        if metadata.platform.trim().is_empty() {
            return Err(Status::invalid_argument(
                "platform field is required for creating platform metadata".to_string(),
            ));
        }

        if metadata.provider.trim().is_empty() {
            return Err(Status::invalid_argument(
                "provider field is required for creating platform metadata".to_string(),
            ));
        }

        let row = rows_from_platform_metadata(metadata);
        let row = insert_platform_metadata(&db_pool, row).await?;

        Ok(platform_metadata_from_rows(row))
    }

    async fn handle_update_platform_metadata(
        db_pool: DbPool,
        request: UpdatePlatformMetadataRequest,
    ) -> Result<PlatformMetadata, Status> {
        let field_mask: HashSet<String> = request
            .update_mask
            .unwrap_or_default()
            .paths
            .into_iter()
            .collect();

        let metadata = match request.metadata {
            Some(metadata) => metadata,
            None => {
                return Err(Status::invalid_argument(
                    "metadata field is required for updating platform metadata".to_string(),
                ));
            }
        };

        let row = rows_from_platform_metadata(metadata);
        let row = update_platform_metadata_row(&db_pool, &row, &field_mask).await?;

        Ok(platform_metadata_from_rows(row))
    }
}

async fn spawn_cache_job<T, E, F>(job_manager: Arc<JobManager>, job_name: String, tasks: Vec<F>)
where
    T: Send + 'static,
    E: Display + Send + 'static,
    F: Future<Output = Result<T, E>> + Send + 'static,
{
    if tasks.is_empty() {
        return;
    }

    let job = job_manager
        .create_job(job_name.clone(), "Queued media cache job".to_string())
        .await;
    let job_id = job.id;

    tokio::spawn(
        async move {
            let _ = job_manager
                .update_job(
                    &job_id,
                    Some(0.0),
                    Some(JobStatus::Running),
                    Some("Caching media files".to_string()),
                )
                .await;

            let results = join_all(tasks).await;
            let failed = results.iter().any(Result::is_err);
            for result in results {
                if let Err(err) = result {
                    tracing::warn!("Failed to cache media file: {}", err);
                }
            }

            let _ = job_manager
                .complete_job(
                    &job_id,
                    failed,
                    if failed {
                        "Media cache job completed with errors".to_string()
                    } else {
                        "Media cache job completed".to_string()
                    },
                )
                .await;
        }
        .instrument(tracing::info_span!("cache_job", job_name = %job_name)),
    );
}

#[tonic::async_trait]
impl MetadataService for MetadataServiceHandlers {
    #[tracing::instrument(skip(self))]
    async fn get_game_metadata(
        &self,
        request: Request<GetGameMetadataRequest>,
    ) -> Result<Response<GameMetadata>, Status> {
        let metadata =
            Self::handle_get_game_metadata(self.db_pool.clone(), request.into_inner()).await?;

        Ok(Response::new(metadata))
    }

    #[tracing::instrument(skip(self))]
    async fn create_game_metadata(
        &self,
        request: Request<CreateGameMetadataRequest>,
    ) -> Result<Response<GameMetadata>, Status> {
        let metadata =
            Self::handle_create_game_metadata(self.db_pool.clone(), request.into_inner()).await?;

        Ok(Response::new(metadata))
    }

    #[tracing::instrument(skip(self))]
    async fn list_game_metadata(
        &self,
        request: Request<ListGameMetadataRequest>,
    ) -> Result<Response<ListGameMetadataResponse>, Status> {
        let request = request.into_inner();
        let ids = request.ids;
        let game_ids = request.game_ids;
        let provider_ids = request.provider_ids;

        let mut builder = QueryBuilder::new("select id from game_metadata where id is not null ");

        if !ids.is_empty() {
            builder.push(" and id in (");
            let mut separated = builder.separated(", ");
            for id in ids {
                separated.push_bind(id);
            }

            separated.push_unseparated(")");
        }

        if !game_ids.is_empty() {
            builder.push(" and game_id in (");
            let mut separated = builder.separated(", ");
            for game_id in game_ids {
                separated.push_bind(game_id);
            }

            separated.push_unseparated(")");
        }

        if !provider_ids.is_empty() {
            builder.push(" and provider in (");
            let mut separated = builder.separated(", ");
            for provider_id in provider_ids {
                separated.push_bind(provider_id);
            }

            separated.push_unseparated(")");
        }

        let ids: Vec<String> = builder
            .build_query_scalar()
            .fetch_all(&self.db_pool)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        let metadata =
            try_join_all(ids.into_iter().map(|id| {
                let db_pool = self.db_pool.clone();
                async move {
                    Self::handle_get_game_metadata(db_pool, GetGameMetadataRequest { id }).await
                }
            }))
            .await?;

        Ok(Response::new(ListGameMetadataResponse { metadata }))
    }

    #[tracing::instrument(skip(self))]
    async fn update_game_metadata(
        &self,
        request: Request<UpdateGameMetadataRequest>,
    ) -> Result<Response<GameMetadata>, Status> {
        let request = request.into_inner();

        let mut config_svc_client = self.config_client.clone();
        let config = config_svc_client
            .get_server_config(GetServerConfigRequest {})
            .await?
            .into_inner()
            .config
            .unwrap_or_default();

        let store_metadata = config
            .metadata
            .map(|m| m.store_metadata_locally)
            .unwrap_or(false);

        if let Some(ref metadata) = request.metadata {
            if let Err(e) = metadata.clean_cache().await {
                error!("Failed to clean cache for metadata: {}", e);
            }
        }

        if store_metadata {
            if let Some(ref metadata) = request.metadata {
                let metadata_config = self
                    .config_client
                    .clone()
                    .get_server_config(GetServerConfigRequest {})
                    .await?
                    .into_inner()
                    .config
                    .and_then(|c| c.metadata);

                self.cache_metadata(
                    metadata,
                    &format!("Cache Media Files For Game {}", metadata.game),
                    metadata_config,
                )
                .await?;
            }
        };

        let metadata = Self::handle_update_game_metadata(self.db_pool.clone(), request).await?;

        Ok(Response::new(metadata))
    }

    #[tracing::instrument(skip(self))]
    async fn bulk_get_game_metadata(
        &self,
        request: Request<BulkGetGameMetadataRequest>,
    ) -> Result<Response<BulkGetGameMetadataResponse>, Status> {
        let requests = request.into_inner().requests;

        let metadata = try_join_all(requests.into_iter().map(|r| {
            let db_pool = self.db_pool.clone();

            async move { Self::handle_get_game_metadata(db_pool, r).await }
        }))
        .await?;

        Ok(Response::new(BulkGetGameMetadataResponse { metadata }))
    }

    #[tracing::instrument(skip(self))]
    async fn bulk_create_game_metadata(
        &self,
        request: Request<BulkCreateGameMetadataRequest>,
    ) -> Result<Response<BulkCreateGameMetadataResponse>, Status> {
        let requests = request.into_inner().requests;

        let metadata = try_join_all(requests.into_iter().map(|r| {
            let db_pool = self.db_pool.clone();

            async move { Self::handle_create_game_metadata(db_pool, r).await }
        }))
        .await?;

        Ok(Response::new(BulkCreateGameMetadataResponse { metadata }))
    }

    #[tracing::instrument(skip(self))]
    async fn get_platform_metadata(
        &self,
        request: Request<GetPlatformMetadataRequest>,
    ) -> Result<Response<PlatformMetadata>, Status> {
        let metadata =
            Self::handle_get_platform_metadata(self.db_pool.clone(), request.into_inner()).await?;

        Ok(Response::new(metadata))
    }

    #[tracing::instrument(skip(self))]
    async fn create_platform_metadata(
        &self,
        request: Request<CreatePlatformMetadataRequest>,
    ) -> Result<Response<PlatformMetadata>, Status> {
        let metadata =
            Self::handle_create_platform_metadata(self.db_pool.clone(), request.into_inner())
                .await?;

        Ok(Response::new(metadata))
    }

    #[tracing::instrument(skip(self))]
    async fn list_platform_metadata(
        &self,
        request: Request<ListPlatformMetadataRequest>,
    ) -> Result<Response<ListPlatformMetadataResponse>, Status> {
        let request = request.into_inner();
        let ids = request.ids;
        let platform_ids = request.platform_ids;
        let provider_ids = request.provider_ids;

        let mut builder =
            QueryBuilder::new("select id from platform_metadata where id is not null ");

        if !ids.is_empty() {
            builder.push(" and id in (");
            let mut separated = builder.separated(", ");
            for id in ids {
                separated.push_bind(id);
            }
            separated.push_unseparated(")");
        }

        if !platform_ids.is_empty() {
            builder.push(" and platform_id in (");
            let mut separated = builder.separated(", ");
            for platform_id in platform_ids {
                separated.push_bind(platform_id);
            }
            separated.push_unseparated(")");
        }

        if !provider_ids.is_empty() {
            builder.push(" and provider_id in (");
            let mut separated = builder.separated(", ");
            for provider_id in provider_ids {
                separated.push_bind(provider_id);
            }
            separated.push_unseparated(")");
        }

        let ids: Vec<String> = builder
            .build_query_scalar()
            .fetch_all(&self.db_pool)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        let metadata = try_join_all(ids.into_iter().map(|id| {
            let db_pool = self.db_pool.clone();
            async move {
                Self::handle_get_platform_metadata(db_pool, GetPlatformMetadataRequest { id }).await
            }
        }))
        .await?;

        Ok(Response::new(ListPlatformMetadataResponse { metadata }))
    }

    #[tracing::instrument(skip(self))]
    async fn update_platform_metadata(
        &self,
        request: Request<UpdatePlatformMetadataRequest>,
    ) -> Result<Response<PlatformMetadata>, Status> {
        let request = request.into_inner();

        let mut config_svc_client = self.config_client.clone();
        let config = config_svc_client
            .get_server_config(GetServerConfigRequest {})
            .await?
            .into_inner()
            .config
            .unwrap_or_default();

        let store_metadata = config
            .metadata
            .map(|m| m.store_metadata_locally)
            .unwrap_or(false);

        if let Some(ref metadata) = request.metadata {
            if let Err(e) = metadata.clean_cache().await {
                error!("Failed to clean cache for metadata: {}", e);
            }
        }

        if store_metadata {
            if let Some(ref metadata) = request.metadata {
                let metadata_config = self
                    .config_client
                    .clone()
                    .get_server_config(GetServerConfigRequest {})
                    .await?
                    .into_inner()
                    .config
                    .and_then(|c| c.metadata);

                self.cache_metadata(
                    metadata,
                    &format!("Cache Media Files For Platform {}", metadata.platform),
                    metadata_config,
                )
                .await?;
            }
        };

        let metadata = Self::handle_update_platform_metadata(self.db_pool.clone(), request).await?;

        Ok(Response::new(metadata))
    }

    #[tracing::instrument(skip(self))]
    async fn bulk_get_platform_metadata(
        &self,
        request: Request<BulkGetPlatformMetadataRequest>,
    ) -> Result<Response<BulkGetPlatformMetadataResponse>, Status> {
        let requests = request.into_inner().requests;

        let metadata = try_join_all(requests.into_iter().map(|r| {
            let db_pool = self.db_pool.clone();

            async move { Self::handle_get_platform_metadata(db_pool, r).await }
        }))
        .await?;

        Ok(Response::new(BulkGetPlatformMetadataResponse { metadata }))
    }

    #[tracing::instrument(skip(self))]
    async fn bulk_create_platform_metadata(
        &self,
        request: Request<BulkCreatePlatformMetadataRequest>,
    ) -> Result<Response<BulkCreatePlatformMetadataResponse>, Status> {
        let requests = request.into_inner().requests;

        let metadata = try_join_all(requests.into_iter().map(|r| {
            let db_pool = self.db_pool.clone();

            async move { Self::handle_create_platform_metadata(db_pool, r).await }
        }))
        .await?;

        Ok(Response::new(BulkCreatePlatformMetadataResponse {
            metadata,
        }))
    }

    #[tracing::instrument(skip(self))]
    async fn stat_local_metadata(
        &self,
        _request: Request<StatLocalMetadataRequest>,
    ) -> Result<Response<StatLocalMetadataResponse>, Status> {
        let response = tokio::task::spawn_blocking(|| {
            let media_dir = RetromDirs::new().media_dir();

            let mut total_byte_size = 0i64;
            let mut total_files = 0;

            for entry in WalkDir::new(media_dir)
                .into_iter()
                .filter_map(Result::ok)
                .filter(|e| e.file_type().is_file())
            {
                let size = i64::try_from(entry.metadata().map(|m| m.len()).unwrap_or(0))
                    .unwrap_or(i64::MAX);

                total_files += 1;
                total_byte_size = total_byte_size.saturating_add(size);
            }

            StatLocalMetadataResponse {
                total_byte_size,
                total_files,
            }
        })
        .await
        .map_err(|e| Status::internal(format!("Failed to compute local metadata status: {}", e)))?;

        Ok(Response::new(response))
    }

    #[tracing::instrument(skip(self))]
    async fn purge_local_metadata(
        &self,
        _request: Request<PurgeLocalMetadataRequest>,
    ) -> Result<Response<PurgeLocalMetadataResponse>, Status> {
        let media_dir = RetromDirs::new().media_dir();

        if media_dir.exists() {
            tokio::fs::remove_dir_all(&media_dir)
                .await
                .map_err(|e| Status::internal(format!("Failed to delete local metadata: {}", e)))?;
        }

        Ok(Response::new(PurgeLocalMetadataResponse {}))
    }

    #[tracing::instrument(skip(self))]
    async fn download_game_metadata(
        &self,
        request: Request<DownloadGameMetadataRequest>,
    ) -> Result<Response<DownloadGameMetadataResponse>, Status> {
        let request = request.into_inner();
        let game_id = request.game_id;

        let igdb_job = async {
            let igdb_id: Option<String> =
                QueryBuilder::new("select provider_game_id from game_metadata where game_id = ")
                    .push_bind(&game_id)
                    .push(" and provider_id = ")
                    .push_bind(IGDB_PROVIDER_ID)
                    .build_query_scalar()
                    .fetch_optional(&self.db_pool)
                    .await
                    .map_err(|e| Status::internal(e.to_string()))?;

            let mut igdb = self.igdb_svc_client.clone();

            let igdb_search = igdb_id.map(|id| IgdbSearchRequest {
                filters: Some(IgdbFilters {
                    filters: HashMap::from([(
                        "id".to_string(),
                        FilterValue {
                            value: id,
                            operator: Some(FilterOperator::Equal as i32),
                        },
                    )]),
                }),
                ..Default::default()
            });

            let igdb_metadata = igdb
                .get_igdb_game_metadata(GetIgdbGameMetadataRequest {
                    game_id: game_id.clone(),
                    search: igdb_search,
                    ..Default::default()
                })
                .await?
                .into_inner();

            Self::handle_update_game_metadata(
                self.db_pool.clone(),
                UpdateGameMetadataRequest {
                    metadata: Some(igdb_metadata),
                    update_mask: None,
                },
            )
            .await?;

            Ok::<(), Status>(())
        }
        .boxed();

        let steam_job = async {
            let mut steam = self.steam_svc_client.clone();

            let steam_metadata = steam
                .get_steam_game_metadata(Request::new(GetSteamGameMetadataRequest {
                    game_id: game_id.clone(),
                }))
                .await?
                .into_inner();

            Self::handle_update_game_metadata(
                self.db_pool.clone(),
                UpdateGameMetadataRequest {
                    metadata: Some(steam_metadata),
                    update_mask: None,
                },
            )
            .await?;

            Ok::<(), Status>(())
        }
        .boxed();

        join_all(vec![igdb_job, steam_job])
            .await
            .into_iter()
            .try_for_each(|res| res.map_err(|e| Status::internal(e.to_string())))?;

        Ok(Response::new(DownloadGameMetadataResponse {}))
    }

    #[tracing::instrument(skip(self))]
    async fn download_platform_metadata(
        &self,
        request: Request<DownloadPlatformMetadataRequest>,
    ) -> Result<Response<DownloadPlatformMetadataResponse>, Status> {
        let request = request.into_inner();
        let platform_id = request.platform_id;

        let igdb_id: Option<String> = QueryBuilder::new(
            "select provider_platform_id from platform_metadata where platform_id = ",
        )
        .push_bind(&platform_id)
        .push(" and provider_id = ")
        .push_bind(IGDB_PROVIDER_ID)
        .build_query_scalar()
        .fetch_optional(&self.db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

        let mut igdb = self.igdb_svc_client.clone();

        let igdb_search = igdb_id.map(|id| IgdbSearchRequest {
            filters: Some(IgdbFilters {
                filters: HashMap::from([(
                    "id".to_string(),
                    FilterValue {
                        value: id,
                        operator: Some(FilterOperator::Equal as i32),
                    },
                )]),
            }),
            ..Default::default()
        });

        let igdb_metadata = igdb
            .get_igdb_platform_metadata(GetIgdbPlatformMetadataRequest {
                platform_id: platform_id.clone(),
                search: igdb_search,
            })
            .await?
            .into_inner();

        Self::handle_update_platform_metadata(
            self.db_pool.clone(),
            UpdatePlatformMetadataRequest {
                metadata: Some(igdb_metadata),
                update_mask: None,
            },
        )
        .await?;

        Ok(Response::new(DownloadPlatformMetadataResponse {}))
    }
}
