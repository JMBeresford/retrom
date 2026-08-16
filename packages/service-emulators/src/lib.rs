use pbjson_types::Empty;
use retrom_codegen::retrom::services::emulators::v1::{
    emulator_service_server::EmulatorService, CreateDefaultEmulatorProfileRequest,
    CreateEmulatorProfileRequest, CreateEmulatorRequest, CreateLocalEmulatorConfigRequest,
    DefaultEmulatorProfile, DeleteDefaultEmulatorProfileRequest, DeleteEmulatorProfileRequest,
    DeleteEmulatorRequest, DeleteLocalEmulatorConfigRequest, Emulator, EmulatorProfile,
    GetDefaultEmulatorProfileRequest, GetEmulatorProfileRequest, GetEmulatorRequest,
    GetLocalEmulatorConfigRequest, ListDefaultEmulatorProfilesRequest,
    ListDefaultEmulatorProfilesResponse, ListEmulatorProfilesRequest, ListEmulatorProfilesResponse,
    ListEmulatorsRequest, ListEmulatorsResponse, ListLocalEmulatorConfigsRequest,
    ListLocalEmulatorConfigsResponse, LocalEmulatorConfig, UpdateDefaultEmulatorProfileRequest,
    UpdateEmulatorProfileRequest, UpdateEmulatorRequest, UpdateLocalEmulatorConfigRequest,
};
use retrom_db::DbPool;
use tonic::{Request, Response, Status};

pub mod router;

pub struct EmulatorServiceHandlers {
    db_pool: DbPool,
}

impl EmulatorServiceHandlers {
    pub fn new(db_pool: DbPool) -> Self {
        Self { db_pool }
    }
}

#[tonic::async_trait]
impl EmulatorService for EmulatorServiceHandlers {
    async fn get_emulator(
        &self,
        request: Request<GetEmulatorRequest>,
    ) -> Result<Response<Emulator>, Status> {
        unimplemented!()
    }

    async fn list_emulators(
        &self,
        request: Request<ListEmulatorsRequest>,
    ) -> Result<Response<ListEmulatorsResponse>, Status> {
        unimplemented!()
    }

    async fn create_emulator(
        &self,
        request: Request<CreateEmulatorRequest>,
    ) -> Result<Response<Emulator>, Status> {
        unimplemented!()
    }

    async fn update_emulator(
        &self,
        request: Request<UpdateEmulatorRequest>,
    ) -> Result<Response<Emulator>, Status> {
        unimplemented!()
    }

    async fn delete_emulator(
        &self,
        request: Request<DeleteEmulatorRequest>,
    ) -> Result<Response<Empty>, Status> {
        unimplemented!()
    }

    async fn get_emulator_profile(
        &self,
        request: Request<GetEmulatorProfileRequest>,
    ) -> Result<Response<EmulatorProfile>, Status> {
        unimplemented!()
    }

    async fn list_emulator_profiles(
        &self,
        request: Request<ListEmulatorProfilesRequest>,
    ) -> Result<Response<ListEmulatorProfilesResponse>, Status> {
        unimplemented!()
    }

    async fn create_emulator_profile(
        &self,
        request: Request<CreateEmulatorProfileRequest>,
    ) -> Result<Response<EmulatorProfile>, Status> {
        unimplemented!()
    }

    async fn update_emulator_profile(
        &self,
        request: Request<UpdateEmulatorProfileRequest>,
    ) -> Result<Response<EmulatorProfile>, Status> {
        unimplemented!()
    }

    async fn delete_emulator_profile(
        &self,
        request: Request<DeleteEmulatorProfileRequest>,
    ) -> Result<Response<Empty>, Status> {
        unimplemented!()
    }

    async fn get_default_emulator_profile(
        &self,
        request: Request<GetDefaultEmulatorProfileRequest>,
    ) -> Result<Response<DefaultEmulatorProfile>, Status> {
        unimplemented!()
    }

    async fn list_default_emulator_profiles(
        &self,
        request: Request<ListDefaultEmulatorProfilesRequest>,
    ) -> Result<Response<ListDefaultEmulatorProfilesResponse>, Status> {
        unimplemented!()
    }

    async fn create_default_emulator_profile(
        &self,
        request: Request<CreateDefaultEmulatorProfileRequest>,
    ) -> Result<Response<DefaultEmulatorProfile>, Status> {
        unimplemented!()
    }

    async fn update_default_emulator_profile(
        &self,
        request: Request<UpdateDefaultEmulatorProfileRequest>,
    ) -> Result<Response<DefaultEmulatorProfile>, Status> {
        unimplemented!()
    }

    async fn delete_default_emulator_profile(
        &self,
        request: Request<DeleteDefaultEmulatorProfileRequest>,
    ) -> Result<Response<Empty>, Status> {
        unimplemented!()
    }

    async fn get_local_emulator_config(
        &self,
        request: Request<GetLocalEmulatorConfigRequest>,
    ) -> Result<Response<LocalEmulatorConfig>, Status> {
        unimplemented!()
    }

    async fn list_local_emulator_configs(
        &self,
        request: Request<ListLocalEmulatorConfigsRequest>,
    ) -> Result<Response<ListLocalEmulatorConfigsResponse>, Status> {
        unimplemented!()
    }

    async fn create_local_emulator_config(
        &self,
        request: Request<CreateLocalEmulatorConfigRequest>,
    ) -> Result<Response<LocalEmulatorConfig>, Status> {
        unimplemented!()
    }

    async fn update_local_emulator_config(
        &self,
        request: Request<UpdateLocalEmulatorConfigRequest>,
    ) -> Result<Response<LocalEmulatorConfig>, Status> {
        unimplemented!()
    }

    async fn delete_local_emulator_config(
        &self,
        request: Request<DeleteLocalEmulatorConfigRequest>,
    ) -> Result<Response<Empty>, Status> {
        unimplemented!()
    }
}
