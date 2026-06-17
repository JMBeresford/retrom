use retrom_codegen::retrom::services::metadata::v1::{
    steam_service_server::SteamService, SyncSteamMetadataRequest, SyncSteamMetadataResponse,
};
use retrom_db::{DbPool, RetromDB};
use retrom_service_common::metadata_providers::steam::provider::{
    SteamWebApiProvider, STEAM_PROVIDER_ID,
};
use std::sync::Arc;
use tonic::{Request, Response, Status};

pub(crate) mod router;

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
    #[tracing::instrument(skip(self))]
    async fn sync_steam_metadata(
        &self,
        request: Request<SyncSteamMetadataRequest>,
    ) -> Result<Response<SyncSteamMetadataResponse>, Status> {
        let selectors = request.into_inner().selectors;
        let game_ids = selectors
            .iter()
            .map(|s| s.game_id.clone())
            .collect::<Vec<_>>();

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

        let steam_games_map: std::collections::HashMap<u32, _> =
            steam_games.iter().map(|g| (g.appid, g)).collect();

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

            let Some(steam_game) = steam_games_map.get(&app_id) else {
                continue;
            };

            let app_details = match self.steam_provider.get_app_details(app_id).await {
                Ok(details) => details,
                Err(status) => {
                    tracing::warn!(
                        "Failed to fetch Steam app details for app {}: {:?}",
                        app_id,
                        status
                    );
                    continue;
                }
            };

            let mut metadata = self
                .steam_provider
                .app_details_to_game_metadata(steam_game, &app_details);

            metadata.game_id = game.id.clone();
            metadata.provider_id = STEAM_PROVIDER_ID.to_string();
            metadata.provider_game_id = app_id.to_string();

            let row_id = uuid::Uuid::now_v7().to_string();

            let mut builder = sqlx::QueryBuilder::<RetromDB>::new(
                r#"
                insert into game_metadata (
                    id, game_id, provider_id, provider_game_id, name, description, cover_url,
                    background_url, icon_url, last_played, minutes_played
                )
                values (
                "#,
            );
            let mut separated = builder.separated(", ");
            separated.push_bind(row_id);
            separated.push_bind(&metadata.game_id);
            separated.push_bind(&metadata.provider_id);
            separated.push_bind(&metadata.provider_game_id);
            separated.push_bind(&metadata.name);
            separated.push_bind(&metadata.description);
            separated.push_bind(&metadata.cover_url);
            separated.push_bind(&metadata.background_url);
            separated.push_bind(&metadata.icon_url);
            separated.push_bind(metadata.last_played);
            separated.push_bind(metadata.minutes_played);
            separated.push_unseparated(
                r#")
                on conflict (game_id, provider_id) do update set
                    provider_game_id = excluded.provider_game_id,
                    name = excluded.name,
                    description = excluded.description,
                    cover_url = excluded.cover_url,
                    background_url = excluded.background_url,
                    icon_url = excluded.icon_url,
                    last_played = excluded.last_played,
                    minutes_played = excluded.minutes_played
                "#,
            );

            builder
                .build()
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
