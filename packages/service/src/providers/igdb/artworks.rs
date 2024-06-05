use std::sync::Arc;

use prost::Message;
use retrom_codegen::igdb;

use super::provider::IGDBProvider;

pub(crate) async fn search_artworks(
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

    let query =
        format!("fields name, url, height, width; {search_string} limit 10; {filter_string}");

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
