use diesel::{prelude::*, upsert::excluded};
use diesel_async::RunQueryDsl;
use retrom_codegen::retrom::services::emulators::v1::{
    emulator_service_server::EmulatorService as EmulatorServiceV1,
    DeleteEmulatorPlatformMapsRequest, DeleteEmulatorPlatformMapsResponse, EmulatorPlatformMap,
    GetEmulatorPlatformMapsRequest, GetEmulatorPlatformMapsResponse,
    UpdateEmulatorPlatformMapsRequest, UpdateEmulatorPlatformMapsResponse,
};
use retrom_codegen::retrom::{
    self, emulator_service_server::EmulatorService, CreateEmulatorsRequest,
    CreateEmulatorsResponse, DefaultEmulatorProfile, DeleteEmulatorsRequest,
    DeleteEmulatorsResponse, Emulator, GetEmulatorsRequest, GetEmulatorsResponse,
    UpdateEmulatorsRequest, UpdateEmulatorsResponse,
};
use retrom_db::{schema, Pool};
use std::{collections::HashMap, sync::Arc};
use tonic::{Request, Response, Status};

pub struct EmulatorServiceHandlers {
    db_pool: Arc<Pool>,
}

impl EmulatorServiceHandlers {
    pub fn new(db_pool: Arc<Pool>) -> Self {
        Self { db_pool }
    }
}

#[tonic::async_trait]
impl EmulatorService for EmulatorServiceHandlers {
    async fn create_emulators(
        &self,
        request: Request<CreateEmulatorsRequest>,
    ) -> Result<Response<CreateEmulatorsResponse>, Status> {
        let emulators = request.into_inner().emulators;

        let mut conn = self
            .db_pool
            .get()
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        let emulators_created = diesel::insert_into(schema::emulators::table)
            .values(&emulators)
            .get_results(&mut conn)
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        Ok(Response::new(CreateEmulatorsResponse { emulators_created }))
    }

    async fn get_emulators(
        &self,
        request: Request<GetEmulatorsRequest>,
    ) -> Result<Response<GetEmulatorsResponse>, Status> {
        let request = request.into_inner();

        let ids = &request.ids;
        let supported_platform_ids = &request.supported_platform_ids;

        let mut conn = self
            .db_pool
            .get()
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        let mut query = schema::emulators::table
            .into_boxed()
            .select(retrom::Emulator::as_select());

        if !ids.is_empty() {
            query = query.filter(schema::emulators::id.eq_any(ids));
        }

        if !supported_platform_ids.is_empty() {
            query = query.filter(
                schema::emulators::supported_platforms.overlaps_with(supported_platform_ids),
            );
        };

        match query.load::<Emulator>(&mut conn).await {
            Ok(emulators) => Ok(Response::new(GetEmulatorsResponse { emulators })),
            Err(why) => {
                return Err(Status::internal(why.to_string()));
            }
        }
    }

    async fn update_emulators(
        &self,
        request: Request<UpdateEmulatorsRequest>,
    ) -> Result<Response<UpdateEmulatorsResponse>, Status> {
        let emulators = request.into_inner().emulators;

        let mut conn = self
            .db_pool
            .get()
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        let mut emulators_updated = vec![];

        for emulator in emulators {
            let updated_emulator = diesel::update(schema::emulators::table)
                .filter(schema::emulators::id.eq(emulator.id))
                .set(&emulator)
                .get_result::<Emulator>(&mut conn)
                .await
                .map_err(|why| Status::internal(why.to_string()))?;

            emulators_updated.push(updated_emulator);
        }

        Ok(Response::new(UpdateEmulatorsResponse { emulators_updated }))
    }

    async fn delete_emulators(
        &self,
        request: Request<DeleteEmulatorsRequest>,
    ) -> Result<Response<DeleteEmulatorsResponse>, Status> {
        let ids = request.into_inner().ids;

        let mut conn = self
            .db_pool
            .get()
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        let emulators_deleted = diesel::delete(schema::emulators::table)
            .filter(schema::emulators::id.eq_any(ids))
            .get_results::<Emulator>(&mut conn)
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        Ok(Response::new(DeleteEmulatorsResponse { emulators_deleted }))
    }

    async fn create_emulator_profiles(
        &self,
        request: Request<retrom::CreateEmulatorProfilesRequest>,
    ) -> Result<Response<retrom::CreateEmulatorProfilesResponse>, Status> {
        let profiles = request.into_inner().profiles;

        let mut conn = self
            .db_pool
            .get()
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        let profiles_created = diesel::insert_into(schema::emulator_profiles::table)
            .values(&profiles)
            .get_results::<retrom::EmulatorProfile>(&mut conn)
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        Ok(Response::new(retrom::CreateEmulatorProfilesResponse {
            profiles_created,
        }))
    }

    async fn get_emulator_profiles(
        &self,
        request: Request<retrom::GetEmulatorProfilesRequest>,
    ) -> Result<Response<retrom::GetEmulatorProfilesResponse>, Status> {
        let request = request.into_inner();
        let ids = request.ids;
        let emulator_ids = request.emulator_ids;

        let mut conn = self
            .db_pool
            .get()
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        let mut query = schema::emulator_profiles::table
            .into_boxed()
            .select(retrom::EmulatorProfile::as_select());

        if !ids.is_empty() {
            query = query.filter(schema::emulator_profiles::id.eq_any(ids));
        }

        if !emulator_ids.is_empty() {
            query = query.filter(schema::emulator_profiles::emulator_id.eq_any(emulator_ids));
        }

        match query.load::<retrom::EmulatorProfile>(&mut conn).await {
            Ok(profiles) => Ok(Response::new(retrom::GetEmulatorProfilesResponse {
                profiles,
            })),
            Err(why) => {
                return Err(Status::internal(why.to_string()));
            }
        }
    }

    async fn update_emulator_profiles(
        &self,
        request: Request<retrom::UpdateEmulatorProfilesRequest>,
    ) -> Result<Response<retrom::UpdateEmulatorProfilesResponse>, Status> {
        let emulator_profiles = request.into_inner().profiles;

        let mut conn = self
            .db_pool
            .get()
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        let mut profiles_updated = vec![];

        for emulator in emulator_profiles {
            let updated_emulator = diesel::update(schema::emulator_profiles::table)
                .filter(schema::emulator_profiles::id.eq(emulator.id))
                .set(&emulator)
                .get_result::<retrom::EmulatorProfile>(&mut conn)
                .await
                .map_err(|why| Status::internal(why.to_string()))?;

            profiles_updated.push(updated_emulator);
        }

        Ok(Response::new(retrom::UpdateEmulatorProfilesResponse {
            profiles_updated,
        }))
    }

    async fn delete_emulator_profiles(
        &self,
        request: Request<retrom::DeleteEmulatorProfilesRequest>,
    ) -> Result<Response<retrom::DeleteEmulatorProfilesResponse>, Status> {
        let ids = request.into_inner().ids;

        let mut conn = self
            .db_pool
            .get()
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        let profiles_deleted = diesel::delete(schema::emulator_profiles::table)
            .filter(schema::emulator_profiles::id.eq_any(ids))
            .get_results::<retrom::EmulatorProfile>(&mut conn)
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        Ok(Response::new(retrom::DeleteEmulatorProfilesResponse {
            profiles_deleted,
        }))
    }

    async fn get_default_emulator_profiles(
        &self,
        request: Request<retrom::GetDefaultEmulatorProfilesRequest>,
    ) -> Result<Response<retrom::GetDefaultEmulatorProfilesResponse>, Status> {
        let client_id = match request.metadata().get("x-client-id") {
            Some(client_id) => client_id
                .to_str()
                .unwrap()
                .parse::<i32>()
                .expect("malformed client_id"),
            None => return Err(Status::unauthenticated("Client ID not found")),
        };

        let platform_ids = request.into_inner().platform_ids;

        let mut conn = self
            .db_pool
            .get()
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        let mut default_profiles = schema::default_emulator_profiles::table
            .select(DefaultEmulatorProfile::as_select())
            .into_boxed();

        if !platform_ids.is_empty() {
            default_profiles = default_profiles
                .filter(schema::default_emulator_profiles::platform_id.eq_any(platform_ids));
        }

        let default_profiles = default_profiles
            .filter(schema::default_emulator_profiles::client_id.eq(client_id))
            .get_results::<retrom::DefaultEmulatorProfile>(&mut conn)
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        Ok(Response::new(retrom::GetDefaultEmulatorProfilesResponse {
            default_profiles,
        }))
    }

    async fn update_default_emulator_profiles(
        &self,
        request: Request<retrom::UpdateDefaultEmulatorProfilesRequest>,
    ) -> Result<Response<retrom::UpdateDefaultEmulatorProfilesResponse>, Status> {
        let default_profiles = request.into_inner().default_profiles;

        let mut conn = self
            .db_pool
            .get()
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        let default_profiles_updated =
            diesel::insert_into(schema::default_emulator_profiles::table)
                .values(&default_profiles)
                .on_conflict((
                    schema::default_emulator_profiles::platform_id,
                    schema::default_emulator_profiles::client_id,
                ))
                .do_update()
                .set(
                    schema::default_emulator_profiles::emulator_profile_id.eq(excluded(
                        schema::default_emulator_profiles::emulator_profile_id,
                    )),
                )
                .get_results(&mut conn)
                .await
                .map_err(|why| Status::internal(why.to_string()))?;

        Ok(Response::new(
            retrom::UpdateDefaultEmulatorProfilesResponse {
                default_profiles_updated,
            },
        ))
    }

    async fn delete_default_emulator_profiles(
        &self,
        request: Request<retrom::DeleteDefaultEmulatorProfilesRequest>,
    ) -> Result<Response<retrom::DeleteDefaultEmulatorProfilesResponse>, Status> {
        let platform_ids = request.into_inner().platform_ids;

        let mut conn = self
            .db_pool
            .get()
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        let default_profiles_deleted = diesel::delete(schema::default_emulator_profiles::table)
            .filter(schema::default_emulator_profiles::platform_id.eq_any(platform_ids))
            .get_results::<retrom::DefaultEmulatorProfile>(&mut conn)
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        Ok(Response::new(
            retrom::DeleteDefaultEmulatorProfilesResponse {
                default_profiles_deleted,
            },
        ))
    }

    async fn create_local_emulator_configs(
        &self,
        request: Request<retrom::CreateLocalEmulatorConfigsRequest>,
    ) -> Result<Response<retrom::CreateLocalEmulatorConfigsResponse>, Status> {
        let configs = request.into_inner().configs;

        let mut conn = self
            .db_pool
            .get()
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        let configs_created = diesel::insert_into(schema::local_emulator_configs::table)
            .values(&configs)
            .get_results::<retrom::LocalEmulatorConfig>(&mut conn)
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        Ok(Response::new(retrom::CreateLocalEmulatorConfigsResponse {
            configs_created,
        }))
    }

    async fn get_local_emulator_configs(
        &self,
        request: Request<retrom::GetLocalEmulatorConfigsRequest>,
    ) -> Result<Response<retrom::GetLocalEmulatorConfigsResponse>, Status> {
        let request = request.into_inner();
        let emulator_ids = request.emulator_ids;
        let client_id = request.client_id;

        let mut conn = self
            .db_pool
            .get()
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        let mut query = schema::local_emulator_configs::table
            .into_boxed()
            .select(retrom::LocalEmulatorConfig::as_select());

        if !emulator_ids.is_empty() {
            query = query.filter(schema::local_emulator_configs::emulator_id.eq_any(emulator_ids));
        }

        query = query.filter(schema::local_emulator_configs::client_id.eq(client_id));

        let local_emulator_configs = query
            .get_results::<retrom::LocalEmulatorConfig>(&mut conn)
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        Ok(Response::new(retrom::GetLocalEmulatorConfigsResponse {
            configs: local_emulator_configs,
        }))
    }

    async fn update_local_emulator_configs(
        &self,
        request: Request<retrom::UpdateLocalEmulatorConfigsRequest>,
    ) -> Result<Response<retrom::UpdateLocalEmulatorConfigsResponse>, Status> {
        let configs = request.into_inner().configs;

        let mut conn = self
            .db_pool
            .get()
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        let mut configs_updated = vec![];

        for config in configs {
            let updated_config = diesel::update(schema::local_emulator_configs::table)
                .filter(schema::local_emulator_configs::id.eq(config.id))
                .set(&config)
                .get_result::<retrom::LocalEmulatorConfig>(&mut conn)
                .await
                .map_err(|why| Status::internal(why.to_string()))?;

            configs_updated.push(updated_config);
        }

        Ok(Response::new(retrom::UpdateLocalEmulatorConfigsResponse {
            configs_updated,
        }))
    }

    async fn delete_local_emulator_configs(
        &self,
        request: Request<retrom::DeleteLocalEmulatorConfigsRequest>,
    ) -> Result<Response<retrom::DeleteLocalEmulatorConfigsResponse>, Status> {
        let ids = request.into_inner().ids;

        let mut conn = self
            .db_pool
            .get()
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        let configs_deleted = diesel::delete(schema::local_emulator_configs::table)
            .filter(schema::local_emulator_configs::id.eq_any(ids))
            .get_results::<retrom::LocalEmulatorConfig>(&mut conn)
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        Ok(Response::new(retrom::DeleteLocalEmulatorConfigsResponse {
            configs_deleted,
        }))
    }
}

#[tonic::async_trait]
impl EmulatorServiceV1 for EmulatorServiceHandlers {
    async fn create_emulators(
        &self,
        request: Request<retrom::CreateEmulatorsRequest>,
    ) -> Result<Response<retrom::CreateEmulatorsResponse>, Status> {
        <Self as EmulatorService>::create_emulators(self, request).await
    }

    async fn get_emulators(
        &self,
        request: Request<retrom::GetEmulatorsRequest>,
    ) -> Result<Response<retrom::GetEmulatorsResponse>, Status> {
        let request = request.into_inner();
        let ids = &request.ids;
        let supported_platform_ids = &request.supported_platform_ids;

        let mut conn = self
            .db_pool
            .get()
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        let mut emulator_query = schema::emulators::table
            .into_boxed()
            .select(retrom::Emulator::as_select());

        if !ids.is_empty() {
            emulator_query = emulator_query.filter(schema::emulators::id.eq_any(ids));
        }

        if !supported_platform_ids.is_empty() {
            let emulator_ids_with_platform = schema::emulator_platform_maps::table
                .filter(
                    schema::emulator_platform_maps::platform_id
                        .eq_any(supported_platform_ids.as_slice()),
                )
                .select(schema::emulator_platform_maps::emulator_id)
                .load::<i32>(&mut conn)
                .await
                .map_err(|why| Status::internal(why.to_string()))?;

            emulator_query =
                emulator_query.filter(schema::emulators::id.eq_any(emulator_ids_with_platform));
        }

        let mut emulators = emulator_query
            .load::<Emulator>(&mut conn)
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        let emulator_ids: Vec<i32> = emulators.iter().map(|e| e.id).collect();

        let platform_maps = schema::emulator_platform_maps::table
            .filter(schema::emulator_platform_maps::emulator_id.eq_any(&emulator_ids))
            .load::<EmulatorPlatformMap>(&mut conn)
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        let mut maps_by_emulator: HashMap<i32, Vec<i32>> = HashMap::new();
        for map in platform_maps {
            maps_by_emulator
                .entry(map.emulator_id)
                .or_default()
                .push(map.platform_id);
        }

        for emulator in &mut emulators {
            emulator.supported_platforms =
                maps_by_emulator.remove(&emulator.id).unwrap_or_default();
        }

        Ok(Response::new(retrom::GetEmulatorsResponse { emulators }))
    }

    async fn update_emulators(
        &self,
        request: Request<retrom::UpdateEmulatorsRequest>,
    ) -> Result<Response<retrom::UpdateEmulatorsResponse>, Status> {
        let emulators = request.into_inner().emulators;

        let mut conn = self
            .db_pool
            .get()
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        let mut emulators_updated = vec![];

        for emulator in emulators {
            let updated_emulator = diesel::update(schema::emulators::table)
                .filter(schema::emulators::id.eq(emulator.id))
                .set(&emulator)
                .get_result::<Emulator>(&mut conn)
                .await
                .map_err(|why| Status::internal(why.to_string()))?;

            emulators_updated.push(updated_emulator);
        }

        Ok(Response::new(retrom::UpdateEmulatorsResponse {
            emulators_updated,
        }))
    }

    async fn delete_emulators(
        &self,
        request: Request<retrom::DeleteEmulatorsRequest>,
    ) -> Result<Response<retrom::DeleteEmulatorsResponse>, Status> {
        <Self as EmulatorService>::delete_emulators(self, request).await
    }

    async fn create_emulator_profiles(
        &self,
        request: Request<retrom::CreateEmulatorProfilesRequest>,
    ) -> Result<Response<retrom::CreateEmulatorProfilesResponse>, Status> {
        <Self as EmulatorService>::create_emulator_profiles(self, request).await
    }

    async fn get_emulator_profiles(
        &self,
        request: Request<retrom::GetEmulatorProfilesRequest>,
    ) -> Result<Response<retrom::GetEmulatorProfilesResponse>, Status> {
        <Self as EmulatorService>::get_emulator_profiles(self, request).await
    }

    async fn update_emulator_profiles(
        &self,
        request: Request<retrom::UpdateEmulatorProfilesRequest>,
    ) -> Result<Response<retrom::UpdateEmulatorProfilesResponse>, Status> {
        <Self as EmulatorService>::update_emulator_profiles(self, request).await
    }

    async fn delete_emulator_profiles(
        &self,
        request: Request<retrom::DeleteEmulatorProfilesRequest>,
    ) -> Result<Response<retrom::DeleteEmulatorProfilesResponse>, Status> {
        <Self as EmulatorService>::delete_emulator_profiles(self, request).await
    }

    async fn get_default_emulator_profiles(
        &self,
        request: Request<retrom::GetDefaultEmulatorProfilesRequest>,
    ) -> Result<Response<retrom::GetDefaultEmulatorProfilesResponse>, Status> {
        <Self as EmulatorService>::get_default_emulator_profiles(self, request).await
    }

    async fn update_default_emulator_profiles(
        &self,
        request: Request<retrom::UpdateDefaultEmulatorProfilesRequest>,
    ) -> Result<Response<retrom::UpdateDefaultEmulatorProfilesResponse>, Status> {
        <Self as EmulatorService>::update_default_emulator_profiles(self, request).await
    }

    async fn delete_default_emulator_profiles(
        &self,
        request: Request<retrom::DeleteDefaultEmulatorProfilesRequest>,
    ) -> Result<Response<retrom::DeleteDefaultEmulatorProfilesResponse>, Status> {
        <Self as EmulatorService>::delete_default_emulator_profiles(self, request).await
    }

    async fn create_local_emulator_configs(
        &self,
        request: Request<retrom::CreateLocalEmulatorConfigsRequest>,
    ) -> Result<Response<retrom::CreateLocalEmulatorConfigsResponse>, Status> {
        <Self as EmulatorService>::create_local_emulator_configs(self, request).await
    }

    async fn get_local_emulator_configs(
        &self,
        request: Request<retrom::GetLocalEmulatorConfigsRequest>,
    ) -> Result<Response<retrom::GetLocalEmulatorConfigsResponse>, Status> {
        <Self as EmulatorService>::get_local_emulator_configs(self, request).await
    }

    async fn update_local_emulator_configs(
        &self,
        request: Request<retrom::UpdateLocalEmulatorConfigsRequest>,
    ) -> Result<Response<retrom::UpdateLocalEmulatorConfigsResponse>, Status> {
        <Self as EmulatorService>::update_local_emulator_configs(self, request).await
    }

    async fn delete_local_emulator_configs(
        &self,
        request: Request<retrom::DeleteLocalEmulatorConfigsRequest>,
    ) -> Result<Response<retrom::DeleteLocalEmulatorConfigsResponse>, Status> {
        <Self as EmulatorService>::delete_local_emulator_configs(self, request).await
    }

    async fn get_emulator_platform_maps(
        &self,
        request: Request<GetEmulatorPlatformMapsRequest>,
    ) -> Result<Response<GetEmulatorPlatformMapsResponse>, Status> {
        let request = request.into_inner();
        let emulator_ids = request.emulator_ids;
        let platform_ids = request.platform_ids;

        let mut conn = self
            .db_pool
            .get()
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        let mut query = schema::emulator_platform_maps::table
            .into_boxed()
            .select(EmulatorPlatformMap::as_select());

        if !emulator_ids.is_empty() {
            query = query.filter(schema::emulator_platform_maps::emulator_id.eq_any(&emulator_ids));
        }

        if !platform_ids.is_empty() {
            query = query.filter(schema::emulator_platform_maps::platform_id.eq_any(&platform_ids));
        }

        let emulator_platform_maps = query
            .load::<EmulatorPlatformMap>(&mut conn)
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        Ok(Response::new(GetEmulatorPlatformMapsResponse {
            emulator_platform_maps,
        }))
    }

    async fn update_emulator_platform_maps(
        &self,
        request: Request<UpdateEmulatorPlatformMapsRequest>,
    ) -> Result<Response<UpdateEmulatorPlatformMapsResponse>, Status> {
        let maps = request.into_inner().emulator_platform_maps;

        let mut conn = self
            .db_pool
            .get()
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        let emulator_platform_maps_updated =
            diesel::insert_into(schema::emulator_platform_maps::table)
                .values(&maps)
                .on_conflict((
                    schema::emulator_platform_maps::emulator_id,
                    schema::emulator_platform_maps::platform_id,
                ))
                .do_update()
                .set(schema::emulator_platform_maps::updated_at.eq(diesel::dsl::now))
                .get_results::<EmulatorPlatformMap>(&mut conn)
                .await
                .map_err(|why| Status::internal(why.to_string()))?;

        Ok(Response::new(UpdateEmulatorPlatformMapsResponse {
            emulator_platform_maps_updated,
        }))
    }

    async fn delete_emulator_platform_maps(
        &self,
        request: Request<DeleteEmulatorPlatformMapsRequest>,
    ) -> Result<Response<DeleteEmulatorPlatformMapsResponse>, Status> {
        let request = request.into_inner();
        let emulator_ids = request.emulator_ids;
        let platform_ids = request.platform_ids;

        if emulator_ids.is_empty() && platform_ids.is_empty() {
            return Err(Status::invalid_argument(
                "at least one of emulator_ids or platform_ids must be provided",
            ));
        }

        let mut conn = self
            .db_pool
            .get()
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        let mut query = diesel::delete(schema::emulator_platform_maps::table).into_boxed();

        if !emulator_ids.is_empty() {
            query = query.filter(schema::emulator_platform_maps::emulator_id.eq_any(&emulator_ids));
        }

        if !platform_ids.is_empty() {
            query = query.filter(schema::emulator_platform_maps::platform_id.eq_any(&platform_ids));
        }

        let emulator_platform_maps_deleted = query
            .get_results::<EmulatorPlatformMap>(&mut conn)
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        Ok(Response::new(DeleteEmulatorPlatformMapsResponse {
            emulator_platform_maps_deleted,
        }))
    }
}
