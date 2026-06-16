use super::{models, provider::SteamWebApiProvider};
use crate::metadata_providers::{
    steam::provider::STEAM_PROVIDER_ID, GameMetadataProvider, GameMetadataSearchParams,
    MetadataProviderError, Result,
};
use retrom_codegen::retrom::services::metadata::v1::GameMetadataView;
use tracing::{instrument, Level};

#[derive(Debug)]
pub struct SteamGameMetadata {
    pub game: models::Game,
    pub details: models::AppDetails,
}

impl GameMetadataProvider for SteamWebApiProvider {
    type ProviderGameId = u32;
    type SearchQuery = ();
    type GameModel = SteamGameMetadata;

    #[instrument(level = Level::DEBUG, skip(self))]
    async fn get_game_metadata(
        &self,
        params: GameMetadataSearchParams<Self::ProviderGameId>,
    ) -> Result<Self::GameModel> {
        let app_id = match params.provider_game_id {
            Some(id) => id,
            None => {
                return Err(MetadataProviderError::InvalidSearchParams(
                    "Provider game ID is required for Steam game metadata search".to_string(),
                ));
            }
        };

        let app_details = self.get_app_details(app_id).await?;
        let owned_games = self.get_owned_games().await?.response.games;

        let app = match owned_games.into_iter().find(|game| game.appid == app_id) {
            Some(game) => game,
            None => return Err(MetadataProviderError::NoMatchesFound),
        };

        Ok(Self::GameModel {
            game: app,
            details: app_details,
        })
    }

    async fn search_game_metadata(
        &self,
        _query: Self::SearchQuery,
    ) -> Result<Vec<Self::GameModel>> {
        unimplemented!()
    }

    #[instrument(level = Level::DEBUG, skip(self))]
    fn to_game_metadata(
        &self,
        game_id: &str,
        native_metadata: Self::GameModel,
    ) -> GameMetadataView {
        let app = native_metadata.game;
        let app_details = native_metadata.details;

        let mut metadata = self.app_details_to_game_metadata(&app, &app_details);
        metadata.game_id = game_id.to_string();
        metadata.provider_game_id = app.appid.to_string();
        metadata.provider_id = STEAM_PROVIDER_ID.to_string();

        GameMetadataView {
            metadata: Some(metadata),
            screenshots: self.app_details_to_screenshot_metadata(&app_details),
            artworks: vec![],
            videos: self.app_details_to_video_metadata(&app_details),
            links: vec![],
            similar_game_ids: vec![],
        }
    }
}
