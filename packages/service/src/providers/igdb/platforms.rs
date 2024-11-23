use std::{collections::HashMap, path::PathBuf, str::FromStr};

use crate::providers::{MetadataProvider, PlatformMetadataProvider};

use super::provider::{IGDBProvider, IgdbSearchData};
use bigdecimal::{BigDecimal, FromPrimitive, ToPrimitive};
use deunicode::deunicode;
use retrom_codegen::{
    igdb,
    retrom::{
        self,
        get_igdb_search_request::IgdbSearchType,
        igdb_fields::{IncludeFields, Selector},
        igdb_filters::{FilterOperator, FilterValue},
        GetIgdbSearchRequest, IgdbFields, IgdbFilters, IgdbPlatformSearchQuery, IgdbSearch,
    },
};
use tracing::{debug, instrument, Level};

impl IGDBProvider {
    pub fn igdb_platform_to_metadata(
        &self,
        igdb_match: igdb::Platform,
    ) -> retrom::NewPlatformMetadata {
        let description = Some(igdb_match.summary);
        let name = Some(igdb_match.name);
        let igdb_id = match BigDecimal::from_u64(igdb_match.id) {
            Some(id) => id.to_i64(),
            None => None,
        };

        let logo_url = igdb_match
            .platform_logo
            .map(|logo| logo.url.to_string().replace("//", "https://"));

        retrom::NewPlatformMetadata {
            igdb_id,
            name,
            description,
            logo_url,
            ..Default::default()
        }
    }
}

impl PlatformMetadataProvider<IgdbPlatformSearchQuery> for IGDBProvider {
    #[instrument(level = Level::DEBUG, skip_all, fields(name = platform.path))]
    async fn get_platform_metadata(
        &self,
        platform: retrom::Platform,
        query: Option<IgdbPlatformSearchQuery>,
    ) -> Option<retrom::NewPlatformMetadata> {
        let naive_name = platform.path.split('/').last().unwrap_or(&platform.path);
        let path = PathBuf::from_str(&platform.path).unwrap();
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
        debug!("Searching for platform: {}", search);

        let search_query = match query {
            Some(mut query) => {
                query.search = Some(IgdbSearch { value: search });
                query
            }
            None => IgdbPlatformSearchQuery {
                search: Some(IgdbSearch { value: search }),
                ..Default::default()
            },
        };

        let matches = self.search_platform_metadata(search_query).await;

        let exact_match = matches
            .iter()
            .find(|meta| meta.name == Some(name.to_string()));

        let first_match = matches.first();

        let igdb_match = exact_match.or(first_match).map(|meta| meta.to_owned());

        if let Some(mut igdb_match) = igdb_match {
            igdb_match.platform_id = Some(platform.id);
            return Some(igdb_match);
        };

        None
    }

    #[instrument(level = Level::DEBUG, skip_all)]
    async fn search_platform_metadata(
        &self,
        query: IgdbPlatformSearchQuery,
    ) -> Vec<retrom::NewPlatformMetadata> {
        let fields = IgdbFields {
            selector: Some(Selector::Include(IncludeFields {
                value: self.platform_fields.clone(),
            })),
        }
        .into();

        let mut filters = HashMap::<String, FilterValue>::new();

        let filter_fields = query.fields.as_ref();
        let igdb_id = filter_fields.and_then(|fields| fields.id);
        let name = filter_fields.and_then(|fields| fields.name.as_ref().cloned());

        if let Some(id) = igdb_id {
            filters.insert(
                "id".to_string(),
                FilterValue {
                    operator: Some(FilterOperator::Equal.into()),
                    value: id.to_string(),
                },
            );
        };

        if let Some(name) = name {
            filters.insert(
                "name".to_string(),
                FilterValue {
                    operator: Some(FilterOperator::Equal.into()),
                    value: name,
                },
            );
        };

        let query = GetIgdbSearchRequest {
            fields,
            search: query.search,
            pagination: None,
            search_type: IgdbSearchType::Platform.into(),
            filters: IgdbFilters { filters }.into(),
        };

        match self.search_metadata(query).await {
            Some(IgdbSearchData::Platform(matches)) => matches
                .platforms
                .into_iter()
                .map(|platform| self.igdb_platform_to_metadata(platform))
                .collect(),
            _ => {
                vec![]
            }
        }
    }
}
