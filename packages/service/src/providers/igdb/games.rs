use std::sync::Arc;

use deunicode::deunicode;
use generated::{igdb, retrom};
use prost::Message;
use tracing::{debug, error, info, instrument, Instrument, Level};

use super::provider::IGDBProvider;

#[instrument(level = Level::DEBUG, skip_all, fields(name = game.name))]
pub async fn match_game_igdb(
    provider: Arc<IGDBProvider>,
    game: &retrom::Game,
) -> Result<retrom::Metadata, reqwest::Error> {
    provider.maybe_refresh_token().await;

    let search = deunicode(&game.name);
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

    let igdb_id = igdb_match.as_ref().and_then(|game| Some(game.id));
    let description = igdb_match
        .as_ref()
        .and_then(|game| Some(game.summary.to_string()));

    let cover_url = igdb_match
        .as_ref()
        .and_then(|game| game.cover.as_ref())
        .and_then(|cover| {
            Some(
                cover
                    .url
                    .to_string()
                    .replace("t_thumb", "t_cover_big")
                    .replace("//", "https://"),
            )
        });

    let background_url = igdb_match.as_ref().and_then(|game| {
        game.artworks
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
    });

    let icon_url = igdb_match.as_ref().and_then(|game| {
        game.artworks
            .iter()
            .find(|artwork| artwork.width == artwork.height)
            .and_then(|artwork| Some(artwork.url.to_string().replace("//", "https://")))
    });

    let icon_url = match icon_url {
        Some(icon_url) => Some(icon_url),
        None => cover_url
            .as_ref()
            .and_then(|cover_url| Some(cover_url.clone().replace("t_cover_big", "t_thumb"))),
    };

    let metadata = retrom::Metadata {
        game_id: game.id.to_string(),
        igdb_id,
        description,
        cover_url,
        background_url,
        icon_url,
    };

    Ok(metadata)
}

pub async fn match_games_igdb(
    provider: Arc<IGDBProvider>,
    games: Vec<retrom::Game>,
) -> Result<Vec<retrom::Metadata>, reqwest::Error> {
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

async fn search_games(
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

async fn search_artworks(
    provider: Arc<IGDBProvider>,
    search_string: Option<&str>,
    filter_string: Option<&str>,
) -> Result<igdb::ArtworkResult, reqwest::Error> {
    let search_string = match search_string {
        Some(search) => format!("search \"{search}\";", search = search),
        None => "".to_string(),
    };

    let filter_string = match filter_string {
        Some(filter) => format!("where {filter};"),
        None => "".to_string(),
    };

    let query = format!("fields url, height, width; {search_string} limit 10; {filter_string}");

    let res = match provider.make_request("artworks.pb".into(), query).await {
        Ok(res) => Ok(res),
        Err(e) => return Err(e),
    };

    let bytes = match res {
        Ok(res) => res.bytes().await.expect("Could not parse response"),
        Err(e) => return Err(e),
    };

    Ok(igdb::ArtworkResult::decode(bytes).expect("Could not decode response"))
}
