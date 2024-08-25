use std::{collections::HashMap, sync::Arc};

use crate::providers::igdb::{
    games::igdb_game_to_metadata, platforms::igdb_platform_to_metadata, provider::IGDBProvider,
};
use deunicode::deunicode;
use diesel::prelude::*;
use diesel_async::{scoped_futures::ScopedFutureExt, AsyncConnection, RunQueryDsl};
use prost::Message;
use retrom_codegen::{
    igdb,
    retrom::{
        self,
        get_game_metadata_response::{GameGenres, SimilarGames},
        get_igdb_search_request::IgdbSearchType,
        get_igdb_search_response::SearchResults,
        igdb_fields::Selector,
        igdb_filters::{FilterOperator, FilterValue},
        metadata_service_server::MetadataService,
        Game, GameGenre, GameGenreMap, GetGameMetadataRequest, GetGameMetadataResponse,
        GetIgdbGameSearchResultsRequest, GetIgdbGameSearchResultsResponse,
        GetIgdbPlatformSearchResultsRequest, GetIgdbPlatformSearchResultsResponse,
        GetIgdbSearchRequest, GetIgdbSearchResponse, GetPlatformMetadataRequest,
        GetPlatformMetadataResponse, SimilarGameMap, UpdateGameMetadataRequest,
        UpdateGameMetadataResponse, UpdatePlatformMetadataRequest, UpdatePlatformMetadataResponse,
    },
};
use retrom_db::{schema, Pool};
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

    #[tracing::instrument(level = Level::DEBUG, skip_all)]
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

        let fields = vec![
            "name".to_string(),
            "cover.url".to_string(),
            "artworks.url".to_string(),
            "artworks.height".to_string(),
            "artworks.width".to_string(),
            "summary".to_string(),
            "websites.url".to_string(),
            "websites.trusted".to_string(),
            "videos.name".to_string(),
            "videos.video_id".to_string(),
        ]
        .join(",");

        let fields_query = format!("fields {fields};");
        let mut where_clauses = vec![];

        let fields = query.fields.as_ref();

        if let Some(igdb_id) = fields.and_then(|fields| fields.id) {
            where_clauses.push(format!("id = {igdb_id}"));
        }

        if let Some(platform) = fields.and_then(|fields| fields.platform) {
            where_clauses.push(format!("release_dates.platform = {platform}"));
        }

        let filter_query = match where_clauses.len() {
            0 => "".to_string(),
            1 => format!("where {};", where_clauses[0]),
            _ => format!("where {};", where_clauses.join(" | ")),
        };

        let limit_query = match query.pagination.map(|pagination| pagination.limit) {
            Some(Some(limit)) => format!("limit {limit};"),
            _ => "limit 15;".to_string(),
        };

        let search_query = match query.search {
            Some(search) => format!("search \"{}\";", deunicode(&search.value)),
            None => "".to_string(),
        };

        let igdb_client = self.igdb_client.clone();

        let res = igdb_client
            .make_request(
                "games.pb".into(),
                format!("{search_query}{fields_query}{filter_query}{limit_query}"),
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
            .map(|igdb_game| igdb_game_to_metadata(igdb_game, Some(&game)))
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

            let fields_query = "fields name, logo.url, summary;";
            let mut where_clauses = vec![];

            if let Some(igdb_id) = query.fields.and_then(|fields| fields.id) {
                info!("IGDB ID: {igdb_id}");
                where_clauses.push(format!("id = {igdb_id}"));
            }

            let filter_query = match where_clauses.len() {
                0 => "".to_string(),
                1 => format!("where {};", where_clauses[0]),
                _ => format!("where {};", where_clauses.join(" | ")),
            };

            let limit_query = match query.pagination.map(|pagination| pagination.limit) {
                Some(Some(limit)) => format!("limit {limit};"),
                _ => "".to_string(),
            };

            let search_query = match query.search {
                Some(search) => format!("search \"{}\";", deunicode(&search.value)),
                None => "".to_string(),
            };

            let igdb_client = self.igdb_client.clone();

            let res = igdb_client
                .make_request(
                    "platforms.pb".into(),
                    format!("{search_query}{fields_query}{filter_query}{limit_query}"),
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

            let search_results = match igdb::PlatformResult::decode(bytes) {
                Ok(search_results) => search_results,
                Err(why) => {
                    error!("Could not decode response: {:?}", why);
                    return Err(Status::internal(why.to_string()));
                }
            };

            let metadata = search_results
                .platforms
                .into_iter()
                .map(|igdb_platform| igdb_platform_to_metadata(igdb_platform, Some(&platform)))
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

        let search_type = request.search_type();
        let search_clause = match request.search.map(|search| search.value) {
            Some(value) => format!("search {value};"),
            None => "".to_string(),
        };

        let fields = request.fields.as_ref();

        let fields_clause = match fields.and_then(|fields| fields.selector.as_ref()) {
            Some(Selector::Include(fields)) => format!("fields {};", fields.value.join(", ")),
            Some(Selector::Exclude(fields)) => {
                format!("fields *; exclude {};", fields.value.join(", "))
            }
            None => "".to_string(),
        };

        let filters_clause = match request.filters.map(|filters| filters.filters) {
            Some(filters) => format!(
                "where {};",
                filters
                    .into_iter()
                    .map(render_filter_operation)
                    .collect::<Vec<String>>()
                    .join(" | ")
            ),
            None => "".to_string(),
        };

        let pagination = request.pagination.as_ref();

        let limit_clause = match pagination.map(|pagination| &pagination.limit) {
            Some(Some(limit)) => format!("limit {limit};"),
            _ => "".to_string(),
        };

        let offset_clause = match pagination.map(|pagination| &pagination.offset) {
            Some(Some(offset)) => format!("offset {offset};"),
            _ => "".to_string(),
        };

        let query =
            format!("{search_clause}{fields_clause}{filters_clause}{limit_clause}{offset_clause}",);

        let target = match search_type {
            IgdbSearchType::Game => "games.pb".into(),
            IgdbSearchType::Platform => "platforms.pb".into(),
        };

        let igdb_client = self.igdb_client.clone();

        let res = igdb_client
            .make_request(target, query)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        let bytes = match res.bytes().await {
            Ok(bytes) => bytes,
            Err(why) => {
                error!("Could not get bytes: {:?}", why);
                return Err(Status::internal(why.to_string()));
            }
        };

        match search_type {
            IgdbSearchType::Game => {
                let matches = match igdb::GameResult::decode(bytes) {
                    Ok(matches) => matches,
                    Err(why) => {
                        error!("Could not decode response: {:?}", why);
                        return Err(Status::internal(why.to_string()));
                    }
                };

                let games = matches
                    .games
                    .into_iter()
                    .map(|game| igdb_game_to_metadata(game, None))
                    .collect();

                let search_results =
                    Some(SearchResults::GameMatches(retrom::IgdbSearchGameResponse {
                        games,
                    }));

                Ok(Response::new(GetIgdbSearchResponse { search_results }))
            }
            IgdbSearchType::Platform => {
                let matches = match igdb::PlatformResult::decode(bytes) {
                    Ok(matches) => matches,
                    Err(why) => {
                        error!("Could not decode response: {:?}", why);
                        return Err(Status::internal(why.to_string()));
                    }
                };

                let platforms = matches
                    .platforms
                    .into_iter()
                    .map(|platform| igdb_platform_to_metadata(platform, None))
                    .collect();

                let search_results = Some(SearchResults::PlatformMatches(
                    retrom::IgdbSearchPlatformResponse { platforms },
                ));

                Ok(Response::new(GetIgdbSearchResponse { search_results }))
            }
        }
    }
}

fn render_filter_operation(igdb_filter: (String, FilterValue)) -> String {
    let (field, filter) = igdb_filter;

    let value = &filter.value;
    let operator = filter.operator();

    match operator {
        FilterOperator::Equal => format!("{field} ~ {value}"),
        FilterOperator::NotEqual => format!("{field} !~ {value}"),
        FilterOperator::LessThan => format!("{field} < {value}"),
        FilterOperator::LessThanOrEqual => format!("{field} <= {value}"),
        FilterOperator::GreaterThan => format!("{field} > {value}"),
        FilterOperator::GreaterThanOrEqual => format!("{field} >= {value}"),
        FilterOperator::PrefixMatch => format!("{field} ~ {value}*"),
        FilterOperator::SuffixMatch => format!("{field} ~ *{value}"),
        FilterOperator::InfixMatch => format!("{field} ~ *{value}*"),
        FilterOperator::All => format!("{field} = [{value}]"),
        FilterOperator::Any => format!("{field} = ({value})"),
        FilterOperator::NotAll => format!("{field} = ![{value}]"),
        FilterOperator::None => format!("{field} = !({value})"),
        FilterOperator::Exact => format!("{field} = {{{value}}}"),
    }
}
