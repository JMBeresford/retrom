use futures::future::join_all;
use retrom_codegen::retrom::services::{
    jobs::v1::JobStatus,
    library::v1::{
        library_service_server::{LibraryService, LibraryServiceServer},
        CreateGamesRequest, CreateGamesResponse, CreateLibrariesRequest, CreateLibrariesResponse,
        CreatePlatformsRequest, CreatePlatformsResponse, CreateRootDirectoriesRequest,
        CreateRootDirectoriesResponse, DeleteGameFilesRequest, DeleteGameFilesResponse,
        DeleteGamesRequest, DeleteGamesResponse, DeleteLibraryRequest, DeleteLibraryResponse,
        DeleteMissingEntriesRequest, DeleteMissingEntriesResponse, DeletePlatformsRequest,
        DeletePlatformsResponse, DeleteRootDirectoriesRequest, DeleteRootDirectoriesResponse,
        GetGameFilesRequest, GetGameFilesResponse, GetGamesRequest, GetGamesResponse,
        GetLibrariesRequest, GetLibrariesResponse, GetPlatformsRequest, GetPlatformsResponse,
        GetRootDirectoriesRequest, GetRootDirectoriesResponse, ScanLibraryRequest,
        ScanLibraryResponse, UpdateGameFilesRequest, UpdateGameFilesResponse, UpdateGamesRequest,
        UpdateGamesResponse, UpdateLibrariesRequest, UpdateLibrariesResponse,
        UpdateLibraryMetadataRequest, UpdateLibraryMetadataResponse, UpdatePlatformsRequest,
        UpdatePlatformsResponse, UpdateRootDirectoriesRequest, UpdateRootDirectoriesResponse,
    },
    metadata::v1::{
        igdb_service_client::IgdbServiceClient, metadata_service_client::MetadataServiceClient,
        steam_service_client::SteamServiceClient, DownloadGameMetadataRequest,
        DownloadPlatformMetadataRequest, GetIgdbGameMetadataRequest,
        GetIgdbPlatformMetadataRequest, UpdateGameMetadataRequest, UpdatePlatformMetadataRequest,
    },
};
use retrom_db::DbPool;
use retrom_service_common::grpc_clients::{
    igdb_svc::get_igdb_svc_client, metadata_svc::get_metadata_svc_client,
    steam_svc::get_steam_svc_client,
};
use retrom_service_jobs::job_manager::JobManager;
use sqlx::QueryBuilder;
use std::sync::Arc;
use tonic::{Request, Response, Status};
use tracing::Instrument;

pub mod game_handlers;
pub mod library_handlers;
pub mod platform_handlers;
pub mod root_directory_handlers;
pub mod scan;
pub mod scan_handlers;

#[derive(Clone)]
pub struct LibraryServiceHandlers {
    pub db_pool: DbPool,
    pub job_manager: Arc<JobManager>,
    metadata_svc_client: MetadataServiceClient<tonic::transport::Channel>,
    igdb_svc_client: IgdbServiceClient<tonic::transport::Channel>,
    steam_svc_client: SteamServiceClient<tonic::transport::Channel>,
}

impl LibraryServiceHandlers {
    pub fn new(db_pool: DbPool, job_manager: Arc<JobManager>) -> Self {
        Self {
            db_pool,
            job_manager,
            metadata_svc_client: get_metadata_svc_client(),
            igdb_svc_client: get_igdb_svc_client(),
            steam_svc_client: get_steam_svc_client(),
        }
    }
}

#[tonic::async_trait]
impl LibraryService for LibraryServiceHandlers {
    async fn scan_library(
        &self,
        request: Request<ScanLibraryRequest>,
    ) -> Result<Response<ScanLibraryResponse>, Status> {
        scan_handlers::scan_library(self, request.into_inner())
            .await
            .map(Response::new)
    }

    async fn update_library_metadata(
        &self,
        request: Request<UpdateLibraryMetadataRequest>,
    ) -> Result<Response<UpdateLibraryMetadataResponse>, Status> {
        let request = request.into_inner();
        let overwrite = request.overwrite();

        let platform_metadata_job = self
            .job_manager
            .create_job(
                "Updating Platform Metadata".to_string(),
                "Discovering and updating metadata for all platforms".to_string(),
            )
            .await;

        let game_metadata_job = self
            .job_manager
            .create_job(
                "Updating Game Metadata".to_string(),
                "Discovering and updating metadata for all games".to_string(),
            )
            .await;

        let extra_metadata_job = self
            .job_manager
            .create_job(
                "Updating Extra Metadata".to_string(),
                "Discovering and updating extra metadata for all library entries".to_string(),
            )
            .await;

        let db_pool = self.db_pool.clone();
        let platform_metadata_job_id = platform_metadata_job.id.clone();
        let game_metadata_job_id = game_metadata_job.id.clone();
        let extra_metadata_job_id = extra_metadata_job.id.clone();
        let job_manager = self.job_manager.clone();

        tokio::spawn(
            async move {
                job_manager
                    .update_job(
                        &platform_metadata_job_id,
                        Some(0.0),
                        Some(JobStatus::Running),
                        None,
                    )
                    .await;

                let all_platform_ids: Vec<String> =
                    match QueryBuilder::new("select id from platforms")
                        .build_query_scalar()
                        .fetch_all(&db_pool)
                        .await
                    {
                        Ok(platform_ids) => platform_ids,
                        Err(why) => {
                            tracing::error!("Failed to fetch platform ids: {why:#?}");
                            vec![]
                        }
                    };

                let mut tasks = tokio::task::JoinSet::new();
                all_platform_ids.into_iter().for_each(|platform_id| {
                    let mut metadata_svc = self.metadata_svc_client.clone();

                    tasks.spawn(
                        async move {
                            metadata_svc
                                .download_platform_metadata(DownloadPlatformMetadataRequest {
                                    platform_id,
                                })
                                .await
                                .map_err(|why| Status::internal(why.to_string()))?;

                            Ok::<(), Status>(())
                        }
                        .in_current_span(),
                    );
                });

                let total_tasks = tasks.len();
                let mut completed_tasks = 0;
                while let Some(join_result) = tasks.join_next().await {
                    let percent_complete = (completed_tasks as f32 / total_tasks as f32) * 100.0;
                    if let Err(why) = join_result {
                        tracing::error!(
                            "A task in the update library metadata job panicked: {why:#?}"
                        );
                    }

                    self.job_manager
                        .update_job(
                            &platform_metadata_job_id,
                            Some(percent_complete),
                            if join_result.is_err() {
                                Some(JobStatus::Failed)
                            } else {
                                None
                            },
                            None,
                        )
                        .await;
                }

                self.job_manager
                    .update_job(
                        &platform_metadata_job_id,
                        Some(100.0),
                        Some(JobStatus::Complete),
                        None,
                    )
                    .await;

                Ok(())
            }
            .instrument(tracing::info_span!("update_platform_metadata_job")),
        );

        let db_pool = self.db_pool.clone();
        let job_manager = self.job_manager.clone();
        let platform_metadata_job_id = platform_metadata_job.id.clone();
        tokio::spawn(
            async move {
                let sub = job_manager.subscribe(platform_metadata_job_id);

                while let Ok(update) = sub.recv().await {
                    match update.status() {
                        JobStatus::Complete => break,
                        _ => {}
                    }
                }

                job_manager
                    .update_job(
                        &game_metadata_job_id,
                        Some(0.0),
                        Some(JobStatus::Running),
                        None,
                    )
                    .await;

                let all_game_ids: Vec<String> = match QueryBuilder::new("select id from games")
                    .build_query_scalar()
                    .fetch_all(&db_pool)
                    .await
                {
                    Ok(game_ids) => game_ids,
                    Err(why) => {
                        tracing::error!("Failed to fetch game ids: {why:#?}");
                        vec![]
                    }
                };

                let mut tasks = tokio::task::JoinSet::new();
                all_game_ids.into_iter().for_each(|game_id| {
                    let mut metadata_svc = self.metadata_svc_client.clone();

                    tasks.spawn(
                        async move {
                            metadata_svc
                                .download_game_metadata(DownloadGameMetadataRequest { game_id })
                                .await
                                .map_err(|why| Status::internal(why.to_string()))?;

                            Ok::<(), Status>(())
                        }
                        .in_current_span(),
                    );
                });

                let total_tasks = tasks.len();
                let mut completed_tasks = 0;
                while let Some(join_result) = tasks.join_next().await {
                    let percent_complete = (completed_tasks as f32 / total_tasks as f32) * 100.0;
                    if let Err(why) = join_result {
                        tracing::error!(
                            "A task in the update library metadata job panicked: {why:#?}"
                        );
                    }

                    job_manager
                        .update_job(
                            &game_metadata_job_id,
                            Some(percent_complete),
                            if join_result.is_err() {
                                Some(JobStatus::Failed)
                            } else {
                                None
                            },
                            None,
                        )
                        .await;
                }

                job_manager
                    .update_job(
                        &game_metadata_job_id,
                        Some(100.0),
                        Some(JobStatus::Complete),
                        None,
                    )
                    .await;

                Ok(())
            }
            .instrument(tracing::info_span!("update_game_metadata_job")),
        );

        let job_manager = self.job_manager.clone();
        tokio::spawn(async move {
            // TODO: Implement extra metadata updating logic here.
            job_manager
                .update_job(
                    &extra_metadata_job_id,
                    Some(100.0),
                    Some(JobStatus::Complete),
                    None,
                )
                .await;
        });

        Ok(Response::new(UpdateLibraryMetadataResponse {
            platform_metadata_job_id,
            game_metadata_job_id,
            extra_metadata_job_id,
        }))
    }

    async fn delete_library(
        &self,
        _request: Request<DeleteLibraryRequest>,
    ) -> Result<Response<DeleteLibraryResponse>, Status> {
        Err(Status::unimplemented(
            "DeleteLibrary is not implemented in sqlx migration groundwork",
        ))
    }

    async fn delete_missing_entries(
        &self,
        _request: Request<DeleteMissingEntriesRequest>,
    ) -> Result<Response<DeleteMissingEntriesResponse>, Status> {
        Err(Status::unimplemented(
            "DeleteMissingEntries is not implemented in sqlx migration groundwork",
        ))
    }

    async fn get_libraries(
        &self,
        request: Request<GetLibrariesRequest>,
    ) -> Result<Response<GetLibrariesResponse>, Status> {
        library_handlers::get_libraries(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn create_libraries(
        &self,
        request: Request<CreateLibrariesRequest>,
    ) -> Result<Response<CreateLibrariesResponse>, Status> {
        library_handlers::create_libraries(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn update_libraries(
        &self,
        request: Request<UpdateLibrariesRequest>,
    ) -> Result<Response<UpdateLibrariesResponse>, Status> {
        library_handlers::update_libraries(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn get_root_directories(
        &self,
        request: Request<GetRootDirectoriesRequest>,
    ) -> Result<Response<GetRootDirectoriesResponse>, Status> {
        root_directory_handlers::get_root_directories(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn create_root_directories(
        &self,
        request: Request<CreateRootDirectoriesRequest>,
    ) -> Result<Response<CreateRootDirectoriesResponse>, Status> {
        root_directory_handlers::create_root_directories(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn update_root_directories(
        &self,
        request: Request<UpdateRootDirectoriesRequest>,
    ) -> Result<Response<UpdateRootDirectoriesResponse>, Status> {
        root_directory_handlers::update_root_directories(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn delete_root_directories(
        &self,
        request: Request<DeleteRootDirectoriesRequest>,
    ) -> Result<Response<DeleteRootDirectoriesResponse>, Status> {
        root_directory_handlers::delete_root_directories(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn get_platforms(
        &self,
        request: Request<GetPlatformsRequest>,
    ) -> Result<Response<GetPlatformsResponse>, Status> {
        platform_handlers::get_platforms(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn create_platforms(
        &self,
        request: Request<CreatePlatformsRequest>,
    ) -> Result<Response<CreatePlatformsResponse>, Status> {
        platform_handlers::create_platforms(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn delete_platforms(
        &self,
        request: Request<DeletePlatformsRequest>,
    ) -> Result<Response<DeletePlatformsResponse>, Status> {
        platform_handlers::delete_platforms(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn update_platforms(
        &self,
        request: Request<UpdatePlatformsRequest>,
    ) -> Result<Response<UpdatePlatformsResponse>, Status> {
        platform_handlers::update_platforms(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn get_games(
        &self,
        request: Request<GetGamesRequest>,
    ) -> Result<Response<GetGamesResponse>, Status> {
        game_handlers::get_games(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn create_games(
        &self,
        request: Request<CreateGamesRequest>,
    ) -> Result<Response<CreateGamesResponse>, Status> {
        game_handlers::create_games(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn delete_games(
        &self,
        request: Request<DeleteGamesRequest>,
    ) -> Result<Response<DeleteGamesResponse>, Status> {
        game_handlers::delete_games(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn update_games(
        &self,
        request: Request<UpdateGamesRequest>,
    ) -> Result<Response<UpdateGamesResponse>, Status> {
        game_handlers::update_games(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn get_game_files(
        &self,
        request: Request<GetGameFilesRequest>,
    ) -> Result<Response<GetGameFilesResponse>, Status> {
        game_handlers::get_game_files(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn delete_game_files(
        &self,
        request: Request<DeleteGameFilesRequest>,
    ) -> Result<Response<DeleteGameFilesResponse>, Status> {
        game_handlers::delete_game_files(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn update_game_files(
        &self,
        request: Request<UpdateGameFilesRequest>,
    ) -> Result<Response<UpdateGameFilesResponse>, Status> {
        game_handlers::update_game_files(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }
}

/// Build an [`axum::Router`] that serves the library gRPC endpoints.
pub fn library_router(db_pool: DbPool) -> axum::Router {
    let job_manager = Arc::new(JobManager::new());
    let lib_handlers = LibraryServiceHandlers::new(db_pool, job_manager);
    let library_service = LibraryServiceServer::new(lib_handlers);

    let mut routes_builder = tonic::service::Routes::builder();
    routes_builder.add_service(library_service);

    routes_builder.routes().into_axum_router()
}
