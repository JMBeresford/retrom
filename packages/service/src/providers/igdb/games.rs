use std::{collections::HashMap, path::PathBuf, str::FromStr};

use bigdecimal::{BigDecimal, FromPrimitive, ToPrimitive};
use deunicode::deunicode;
use retrom_codegen::{
    igdb::{self},
    retrom::{
        self,
        get_igdb_search_request::IgdbSearchType,
        igdb_fields::{IncludeFields, Selector},
        igdb_filters::{FilterOperator, FilterValue},
        GetIgdbSearchRequest, IgdbFields, IgdbFilters, IgdbGameSearchQuery, IgdbSearch,
        NewGameMetadata,
    },
};
use tracing::{debug, instrument, Level};

use crate::providers::{GameMetadataProvider, MetadataProvider};

use super::provider::{IGDBProvider, IgdbSearchData};

impl IGDBProvider {
    pub fn igdb_game_to_metadata(&self, igdb_match: igdb::Game) -> retrom::NewGameMetadata {
        let description = Some(igdb_match.summary);
        let name = Some(igdb_match.name);
        let igdb_id = match BigDecimal::from_u64(igdb_match.id) {
            Some(id) => id.to_i64(),
            None => None,
        };

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

        let mut links: Vec<String> = igdb_match
            .websites
            .into_iter()
            .filter(|website| website.trusted)
            .map(|website| website.url)
            .collect();

        links.push(igdb_match.url);

        let artwork_urls: Vec<String> = igdb_match
            .artworks
            .into_iter()
            .map(|artwork| {
                artwork
                    .url
                    .replace("t_thumb", "t_1080p_2x")
                    .replace("//", "https://")
            })
            .collect();

        let screenshot_urls: Vec<String> = igdb_match
            .screenshots
            .into_iter()
            .map(|screenshot| {
                screenshot
                    .url
                    .replace("//", "https://")
                    .replace("t_thumb", "screenshot_huge_2x")
            })
            .collect();

        let video_urls: Vec<String> = igdb_match
            .videos
            .into_iter()
            .map(|video| format!("https://www.youtube.com/embed/{}", video.video_id))
            .collect();

        retrom::NewGameMetadata {
            igdb_id,
            name,
            description,
            cover_url,
            background_url,
            icon_url,
            links,
            artwork_urls,
            screenshot_urls,
            video_urls,
            ..Default::default()
        }
    }
}

impl GameMetadataProvider<IgdbGameSearchQuery> for IGDBProvider {
    #[instrument(level = Level::DEBUG, skip_all, fields(name = game.path))]
    async fn get_game_metadata(
        &self,
        game: retrom::Game,
        query: Option<IgdbGameSearchQuery>,
    ) -> Option<NewGameMetadata> {
        let naive_name = game.path.split('/').last().unwrap_or(&game.path);
        let path = PathBuf::from_str(&game.path).unwrap();
        let mut name = path
            .file_stem()
            .and_then(|stem| stem.to_str())
            .unwrap_or(naive_name)
            .to_string();

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

        name = name
            .chars()
            .map(|c| match c {
                ':' | '-' | '_' | '.' => ' ',
                _ => c,
            })
            .collect();

        name = name.split_whitespace().collect::<Vec<&str>>().join(" ");
        let name = name.as_str();

        let search = deunicode(name);
        debug!("Matching game: {search}");

        let search_query = match query {
            Some(mut query) => {
                query.search = Some(IgdbSearch { value: search });
                query
            }
            None => IgdbGameSearchQuery {
                search: Some(IgdbSearch { value: search }),
                ..Default::default()
            },
        };

        let matches = self.search_game_metadata(search_query).await;

        let exact_match = matches
            .iter()
            .find(|meta| meta.name == Some(name.to_string()));

        let first_match = matches.first();

        let igdb_match = exact_match.or(first_match).map(|meta| meta.to_owned());

        if let Some(mut igdb_match) = igdb_match {
            igdb_match.game_id = Some(game.id);
            return Some(igdb_match);
        }

        None
    }

    #[instrument(level = Level::DEBUG, skip(self))]
    async fn search_game_metadata(
        &self,
        query: IgdbGameSearchQuery,
    ) -> Vec<retrom::NewGameMetadata> {
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
            Some(IgdbSearchData::Game(matches)) => matches
                .games
                .into_iter()
                .map(|game| self.igdb_game_to_metadata(game))
                .collect(),
            _ => {
                vec![]
            }
        }
    }
}
