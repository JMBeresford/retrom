use super::provider::{IGDBProvider, IgdbSearchData, IgdbSearchQuery, IgdbSearchType};
use crate::metadata_providers::{
    igdb::provider::IGDB_PROVIDER_ID, GameMetadataProvider, GameMetadataSearchParams,
    MetadataProviderError, Result, ToGameMetadata, ToTags,
};
use prost::Message;
use retrom_codegen::{
    igdb::{self},
    retrom::{
        providers::igdb::v1::{
            igdb_fields::{IncludeFields, Selector},
            igdb_filters::{FilterOperator, FilterValue},
            IgdbFields, IgdbFilters, IgdbSearch,
        },
        services::{
            metadata::v1::{
                GameMetadata, GameMetadataArtwork, GameMetadataLink, GameMetadataScreenshot,
                GameMetadataVideo, GameMetadataView, IgdbSearchRequest,
            },
            tags::v1::{Tag, TagDomain, TagView},
        },
    },
};
use tracing::{instrument, Level};

impl ToGameMetadata for igdb::Game {
    fn to_game_metadata(&self, game_id: &str) -> GameMetadataView {
        let mut metadata = igdb_game_to_metadata(self);
        metadata.game_id = game_id.to_string();
        metadata.provider_game_id = self.id.to_string();
        metadata.provider_id = IGDB_PROVIDER_ID.to_string();

        GameMetadataView {
            metadata: Some(metadata),
            artworks: igdb_game_artwork(self),
            screenshots: igdb_game_screenshots(self),
            videos: igdb_game_videos(self),
            links: igdb_game_links(self),
            similar_game_ids: vec![],
        }
    }
}

impl ToTags for igdb::Game {
    fn to_tags(&self) -> Vec<TagView> {
        let genres = self.genres.iter().map(|genre| TagView {
            domain: Some(TagDomain {
                name: "genre".to_string(),
                ..Default::default()
            }),
            tag: Some(Tag {
                value: genre.name.clone(),
                ..Default::default()
            }),
        });

        let franchises = self.franchises.iter().map(|franchise| TagView {
            domain: Some(TagDomain {
                name: "franchise".to_string(),
                ..Default::default()
            }),
            tag: Some(Tag {
                value: franchise.name.clone(),
                ..Default::default()
            }),
        });

        genres.chain(franchises).collect()
    }
}

impl GameMetadataProvider for IGDBProvider {
    type ProviderGameId = u64;
    type SearchQuery = IgdbSearchRequest;
    type GameModel = igdb::Game;

    #[instrument(level = Level::DEBUG, skip(self))]
    async fn get_game_metadata(
        &self,
        params: GameMetadataSearchParams<Self::ProviderGameId>,
    ) -> Result<igdb::Game> {
        let igdb_id = params.provider_game_id;
        let name = params.name;

        let mut filter_list = IgdbFilters::default();

        if let Some(igdb_id) = igdb_id {
            filter_list.filters.insert(
                "id".to_string(),
                FilterValue {
                    value: igdb_id.to_string(),
                    operator: Some(FilterOperator::Equal as i32),
                },
            );
        }

        if let Some(ref name) = &name {
            filter_list.filters.insert(
                "name".to_string(),
                FilterValue {
                    value: name.clone(),
                    operator: Some(FilterOperator::Equal as i32),
                },
            );
        }

        if let Some(igdb_platform_id) = params.provider_platform_id {
            filter_list.filters.insert(
                "platforms".to_string(),
                FilterValue {
                    value: igdb_platform_id.to_string(),
                    operator: Some(FilterOperator::Any as i32),
                },
            );
        }

        let query = IgdbSearchRequest {
            search: Some(IgdbSearch {
                value: normalize_name(name.as_ref().unwrap_or(&"".to_string())),
            }),
            filters: Some(filter_list),
            ..Default::default()
        };

        let mut matches = self.search_game_metadata(query).await?.into_iter();
        let first_match = matches.next();
        let exact_match =
            matches.find(|meta| Some(meta.id) == igdb_id || name.as_ref() == Some(&meta.name));

        exact_match
            .or(first_match)
            .ok_or(MetadataProviderError::NoMatchesFound)
    }

    #[instrument(level = Level::DEBUG, skip(self))]
    async fn search_game_metadata(
        &self,
        mut query: Self::SearchQuery,
    ) -> Result<Vec<Self::GameModel>> {
        let included_fields = IgdbFields {
            selector: Some(Selector::Include(IncludeFields {
                value: self.game_fields.clone(),
            })),
        };

        match query.fields {
            Some(IgdbFields {
                selector: Some(Selector::Exclude(_)),
            }) => {}
            Some(ref mut fields) => {
                if let Err(why) = fields.merge(included_fields.encode_to_vec().as_slice()) {
                    tracing::warn!(
                        "Failed to merge included fields into search query: {:?}",
                        why
                    );
                }
            }
            None => {
                query.fields = Some(included_fields);
            }
        };

        let query = IgdbSearchQuery {
            search_type: IgdbSearchType::Game,
            request: query,
        };

        match self.search_metadata(query).await {
            Some(IgdbSearchData::Game(matches)) => Ok(matches.games),
            _ => Err(MetadataProviderError::NoMatchesFound),
        }
    }
}

fn igdb_game_to_metadata(igdb_match: &igdb::Game) -> GameMetadata {
    let description = Some(igdb_match.summary.clone());
    let name = Some(igdb_match.name.clone());
    let igdb_id = igdb_match.id.to_string();

    let cover_url = igdb_match.cover.as_ref().map(|cover| {
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

    GameMetadata {
        provider_id: IGDB_PROVIDER_ID.to_string(),
        provider_game_id: igdb_id,
        name,
        description,
        cover_url,
        background_url,
        icon_url,
        ..Default::default()
    }
}

fn igdb_game_artwork(igdb_match: &igdb::Game) -> Vec<GameMetadataArtwork> {
    igdb_match
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
        .collect()
}

fn igdb_game_screenshots(igdb_match: &igdb::Game) -> Vec<GameMetadataScreenshot> {
    igdb_match
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
        .collect()
}

fn igdb_game_videos(igdb_match: &igdb::Game) -> Vec<GameMetadataVideo> {
    igdb_match
        .videos
        .iter()
        .map(|video| format!("https://www.youtube.com/embed/{}", video.video_id))
        .map(|url| GameMetadataVideo {
            url,
            ..Default::default()
        })
        .collect()
}

fn igdb_game_links(igdb_match: &igdb::Game) -> Vec<GameMetadataLink> {
    let urls = vec![GameMetadataLink {
        url: igdb_match.url.clone(),
        ..Default::default()
    }];

    let websites = igdb_match
        .websites
        .iter()
        .filter(|w| w.trusted)
        .map(|website| GameMetadataLink {
            url: website.url.clone(),
            ..Default::default()
        });

    urls.into_iter().chain(websites).collect()
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
