use std::sync::Arc;

use bigdecimal::{BigDecimal, FromPrimitive, ToPrimitive};
use deunicode::deunicode;
use generated::{igdb, retrom};
use prost::Message;
use tracing::{debug, error, info, instrument, Instrument, Level};

use super::provider::IGDBProvider;

#[instrument(level = Level::DEBUG, skip_all, fields(name = game.path))]
pub async fn match_game_igdb(
    provider: Arc<IGDBProvider>,
    game: &retrom::Game,
) -> Result<retrom::NewGameMetadata, reqwest::Error> {
    provider.maybe_refresh_token().await;

    let name = &game.path.split('/').last().unwrap_or(&game.path);

    let search = deunicode(&name);
    info!("Matching game: {search}");

    let matches = match search_games(provider.clone(), &search).await {
        Ok(igdb_games) => igdb_games,
        Err(e) => {
            error!("Could not get IGDB game: {:?}", e);
            return Err(e);
        }
    };

    let igdb_match = matches.games.into_iter().next();
    if igdb_match.is_none() {
        debug!("No match found.");
    } else {
        debug!("Match found!");
    }

    let metadata = match igdb_match {
        Some(igdb_match) => igdb_game_to_metadata(igdb_match, Some(game)),
        None => retrom::NewGameMetadata {
            game_id: Some(game.id),
            ..Default::default()
        },
    };

    Ok(metadata)
}

pub async fn match_games_igdb(
    provider: Arc<IGDBProvider>,
    games: Vec<retrom::Game>,
) -> Result<Vec<retrom::NewGameMetadata>, reqwest::Error> {
    let all_metadata_res = futures::future::join_all(
        games
            .into_iter()
            .map(|game| {
                let provider = provider.clone();
                tokio::spawn(async move {
                    match match_game_igdb(provider, &game).await {
                        Ok(metadata) => Ok(metadata),
                        Err(e) => Err(e),
                    }
                })
            })
            .map(|future| future.instrument(tracing::info_span!("match_games")))
            .collect::<Vec<_>>(),
    );

    let mut all_metadata = vec![];
    for res in all_metadata_res.await {
        match res {
            Ok(Ok(metadata)) => all_metadata.push(metadata),
            Ok(Err(e)) => {
                error!("Could not get IGDB game: {:?}", e);
            }
            Err(e) => {
                error!("Could not get IGDB game: {:?}", e);
            }
        };
    }

    Ok(all_metadata)
}

pub(crate) async fn search_games(
    provider: Arc<IGDBProvider>,
    search_string: &str,
) -> Result<igdb::GameResult, reqwest::Error> {
    let query =
        format!("fields name, cover.url, artworks.url, artworks.height, artworks.width, summary; search \"{search_string}\"; limit 10;");

    let res = match provider.make_request("games.pb".into(), query).await {
        Ok(res) => Ok(res),
        Err(e) => return Err(e),
    };

    let bytes = match res {
        Ok(res) => res.bytes().await.expect("Could not parse response"),
        Err(e) => return Err(e),
    };

    Ok(igdb::GameResult::decode(bytes).expect("Could not decode response"))
}

pub fn igdb_game_to_metadata(
    igdb_match: igdb::Game,
    game: Option<&retrom::Game>,
) -> retrom::NewGameMetadata {
    let description = Some(igdb_match.summary);
    let name = Some(igdb_match.name);
    let igdb_id = match BigDecimal::from_u64(igdb_match.id) {
        Some(id) => id.to_i64(),
        None => None,
    };

    let cover_url = igdb_match.cover.and_then(|cover| {
        Some(
            cover
                .url
                .to_string()
                .replace("t_thumb", "t_cover_big")
                .replace("//", "https://"),
        )
    });

    let background_url = igdb_match
        .artworks
        .iter()
        .find(|artwork| artwork.width > artwork.height)
        .and_then(|artwork| {
            Some(
                artwork
                    .url
                    .to_string()
                    .replace("//", "https://")
                    .replace("t_thumb", "t_1080p"),
            )
        })
        .or(igdb_match.artworks.first().and_then(|artwork| {
            Some(
                artwork
                    .url
                    .to_string()
                    .replace("//", "https://")
                    .replace("t_thumb", "t_1080p"),
            )
        }));

    let icon_url = igdb_match
        .artworks
        .iter()
        .find(|artwork| artwork.width == artwork.height)
        .and_then(|artwork| Some(artwork.url.to_string().replace("//", "https://")))
        .or(cover_url
            .as_ref()
            .and_then(|cover_url| Some(cover_url.clone().replace("t_cover_big", "t_thumb"))));

    let icon_url = match icon_url {
        Some(icon_url) => Some(icon_url),
        None => cover_url
            .as_ref()
            .and_then(|cover_url| Some(cover_url.clone().replace("t_cover_big", "t_thumb"))),
    };

    retrom::NewGameMetadata {
        game_id: game.and_then(|game| Some(game.id)),
        igdb_id,
        name,
        description,
        cover_url,
        background_url,
        icon_url,
        ..Default::default()
    }
}
