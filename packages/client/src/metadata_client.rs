use std::sync::Arc;

use generated::retrom::{
    metadata_service_client::MetadataServiceClient, GetGameMetadataRequest,
    GetGameMetadataResponse, GetIgdbGameSearchResultsRequest, GetIgdbGameSearchResultsResponse,
    GetIgdbPlatformSearchResultsRequest, GetIgdbPlatformSearchResultsResponse,
    GetIgdbSearchRequest, GetIgdbSearchResponse, GetPlatformMetadataRequest,
    GetPlatformMetadataResponse, UpdateGameMetadataRequest, UpdateGameMetadataResponse,
    UpdatePlatformMetadataRequest, UpdatePlatformMetadataResponse,
};
use tauri::{async_runtime::Mutex, State};
use tonic::transport::Channel;

#[tracing::instrument(level = "info")]
#[tauri::command]
pub async fn get_game_metadata(
    req: GetGameMetadataRequest,
    metadata_client: State<'_, Arc<Mutex<MetadataServiceClient<Channel>>>>,
) -> Result<GetGameMetadataResponse, String> {
    let request = tonic::Request::new(req);

    let metadata_client = metadata_client.inner().clone();
    let mut metadata_client = metadata_client.lock().await;

    match metadata_client.get_game_metadata(request).await {
        Ok(res) => Ok(res.into_inner()),
        Err(status) => Err(status.message().into()),
    }
}

#[tracing::instrument(level = "info")]
#[tauri::command]
pub async fn update_game_metadata(
    req: UpdateGameMetadataRequest,
    metadata_client: State<'_, Arc<Mutex<MetadataServiceClient<Channel>>>>,
) -> Result<UpdateGameMetadataResponse, String> {
    let request = tonic::Request::new(req);

    let metadata_client = metadata_client.inner().clone();
    let mut metadata_client = metadata_client.lock().await;

    match metadata_client.update_game_metadata(request).await {
        Ok(res) => Ok(res.into_inner()),
        Err(status) => Err(status.message().into()),
    }
}

#[tracing::instrument(level = "info")]
#[tauri::command]
pub async fn get_platform_metadata(
    req: GetPlatformMetadataRequest,
    metadata_client: State<'_, Arc<Mutex<MetadataServiceClient<Channel>>>>,
) -> Result<GetPlatformMetadataResponse, String> {
    let request = tonic::Request::new(req);

    let metadata_client = metadata_client.inner().clone();
    let mut metadata_client = metadata_client.lock().await;

    match metadata_client.get_platform_metadata(request).await {
        Ok(res) => Ok(res.into_inner()),
        Err(status) => Err(status.message().into()),
    }
}

#[tracing::instrument(level = "info")]
#[tauri::command]
pub async fn update_platform_metadata(
    req: UpdatePlatformMetadataRequest,
    metadata_client: State<'_, Arc<Mutex<MetadataServiceClient<Channel>>>>,
) -> Result<UpdatePlatformMetadataResponse, String> {
    let request = tonic::Request::new(req);

    let metadata_client = metadata_client.inner().clone();
    let mut metadata_client = metadata_client.lock().await;

    match metadata_client.update_platform_metadata(request).await {
        Ok(res) => Ok(res.into_inner()),
        Err(status) => Err(status.message().into()),
    }
}

#[tracing::instrument(level = "info")]
#[tauri::command]
pub async fn get_igdb_search(
    req: GetIgdbSearchRequest,
    metadata_client: State<'_, Arc<Mutex<MetadataServiceClient<Channel>>>>,
) -> Result<GetIgdbSearchResponse, String> {
    let request = tonic::Request::new(req);

    let metadata_client = metadata_client.inner().clone();
    let mut metadata_client = metadata_client.lock().await;

    match metadata_client.get_igdb_search(request).await {
        Ok(res) => Ok(res.into_inner()),
        Err(status) => Err(status.message().into()),
    }
}

#[tracing::instrument(level = "info")]
#[tauri::command]
pub async fn get_igdb_game_search_results(
    req: GetIgdbGameSearchResultsRequest,
    metadata_client: State<'_, Arc<Mutex<MetadataServiceClient<Channel>>>>,
) -> Result<GetIgdbGameSearchResultsResponse, String> {
    let request = tonic::Request::new(req);

    let metadata_client = metadata_client.inner().clone();
    let mut metadata_client = metadata_client.lock().await;

    match metadata_client.get_igdb_game_search_results(request).await {
        Ok(res) => Ok(res.into_inner()),
        Err(status) => Err(status.message().into()),
    }
}

#[tracing::instrument(level = "info")]
#[tauri::command]
pub async fn get_igdb_platform_search_results(
    req: GetIgdbPlatformSearchResultsRequest,
    metadata_client: State<'_, Arc<Mutex<MetadataServiceClient<Channel>>>>,
) -> Result<GetIgdbPlatformSearchResultsResponse, String> {
    let request = tonic::Request::new(req);

    let metadata_client = metadata_client.inner().clone();
    let mut metadata_client = metadata_client.lock().await;

    match metadata_client
        .get_igdb_platform_search_results(request)
        .await
    {
        Ok(res) => Ok(res.into_inner()),
        Err(status) => Err(status.message().into()),
    }
}
