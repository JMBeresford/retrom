use core::panic;
use std::sync::Arc;

use bigdecimal::{BigDecimal, FromPrimitive, ToPrimitive};
use deunicode::deunicode;
use futures::TryFutureExt;
use prost::Message;
use retrom_codegen::{
    igdb,
    retrom::{self},
};
use tracing::{error, info, instrument, warn, Instrument, Level};

use super::provider::IGDBProvider;

#[instrument(level = Level::DEBUG, skip_all, fields(name = platform.path))]
pub async fn match_platform_igdb(
    provider: Arc<IGDBProvider>,
    platform: &retrom::Platform,
) -> Option<retrom::NewPlatformMetadata> {
    provider.maybe_refresh_token().await;

    let name = &platform.path.split('/').last().unwrap_or(&platform.path);

    let search = deunicode(name);
    info!("Searching for platform: {}", search);

    let matches = match search_platforms(provider.clone(), &search).await {
        Ok(igdb_platforms) => igdb_platforms,
        Err(e) => {
            error!("Could not get IGDB platform: {:?}", e);
            return None;
        }
    };

    let igdb_match = matches.platforms.into_iter().next();

    let metadata = match igdb_match {
        Some(igdb_match) => igdb_platform_to_metadata(igdb_match, Some(platform)),
        None => retrom::NewPlatformMetadata {
            platform_id: Some(platform.id),
            ..Default::default()
        },
    };

    Some(metadata)
}

pub async fn match_platforms_igdb(
    provider: Arc<IGDBProvider>,
    platforms: Vec<retrom::Platform>,
) -> Vec<retrom::NewPlatformMetadata> {
    let all_metadata = futures::future::join_all(
        platforms
            .into_iter()
            .map(|platform| {
                let provider = provider.clone();
                let path = platform.path.clone();
                tokio::spawn(async move { match_platform_igdb(provider, &platform).await }).map_err(
                    move |e| {
                        warn!("Could not match platform {path}: {e:?}");
                        e
                    },
                )
            })
            .map(|future| future.instrument(tracing::info_span!("match_platforms"))),
    )
    .await;

    all_metadata
        .into_iter()
        .filter_map(|future| future.ok())
        .flatten()
        .collect()
}

#[instrument(skip(provider))]
pub(crate) async fn search_platforms(
    provider: Arc<IGDBProvider>,
    search_string: &str,
) -> Result<igdb::PlatformResult, reqwest::StatusCode> {
    let query = format!("fields name, summary; search \"{search_string}\"; limit 10;");

    let res = match provider.make_request("platforms.pb".into(), query).await {
        Ok(res) => res,
        Err(e) => {
            error!("Could not get IGDB platform: {:?}", e);
            return Err(e);
        }
    };

    let bytes = match res.bytes().await {
        Ok(bytes) => bytes,
        Err(e) => {
            error!(
                "Could not parse IGDB response for query {search_string}: {:?}",
                e
            );
            return Err(reqwest::StatusCode::INTERNAL_SERVER_ERROR);
        }
    };

    let result = match igdb::PlatformResult::decode(bytes) {
        Ok(result) => result,
        Err(e) => {
            panic!(
                "Could not parse IGDB response for query {search_string}: {:?}",
                e
            );
        }
    };

    Ok(result)
}

pub fn igdb_platform_to_metadata(
    igdb_match: igdb::Platform,
    platform: Option<&retrom::Platform>,
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
        platform_id: platform.map(|platform| platform.id),
        igdb_id,
        name,
        description,
        logo_url,
        ..Default::default()
    }
}
