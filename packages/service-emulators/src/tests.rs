use std::collections::BTreeSet;

use super::EmulatorServiceHandlers;
use retrom_codegen::{
    retrom::services::emulators::v1::{
        emulator_service_server::EmulatorService, CreateEmulatorProfilesRequest,
        CreateEmulatorsRequest, CreateLocalEmulatorConfigsRequest, DefaultEmulatorProfile,
        DeleteDefaultEmulatorProfilesRequest, DeleteEmulatorPlatformsRequest,
        DeleteEmulatorProfilesRequest, DeleteEmulatorsRequest, DeleteLocalEmulatorConfigsRequest,
        Emulator, EmulatorProfile, GetDefaultEmulatorProfilesRequest, GetEmulatorPlatformsRequest,
        GetEmulatorProfilesRequest, GetEmulatorsRequest, GetLocalEmulatorConfigsRequest,
        LocalEmulatorConfig, UpdateDefaultEmulatorProfilesRequest, UpdateEmulatorPlatformsRequest,
        UpdateEmulatorProfilesRequest, UpdateEmulatorsRequest, UpdateLocalEmulatorConfigsRequest,
    },
    timestamp::Timestamp,
};
use retrom_db::{run_migrations, DbPool};
use sqlx::sqlite::SqlitePoolOptions;
use tonic::{Code, Request};

fn timestamp() -> Timestamp {
    Timestamp {
        seconds: 1_700_000_000,
        nanos: 0,
    }
}

async fn test_service() -> (EmulatorServiceHandlers, DbPool) {
    let url = "sqlite::memory:";
    let pool = SqlitePoolOptions::new()
        .max_connections(1)
        .connect(url)
        .await
        .expect("could not open sqlite pool");

    run_migrations(&pool)
        .await
        .expect("could not run migrations");

    (EmulatorServiceHandlers::new(pool.clone()), pool)
}

async fn insert_client(pool: &DbPool, id: &str, name: &str) {
    sqlx::query("insert into clients (id, name) values (?, ?)")
        .bind(id)
        .bind(name)
        .execute(pool)
        .await
        .expect("could not insert test client");
}

async fn insert_platform(pool: &DbPool, id: &str, path: &str) {
    sqlx::query("insert into platforms (id, path) values (?, ?)")
        .bind(id)
        .bind(path)
        .execute(pool)
        .await
        .expect("could not insert test platform");
}

async fn seed_default_profile(
    pool: &DbPool,
    platform_id: &str,
    client_id: &str,
    emulator_profile_id: &str,
) {
    sqlx::query(
        "insert into default_emulator_profiles (platform_id, client_id, emulator_profile_id) values (?, ?, ?)",
    )
    .bind(platform_id)
    .bind(client_id)
    .bind(emulator_profile_id)
    .execute(pool)
    .await
    .expect("could not insert default emulator profile");
}

async fn create_emulator(service: &EmulatorServiceHandlers, name: &str) -> Emulator {
    service
        .create_emulators(Request::new(CreateEmulatorsRequest {
            emulators: vec![Emulator {
                id: String::new(),
                name: name.to_string(),
                created_at: Some(timestamp()),
                updated_at: Some(timestamp()),
                built_in: true,
                libretro_name: Some(format!("{}.core", name.to_lowercase().replace(' ', "-"))),
            }],
        }))
        .await
        .expect("create_emulators failed")
        .into_inner()
        .emulators_created
        .into_iter()
        .next()
        .expect("expected created emulator")
}

async fn create_profile(
    service: &EmulatorServiceHandlers,
    emulator_id: &str,
    name: &str,
    custom_args: &str,
) -> EmulatorProfile {
    service
        .create_emulator_profiles(Request::new(CreateEmulatorProfilesRequest {
            profiles: vec![EmulatorProfile {
                id: String::new(),
                emulator_id: emulator_id.to_string(),
                name: name.to_string(),
                custom_args: custom_args.to_string(),
                built_in: true,
                created_at: Some(timestamp()),
                updated_at: Some(timestamp()),
            }],
        }))
        .await
        .expect("create_emulator_profiles failed")
        .into_inner()
        .profiles_created
        .into_iter()
        .next()
        .expect("expected created emulator profile")
}

async fn create_local_config(
    service: &EmulatorServiceHandlers,
    emulator_id: &str,
    client_id: &str,
) -> LocalEmulatorConfig {
    service
        .create_local_emulator_configs(Request::new(CreateLocalEmulatorConfigsRequest {
            configs: vec![LocalEmulatorConfig {
                id: String::new(),
                emulator_id: emulator_id.to_string(),
                client_id: client_id.to_string(),
                created_at: Some(timestamp()),
                updated_at: Some(timestamp()),
                executable_path: "/Applications/RetroArch.app".to_string(),
                nickname: Some("Desktop".to_string()),
                save_data_path: Some("/saves".to_string()),
                save_states_path: Some("/states".to_string()),
                bios_directory: Some("/bios".to_string()),
                extra_files_directory: Some("/extra".to_string()),
            }],
        }))
        .await
        .expect("create_local_emulator_configs failed")
        .into_inner()
        .configs_created
        .into_iter()
        .next()
        .expect("expected created local emulator config")
}

#[tokio::test]
async fn emulators_support_crud_and_reject_builtin_updates() {
    let (service, _pool) = test_service().await;

    let emulator = create_emulator(&service, "Test Emulator").await;
    assert!(!emulator.id.is_empty());
    assert!(!emulator.built_in);
    assert!(emulator.created_at.is_some());
    assert!(emulator.updated_at.is_some());

    let emulators = service
        .get_emulators(Request::new(GetEmulatorsRequest {
            ids: vec![emulator.id.clone()],
            supported_platform_ids: vec![],
        }))
        .await
        .expect("get_emulators failed")
        .into_inner()
        .emulators;

    assert_eq!(emulators.len(), 1);
    assert_eq!(emulators[0].name, "Test Emulator");

    let updated_emulator = service
        .update_emulators(Request::new(UpdateEmulatorsRequest {
            emulators: vec![Emulator {
                name: "Updated Emulator".to_string(),
                built_in: false,
                ..emulator.clone()
            }],
        }))
        .await
        .expect("update_emulators failed")
        .into_inner()
        .emulators_updated
        .into_iter()
        .next()
        .expect("expected updated emulator");

    assert_eq!(updated_emulator.name, "Updated Emulator");

    let err = service
        .update_emulators(Request::new(UpdateEmulatorsRequest {
            emulators: vec![Emulator {
                built_in: true,
                ..updated_emulator.clone()
            }],
        }))
        .await
        .expect_err("built-in emulator update should fail");

    assert_eq!(err.code(), Code::InvalidArgument);
    assert_eq!(err.message(), "cannot update built-in emulators");

    let deleted_emulator = service
        .delete_emulators(Request::new(DeleteEmulatorsRequest {
            ids: vec![updated_emulator.id.clone()],
        }))
        .await
        .expect("delete_emulators failed")
        .into_inner()
        .emulators_deleted
        .into_iter()
        .next()
        .expect("expected deleted emulator");

    assert_eq!(deleted_emulator.id, updated_emulator.id);

    let emulators = service
        .get_emulators(Request::new(GetEmulatorsRequest {
            ids: vec![updated_emulator.id],
            supported_platform_ids: vec![],
        }))
        .await
        .expect("get_emulators after delete failed")
        .into_inner()
        .emulators;

    assert!(emulators.is_empty());
}

#[tokio::test]
async fn emulator_platforms_can_be_updated_filtered_and_deleted() {
    let (service, pool) = test_service().await;
    let emulator = create_emulator(&service, "Mapped Emulator").await;

    let platform_a = "00000000-0000-0000-1000-000000000001";
    let platform_b = "00000000-0000-0000-1000-000000000002";

    insert_platform(&pool, platform_a, "/roms/platform-a").await;
    insert_platform(&pool, platform_b, "/roms/platform-b").await;

    let emulator_platforms = service
        .update_emulator_platforms(Request::new(UpdateEmulatorPlatformsRequest {
            emulator_id: emulator.id.clone(),
            platform_ids: vec![platform_a.to_string(), platform_b.to_string()],
        }))
        .await
        .expect("update_emulator_platforms failed")
        .into_inner()
        .emulator_platforms;

    let platform_ids = emulator_platforms
        .iter()
        .map(|ep| ep.platform_id.clone())
        .collect::<BTreeSet<_>>();

    assert_eq!(
        platform_ids,
        BTreeSet::from([platform_a.to_string(), platform_b.to_string()])
    );

    let emulator_platforms = service
        .get_emulator_platforms(Request::new(GetEmulatorPlatformsRequest {
            emulator_ids: vec![emulator.id.clone()],
            platform_ids: vec![],
        }))
        .await
        .expect("get_emulator_platforms failed")
        .into_inner()
        .emulator_platforms;

    assert_eq!(emulator_platforms.len(), 2);

    let supported = service
        .get_emulators(Request::new(GetEmulatorsRequest {
            ids: vec![],
            supported_platform_ids: vec![platform_b.to_string()],
        }))
        .await
        .expect("get_emulators with supported_platform_ids failed")
        .into_inner()
        .emulators;

    assert_eq!(supported.len(), 1);
    assert_eq!(supported[0].id, emulator.id);

    let deleted = service
        .delete_emulator_platforms(Request::new(DeleteEmulatorPlatformsRequest {
            emulator_id: emulator.id.clone(),
            platform_ids: vec![platform_b.to_string()],
        }))
        .await
        .expect("delete_emulator_platforms failed")
        .into_inner()
        .emulator_platforms_deleted;

    assert_eq!(deleted.len(), 1);
    assert_eq!(deleted[0].platform_id, platform_b);

    let emulator_platforms = service
        .get_emulator_platforms(Request::new(GetEmulatorPlatformsRequest {
            emulator_ids: vec![emulator.id],
            platform_ids: vec![],
        }))
        .await
        .expect("get_emulator_platforms after delete failed")
        .into_inner()
        .emulator_platforms;

    assert_eq!(emulator_platforms.len(), 1);
    assert_eq!(emulator_platforms[0].platform_id, platform_a);
}

#[tokio::test]
async fn emulator_profiles_support_crud() {
    let (service, _pool) = test_service().await;
    let emulator = create_emulator(&service, "Profile Host").await;

    let profile = create_profile(&service, &emulator.id, "Default", "{file}").await;
    assert!(!profile.id.is_empty());
    assert!(!profile.built_in);

    let profiles = service
        .get_emulator_profiles(Request::new(GetEmulatorProfilesRequest {
            ids: vec![],
            emulator_ids: vec![emulator.id.clone()],
        }))
        .await
        .expect("get_emulator_profiles failed")
        .into_inner()
        .profiles;

    assert_eq!(profiles.len(), 1);
    assert_eq!(profiles[0].id, profile.id);

    let updated_profile = service
        .update_emulator_profiles(Request::new(UpdateEmulatorProfilesRequest {
            profiles: vec![EmulatorProfile {
                name: "Fast Boot".to_string(),
                custom_args: "--fast {file}".to_string(),
                ..profile.clone()
            }],
        }))
        .await
        .expect("update_emulator_profiles failed")
        .into_inner()
        .profiles_updated
        .into_iter()
        .next()
        .expect("expected updated emulator profile");

    assert_eq!(updated_profile.name, "Fast Boot");
    assert_eq!(updated_profile.custom_args, "--fast {file}");

    let deleted_profile = service
        .delete_emulator_profiles(Request::new(DeleteEmulatorProfilesRequest {
            ids: vec![updated_profile.id.clone()],
        }))
        .await
        .expect("delete_emulator_profiles failed")
        .into_inner()
        .profiles_deleted
        .into_iter()
        .next()
        .expect("expected deleted emulator profile");

    assert_eq!(deleted_profile.id, updated_profile.id);
}

#[tokio::test]
async fn default_emulator_profiles_support_get_update_and_delete() {
    let (service, pool) = test_service().await;
    let client_id = "00000000-0000-0000-2000-000000000001";
    let platform_id = "00000000-0000-0000-2000-000000000002";

    insert_client(&pool, client_id, "Desktop Client").await;
    insert_platform(&pool, platform_id, "/roms/defaults").await;

    let emulator = create_emulator(&service, "Default Profile Host").await;
    let original_profile = create_profile(&service, &emulator.id, "Original", "{file}").await;
    let updated_profile =
        create_profile(&service, &emulator.id, "Updated", "--updated {file}").await;

    seed_default_profile(&pool, platform_id, client_id, &original_profile.id).await;

    let default_profile = service
        .get_default_emulator_profiles(Request::new(GetDefaultEmulatorProfilesRequest {
            platform_ids: vec![platform_id.to_string()],
            client_id: client_id.to_string(),
        }))
        .await
        .expect("get_default_emulator_profiles failed")
        .into_inner()
        .default_profiles
        .into_iter()
        .next()
        .expect("expected default emulator profile");

    assert_eq!(default_profile.platform_id, platform_id);
    assert_eq!(default_profile.client_id, client_id);
    assert_eq!(default_profile.emulator_profile_id, original_profile.id);

    let default_profile = service
        .update_default_emulator_profiles(Request::new(UpdateDefaultEmulatorProfilesRequest {
            default_profiles: vec![DefaultEmulatorProfile {
                platform_id: platform_id.to_string(),
                client_id: client_id.to_string(),
                emulator_profile_id: updated_profile.id.clone(),
                created_at: None,
                updated_at: None,
            }],
        }))
        .await
        .expect("update_default_emulator_profiles failed")
        .into_inner()
        .default_profiles_updated
        .into_iter()
        .next()
        .expect("expected updated default emulator profile");

    assert_eq!(default_profile.emulator_profile_id, updated_profile.id);

    let deleted_profile = service
        .delete_default_emulator_profiles(Request::new(DeleteDefaultEmulatorProfilesRequest {
            platform_ids: vec![platform_id.to_string()],
            client_id: client_id.to_string(),
        }))
        .await
        .expect("delete_default_emulator_profiles failed")
        .into_inner()
        .default_profiles_deleted
        .into_iter()
        .next()
        .expect("expected deleted default emulator profile");

    assert_eq!(deleted_profile.platform_id, platform_id);
    assert_eq!(deleted_profile.client_id, client_id);
}

#[tokio::test]
async fn local_emulator_configs_support_crud() {
    let (service, pool) = test_service().await;
    let client_id = "00000000-0000-0000-3000-000000000001";

    insert_client(&pool, client_id, "Portable Client").await;

    let emulator = create_emulator(&service, "Config Host").await;
    let config = create_local_config(&service, &emulator.id, client_id).await;

    let configs = service
        .get_local_emulator_configs(Request::new(GetLocalEmulatorConfigsRequest {
            emulator_ids: vec![emulator.id.clone()],
            client_id: client_id.to_string(),
        }))
        .await
        .expect("get_local_emulator_configs failed")
        .into_inner()
        .configs;

    assert_eq!(configs.len(), 1);
    assert_eq!(configs[0].id, config.id);

    let updated_config = service
        .update_local_emulator_configs(Request::new(UpdateLocalEmulatorConfigsRequest {
            configs: vec![LocalEmulatorConfig {
                executable_path: "/Applications/AltRetroArch.app".to_string(),
                nickname: Some("Laptop".to_string()),
                save_data_path: Some("/new-saves".to_string()),
                save_states_path: Some("/new-states".to_string()),
                bios_directory: Some("/new-bios".to_string()),
                extra_files_directory: Some("/new-extra".to_string()),
                ..config.clone()
            }],
        }))
        .await
        .expect("update_local_emulator_configs failed")
        .into_inner()
        .configs_updated
        .into_iter()
        .next()
        .expect("expected updated local emulator config");

    assert_eq!(updated_config.nickname.as_deref(), Some("Laptop"));
    assert_eq!(
        updated_config.executable_path,
        "/Applications/AltRetroArch.app"
    );

    let deleted_config = service
        .delete_local_emulator_configs(Request::new(DeleteLocalEmulatorConfigsRequest {
            ids: vec![updated_config.id.clone()],
        }))
        .await
        .expect("delete_local_emulator_configs failed")
        .into_inner()
        .configs_deleted
        .into_iter()
        .next()
        .expect("expected deleted local emulator config");

    assert_eq!(deleted_config.id, updated_config.id);
}
