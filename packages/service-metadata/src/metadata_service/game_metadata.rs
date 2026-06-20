use retrom_codegen::retrom::services::{
    metadata::v1::{
        GameMetadata, GameMetadataArtwork, GameMetadataLink, GameMetadataScreenshot,
        GameMetadataVideo,
    },
    tags::v1::{
        tags_service_client::TagsServiceClient, CreateTagDomainsRequest, CreateTagsRequest, Tag,
        TagDomain, TagView,
    },
};
use retrom_db::RetromDB;
use sqlx::{Executor, QueryBuilder};
use tonic::Status;

pub async fn upsert_game_metadata(
    conn: impl Executor<'_, Database = RetromDB>,
    metadata: &GameMetadata,
) -> Result<GameMetadata, Status> {
    if metadata.provider_id.is_empty() {
        return Err(Status::invalid_argument(
            "provider_id is required for game metadata",
        ));
    }

    let row_id = if metadata.id.trim().is_empty() {
        uuid::Uuid::now_v7().to_string()
    } else {
        metadata.id.clone()
    };

    let mut builder = QueryBuilder::new(
        r#"
                insert into game_metadata (
                    id, game_id, provider_id, name, description, cover_url, background_url,
                    icon_url, logo_url, provider_game_id, release_date, last_played, minutes_played
                )
                values (
                "#,
    );
    let mut separated = builder.separated(", ");
    separated.push_bind(&row_id);
    separated.push_bind(&metadata.game_id);
    separated.push_bind(&metadata.provider_id);
    separated.push_bind(&metadata.name);
    separated.push_bind(&metadata.description);
    separated.push_bind(&metadata.cover_url);
    separated.push_bind(&metadata.background_url);
    separated.push_bind(&metadata.icon_url);
    separated.push_bind(&metadata.logo_url);
    separated.push_bind(&metadata.provider_game_id);
    separated.push_bind(metadata.release_date);
    separated.push_bind(metadata.last_played);
    separated.push_bind(metadata.minutes_played);
    separated.push_unseparated(
        r#")
            on conflict (game_id, provider_id) do update set
                name = excluded.name,
                description = excluded.description,
                cover_url = excluded.cover_url,
                background_url = excluded.background_url,
                icon_url = excluded.icon_url,
                logo_url = excluded.logo_url,
                provider_game_id = excluded.provider_game_id,
                release_date = excluded.release_date,
                last_played = excluded.last_played,
                minutes_played = excluded.minutes_played,
                updated_at = current_timestamp
            returning *
        "#,
    );

    let metadata_updated: GameMetadata = builder
        .build_query_as()
        .fetch_one(conn)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    Ok(metadata_updated)
}

pub async fn upsert_game_screenshots(
    conn: impl Executor<'_, Database = RetromDB>,
    metadata: &GameMetadata,
    screenshots: Vec<GameMetadataScreenshot>,
) -> Result<Vec<GameMetadataScreenshot>, Status> {
    let mut builder =
        QueryBuilder::new("insert into game_metadata_screenshots (game_metadata_id, url) values ");

    builder.push_values(&screenshots, |mut b, screenshot| {
        b.push_bind(&metadata.id);
        b.push_bind(&screenshot.url);
    });

    builder.push(" on conflict (game_metadata_id, url) do nothing returning *");

    builder
        .build_query_as()
        .fetch_all(conn)
        .await
        .map_err(|e| Status::internal(e.to_string()))
}

pub async fn upsert_game_artworks(
    conn: impl Executor<'_, Database = RetromDB>,
    metadata: &GameMetadata,
    artworks: Vec<GameMetadataArtwork>,
) -> Result<Vec<GameMetadataArtwork>, Status> {
    let mut builder =
        QueryBuilder::new("insert into game_metadata_artworks (game_metadata_id, url) values ");

    builder.push_values(&artworks, |mut b, artwork| {
        b.push_bind(&metadata.id);
        b.push_bind(&artwork.url);
    });

    builder.push(" on conflict (game_metadata_id, url) do nothing returning *");

    builder
        .build_query_as()
        .fetch_all(conn)
        .await
        .map_err(|e| Status::internal(e.to_string()))
}

pub async fn upsert_game_videos(
    conn: impl Executor<'_, Database = RetromDB>,
    metadata: &GameMetadata,
    videos: Vec<GameMetadataVideo>,
) -> Result<Vec<GameMetadataVideo>, Status> {
    let mut builder =
        QueryBuilder::new("insert into game_metadata_videos (game_metadata_id, url) values ");

    builder.push_values(&videos, |mut b, video| {
        b.push_bind(&metadata.id);
        b.push_bind(&video.url);
    });

    builder.push(" on conflict (game_metadata_id, url) do nothing returning *");

    builder
        .build_query_as()
        .fetch_all(conn)
        .await
        .map_err(|e| Status::internal(e.to_string()))
}

pub async fn upsert_game_links(
    conn: impl Executor<'_, Database = RetromDB>,
    metadata: &GameMetadata,
    links: Vec<GameMetadataLink>,
) -> Result<Vec<GameMetadataLink>, Status> {
    let mut builder =
        QueryBuilder::new("insert into game_metadata_links (game_metadata_id, url) values ");

    builder.push_values(&links, |mut b, link| {
        b.push_bind(&metadata.id);
        b.push_bind(&link.url);
    });

    builder.push(" on conflict (game_metadata_id, url) do nothing returning *");

    builder
        .build_query_as()
        .fetch_all(conn)
        .await
        .map_err(|e| Status::internal(e.to_string()))
}
