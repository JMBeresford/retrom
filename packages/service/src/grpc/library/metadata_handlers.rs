use crate::providers::igdb::{games::match_games_igdb, platforms::match_platforms_igdb};

use super::LibraryServiceHandlers;
use db::schema;
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use generated::retrom::{self, UpdateLibraryMetadataResponse};
use tracing::instrument;

#[instrument(skip(state))]
pub async fn update_metadata(
    state: &LibraryServiceHandlers,
    overwrite: bool,
) -> Result<UpdateLibraryMetadataResponse, String> {
    let mut response = UpdateLibraryMetadataResponse {
        game_metadata_populated: vec![],
        platform_metadata_populated: vec![],
    };

    let mut conn = match state.db_pool.get().await {
        Ok(conn) => conn,
        Err(why) => {
            tracing::error!("Failed to get connection: {}", why);
            return Err(why.to_string());
        }
    };

    let games = match schema::games::table.load::<retrom::Game>(&mut conn).await {
        Ok(games) => games,
        Err(e) => {
            tracing::error!("Failed to load games: {}", e);
            return Ok(response);
        }
    };

    let igdb_provider = state.igdb_client.clone();
    let all_game_metadata = match match_games_igdb(igdb_provider, games).await {
        Ok(metadata) => metadata,
        Err(e) => {
            tracing::error!("Failed to match games: {}", e);
            return Err(e.to_string());
        }
    };

    match diesel::insert_into(schema::game_metadata::table)
        .values(&all_game_metadata)
        .on_conflict_do_nothing()
        .get_results::<retrom::GameMetadata>(&mut conn)
        .await
        .optional()
    {
        Ok(Some(metadata)) => response.game_metadata_populated.extend(metadata),
        Ok(None) => (),
        Err(e) => {
            tracing::error!("Failed to insert metadata: {}", e);
            return Err(e.to_string());
        }
    };

    let platforms = match schema::platforms::table
        .load::<retrom::Platform>(&mut conn)
        .await
    {
        Ok(platforms) => platforms,
        Err(e) => {
            tracing::error!("Failed to load platforms: {}", e);
            return Ok(response);
        }
    };

    let igdb_provider = state.igdb_client.clone();
    let all_platform_metadata = match match_platforms_igdb(igdb_provider, platforms).await {
        Ok(metadata) => metadata,
        Err(e) => {
            tracing::error!("Failed to match platforms: {}", e);
            return Err(e.to_string());
        }
    };

    match diesel::insert_into(schema::platform_metadata::table)
        .values(&all_platform_metadata)
        .on_conflict_do_nothing()
        .get_results::<retrom::PlatformMetadata>(&mut conn)
        .await
        .optional()
    {
        Ok(Some(metadata)) => response.platform_metadata_populated.extend(metadata),
        Ok(None) => (),
        Err(e) => {
            tracing::error!("Failed to insert metadata: {}", e);
            return Err(e.to_string());
        }
    };

    Ok(response)
}
