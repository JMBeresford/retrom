use futures::{future::join_all, FutureExt, TryFutureExt};
use retrom_codegen::retrom::{
    providers::igdb::v1::{
        igdb_filters::{FilterOperator, FilterValue},
        IgdbFilters,
    },
    services::{
        jobs::v1::JobStatus,
        metadata::v1::{
            igdb_service_client::IgdbServiceClient, metadata_service_server::MetadataService,
            steam_service_client::SteamServiceClient, BulkGetGameMetadataRequest,
            BulkGetGameMetadataResponse, BulkGetPlatformMetadataRequest,
            BulkGetPlatformMetadataResponse, DeleteLocalMetadataRequest,
            DeleteLocalMetadataResponse, DownloadGameMetadataRequest, DownloadGameMetadataResponse,
            DownloadPlatformMetadataRequest, DownloadPlatformMetadataResponse, GameMetadata,
            GameMetadataArtwork, GameMetadataLink, GameMetadataScreenshot, GameMetadataVideo,
            GameMetadataView, GetGameMetadataRequest, GetGameMetadataResponse,
            GetIgdbGameMetadataRequest, GetIgdbPlatformMetadataRequest,
            GetLocalMetadataStatusRequest, GetLocalMetadataStatusResponse,
            GetPlatformMetadataRequest, GetPlatformMetadataResponse, GetSteamGameMetadataRequest,
            IgdbSearchRequest, PlatformMetadata, PlatformMetadataView, UpdateGameMetadataRequest,
            UpdateGameMetadataResponse, UpdatePlatformMetadataRequest,
            UpdatePlatformMetadataResponse,
        },
    },
};
use retrom_db::{DbPool, RetromDB};
use retrom_service_common::{
    config::ServerConfigManager,
    grpc_clients::{igdb_svc::get_igdb_svc_client, steam_svc::get_steam_svc_client},
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
use tonic::{Request, Response, Status};
use tracing::{error, Instrument};
use walkdir::WalkDir;

mod game_metadata;
mod platform_metadata;
pub(crate) mod router;

#[cfg(test)]
mod tests;

#[derive(Clone)]
pub struct MetadataServiceHandlers {
    pub db_pool: DbPool,
    pub media_cache: Arc<MediaCache>,
    pub job_manager: Arc<JobManager>,
    pub config_manager: Arc<ServerConfigManager>,
    igdb_svc_client: IgdbServiceClient<tonic::transport::Channel>,
    steam_svc_client: SteamServiceClient<tonic::transport::Channel>,
}

impl MetadataServiceHandlers {
    pub fn new(
        db_pool: DbPool,
        media_cache: Arc<MediaCache>,
        job_manager: Arc<JobManager>,
        config_manager: Arc<ServerConfigManager>,
    ) -> Self {
        Self {
            db_pool,
            media_cache,
            job_manager,
            config_manager,
            igdb_svc_client: get_igdb_svc_client(),
            steam_svc_client: get_steam_svc_client(),
        }
    }

    #[tracing::instrument(skip(db_pool))]
    pub async fn get_game_metadata_view(
        db_pool: DbPool,
        base_metadata: GameMetadata,
    ) -> Result<GameMetadataView, Status> {
        let game_id = &base_metadata.game_id;

        let artworks: Vec<GameMetadataArtwork> =
            QueryBuilder::new("select * from game_metadata_artwork where game_metadata_id = ")
                .push_bind(&base_metadata.id)
                .build_query_as()
                .fetch_all(&db_pool)
                .await
                .map_err(|e| Status::internal(e.to_string()))?;

        let screenshots: Vec<GameMetadataScreenshot> =
            QueryBuilder::new("select * from game_metadata_screenshots where game_metadata_id = ")
                .push_bind(&base_metadata.id)
                .build_query_as()
                .fetch_all(&db_pool)
                .await
                .map_err(|e| Status::internal(e.to_string()))?;

        let videos: Vec<GameMetadataVideo> =
            QueryBuilder::new("select * from game_metadata_videos where game_metadata_id = ")
                .push_bind(&base_metadata.id)
                .build_query_as()
                .fetch_all(&db_pool)
                .await
                .map_err(|e| Status::internal(e.to_string()))?;

        let links: Vec<GameMetadataLink> =
            QueryBuilder::new("select * from game_metadata_links where game_metadata_id = ")
                .push_bind(&base_metadata.id)
                .build_query_as()
                .fetch_all(&db_pool)
                .await
                .map_err(|e| Status::internal(e.to_string()))?;

        let all_similar_game_ids: Vec<(String, String)> = QueryBuilder::new(
            "select game_id, similar_game_id from similar_games where game_id = ",
        )
        .push_bind(game_id)
        .push(" or similar_game_id = ")
        .push_bind(game_id)
        .build_query_as()
        .fetch_all(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

        let deduped_similar_game_ids: HashSet<String> = all_similar_game_ids
            .into_iter()
            .flat_map(|(game_id, similar_game_id)| vec![game_id, similar_game_id])
            .filter(|id| id != game_id)
            .collect();

        let similar_game_ids = deduped_similar_game_ids.into_iter().collect();

        Ok(GameMetadataView {
            metadata: Some(base_metadata),
            artworks,
            screenshots,
            videos,
            links,
            similar_game_ids,
        })
    }

    #[tracing::instrument(skip(_db_pool))]
    pub async fn get_platform_metadata_view(
        _db_pool: DbPool,
        base_metadata: PlatformMetadata,
    ) -> Result<PlatformMetadataView, Status> {
        Ok(PlatformMetadataView {
            metadata: Some(base_metadata),
        })
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
    ) -> Result<Response<GetGameMetadataResponse>, Status> {
        let request = request.into_inner();
        let game_id = request.game_id;
        let provider_id = request.provider_id;

        let mut builder =
            QueryBuilder::<RetromDB>::new("select * from game_metadata where game_id = ");

        builder.push_bind(&game_id);

        if let Some(provider_id) = provider_id {
            builder.push(" and provider_id = ");
            builder.push_bind(provider_id);
        }

        let base_metadata: Vec<GameMetadata> = builder
            .build_query_as()
            .fetch_all(&self.db_pool)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        if base_metadata.is_empty() {
            return Err(Status::not_found(format!(
                "No metadata found for game_id: {}",
                game_id
            )));
        }

        let mut metadata = vec![];

        join_all(base_metadata.into_iter().map(|meta| {
            let db_pool = self.db_pool.clone();
            async move { Self::get_game_metadata_view(db_pool, meta).await }
        }))
        .await
        .into_iter()
        .try_for_each(|res| {
            res.map(|view| metadata.push(view))
                .map_err(|e| Status::internal(e.to_string()))
        })?;

        Ok(Response::new(GetGameMetadataResponse { metadata }))
    }

    #[tracing::instrument(skip(self))]
    async fn bulk_get_game_metadata(
        &self,
        request: Request<BulkGetGameMetadataRequest>,
    ) -> Result<Response<BulkGetGameMetadataResponse>, Status> {
        let requests = request.into_inner().requests;

        let mut metadata = vec![];

        join_all(requests.into_iter().map(|req| {
            let db_pool = self.db_pool.clone();
            async move {
                let game_id = req.game_id;
                let provider_id = req.provider_id;

                let mut builder =
                    QueryBuilder::<RetromDB>::new("select * from game_metadata where game_id = ");

                builder.push_bind(&game_id);

                if let Some(provider_id) = provider_id {
                    builder.push(" and provider_id = ");
                    builder.push_bind(provider_id);
                }

                let base_metadata: Vec<GameMetadata> = builder
                    .build_query_as()
                    .fetch_all(&db_pool)
                    .await
                    .map_err(|e| Status::internal(e.to_string()))?;

                if base_metadata.is_empty() {
                    return Ok(None);
                }

                let mut metadata_views = vec![];

                for meta in base_metadata {
                    match Self::get_game_metadata_view(db_pool.clone(), meta).await {
                        Ok(view) => metadata_views.push(view),
                        Err(e) => {
                            error!("Failed to build game metadata view: {}", e);
                            continue;
                        }
                    }
                }

                Ok::<_, Status>(Some(metadata_views))
            }
        }))
        .await
        .into_iter()
        .try_for_each(|res| {
            res.map(|opt_views| {
                if let Some(views) = opt_views {
                    metadata.extend(views);
                }
            })
            .map_err(|e| Status::internal(e.to_string()))
        })?;

        Ok(Response::new(BulkGetGameMetadataResponse { metadata }))
    }

    #[tracing::instrument(skip(self))]
    async fn update_game_metadata(
        &self,
        request: Request<UpdateGameMetadataRequest>,
    ) -> Result<Response<UpdateGameMetadataResponse>, Status> {
        let request = request.into_inner();
        let field_mask: HashSet<String> = request
            .update_mask
            .unwrap_or_default()
            .paths
            .into_iter()
            .collect();

        let metadata_to_update = match request.metadata {
            Some(metadata) => metadata,
            None => {
                return Err(Status::invalid_argument(
                    "metadata field is required for updating game metadata".to_string(),
                ));
            }
        };

        let metadata = match metadata_to_update.metadata {
            Some(metadata) => metadata,
            None => {
                return Err(Status::invalid_argument(
                    "metadata field is required for updating game metadata".to_string(),
                ));
            }
        };

        let config = self.config_manager.get_config().await;
        let store_metadata = config
            .metadata
            .map(|m| m.store_metadata_locally)
            .unwrap_or(false);

        if let Err(e) = metadata.clean_cache().await {
            error!("Failed to clean cache for metadata: {}", e);
        }

        if store_metadata {
            let tasks = metadata
                .get_cacheable_media_opts()
                .into_iter()
                .map({
                    let cache = self.media_cache.clone();
                    move |opt| {
                        let cache = cache.clone();
                        async move { cache.cache_media_file(&opt).await }
                    }
                })
                .collect();

            spawn_cache_job(
                self.job_manager.clone(),
                format!("Cache Media Files For Game {}", metadata.game_id),
                tasks,
            )
            .await;
        };

        let mut tx = self
            .db_pool
            .begin()
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        if field_mask.is_empty() || field_mask.contains("metadata") {
            game_metadata::upsert_game_metadata(&mut *tx, &metadata).await?;
        };

        if field_mask.is_empty() || field_mask.contains("screenshots") {
            game_metadata::upsert_game_screenshots(
                &mut *tx,
                &metadata,
                metadata_to_update.screenshots,
            )
            .await?;
        };

        if field_mask.is_empty() || field_mask.contains("artworks") {
            game_metadata::upsert_game_artworks(&mut *tx, &metadata, metadata_to_update.artworks)
                .await?;
        };

        if field_mask.is_empty() || field_mask.contains("videos") {
            game_metadata::upsert_game_videos(&mut *tx, &metadata, metadata_to_update.videos)
                .await?;
        };

        tx.commit()
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        let updated_metadata =
            QueryBuilder::<RetromDB>::new("select * from game_metadata where id = ")
                .push_bind(&metadata.id)
                .build_query_as()
                .fetch_one(&self.db_pool)
                .await
                .map_err(|e| Status::internal(e.to_string()))?;

        let updated_metadata_view =
            MetadataServiceHandlers::get_game_metadata_view(self.db_pool.clone(), updated_metadata)
                .await?;

        Ok(Response::new(UpdateGameMetadataResponse {
            metadata_updated: Some(updated_metadata_view),
        }))
    }

    #[tracing::instrument(skip(self))]
    async fn get_platform_metadata(
        &self,
        request: Request<GetPlatformMetadataRequest>,
    ) -> Result<Response<GetPlatformMetadataResponse>, Status> {
        let request = request.into_inner();
        let platform_id = request.platform_id;
        let provider_id = request.provider_id;

        let mut builder =
            QueryBuilder::<RetromDB>::new("select * from platform_metadata where platform_id = ");

        builder.push_bind(platform_id);

        if let Some(provider_id) = provider_id {
            builder.push(" and provider_id = ");
            builder.push_bind(provider_id);
        }

        let base_metadata: Vec<PlatformMetadata> = builder
            .build_query_as()
            .fetch_all(&self.db_pool)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        let metadata_views = join_all(base_metadata.into_iter().map(|meta| {
            let db_pool = self.db_pool.clone();
            async move { Self::get_platform_metadata_view(db_pool, meta).await }
        }))
        .await
        .into_iter()
        .try_fold(vec![], |mut views, res| {
            res.map(|view| {
                views.push(view);
                views
            })
            .map_err(|e| Status::internal(e.to_string()))
        })?;

        Ok(Response::new(GetPlatformMetadataResponse {
            metadata: metadata_views,
        }))
    }

    #[tracing::instrument(skip(self))]
    async fn update_platform_metadata(
        &self,
        request: Request<UpdatePlatformMetadataRequest>,
    ) -> Result<Response<UpdatePlatformMetadataResponse>, Status> {
        let request = request.into_inner();
        let update_mask: HashSet<String> = request
            .update_mask
            .unwrap_or_default()
            .paths
            .into_iter()
            .collect();

        let metadata_view = match request.metadata {
            Some(metadata) => metadata,
            None => {
                return Err(Status::invalid_argument(
                    "metadata field is required for updating platform metadata".to_string(),
                ));
            }
        };

        let metadata = match metadata_view.metadata {
            Some(metadata) => metadata,
            None => {
                return Err(Status::invalid_argument(
                    "metadata field is required for updating platform metadata".to_string(),
                ));
            }
        };

        let config = self.config_manager.get_config().await;
        let store_metadata = config
            .metadata
            .map(|m| m.store_metadata_locally)
            .unwrap_or(false);

        if let Err(e) = metadata.clean_cache().await {
            error!("Failed to clean cache for platform metadata: {}", e);
        };

        if store_metadata {
            let tasks = metadata
                .get_cacheable_media_opts()
                .into_iter()
                .map({
                    let cache = self.media_cache.clone();
                    move |opt| {
                        let cache = cache.clone();
                        async move { cache.cache_media_file(&opt).await }
                    }
                })
                .collect();

            spawn_cache_job(
                self.job_manager.clone(),
                format!("Cache Media Files For Platform {}", metadata.platform_id),
                tasks,
            )
            .await;
        };

        let mut tx = self
            .db_pool
            .begin()
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        if update_mask.is_empty() || update_mask.contains("metadata") {
            platform_metadata::upsert_platform_metadata(&mut *tx, &metadata).await?;
        };

        tx.commit()
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        let updated_metadata =
            QueryBuilder::<RetromDB>::new("select * from platform_metadata where id = ")
                .push_bind(&metadata.id)
                .build_query_as()
                .fetch_one(&self.db_pool)
                .await
                .map_err(|e| Status::internal(e.to_string()))?;

        let updated_metadata_view = MetadataServiceHandlers::get_platform_metadata_view(
            self.db_pool.clone(),
            updated_metadata,
        )
        .await?;

        Ok(Response::new(UpdatePlatformMetadataResponse {
            metadata_updated: Some(updated_metadata_view),
        }))
    }

    #[tracing::instrument(skip(self))]
    async fn bulk_get_platform_metadata(
        &self,
        request: Request<BulkGetPlatformMetadataRequest>,
    ) -> Result<Response<BulkGetPlatformMetadataResponse>, Status> {
        let request = request.into_inner();
        let requests = request.requests;

        let mut metadata = vec![];

        join_all(requests.into_iter().map(|req| {
            let db_pool = self.db_pool.clone();
            async move {
                let platform_id = req.platform_id;
                let provider_id = req.provider_id;

                let mut builder = QueryBuilder::<RetromDB>::new(
                    "select * from platform_metadata where platform_id = ",
                );

                builder.push_bind(platform_id);

                if let Some(provider_id) = provider_id {
                    builder.push(" and provider_id = ");
                    builder.push_bind(provider_id);
                }

                let base_metadata: Vec<PlatformMetadata> = builder
                    .build_query_as()
                    .fetch_all(&db_pool)
                    .await
                    .map_err(|e| Status::internal(e.to_string()))?;

                if base_metadata.is_empty() {
                    return Ok(None);
                }

                let mut metadata_views = vec![];

                for meta in base_metadata {
                    match Self::get_platform_metadata_view(db_pool.clone(), meta).await {
                        Ok(view) => metadata_views.push(view),
                        Err(e) => {
                            error!("Failed to build platform metadata view: {}", e);
                            continue;
                        }
                    }
                }

                Ok::<_, Status>(Some(metadata_views))
            }
        }))
        .await
        .into_iter()
        .try_for_each(|res| {
            res.map(|opt_views| {
                if let Some(views) = opt_views {
                    metadata.extend(views);
                }
            })
            .map_err(|e| Status::internal(e.to_string()))
        })?;

        Ok(Response::new(BulkGetPlatformMetadataResponse { metadata }))
    }

    #[tracing::instrument(skip(self))]
    async fn get_local_metadata_status(
        &self,
        _request: Request<GetLocalMetadataStatusRequest>,
    ) -> Result<Response<GetLocalMetadataStatusResponse>, Status> {
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

            GetLocalMetadataStatusResponse {
                total_byte_size,
                total_files,
            }
        })
        .await
        .map_err(|e| Status::internal(format!("Failed to compute local metadata status: {}", e)))?;

        Ok(Response::new(response))
    }

    #[tracing::instrument(skip(self))]
    async fn delete_local_metadata(
        &self,
        _request: Request<DeleteLocalMetadataRequest>,
    ) -> Result<Response<DeleteLocalMetadataResponse>, Status> {
        let media_dir = RetromDirs::new().media_dir();

        if media_dir.exists() {
            tokio::fs::remove_dir_all(&media_dir)
                .await
                .map_err(|e| Status::internal(format!("Failed to delete local metadata: {}", e)))?;
        }

        Ok(Response::new(DeleteLocalMetadataResponse {}))
    }

    #[tracing::instrument(skip(self))]
    async fn download_game_metadata(
        &self,
        request: Request<DownloadGameMetadataRequest>,
    ) -> Result<Response<DownloadGameMetadataResponse>, Status> {
        let request = request.into_inner();
        let game_id = request.game_id;

        let igdb_job = {
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

            let igdb_metadata_view = igdb
                .get_igdb_game_metadata(GetIgdbGameMetadataRequest {
                    game_id: game_id.clone(),
                    search: igdb_search,
                    ..Default::default()
                })
                .await?
                .into_inner()
                .game_metadata;

            self.update_game_metadata(Request::new(UpdateGameMetadataRequest {
                metadata: igdb_metadata_view,
                update_mask: None,
            }))
            .map_ok(|_| ())
            .boxed()
        };

        let steam_job = {
            let mut steam = self.steam_svc_client.clone();

            let steam_metadata_view = steam
                .get_steam_game_metadata(Request::new(GetSteamGameMetadataRequest {
                    game_id: game_id.clone(),
                }))
                .await?
                .into_inner()
                .metadata;

            self.update_game_metadata(Request::new(UpdateGameMetadataRequest {
                metadata: steam_metadata_view,
                update_mask: None,
            }))
            .map_ok(|_| ())
            .boxed()
        };

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

        let igdb_metadata_view = igdb
            .get_igdb_platform_metadata(GetIgdbPlatformMetadataRequest {
                platform_id: platform_id.clone(),
                search: igdb_search,
            })
            .await?
            .into_inner()
            .platform_metadata;

        self.update_platform_metadata(Request::new(UpdatePlatformMetadataRequest {
            metadata: igdb_metadata_view,
            update_mask: None,
        }))
        .await?;

        Ok(Response::new(DownloadPlatformMetadataResponse {}))
    }
}
