use futures::future::join_all;
use pbjson_types::Empty;
use retrom_codegen::retrom::services::emulators::v1::{
    emulator::{self},
    emulator_service_server::EmulatorService,
    CreateDefaultEmulatorProfileRequest, CreateEmulatorProfileRequest, CreateEmulatorRequest,
    CreateLocalEmulatorConfigRequest, DefaultEmulatorProfile, DefaultEmulatorProfileRow,
    DeleteDefaultEmulatorProfileRequest, DeleteEmulatorProfileRequest, DeleteEmulatorRequest,
    DeleteLocalEmulatorConfigRequest, Emulator, EmulatorProfile, EmulatorProfileRow, EmulatorRow,
    GetDefaultEmulatorProfileRequest, GetEmulatorProfileRequest, GetEmulatorRequest,
    GetLocalEmulatorConfigRequest, ListDefaultEmulatorProfilesRequest,
    ListDefaultEmulatorProfilesResponse, ListEmulatorProfilesRequest, ListEmulatorProfilesResponse,
    ListEmulatorsRequest, ListEmulatorsResponse, ListLocalEmulatorConfigsRequest,
    ListLocalEmulatorConfigsResponse, LocalEmulatorConfig, LocalEmulatorConfigRow,
    UpdateDefaultEmulatorProfileRequest, UpdateEmulatorProfileRequest, UpdateEmulatorRequest,
    UpdateLocalEmulatorConfigRequest,
};
use retrom_db::DbPool;
use sqlx::QueryBuilder;
use tonic::{Request, Response, Status};
use uuid::Uuid;

pub mod router;

#[cfg(test)]
mod tests;

pub struct EmulatorServiceHandlers {
    pub db_pool: DbPool,
}

impl EmulatorServiceHandlers {
    pub fn new(db_pool: DbPool) -> Self {
        Self { db_pool }
    }
}

fn sqlx_err_to_status(e: sqlx::Error) -> Status {
    match e {
        sqlx::Error::RowNotFound => Status::not_found("Resource not found"),
        _ => Status::internal(e.to_string()),
    }
}

fn os_name_to_enum(name: &str) -> emulator::OperatingSystem {
    match name {
        "Windows" => emulator::OperatingSystem::Windows,
        "MacOS" => emulator::OperatingSystem::Macos,
        "Linux" => emulator::OperatingSystem::Linux,
        "Web" => emulator::OperatingSystem::Web,
        _ => emulator::OperatingSystem::Unspecified,
    }
}

fn enum_to_os_id(os: emulator::OperatingSystem) -> Option<&'static str> {
    match os {
        emulator::OperatingSystem::Windows => Some("00000000-0000-0000-0003-000000000001"), // Windows
        emulator::OperatingSystem::Macos => Some("00000000-0000-0000-0003-000000000002"),   // MacOS
        emulator::OperatingSystem::Linux => Some("00000000-0000-0000-0003-000000000003"),   // Linux
        emulator::OperatingSystem::Web => Some("00000000-0000-0000-0003-000000000004"),     // Web
        emulator::OperatingSystem::Unspecified => None,
    }
}

async fn get_emulator_platforms(
    db_pool: &DbPool,
    emulator_id: &str,
) -> Result<Vec<String>, Status> {
    QueryBuilder::new("select platform from emulator_platforms where emulator = ")
        .push_bind(emulator_id)
        .build_query_scalar()
        .fetch_all(db_pool)
        .await
        .map_err(sqlx_err_to_status)
}

async fn get_emulator_operating_systems(
    db_pool: &DbPool,
    emulator_id: &str,
) -> Result<Vec<emulator::OperatingSystem>, Status> {
    let os_names: Vec<String> = QueryBuilder::new(
        r#"
        select os.name 
        from operating_systems os 
        join emulator_operating_systems eos 
        on eos.operating_system = os.id 
        where eos.emulator = 
        "#,
    )
    .push_bind(emulator_id)
    .build_query_scalar()
    .fetch_all(db_pool)
    .await
    .map_err(sqlx_err_to_status)?;

    Ok(os_names
        .into_iter()
        .map(|name| os_name_to_enum(&name))
        .collect())
}

fn emulator_row_to_emulator(
    row: EmulatorRow,
    platforms: Vec<String>,
    operating_systems: Vec<i32>,
) -> Emulator {
    Emulator {
        id: row.id,
        name: row.name,
        created_at: row.created_at,
        updated_at: row.updated_at,
        built_in: row.built_in,
        libretro_name: row.libretro_name,
        platforms,
        operating_systems,
    }
}

async fn get_profile_extensions(db_pool: &DbPool, profile_id: &str) -> Result<Vec<String>, Status> {
    QueryBuilder::new("select extension from emulator_profile_extensions where emulator_profile = ")
        .push_bind(profile_id)
        .build_query_scalar()
        .fetch_all(db_pool)
        .await
        .map_err(sqlx_err_to_status)
}

fn profile_row_to_profile(
    row: EmulatorProfileRow,
    supported_extensions: Vec<String>,
) -> EmulatorProfile {
    EmulatorProfile {
        id: row.id,
        emulator: row.emulator,
        name: row.name,
        custom_args: row.custom_args,
        built_in: row.built_in,
        created_at: row.created_at,
        updated_at: row.updated_at,
        supported_extensions,
    }
}

#[tonic::async_trait]
impl EmulatorService for EmulatorServiceHandlers {
    async fn get_emulator(
        &self,
        request: Request<GetEmulatorRequest>,
    ) -> Result<Response<Emulator>, Status> {
        let id = request.into_inner().id;

        if id.is_empty() {
            return Err(Status::invalid_argument("Emulator ID must be provided"));
        }

        let row: EmulatorRow = QueryBuilder::new("select * from emulators where id = ")
            .push_bind(&id)
            .build_query_as()
            .fetch_one(&self.db_pool)
            .await
            .map_err(sqlx_err_to_status)?;

        let platforms = get_emulator_platforms(&self.db_pool, &id).await?;
        let operating_systems = get_emulator_operating_systems(&self.db_pool, &id)
            .await?
            .into_iter()
            .map(i32::from)
            .collect();

        Ok(Response::new(emulator_row_to_emulator(
            row,
            platforms,
            operating_systems,
        )))
    }

    async fn list_emulators(
        &self,
        request: Request<ListEmulatorsRequest>,
    ) -> Result<Response<ListEmulatorsResponse>, Status> {
        let req = request.into_inner();
        let ids = req.ids;
        let supported_platform_ids = req.supported_platform_ids;

        let mut query_builder = QueryBuilder::new("select distinct e.id from emulators e");

        if !supported_platform_ids.is_empty() {
            query_builder.push(" join emulator_platforms ep on ep.emulator = e.id ");
        }

        query_builder.push(" where e.id is not null ");

        if !supported_platform_ids.is_empty() {
            query_builder.push(" and ep.platform in (");
            let mut separated = query_builder.separated(", ");
            for platform_id in &supported_platform_ids {
                separated.push_bind(platform_id);
            }
            separated.push_unseparated(")");
        }
        if !ids.is_empty() {
            query_builder.push(" and e.id in (");
            let mut separated = query_builder.separated(", ");
            for id in &ids {
                separated.push_bind(id);
            }
            separated.push_unseparated(")");
        }

        let emulator_ids: Vec<String> = query_builder
            .build_query_scalar()
            .fetch_all(&self.db_pool)
            .await
            .map_err(sqlx_err_to_status)?;

        let platforms_futures: Vec<_> = emulator_ids
            .iter()
            .map(|id| {
                let db_pool = self.db_pool.clone();
                let id = id.clone();
                async move { get_emulator_platforms(&db_pool, &id).await.map(|p| (id, p)) }
            })
            .collect();

        let emulators_with_platforms = join_all(platforms_futures)
            .await
            .into_iter()
            .collect::<Result<Vec<(String, Vec<String>)>, Status>>()?;

        let mut result = vec![];
        for (emulator_id, platforms) in emulators_with_platforms {
            let row: EmulatorRow = QueryBuilder::new("select * from emulators where id = ")
                .push_bind(&emulator_id)
                .build_query_as()
                .fetch_one(&self.db_pool)
                .await
                .map_err(sqlx_err_to_status)?;

            let operating_systems = get_emulator_operating_systems(&self.db_pool, &emulator_id)
                .await?
                .into_iter()
                .map(i32::from)
                .collect();

            result.push(emulator_row_to_emulator(row, platforms, operating_systems));
        }

        Ok(Response::new(ListEmulatorsResponse { emulators: result }))
    }

    async fn create_emulator(
        &self,
        request: Request<CreateEmulatorRequest>,
    ) -> Result<Response<Emulator>, Status> {
        let emulator = request
            .into_inner()
            .emulator
            .ok_or_else(|| Status::invalid_argument("Emulator must be provided"))?;

        if emulator.name.is_empty() {
            return Err(Status::invalid_argument("Emulator name must be provided"));
        }

        let emulator_id = Uuid::now_v7().to_string();

        let mut tx = self.db_pool.begin().await.map_err(sqlx_err_to_status)?;

        let row: EmulatorRow =
            QueryBuilder::new("insert into emulators (id, name, built_in) values (")
                .push_bind(&emulator_id)
                .push(", ")
                .push_bind(&emulator.name)
                .push(", ")
                .push_bind(false)
                .push(") returning *")
                .build_query_as()
                .fetch_one(&mut *tx)
                .await
                .map_err(sqlx_err_to_status)?;

        if !emulator.platforms.is_empty() {
            QueryBuilder::new("insert into emulator_platforms (emulator, platform) ")
                .push_values(&emulator.platforms, |mut b, platform_id| {
                    b.push_bind(&emulator_id);
                    b.push_bind(platform_id);
                })
                .build()
                .execute(&mut *tx)
                .await
                .map_err(sqlx_err_to_status)?;
        }

        let os_ids: Vec<&str> = emulator
            .operating_systems
            .iter()
            .filter_map(|os| emulator::OperatingSystem::try_from(*os).ok())
            .filter_map(enum_to_os_id)
            .collect();

        if !os_ids.is_empty() {
            QueryBuilder::new(
                "insert into emulator_operating_systems (emulator, operating_system) ",
            )
            .push_values(&os_ids, |mut b, os_id| {
                b.push_bind(&emulator_id);
                b.push_bind(os_id);
            })
            .build()
            .execute(&mut *tx)
            .await
            .map_err(sqlx_err_to_status)?;
        }

        tx.commit().await.map_err(sqlx_err_to_status)?;

        Ok(Response::new(emulator_row_to_emulator(
            row,
            emulator.platforms,
            emulator.operating_systems,
        )))
    }

    async fn update_emulator(
        &self,
        request: Request<UpdateEmulatorRequest>,
    ) -> Result<Response<Emulator>, Status> {
        let emulator = request
            .into_inner()
            .emulator
            .ok_or_else(|| Status::invalid_argument("Emulator must be provided"))?;

        if emulator.id.is_empty() {
            return Err(Status::invalid_argument("Emulator ID must be provided"));
        }

        if emulator.name.is_empty() {
            return Err(Status::invalid_argument("Emulator name must be provided"));
        }

        let mut tx = self.db_pool.begin().await.map_err(sqlx_err_to_status)?;

        let row: EmulatorRow = QueryBuilder::new("update emulators set name = ")
            .push_bind(&emulator.name)
            .push(" where id = ")
            .push_bind(&emulator.id)
            .push(" returning *")
            .build_query_as()
            .fetch_one(&mut *tx)
            .await
            .map_err(sqlx_err_to_status)?;

        // Delete existing platforms and operating systems
        QueryBuilder::new("delete from emulator_platforms where emulator = ")
            .push_bind(&emulator.id)
            .build()
            .execute(&mut *tx)
            .await
            .map_err(sqlx_err_to_status)?;

        QueryBuilder::new("delete from emulator_operating_systems where emulator = ")
            .push_bind(&emulator.id)
            .build()
            .execute(&mut *tx)
            .await
            .map_err(sqlx_err_to_status)?;

        // Insert new platforms and operating systems
        if !emulator.platforms.is_empty() {
            QueryBuilder::new("insert into emulator_platforms (emulator, platform) ")
                .push_values(&emulator.platforms, |mut b, platform_id| {
                    b.push_bind(&emulator.id);
                    b.push_bind(platform_id);
                })
                .build()
                .execute(&mut *tx)
                .await
                .map_err(sqlx_err_to_status)?;
        }

        let os_ids: Vec<&str> = emulator
            .operating_systems
            .iter()
            .filter_map(|os| emulator::OperatingSystem::try_from(*os).ok())
            .filter_map(enum_to_os_id)
            .collect();

        if !os_ids.is_empty() {
            QueryBuilder::new(
                "insert into emulator_operating_systems (emulator, operating_system) ",
            )
            .push_values(&os_ids, |mut b, os_id| {
                b.push_bind(&emulator.id);
                b.push_bind(os_id);
            })
            .build()
            .execute(&mut *tx)
            .await
            .map_err(sqlx_err_to_status)?;
        }

        tx.commit().await.map_err(sqlx_err_to_status)?;

        Ok(Response::new(emulator_row_to_emulator(
            row,
            emulator.platforms,
            emulator.operating_systems,
        )))
    }

    async fn delete_emulator(
        &self,
        request: Request<DeleteEmulatorRequest>,
    ) -> Result<Response<Empty>, Status> {
        let id = request.into_inner().id;

        if id.is_empty() {
            return Err(Status::invalid_argument("Emulator ID must be provided"));
        }

        QueryBuilder::new("delete from emulators where id = ")
            .push_bind(&id)
            .push(" and built_in = ")
            .push_bind(false)
            .build()
            .execute(&self.db_pool)
            .await
            .map_err(sqlx_err_to_status)?;

        Ok(Response::new(Empty {}))
    }

    async fn get_emulator_profile(
        &self,
        request: Request<GetEmulatorProfileRequest>,
    ) -> Result<Response<EmulatorProfile>, Status> {
        let id = request.into_inner().id;

        if id.is_empty() {
            return Err(Status::invalid_argument(
                "Emulator profile ID must be provided",
            ));
        }

        let row: EmulatorProfileRow =
            QueryBuilder::new("select * from emulator_profiles where id = ")
                .push_bind(&id)
                .build_query_as()
                .fetch_one(&self.db_pool)
                .await
                .map_err(sqlx_err_to_status)?;

        let supported_extensions = get_profile_extensions(&self.db_pool, &id).await?;

        Ok(Response::new(profile_row_to_profile(
            row,
            supported_extensions,
        )))
    }

    async fn list_emulator_profiles(
        &self,
        request: Request<ListEmulatorProfilesRequest>,
    ) -> Result<Response<ListEmulatorProfilesResponse>, Status> {
        let req = request.into_inner();
        let ids = req.ids;
        let emulator_ids = req.emulator_ids;

        let mut query_builder = QueryBuilder::new("select id from emulator_profiles");
        query_builder.push(" where id is not null ");

        if !ids.is_empty() {
            query_builder.push(" and id in (");
            let mut separated = query_builder.separated(", ");
            for id in &ids {
                separated.push_bind(id);
            }
            separated.push_unseparated(")");
        }

        if !emulator_ids.is_empty() {
            query_builder.push(" and emulator in (");
            let mut separated = query_builder.separated(", ");
            for emulator_id in &emulator_ids {
                separated.push_bind(emulator_id);
            }
            separated.push_unseparated(")");
        }

        let profile_ids: Vec<String> = query_builder
            .build_query_scalar()
            .fetch_all(&self.db_pool)
            .await
            .map_err(sqlx_err_to_status)?;

        let emulator_profiles = join_all(profile_ids.into_iter().map(|id| {
            let db_pool = self.db_pool.clone();
            async move {
                let row: EmulatorProfileRow =
                    QueryBuilder::new("select * from emulator_profiles where id = ")
                        .push_bind(&id)
                        .build_query_as()
                        .fetch_one(&db_pool)
                        .await
                        .map_err(sqlx_err_to_status)?;

                let extensions = get_profile_extensions(&db_pool, &id).await?;
                Ok(profile_row_to_profile(row, extensions))
            }
        }))
        .await
        .into_iter()
        .collect::<Result<Vec<_>, Status>>()?;

        Ok(Response::new(ListEmulatorProfilesResponse {
            emulator_profiles,
        }))
    }

    async fn create_emulator_profile(
        &self,
        request: Request<CreateEmulatorProfileRequest>,
    ) -> Result<Response<EmulatorProfile>, Status> {
        let profile = request
            .into_inner()
            .emulator_profile
            .ok_or_else(|| Status::invalid_argument("Emulator profile must be provided"))?;

        if profile.emulator.is_empty() {
            return Err(Status::invalid_argument("Emulator ID must be provided"));
        }

        if profile.name.is_empty() {
            return Err(Status::invalid_argument("Profile name must be provided"));
        }

        let profile_id = Uuid::now_v7().to_string();

        let mut tx = self.db_pool.begin().await.map_err(sqlx_err_to_status)?;

        let row: EmulatorProfileRow = QueryBuilder::new(
            "insert into emulator_profiles (id, emulator, name, custom_args, built_in) values (",
        )
        .push_bind(&profile_id)
        .push(", ")
        .push_bind(&profile.emulator)
        .push(", ")
        .push_bind(&profile.name)
        .push(", ")
        .push_bind(&profile.custom_args)
        .push(", ")
        .push_bind(false)
        .push(") returning *")
        .build_query_as()
        .fetch_one(&mut *tx)
        .await
        .map_err(sqlx_err_to_status)?;

        if !profile.supported_extensions.is_empty() {
            QueryBuilder::new(
                "insert into emulator_profile_extensions (emulator_profile, extension) ",
            )
            .push_values(&profile.supported_extensions, |mut b, ext| {
                b.push_bind(&profile_id);
                b.push_bind(ext);
            })
            .build()
            .execute(&mut *tx)
            .await
            .map_err(sqlx_err_to_status)?;
        }

        tx.commit().await.map_err(sqlx_err_to_status)?;

        Ok(Response::new(profile_row_to_profile(
            row,
            profile.supported_extensions,
        )))
    }

    async fn update_emulator_profile(
        &self,
        request: Request<UpdateEmulatorProfileRequest>,
    ) -> Result<Response<EmulatorProfile>, Status> {
        let profile = request
            .into_inner()
            .emulator_profile
            .ok_or_else(|| Status::invalid_argument("Emulator profile must be provided"))?;

        if profile.id.is_empty() {
            return Err(Status::invalid_argument("Profile ID must be provided"));
        }

        if profile.name.is_empty() {
            return Err(Status::invalid_argument("Profile name must be provided"));
        }

        let mut tx = self.db_pool.begin().await.map_err(sqlx_err_to_status)?;

        let row: EmulatorProfileRow = QueryBuilder::new("update emulator_profiles set name = ")
            .push_bind(&profile.name)
            .push(", custom_args = ")
            .push_bind(&profile.custom_args)
            .push(" where id = ")
            .push_bind(&profile.id)
            .push(" returning *")
            .build_query_as()
            .fetch_one(&mut *tx)
            .await
            .map_err(sqlx_err_to_status)?;

        // Delete existing extensions
        QueryBuilder::new("delete from emulator_profile_extensions where emulator_profile = ")
            .push_bind(&profile.id)
            .build()
            .execute(&mut *tx)
            .await
            .map_err(sqlx_err_to_status)?;

        // Insert new extensions
        if !profile.supported_extensions.is_empty() {
            QueryBuilder::new(
                "insert into emulator_profile_extensions (emulator_profile, extension) ",
            )
            .push_values(&profile.supported_extensions, |mut b, ext| {
                b.push_bind(&profile.id);
                b.push_bind(ext);
            })
            .build()
            .execute(&mut *tx)
            .await
            .map_err(sqlx_err_to_status)?;
        }

        tx.commit().await.map_err(sqlx_err_to_status)?;

        Ok(Response::new(profile_row_to_profile(
            row,
            profile.supported_extensions,
        )))
    }

    async fn delete_emulator_profile(
        &self,
        request: Request<DeleteEmulatorProfileRequest>,
    ) -> Result<Response<Empty>, Status> {
        let id = request.into_inner().id;

        if id.is_empty() {
            return Err(Status::invalid_argument("Profile ID must be provided"));
        }

        QueryBuilder::new("delete from emulator_profiles where id = ")
            .push_bind(&id)
            .push(" and built_in = ")
            .push_bind(false)
            .build()
            .execute(&self.db_pool)
            .await
            .map_err(sqlx_err_to_status)?;

        Ok(Response::new(Empty {}))
    }

    async fn get_default_emulator_profile(
        &self,
        request: Request<GetDefaultEmulatorProfileRequest>,
    ) -> Result<Response<DefaultEmulatorProfile>, Status> {
        let id = request.into_inner().id;

        if id.is_empty() {
            return Err(Status::invalid_argument(
                "Default emulator profile ID must be provided",
            ));
        }

        let row: DefaultEmulatorProfileRow =
            QueryBuilder::new("select * from default_emulator_profiles where id = ")
                .push_bind(&id)
                .build_query_as()
                .fetch_one(&self.db_pool)
                .await
                .map_err(sqlx_err_to_status)?;

        Ok(Response::new(DefaultEmulatorProfile {
            id: row.id,
            platform: row.platform,
            client: row.client,
            emulator_profile: row.emulator_profile,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }))
    }

    async fn list_default_emulator_profiles(
        &self,
        request: Request<ListDefaultEmulatorProfilesRequest>,
    ) -> Result<Response<ListDefaultEmulatorProfilesResponse>, Status> {
        let req = request.into_inner();
        let platform_ids = req.platform_ids;
        let client_id = req.client_id;

        let mut query_builder = QueryBuilder::new("select * from default_emulator_profiles");
        query_builder.push(" where id is not null ");

        if !platform_ids.is_empty() {
            query_builder.push(" and platform in (");
            let mut separated = query_builder.separated(", ");
            for platform_id in &platform_ids {
                separated.push_bind(platform_id);
            }
            separated.push_unseparated(")");
        }

        if let Some(client) = &client_id {
            query_builder.push(" and client = ");
            query_builder.push_bind(client);
        }

        let rows: Vec<DefaultEmulatorProfileRow> = query_builder
            .build_query_as()
            .fetch_all(&self.db_pool)
            .await
            .map_err(sqlx_err_to_status)?;

        let default_emulator_profiles = rows
            .into_iter()
            .map(|row| DefaultEmulatorProfile {
                id: row.id,
                platform: row.platform,
                client: row.client,
                emulator_profile: row.emulator_profile,
                created_at: row.created_at,
                updated_at: row.updated_at,
            })
            .collect();

        Ok(Response::new(ListDefaultEmulatorProfilesResponse {
            default_emulator_profiles,
        }))
    }

    async fn create_default_emulator_profile(
        &self,
        request: Request<CreateDefaultEmulatorProfileRequest>,
    ) -> Result<Response<DefaultEmulatorProfile>, Status> {
        let profile = request
            .into_inner()
            .default_emulator_profile
            .ok_or_else(|| Status::invalid_argument("Default emulator profile must be provided"))?;

        if profile.platform.is_empty() {
            return Err(Status::invalid_argument("Platform ID must be provided"));
        }

        if profile.client.is_empty() {
            return Err(Status::invalid_argument("Client ID must be provided"));
        }

        if profile.emulator_profile.is_empty() {
            return Err(Status::invalid_argument(
                "Emulator profile ID must be provided",
            ));
        }

        let profile_id = Uuid::now_v7().to_string();

        let row: DefaultEmulatorProfileRow = QueryBuilder::new(
            "insert into default_emulator_profiles (id, platform, client, emulator_profile) values (",
        )
        .push_bind(&profile_id)
        .push(", ")
        .push_bind(&profile.platform)
        .push(", ")
        .push_bind(&profile.client)
        .push(", ")
        .push_bind(&profile.emulator_profile)
        .push(") returning *")
        .build_query_as()
        .fetch_one(&self.db_pool)
        .await
        .map_err(sqlx_err_to_status)?;

        Ok(Response::new(DefaultEmulatorProfile {
            id: row.id,
            platform: row.platform,
            client: row.client,
            emulator_profile: row.emulator_profile,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }))
    }

    async fn update_default_emulator_profile(
        &self,
        request: Request<UpdateDefaultEmulatorProfileRequest>,
    ) -> Result<Response<DefaultEmulatorProfile>, Status> {
        let profile = request
            .into_inner()
            .default_emulator_profile
            .ok_or_else(|| Status::invalid_argument("Default emulator profile must be provided"))?;

        if profile.id.is_empty() {
            return Err(Status::invalid_argument("Profile ID must be provided"));
        }

        if profile.emulator_profile.is_empty() {
            return Err(Status::invalid_argument(
                "Emulator profile ID must be provided",
            ));
        }

        let row: DefaultEmulatorProfileRow =
            QueryBuilder::new("update default_emulator_profiles set emulator_profile = ")
                .push_bind(&profile.emulator_profile)
                .push(" where id = ")
                .push_bind(&profile.id)
                .push(" returning *")
                .build_query_as()
                .fetch_one(&self.db_pool)
                .await
                .map_err(sqlx_err_to_status)?;

        Ok(Response::new(DefaultEmulatorProfile {
            id: row.id,
            platform: row.platform,
            client: row.client,
            emulator_profile: row.emulator_profile,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }))
    }

    async fn delete_default_emulator_profile(
        &self,
        request: Request<DeleteDefaultEmulatorProfileRequest>,
    ) -> Result<Response<Empty>, Status> {
        let id = request.into_inner().id;

        if id.is_empty() {
            return Err(Status::invalid_argument("Profile ID must be provided"));
        }

        QueryBuilder::new("delete from default_emulator_profiles where id = ")
            .push_bind(&id)
            .build()
            .execute(&self.db_pool)
            .await
            .map_err(sqlx_err_to_status)?;

        Ok(Response::new(Empty {}))
    }

    async fn get_local_emulator_config(
        &self,
        request: Request<GetLocalEmulatorConfigRequest>,
    ) -> Result<Response<LocalEmulatorConfig>, Status> {
        let id = request.into_inner().id;

        if id.is_empty() {
            return Err(Status::invalid_argument(
                "Local emulator config ID must be provided",
            ));
        }

        let row: LocalEmulatorConfigRow =
            QueryBuilder::new("select * from local_emulator_configs where id = ")
                .push_bind(&id)
                .build_query_as()
                .fetch_one(&self.db_pool)
                .await
                .map_err(sqlx_err_to_status)?;

        Ok(Response::new(LocalEmulatorConfig {
            id: row.id,
            emulator: row.emulator,
            client: row.client,
            created_at: row.created_at,
            updated_at: row.updated_at,
            executable_path: row.executable_path,
            nickname: row.nickname,
            save_data_path: row.save_data_path,
            save_states_path: row.save_states_path,
            bios_directory: row.bios_directory,
            extra_files_directory: row.extra_files_directory,
        }))
    }

    async fn list_local_emulator_configs(
        &self,
        request: Request<ListLocalEmulatorConfigsRequest>,
    ) -> Result<Response<ListLocalEmulatorConfigsResponse>, Status> {
        let req = request.into_inner();
        let emulator_ids = req.emulator_ids;
        let client_id = req.client_id;

        let mut query_builder = QueryBuilder::new("select * from local_emulator_configs");
        query_builder.push(" where id is not null ");

        if !emulator_ids.is_empty() {
            query_builder.push(" and emulator in (");
            let mut separated = query_builder.separated(", ");
            for emulator_id in &emulator_ids {
                separated.push_bind(emulator_id);
            }
            separated.push_unseparated(")");
        }

        if let Some(client) = &client_id {
            query_builder.push(" and client = ");
            query_builder.push_bind(client);
        }

        let rows: Vec<LocalEmulatorConfigRow> = query_builder
            .build_query_as()
            .fetch_all(&self.db_pool)
            .await
            .map_err(sqlx_err_to_status)?;

        let local_emulator_configs = rows
            .into_iter()
            .map(|row| LocalEmulatorConfig {
                id: row.id,
                emulator: row.emulator,
                client: row.client,
                created_at: row.created_at,
                updated_at: row.updated_at,
                executable_path: row.executable_path,
                nickname: row.nickname,
                save_data_path: row.save_data_path,
                save_states_path: row.save_states_path,
                bios_directory: row.bios_directory,
                extra_files_directory: row.extra_files_directory,
            })
            .collect();

        Ok(Response::new(ListLocalEmulatorConfigsResponse {
            local_emulator_configs,
        }))
    }

    async fn create_local_emulator_config(
        &self,
        request: Request<CreateLocalEmulatorConfigRequest>,
    ) -> Result<Response<LocalEmulatorConfig>, Status> {
        let config = request
            .into_inner()
            .local_emulator_config
            .ok_or_else(|| Status::invalid_argument("Local emulator config must be provided"))?;

        if config.emulator.is_empty() {
            return Err(Status::invalid_argument("Emulator ID must be provided"));
        }

        if config.client.is_empty() {
            return Err(Status::invalid_argument("Client ID must be provided"));
        }

        if config.executable_path.is_empty() {
            return Err(Status::invalid_argument("Executable path must be provided"));
        }

        let config_id = Uuid::now_v7().to_string();

        let row: LocalEmulatorConfigRow = QueryBuilder::new(
            r#"
            insert into local_emulator_configs (
                id, 
                emulator, 
                client, 
                executable_path, 
                nickname, 
                save_data_path, 
                save_states_path, 
                bios_directory, 
                extra_files_directory
            ) values (
            "#,
        )
        .push_bind(&config_id)
        .push(", ")
        .push_bind(&config.emulator)
        .push(", ")
        .push_bind(&config.client)
        .push(", ")
        .push_bind(&config.executable_path)
        .push(", ")
        .push_bind(config.nickname)
        .push(", ")
        .push_bind(config.save_data_path)
        .push(", ")
        .push_bind(config.save_states_path)
        .push(", ")
        .push_bind(config.bios_directory)
        .push(", ")
        .push_bind(config.extra_files_directory)
        .push(") returning *")
        .build_query_as()
        .fetch_one(&self.db_pool)
        .await
        .map_err(sqlx_err_to_status)?;

        Ok(Response::new(LocalEmulatorConfig {
            id: row.id,
            emulator: row.emulator,
            client: row.client,
            created_at: row.created_at,
            updated_at: row.updated_at,
            executable_path: row.executable_path,
            nickname: row.nickname,
            save_data_path: row.save_data_path,
            save_states_path: row.save_states_path,
            bios_directory: row.bios_directory,
            extra_files_directory: row.extra_files_directory,
        }))
    }

    async fn update_local_emulator_config(
        &self,
        request: Request<UpdateLocalEmulatorConfigRequest>,
    ) -> Result<Response<LocalEmulatorConfig>, Status> {
        let config = request
            .into_inner()
            .local_emulator_config
            .ok_or_else(|| Status::invalid_argument("Local emulator config must be provided"))?;

        if config.id.is_empty() {
            return Err(Status::invalid_argument("Config ID must be provided"));
        }

        if config.executable_path.is_empty() {
            return Err(Status::invalid_argument("Executable path must be provided"));
        }

        let row: LocalEmulatorConfigRow =
            QueryBuilder::new("update local_emulator_configs set executable_path = ")
                .push_bind(&config.executable_path)
                .push(", nickname = ")
                .push_bind(config.nickname)
                .push(", save_data_path = ")
                .push_bind(config.save_data_path)
                .push(", save_states_path = ")
                .push_bind(config.save_states_path)
                .push(", bios_directory = ")
                .push_bind(config.bios_directory)
                .push(", extra_files_directory = ")
                .push_bind(config.extra_files_directory)
                .push(" where id = ")
                .push_bind(&config.id)
                .push(" returning *")
                .build_query_as()
                .fetch_one(&self.db_pool)
                .await
                .map_err(sqlx_err_to_status)?;

        Ok(Response::new(LocalEmulatorConfig {
            id: row.id,
            emulator: row.emulator,
            client: row.client,
            created_at: row.created_at,
            updated_at: row.updated_at,
            executable_path: row.executable_path,
            nickname: row.nickname,
            save_data_path: row.save_data_path,
            save_states_path: row.save_states_path,
            bios_directory: row.bios_directory,
            extra_files_directory: row.extra_files_directory,
        }))
    }

    async fn delete_local_emulator_config(
        &self,
        request: Request<DeleteLocalEmulatorConfigRequest>,
    ) -> Result<Response<Empty>, Status> {
        let id = request.into_inner().id;

        if id.is_empty() {
            return Err(Status::invalid_argument("Config ID must be provided"));
        }

        QueryBuilder::new("delete from local_emulator_configs where id = ")
            .push_bind(&id)
            .build()
            .execute(&self.db_pool)
            .await
            .map_err(sqlx_err_to_status)?;

        Ok(Response::new(Empty {}))
    }
}
