use std::sync::Arc;

use crate::providers::igdb::{games::igdb_game_to_metadata, provider::IGDBProvider};
use db::{schema, Pool};
use deunicode::deunicode;
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use generated::{
    igdb,
    retrom::{
        self, metadata_service_server::MetadataService, GetGameMetadataRequest,
        GetGameMetadataResponse, GetIgdbGameSearchResultsRequest, GetIgdbGameSearchResultsResponse,
        UpdateGameMetadataRequest, UpdateGameMetadataResponse,
    },
};
use prost::Message;
use tonic::{Request, Response, Status};
use tracing::{error, info, Level};

pub struct MetadataServiceHandlers {
    db_pool: Arc<Pool>,
    igdb_client: Arc<IGDBProvider>,
}

impl MetadataServiceHandlers {
    pub fn new(db_pool: Arc<Pool>, igdb_client: Arc<IGDBProvider>) -> Self {
        Self {
            db_pool,
            igdb_client,
        }
    }
}

#[tonic::async_trait]
impl MetadataService for MetadataServiceHandlers {
    #[tracing::instrument(level = Level::DEBUG, skip_all)]
    async fn get_game_metadata(
        &self,
        request: Request<GetGameMetadataRequest>,
    ) -> Result<Response<GetGameMetadataResponse>, Status> {
        let request = request.into_inner();
        let game_ids = request.game_ids;

        let mut conn = match self.db_pool.get().await {
            Ok(conn) => conn,
            Err(why) => {
                return Err(Status::internal(why.to_string()));
            }
        };

        let metadata = match db::schema::game_metadata::table
            .filter(db::schema::game_metadata::game_id.eq_any(game_ids))
            .load::<retrom::GameMetadata>(&mut conn)
            .await
        {
            Ok(rows) => rows,
            Err(why) => {
                return Err(Status::internal(why.to_string()));
            }
        };

        Ok(Response::new(GetGameMetadataResponse { metadata }))
    }

    #[tracing::instrument(level = Level::DEBUG, skip_all)]
    async fn update_game_metadata(
        &self,
        request: Request<UpdateGameMetadataRequest>,
    ) -> Result<Response<UpdateGameMetadataResponse>, Status> {
        let request = request.into_inner();
        let metadata_to_update = request.metadata;

        let mut conn = match self.db_pool.get().await {
            Ok(conn) => conn,
            Err(why) => {
                return Err(Status::internal(why.to_string()));
            }
        };

        let mut metadata_updated: Vec<retrom::GameMetadata> = vec![];

        for metadata_row in metadata_to_update {
            let updated_row = match diesel::insert_into(db::schema::game_metadata::table)
                .values(&metadata_row)
                .on_conflict(db::schema::game_metadata::game_id)
                .do_update()
                .set(&metadata_row)
                .get_result::<retrom::GameMetadata>(&mut conn)
                .await
            {
                Ok(row) => row,
                Err(why) => {
                    return Err(Status::internal(why.to_string()));
                }
            };

            metadata_updated.push(updated_row);
        }

        Ok(Response::new(UpdateGameMetadataResponse {
            metadata_updated,
        }))
    }

    #[tracing::instrument(level = Level::DEBUG, skip_all)]
    async fn get_igdb_game_search_results(
        &self,
        request: Request<GetIgdbGameSearchResultsRequest>,
    ) -> Result<Response<GetIgdbGameSearchResultsResponse>, Status> {
        let request = request.into_inner();
        let limit = request.limit;
        let query = match request.query {
            Some(query) => query,
            None => {
                return Err(Status::invalid_argument("Query is required"));
            }
        };

        let mut conn = self
            .db_pool
            .get()
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        let game = match schema::games::table
            .find(query.game_id)
            .first::<retrom::Game>(&mut conn)
            .await
        {
            Ok(game) => game,
            Err(why) => {
                return Err(Status::internal(why.to_string()));
            }
        };

        let fields_query =
            "fields name, cover.url, artworks.url, artworks.height, artworks.width, summary;";
        let mut where_clauses = vec![];

        if let Some(igdb_id) = query.igdb_id {
            info!("IGDB ID: {igdb_id}");
            where_clauses.push(format!("id = {igdb_id}"));
        }

        if let Some(platform) = query.platform {
            info!("Platform: {platform}");
            where_clauses.push(format!("platforms.name ~ *\"{platform}\"*"));
        }

        let filter_query = match where_clauses.len() {
            0 => "".to_string(),
            1 => format!("where {};", where_clauses[0]),
            _ => format!("where {};", where_clauses.join(" | ")),
        };

        let limit_query = match limit {
            Some(limit) => format!("limit {limit};"),
            None => "limit 15;".to_string(),
        };

        let search_query = format!("search \"{}\";", deunicode(&query.search));

        let igdb_client = self.igdb_client.clone();

        let res = igdb_client
            .make_request(
                "games.pb".into(),
                format!("{search_query} {fields_query} {filter_query} {limit_query}"),
            )
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        let bytes = match res.bytes().await {
            Ok(bytes) => bytes,
            Err(why) => {
                error!("Could not get bytes: {:?}", why);
                return Err(Status::internal(why.to_string()));
            }
        };

        let search_results = match igdb::GameResult::decode(bytes) {
            Ok(search_results) => search_results,
            Err(why) => {
                error!("Could not decode response: {:?}", why);
                return Err(Status::internal(why.to_string()));
            }
        };

        let metadata = search_results
            .games
            .into_iter()
            .map(|igdb_game| igdb_game_to_metadata(igdb_game, &game))
            .collect();

        Ok(Response::new(GetIgdbGameSearchResultsResponse { metadata }))
    }
}
