use super::jobs::job_manager::JobManager;
use retrom_codegen::retrom::services::library::v1::{
    library_service_server::LibraryService as LibraryServiceV1, CreateLibrariesRequest,
    CreateLibrariesResponse, CreateRootDirectoriesRequest, CreateRootDirectoriesResponse,
    DeleteGameFilesRequest, DeleteGameFilesResponse, DeleteGamesRequest, DeleteGamesResponse,
    DeleteLibraryRequest as DeleteLibraryRequestV1,
    DeleteLibraryResponse as DeleteLibraryResponseV1,
    DeleteMissingEntriesRequest as DeleteMissingEntriesRequestV1,
    DeleteMissingEntriesResponse as DeleteMissingEntriesResponseV1, DeletePlatformsRequest,
    DeletePlatformsResponse, DeleteRootDirectoriesRequest, DeleteRootDirectoriesResponse,
    GetGameFilesRequest, GetGameFilesResponse, GetGamesRequest, GetGamesResponse,
    GetLibrariesRequest, GetLibrariesResponse, GetPlatformsRequest, GetPlatformsResponse,
    GetRootDirectoriesRequest, GetRootDirectoriesResponse, UpdateGameFilesRequest,
    UpdateGameFilesResponse, UpdateGamesRequest, UpdateGamesResponse, UpdateLibrariesRequest,
    UpdateLibrariesResponse, UpdateLibraryMetadataRequest as UpdateLibraryMetadataRequestV1,
    UpdateLibraryMetadataResponse as UpdateLibraryMetadataResponseV1,
    UpdateLibraryRequest as UpdateLibraryRequestV1,
    UpdateLibraryResponse as UpdateLibraryResponseV1, UpdatePlatformsRequest,
    UpdatePlatformsResponse, UpdateRootDirectoriesRequest, UpdateRootDirectoriesResponse,
};
use retrom_codegen::retrom::{
    library_service_server::LibraryService, DeleteLibraryRequest, DeleteLibraryResponse,
    DeleteMissingEntriesRequest, DeleteMissingEntriesResponse, UpdateLibraryMetadataRequest,
    UpdateLibraryMetadataResponse, UpdateLibraryRequest, UpdateLibraryResponse,
};
use retrom_db::Pool;
use retrom_service_common::{
    config::ServerConfigManager,
    metadata_providers::{igdb::provider::IGDBProvider, steam::provider::SteamWebApiProvider},
};
use std::sync::Arc;
use tonic::{Code, Request, Response, Result, Status};

pub mod content_resolver;
mod delete_handlers;
pub mod game_handlers;
pub mod library_handlers;
mod metadata_handlers;
pub mod platform_handlers;
pub mod root_directory_handlers;
mod update_handlers;

#[derive(Clone)]
pub struct LibraryServiceHandlers {
    pub db_pool: Arc<Pool>,
    pub igdb_client: Arc<IGDBProvider>,
    pub steam_web_api_client: Arc<SteamWebApiProvider>,
    pub job_manager: Arc<JobManager>,
    pub config_manager: Arc<ServerConfigManager>,
}

impl LibraryServiceHandlers {
    pub fn new(
        db_pool: Arc<Pool>,
        igdb_client: Arc<IGDBProvider>,
        steam_web_api_client: Arc<SteamWebApiProvider>,
        job_manager: Arc<JobManager>,
        config_manager: Arc<ServerConfigManager>,
    ) -> Self {
        Self {
            db_pool,
            igdb_client,
            steam_web_api_client,
            job_manager,
            config_manager,
        }
    }
}

#[tonic::async_trait]
impl LibraryService for LibraryServiceHandlers {
    async fn update_library(
        &self,
        request: Request<UpdateLibraryRequest>,
    ) -> Result<Response<UpdateLibraryResponse>, Status> {
        match update_handlers::update_library(self, request).await {
            Ok(response) => Ok(Response::new(response)),
            Err(why) => Err(why),
        }
    }

    async fn update_library_metadata(
        &self,
        request: Request<UpdateLibraryMetadataRequest>,
    ) -> Result<Response<UpdateLibraryMetadataResponse>, Status> {
        match metadata_handlers::update_metadata(self, request.into_inner().overwrite()).await {
            Ok(res) => Ok(Response::new(res)),
            Err(why) => Err(Status::new(Code::Internal, why)),
        }
    }

    async fn delete_library(
        &self,
        request: Request<DeleteLibraryRequest>,
    ) -> Result<Response<DeleteLibraryResponse>, Status> {
        match delete_handlers::delete_library(self, request.into_inner()).await {
            Ok(response) => Ok(Response::new(response)),
            Err(why) => Err(why),
        }
    }

    async fn delete_missing_entries(
        &self,
        request: Request<DeleteMissingEntriesRequest>,
    ) -> Result<Response<DeleteMissingEntriesResponse>, Status> {
        match delete_handlers::delete_missing_entries(self, request.into_inner()).await {
            Ok(response) => Ok(Response::new(response)),
            Err(why) => Err(why),
        }
    }
}

/// Implementation of the versioned `retrom.services.library.v1.LibraryService`.
///
/// Existing operations delegate to the same underlying handler functions as the
/// legacy `LibraryService` implementation above.  New game, platform, library,
/// and root-directory operations are implemented in dedicated sub-modules.
#[tonic::async_trait]
impl LibraryServiceV1 for LibraryServiceHandlers {
    async fn update_library(
        &self,
        request: Request<UpdateLibraryRequestV1>,
    ) -> Result<Response<UpdateLibraryResponseV1>, Status> {
        let _request = request.into_inner();
        let legacy_request = tonic::Request::new(UpdateLibraryRequest {});
        match update_handlers::update_library(self, legacy_request).await {
            Ok(res) => Ok(Response::new(UpdateLibraryResponseV1 {
                job_ids: res.job_ids,
            })),
            Err(why) => Err(why),
        }
    }

    async fn update_library_metadata(
        &self,
        request: Request<UpdateLibraryMetadataRequestV1>,
    ) -> Result<Response<UpdateLibraryMetadataResponseV1>, Status> {
        let overwrite = request.into_inner().overwrite.unwrap_or(false);
        match metadata_handlers::update_metadata(self, overwrite).await {
            Ok(res) => Ok(Response::new(UpdateLibraryMetadataResponseV1 {
                platform_metadata_job_id: res.platform_metadata_job_id,
                game_metadata_job_id: res.game_metadata_job_id,
                extra_metadata_job_id: res.extra_metadata_job_id,
                steam_metadata_job_id: res.steam_metadata_job_id,
            })),
            Err(why) => Err(Status::new(Code::Internal, why)),
        }
    }

    async fn delete_library(
        &self,
        _request: Request<DeleteLibraryRequestV1>,
    ) -> Result<Response<DeleteLibraryResponseV1>, Status> {
        match delete_handlers::delete_library(self, DeleteLibraryRequest {}).await {
            Ok(_) => Ok(Response::new(DeleteLibraryResponseV1 {})),
            Err(why) => Err(why),
        }
    }

    async fn delete_missing_entries(
        &self,
        request: Request<DeleteMissingEntriesRequestV1>,
    ) -> Result<Response<DeleteMissingEntriesResponseV1>, Status> {
        let req = request.into_inner();
        let legacy_req = DeleteMissingEntriesRequest {
            dry_run: req.dry_run,
        };
        match delete_handlers::delete_missing_entries(self, legacy_req).await {
            Ok(res) => Ok(Response::new(DeleteMissingEntriesResponseV1 {
                platforms_deleted: res.platforms_deleted,
                games_deleted: res.games_deleted,
                game_files_deleted: res.game_files_deleted,
            })),
            Err(why) => Err(why),
        }
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
        let req = request.into_inner();
        let legacy_req = retrom_codegen::retrom::GetPlatformsRequest {
            ids: req.ids,
            with_metadata: req.with_metadata,
            include_deleted: req.include_deleted,
        };
        platform_handlers::get_platforms(self.db_pool.clone(), legacy_req)
            .await
            .map(|res| {
                Response::new(GetPlatformsResponse {
                    platforms: res.platforms,
                    metadata: res.metadata,
                })
            })
    }

    async fn delete_platforms(
        &self,
        request: Request<DeletePlatformsRequest>,
    ) -> Result<Response<DeletePlatformsResponse>, Status> {
        let req = request.into_inner();
        let legacy_req = retrom_codegen::retrom::DeletePlatformsRequest {
            ids: req.ids,
            delete_from_disk: req.delete_from_disk,
            blacklist_entries: req.blacklist_entries,
        };
        platform_handlers::delete_platforms(self.db_pool.clone(), legacy_req)
            .await
            .map(|res| {
                Response::new(DeletePlatformsResponse {
                    platforms_deleted: res.platforms_deleted,
                })
            })
    }

    async fn update_platforms(
        &self,
        request: Request<UpdatePlatformsRequest>,
    ) -> Result<Response<UpdatePlatformsResponse>, Status> {
        let req = request.into_inner();
        let legacy_req = retrom_codegen::retrom::UpdatePlatformsRequest {
            platforms: req.platforms,
        };
        platform_handlers::update_platforms(self.db_pool.clone(), legacy_req)
            .await
            .map(|res| {
                Response::new(UpdatePlatformsResponse {
                    platforms_updated: res.platforms_updated,
                })
            })
    }

    async fn get_games(
        &self,
        request: Request<GetGamesRequest>,
    ) -> Result<Response<GetGamesResponse>, Status> {
        let req = request.into_inner();
        let legacy_req = retrom_codegen::retrom::GetGamesRequest {
            ids: req.ids,
            platform_ids: req.platform_ids,
            with_metadata: req.with_metadata,
            with_files: req.with_files,
            include_deleted: req.include_deleted,
        };
        game_handlers::get_games(self.db_pool.clone(), legacy_req)
            .await
            .map(|res| {
                Response::new(GetGamesResponse {
                    games: res.games,
                    metadata: res.metadata,
                    game_files: res.game_files,
                })
            })
    }

    async fn delete_games(
        &self,
        request: Request<DeleteGamesRequest>,
    ) -> Result<Response<DeleteGamesResponse>, Status> {
        let req = request.into_inner();
        let legacy_req = retrom_codegen::retrom::DeleteGamesRequest {
            ids: req.ids,
            delete_from_disk: req.delete_from_disk,
            blacklist_entries: req.blacklist_entries,
        };
        game_handlers::delete_games(self.db_pool.clone(), legacy_req)
            .await
            .map(|res| {
                Response::new(DeleteGamesResponse {
                    games_deleted: res.games_deleted,
                })
            })
    }

    async fn update_games(
        &self,
        request: Request<UpdateGamesRequest>,
    ) -> Result<Response<UpdateGamesResponse>, Status> {
        let req = request.into_inner();
        let legacy_req = retrom_codegen::retrom::UpdateGamesRequest { games: req.games };
        game_handlers::update_games(self.db_pool.clone(), legacy_req)
            .await
            .map(|res| {
                Response::new(UpdateGamesResponse {
                    games_updated: res.games_updated,
                })
            })
    }

    async fn get_game_files(
        &self,
        request: Request<GetGameFilesRequest>,
    ) -> Result<Response<GetGameFilesResponse>, Status> {
        let req = request.into_inner();
        let legacy_req = retrom_codegen::retrom::GetGameFilesRequest {
            ids: req.ids,
            game_ids: req.game_ids,
            include_deleted: req.include_deleted,
        };
        game_handlers::get_game_files(self.db_pool.clone(), legacy_req)
            .await
            .map(|res| {
                Response::new(GetGameFilesResponse {
                    game_files: res.game_files,
                })
            })
    }

    async fn delete_game_files(
        &self,
        request: Request<DeleteGameFilesRequest>,
    ) -> Result<Response<DeleteGameFilesResponse>, Status> {
        let req = request.into_inner();
        let legacy_req = retrom_codegen::retrom::DeleteGameFilesRequest {
            ids: req.ids,
            delete_from_disk: req.delete_from_disk,
            blacklist_entries: req.blacklist_entries,
        };
        game_handlers::delete_game_files(self.db_pool.clone(), legacy_req)
            .await
            .map(|res| {
                Response::new(DeleteGameFilesResponse {
                    game_files_deleted: res.game_files_deleted,
                })
            })
    }

    async fn update_game_files(
        &self,
        request: Request<UpdateGameFilesRequest>,
    ) -> Result<Response<UpdateGameFilesResponse>, Status> {
        let req = request.into_inner();
        let legacy_req = retrom_codegen::retrom::UpdateGameFilesRequest {
            game_files: req.game_files,
        };
        game_handlers::update_game_files(self.db_pool.clone(), legacy_req)
            .await
            .map(|res| {
                Response::new(UpdateGameFilesResponse {
                    game_files_updated: res.game_files_updated,
                })
            })
    }
}
