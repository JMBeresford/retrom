use std::{collections::HashMap, sync::Arc};

use crate::providers::{
    igdb::provider::{IGDBProvider, IgdbSearchData},
    GameMetadataProvider, MetadataProvider, PlatformMetadataProvider,
};
use diesel::prelude::*;
use diesel_async::{scoped_futures::ScopedFutureExt, AsyncConnection, RunQueryDsl};
use retrom_codegen::retrom::{
    self,
    get_game_metadata_response::{GameGenres, SimilarGames},
    get_igdb_search_response::SearchResults,
    metadata_service_server::MetadataService,
    Game, GameGenre, GameGenreMap, GetGameMetadataRequest, GetGameMetadataResponse,
    GetIgdbGameSearchResultsRequest, GetIgdbGameSearchResultsResponse,
    GetIgdbPlatformSearchResultsRequest, GetIgdbPlatformSearchResultsResponse,
    GetIgdbSearchRequest, GetIgdbSearchResponse, GetPlatformMetadataRequest,
    GetPlatformMetadataResponse, IgdbSearchGameResponse, IgdbSearchPlatformResponse,
    SimilarGameMap, UpdateGameMetadataRequest, UpdateGameMetadataResponse,
    UpdatePlatformMetadataRequest, UpdatePlatformMetadataResponse,
};
use retrom_db::{schema, Pool};
use tonic::{Request, Response, Status};
use tracing::{error, Level};

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

        let metadata = match retrom_db::schema::game_metadata::table
            .filter(retrom_db::schema::game_metadata::game_id.eq_any(&game_ids))
            .load::<retrom::GameMetadata>(&mut conn)
            .await
        {
            Ok(rows) => rows,
            Err(why) => {
                return Err(Status::internal(why.to_string()));
            }
        };

        let (games1, games2) = diesel::alias!(schema::games as games1, schema::games as games2);

        let games: Vec<Game> = games1
            .filter(games1.field(schema::games::id).eq_any(game_ids))
            .load::<retrom::Game>(&mut conn)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        let genre_maps: Vec<(GameGenreMap, GameGenre)> = GameGenreMap::belonging_to(&games)
            .inner_join(schema::game_genres::table)
            .select((GameGenreMap::as_select(), GameGenre::as_select()))
            .load(&mut conn)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        let genres: HashMap<i32, GameGenres> = genre_maps
            .grouped_by(&games)
            .into_iter()
            .zip(&games)
            .map(|(maps, game)| {
                let genres = maps
                    .into_iter()
                    .map(|map| map.1)
                    .collect::<Vec<GameGenre>>();

                (game.id, GameGenres { value: genres })
            })
            .collect();

        let similar_maps_flat: Vec<(SimilarGameMap, Game)> =
            SimilarGameMap::belonging_to(&games)
                .inner_join(games2.on(
                    schema::similar_game_maps::similar_game_id.eq(games2.field(schema::games::id)),
                ))
                .select((
                    SimilarGameMap::as_select(),
                    games2.fields(schema::games::all_columns),
                ))
                .load(&mut conn)
                .await
                .map_err(|e| Status::internal(e.to_string()))?;

        let similar_games: HashMap<i32, SimilarGames> = similar_maps_flat
            .grouped_by(&games)
            .into_iter()
            .zip(games)
            .map(|(maps, game)| {
                let games: Vec<Game> = maps.into_iter().map(|map| map.1).collect();

                (game.id, SimilarGames { value: games })
            })
            .collect();

        Ok(Response::new(GetGameMetadataResponse {
            metadata,
            genres,
            similar_games,
        }))
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
            let updated_row = match diesel::insert_into(retrom_db::schema::game_metadata::table)
                .values(&metadata_row)
                .on_conflict(retrom_db::schema::game_metadata::game_id)
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
    async fn get_platform_metadata(
        &self,
        request: Request<GetPlatformMetadataRequest>,
    ) -> Result<Response<GetPlatformMetadataResponse>, Status> {
        let request = request.into_inner();
        let platform_ids = request.platform_ids;

        let mut conn = match self.db_pool.get().await {
            Ok(conn) => conn,
            Err(why) => {
                return Err(Status::internal(why.to_string()));
            }
        };

        let metadata = match retrom_db::schema::platform_metadata::table
            .filter(retrom_db::schema::platform_metadata::platform_id.eq_any(platform_ids))
            .load::<retrom::PlatformMetadata>(&mut conn)
            .await
        {
            Ok(rows) => rows,
            Err(why) => {
                return Err(Status::internal(why.to_string()));
            }
        };

        Ok(Response::new(GetPlatformMetadataResponse { metadata }))
    }

    #[tracing::instrument(level = Level::DEBUG, skip_all)]
    async fn update_platform_metadata(
        &self,
        request: Request<UpdatePlatformMetadataRequest>,
    ) -> Result<Response<UpdatePlatformMetadataResponse>, Status> {
        let request = request.into_inner();
        let metadata_to_update = request.metadata;

        let mut conn = match self.db_pool.get().await {
            Ok(conn) => conn,
            Err(why) => {
                return Err(Status::internal(why.to_string()));
            }
        };

        conn.transaction(|mut conn| {
            async move {
                let mut metadata_updated: Vec<retrom::PlatformMetadata> = vec![];

                for metadata_row in metadata_to_update {
                    let updated_row =
                        diesel::insert_into(retrom_db::schema::platform_metadata::table)
                            .values(&metadata_row)
                            .on_conflict(retrom_db::schema::platform_metadata::platform_id)
                            .do_update()
                            .set(&metadata_row)
                            .get_result::<retrom::PlatformMetadata>(&mut conn)
                            .await?;

                    metadata_updated.push(updated_row);
                }

                diesel::result::QueryResult::Ok(Response::new(UpdatePlatformMetadataResponse {
                    metadata_updated,
                }))
            }
            .scope_boxed()
        })
        .await
        .map_err(|why| {
            error!("Failed to update platform metadata: {}", why);
            Status::internal(why.to_string())
        })
    }

    #[tracing::instrument(skip_all)]
    async fn get_igdb_game_search_results(
        &self,
        request: Request<GetIgdbGameSearchResultsRequest>,
    ) -> Result<Response<GetIgdbGameSearchResultsResponse>, Status> {
        let request = request.into_inner();
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

        let igdb_client = self.igdb_client.clone();
        let search_results = igdb_client.search_game_metadata(query).await;

        let metadata = search_results
            .into_iter()
            .map(|mut meta| {
                meta.game_id = Some(game.id);
                meta
            })
            .collect();

        Ok(Response::new(GetIgdbGameSearchResultsResponse { metadata }))
    }

    #[tracing::instrument(level = Level::DEBUG, skip_all)]
    async fn get_igdb_platform_search_results(
        &self,
        request: Request<GetIgdbPlatformSearchResultsRequest>,
    ) -> Result<Response<GetIgdbPlatformSearchResultsResponse>, Status> {
        {
            let request = request.into_inner();
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

            let platform = match schema::platforms::table
                .find(query.platform_id)
                .first::<retrom::Platform>(&mut conn)
                .await
            {
                Ok(platform) => platform,
                Err(why) => {
                    return Err(Status::internal(why.to_string()));
                }
            };

            let igdb_provider = self.igdb_client.clone();

            let metadata = igdb_provider
                .search_platform_metadata(query)
                .await
                .into_iter()
                .map(|mut meta| {
                    meta.platform_id = Some(platform.id);
                    meta
                })
                .collect();

            Ok(Response::new(GetIgdbPlatformSearchResultsResponse {
                metadata,
            }))
        }
    }

    #[tracing::instrument(level = Level::DEBUG, skip_all)]
    async fn get_igdb_search(
        &self,
        request: Request<GetIgdbSearchRequest>,
    ) -> Result<Response<GetIgdbSearchResponse>, Status> {
        let request = request.into_inner();
        let igdb_provider = self.igdb_client.clone();

        let data = igdb_provider.search_metadata(request).await;

        let search_results = match data {
            Some(IgdbSearchData::Game(matches)) => {
                let games = matches
                    .games
                    .into_iter()
                    .map(|game| igdb_provider.igdb_game_to_metadata(game))
                    .collect();

                SearchResults::GameMatches(IgdbSearchGameResponse { games })
            }
            Some(IgdbSearchData::Platform(matches)) => {
                let platforms = matches
                    .platforms
                    .into_iter()
                    .map(|platform| igdb_provider.igdb_platform_to_metadata(platform))
                    .collect();

                SearchResults::PlatformMatches(IgdbSearchPlatformResponse { platforms })
            }
            None => {
                return Err(Status::not_found("No results"));
            }
        }
        .into();

        Ok(Response::new(GetIgdbSearchResponse { search_results }))
    }
}
