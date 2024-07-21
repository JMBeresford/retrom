use std::sync::Arc;

use bigdecimal::{BigDecimal, FromPrimitive, ToPrimitive};
use deunicode::deunicode;
use prost::Message;
use retrom_codegen::{igdb, retrom};
use tracing::{debug, error, info, instrument, Instrument, Level};

use super::provider::IGDBProvider;

#[instrument(level = Level::DEBUG, skip_all, fields(name = platform.path))]
pub async fn match_platform_igdb(
    provider: Arc<IGDBProvider>,
    platform: &retrom::Platform,
) -> Result<retrom::NewPlatformMetadata, reqwest::Error> {
    provider.maybe_refresh_token().await;

    let name = &platform.path.split('/').last().unwrap_or(&platform.path);

    let search = deunicode(&name);
    info!("Matching platform: {search}");

    let matches = match search_platforms(provider.clone(), &search).await {
        Ok(igdb_platforms) => igdb_platforms,
        Err(e) => {
            error!("Could not get IGDB platform: {:?}", e);
            return Err(e);
        }
    };

    let igdb_match = matches.platforms.into_iter().next();
    if igdb_match.is_none() {
        debug!("No match found.");
    } else {
        debug!("Match found!");
    }

    let metadata = match igdb_match {
        Some(igdb_match) => igdb_platform_to_metadata(igdb_match, Some(platform)),
        None => retrom::NewPlatformMetadata {
            platform_id: Some(platform.id),
            ..Default::default()
        },
    };

    Ok(metadata)
}

pub async fn match_platforms_igdb(
    provider: Arc<IGDBProvider>,
    platforms: Vec<retrom::Platform>,
) -> Result<Vec<retrom::NewPlatformMetadata>, reqwest::Error> {
    let all_metadata_res = futures::future::join_all(
        platforms
            .into_iter()
            .map(|platform| {
                let provider = provider.clone();
                tokio::spawn(async move {
                    match match_platform_igdb(provider, &platform).await {
                        Ok(metadata) => Ok(metadata),
                        Err(e) => Err(e),
                    }
                })
            })
            .map(|future| future.instrument(tracing::info_span!("match_platforms")))
            .collect::<Vec<_>>(),
    );

    let mut all_metadata = vec![];
    for res in all_metadata_res.await {
        match res {
            Ok(Ok(metadata)) => all_metadata.push(metadata),
            Ok(Err(e)) => {
                error!("Could not get IGDB platform: {:?}", e);
            }
            Err(e) => {
                error!("Could not get IGDB platform: {:?}", e);
            }
        };
    }

    Ok(all_metadata)
}

#[instrument(skip(provider))]
pub(crate) async fn search_platforms(
    provider: Arc<IGDBProvider>,
    search_string: &str,
) -> Result<igdb::PlatformResult, reqwest::Error> {
    let query = format!("fields name, summary; search \"{search_string}\"; limit 10;");

    let res = match provider.make_request("platforms.pb".into(), query).await {
        Ok(res) => Ok(res),
        Err(e) => return Err(e),
    };

    let bytes = match res {
        Ok(res) => res.bytes().await.expect("Could not parse response"),
        Err(e) => return Err(e),
    };

    Ok(igdb::PlatformResult::decode(bytes).expect("Could not decode response"))
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
        .and_then(|logo| Some(logo.url.to_string().replace("//", "https://")));

    retrom::NewPlatformMetadata {
        platform_id: platform.and_then(|platform| Some(platform.id)),
        igdb_id,
        name,
        description,
        logo_url,
        ..Default::default()
    }
}
