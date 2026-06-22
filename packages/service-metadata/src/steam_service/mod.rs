use retrom_codegen::retrom::services::metadata::v1::{
    steam_service_server::SteamService, GetSteamGameMetadataRequest, GetSteamGameMetadataResponse,
};
use retrom_db::DbPool;
use retrom_service_common::metadata_providers::{
    steam::{games::SteamGameMetadata, provider::SteamWebApiProvider},
    ToGameMetadata,
};
use sqlx::QueryBuilder;
use std::sync::Arc;
use tonic::{Request, Response, Status};

pub(crate) mod router;

#[derive(Clone)]
pub struct SteamServiceHandlers {
    pub db_pool: DbPool,
    pub steam_provider: Arc<SteamWebApiProvider>,
}

#[tonic::async_trait]
impl SteamService for SteamServiceHandlers {
    #[tracing::instrument(skip(self))]
    async fn get_steam_game_metadata(
        &self,
        request: Request<GetSteamGameMetadataRequest>,
    ) -> Result<Response<GetSteamGameMetadataResponse>, Status> {
        let request = request.into_inner();
        let game_id = request.game_id;

        let steam_app_id: Option<String> =
            QueryBuilder::new("select steam_app_id from games where id = ")
                .push_bind(&game_id)
                .build_query_scalar()
                .fetch_one(&self.db_pool)
                .await
                .map_err(|why| Status::internal(why.to_string()))?;

        let steam_app_id = steam_app_id.ok_or_else(|| {
            Status::not_found(format!(
                "Game with id {} not found or does not have a Steam app ID",
                game_id
            ))
        })?;

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

        let steam_game = steam_games
            .into_iter()
            .find(|g| g.appid.to_string() == steam_app_id)
            .ok_or_else(|| Status::not_found("Steam game not found"))?;

        let app_details = self
            .steam_provider
            .get_app_details(steam_game.appid)
            .await
            .map_err(|why| {
                tracing::error!(
                    "Failed to fetch Steam app details for app {}: {:?}",
                    steam_game.appid,
                    why
                );
                Status::internal(why.to_string())
            })?;

        let steam_game_metadata = SteamGameMetadata {
            game: steam_game,
            details: app_details,
        };

        let metadata_view = steam_game_metadata.to_game_metadata(&game_id);

        Ok(Response::new(GetSteamGameMetadataResponse {
            metadata: Some(metadata_view),
        }))
    }
}
