use retrom_codegen::retrom::services::metadata::v1::{PlatformMetadata, PlatformMetadataRow};
use retrom_db::RetromDB;
use sqlx::{Executor, QueryBuilder};
use std::collections::HashSet;
use tonic::Status;

pub fn platform_metadata_from_rows(row: PlatformMetadataRow) -> PlatformMetadata {
    PlatformMetadata {
        id: row.id,
        platform: row.platform_id,
        provider: row.provider_id,
        provider_platform_id: row.provider_platform_id,
        created_at: row.created_at,
        updated_at: row.updated_at,
        name: row.name,
        description: row.description,
        background_url: row.background_url,
        icon_url: row.icon_url,
        logo_url: row.logo_url,
    }
}

pub fn rows_from_platform_metadata(metadata: PlatformMetadata) -> PlatformMetadataRow {
    PlatformMetadataRow {
        id: metadata.id,
        platform_id: metadata.platform,
        provider_id: metadata.provider,
        provider_platform_id: metadata.provider_platform_id,
        created_at: metadata.created_at,
        updated_at: metadata.updated_at,
        name: metadata.name,
        description: metadata.description,
        background_url: metadata.background_url,
        icon_url: metadata.icon_url,
        logo_url: metadata.logo_url,
    }
}

pub async fn insert_platform_metadata(
    conn: impl Executor<'_, Database = RetromDB>,
    metadata: PlatformMetadataRow,
) -> Result<PlatformMetadataRow, Status> {
    let mut builder = QueryBuilder::new(
        r#"
        insert into platform_metadata (
            id,
            platform_id,
            provider_id,
            provider_platform_id,
            name,
            description,
            background_url,
            icon_url,
            logo_url
        )
        values (
        "#,
    );

    let mut separated = builder.separated(", ");
    separated.push_bind(uuid::Uuid::now_v7().to_string());
    separated.push_bind(&metadata.platform_id);
    separated.push_bind(&metadata.provider_id);
    separated.push_bind(&metadata.provider_platform_id);
    separated.push_bind(&metadata.name);
    separated.push_bind(&metadata.description);
    separated.push_bind(&metadata.background_url);
    separated.push_bind(&metadata.icon_url);
    separated.push_bind(&metadata.logo_url);

    builder.push(") returning *");

    let row: PlatformMetadataRow = builder
        .build_query_as()
        .fetch_one(conn)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    Ok(row)
}

pub async fn update_platform_metadata(
    conn: impl Executor<'_, Database = RetromDB>,
    metadata: &PlatformMetadataRow,
    field_mask: &HashSet<String>,
) -> Result<PlatformMetadataRow, Status> {
    let empty_mask = field_mask.is_empty();

    let mut builder = QueryBuilder::new("update platform_metadata set ");
    let mut separated = builder.separated(", ");

    if empty_mask || field_mask.contains("name") {
        separated
            .push_unseparated("name = ")
            .push_bind(&metadata.name);
    }

    if empty_mask || field_mask.contains("description") {
        separated
            .push_unseparated("description = ")
            .push_bind(&metadata.description);
    }

    if empty_mask || field_mask.contains("background_url") {
        separated
            .push_unseparated("background_url = ")
            .push_bind(&metadata.background_url);
    }

    if empty_mask || field_mask.contains("icon_url") {
        separated
            .push_unseparated("icon_url = ")
            .push_bind(&metadata.icon_url);
    }

    if empty_mask || field_mask.contains("logo_url") {
        separated
            .push_unseparated("logo_url = ")
            .push_bind(&metadata.logo_url);
    }

    builder.push(" where id = ");
    builder.push_bind(&metadata.id);
    builder.push(" returning *");

    let row: PlatformMetadataRow = builder
        .build_query_as()
        .fetch_one(conn)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    Ok(row)
}
