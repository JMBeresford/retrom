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
use retrom_db::{page_cursor::PageCursor, DbPool};
use serde::{Deserialize, Serialize};
use sqlx::QueryBuilder;
use std::sync::OnceLock;
use tonic::{Request, Response, Status};
use uuid::Uuid;

pub mod router;

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
struct EmulatorQueryFilter {
    display_name: Option<String>,
    platforms: Vec<String>,
}

type EmulatorCursor = PageCursor<EmulatorQueryFilter>;

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
struct EmulatorProfileQueryFilter {
    display_name: Option<String>,
    emulators: Vec<String>,
}

type EmulatorProfileCursor = PageCursor<EmulatorProfileQueryFilter>;

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
struct DefaultEmulatorProfileQueryFilter {
    platforms: Vec<String>,
    clients: Vec<String>,
}

type DefaultEmulatorProfileCursor = PageCursor<DefaultEmulatorProfileQueryFilter>;

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
struct LocalEmulatorConfigQueryFilter {
    emulators: Vec<String>,
    clients: Vec<String>,
}

type LocalEmulatorConfigCursor = PageCursor<LocalEmulatorConfigQueryFilter>;

static NAME_MATCH_ROUTER: OnceLock<matchit::Router<&'static str>> = OnceLock::new();

fn get_name_matcher() -> &'static matchit::Router<&'static str> {
    NAME_MATCH_ROUTER.get_or_init(|| {
        let mut router = matchit::Router::new();
        router
            .insert("emulators/{emulator_id}", "Emulator handler")
            .expect("Failed to insert emulator route");

        router
            .insert("emulator_profiles/{profile_id}", "Emulator profile handler")
            .expect("Failed to insert emulator profile route");

        router
            .insert(
                "default_emulator_profiles/{default_profile_id}",
                "Default emulator profile handler",
            )
            .expect("Failed to insert default emulator profile route");

        router
            .insert("clients/{client_id}", "Client handler")
            .expect("Failed to insert client route");

        router
            .insert(
                "local_emulator_configs/{config_id}",
                "Local emulator config handler",
            )
            .expect("Failed to insert local emulator config route");

        router
            .insert("platforms/{platform_id}", "Platform handler")
            .expect("Failed to insert platform route");

        router
    })
}

fn match_emulator_id(name: &str) -> Result<String, Status> {
    let emulator_id = get_name_matcher()
        .at(name)
        .map(|matched| matched.params.get("emulator_id").map(|s| s.to_string()))
        .map_err(|_| Status::invalid_argument("Invalid emulator name"))?;

    match emulator_id {
        Some(id) => Ok(id),
        None => Err(Status::invalid_argument(format!(
            "Emulator ID not found in name: {name}"
        ))),
    }
}

fn match_profile_id(name: &str) -> Result<String, Status> {
    let profile_id = get_name_matcher()
        .at(name)
        .map(|matched| matched.params.get("profile_id").map(|s| s.to_string()))
        .map_err(|_| Status::invalid_argument("Invalid emulator profile name"))?;

    match profile_id {
        Some(id) => Ok(id),
        None => Err(Status::invalid_argument(format!(
            "Emulator profile ID not found in name: {name}"
        ))),
    }
}

fn match_default_profile_id(name: &str) -> Result<String, Status> {
    let default_profile_id = get_name_matcher()
        .at(name)
        .map(|matched| {
            matched
                .params
                .get("default_profile_id")
                .map(|s| s.to_string())
        })
        .map_err(|_| Status::invalid_argument("Invalid default emulator profile name"))?;

    match default_profile_id {
        Some(id) => Ok(id),
        None => Err(Status::invalid_argument(format!(
            "Default emulator profile ID not found in name: {name}"
        ))),
    }
}

fn match_local_emulator_config_id(name: &str) -> Result<String, Status> {
    let config_id = get_name_matcher()
        .at(name)
        .map(|matched| matched.params.get("config_id").map(|s| s.to_string()))
        .map_err(|_| Status::invalid_argument("Invalid local emulator config name"))?;

    match config_id {
        Some(id) => Ok(id),
        None => Err(Status::invalid_argument(format!(
            "Local emulator config ID not found in name: {name}"
        ))),
    }
}

fn match_platform_id(name: &str) -> Result<String, Status> {
    let platform_id = get_name_matcher()
        .at(name)
        .map(|matched| matched.params.get("platform_id").map(|s| s.to_string()))
        .map_err(|_| Status::invalid_argument("Invalid platform name"))?;

    match platform_id {
        Some(id) => Ok(id),
        None => Err(Status::invalid_argument(format!(
            "Platform ID not found in name: {name}"
        ))),
    }
}

fn match_client_id(name: &str) -> Result<String, Status> {
    let client_id = get_name_matcher()
        .at(name)
        .map(|matched| matched.params.get("client_id").map(|s| s.to_string()))
        .map_err(|_| Status::invalid_argument("Invalid client name"))?;

    match client_id {
        Some(id) => Ok(id),
        None => Err(Status::invalid_argument(format!(
            "Client ID not found in name: {name}"
        ))),
    }
}

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

async fn select_emulator_platforms(
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

async fn select_emulator_operating_systems(
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

fn emulator_rows_to_emulator(
    row: EmulatorRow,
    platforms: Vec<String>,
    operating_systems: Vec<i32>,
) -> Emulator {
    Emulator {
        name: format!("emulators/{}", row.id),
        display_name: row.display_name,
        created_at: row.created_at,
        updated_at: row.updated_at,
        built_in: row.built_in,
        libretro_name: row.libretro_name,
        platforms,
        operating_systems,
    }
}

async fn select_profile_extensions(
    db_pool: &DbPool,
    profile_id: &str,
) -> Result<Vec<String>, Status> {
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
        name: format!("emulator_profiles/{}", row.id),
        parent: format!("emulators/{}", row.emulator),
        display_name: row.display_name,
        custom_args: row.custom_args,
        built_in: row.built_in,
        created_at: row.created_at,
        updated_at: row.updated_at,
        supported_extensions,
    }
}

fn default_profile_row_to_default_profile(
    row: DefaultEmulatorProfileRow,
) -> DefaultEmulatorProfile {
    DefaultEmulatorProfile {
        name: format!("default_emulator_profiles/{}", row.id),
        platform: format!("platforms/{}", row.platform),
        client: format!("clients/{}", row.client),
        emulator_profile: format!("emulator_profiles/{}", row.emulator_profile),
        created_at: row.created_at,
        updated_at: row.updated_at,
    }
}

fn local_emulator_profile_config_row_to_local_emulator_config(
    row: LocalEmulatorConfigRow,
) -> LocalEmulatorConfig {
    LocalEmulatorConfig {
        name: format!("local_emulator_configs/{}", row.id),
        emulator: format!("emulators/{}", row.emulator),
        client: format!("clients/{}", row.client),
        created_at: row.created_at,
        updated_at: row.updated_at,
        executable_path: row.executable_path,
        nickname: row.nickname,
        save_data_path: row.save_data_path,
        save_states_path: row.save_states_path,
        bios_directory: row.bios_directory,
        extra_files_directory: row.extra_files_directory,
    }
}

async fn handle_get_emulator(db_pool: &DbPool, id: &str) -> Result<Emulator, Status> {
    let row: EmulatorRow = QueryBuilder::new("select * from emulators where id = ")
        .push_bind(id)
        .build_query_as()
        .fetch_one(db_pool)
        .await
        .map_err(sqlx_err_to_status)?;

    let platforms = select_emulator_platforms(db_pool, id).await?;
    let operating_systems = select_emulator_operating_systems(db_pool, id)
        .await?
        .into_iter()
        .map(i32::from)
        .collect();

    Ok(emulator_rows_to_emulator(row, platforms, operating_systems))
}

async fn handle_get_emulator_profile(
    db_pool: &DbPool,
    id: &str,
) -> Result<EmulatorProfile, Status> {
    let row: EmulatorProfileRow = QueryBuilder::new("select * from emulator_profiles where id = ")
        .push_bind(id)
        .build_query_as()
        .fetch_one(db_pool)
        .await
        .map_err(sqlx_err_to_status)?;

    let supported_extensions = select_profile_extensions(db_pool, id).await?;

    Ok(profile_row_to_profile(row, supported_extensions))
}

async fn handle_get_default_emulator_profile(
    db_pool: &DbPool,
    id: &str,
) -> Result<DefaultEmulatorProfile, Status> {
    let row: DefaultEmulatorProfileRow =
        QueryBuilder::new("select * from default_emulator_profiles where id = ")
            .push_bind(id)
            .build_query_as()
            .fetch_one(db_pool)
            .await
            .map_err(sqlx_err_to_status)?;

    Ok(default_profile_row_to_default_profile(row))
}

async fn handle_get_local_emulator_profile_config(
    db_pool: &DbPool,
    id: &str,
) -> Result<LocalEmulatorConfig, Status> {
    let row: LocalEmulatorConfigRow =
        QueryBuilder::new("select * from local_emulator_configs where id = ")
            .push_bind(id)
            .build_query_as()
            .fetch_one(db_pool)
            .await
            .map_err(sqlx_err_to_status)?;

    Ok(local_emulator_profile_config_row_to_local_emulator_config(
        row,
    ))
}

#[tonic::async_trait]
impl EmulatorService for EmulatorServiceHandlers {
    async fn get_emulator(
        &self,
        request: Request<GetEmulatorRequest>,
    ) -> Result<Response<Emulator>, Status> {
        let id = match_emulator_id(&request.into_inner().name)?;

        Ok(Response::new(
            handle_get_emulator(&self.db_pool, &id).await?,
        ))
    }

    async fn list_emulators(
        &self,
        request: Request<ListEmulatorsRequest>,
    ) -> Result<Response<ListEmulatorsResponse>, Status> {
        let request = request.into_inner();
        let cursor = match EmulatorCursor::deserialize(request.page_token()) {
            Some(cursor) => cursor,
            None => {
                let parsed_limit = match request.page_size() {
                    0 => 250, // Default page size
                    n if n < 0 => {
                        return Err(Status::invalid_argument("Page size must be non-negative"))
                    }
                    n if n > 1000 => 1000, // Max page size
                    n => n as u32,
                };

                let display_name = request.display_name;
                let platforms = request.platforms;

                let initial_filter = EmulatorQueryFilter {
                    display_name,
                    platforms,
                };

                EmulatorCursor {
                    offset: 0,
                    page_size: parsed_limit,
                    filter: initial_filter,
                }
            }
        };

        let current_filter = cursor.filter.clone();
        let query_limit = cursor.page_size + 1; // Fetch one extra to determine if there's a next page

        let platform_ids = current_filter
            .platforms
            .iter()
            .map(|p| match_emulator_id(p))
            .collect::<Result<Vec<String>, _>>()?;

        let mut query_builder = QueryBuilder::new("select distinct e.id from emulators e");

        if !platform_ids.is_empty() {
            query_builder.push(" left join emulator_platforms ep on ep.emulator = e.id ");
        }

        query_builder.push(" where e.id is not null ");

        if !platform_ids.is_empty() {
            // Include emulators w/ no configured 'supported platforms', as this
            // implies any platform is supported.
            query_builder.push(" and (ep.emulator is null");
            query_builder.push(" or ep.platform in (");
            let mut separated = query_builder.separated(", ");
            for platform_id in &platform_ids {
                separated.push_bind(platform_id);
            }

            separated.push_unseparated("))");
        }

        if let Some(display_name) = &current_filter.display_name {
            query_builder.push(" and lower(e.display_name) like ");
            query_builder.push_bind(format!("%{}%", display_name.to_lowercase()));
        }

        query_builder.push(" limit ");
        query_builder.push_bind(query_limit);
        query_builder.push(" offset ");
        query_builder.push_bind(cursor.offset);

        let emulator_ids: Vec<String> = query_builder
            .build_query_scalar()
            .fetch_all(&self.db_pool)
            .await
            .map_err(sqlx_err_to_status)?;

        let mut emulators = Vec::new();
        let num_rows_to_process = std::cmp::min(emulator_ids.len(), cursor.page_size as usize);

        let next_page_token = if emulator_ids.len() > cursor.page_size as usize {
            let next_cursor = EmulatorCursor {
                offset: cursor.offset + cursor.page_size,
                page_size: cursor.page_size,
                filter: cursor.filter,
            };

            Some(next_cursor.serialize())
        } else {
            None
        };

        let emulator_futures = emulator_ids
            .into_iter()
            .take(num_rows_to_process)
            .map(|id| {
                let db_pool = self.db_pool.clone();

                async move { handle_get_emulator(&db_pool, &id).await }
            });

        for emulator_result in join_all(emulator_futures).await {
            match emulator_result {
                Ok(emulator) => emulators.push(emulator),
                Err(e) => return Err(e),
            }
        }

        Ok(Response::new(ListEmulatorsResponse {
            emulators,
            next_page_token,
        }))
    }

    async fn create_emulator(
        &self,
        request: Request<CreateEmulatorRequest>,
    ) -> Result<Response<Emulator>, Status> {
        let emulator = request
            .into_inner()
            .emulator
            .ok_or_else(|| Status::invalid_argument("Emulator must be provided"))?;

        if emulator.display_name.is_empty() {
            return Err(Status::invalid_argument(
                "Emulator display name must be provided",
            ));
        }

        let emulator_id = Uuid::now_v7().to_string();

        let mut tx = self.db_pool.begin().await.map_err(sqlx_err_to_status)?;

        let row: EmulatorRow =
            QueryBuilder::new("insert into emulators (id, display_name, built_in) values (")
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

        let platform_ids = emulator
            .platforms
            .iter()
            .map(|p| match_emulator_id(p))
            .collect::<Result<Vec<String>, _>>()?;

        if !platform_ids.is_empty() {
            QueryBuilder::new("insert into emulator_platforms (emulator, platform) ")
                .push_values(&platform_ids, |mut b, platform_id| {
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

        Ok(Response::new(emulator_rows_to_emulator(
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

        let emulator_id = match_emulator_id(&emulator.name)?;

        if emulator.display_name.is_empty() {
            return Err(Status::invalid_argument(
                "Emulator display name must be provided",
            ));
        }

        let mut tx = self.db_pool.begin().await.map_err(sqlx_err_to_status)?;

        let row: EmulatorRow = QueryBuilder::new("update emulators set display_name = ")
            .push_bind(&emulator.name)
            .push(" where id = ")
            .push_bind(&emulator_id)
            .push(" returning *")
            .build_query_as()
            .fetch_one(&mut *tx)
            .await
            .map_err(sqlx_err_to_status)?;

        // Delete existing platforms and operating systems
        QueryBuilder::new("delete from emulator_platforms where emulator = ")
            .push_bind(&emulator_id)
            .build()
            .execute(&mut *tx)
            .await
            .map_err(sqlx_err_to_status)?;

        QueryBuilder::new("delete from emulator_operating_systems where emulator = ")
            .push_bind(&emulator_id)
            .build()
            .execute(&mut *tx)
            .await
            .map_err(sqlx_err_to_status)?;

        let platform_ids = emulator
            .platforms
            .iter()
            .map(|p| match_emulator_id(p))
            .collect::<Result<Vec<String>, _>>()?;

        // Insert new platforms and operating systems
        if !platform_ids.is_empty() {
            QueryBuilder::new("insert into emulator_platforms (emulator, platform) ")
                .push_values(&platform_ids, |mut b, platform_id| {
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

        Ok(Response::new(emulator_rows_to_emulator(
            row,
            emulator.platforms,
            emulator.operating_systems,
        )))
    }

    async fn delete_emulator(
        &self,
        request: Request<DeleteEmulatorRequest>,
    ) -> Result<Response<Empty>, Status> {
        let request = request.into_inner();
        let emulator_id = match_emulator_id(&request.name)?;

        QueryBuilder::new("delete from emulators where id = ")
            .push_bind(&emulator_id)
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
        let request = request.into_inner();
        let profile_id = match_profile_id(&request.name)?;

        Ok(Response::new(
            handle_get_emulator_profile(&self.db_pool, &profile_id).await?,
        ))
    }

    async fn list_emulator_profiles(
        &self,
        request: Request<ListEmulatorProfilesRequest>,
    ) -> Result<Response<ListEmulatorProfilesResponse>, Status> {
        let request = request.into_inner();
        let cursor = match EmulatorProfileCursor::deserialize(request.page_token()) {
            Some(cursor) => cursor,
            None => {
                let parsed_limit = match request.page_size() {
                    0 => 250, // Default page size
                    n if n < 0 => {
                        return Err(Status::invalid_argument("Page size must be non-negative"))
                    }
                    n if n > 1000 => 1000, // Max page size
                    n => n as u32,
                };

                let display_name = request.display_name;
                let emulators = request.emulators;

                let initial_filter = EmulatorProfileQueryFilter {
                    display_name,
                    emulators,
                };

                EmulatorProfileCursor {
                    offset: 0,
                    page_size: parsed_limit,
                    filter: initial_filter,
                }
            }
        };

        let current_filter = cursor.filter.clone();
        let query_limit = cursor.page_size + 1; // Fetch one extra to determine if there's a next page

        let emulator_ids = current_filter
            .emulators
            .iter()
            .map(|e| match_emulator_id(e))
            .collect::<Result<Vec<String>, _>>()?;

        let mut query_builder = QueryBuilder::new("select id from emulator_profiles");
        query_builder.push(" where id is not null ");

        if let Some(display_name) = &current_filter.display_name {
            query_builder.push(" and lower(display_name) like ");
            query_builder.push_bind(format!("%{}%", display_name.to_lowercase()));
        }

        if !emulator_ids.is_empty() {
            query_builder.push(" and emulator in (");
            let mut separated = query_builder.separated(", ");
            for emulator_id in &emulator_ids {
                separated.push_bind(emulator_id);
            }
            separated.push_unseparated(")");
        }

        query_builder.push(" limit ");
        query_builder.push_bind(query_limit);
        query_builder.push(" offset ");
        query_builder.push_bind(cursor.offset);

        let profile_ids: Vec<String> = query_builder
            .build_query_scalar()
            .fetch_all(&self.db_pool)
            .await
            .map_err(sqlx_err_to_status)?;

        let emulator_profiles = join_all(profile_ids.into_iter().map(|id| {
            let db_pool = self.db_pool.clone();

            async move { handle_get_emulator_profile(&db_pool, &id).await }
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
        let request = request.into_inner();

        let emulator_id = match_emulator_id(&request.parent)?;

        let profile = request
            .emulator_profile
            .ok_or_else(|| Status::invalid_argument("Emulator profile must be provided"))?;

        if profile.display_name.is_empty() {
            return Err(Status::invalid_argument(
                "Profile display name must be provided",
            ));
        }

        let profile_id = if let Some(name) = request.name {
            match_profile_id(&name)?
        } else {
            Uuid::now_v7().to_string()
        };

        let mut tx = self.db_pool.begin().await.map_err(sqlx_err_to_status)?;

        let row: EmulatorProfileRow = QueryBuilder::new(
            "insert into emulator_profiles (id, emulator, display_name, custom_args, built_in) values (",
        )
        .push_bind(&profile_id)
        .push(", ")
        .push_bind(&emulator_id)
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
        let request = request.into_inner();

        let profile = request
            .emulator_profile
            .ok_or_else(|| Status::invalid_argument("Emulator profile must be provided"))?;

        let profile_id = match_profile_id(&profile.name)?;

        if profile.display_name.is_empty() {
            return Err(Status::invalid_argument(
                "Profile display name must be provided",
            ));
        }

        let mut tx = self.db_pool.begin().await.map_err(sqlx_err_to_status)?;

        let row: EmulatorProfileRow =
            QueryBuilder::new("update emulator_profiles set display_name = ")
                .push_bind(&profile.display_name)
                .push(", custom_args = ")
                .push_bind(&profile.custom_args)
                .push(" where id = ")
                .push_bind(&profile_id)
                .push(" returning *")
                .build_query_as()
                .fetch_one(&mut *tx)
                .await
                .map_err(sqlx_err_to_status)?;

        // Delete existing extensions
        QueryBuilder::new("delete from emulator_profile_extensions where emulator_profile = ")
            .push_bind(&profile_id)
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

    async fn delete_emulator_profile(
        &self,
        request: Request<DeleteEmulatorProfileRequest>,
    ) -> Result<Response<Empty>, Status> {
        let request = request.into_inner();
        let profile_id = match_profile_id(&request.name)?;

        if profile_id.is_empty() {
            return Err(Status::invalid_argument("Profile ID must be provided"));
        }

        QueryBuilder::new("delete from emulator_profiles where id = ")
            .push_bind(&profile_id)
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
        let request = request.into_inner();
        let id = match_profile_id(&request.name)?;

        Ok(Response::new(
            handle_get_default_emulator_profile(&self.db_pool, &id).await?,
        ))
    }

    #[tracing::instrument(skip_all)]
    async fn list_default_emulator_profiles(
        &self,
        request: Request<ListDefaultEmulatorProfilesRequest>,
    ) -> Result<Response<ListDefaultEmulatorProfilesResponse>, Status> {
        let request = request.into_inner();
        let cursor = match DefaultEmulatorProfileCursor::deserialize(request.page_token()) {
            Some(cursor) => cursor,
            None => {
                let parsed_limit = match request.page_size() {
                    0 => 250, // Default page size
                    n if n < 0 => {
                        return Err(Status::invalid_argument("Page size must be non-negative"))
                    }
                    n if n > 1000 => 1000, // Max page size
                    n => n as u32,
                };

                let platforms = request.platforms;
                let clients = request.clients;

                let initial_filter = DefaultEmulatorProfileQueryFilter { platforms, clients };

                DefaultEmulatorProfileCursor {
                    offset: 0,
                    page_size: parsed_limit,
                    filter: initial_filter,
                }
            }
        };

        let current_filter = cursor.filter.clone();
        let query_limit = cursor.page_size + 1; // Fetch one extra to determine if there's a next page

        let platform_ids = current_filter
            .platforms
            .iter()
            .map(|p| match_platform_id(p))
            .collect::<Result<Vec<String>, _>>()?;

        let client_ids = current_filter
            .clients
            .iter()
            .map(|c| match_client_id(c))
            .collect::<Result<Vec<String>, _>>()?;

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

        if !client_ids.is_empty() {
            query_builder.push(" and client in (");
            let mut separated = query_builder.separated(", ");
            for client_id in &client_ids {
                separated.push_bind(client_id);
            }
            separated.push_unseparated(")");
        }

        query_builder.push(" limit ");
        query_builder.push_bind(query_limit);
        query_builder.push(" offset ");
        query_builder.push_bind(cursor.offset);

        let rows: Vec<DefaultEmulatorProfileRow> = query_builder
            .build_query_as()
            .fetch_all(&self.db_pool)
            .await
            .map_err(sqlx_err_to_status)?;

        let mut default_emulator_profiles = Vec::new();
        let num_rows_to_process = std::cmp::min(rows.len(), cursor.page_size as usize);

        let next_page_token = if rows.len() > cursor.page_size as usize {
            let next_cursor = DefaultEmulatorProfileCursor {
                offset: cursor.offset + cursor.page_size,
                page_size: cursor.page_size,
                filter: cursor.filter,
            };

            Some(next_cursor.serialize())
        } else {
            None
        };

        for row in rows.into_iter().take(num_rows_to_process) {
            default_emulator_profiles.push(default_profile_row_to_default_profile(row));
        }

        Ok(Response::new(ListDefaultEmulatorProfilesResponse {
            default_emulator_profiles,
            next_page_token,
        }))
    }

    async fn create_default_emulator_profile(
        &self,
        request: Request<CreateDefaultEmulatorProfileRequest>,
    ) -> Result<Response<DefaultEmulatorProfile>, Status> {
        let request = request.into_inner();

        let profile = request
            .default_emulator_profile
            .ok_or_else(|| Status::invalid_argument("Default emulator profile must be provided"))?;

        let profile_id = match_profile_id(&profile.emulator_profile)?;
        let platform_id = match_platform_id(&profile.platform)?;
        let client_id = match_client_id(&profile.client)?;

        let default_profile_id = Uuid::now_v7().to_string();

        let row: DefaultEmulatorProfileRow = QueryBuilder::new(
            "insert into default_emulator_profiles (id, platform, client, emulator_profile) values (",
        )
        .push_bind(&default_profile_id)
        .push(", ")
        .push_bind(&platform_id)
        .push(", ")
        .push_bind(&client_id)
        .push(", ")
        .push_bind(&profile_id)
        .push(") returning *")
        .build_query_as()
        .fetch_one(&self.db_pool)
        .await
        .map_err(sqlx_err_to_status)?;

        Ok(Response::new(default_profile_row_to_default_profile(row)))
    }

    async fn update_default_emulator_profile(
        &self,
        request: Request<UpdateDefaultEmulatorProfileRequest>,
    ) -> Result<Response<DefaultEmulatorProfile>, Status> {
        let request = request.into_inner();

        let default_profile = request
            .default_emulator_profile
            .ok_or_else(|| Status::invalid_argument("Default emulator profile must be provided"))?;

        let default_profile_id = match_emulator_id(&default_profile.name)?;
        let profile_id = match_emulator_id(&default_profile.emulator_profile)?;

        let row: DefaultEmulatorProfileRow =
            QueryBuilder::new("update default_emulator_profiles set emulator_profile = ")
                .push_bind(&profile_id)
                .push(" where id = ")
                .push_bind(&default_profile_id)
                .push(" returning *")
                .build_query_as()
                .fetch_one(&self.db_pool)
                .await
                .map_err(sqlx_err_to_status)?;

        Ok(Response::new(default_profile_row_to_default_profile(row)))
    }

    async fn delete_default_emulator_profile(
        &self,
        request: Request<DeleteDefaultEmulatorProfileRequest>,
    ) -> Result<Response<Empty>, Status> {
        let request = request.into_inner();
        let default_profile_id = match_default_profile_id(&request.name)?;

        QueryBuilder::new("delete from default_emulator_profiles where id = ")
            .push_bind(&default_profile_id)
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
        let request = request.into_inner();
        let local_config_id = match_local_emulator_config_id(&request.name)?;

        Ok(Response::new(
            handle_get_local_emulator_profile_config(&self.db_pool, &local_config_id).await?,
        ))
    }

    async fn list_local_emulator_configs(
        &self,
        request: Request<ListLocalEmulatorConfigsRequest>,
    ) -> Result<Response<ListLocalEmulatorConfigsResponse>, Status> {
        let request = request.into_inner();

        let cursor = match LocalEmulatorConfigCursor::deserialize(request.page_token()) {
            Some(cursor) => cursor,
            None => {
                let parsed_limit = match request.page_size() {
                    0 => 250, // Default page size
                    n if n < 0 => {
                        return Err(Status::invalid_argument("Page size must be non-negative"))
                    }
                    n if n > 1000 => 1000, // Max page size
                    n => n as u32,
                };

                let emulators = request.emulators;
                let clients = request.clients;

                let initial_filter = LocalEmulatorConfigQueryFilter { emulators, clients };

                LocalEmulatorConfigCursor {
                    offset: 0,
                    page_size: parsed_limit,
                    filter: initial_filter,
                }
            }
        };

        let current_filter = cursor.filter.clone();
        let query_limit = cursor.page_size + 1; // Fetch one extra to determine if there's a next page

        let emulator_ids = current_filter
            .emulators
            .iter()
            .map(|e| match_emulator_id(e))
            .collect::<Result<Vec<String>, _>>()?;

        let client_ids = current_filter
            .clients
            .iter()
            .map(|c| match_client_id(c))
            .collect::<Result<Vec<String>, _>>()?;

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

        if !client_ids.is_empty() {
            query_builder.push(" and client in (");
            let mut separated = query_builder.separated(", ");
            for client_id in &client_ids {
                separated.push_bind(client_id);
            }
            separated.push_unseparated(")");
        }

        query_builder.push(" limit ");
        query_builder.push_bind(query_limit);
        query_builder.push(" offset ");
        query_builder.push_bind(cursor.offset);

        let rows: Vec<LocalEmulatorConfigRow> = query_builder
            .build_query_as()
            .fetch_all(&self.db_pool)
            .await
            .map_err(sqlx_err_to_status)?;

        let next_page_token = if rows.len() > cursor.page_size as usize {
            let next_cursor = LocalEmulatorConfigCursor {
                offset: cursor.offset + cursor.page_size,
                page_size: cursor.page_size,
                filter: cursor.filter,
            };

            Some(next_cursor.serialize())
        } else {
            None
        };

        let mut local_emulator_configs = Vec::new();
        let num_rows_to_process = std::cmp::min(rows.len(), cursor.page_size as usize);

        for row in rows.into_iter().take(num_rows_to_process) {
            local_emulator_configs.push(
                local_emulator_profile_config_row_to_local_emulator_config(row),
            );
        }

        Ok(Response::new(ListLocalEmulatorConfigsResponse {
            local_emulator_configs,
            next_page_token,
        }))
    }

    #[tracing::instrument(skip_all)]
    async fn create_local_emulator_config(
        &self,
        request: Request<CreateLocalEmulatorConfigRequest>,
    ) -> Result<Response<LocalEmulatorConfig>, Status> {
        let request = request.into_inner();

        let config = request
            .local_emulator_config
            .ok_or_else(|| Status::invalid_argument("Local emulator config must be provided"))?;

        let emulator_id = match_emulator_id(&config.emulator)?;
        let client_id = match_client_id(&config.client)?;

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
        .push_bind(&emulator_id)
        .push(", ")
        .push_bind(&client_id)
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

        Ok(Response::new(
            local_emulator_profile_config_row_to_local_emulator_config(row),
        ))
    }

    async fn update_local_emulator_config(
        &self,
        request: Request<UpdateLocalEmulatorConfigRequest>,
    ) -> Result<Response<LocalEmulatorConfig>, Status> {
        let request = request.into_inner();
        let config = request
            .local_emulator_config
            .ok_or_else(|| Status::invalid_argument("Local emulator config must be provided"))?;

        let config_id = match_local_emulator_config_id(&config.name)?;

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
                .push_bind(&config_id)
                .push(" returning *")
                .build_query_as()
                .fetch_one(&self.db_pool)
                .await
                .map_err(sqlx_err_to_status)?;

        Ok(Response::new(
            local_emulator_profile_config_row_to_local_emulator_config(row),
        ))
    }

    async fn delete_local_emulator_config(
        &self,
        request: Request<DeleteLocalEmulatorConfigRequest>,
    ) -> Result<Response<Empty>, Status> {
        let request = request.into_inner();
        let config_id = match_local_emulator_config_id(&request.name)?;

        QueryBuilder::new("delete from local_emulator_configs where id = ")
            .push_bind(&config_id)
            .build()
            .execute(&self.db_pool)
            .await
            .map_err(sqlx_err_to_status)?;

        Ok(Response::new(Empty {}))
    }
}
