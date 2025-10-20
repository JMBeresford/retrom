use crate::jobs::job_manager::JobError;
use chrono::DateTime;
use diesel::prelude::*;
use diesel_async::{scoped_futures::ScopedFutureExt, AsyncConnection, RunQueryDsl};
use futures::future::join_all;
use retrom_codegen::{
    retrom::{
        self,
        get_game_metadata_response::{GameGenres, MediaPaths, SimilarGames},
        get_igdb_search_request::IgdbSearchType,
        get_igdb_search_response::SearchResults,
        metadata_service_server::MetadataService,
        Game, GameGenre, GameGenreMap, GetGameMetadataRequest, GetGameMetadataResponse,
        GetIgdbGameSearchResultsRequest, GetIgdbGameSearchResultsResponse,
        GetIgdbPlatformSearchResultsRequest, GetIgdbPlatformSearchResultsResponse,
        GetIgdbSearchRequest, GetIgdbSearchResponse, GetPlatformMetadataRequest,
        GetPlatformMetadataResponse, IgdbSearchGameResponse, IgdbSearchPlatformResponse,
        SimilarGameMap, SyncSteamMetadataRequest, SyncSteamMetadataResponse,
        UpdateGameMetadataRequest, UpdateGameMetadataResponse, UpdatePlatformMetadataRequest,
        UpdatePlatformMetadataResponse, UpdatedGameMetadata,
    },
    timestamp::Timestamp,
};
use retrom_db::{schema, Pool};
use retrom_service_common::{
    media_cache::{cacheable_media::CacheableMetadata, get_public_url, MediaCache},
    metadata_providers::{
        igdb::provider::{IGDBProvider, IgdbSearchData},
        steam::provider::SteamWebApiProvider,
        GameMetadataProvider, MetadataProvider, PlatformMetadataProvider,
    },
};
use std::{collections::HashMap, sync::Arc};
use tokio::sync::RwLock;
use tonic::{Request, Response, Status};
use tracing::{error, Instrument, Level};

use super::jobs::job_manager::JobManager;

pub struct MetadataServiceHandlers {
    db_pool: Arc<Pool>,
    igdb_client: Arc<IGDBProvider>,
    steam_provider: Arc<SteamWebApiProvider>,
    media_cache: Arc<MediaCache>,
    job_manager: Arc<JobManager>,
}

impl MetadataServiceHandlers {
    pub fn new(
        db_pool: Arc<Pool>,
        igdb_client: Arc<IGDBProvider>,
        steam_provider: Arc<SteamWebApiProvider>,
        media_cache: Arc<MediaCache>,
        job_manager: Arc<JobManager>,
    ) -> Self {
        Self {
            db_pool,
            igdb_client,
            steam_provider,
            media_cache,
            job_manager,
        }
    }
}

#[tonic::async_trait]
impl MetadataService for MetadataServiceHandlers {
    async fn get_game_metadata(
        &self,
        request: Request<GetGameMetadataRequest>,
    ) -> Result<Response<GetGameMetadataResponse>, Status> {
        let request = request.into_inner();
        let game_ids = request.game_ids;

        let mut conn = match self.db_pool.get().await {
            Ok(conn) => conn,
            Err(why) => {
                return Err(Status::internal(why.to_string()));
            }
        };

        let metadata = match retrom_db::schema::game_metadata::table
            .filter(retrom_db::schema::game_metadata::game_id.eq_any(&game_ids))
            .load::<retrom::GameMetadata>(&mut conn)
            .instrument(tracing::info_span!("load_game_metadata"))
            .await
        {
            Ok(rows) => rows,
            Err(why) => {
                return Err(Status::internal(why.to_string()));
            }
        };

        let (games1, games2) = diesel::alias!(schema::games as games1, schema::games as games2);

        let games: Vec<Game> = games1
            .filter(games1.field(schema::games::id).eq_any(game_ids))
            .load::<retrom::Game>(&mut conn)
            .instrument(tracing::info_span!("load_games"))
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        let genre_maps: Vec<(GameGenreMap, GameGenre)> = GameGenreMap::belonging_to(&games)
            .inner_join(schema::game_genres::table)
            .select((GameGenreMap::as_select(), GameGenre::as_select()))
            .load(&mut conn)
            .instrument(tracing::info_span!("load_genre_maps"))
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        let genres: HashMap<i32, GameGenres> = genre_maps
            .grouped_by(&games)
            .into_iter()
            .zip(&games)
            .map(|(maps, game)| {
                let genres = maps
                    .into_iter()
                    .map(|map| map.1)
                    .collect::<Vec<GameGenre>>();

                (game.id, GameGenres { value: genres })
            })
            .collect();

        let similar_maps_flat: Vec<(SimilarGameMap, Game)> =
            SimilarGameMap::belonging_to(&games)
                .inner_join(games2.on(
                    schema::similar_game_maps::similar_game_id.eq(games2.field(schema::games::id)),
                ))
                .select((
                    SimilarGameMap::as_select(),
                    games2.fields(schema::games::all_columns),
                ))
                .load(&mut conn)
                .instrument(tracing::info_span!("load_similar_game_maps"))
                .await
                .map_err(|e| Status::internal(e.to_string()))?;

        let similar_games: HashMap<i32, SimilarGames> = similar_maps_flat
            .grouped_by(&games)
            .into_iter()
            .zip(games)
            .map(|(maps, game)| {
                let games: Vec<Game> = maps.into_iter().map(|map| map.1).collect();

                (game.id, SimilarGames { value: games })
            })
            .collect();

        // Build media paths for each game from the local cache
        let media_futures = metadata
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
                                _ => {
                                    tracing::warn!(
                                        "Failed to get cache path for media opts: {:?}",
                                        media_opts
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
                                cache_tasks.push(async move {
                                    if let Err(e) = cache_clone.cache_media_file(&media_opts).await
                                    {
                                        tracing::warn!(
                                            "Failed to cache media for game {}: {}",
                                            meta_clone.game_id,
                                            e
                                        );

                                        Err(Status::internal(e.to_string()))
                                    } else {
                                        tracing::debug!(
                                            "Successfully cached media for game {}",
                                            meta_clone.game_id
                                        );
                                        Ok(())
                                    }
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

                            // Map based on file structure and naming using PathBuf methods
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
                                Some("artwork") => {
                                    paths.artwork_urls.push(public_url);
                                }
                                Some("screenshots") => {
                                    paths.screenshot_urls.push(public_url);
                                }
                                _ => {}
                            };
                        }

                        // Only include games that actually have cached media
                        if paths.cover_url.is_some()
                            || paths.background_url.is_some()
                            || paths.icon_url.is_some()
                            || !paths.artwork_urls.is_empty()
                            || !paths.screenshot_urls.is_empty()
                            || !paths.video_urls.is_empty()
                        {
                            return Some((meta.game_id, paths));
                        }

                        let job_name = format!("Cache Media Files For Game {}", meta_clone.game_id);

                        if !cache_tasks.is_empty() {
                            let job_manager = self.job_manager.clone();
                            match job_manager.spawn(&job_name, cache_tasks, None).await {
                                Ok(job_id) => {
                                    tracing::debug!(
                                        "Spawned background job to cache media for game {}: {}",
                                        meta.game_id,
                                        job_id
                                    );
                                }
                                Err(JobError::JobAlreadyRunning(_)) => {}
                                Err(why) => {
                                    tracing::error!("Failed to spawn cache job: {}", why);
                                }
                            }
                        }
                    }

                    None
                }
                .instrument(tracing::info_span!(
                    "build_media_paths",
                    game_id = meta.game_id
                ))
            })
            .collect::<Vec<_>>();

        let media_paths: HashMap<i32, MediaPaths> = join_all(media_futures)
            .await
            .into_iter()
            .flatten()
            .collect();

        Ok(Response::new(GetGameMetadataResponse {
            metadata,
            genres,
            similar_games,
            media_paths,
        }))
    }

    async fn update_game_metadata(
        &self,
        request: Request<UpdateGameMetadataRequest>,
    ) -> Result<Response<UpdateGameMetadataResponse>, Status> {
        let request = request.into_inner();
        let metadata_to_update = request.metadata;

        join_all(metadata_to_update.iter().map(|metadata| async {
            let job_manager = self.job_manager.clone();
            let cache = self.media_cache.clone();

            if let Err(e) = metadata.clean_cache().await {
                error!("Failed to clean cache for metadata: {}", e);
                return;
            }

            let opts = metadata.get_cacheable_media_opts();

            let job_name = format!("Cache Media Files For Game {}", metadata.game_id);

            let tasks = opts
                .into_iter()
                .map(|opt| {
                    let cache_clone = cache.clone();
                    async move { cache_clone.cache_media_file(&opt).await }
                })
                .collect();

            if let Err(why) = job_manager.spawn(&job_name, tasks, None).await {
                error!("Failed to spawn job for caching media: {}", why);
            }
        }))
        .await;

        let mut conn = match self.db_pool.get().await {
            Ok(conn) => conn,
            Err(why) => {
                return Err(Status::internal(why.to_string()));
            }
        };

        let mut metadata_updated: Vec<retrom::GameMetadata> = vec![];

        for metadata_row in metadata_to_update {
            let updated_row = match diesel::insert_into(retrom_db::schema::game_metadata::table)
                .values(&metadata_row)
                .on_conflict(retrom_db::schema::game_metadata::game_id)
                .do_update()
                .set(&metadata_row)
                .get_result::<retrom::GameMetadata>(&mut conn)
                .await
            {
                Ok(row) => row,
                Err(why) => {
                    return Err(Status::internal(why.to_string()));
                }
            };

            metadata_updated.push(updated_row);
        }

        Ok(Response::new(UpdateGameMetadataResponse {
            metadata_updated,
        }))
    }

    async fn get_platform_metadata(
        &self,
        request: Request<GetPlatformMetadataRequest>,
    ) -> Result<Response<GetPlatformMetadataResponse>, Status> {
        let request = request.into_inner();
        let platform_ids = request.platform_ids;

        let mut conn = match self.db_pool.get().await {
            Ok(conn) => conn,
            Err(why) => {
                return Err(Status::internal(why.to_string()));
            }
        };

        let metadata = match retrom_db::schema::platform_metadata::table
            .filter(retrom_db::schema::platform_metadata::platform_id.eq_any(platform_ids))
            .load::<retrom::PlatformMetadata>(&mut conn)
            .await
        {
            Ok(rows) => rows,
            Err(why) => {
                return Err(Status::internal(why.to_string()));
            }
        };

        Ok(Response::new(GetPlatformMetadataResponse { metadata }))
    }

    async fn update_platform_metadata(
        &self,
        request: Request<UpdatePlatformMetadataRequest>,
    ) -> Result<Response<UpdatePlatformMetadataResponse>, Status> {
        let request = request.into_inner();
        let metadata_to_update = request.metadata;

        join_all(metadata_to_update.iter().map(|metadata| async move {
            if let Err(e) = metadata.clean_cache().await {
                error!("Failed to clean cache for platform metadata: {}", e);
                return;
            }

            let job_manager = self.job_manager.clone();
            let cache = self.media_cache.clone();

            let opts = metadata.get_cacheable_media_opts();

            let job_name = format!("Cache Media Files For Platform {}", metadata.platform_id);

            let tasks = opts
                .into_iter()
                .map(|opt| {
                    let cache_clone = cache.clone();
                    async move { cache_clone.cache_media_file(&opt).await }
                })
                .collect();

            if let Err(why) = job_manager.spawn(&job_name, tasks, None).await {
                error!("Failed to spawn job for caching platform media: {}", why);
            }
        }))
        .await;

        let mut conn = match self.db_pool.get().await {
            Ok(conn) => conn,
            Err(why) => {
                return Err(Status::internal(why.to_string()));
            }
        };

        conn.transaction(|mut conn| {
            async move {
                let mut metadata_updated: Vec<retrom::PlatformMetadata> = vec![];

                for metadata_row in metadata_to_update {
                    let updated_row =
                        diesel::insert_into(retrom_db::schema::platform_metadata::table)
                            .values(&metadata_row)
                            .on_conflict(retrom_db::schema::platform_metadata::platform_id)
                            .do_update()
                            .set(&metadata_row)
                            .get_result::<retrom::PlatformMetadata>(&mut conn)
                            .await?;

                    metadata_updated.push(updated_row);
                }

                diesel::result::QueryResult::Ok(Response::new(UpdatePlatformMetadataResponse {
                    metadata_updated,
                }))
            }
            .scope_boxed()
        })
        .await
        .map_err(|why| {
            error!("Failed to update platform metadata: {}", why);
            Status::internal(why.to_string())
        })
    }

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
            .map_err(|_| Status::invalid_argument("Invalid search type provided"));

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
                Ok(IgdbSearchType::Game) => {
                    SearchResults::GameMatches(IgdbSearchGameResponse { games: vec![] })
                }
                Ok(IgdbSearchType::Platform) => {
                    SearchResults::PlatformMatches(IgdbSearchPlatformResponse { platforms: vec![] })
                }
                Err(why) => {
                    return Err(why);
                }
            },
        }
        .into();

        Ok(Response::new(GetIgdbSearchResponse { search_results }))
    }

    #[tracing::instrument(level = Level::DEBUG, skip_all)]
    async fn sync_steam_metadata(
        &self,
        request: Request<SyncSteamMetadataRequest>,
    ) -> Result<Response<SyncSteamMetadataResponse>, Status> {
        let request = request.into_inner();
        let selectors = request.selectors;

        let steam_provider = self.steam_provider.clone();
        let pool = self.db_pool.clone();

        let game_ids = selectors.iter().map(|s| s.game_id).collect::<Vec<_>>();

        let mut conn = pool
            .get()
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        let games: Vec<retrom::Game> = match schema::games::table
            .filter(schema::games::id.eq_any(&game_ids))
            .filter(schema::games::steam_app_id.is_not_null())
            .load(&mut conn)
            .await
        {
            Ok(games) => games,
            Err(why) => {
                return Err(Status::internal(why.to_string()));
            }
        };

        drop(conn);

        let steam_games = Arc::new(RwLock::new(
            steam_provider
                .get_owned_games()
                .await
                .map_err(|why| {
                    error!("Failed to fetch owned games from Steam: {}", why);
                    Status::internal(why.to_string())
                })?
                .response
                .games,
        ));

        let tasks = games
            .into_iter()
            .map(|game| {
                let pool = pool.clone();
                let steam_games = steam_games.clone();

                async move {
                    if let Some(steam_game) = steam_games
                        .read()
                        .await
                        .iter()
                        .find(|g| g.appid == game.steam_app_id() as u32)
                    {
                        let last_played = if steam_game.rtime_last_played > 0 {
                            let dt = DateTime::from_timestamp(steam_game.rtime_last_played, 0);

                            dt.map(|dt| Timestamp {
                                seconds: dt.timestamp(),
                                nanos: 0,
                            })
                        } else {
                            None
                        };

                        let minutes_played = if steam_game.playtime_forever > 0 {
                            Some(steam_game.playtime_forever)
                        } else {
                            None
                        };

                        let updated_meta = UpdatedGameMetadata {
                            last_played,
                            minutes_played,
                            ..Default::default()
                        };

                        let mut conn = match pool.get().await {
                            Ok(conn) => conn,
                            Err(why) => {
                                return Err(Status::internal(why.to_string()));
                            }
                        };

                        diesel::update(schema::game_metadata::table)
                            .filter(schema::game_metadata::game_id.eq(game.id))
                            .set(&updated_meta)
                            .execute(&mut conn)
                            .await
                            .map_err(|why| Status::internal(why.to_string()))?;

                        Ok(Some(updated_meta))
                    } else {
                        Ok(None)
                    }
                }
                .instrument(tracing::info_span!("steam_sync_thread"))
            })
            .collect::<Vec<_>>();

        let res = join_all(tasks).await.into_iter().collect::<Vec<_>>();

        res.iter().for_each(|result| {
            if let Err(e) = result {
                tracing::warn!("Failed to update game metadata: {:?}", e);
            }
        });

        Ok(Response::new(SyncSteamMetadataResponse {}))
    }
}
