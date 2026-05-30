use futures::future::join_all;
use retrom_codegen::{
    retrom::services::{
        jobs::v1::JobStatus,
        library::v1::Game,
        metadata::v1::{
            get_game_metadata_response::{MediaPaths, SimilarGames},
            metadata_service_server::MetadataService,
            DeleteLocalMetadataRequest, DeleteLocalMetadataResponse, GameMetadata,
            GetGameMetadataRequest, GetGameMetadataResponse, GetLocalMetadataStatusRequest,
            GetLocalMetadataStatusResponse, GetPlatformMetadataRequest,
            GetPlatformMetadataResponse, PlatformMetadata,
            UpdateGameMetadataRequest, UpdateGameMetadataResponse, UpdatePlatformMetadataRequest,
            UpdatePlatformMetadataResponse,
        },
    },
};
use retrom_db::{DbPool, RetromDB};
use retrom_service_common::media_cache::{
    cacheable_media::CacheableMetadata, get_public_url, MediaCache,
};
use retrom_service_config::{config::ServerConfigManager, retrom_dirs::RetromDirs};
use retrom_service_jobs::job_manager::JobManager;
use sqlx::QueryBuilder;
use std::{collections::HashMap, fmt::Display, future::Future, sync::Arc};
use tonic::{Request, Response, Status};
use tracing::{error, Instrument};
use walkdir::WalkDir;

pub(crate) mod router;

#[derive(Clone)]
pub struct MetadataServiceHandlers {
    pub db_pool: DbPool,
    pub media_cache: Arc<MediaCache>,
    pub job_manager: Arc<JobManager>,
    pub config_manager: Arc<ServerConfigManager>,
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
        }
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

    tokio::spawn(async move {
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
    });
}

#[tonic::async_trait]
impl MetadataService for MetadataServiceHandlers {
    async fn get_game_metadata(
        &self,
        request: Request<GetGameMetadataRequest>,
    ) -> Result<Response<GetGameMetadataResponse>, Status> {
        let game_ids = request.into_inner().game_ids;

        let mut metadata_builder = QueryBuilder::<RetromDB>::new(
            "select * from game_metadata",
        );

        if !game_ids.is_empty() {
            metadata_builder.push(" where game_id in (");
            let mut separated = metadata_builder.separated(", ");
            for id in &game_ids {
                separated.push_bind(id);
            }
            separated.push_unseparated(")");
        }

        let metadata_rows: Vec<GameMetadata> = metadata_builder
            .build_query_as()
            .fetch_all(&self.db_pool)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        let metadata = metadata_rows;

        let mut similar_games: HashMap<String, SimilarGames> = HashMap::new();
        if !game_ids.is_empty() {
            #[derive(sqlx::FromRow)]
            struct SimilarGameEntry {
                group_id: String,
                #[sqlx(flatten)]
                game: Game,
            }

            let mut builder = QueryBuilder::<RetromDB>::new(
                r#"
                select
                    sg.game_id as group_id,
                    g.id,
                    g.path,
                    null as platform_id,
                    g.created_at,
                    g.updated_at,
                    g.deleted_at,
                    g.is_deleted,
                    null as default_file_id,
                    g.storage_type,
                    g.third_party,
                    g.steam_app_id
                from games g
                inner join similar_games sg on sg.similar_game_id = g.id
                where sg.game_id in (
                "#,
            );
            let mut separated = builder.separated(", ");
            for id in &game_ids {
                separated.push_bind(id);
            }
            separated.push_unseparated(")");

            let entries: Vec<SimilarGameEntry> = builder
                .build_query_as()
                .fetch_all(&self.db_pool)
                .await
                .map_err(|e| Status::internal(e.to_string()))?;

            for entry in entries {
                similar_games
                    .entry(entry.group_id)
                    .or_insert_with(|| SimilarGames { value: vec![] })
                    .value
                    .push(entry.game);
            }
        }

        let config = self.config_manager.get_config().await;
        let store_metadata = config
            .metadata
            .map(|m| m.store_metadata_locally)
            .unwrap_or(false);

        let media_futures = if store_metadata {
            metadata
                .iter()
                .map(|meta| {
                    async {
                        if meta.get_cache_dir().is_some() {
                            let mut paths = MediaPaths {
                                cover_url: None,
                                background_url: None,
                                icon_url: None,
                                video_urls: vec![],
                                screenshot_urls: vec![],
                                artwork_urls: vec![],
                            };

                            let cache_opts = meta.get_cacheable_media_opts();
                            let meta_clone = meta.clone();
                            let mut cache_tasks = vec![];

                            for media_opts in cache_opts.into_iter() {
                                let cache_path = match media_opts.get_item_path().await {
                                    Ok(path) => path,
                                    Err(why) => {
                                        tracing::warn!(
                                            "Failed to get cache path for media opts: {:?}: {}",
                                            media_opts,
                                            why
                                        );
                                        continue;
                                    }
                                };

                                let cache_clone = self.media_cache.clone();
                                let needs_caching = !cache_clone
                                    .index_manager()
                                    .is_entry_valid(&media_opts)
                                    .await
                                    .unwrap_or(true);

                                if needs_caching {
                                    let meta_clone = meta_clone.clone();
                                    cache_tasks.push(async move {
                                        cache_clone.cache_media_file(&media_opts).await.map_err(|e| {
                                            tracing::warn!(
                                                "Failed to cache media for game {}: {}",
                                                meta_clone.game_id,
                                                e
                                            );
                                            e
                                        })
                                    });

                                    continue;
                                }

                                let public_url = match get_public_url(&cache_path) {
                                    Ok(url) => url,
                                    Err(why) => {
                                        tracing::warn!(
                                            "Failed to get public URL for cached media at path: {why:?}",
                                        );
                                        continue;
                                    }
                                };

                                match media_opts.semantic_name.as_deref() {
                                    Some("cover") => paths.cover_url = Some(public_url.clone()),
                                    Some("background") => {
                                        paths.background_url = Some(public_url.clone())
                                    }
                                    Some("icon") => paths.icon_url = Some(public_url.clone()),
                                    _ => {}
                                };

                                let base_dir = media_opts.base_dir.as_ref().and_then(|p| {
                                    p.file_name().map(|s| s.to_string_lossy().to_string())
                                });

                                match base_dir.as_deref() {
                                    Some("artwork") => paths.artwork_urls.push(public_url),
                                    Some("screenshots") => paths.screenshot_urls.push(public_url),
                                    Some("videos") => paths.video_urls.push(public_url),
                                    _ => {}
                                };
                            }

                            if !cache_tasks.is_empty() {
                                spawn_cache_job(
                                    self.job_manager.clone(),
                                    format!("Cache Media Files For Game {}", meta.game_id),
                                    cache_tasks,
                                )
                                .await;
                            }

                            if paths.cover_url.is_some()
                                || paths.background_url.is_some()
                                || paths.icon_url.is_some()
                                || !paths.artwork_urls.is_empty()
                                || !paths.screenshot_urls.is_empty()
                                || !paths.video_urls.is_empty()
                            {
                                return Some((meta.game_id.clone(), paths));
                            }
                        }

                        None
                    }
                    .instrument(tracing::info_span!(
                        "build_media_paths",
                        game_id = meta.game_id
                    ))
                })
                .collect::<Vec<_>>()
        } else {
            vec![]
        };

        let media_paths: HashMap<String, MediaPaths> = join_all(media_futures)
            .await
            .into_iter()
            .flatten()
            .collect();

        Ok(Response::new(GetGameMetadataResponse {
            metadata,
            similar_games,
            media_paths,
        }))
    }

    async fn update_game_metadata(
        &self,
        request: Request<UpdateGameMetadataRequest>,
    ) -> Result<Response<UpdateGameMetadataResponse>, Status> {
        let metadata_to_update = request.into_inner().metadata;
        let config = self.config_manager.get_config().await;
        let store_metadata = config
            .metadata
            .map(|m| m.store_metadata_locally)
            .unwrap_or(false);

        join_all(metadata_to_update.iter().map(|metadata| async {
            if let Err(e) = metadata.clean_cache().await {
                error!("Failed to clean cache for metadata: {}", e);
                return;
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
        }))
        .await;

        let mut tx = self
            .db_pool
            .begin()
            .await
            .map_err(|e| Status::internal(e.to_string()))?;
        let mut metadata_updated = vec![];

        for metadata_row in metadata_to_update {
            if metadata_row.provider_id.is_empty() {
                return Err(Status::invalid_argument(
                    "provider_id is required for game metadata",
                ));
            }

            let row_id = if metadata_row.id.trim().is_empty() {
                uuid::Uuid::now_v7().to_string()
            } else {
                metadata_row.id.clone()
            };

            let mut builder = QueryBuilder::<RetromDB>::new(
                r#"
                insert into game_metadata (
                    id, game_id, provider_id, name, description, cover_url, background_url,
                    icon_url, logo_url, igdb_id, release_date, last_played, minutes_played
                )
                values (
                "#,
            );
            let mut separated = builder.separated(", ");
            separated.push_bind(&row_id);
            separated.push_bind(&metadata_row.game_id);
            separated.push_bind(&metadata_row.provider_id);
            separated.push_bind(&metadata_row.name);
            separated.push_bind(&metadata_row.description);
            separated.push_bind(&metadata_row.cover_url);
            separated.push_bind(&metadata_row.background_url);
            separated.push_bind(&metadata_row.icon_url);
            separated.push_bind(&metadata_row.logo_url);
            separated.push_bind(metadata_row.igdb_id);
            separated.push_bind(metadata_row.release_date);
            separated.push_bind(metadata_row.last_played);
            separated.push_bind(metadata_row.minutes_played);
            separated.push_unseparated(
                r#")
                on conflict (game_id, provider_id) do update set
                    name = excluded.name,
                    description = excluded.description,
                    cover_url = excluded.cover_url,
                    background_url = excluded.background_url,
                    icon_url = excluded.icon_url,
                    logo_url = excluded.logo_url,
                    igdb_id = excluded.igdb_id,
                    release_date = excluded.release_date,
                    last_played = excluded.last_played,
                    minutes_played = excluded.minutes_played,
                    updated_at = current_timestamp
                returning *
                "#,
            );

            let mut updated_row: GameMetadata = builder
                .build_query_as()
                .fetch_one(&mut *tx)
                .await
                .map_err(|e| Status::internal(e.to_string()))?;

            metadata_updated.push(updated_row);
        }

        tx.commit()
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        Ok(Response::new(UpdateGameMetadataResponse {
            metadata_updated,
        }))
    }

    async fn get_platform_metadata(
        &self,
        request: Request<GetPlatformMetadataRequest>,
    ) -> Result<Response<GetPlatformMetadataResponse>, Status> {
        let platform_ids = request.into_inner().platform_ids;

        let mut builder = QueryBuilder::<RetromDB>::new(
            "select * from platform_metadata",
        );

        if !platform_ids.is_empty() {
            builder.push(" where platform_id in (");
            let mut separated = builder.separated(", ");
            for id in &platform_ids {
                separated.push_bind(id);
            }
            separated.push_unseparated(")");
        }

        let metadata: Vec<PlatformMetadata> = builder
            .build_query_as()
            .fetch_all(&self.db_pool)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        Ok(Response::new(GetPlatformMetadataResponse { metadata }))
    }

    async fn update_platform_metadata(
        &self,
        request: Request<UpdatePlatformMetadataRequest>,
    ) -> Result<Response<UpdatePlatformMetadataResponse>, Status> {
        let metadata_to_update = request.into_inner().metadata;

        join_all(metadata_to_update.iter().map(|metadata| async {
            if let Err(e) = metadata.clean_cache().await {
                error!("Failed to clean cache for platform metadata: {}", e);
                return;
            }

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
        }))
        .await;

        let mut tx = self
            .db_pool
            .begin()
            .await
            .map_err(|e| Status::internal(e.to_string()))?;
        let mut metadata_updated = vec![];

        for metadata_row in metadata_to_update {
            if metadata_row.provider_id.is_empty() {
                return Err(Status::invalid_argument(
                    "provider_id is required for platform metadata",
                ));
            }

            let row_id = if metadata_row.id.trim().is_empty() {
                uuid::Uuid::now_v7().to_string()
            } else {
                metadata_row.id.clone()
            };

            let mut builder = QueryBuilder::<RetromDB>::new(
                r#"
                insert into platform_metadata (
                    id, platform_id, provider_id, name, description, background_url, icon_url,
                    logo_url, igdb_id
                )
                values (
                "#,
            );
            let mut separated = builder.separated(", ");
            separated.push_bind(&row_id);
            separated.push_bind(&metadata_row.platform_id);
            separated.push_bind(&metadata_row.provider_id);
            separated.push_bind(&metadata_row.name);
            separated.push_bind(&metadata_row.description);
            separated.push_bind(&metadata_row.background_url);
            separated.push_bind(&metadata_row.icon_url);
            separated.push_bind(&metadata_row.logo_url);
            separated.push_bind(metadata_row.igdb_id);
            separated.push_unseparated(
                r#")
                on conflict (platform_id, provider_id) do update set
                    name = excluded.name,
                    description = excluded.description,
                    background_url = excluded.background_url,
                    icon_url = excluded.icon_url,
                    logo_url = excluded.logo_url,
                    igdb_id = excluded.igdb_id,
                    updated_at = current_timestamp
                returning *
                "#,
            );

            let updated_row: PlatformMetadata = builder
                .build_query_as()
                .fetch_one(&mut *tx)
                .await
                .map_err(|e| Status::internal(e.to_string()))?;

            metadata_updated.push(updated_row);
        }

        tx.commit()
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        Ok(Response::new(UpdatePlatformMetadataResponse {
            metadata_updated,
        }))
    }

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
}
