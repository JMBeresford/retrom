use super::{models, provider::SteamWebApiProvider};
use crate::metadata_providers::{
    steam::provider::STEAM_PROVIDER_ID, GameMetadataProvider, GameMetadataSearchParams,
    MetadataProviderError, Result, ToGameMetadata, ToTags,
};
use chrono::DateTime;
use retrom_codegen::{
    retrom::services::metadata::v1::{
        GameMetadata, GameMetadataScreenshot, GameMetadataVideo, GameMetadataView,
    },
    timestamp::Timestamp,
};
use tracing::{instrument, Level};

#[derive(Debug)]
pub struct SteamGameMetadata {
    pub game: models::Game,
    pub details: models::AppDetails,
}

impl ToGameMetadata for SteamGameMetadata {
    fn to_game_metadata(&self, game_id: &str) -> GameMetadataView {
        let app = &self.game;
        let app_details = &self.details;

        let mut metadata = app_details_to_game_metadata(app, app_details);
        metadata.game_id = game_id.to_string();
        metadata.provider_game_id = app.appid.to_string();
        metadata.provider_id = STEAM_PROVIDER_ID.to_string();

        GameMetadataView {
            metadata: Some(metadata),
            screenshots: app_details_to_screenshot_metadata(app_details),
            artworks: vec![],
            videos: app_details_to_video_metadata(app_details),
            links: vec![],
            similar_game_ids: vec![],
        }
    }
}

impl ToTags for SteamGameMetadata {
    fn to_tags(&self) -> Vec<retrom_codegen::retrom::services::tags::v1::TagView> {
        vec![]
    }
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
}

fn app_details_to_game_metadata(
    app: &models::Game,
    app_details: &models::AppDetails,
) -> GameMetadata {
    let cover_url = app_details.steam_appid.map(|id| {
        format!("https://steamcdn-a.akamaihd.net/steam/apps/{id}/library_600x900_2x.jpg")
    });

    let icon_url = app.img_icon_url.as_ref().map(|icon_id| {
        format!(
            "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/{}/{}.jpg",
            app.appid, icon_id
        )
    });

    let background_url = Some(format!(
        "https://steamcdn-a.akamaihd.net/steam/apps/{}/library_hero.jpg",
        app.appid
    ));

    let last_played = if app.rtime_last_played > 0 {
        let dt = DateTime::from_timestamp(app.rtime_last_played, 0);

        dt.map(|dt| Timestamp {
            seconds: dt.timestamp(),
            nanos: 0,
        })
    } else {
        None
    };

    let minutes_played = if app.playtime_forever > 0 {
        Some(app.playtime_forever)
    } else {
        None
    };

    GameMetadata {
        description: app_details.short_description.clone(),
        name: app_details.name.clone(),
        cover_url,
        background_url,
        icon_url,
        last_played,
        minutes_played,
        ..Default::default()
    }
}

fn app_details_to_screenshot_metadata(
    app_details: &models::AppDetails,
) -> Vec<GameMetadataScreenshot> {
    let screenshot_urls: Vec<String> = app_details
        .screenshots
        .as_ref()
        .map(|screenshots| {
            screenshots
                .iter()
                .map(|screenshot| screenshot.path_full.clone())
                .collect()
        })
        .unwrap_or_default();

    screenshot_urls
        .into_iter()
        .map(|url| GameMetadataScreenshot {
            url,
            ..Default::default()
        })
        .collect()
}

fn app_details_to_video_metadata(app_details: &models::AppDetails) -> Vec<GameMetadataVideo> {
    let video_urls: Vec<String> = app_details
        .movies
        .as_ref()
        .map(|movies| {
            movies
                .iter()
                .filter_map(|movie| {
                    movie
                        .webm
                        .as_ref()
                        .map(|quality| quality.max.clone())
                        .or(movie.mp4.as_ref().map(|quality| quality.max.clone()))
                        .flatten()
                })
                .collect()
        })
        .unwrap_or_default();

    video_urls
        .into_iter()
        .map(|url| GameMetadataVideo {
            url,
            ..Default::default()
        })
        .collect()
}
