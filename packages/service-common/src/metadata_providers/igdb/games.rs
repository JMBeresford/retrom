use super::provider::{IGDBProvider, IgdbSearchData};
use crate::metadata_providers::{
    igdb::provider::IGDB_PROVIDER_ID, GameMetadataProvider, GameMetadataSearchResult,
    MetadataProvider, Result,
};
use retrom_codegen::{
    igdb::{self},
    retrom::{
        providers::igdb::v1::{
            igdb_fields::{IncludeFields, Selector},
            igdb_filters::{FilterOperator, FilterValue},
            IgdbFields, IgdbFilters, IgdbGameSearchQuery,
        },
        services::{
            library::v1::Game,
            metadata::v1::{
                get_igdb_search_request::IgdbSearchType, GameMetadata, GameMetadataArtwork,
                GameMetadataScreenshot, GameMetadataVideo, GetIgdbSearchRequest,
            },
        },
    },
};
use std::collections::HashMap;
use tracing::{instrument, Level};

impl IGDBProvider {
    pub fn igdb_game_to_metadata(&self, igdb_match: igdb::Game) -> Result<GameMetadata> {
        let description = Some(igdb_match.summary);
        let name = Some(igdb_match.name);
        let igdb_id = igdb_match.id.to_string();

        let cover_url = igdb_match.cover.map(|cover| {
            cover
                .url
                .to_string()
                .replace("t_thumb", "t_cover_big_2x")
                .replace("//", "https://")
        });

        let background_url = igdb_match
            .artworks
            .iter()
            .find(|artwork| artwork.width > artwork.height)
            .map(|artwork| {
                artwork
                    .url
                    .to_string()
                    .replace("//", "https://")
                    .replace("t_thumb", "t_1080p_2x")
            })
            .or(igdb_match.artworks.first().map(|artwork| {
                artwork
                    .url
                    .to_string()
                    .replace("//", "https://")
                    .replace("t_thumb", "t_1080p_2x")
            }));

        let icon_url = igdb_match
            .artworks
            .iter()
            .find(|artwork| artwork.width == artwork.height)
            .map(|artwork| artwork.url.to_string().replace("//", "https://"))
            .or(cover_url
                .as_ref()
                .map(|cover_url| cover_url.clone().replace("t_cover_big", "t_thumb")));

        let icon_url = match icon_url {
            Some(icon_url) => Some(icon_url),
            None => cover_url
                .as_ref()
                .map(|cover_url| cover_url.clone().replace("t_cover_big", "t_thumb")),
        };

        Ok(GameMetadata {
            provider_id: IGDB_PROVIDER_ID.to_string(),
            provider_game_id: igdb_id,
            name,
            description,
            cover_url,
            background_url,
            icon_url,
            ..Default::default()
        })
    }
}

fn normalize_name(name: &str) -> String {
    let mut name = name.to_string();

    // normalize name, remove anything in braces and coallesce spaces
    while let Some(begin) = name.find('(') {
        let end = name.find(')').unwrap_or(name.len() - 1);

        name.replace_range(begin..=end, "");
    }

    while let Some(begin) = name.find('[') {
        let end = name.find(']').unwrap_or(name.len() - 1);

        name.replace_range(begin..=end, "");
    }

    while let Some(begin) = name.find('{') {
        let end = name.find('}').unwrap_or(name.len() - 1);

        name.replace_range(begin..=end, "");
    }

    name.chars()
        .map(|c| match c {
            ':' | '-' | '_' | '.' => ' ',
            _ => c,
        })
        .collect::<String>()
        .split_whitespace()
        .collect::<Vec<&str>>()
        .join(" ")
}

impl GameMetadataProvider<IgdbGameSearchQuery, Vec<igdb::Game>> for IGDBProvider {
    #[instrument(level = Level::DEBUG, skip(self))]
    async fn get_game_metadata(
        &self,
        game: Game,
        query: IgdbGameSearchQuery,
    ) -> GameMetadataSearchResult {
        let igdb_id = query.fields.as_ref().and_then(|fields| fields.id);
        let title = query
            .fields
            .as_ref()
            .and_then(|fields| fields.title.clone());

        let matches = self.search_game_metadata(query).await;

        let exact_match = matches.iter().find(|meta| {
            Some(meta.id) == igdb_id || title.as_ref().is_some_and(|title| title == &meta.name)
        });

        let first_match = matches.first();

        let igdb_match = exact_match.or(first_match).map(|meta| meta.to_owned());

        if let Some(igdb_match) = igdb_match {
            let artwork_urls: Vec<GameMetadataArtwork> = igdb_match
                .artworks
                .iter()
                .map(|artwork| {
                    artwork
                        .url
                        .replace("t_thumb", "t_1080p_2x")
                        .replace("//", "https://")
                })
                .map(|url| GameMetadataArtwork {
                    url,
                    ..Default::default()
                })
                .collect();

            let screenshot_urls: Vec<GameMetadataScreenshot> = igdb_match
                .screenshots
                .iter()
                .map(|screenshot| {
                    screenshot
                        .url
                        .replace("//", "https://")
                        .replace("t_thumb", "t_screenshot_huge_2x")
                })
                .map(|url| GameMetadataScreenshot {
                    url,
                    ..Default::default()
                })
                .collect();

            let video_urls: Vec<GameMetadataVideo> = igdb_match
                .videos
                .iter()
                .map(|video| format!("https://www.youtube.com/embed/{}", video.video_id))
                .map(|url| GameMetadataVideo {
                    url,
                    ..Default::default()
                })
                .collect();

            let mut game_metadata = match self.igdb_game_to_metadata(igdb_match) {
                Ok(metadata) => metadata,
                Err(err) => {
                    tracing::error!("Failed to convert IGDB game to metadata: {:?}", err);
                    return Default::default();
                }
            };

            game_metadata.game_id = game.id;

            return (
                Some(game_metadata),
                Some(artwork_urls),
                Some(screenshot_urls),
                Some(video_urls),
            );
        }

        Default::default()
    }

    #[instrument(level = Level::DEBUG, skip(self))]
    async fn search_game_metadata(&self, query: IgdbGameSearchQuery) -> Vec<igdb::Game> {
        let fields = IgdbFields {
            selector: Some(Selector::Include(IncludeFields {
                value: self.game_fields.clone(),
            })),
        }
        .into();

        let mut filters = HashMap::<String, FilterValue>::new();

        let filter_fields = query.fields.as_ref();
        let platform_igdb_id = filter_fields.and_then(|fields| fields.platform);
        let igdb_id = filter_fields.and_then(|fields| fields.id);
        let title = filter_fields.and_then(|fields| fields.title.as_ref().cloned());

        if let Some(platform) = platform_igdb_id {
            filters.insert(
                "release_dates.platform".to_string(),
                FilterValue {
                    operator: Some(FilterOperator::Equal.into()),
                    value: platform.to_string(),
                },
            );
        }

        if let Some(id) = igdb_id {
            filters.insert(
                "id".to_string(),
                FilterValue {
                    operator: Some(FilterOperator::Equal.into()),
                    value: id.to_string(),
                },
            );
        }

        if let Some(title) = title.clone() {
            filters.insert(
                "name".to_string(),
                FilterValue {
                    operator: Some(FilterOperator::Equal.into()),
                    value: title,
                },
            );
        }

        let query = GetIgdbSearchRequest {
            fields,
            search: query.search,
            pagination: None,
            search_type: IgdbSearchType::Game.into(),
            filters: IgdbFilters { filters }.into(),
        };

        match self.search_metadata(query).await {
            Some(IgdbSearchData::Game(matches)) => matches.games,
            _ => {
                vec![]
            }
        }
    }
}
