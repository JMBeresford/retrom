use super::{models, provider::SteamWebApiProvider};
use crate::metadata_providers::{GameMetadataProvider, GameMetadataSearchResult};

impl GameMetadataProvider<models::Game, ()> for SteamWebApiProvider {
    async fn get_game_metadata(
        &self,
        game: retrom_codegen::retrom::services::library::v1::Game,
        query: Option<models::Game>,
    ) -> GameMetadataSearchResult {
        let app = match query {
            Some(app) => app,
            None => return (None, None, None, None),
        };

        let app_details = match self.get_app_details(app.appid).await {
            Ok(details) => details,
            Err(e) => {
                tracing::warn!(
                    "Failed to get app details for app {:?}: Status {:?}",
                    app.appid,
                    e
                );
                return (None, None, None, None);
            }
        };

        let mut metadata = self.app_details_to_game_metadata(&app, &app_details);
        metadata.game_id = game.id;

        let screenshot_metadata = self.app_details_to_screenshot_metadata(&app_details);
        let video_metadata = self.app_details_to_video_metadata(&app_details);

        (
            Some(metadata),
            None,
            Some(screenshot_metadata),
            Some(video_metadata),
        )
    }

    async fn search_game_metadata(&self, _query: models::Game) {}
}
