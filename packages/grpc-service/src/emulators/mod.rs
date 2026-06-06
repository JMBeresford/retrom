use diesel::{prelude::*, upsert::excluded};
use diesel_async::RunQueryDsl;
use retrom_codegen::retrom::{
    self, emulator_service_server::EmulatorService, CreateEmulatorsRequest,
    CreateEmulatorsResponse, DefaultEmulatorProfile, DeleteEmulatorsRequest,
    DeleteEmulatorsResponse, Emulator, GetEmulatorsRequest, GetEmulatorsResponse,
    UpdateEmulatorsRequest, UpdateEmulatorsResponse,
};
use retrom_db::{schema, Pool};
use std::sync::Arc;
use tonic::{Request, Response, Status};

pub struct EmulatorServiceHandlers {
    db_pool: Arc<Pool>,
}

impl EmulatorServiceHandlers {
    pub fn new(db_pool: Arc<Pool>) -> Self {
        Self { db_pool }
    }
}

fn normalize_name(name: &str) -> String {
    name.trim().to_lowercase()
}

fn profile_conflict_message(
    profile_name: &str,
    emulator_id: i32,
    emulators: &[Emulator],
) -> String {
    match emulators.iter().find(|emulator| emulator.id == emulator_id) {
        Some(emulator) => format!(
            "A profile named \"{}\" already exists for {}.",
            profile_name.trim(),
            emulator.name
        ),
        None => format!(
            "A profile named \"{}\" already exists for that emulator.",
            profile_name.trim()
        ),
    }
}

fn validate_unique_emulator_names(
    emulators_to_validate: &[(Option<i32>, String)],
    existing_emulators: &[Emulator],
) -> Result<(), Status> {
    let mut seen = vec![];

    for (id, name) in emulators_to_validate {
        let trimmed = name.trim();
        if trimmed.is_empty() {
            return Err(Status::invalid_argument("Emulator names cannot be empty."));
        }

        let normalized = normalize_name(trimmed);

        if seen.iter().any(|(seen_id, seen_name)| {
            seen_name == &normalized && seen_id != id
        }) {
            return Err(Status::invalid_argument(format!(
                "An emulator named \"{}\" already exists.",
                trimmed
            )));
        }

        if let Some(conflict) = existing_emulators.iter().find(|emulator| {
            normalize_name(&emulator.name) == normalized && Some(emulator.id) != *id
        }) {
            return Err(Status::invalid_argument(format!(
                "An emulator named \"{}\" already exists.",
                conflict.name
            )));
        }

        seen.push((*id, normalized));
    }

    Ok(())
}

fn validate_unique_profile_names(
    profiles_to_validate: &[(Option<i32>, i32, String)],
    existing_profiles: &[retrom::EmulatorProfile],
    emulators: &[Emulator],
) -> Result<(), Status> {
    let mut seen = vec![];

    for (id, emulator_id, name) in profiles_to_validate {
        let trimmed = name.trim();
        if trimmed.is_empty() {
            return Err(Status::invalid_argument("Profile names cannot be empty."));
        }

        let normalized = normalize_name(trimmed);

        if seen.iter().any(|(seen_id, seen_emulator_id, seen_name)| {
            seen_emulator_id == emulator_id && seen_name == &normalized && seen_id != id
        }) {
            return Err(Status::invalid_argument(profile_conflict_message(
                trimmed,
                *emulator_id,
                emulators,
            )));
        }

        if existing_profiles.iter().any(|profile| {
            profile.emulator_id == *emulator_id
                && normalize_name(&profile.name) == normalized
                && Some(profile.id) != *id
        }) {
            return Err(Status::invalid_argument(profile_conflict_message(
                trimmed,
                *emulator_id,
                emulators,
            )));
        }

        seen.push((*id, *emulator_id, normalized));
    }

    Ok(())
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

        let existing_emulators = schema::emulators::table
            .select(Emulator::as_select())
            .load(&mut conn)
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        let emulators_to_validate = emulators
            .iter()
            .map(|emulator| (None, emulator.name.clone()))
            .collect::<Vec<_>>();

        validate_unique_emulator_names(&emulators_to_validate, &existing_emulators)?;

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

        let existing_emulators = schema::emulators::table
            .select(Emulator::as_select())
            .load(&mut conn)
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        let emulators_to_validate = emulators
            .iter()
            .map(|emulator| {
                let current_emulator = existing_emulators
                    .iter()
                    .find(|current| current.id == emulator.id)
                    .ok_or_else(|| Status::not_found("Emulator not found"))?;

                Ok((
                    Some(emulator.id),
                    emulator
                        .name
                        .clone()
                        .unwrap_or_else(|| current_emulator.name.clone()),
                ))
            })
            .collect::<Result<Vec<_>, Status>>()?;

        validate_unique_emulator_names(&emulators_to_validate, &existing_emulators)?;

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

        let emulator_ids = profiles.iter().map(|profile| profile.emulator_id).collect::<Vec<_>>();

        let existing_profiles = schema::emulator_profiles::table
            .filter(schema::emulator_profiles::emulator_id.eq_any(&emulator_ids))
            .select(retrom::EmulatorProfile::as_select())
            .load(&mut conn)
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        let emulators = schema::emulators::table
            .filter(schema::emulators::id.eq_any(&emulator_ids))
            .select(Emulator::as_select())
            .load(&mut conn)
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        let profiles_to_validate = profiles
            .iter()
            .map(|profile| (None, profile.emulator_id, profile.name.clone()))
            .collect::<Vec<_>>();

        validate_unique_profile_names(&profiles_to_validate, &existing_profiles, &emulators)?;

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

        let current_profiles = schema::emulator_profiles::table
            .filter(
                schema::emulator_profiles::id
                    .eq_any(emulator_profiles.iter().map(|profile| profile.id).collect::<Vec<_>>()),
            )
            .select(retrom::EmulatorProfile::as_select())
            .load(&mut conn)
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        let profiles_to_validate = emulator_profiles
            .iter()
            .map(|profile| {
                let current_profile = current_profiles
                    .iter()
                    .find(|current| current.id == profile.id)
                    .ok_or_else(|| Status::not_found("Emulator profile not found"))?;

                Ok((
                    Some(profile.id),
                    profile.emulator_id.unwrap_or(current_profile.emulator_id),
                    profile
                        .name
                        .clone()
                        .unwrap_or_else(|| current_profile.name.clone()),
                ))
            })
            .collect::<Result<Vec<_>, Status>>()?;

        let emulator_ids = profiles_to_validate
            .iter()
            .map(|(_, emulator_id, _)| *emulator_id)
            .collect::<Vec<_>>();

        let existing_profiles = schema::emulator_profiles::table
            .filter(schema::emulator_profiles::emulator_id.eq_any(&emulator_ids))
            .select(retrom::EmulatorProfile::as_select())
            .load(&mut conn)
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        let emulators = schema::emulators::table
            .filter(schema::emulators::id.eq_any(&emulator_ids))
            .select(Emulator::as_select())
            .load(&mut conn)
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        validate_unique_profile_names(&profiles_to_validate, &existing_profiles, &emulators)?;

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
