use super::provider::{IGDBProvider, IgdbSearchData};
use crate::metadata_providers::{MetadataProvider, PlatformMetadataProvider};
use bigdecimal::{BigDecimal, FromPrimitive, ToPrimitive};
use retrom_codegen::{
    igdb,
    retrom::{
        providers::igdb::v1::{
            igdb_fields::{IncludeFields, Selector},
            igdb_filters::{FilterOperator, FilterValue},
            IgdbFields, IgdbFilters, IgdbPlatformSearchQuery,
        },
        services::{
            library::v1::Platform,
            metadata::v1::{
                get_igdb_search_request::IgdbSearchType, GetIgdbSearchRequest, PlatformMetadata,
            },
        },
    },
};
use std::collections::HashMap;
use tracing::{instrument, Level};

impl IGDBProvider {
    pub fn igdb_platform_to_metadata(&self, igdb_match: igdb::Platform) -> PlatformMetadata {
        let description = Some(igdb_match.summary);
        let name = Some(igdb_match.name);
        let igdb_id = match BigDecimal::from_u64(igdb_match.id) {
            Some(id) => id.to_i64(),
            None => None,
        };

        let logo_url = igdb_match
            .platform_logo
            .map(|logo| logo.url.to_string().replace("//", "https://"));

        PlatformMetadata {
            igdb_id,
            name,
            description,
            logo_url,
            ..Default::default()
        }
    }
}

impl PlatformMetadataProvider<IgdbPlatformSearchQuery> for IGDBProvider {
    #[instrument(level = Level::DEBUG, skip(self))]
    async fn get_platform_metadata(
        &self,
        platform: Platform,
        query: IgdbPlatformSearchQuery,
    ) -> Option<PlatformMetadata> {
        let igdb_id = query.fields.as_ref().and_then(|fields| fields.id);
        let name = query.fields.as_ref().and_then(|fields| fields.name.clone());

        let matches = self.search_platform_metadata(query).await;

        let exact_match = matches.iter().find(|meta| {
            meta.igdb_id
                .is_some_and(|id| id.to_owned().to_u64() == igdb_id)
                || name
                    .as_ref()
                    .is_some_and(|name| meta.name.as_ref() == Some(name))
        });

        let first_match = matches.first();

        let igdb_match = exact_match.or(first_match).map(|meta| meta.to_owned());

        if let Some(mut igdb_match) = igdb_match {
            igdb_match.platform_id = platform.id;
            return Some(igdb_match);
        };

        None
    }

    #[instrument(level = Level::DEBUG, skip_all)]
    async fn search_platform_metadata(
        &self,
        query: IgdbPlatformSearchQuery,
    ) -> Vec<PlatformMetadata> {
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
