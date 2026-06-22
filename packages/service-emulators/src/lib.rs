use retrom_codegen::retrom::services::emulators::v1::{
    emulator_service_server::EmulatorService, CreateEmulatorProfilesRequest,
    CreateEmulatorProfilesResponse, CreateEmulatorsRequest, CreateEmulatorsResponse,
    CreateLocalEmulatorConfigsRequest, CreateLocalEmulatorConfigsResponse, DefaultEmulatorProfile,
    DeleteDefaultEmulatorProfilesRequest, DeleteDefaultEmulatorProfilesResponse,
    DeleteEmulatorPlatformsRequest, DeleteEmulatorPlatformsResponse, DeleteEmulatorProfilesRequest,
    DeleteEmulatorProfilesResponse, DeleteEmulatorsRequest, DeleteEmulatorsResponse,
    DeleteLocalEmulatorConfigsRequest, DeleteLocalEmulatorConfigsResponse, Emulator,
    EmulatorProfile, GetDefaultEmulatorProfilesRequest, GetDefaultEmulatorProfilesResponse,
    GetEmulatorPlatformsRequest, GetEmulatorPlatformsResponse, GetEmulatorProfilesRequest,
    GetEmulatorProfilesResponse, GetEmulatorsRequest, GetEmulatorsResponse,
    GetLocalEmulatorConfigsRequest, GetLocalEmulatorConfigsResponse,
    UpdateDefaultEmulatorProfilesRequest, UpdateDefaultEmulatorProfilesResponse,
    UpdateEmulatorPlatformsRequest, UpdateEmulatorPlatformsResponse, UpdateEmulatorProfilesRequest,
    UpdateEmulatorProfilesResponse, UpdateEmulatorsRequest, UpdateEmulatorsResponse,
    UpdateLocalEmulatorConfigsRequest, UpdateLocalEmulatorConfigsResponse,
};
use retrom_db::DbPool;
use tonic::{Request, Response, Status};

pub mod router;

#[cfg(test)]
mod tests;

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
    async fn create_emulators(
        &self,
        request: Request<CreateEmulatorsRequest>,
    ) -> Result<Response<CreateEmulatorsResponse>, Status> {
        let request = request.into_inner();
        let emulators = request.emulators;

        if emulators.is_empty() {
            return Err(Status::invalid_argument("emulators list cannot be empty"));
        }

        let mut builder = sqlx::QueryBuilder::new("insert into emulators (id, name, built_in) ");

        builder.push_values(emulators, |mut b, mut emulator| {
            emulator.id = uuid::Uuid::now_v7().to_string();
            emulator.built_in = false;

            b.push_bind(emulator.id)
                .push_bind(emulator.name)
                .push_bind(emulator.built_in);
        });

        builder.push(" returning *");

        let emulators_created: Vec<Emulator> = builder
            .build_query_as()
            .fetch_all(&self.db_pool)
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        let emulator_ids: Vec<String> = emulators_created.iter().map(|e| e.id.clone()).collect();

        let mut builder = sqlx::QueryBuilder::new(
            "insert into emulator_profiles (id, emulator_id, name, custom_args) ",
        );

        builder.push_values(emulator_ids, |mut b, emulator_id| {
            b.push_bind(uuid::Uuid::now_v7().to_string())
                .push_bind(emulator_id)
                .push_bind("Default Profile")
                .push_bind("{file}");
        });

        builder
            .push(" on conflict do nothing ")
            .build()
            .execute(&self.db_pool)
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

        let mut builder = sqlx::QueryBuilder::new("select * from emulators");

        if !ids.is_empty() {
            builder.push(" where id in (");

            let mut separated = builder.separated(", ");
            for id in ids {
                separated.push_bind(id);
            }

            separated.push_unseparated(")");
        }

        if !supported_platform_ids.is_empty() {
            builder.push(if ids.is_empty() { " where " } else { " and " });

            builder.push(
                "id in (select emulator_id from emulator_supported_platforms where platform_id in (",
            );

            let mut separated = builder.separated(", ");
            for platform_id in supported_platform_ids {
                separated.push_bind(platform_id);
            }

            separated.push_unseparated("))");
        }

        let emulators: Vec<Emulator> = builder
            .build_query_as()
            .fetch_all(&self.db_pool)
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        Ok(Response::new(GetEmulatorsResponse { emulators }))
    }

    async fn update_emulators(
        &self,
        request: Request<UpdateEmulatorsRequest>,
    ) -> Result<Response<UpdateEmulatorsResponse>, Status> {
        let emulators = request.into_inner().emulators;

        if emulators.iter().any(|e| e.built_in) {
            return Err(Status::invalid_argument("cannot update built-in emulators"));
        }

        let mut emulators_updated = vec![];

        let mut tx = self
            .db_pool
            .begin()
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        for emulator in &emulators {
            let mut builder = sqlx::QueryBuilder::new("update emulators set ");

            builder
                .push("name = ")
                .push_bind(&emulator.name)
                .push(" where id = ")
                .push_bind(&emulator.id)
                .push(" and built_in = ")
                .push_bind(false);

            builder.push(" returning *");

            let emulator_updated: Emulator = builder
                .build_query_as()
                .fetch_one(&mut *tx)
                .await
                .map_err(|why| Status::internal(why.to_string()))?;

            emulators_updated.push(emulator_updated);
        }

        tx.commit()
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        Ok(Response::new(UpdateEmulatorsResponse { emulators_updated }))
    }

    async fn delete_emulators(
        &self,
        request: Request<DeleteEmulatorsRequest>,
    ) -> Result<Response<DeleteEmulatorsResponse>, Status> {
        let request = request.into_inner();
        let ids = request.ids;

        if ids.is_empty() {
            return Err(Status::invalid_argument("ids list cannot be empty"));
        }

        let mut builder = sqlx::QueryBuilder::new("delete from emulators where id in (");
        let mut separated = builder.separated(", ");
        for id in ids {
            separated.push_bind(id);
        }

        separated.push_unseparated(")");

        builder
            .push(" and built_in = ")
            .push_bind(false)
            .push(" returning *");

        let emulators_deleted: Vec<Emulator> = builder
            .build_query_as()
            .fetch_all(&self.db_pool)
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        Ok(Response::new(DeleteEmulatorsResponse { emulators_deleted }))
    }

    async fn get_emulator_platforms(
        &self,
        request: Request<GetEmulatorPlatformsRequest>,
    ) -> Result<Response<GetEmulatorPlatformsResponse>, Status> {
        let request = request.into_inner();
        let emulator_ids = request.emulator_ids;
        let platform_ids = request.platform_ids;

        let mut builder = sqlx::QueryBuilder::new("select * from emulator_supported_platforms");

        if !emulator_ids.is_empty() {
            builder.push(" where emulator_id in (");

            let mut separated = builder.separated(", ");
            for emulator_id in emulator_ids.iter() {
                separated.push_bind(emulator_id);
            }

            separated.push_unseparated(")");
        }

        if !platform_ids.is_empty() {
            builder.push(if emulator_ids.is_empty() {
                " where "
            } else {
                " and "
            });

            builder.push("platform_id in (");

            let mut separated = builder.separated(", ");
            for platform_id in platform_ids {
                separated.push_bind(platform_id);
            }

            separated.push_unseparated(")");
        }

        let emulator_platforms = builder
            .build_query_as()
            .fetch_all(&self.db_pool)
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        Ok(Response::new(GetEmulatorPlatformsResponse {
            emulator_platforms,
        }))
    }

    async fn update_emulator_platforms(
        &self,
        request: Request<UpdateEmulatorPlatformsRequest>,
    ) -> Result<Response<UpdateEmulatorPlatformsResponse>, Status> {
        let request = request.into_inner();
        let emulator_id = request.emulator_id;
        let platform_ids = request.platform_ids;

        let mut tx = self
            .db_pool
            .begin()
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        let mut builder = sqlx::QueryBuilder::new("delete from emulator_supported_platforms");

        builder
            .push(" where emulator_id = ")
            .push_bind(&emulator_id);

        builder
            .build()
            .execute(&mut *tx)
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        let mut builder = sqlx::QueryBuilder::new("insert into emulator_supported_platforms ");

        builder.push_values(platform_ids, |mut b, platform_id| {
            b.push_bind(&emulator_id).push_bind(platform_id);
        });

        builder.push(" returning *");

        let emulator_platforms = builder
            .build_query_as()
            .fetch_all(&mut *tx)
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        tx.commit()
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        Ok(Response::new(UpdateEmulatorPlatformsResponse {
            emulator_platforms,
        }))
    }

    async fn delete_emulator_platforms(
        &self,
        request: Request<DeleteEmulatorPlatformsRequest>,
    ) -> Result<Response<DeleteEmulatorPlatformsResponse>, Status> {
        let request = request.into_inner();
        let emulator_id = request.emulator_id;
        let platform_ids = request.platform_ids;

        if platform_ids.is_empty() {
            return Err(Status::invalid_argument(
                "platform_ids list cannot be empty",
            ));
        }

        let mut builder = sqlx::QueryBuilder::new("delete from emulator_supported_platforms");

        builder
            .push(" where emulator_id = ")
            .push_bind(&emulator_id)
            .push(" and platform_id in (");

        let mut separated = builder.separated(", ");
        for platform_id in platform_ids {
            separated.push_bind(platform_id);
        }

        separated.push_unseparated(")");

        builder.push(" returning *");

        let emulator_platforms_deleted = builder
            .build_query_as()
            .fetch_all(&self.db_pool)
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        Ok(Response::new(DeleteEmulatorPlatformsResponse {
            emulator_platforms_deleted,
        }))
    }

    async fn create_emulator_profiles(
        &self,
        request: Request<CreateEmulatorProfilesRequest>,
    ) -> Result<Response<CreateEmulatorProfilesResponse>, Status> {
        let request = request.into_inner();
        let profiles = request.profiles;

        let mut builder = sqlx::QueryBuilder::new(
            "insert into emulator_profiles (id, emulator_id, name, custom_args, built_in) ",
        );

        builder.push_values(profiles, |mut b, mut profile| {
            profile.id = uuid::Uuid::now_v7().to_string();
            profile.built_in = false;

            b.push_bind(profile.id)
                .push_bind(profile.emulator_id)
                .push_bind(profile.name)
                .push_bind(profile.custom_args)
                .push_bind(profile.built_in);
        });

        builder.push(" returning *");

        let profiles_created: Vec<EmulatorProfile> = builder
            .build_query_as()
            .fetch_all(&self.db_pool)
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        Ok(Response::new(CreateEmulatorProfilesResponse {
            profiles_created,
        }))
    }

    async fn get_emulator_profiles(
        &self,
        request: Request<GetEmulatorProfilesRequest>,
    ) -> Result<Response<GetEmulatorProfilesResponse>, Status> {
        let request = request.into_inner();
        let ids = request.ids;
        let emulator_ids = request.emulator_ids;

        let mut builder = sqlx::QueryBuilder::new("select * from emulator_profiles");

        if !ids.is_empty() {
            builder.push(" where id in (");

            let mut separated = builder.separated(", ");
            for id in ids.iter() {
                separated.push_bind(id);
            }

            separated.push_unseparated(")");
        }

        if !emulator_ids.is_empty() {
            builder.push(if ids.is_empty() { " where " } else { " and " });

            builder.push("emulator_id in (");

            let mut separated = builder.separated(", ");
            for emulator_id in emulator_ids {
                separated.push_bind(emulator_id);
            }

            separated.push_unseparated(")");
        }

        let profiles: Vec<EmulatorProfile> = builder
            .build_query_as()
            .fetch_all(&self.db_pool)
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        Ok(Response::new(GetEmulatorProfilesResponse { profiles }))
    }

    async fn update_emulator_profiles(
        &self,
        request: Request<UpdateEmulatorProfilesRequest>,
    ) -> Result<Response<UpdateEmulatorProfilesResponse>, Status> {
        let request = request.into_inner();
        let profiles = request.profiles;

        let mut tx = self
            .db_pool
            .begin()
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        let mut profiles_updated = vec![];

        for profile in profiles {
            let mut builder = sqlx::QueryBuilder::new("update emulator_profiles set ");

            builder
                .push("name = ")
                .push_bind(&profile.name)
                .push(", custom_args = ")
                .push_bind(&profile.custom_args)
                .push(" where id = ")
                .push_bind(&profile.id)
                .push(" and built_in = ")
                .push_bind(false)
                .push(" returning *");

            let profile_updated: EmulatorProfile = builder
                .build_query_as()
                .fetch_one(&mut *tx)
                .await
                .map_err(|why| Status::internal(why.to_string()))?;

            profiles_updated.push(profile_updated);
        }

        tx.commit()
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        Ok(Response::new(UpdateEmulatorProfilesResponse {
            profiles_updated,
        }))
    }

    async fn delete_emulator_profiles(
        &self,
        request: Request<DeleteEmulatorProfilesRequest>,
    ) -> Result<Response<DeleteEmulatorProfilesResponse>, Status> {
        let request = request.into_inner();
        let ids = request.ids;

        if ids.is_empty() {
            return Err(Status::invalid_argument("ids list cannot be empty"));
        }

        let mut builder = sqlx::QueryBuilder::new("delete from emulator_profiles where id in (");
        let mut separated = builder.separated(", ");
        for id in ids {
            separated.push_bind(id);
        }

        separated.push_unseparated(")");

        builder
            .push(" and built_in = ")
            .push_bind(false)
            .push(" returning *");

        let profiles_deleted: Vec<EmulatorProfile> = builder
            .build_query_as()
            .fetch_all(&self.db_pool)
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        Ok(Response::new(DeleteEmulatorProfilesResponse {
            profiles_deleted,
        }))
    }

    async fn get_default_emulator_profiles(
        &self,
        request: Request<GetDefaultEmulatorProfilesRequest>,
    ) -> Result<Response<GetDefaultEmulatorProfilesResponse>, Status> {
        let request = request.into_inner();
        let platform_ids = request.platform_ids;
        let client_id = request.client_id;

        if platform_ids.is_empty() {
            return Err(Status::invalid_argument(
                "at least one platform_id must be provided",
            ));
        }

        let mut builder = sqlx::QueryBuilder::new("select * from default_emulator_profiles");

        builder.push(" where client_id = ").push_bind(client_id);

        if !platform_ids.is_empty() {
            builder.push(" and platform_id in (");
            let mut separated = builder.separated(", ");

            for platform_id in platform_ids {
                separated.push_bind(platform_id);
            }

            separated.push_unseparated(")");
        }

        let default_profiles: Vec<DefaultEmulatorProfile> = builder
            .build_query_as()
            .fetch_all(&self.db_pool)
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        Ok(Response::new(GetDefaultEmulatorProfilesResponse {
            default_profiles,
        }))
    }

    async fn update_default_emulator_profiles(
        &self,
        request: Request<UpdateDefaultEmulatorProfilesRequest>,
    ) -> Result<Response<UpdateDefaultEmulatorProfilesResponse>, Status> {
        let request = request.into_inner();
        let default_profiles = request.default_profiles;

        let mut tx = self
            .db_pool
            .begin()
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        let mut default_profiles_updated = vec![];

        for default_profile in default_profiles {
            let mut builder = sqlx::QueryBuilder::new("update default_emulator_profiles set ");

            builder
                .push("emulator_profile_id = ")
                .push_bind(&default_profile.emulator_profile_id)
                .push(" where platform_id = ")
                .push_bind(&default_profile.platform_id)
                .push(" and client_id = ")
                .push_bind(&default_profile.client_id)
                .push(" returning *");

            let default_profile_updated: DefaultEmulatorProfile = builder
                .build_query_as()
                .fetch_one(&mut *tx)
                .await
                .map_err(|why| Status::internal(why.to_string()))?;

            default_profiles_updated.push(default_profile_updated);
        }

        tx.commit()
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        Ok(Response::new(UpdateDefaultEmulatorProfilesResponse {
            default_profiles_updated,
        }))
    }

    async fn delete_default_emulator_profiles(
        &self,
        request: Request<DeleteDefaultEmulatorProfilesRequest>,
    ) -> Result<Response<DeleteDefaultEmulatorProfilesResponse>, Status> {
        let request = request.into_inner();
        let platform_ids = request.platform_ids;
        let client_id = request.client_id;

        if platform_ids.is_empty() {
            return Err(Status::invalid_argument(
                "at least one platform_id must be provided",
            ));
        }

        let mut builder = sqlx::QueryBuilder::new("delete from default_emulator_profiles where ");

        builder.push("client_id = ").push_bind(client_id);
        builder.push(" and platform_id in (");
        let mut separated = builder.separated(", ");

        for platform_id in platform_ids {
            separated.push_bind(platform_id);
        }

        separated.push_unseparated(")");
        builder.push(" returning *");

        let default_profiles_deleted: Vec<DefaultEmulatorProfile> = builder
            .build_query_as()
            .fetch_all(&self.db_pool)
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        Ok(Response::new(DeleteDefaultEmulatorProfilesResponse {
            default_profiles_deleted,
        }))
    }

    async fn create_local_emulator_configs(
        &self,
        request: Request<CreateLocalEmulatorConfigsRequest>,
    ) -> Result<Response<CreateLocalEmulatorConfigsResponse>, Status> {
        let request = request.into_inner();
        let configs = request.configs;

        if configs.is_empty() {
            return Err(Status::invalid_argument("configs list cannot be empty"));
        }

        let mut builder = sqlx::QueryBuilder::new("insert into local_emulator_configs");

        builder.push(
            r#"
            (id,
            emulator_id,
            client_id,
            executable_path,
            nickname,
            save_data_path,
            save_states_path,
            bios_directory,
            extra_files_directory)
        "#,
        );

        builder.push_values(configs, |mut b, mut config| {
            config.id = uuid::Uuid::now_v7().to_string();

            b.push_bind(config.id)
                .push_bind(config.emulator_id)
                .push_bind(config.client_id)
                .push_bind(config.executable_path)
                .push_bind(config.nickname)
                .push_bind(config.save_data_path)
                .push_bind(config.save_states_path)
                .push_bind(config.bios_directory)
                .push_bind(config.extra_files_directory);
        });

        builder.push(" returning *");

        let configs_created = builder
            .build_query_as()
            .fetch_all(&self.db_pool)
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        Ok(Response::new(CreateLocalEmulatorConfigsResponse {
            configs_created,
        }))
    }

    async fn get_local_emulator_configs(
        &self,
        request: Request<GetLocalEmulatorConfigsRequest>,
    ) -> Result<Response<GetLocalEmulatorConfigsResponse>, Status> {
        let request = request.into_inner();
        let emulator_ids = request.emulator_ids;
        let client_id = request.client_id;

        let mut builder = sqlx::QueryBuilder::new("select * from local_emulator_configs ");

        builder.push("where client_id = ").push_bind(client_id);

        if !emulator_ids.is_empty() {
            builder.push(" and emulator_id in (");
            let mut separated = builder.separated(", ");

            for emulator_id in emulator_ids {
                separated.push_bind(emulator_id);
            }

            separated.push_unseparated(")");
        }

        let configs = builder
            .build_query_as()
            .fetch_all(&self.db_pool)
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        Ok(Response::new(GetLocalEmulatorConfigsResponse { configs }))
    }

    async fn update_local_emulator_configs(
        &self,
        request: Request<UpdateLocalEmulatorConfigsRequest>,
    ) -> Result<Response<UpdateLocalEmulatorConfigsResponse>, Status> {
        let request = request.into_inner();
        let configs = request.configs;

        let mut tx = self
            .db_pool
            .begin()
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        let mut configs_updated = vec![];

        for config in configs {
            let mut builder = sqlx::QueryBuilder::new("update local_emulator_configs set ");

            builder
                .push("executable_path = ")
                .push_bind(&config.executable_path)
                .push(", nickname = ")
                .push_bind(&config.nickname)
                .push(", save_data_path = ")
                .push_bind(&config.save_data_path)
                .push(", save_states_path = ")
                .push_bind(&config.save_states_path)
                .push(", bios_directory = ")
                .push_bind(&config.bios_directory)
                .push(", extra_files_directory = ")
                .push_bind(&config.extra_files_directory)
                .push(" where id = ")
                .push_bind(&config.id)
                .push(" returning *");

            let config_updated = builder
                .build_query_as()
                .fetch_one(&mut *tx)
                .await
                .map_err(|why| Status::internal(why.to_string()))?;

            configs_updated.push(config_updated);
        }

        tx.commit()
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        Ok(Response::new(UpdateLocalEmulatorConfigsResponse {
            configs_updated,
        }))
    }

    async fn delete_local_emulator_configs(
        &self,
        request: Request<DeleteLocalEmulatorConfigsRequest>,
    ) -> Result<Response<DeleteLocalEmulatorConfigsResponse>, Status> {
        let request = request.into_inner();
        let ids = request.ids;

        if ids.is_empty() {
            return Err(Status::invalid_argument("ids list cannot be empty"));
        }

        let mut builder =
            sqlx::QueryBuilder::new("delete from local_emulator_configs where id in (");

        let mut separated = builder.separated(", ");
        for id in ids {
            separated.push_bind(id);
        }

        separated.push_unseparated(")");
        builder.push(" returning *");

        let configs_deleted = builder
            .build_query_as()
            .fetch_all(&self.db_pool)
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        Ok(Response::new(DeleteLocalEmulatorConfigsResponse {
            configs_deleted,
        }))
    }
}
