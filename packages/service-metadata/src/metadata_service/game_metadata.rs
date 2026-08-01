use retrom_codegen::retrom::services::metadata::v1::{
    GameMetadata, GameMetadataArtworkRow, GameMetadataLinkRow, GameMetadataRow,
    GameMetadataScreenshotRow, GameMetadataVideoRow, SimilarGameRow,
};
use retrom_db::RetromDB;
use sqlx::{Executor, QueryBuilder};
use std::collections::HashSet;
use tonic::Status;
use tracing::warn;

pub fn game_metadata_row_from_metadata(metadata: &GameMetadata) -> GameMetadataRow {
    GameMetadataRow {
        id: metadata.id.clone(),
        provider_id: metadata.provider.clone(),
        provider_game_id: metadata.provider_game_id.clone(),
        created_at: metadata.created_at,
        updated_at: metadata.updated_at,
        game_id: metadata.game.clone(),
        name: metadata.name.clone(),
        description: metadata.description.clone(),
        release_date: metadata.release_date,
        last_played: metadata.last_played,
        minutes_played: metadata.minutes_played,
        cover_url: metadata.cover_url.clone(),
        icon_url: metadata.icon_url.clone(),
        background_url: metadata.background_url.clone(),
        logo_url: metadata.logo_url.clone(),
    }
}

pub struct GameMetadataRows {
    pub metadata_row: GameMetadataRow,
    pub artwork_rows: Vec<GameMetadataArtworkRow>,
    pub screenshot_rows: Vec<GameMetadataScreenshotRow>,
    pub video_rows: Vec<GameMetadataVideoRow>,
    pub link_rows: Vec<GameMetadataLinkRow>,
    pub similar_game_rows: Vec<SimilarGameRow>,
}

pub fn game_metadata_from_rows(rows: GameMetadataRows) -> GameMetadata {
    let GameMetadataRows {
        metadata_row: row,
        artwork_rows: artworks,
        screenshot_rows: screenshots,
        video_rows: videos,
        link_rows: links,
        similar_game_rows: similar_games,
    } = rows;

    let similar_game_ids: HashSet<String> = similar_games
        .into_iter()
        .flat_map(|row| vec![row.game_id, row.similar_game_id])
        .filter(|id| id != &row.game_id)
        .collect();

    GameMetadata {
        id: row.id,
        provider: row.provider_id,
        provider_game_id: row.provider_game_id,
        created_at: row.created_at,
        updated_at: row.updated_at,
        game: row.game_id,
        name: row.name,
        description: row.description,
        release_date: row.release_date,
        last_played: row.last_played,
        minutes_played: row.minutes_played,
        cover_url: row.cover_url,
        icon_url: row.icon_url,
        background_url: row.background_url,
        logo_url: row.logo_url,
        artworks: artworks.into_iter().map(|a| a.url).collect(),
        screenshots: screenshots.into_iter().map(|s| s.url).collect(),
        videos: videos.into_iter().map(|v| v.url).collect(),
        links: links.into_iter().map(|l| l.url).collect(),
        similar_games: similar_game_ids.into_iter().collect(),
    }
}

pub fn game_screenshot_rows_from_data(
    metadata_id: &str,
    urls: Vec<String>,
) -> Vec<GameMetadataScreenshotRow> {
    if metadata_id.is_empty() {
        warn!("GameMetadata id is empty, the resulting screenshot rows may be invalid");
    }

    urls.into_iter()
        .map(|url| GameMetadataScreenshotRow {
            game_metadata_id: metadata_id.to_string(),
            url: url.clone(),
        })
        .collect()
}

pub fn game_artwork_rows_from_data(
    metadata_id: &str,
    urls: Vec<String>,
) -> Vec<GameMetadataArtworkRow> {
    if metadata_id.is_empty() {
        warn!("GameMetadata id is empty, the resulting artwork rows may be invalid");
    }

    urls.into_iter()
        .map(|url| GameMetadataArtworkRow {
            game_metadata_id: metadata_id.to_string(),
            url: url.clone(),
        })
        .collect()
}

pub fn game_video_rows_from_data(
    metadata_id: &str,
    urls: Vec<String>,
) -> Vec<GameMetadataVideoRow> {
    if metadata_id.is_empty() {
        warn!("GameMetadata id is empty, the resulting video rows may be invalid");
    }

    urls.into_iter()
        .map(|url| GameMetadataVideoRow {
            game_metadata_id: metadata_id.to_string(),
            url: url.clone(),
        })
        .collect()
}

pub fn game_link_rows_from_data(metadata_id: &str, urls: Vec<String>) -> Vec<GameMetadataLinkRow> {
    if metadata_id.is_empty() {
        warn!("GameMetadata id is empty, the resulting link rows may be invalid");
    }

    urls.into_iter()
        .map(|url| GameMetadataLinkRow {
            game_metadata_id: metadata_id.to_string(),
            url: url.clone(),
        })
        .collect()
}

pub fn similar_game_rows_from_data(
    game_id: &str,
    similar_game_ids: Vec<String>,
) -> Vec<SimilarGameRow> {
    if game_id.is_empty() {
        warn!("Game id is empty, the resulting similar game rows may be invalid");
    }

    similar_game_ids
        .into_iter()
        .map(|similar_game_id| SimilarGameRow {
            game_id: game_id.to_string(),
            similar_game_id: similar_game_id.clone(),
            ..Default::default()
        })
        .collect()
}

pub async fn select_game_metadata_artworks(
    conn: impl Executor<'_, Database = RetromDB>,
    game_metadata_id: &str,
) -> Result<Vec<GameMetadataArtworkRow>, Status> {
    let artworks: Vec<GameMetadataArtworkRow> =
        QueryBuilder::new("select * from game_metadata_artworks where game_metadata_id = ")
            .push_bind(game_metadata_id)
            .build_query_as()
            .fetch_all(conn)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

    Ok(artworks)
}

pub async fn select_game_metadata_screenshots(
    conn: impl Executor<'_, Database = RetromDB>,
    game_metadata_id: &str,
) -> Result<Vec<GameMetadataScreenshotRow>, Status> {
    let screenshots: Vec<GameMetadataScreenshotRow> =
        QueryBuilder::new("select * from game_metadata_screenshots where game_metadata_id = ")
            .push_bind(game_metadata_id)
            .build_query_as()
            .fetch_all(conn)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

    Ok(screenshots)
}

pub async fn select_game_metadata_videos(
    conn: impl Executor<'_, Database = RetromDB>,
    game_metadata_id: &str,
) -> Result<Vec<GameMetadataVideoRow>, Status> {
    let videos: Vec<GameMetadataVideoRow> =
        QueryBuilder::new("select * from game_metadata_videos where game_metadata_id = ")
            .push_bind(game_metadata_id)
            .build_query_as()
            .fetch_all(conn)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

    Ok(videos)
}

pub async fn select_game_metadata_links(
    conn: impl Executor<'_, Database = RetromDB>,
    game_metadata_id: &str,
) -> Result<Vec<GameMetadataLinkRow>, Status> {
    let links: Vec<GameMetadataLinkRow> =
        QueryBuilder::new("select * from game_metadata_links where game_metadata_id = ")
            .push_bind(game_metadata_id)
            .build_query_as()
            .fetch_all(conn)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

    Ok(links)
}

pub async fn select_similar_games(
    conn: impl Executor<'_, Database = RetromDB>,
    game_id: &str,
) -> Result<Vec<SimilarGameRow>, Status> {
    let similar_games: Vec<SimilarGameRow> =
        QueryBuilder::new("select * from similar_games where game_id = ")
            .push_bind(game_id)
            .push(" or similar_game_id = ")
            .push_bind(game_id)
            .build_query_as()
            .fetch_all(conn)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

    Ok(similar_games)
}

pub async fn insert_game_metadata(
    conn: impl Executor<'_, Database = RetromDB>,
    metadata: &GameMetadataRow,
) -> Result<GameMetadataRow, Status> {
    let mut builder = QueryBuilder::new(
        r#"
        insert into game_metadata (
            id, 
            game_id, 
            provider_id, 
            provider_game_id, 
            name, 
            description, 
            release_date, 
            cover_url, 
            icon_url, 
            background_url, 
            logo_url
        )
        values (
        "#,
    );
    let mut separated = builder.separated(", ");
    separated.push_bind(uuid::Uuid::now_v7().to_string());
    separated.push_bind(&metadata.game_id);
    separated.push_bind(&metadata.provider_id);
    separated.push_bind(&metadata.provider_game_id);
    separated.push_bind(&metadata.name);
    separated.push_bind(&metadata.description);
    separated.push_bind(metadata.release_date);
    separated.push_bind(&metadata.cover_url);
    separated.push_bind(&metadata.icon_url);
    separated.push_bind(&metadata.background_url);
    separated.push_bind(&metadata.logo_url);

    builder.push(") returning *");

    let row: GameMetadataRow = builder
        .build_query_as()
        .fetch_one(conn)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    Ok(row)
}

pub async fn update_game_metadata(
    conn: impl Executor<'_, Database = RetromDB>,
    metadata: &GameMetadataRow,
    field_mask: &HashSet<String>,
) -> Result<GameMetadataRow, Status> {
    let empty_mask = field_mask.is_empty();

    let mut builder = QueryBuilder::new("update game_metadata set ");

    let mut separated = builder.separated(", ");

    separated.push("updated_at = current_timestamp ");

    if empty_mask || field_mask.contains("name") {
        separated
            .push("name = ")
            .push_bind_unseparated(&metadata.name);
    };

    if empty_mask || field_mask.contains("description") {
        separated
            .push("description = ")
            .push_bind_unseparated(&metadata.description);
    };

    if empty_mask || field_mask.contains("cover_url") {
        separated
            .push("cover_url = ")
            .push_bind_unseparated(&metadata.cover_url);
    };

    if empty_mask || field_mask.contains("background_url") {
        separated
            .push("background_url = ")
            .push_bind_unseparated(&metadata.background_url);
    };

    if empty_mask || field_mask.contains("icon_url") {
        separated
            .push("icon_url = ")
            .push_bind_unseparated(&metadata.icon_url);
    };

    if empty_mask || field_mask.contains("logo_url") {
        separated
            .push("logo_url = ")
            .push_bind_unseparated(&metadata.logo_url);
    };

    if empty_mask || field_mask.contains("release_date") {
        separated
            .push("release_date = ")
            .push_bind_unseparated(metadata.release_date);
    };

    if empty_mask || field_mask.contains("last_played") {
        separated
            .push("last_played = ")
            .push_bind_unseparated(metadata.last_played);
    };

    if empty_mask || field_mask.contains("minutes_played") {
        separated
            .push("minutes_played = ")
            .push_bind_unseparated(metadata.minutes_played);
    };

    builder.push("where id = ");
    builder.push_bind(&metadata.id);
    builder.push(" returning *");

    let sql = builder.sql();
    tracing::info!("Executing SQL: {}", sql);

    let row: GameMetadataRow = builder
        .build_query_as()
        .fetch_one(conn)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    Ok(row)
}

pub async fn upsert_game_screenshots(
    conn: impl Executor<'_, Database = RetromDB>,
    screenshots: Vec<GameMetadataScreenshotRow>,
) -> Result<Vec<GameMetadataScreenshotRow>, Status> {
    if screenshots.is_empty() {
        return Ok(vec![]);
    }

    let mut builder =
        QueryBuilder::new("insert into game_metadata_screenshots (game_metadata_id, url) ");

    builder.push_values(&screenshots, |mut b, screenshot| {
        b.push_bind(&screenshot.game_metadata_id);
        b.push_bind(&screenshot.url);
    });

    builder.push(
        r#" 
        on conflict (game_metadata_id, url) do update 
            set url = excluded.url 
        returning *
        "#,
    );

    builder
        .build_query_as()
        .fetch_all(conn)
        .await
        .map_err(|e| Status::internal(e.to_string()))
}

pub async fn upsert_game_artworks(
    conn: impl Executor<'_, Database = RetromDB>,
    artworks: Vec<GameMetadataArtworkRow>,
) -> Result<Vec<GameMetadataArtworkRow>, Status> {
    if artworks.is_empty() {
        return Ok(vec![]);
    }

    let mut builder =
        QueryBuilder::new("insert into game_metadata_artworks (game_metadata_id, url) ");

    builder.push_values(&artworks, |mut b, artwork| {
        b.push_bind(&artwork.game_metadata_id);
        b.push_bind(&artwork.url);
    });

    builder.push(
        r#" 
        on conflict (game_metadata_id, url) do update 
            set url = excluded.url 
        returning *
        "#,
    );

    builder
        .build_query_as()
        .fetch_all(conn)
        .await
        .map_err(|e| Status::internal(e.to_string()))
}

pub async fn upsert_game_videos(
    conn: impl Executor<'_, Database = RetromDB>,
    videos: Vec<GameMetadataVideoRow>,
) -> Result<Vec<GameMetadataVideoRow>, Status> {
    if videos.is_empty() {
        return Ok(vec![]);
    }

    let mut builder =
        QueryBuilder::new("insert into game_metadata_videos (game_metadata_id, url) ");

    builder.push_values(&videos, |mut b, video| {
        b.push_bind(&video.game_metadata_id);
        b.push_bind(&video.url);
    });

    builder.push(
        r#" 
        on conflict (game_metadata_id, url) do update 
            set url = excluded.url 
        returning *
        "#,
    );

    builder
        .build_query_as()
        .fetch_all(conn)
        .await
        .map_err(|e| Status::internal(e.to_string()))
}

pub async fn upsert_game_links(
    conn: impl Executor<'_, Database = RetromDB>,
    links: Vec<GameMetadataLinkRow>,
) -> Result<Vec<GameMetadataLinkRow>, Status> {
    if links.is_empty() {
        return Ok(vec![]);
    }

    let mut builder = QueryBuilder::new("insert into game_metadata_links (game_metadata_id, url) ");

    builder.push_values(&links, |mut b, link| {
        b.push_bind(&link.game_metadata_id);
        b.push_bind(&link.url);
    });

    builder.push(
        r#" 
        on conflict (game_metadata_id, url) do update 
            set url = excluded.url 
        returning *
        "#,
    );

    builder
        .build_query_as()
        .fetch_all(conn)
        .await
        .map_err(|e| Status::internal(e.to_string()))
}

pub async fn upsert_similar_games(
    conn: impl Executor<'_, Database = RetromDB>,
    similar_games: Vec<SimilarGameRow>,
) -> Result<Vec<SimilarGameRow>, Status> {
    if similar_games.is_empty() {
        return Ok(vec![]);
    }

    let mut builder = QueryBuilder::new("insert into similar_games (game_id, similar_game_id) ");

    builder.push_values(&similar_games, |mut b, similar_game| {
        b.push_bind(&similar_game.game_id);
        b.push_bind(&similar_game.similar_game_id);
    });

    builder.push(
        r#" 
        on conflict (game_id, similar_game_id) do update 
            set game_id = excluded.game_id,
                similar_game_id = excluded.similar_game_id
        returning *
        "#,
    );

    builder
        .build_query_as()
        .fetch_all(conn)
        .await
        .map_err(|e| Status::internal(e.to_string()))
}
