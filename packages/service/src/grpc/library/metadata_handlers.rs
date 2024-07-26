use crate::providers::igdb::{games::match_games_igdb, platforms::match_platforms_igdb};

use super::LibraryServiceHandlers;
use bigdecimal::{BigDecimal, FromPrimitive, ToPrimitive};
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use prost::Message;
use retrom_codegen::{
    igdb,
    retrom::{
        self, GameGenre, GameMetadata, NewGameGenre, NewGameGenreMap, NewSimilarGameMap,
        UpdateLibraryMetadataResponse,
    },
};
use retrom_db::schema;
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
    let new_game_metadata = match_games_igdb(igdb_provider, games).await;

    match diesel::insert_into(schema::game_metadata::table)
        .values(&new_game_metadata)
        .on_conflict_do_nothing()
        .get_results::<retrom::GameMetadata>(&mut conn)
        .await
        .optional()
    {
        Ok(Some(metadata)) => response.game_metadata_populated.extend(metadata),
        Ok(None) => (),
        Err(e) => {
            tracing::error!("Failed to insert metadata: {}", e);
        }
    };

    let all_game_metadata: Vec<GameMetadata> = match schema::game_metadata::table
        .load::<retrom::GameMetadata>(&mut conn)
        .await
    {
        Ok(metadata) => metadata,
        Err(e) => {
            tracing::error!("Failed to load metadata: {}", e);
            return Ok(response);
        }
    };

    let game_igdb_ids: Vec<i64> = all_game_metadata.iter().filter_map(|m| m.igdb_id).collect();

    let query = format!(
        "fields genres.*, similar_games.*; where id = ({});",
        game_igdb_ids
            .iter()
            .map(|id| id.to_string())
            .collect::<Vec<String>>()
            .join(",")
    );

    let res = state
        .igdb_client
        .make_request("games.pb".into(), query)
        .await
        .ok();

    let bytes = match res {
        Some(res) => Some(res.bytes().await),
        None => {
            tracing::warn!("Failed to parse IGDB response");
            None
        }
    };

    let extra_metadata = bytes
        .and_then(|bytes| bytes.ok())
        .and_then(|bytes| igdb::GameResult::decode(bytes).ok());

    let mut new_genres: Vec<NewGameGenre> = vec![];

    if let Some(res) = &extra_metadata {
        res.games
            .iter()
            .flat_map(|igdb_game| {
                igdb_game.genres.iter().map(|genre| NewGameGenre {
                    slug: genre.slug.clone(),
                    name: genre.name.clone(),
                    ..Default::default()
                })
            })
            .for_each(|genre| new_genres.push(genre));
    }

    diesel::insert_into(schema::game_genres::table)
        .values(&new_genres)
        .on_conflict_do_nothing()
        .execute(&mut conn)
        .await
        .map_err(|e| e.to_string())?;

    let genres: Option<Vec<GameGenre>> = schema::game_genres::table
        .load::<GameGenre>(&mut conn)
        .await
        .ok();

    let mut genre_maps: Vec<NewGameGenreMap> = vec![];
    if let (Some(res), Some(genres)) = (&extra_metadata, genres) {
        res.games.iter().for_each(|igdb_game| {
            igdb_game.genres.iter().for_each(|igdb_genre| {
                let genre = match genres
                    .iter()
                    .find(|g| g.slug == igdb_genre.slug && g.name == igdb_genre.name)
                {
                    Some(genre) => genre,
                    None => return,
                };

                let igdb_id = BigDecimal::from_u64(igdb_game.id).and_then(|big| big.to_i64());

                if let Some(game_id) = &all_game_metadata
                    .iter()
                    .find(|metadata| metadata.igdb_id == igdb_id)
                    .map(|meta| meta.game_id)
                {
                    genre_maps.push(NewGameGenreMap {
                        game_id: *game_id,
                        genre_id: genre.id,
                        ..Default::default()
                    });
                };
            })
        })
    }

    diesel::insert_into(schema::game_genre_maps::table)
        .values(&genre_maps)
        .on_conflict_do_nothing()
        .execute(&mut conn)
        .await
        .map_err(|e| e.to_string())?;

    let mut similar_games: Vec<NewSimilarGameMap> = vec![];
    if let Some(res) = extra_metadata {
        res.games.iter().for_each(|game| {
            game.similar_games.iter().for_each(|similar_game| {
                let igdb_id_1 = match BigDecimal::from_u64(game.id) {
                    Some(id) => id.to_i64(),
                    None => return,
                };

                let igdb_id_2 = match BigDecimal::from_u64(similar_game.id) {
                    Some(id) => id.to_i64(),
                    None => return,
                };

                let game_id = match all_game_metadata
                    .iter()
                    .find(|metadata| metadata.igdb_id == igdb_id_1)
                    .map(|metadata| metadata.game_id)
                {
                    Some(id) => id,
                    None => return,
                };

                let similar_game_id = match all_game_metadata
                    .iter()
                    .find(|metadata| metadata.igdb_id == igdb_id_2)
                    .map(|metadata| metadata.game_id)
                {
                    Some(id) => id,
                    None => return,
                };

                similar_games.push(NewSimilarGameMap {
                    game_id,
                    similar_game_id,
                    ..Default::default()
                });

                similar_games.push(NewSimilarGameMap {
                    game_id: similar_game_id,
                    similar_game_id: game_id,
                    ..Default::default()
                });
            })
        });
    }

    diesel::insert_into(schema::similar_game_maps::table)
        .values(&similar_games)
        .on_conflict_do_nothing()
        .execute(&mut conn)
        .await
        .map_err(|e| e.to_string())?;

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
            vec![]
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
