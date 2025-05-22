use retrom_codegen::retrom::{
    saves_service_server::SavesService, DeleteSaveFilesRequest, DeleteSaveFilesResponse,
    DeleteSaveStatesRequest, DeleteSaveStatesResponse, GetSaveFilesRequest, GetSaveFilesResponse,
    GetSaveStatesResponse, RestoreSaveFilesFromBackupRequest, RestoreSaveFilesFromBackupResponse,
    RestoreSaveStatesFromBackupRequest, RestoreSaveStatesFromBackupResponse, StatSaveFilesRequest,
    StatSaveFilesResponse, StatSaveStatesRequest, StatSaveStatesResponse, UpdateSaveFilesRequest,
    UpdateSaveFilesResponse, UpdateSaveStatesRequest, UpdateSaveStatesResponse,
};

pub struct SavesServiceHandlers {}
pub mod save_file_resolver;

impl SavesServiceHandlers {
    pub fn new() -> Self {
        Self {}
    }
}

#[tonic::async_trait]
impl SavesService for SavesServiceHandlers {
    async fn stat_save_files(
        &self,
        request: tonic::Request<StatSaveFilesRequest>,
    ) -> Result<tonic::Response<StatSaveFilesResponse>, tonic::Status> {
        unimplemented!()
    }

    async fn stat_save_states(
        &self,
        request: tonic::Request<StatSaveStatesRequest>,
    ) -> Result<tonic::Response<StatSaveStatesResponse>, tonic::Status> {
        unimplemented!()
    }

    async fn get_save_files(
        &self,
        request: tonic::Request<GetSaveFilesRequest>,
    ) -> Result<tonic::Response<GetSaveFilesResponse>, tonic::Status> {
        unimplemented!()
    }

    async fn get_save_states(
        &self,
        request: tonic::Request<retrom_codegen::retrom::GetSaveStatesRequest>,
    ) -> std::result::Result<tonic::Response<GetSaveStatesResponse>, tonic::Status> {
        unimplemented!()
    }

    async fn update_save_files(
        &self,
        request: tonic::Request<UpdateSaveFilesRequest>,
    ) -> std::result::Result<tonic::Response<UpdateSaveFilesResponse>, tonic::Status> {
        unimplemented!()
    }

    async fn update_save_states(
        &self,
        request: tonic::Request<UpdateSaveStatesRequest>,
    ) -> std::result::Result<tonic::Response<UpdateSaveStatesResponse>, tonic::Status> {
        unimplemented!()
    }

    async fn delete_save_files(
        &self,
        request: tonic::Request<DeleteSaveFilesRequest>,
    ) -> std::result::Result<tonic::Response<DeleteSaveFilesResponse>, tonic::Status> {
        unimplemented!()
    }

    async fn delete_save_states(
        &self,
        request: tonic::Request<DeleteSaveStatesRequest>,
    ) -> std::result::Result<tonic::Response<DeleteSaveStatesResponse>, tonic::Status> {
        unimplemented!()
    }

    async fn restore_save_files_from_backup(
        &self,
        request: tonic::Request<RestoreSaveFilesFromBackupRequest>,
    ) -> std::result::Result<tonic::Response<RestoreSaveFilesFromBackupResponse>, tonic::Status>
    {
        unimplemented!()
    }

    async fn restore_save_states_from_backup(
        &self,
        request: tonic::Request<RestoreSaveStatesFromBackupRequest>,
    ) -> std::result::Result<tonic::Response<RestoreSaveStatesFromBackupResponse>, tonic::Status>
    {
        unimplemented!()
    }
}
