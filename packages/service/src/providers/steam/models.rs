use std::collections::HashMap;

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct GetOwnedGamesResponse {
    pub response: GetOwnedGamesData,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GetOwnedGamesData {
    pub game_count: i32,
    pub games: Vec<Game>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Game {
    pub appid: u32,
    pub name: String,
    pub playtime_forever: i32,
    pub rtime_last_played: i64,
    pub img_icon_url: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct AppDetailsData {
    pub success: bool,
    pub data: Option<AppDetails>,
}

pub type AppDetailsResponse = HashMap<String, AppDetailsData>;

#[derive(Serialize, Deserialize, Debug)]
pub struct AppDetails {
    pub name: Option<String>,
    pub steam_appid: Option<u32>,
    pub detailed_description: Option<String>,
    pub short_description: Option<String>,
    pub header_image: Option<String>,
    pub background: Option<String>,
    pub background_raw: Option<String>,
    pub capsule_image: Option<String>,
    pub capsule_imagev5: Option<String>,
    pub website: Option<String>,
    pub developers: Option<Vec<String>>,
    pub publishers: Option<Vec<String>>,
    pub platforms: Option<Platforms>,
    pub genres: Option<Vec<Genre>>,
    pub movies: Option<Vec<Movie>>,
    pub screenshots: Option<Vec<Screenshot>>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Platforms {
    pub windows: bool,
    pub mac: bool,
    pub linux: bool,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Genre {
    pub description: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Category {
    pub id: i32,
    pub description: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Screenshot {
    pub id: i32,
    pub path_thumbnail: String,
    pub path_full: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct MovieQualities {
    #[serde(rename = "480")]
    pub _480: Option<String>,
    pub max: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Movie {
    pub id: i32,
    pub name: String,
    pub thumbnail: String,
    pub webm: Option<MovieQualities>,
    pub mp4: Option<MovieQualities>,
    pub highlight: bool,
}
