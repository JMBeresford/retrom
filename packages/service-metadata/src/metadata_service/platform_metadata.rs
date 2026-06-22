use retrom_codegen::retrom::services::metadata::v1::PlatformMetadata;
use retrom_db::RetromDB;
use sqlx::{Executor, QueryBuilder};
use tonic::Status;

pub async fn upsert_platform_metadata(
    conn: impl Executor<'_, Database = RetromDB>,
    metadata: &PlatformMetadata,
) -> Result<PlatformMetadata, Status> {
    if metadata.provider_id.is_empty() {
        return Err(Status::invalid_argument(
            "provider_id is required for platform metadata",
        ));
    }

    let row_id = if metadata.id.trim().is_empty() {
        uuid::Uuid::now_v7().to_string()
    } else {
        metadata.id.clone()
    };

    let mut builder = QueryBuilder::<RetromDB>::new(
        r#"
                insert into platform_metadata (
                    id, platform_id, provider_id, name, description, background_url, icon_url,
                    logo_url, provider_platform_id
                )
                values (
                "#,
    );
    let mut separated = builder.separated(", ");
    separated.push_bind(&row_id);
    separated.push_bind(&metadata.platform_id);
    separated.push_bind(&metadata.provider_id);
    separated.push_bind(&metadata.name);
    separated.push_bind(&metadata.description);
    separated.push_bind(&metadata.background_url);
    separated.push_bind(&metadata.icon_url);
    separated.push_bind(&metadata.logo_url);
    separated.push_bind(&metadata.provider_platform_id);
    separated.push_unseparated(
        r#")
                on conflict (platform_id, provider_id) do update set
                    name = excluded.name,
                    description = excluded.description,
                    background_url = excluded.background_url,
                    icon_url = excluded.icon_url,
                    logo_url = excluded.logo_url,
                    provider_platform_id = excluded.provider_platform_id,
                    updated_at = current_timestamp
                returning *
                "#,
    );

    let updated_row: PlatformMetadata = builder
        .build_query_as()
        .fetch_one(conn)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    Ok(updated_row)
}
