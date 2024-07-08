use std::sync::Arc;

use diesel::{prelude::*, upsert::excluded};
use diesel_async::RunQueryDsl;
use retrom_codegen::retrom::{
    self, emulator_service_server::EmulatorService, CreateEmulatorsRequest,
    CreateEmulatorsResponse, DefaultEmulatorProfile, DeleteEmulatorsRequest,
    DeleteEmulatorsResponse, Emulator, GetEmulatorsRequest, GetEmulatorsResponse,
    UpdateEmulatorsRequest, UpdateEmulatorsResponse,
};
use retrom_db::{schema, Pool};
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
            .get_results::<Emulator>(&mut conn)
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
                .on_conflict(schema::default_emulator_profiles::platform_id)
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
}
