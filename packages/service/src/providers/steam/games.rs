use crate::providers::GameMetadataProvider;

use super::{models, provider::SteamWebApiProvider};

impl GameMetadataProvider<models::Game> for SteamWebApiProvider {
    async fn get_game_metadata(
        &self,
        game: retrom_codegen::retrom::Game,
        query: Option<models::Game>,
    ) -> Option<retrom_codegen::retrom::NewGameMetadata> {
        let app = match query {
            Some(app) => app,
            None => return None,
        };

        let app_details = match self.get_app_details(app.appid).await {
            Ok(details) => details,
            Err(e) => {
                tracing::warn!("Failed to get app details for app {:?}: {:?}", e, app.appid);
                return None;
            }
        };

        let mut metadata = self.app_details_to_game_metadata(app, app_details);
        metadata.game_id = Some(game.id);

        Some(metadata)
    }

    async fn search_game_metadata(
        &self,
        _query: models::Game,
    ) -> Vec<retrom_codegen::retrom::NewGameMetadata> {
        vec![]
    }
}
