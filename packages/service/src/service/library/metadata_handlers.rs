use crate::providers::igdb::games::match_games_igdb;

use super::LibraryServiceHandlers;
use db::{
    models::{game::GameRow, metadata::MetadataRow, FromMessages, IntoMessages},
    schema,
};
use diesel_async::RunQueryDsl;
use generated::retrom::UpdateLibraryMetadataResponse;
use tracing::instrument;

#[instrument(skip(state))]
pub async fn update_metadata(
    state: &LibraryServiceHandlers,
    overwrite: bool,
) -> Result<UpdateLibraryMetadataResponse, String> {
    let mut response = UpdateLibraryMetadataResponse {
        metadata_populated: vec![],
    };

    let mut conn = match state.db_pool.get().await {
        Ok(conn) => conn,
        Err(why) => {
            tracing::error!("Failed to get connection: {}", why);
            return Err(why.to_string());
        }
    };

    let games = match schema::games::table.load::<GameRow>(&mut conn).await {
        Ok(games) => GameRow::into_messages(games),
        Err(e) => {
            tracing::error!("Failed to load games: {}", e);
            return Ok(response);
        }
    };

    let igdb_provider = state.igdb_client.clone();
    let all_metadata = match match_games_igdb(igdb_provider, games).await {
        Ok(metadata) => metadata,
        Err(e) => {
            tracing::error!("Failed to match games: {}", e);
            return Err(e.to_string());
        }
    };

    let metadata_rows = MetadataRow::from_messages(all_metadata);
    match overwrite {
        true => {
            for metadata_row in metadata_rows {
                match diesel::insert_into(schema::metadata::table)
                    .values(&metadata_row)
                    .on_conflict(schema::metadata::game_id)
                    .do_update()
                    .set(&metadata_row)
                    .get_result::<MetadataRow>(&mut conn)
                    .await
                {
                    Ok(row) => response.metadata_populated.push(row.into()),
                    Err(why) => {
                        tracing::error!("Could not insert metadata: {:?}", why);
                    }
                }
            }
        }
        false => {
            match diesel::insert_into(schema::metadata::table)
                .values(&metadata_rows)
                .on_conflict_do_nothing()
                .get_results::<MetadataRow>(&mut conn)
                .await
            {
                Ok(rows) => response
                    .metadata_populated
                    .extend(MetadataRow::into_messages(rows)),
                Err(why) => {
                    tracing::error!("Could not insert metadata: {:?}", why);
                    return Err(why.to_string());
                }
            }
        }
    };

    Ok(response)
}
