use std::{path::PathBuf, str::FromStr, sync::Arc};

use bigdecimal::{BigDecimal, FromPrimitive, ToPrimitive};
use deunicode::deunicode;
use prost::Message;
use retrom_codegen::{
    igdb,
    retrom::{self, GameMetadata, NewGameMetadata},
};
use tracing::{debug, error, info, instrument, warn, Instrument, Level};

use super::provider::IGDBProvider;

#[instrument(level = Level::DEBUG, skip_all, fields(name = game.path))]
pub async fn match_game_igdb(
    provider: Arc<IGDBProvider>,
    game: &retrom::Game,
) -> Option<retrom::NewGameMetadata> {
    provider.maybe_refresh_token().await;

    let naive_name = game.path.split('/').last().unwrap_or(&game.path);
    let path = PathBuf::from_str(&game.path).unwrap();
    let name = path
        .file_stem()
        .and_then(|stem| stem.to_str())
        .unwrap_or(naive_name);

    let search = deunicode(name);
    info!("Matching game: {search}");

    let matches = match search_games(provider.clone(), &search).await {
        Ok(igdb_games) => igdb_games,
        Err(e) => {
            warn!("Could not get IGDB games: {:?}", e);
            return None;
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

    Some(metadata)
}

pub async fn match_games_igdb(
    provider: Arc<IGDBProvider>,
    games: Vec<retrom::Game>,
    progress_tx: tokio::sync::mpsc::Sender<(i32, Option<NewGameMetadata>)>,
) {
    futures::future::join_all(
        games
            .into_iter()
            .map(|game| {
                let provider = provider.clone();
                let progress_tx = progress_tx.clone();
                tokio::spawn(async move {
                    match match_game_igdb(provider, &game).await {
                        Some(metadata) => progress_tx
                            .send((metadata.game_id.unwrap(), Some(metadata)))
                            .await
                            .expect("Could not send progress"),
                        None => progress_tx
                            .send((game.id, None))
                            .await
                            .expect("Could not send progress"),
                    }
                })
            })
            .map(|future| future.instrument(tracing::info_span!("match_games")))
            .collect::<Vec<_>>(),
    )
    .await;
}

#[instrument(level = Level::DEBUG, skip(provider), fields(search_string))]
pub(crate) async fn search_games(
    provider: Arc<IGDBProvider>,
    search_string: &str,
) -> Result<igdb::GameResult, String> {
    let fields = vec![
        "name".to_string(),
        "cover.url".to_string(),
        "artworks.url".to_string(),
        "artworks.height".to_string(),
        "artworks.width".to_string(),
        "summary".to_string(),
        "websites.url".to_string(),
        "websites.trusted".to_string(),
        "videos.name".to_string(),
        "videos.video_id".to_string(),
    ]
    .join(",");

    let query = format!("fields {fields}; search \"{search_string}\"; limit 10;");

    let res = provider.make_request("games.pb".into(), query).await;

    let bytes = match res {
        Ok(res) => res.bytes().await.expect("Could not parse response"),
        Err(e) => return Err(e.to_string()),
    };

    let game = match igdb::GameResult::decode(bytes) {
        Ok(game) => game,
        Err(e) => {
            error!(
                "Could not decode response for query {search_string}: {:?}",
                e
            );
            return Err(e.to_string());
        }
    };

    Ok(game)
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

    let cover_url = igdb_match.cover.map(|cover| {
        cover
            .url
            .to_string()
            .replace("t_thumb", "t_cover_big")
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
                .replace("t_thumb", "t_1080p")
        })
        .or(igdb_match.artworks.first().map(|artwork| {
            artwork
                .url
                .to_string()
                .replace("//", "https://")
                .replace("t_thumb", "t_1080p")
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

    let links = igdb_match
        .websites
        .into_iter()
        .filter(|website| website.trusted)
        .map(|website| website.url)
        .collect();

    let artwork_urls: Vec<String> = igdb_match
        .artworks
        .into_iter()
        .map(|artwork| {
            artwork
                .url
                .replace("t_thumb", "t_1080p")
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
                .replace("t_thumb", "screenshot_huge")
        })
        .collect();

    let video_urls: Vec<String> = igdb_match
        .videos
        .into_iter()
        .map(|video| format!("https://www.youtube.com/embed/{}", video.video_id))
        .collect();

    retrom::NewGameMetadata {
        game_id: game.map(|game| game.id),
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
