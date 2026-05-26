use retrom_codegen::{
    retrom::services::metadata::v1::{
        steam_service_server::SteamService, SyncSteamMetadataRequest, SyncSteamMetadataResponse,
    },
    timestamp::Timestamp,
};
use retrom_db::DbPool;
use retrom_service_common::metadata_providers::steam::provider::SteamWebApiProvider;
use std::sync::Arc;
use tonic::{Request, Response, Status};
use tracing::Level;

pub mod router;

#[derive(Clone)]
pub struct SteamServiceHandlers {
    pub db_pool: DbPool,
    pub steam_provider: Arc<SteamWebApiProvider>,
}

#[derive(sqlx::FromRow)]
struct SteamGameRow {
    id: String,
    steam_app_id: Option<String>,
}

#[tonic::async_trait]
impl SteamService for SteamServiceHandlers {
    #[tracing::instrument(level = Level::DEBUG, skip_all)]
    async fn sync_steam_metadata(
        &self,
        request: Request<SyncSteamMetadataRequest>,
    ) -> Result<Response<SyncSteamMetadataResponse>, Status> {
        let selectors = request.into_inner().selectors;
        let game_ids = selectors.iter().map(|s| s.game_id.clone()).collect::<Vec<_>>();

        if game_ids.is_empty() {
            return Ok(Response::new(SyncSteamMetadataResponse {}));
        }

        let mut builder = sqlx::QueryBuilder::<retrom_db::RetromDB>::new(
            "select id, steam_app_id from games where steam_app_id is not null and id in (",
        );
        let mut separated = builder.separated(", ");
        for id in &game_ids {
            separated.push_bind(id);
        }
        separated.push_unseparated(")");

        let games: Vec<SteamGameRow> = builder
            .build_query_as()
            .fetch_all(&self.db_pool)
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        let steam_games = self
            .steam_provider
            .get_owned_games()
            .await
            .map_err(|why| {
                tracing::error!("Failed to fetch owned games from Steam: {}", why);
                Status::internal(why.to_string())
            })?
            .response
            .games;

        let mut tx = self
            .db_pool
            .begin()
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        for game in games {
            let Some(app_id) = game
                .steam_app_id
                .as_deref()
                .and_then(|app_id| app_id.parse::<u32>().ok())
            else {
                continue;
            };

            let Some(steam_game) = steam_games.iter().find(|steam_game| steam_game.appid == app_id)
            else {
                continue;
            };

            let last_played = if steam_game.rtime_last_played > 0 {
                Some(Timestamp {
                    seconds: steam_game.rtime_last_played,
                    nanos: 0,
                })
            } else {
                None
            };

            let minutes_played = if steam_game.playtime_forever > 0 {
                Some(steam_game.playtime_forever)
            } else {
                None
            };

            sqlx::query(
                r#"
                update game_metadata
                set last_played = $1,
                    minutes_played = $2,
                    updated_at = current_timestamp
                where game_id = $3
                "#,
            )
            .bind(last_played)
            .bind(minutes_played)
            .bind(&game.id)
            .execute(&mut *tx)
            .await
            .map_err(|why| Status::internal(why.to_string()))?;
        }

        tx.commit()
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        Ok(Response::new(SyncSteamMetadataResponse {}))
    }
}
