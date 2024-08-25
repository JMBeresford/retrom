use crate::providers::igdb::{games::match_games_igdb, platforms::match_platform_igdb};

use super::LibraryServiceHandlers;
use bigdecimal::{BigDecimal, FromPrimitive, ToPrimitive};
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use prost::Message;
use retrom_codegen::{
    igdb,
    retrom::{self, GameGenre, GameMetadata, NewGameGenre, NewGameGenreMap, NewSimilarGameMap},
};
use retrom_db::schema;
use tracing::instrument;

#[instrument(skip(state))]
pub async fn update_metadata(
    state: &LibraryServiceHandlers,
    overwrite: bool,
) -> Result<(), String> {
    let db_pool = state.db_pool.clone();
    let mut conn = match db_pool.get().await {
        Ok(conn) => conn,
        Err(why) => {
            tracing::error!("Failed to get connection: {}", why);
            return Err(why.to_string());
        }
    };

    let platforms = match schema::platforms::table
        .load::<retrom::Platform>(&mut conn)
        .await
    {
        Ok(platforms) => platforms,
        Err(e) => {
            tracing::error!("Failed to load platforms: {}", e);
            vec![]
        }
    };

    let futures = platforms
        .into_iter()
        .map(|platform| {
            let igdb_provider = state.igdb_client.clone();
            let db_pool = db_pool.clone();

            async move {
                let metadata = match_platform_igdb(igdb_provider.clone(), &platform).await;

                let mut conn = match db_pool.get().await {
                    Ok(conn) => conn,
                    Err(why) => {
                        tracing::error!("Failed to get connection: {}", why);
                        return Err(why.to_string());
                    }
                };

                if let Some(metadata) = metadata {
                    diesel::insert_into(schema::platform_metadata::table)
                        .values(&metadata)
                        .on_conflict_do_nothing()
                        .execute(&mut conn)
                        .await
                        .map_err(|e| {
                            tracing::error!("Failed to insert metadata: {}", e);
                            e.to_string()
                        })?;
                }

                let games_to_update = schema::games::table
                    .filter(schema::games::platform_id.eq(platform.id))
                    .load(&mut conn)
                    .await
                    .map_err(|e| {
                        tracing::error!("Failed to load games: {}", e);
                        e.to_string()
                    })?;

                let new_game_metadata =
                    match_games_igdb(igdb_provider.clone(), games_to_update).await;

                if let Err(e) = diesel::insert_into(schema::game_metadata::table)
                    .values(&new_game_metadata)
                    .on_conflict_do_nothing()
                    .get_results::<retrom::GameMetadata>(&mut conn)
                    .await
                    .optional()
                {
                    tracing::error!("Failed to insert metadata: {}", e);
                };

                let all_game_metadata: Vec<GameMetadata> = match schema::game_metadata::table
                    .load::<retrom::GameMetadata>(&mut conn)
                    .await
                {
                    Ok(metadata) => metadata,
                    Err(e) => {
                        tracing::error!("Failed to load metadata: {}", e);
                        vec![]
                    }
                };

                let game_igdb_ids: Vec<i64> =
                    all_game_metadata.iter().filter_map(|m| m.igdb_id).collect();

                let query = format!(
                    "fields genres.*, similar_games.*; where id = ({});",
                    game_igdb_ids
                        .iter()
                        .map(|id| id.to_string())
                        .collect::<Vec<String>>()
                        .join(",")
                );

                let res = igdb_provider
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

                if let Err(e) = diesel::insert_into(schema::game_genres::table)
                    .values(&new_genres)
                    .on_conflict_do_nothing()
                    .execute(&mut conn)
                    .await
                {
                    tracing::error!("Failed to insert genres: {}", e);
                }

                let genres: Vec<GameGenre> = schema::game_genres::table
                    .load::<GameGenre>(&mut conn)
                    .await
                    .unwrap_or(vec![]);

                let mut genre_maps: Vec<NewGameGenreMap> = vec![];
                if let Some(res) = &extra_metadata {
                    res.games.iter().for_each(|igdb_game| {
                        igdb_game.genres.iter().for_each(|igdb_genre| {
                            let genre = match genres
                                .iter()
                                .find(|g| g.slug == igdb_genre.slug && g.name == igdb_genre.name)
                            {
                                Some(genre) => genre,
                                None => return,
                            };

                            let igdb_id =
                                BigDecimal::from_u64(igdb_game.id).and_then(|big| big.to_i64());

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

                if let Err(e) = diesel::insert_into(schema::game_genre_maps::table)
                    .values(&genre_maps)
                    .on_conflict_do_nothing()
                    .execute(&mut conn)
                    .await
                {
                    tracing::error!("Failed to insert genre maps: {}", e);
                }

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

                if let Err(e) = diesel::insert_into(schema::similar_game_maps::table)
                    .values(&similar_games)
                    .on_conflict_do_nothing()
                    .execute(&mut conn)
                    .await
                {
                    tracing::error!("Failed to insert similar games: {}", e);
                };

                tracing::info!("Metadata updated for platform: {:?}", platform.id);

                Ok(())
            }
        })
        .collect();

    let job_manager = state.job_manager.clone();
    job_manager.spawn("Downloading Metadata", futures).await;

    Ok(())
}
