use super::provider::{IGDBProvider, IgdbSearchData, IgdbSearchQuery, IgdbSearchType};
use crate::metadata_providers::{
    igdb::provider::IGDB_PROVIDER_ID, MetadataProviderError, PlatformMetadataProvider,
    PlatformMetadataSearchParams, Result, ToPlatformMetadata,
};
use prost::Message;
use retrom_codegen::{
    igdb,
    retrom::{
        providers::igdb::v1::{
            igdb_fields::{IncludeFields, Selector},
            igdb_filters::{FilterOperator, FilterValue},
            IgdbFields, IgdbFilters, IgdbSearch,
        },
        services::{
            metadata::v1::{IgdbSearchRequest, PlatformMetadata, PlatformMetadataView},
            tags::v1::{Tag, TagDomain, TagView},
        },
    },
};
use tracing::{instrument, Level};

impl ToPlatformMetadata for igdb::Platform {
    fn to_platform_metadata(&self, platform_id: &str) -> PlatformMetadataView {
        let mut metadata = igdb_platform_to_metadata(self);
        metadata.platform_id = platform_id.to_string();
        metadata.provider_platform_id = self.id.to_string();
        metadata.provider_id = IGDB_PROVIDER_ID.to_string();

        PlatformMetadataView {
            metadata: Some(metadata),
            tags: igdb_platform_tags(self),
        }
    }
}

impl PlatformMetadataProvider for IGDBProvider {
    type ProviderPlatformId = u64;
    type PlatformModel = igdb::Platform;
    type SearchQuery = IgdbSearchRequest;

    #[instrument(level = Level::DEBUG, skip(self))]
    async fn get_platform_metadata(
        &self,
        params: PlatformMetadataSearchParams<Self::ProviderPlatformId>,
    ) -> Result<Self::PlatformModel> {
        let igdb_id = params.provider_platform_id;
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

        let query = IgdbSearchRequest {
            search: Some(IgdbSearch {
                value: name.as_ref().unwrap_or(&"".to_string()).clone(),
            }),
            filters: Some(filter_list),
            ..Default::default()
        };

        let mut matches = self.search_platform_metadata(query).await?.into_iter();
        let first_match = matches.next();
        let exact_match = matches.find(|meta| {
            igdb_id.is_some_and(|id| id == meta.id)
                || name.as_ref().is_some_and(|name| &meta.name == name)
        });

        exact_match
            .or(first_match)
            .ok_or(MetadataProviderError::NoMatchesFound)
    }

    #[instrument(level = Level::DEBUG, skip_all)]
    async fn search_platform_metadata(
        &self,
        mut query: Self::SearchQuery,
    ) -> Result<Vec<Self::PlatformModel>> {
        let included_fields = IgdbFields {
            selector: Some(Selector::Include(IncludeFields {
                value: self.platform_fields.clone(),
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
            search_type: IgdbSearchType::Platform,
            request: query,
        };

        match self.search_metadata(query).await {
            Some(IgdbSearchData::Platform(matches)) => Ok(matches.platforms),
            _ => Err(MetadataProviderError::NoMatchesFound),
        }
    }
}

fn igdb_platform_to_metadata(igdb_match: &igdb::Platform) -> PlatformMetadata {
    let description = Some(igdb_match.summary.clone());
    let name = Some(igdb_match.name.clone());
    let igdb_id = igdb_match.id.to_string();

    let logo_url = igdb_match
        .platform_logo
        .as_ref()
        .map(|logo| logo.url.to_string().replace("//", "https://"));

    PlatformMetadata {
        provider_id: IGDB_PROVIDER_ID.to_string(),
        provider_platform_id: igdb_id,
        name,
        description,
        logo_url,
        ..Default::default()
    }
}

fn igdb_platform_tags(igdb_match: &igdb::Platform) -> Vec<TagView> {
    let mut tags = vec![TagView {
        domain: Some(TagDomain {
            name: "generation".to_string(),
            ..Default::default()
        }),
        tag: Some(Tag {
            value: igdb_match.generation.to_string(),
            ..Default::default()
        }),
    }];

    if let Some(family) = &igdb_match.platform_family {
        tags.push(TagView {
            domain: Some(TagDomain {
                name: "family".to_string(),
                ..Default::default()
            }),
            tag: Some(Tag {
                value: family.name.to_string(),
                ..Default::default()
            }),
        });
    };

    tags.into_iter().collect()
}
