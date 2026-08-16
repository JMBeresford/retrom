use retrom_codegen::retrom::services::emulators::v1::{
    emulator_service_server::EmulatorService, CreateDefaultEmulatorProfileRequest,
    CreateEmulatorProfileRequest, CreateEmulatorRequest, DefaultEmulatorProfile, DeleteEmulatorProfileRequest,
    DeleteEmulatorRequest, Emulator, EmulatorProfile, GetEmulatorProfileRequest, GetEmulatorRequest,
    ListEmulatorsRequest, ListEmulatorProfilesRequest, UpdateEmulatorProfileRequest,
    UpdateEmulatorRequest, DeleteDefaultEmulatorProfileRequest, GetDefaultEmulatorProfileRequest,
};
use tonic::{Request, Status};

use crate::EmulatorServiceHandlers;

async fn get_test_db_pool() -> DbPool {
    let pool = sqlx::SqlitePool::connect("sqlite::memory:")
        .await
        .expect("Failed to connect to test database");

    retrom_db::run_migrations(&pool)
        .await
        .expect("Failed to run migrations on test database");

    pool
}

fn make_service(pool: DbPool) -> EmulatorServiceHandlers {
    EmulatorServiceHandlers::new(pool)
}

// ─── Emulator CRUD ───────────────────────────────────────────────────────────

#[tokio::test]
async fn test_create_and_get_emulator() -> Result<(), Status> {
    let svc = make_service(get_test_db_pool().await);

    let emulator = svc
        .create_emulator(Request::new(CreateEmulatorRequest {
            emulator: Some(Emulator {
                name: "TestEmu".to_string(),
                ..Default::default()
            }),
        }))
        .await?
        .into_inner();

    assert_eq!(emulator.name, "TestEmu");
    assert!(!emulator.id.is_empty());

    let fetched = svc
        .get_emulator(Request::new(GetEmulatorRequest {
            id: emulator.id.clone(),
        }))
        .await?
        .into_inner();

    assert_eq!(fetched.id, emulator.id);
    assert_eq!(fetched.name, "TestEmu");

    Ok(())
}

#[tokio::test]
async fn test_get_emulator_not_found() {
    let svc = make_service(get_test_db_pool().await);

    let result = svc
        .get_emulator(Request::new(GetEmulatorRequest {
            id: "nonexistent-id".to_string(),
        }))
        .await;

    assert!(result.is_err());
    assert_eq!(result.unwrap_err().code(), tonic::Code::NotFound);
}

#[tokio::test]
async fn test_list_emulators() -> Result<(), Status> {
    let svc = make_service(get_test_db_pool().await);

    svc.create_emulator(Request::new(CreateEmulatorRequest {
        emulator: Some(Emulator {
            name: "Emu1".to_string(),
            ..Default::default()
        }),
    }))
    .await?;

    svc.create_emulator(Request::new(CreateEmulatorRequest {
        emulator: Some(Emulator {
            name: "Emu2".to_string(),
            ..Default::default()
        }),
    }))
    .await?;

    let list = svc
        .list_emulators(Request::new(ListEmulatorsRequest::default()))
        .await?
        .into_inner();

    assert_eq!(list.emulators.len(), 2);

    Ok(())
}

#[tokio::test]
async fn test_update_emulator() -> Result<(), Status> {
    let svc = make_service(get_test_db_pool().await);

    let emulator = svc
        .create_emulator(Request::new(CreateEmulatorRequest {
            emulator: Some(Emulator {
                name: "OldName".to_string(),
                ..Default::default()
            }),
        }))
        .await?
        .into_inner();

    let updated = svc
        .update_emulator(Request::new(UpdateEmulatorRequest {
            emulator: Some(Emulator {
                id: emulator.id.clone(),
                name: "NewName".to_string(),
                ..Default::default()
            }),
        }))
        .await?
        .into_inner();

    assert_eq!(updated.name, "NewName");

    Ok(())
}

#[tokio::test]
async fn test_update_emulator_not_found() {
    let svc = make_service(get_test_db_pool().await);

    let result = svc
        .update_emulator(Request::new(UpdateEmulatorRequest {
            emulator: Some(Emulator {
                id: "nonexistent-id".to_string(),
                name: "SomeName".to_string(),
                ..Default::default()
            }),
        }))
        .await;

    assert!(result.is_err());
    assert_eq!(result.unwrap_err().code(), tonic::Code::NotFound);
}

#[tokio::test]
async fn test_delete_emulator() -> Result<(), Status> {
    let svc = make_service(get_test_db_pool().await);

    let emulator = svc
        .create_emulator(Request::new(CreateEmulatorRequest {
            emulator: Some(Emulator {
                name: "ToDelete".to_string(),
                ..Default::default()
            }),
        }))
        .await?
        .into_inner();

    svc.delete_emulator(Request::new(DeleteEmulatorRequest {
        id: emulator.id.clone(),
    }))
    .await?;

    let result = svc
        .get_emulator(Request::new(GetEmulatorRequest {
            id: emulator.id,
        }))
        .await;

    assert!(result.is_err());
    assert_eq!(result.unwrap_err().code(), tonic::Code::NotFound);

    Ok(())
}

// ─── EmulatorProfile CRUD ────────────────────────────────────────────────────

async fn create_test_emulator(svc: &EmulatorServiceHandlers) -> Emulator {
    svc.create_emulator(Request::new(CreateEmulatorRequest {
        emulator: Some(Emulator {
            name: "TestEmulator".to_string(),
            ..Default::default()
        }),
    }))
    .await
    .expect("Failed to create test emulator")
    .into_inner()
}

#[tokio::test]
async fn test_create_and_get_emulator_profile() -> Result<(), Status> {
    let svc = make_service(get_test_db_pool().await);
    let emulator = create_test_emulator(&svc).await;

    let profile = svc
        .create_emulator_profile(Request::new(CreateEmulatorProfileRequest {
            emulator_profile: Some(EmulatorProfile {
                emulator: emulator.id.clone(),
                name: "TestProfile".to_string(),
                ..Default::default()
            }),
        }))
        .await?
        .into_inner();

    assert_eq!(profile.name, "TestProfile");
    assert_eq!(profile.emulator, emulator.id);
    assert!(!profile.id.is_empty());

    let fetched = svc
        .get_emulator_profile(Request::new(GetEmulatorProfileRequest {
            id: profile.id.clone(),
        }))
        .await?
        .into_inner();

    assert_eq!(fetched.id, profile.id);
    assert_eq!(fetched.name, "TestProfile");

    Ok(())
}

#[tokio::test]
async fn test_get_emulator_profile_not_found() {
    let svc = make_service(get_test_db_pool().await);

    let result = svc
        .get_emulator_profile(Request::new(GetEmulatorProfileRequest {
            id: "nonexistent-id".to_string(),
        }))
        .await;

    assert!(result.is_err());
    assert_eq!(result.unwrap_err().code(), tonic::Code::NotFound);
}

#[tokio::test]
async fn test_list_emulator_profiles() -> Result<(), Status> {
    let svc = make_service(get_test_db_pool().await);
    let emulator = create_test_emulator(&svc).await;

    svc.create_emulator_profile(Request::new(CreateEmulatorProfileRequest {
        emulator_profile: Some(EmulatorProfile {
            emulator: emulator.id.clone(),
            name: "Profile1".to_string(),
            ..Default::default()
        }),
    }))
    .await?;

    svc.create_emulator_profile(Request::new(CreateEmulatorProfileRequest {
        emulator_profile: Some(EmulatorProfile {
            emulator: emulator.id.clone(),
            name: "Profile2".to_string(),
            ..Default::default()
        }),
    }))
    .await?;

    let list = svc
        .list_emulator_profiles(Request::new(ListEmulatorProfilesRequest {
            emulator_ids: vec![emulator.id.clone()],
            ..Default::default()
        }))
        .await?
        .into_inner();

    assert_eq!(list.profiles.len(), 2);

    Ok(())
}

#[tokio::test]
async fn test_update_emulator_profile() -> Result<(), Status> {
    let svc = make_service(get_test_db_pool().await);
    let emulator = create_test_emulator(&svc).await;

    let profile = svc
        .create_emulator_profile(Request::new(CreateEmulatorProfileRequest {
            emulator_profile: Some(EmulatorProfile {
                emulator: emulator.id.clone(),
                name: "OriginalName".to_string(),
                ..Default::default()
            }),
        }))
        .await?
        .into_inner();

    let updated = svc
        .update_emulator_profile(Request::new(UpdateEmulatorProfileRequest {
            profile: Some(EmulatorProfile {
                id: profile.id.clone(),
                name: "UpdatedName".to_string(),
                emulator: emulator.id.clone(),
                ..Default::default()
            }),
        }))
        .await?
        .into_inner();

    assert_eq!(updated.name, "UpdatedName");

    Ok(())
}

#[tokio::test]
async fn test_update_emulator_profile_not_found() {
    let svc = make_service(get_test_db_pool().await);

    let result = svc
        .update_emulator_profile(Request::new(UpdateEmulatorProfileRequest {
            profile: Some(EmulatorProfile {
                id: "nonexistent-id".to_string(),
                name: "Name".to_string(),
                ..Default::default()
            }),
        }))
        .await;

    assert!(result.is_err());
    assert_eq!(result.unwrap_err().code(), tonic::Code::NotFound);
}

#[tokio::test]
async fn test_update_builtin_emulator_profile_rejected() -> Result<(), Status> {
    let svc = make_service(get_test_db_pool().await);

    // Seed a built-in emulator profile directly in the DB
    let pool = svc.db_pool.clone();
    let emu_id = uuid::Uuid::now_v7().to_string();
    let profile_id = uuid::Uuid::now_v7().to_string();

    sqlx::query(
        "insert into emulators (id, name, built_in) values (?, ?, ?)",
    )
    .bind(&emu_id)
    .bind("BuiltInEmu")
    .bind(true)
    .execute(&pool)
    .await
    .expect("Failed to insert built-in emulator");

    sqlx::query(
        "insert into emulator_profiles (id, emulator, name, built_in) values (?, ?, ?, ?)",
    )
    .bind(&profile_id)
    .bind(&emu_id)
    .bind("BuiltInProfile")
    .bind(true)
    .execute(&pool)
    .await
    .expect("Failed to insert built-in profile");

    let result = svc
        .update_emulator_profile(Request::new(UpdateEmulatorProfileRequest {
            profile: Some(EmulatorProfile {
                id: profile_id,
                name: "HackedName".to_string(),
                ..Default::default()
            }),
        }))
        .await;

    assert!(result.is_err());
    assert_eq!(result.unwrap_err().code(), tonic::Code::InvalidArgument);

    Ok(())
}

#[tokio::test]
async fn test_delete_emulator_profile() -> Result<(), Status> {
    let svc = make_service(get_test_db_pool().await);
    let emulator = create_test_emulator(&svc).await;

    let profile = svc
        .create_emulator_profile(Request::new(CreateEmulatorProfileRequest {
            emulator_profile: Some(EmulatorProfile {
                emulator: emulator.id.clone(),
                name: "ToDeleteProfile".to_string(),
                ..Default::default()
            }),
        }))
        .await?
        .into_inner();

    svc.delete_emulator_profile(Request::new(DeleteEmulatorProfileRequest {
        id: profile.id.clone(),
    }))
    .await?;

    let result = svc
        .get_emulator_profile(Request::new(GetEmulatorProfileRequest {
            id: profile.id,
        }))
        .await;

    assert!(result.is_err());
    assert_eq!(result.unwrap_err().code(), tonic::Code::NotFound);

    Ok(())
}

// ─── DefaultEmulatorProfile CRUD ─────────────────────────────────────────────

#[tokio::test]
async fn test_create_and_get_default_emulator_profile() -> Result<(), Status> {
    let svc = make_service(get_test_db_pool().await);
    let emulator = create_test_emulator(&svc).await;

    // Need a client and platform first
    let pool = &svc.db_pool;
    let client_id = uuid::Uuid::now_v7().to_string();
    let platform_id = uuid::Uuid::now_v7().to_string();

    sqlx::query("insert into clients (id, name) values (?, ?)")
        .bind(&client_id)
        .bind("TestClient")
        .execute(pool)
        .await
        .expect("Failed to insert client");

    sqlx::query("insert into platforms (id) values (?)")
        .bind(&platform_id)
        .execute(pool)
        .await
        .expect("Failed to insert platform");

    let profile = svc
        .create_emulator_profile(Request::new(CreateEmulatorProfileRequest {
            emulator_profile: Some(EmulatorProfile {
                emulator: emulator.id.clone(),
                name: "DefaultProfile".to_string(),
                ..Default::default()
            }),
        }))
        .await?
        .into_inner();

    let default_profile = svc
        .create_default_emulator_profile(Request::new(CreateDefaultEmulatorProfileRequest {
            default_emulator_profile: Some(DefaultEmulatorProfile {
                platform: platform_id.clone(),
                client: client_id.clone(),
                emulator_profile: profile.id.clone(),
                ..Default::default()
            }),
        }))
        .await?
        .into_inner();

    assert_eq!(default_profile.platform, platform_id);
    assert_eq!(default_profile.client, client_id);
    assert_eq!(default_profile.emulator_profile, profile.id);
    assert!(!default_profile.id.is_empty());

    let fetched = svc
        .get_default_emulator_profile(Request::new(GetDefaultEmulatorProfileRequest {
            id: default_profile.id.clone(),
        }))
        .await?
        .into_inner();

    assert_eq!(fetched.id, default_profile.id);

    Ok(())
}

#[tokio::test]
async fn test_get_default_emulator_profile_not_found() {
    let svc = make_service(get_test_db_pool().await);

    let result = svc
        .get_default_emulator_profile(Request::new(GetDefaultEmulatorProfileRequest {
            id: "nonexistent-id".to_string(),
        }))
        .await;

    assert!(result.is_err());
    assert_eq!(result.unwrap_err().code(), tonic::Code::NotFound);
}

#[tokio::test]
async fn test_delete_default_emulator_profile() -> Result<(), Status> {
    let svc = make_service(get_test_db_pool().await);
    let emulator = create_test_emulator(&svc).await;

    let pool = &svc.db_pool;
    let client_id = uuid::Uuid::now_v7().to_string();
    let platform_id = uuid::Uuid::now_v7().to_string();

    sqlx::query("insert into clients (id, name) values (?, ?)")
        .bind(&client_id)
        .bind("TestClient2")
        .execute(pool)
        .await
        .expect("Failed to insert client");

    sqlx::query("insert into platforms (id) values (?)")
        .bind(&platform_id)
        .execute(pool)
        .await
        .expect("Failed to insert platform");

    let profile = svc
        .create_emulator_profile(Request::new(CreateEmulatorProfileRequest {
            emulator_profile: Some(EmulatorProfile {
                emulator: emulator.id.clone(),
                name: "AnotherProfile".to_string(),
                ..Default::default()
            }),
        }))
        .await?
        .into_inner();

    let default_profile = svc
        .create_default_emulator_profile(Request::new(CreateDefaultEmulatorProfileRequest {
            default_emulator_profile: Some(DefaultEmulatorProfile {
                platform: platform_id.clone(),
                client: client_id.clone(),
                emulator_profile: profile.id.clone(),
                ..Default::default()
            }),
        }))
        .await?
        .into_inner();

    svc.delete_default_emulator_profile(Request::new(
        DeleteDefaultEmulatorProfileRequest {
            id: default_profile.id.clone(),
        },
    ))
    .await?;

    let result = svc
        .get_default_emulator_profile(Request::new(GetDefaultEmulatorProfileRequest {
            id: default_profile.id,
        }))
        .await;

    assert!(result.is_err());
    assert_eq!(result.unwrap_err().code(), tonic::Code::NotFound);

    Ok(())
}
