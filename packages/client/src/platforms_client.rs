use std::sync::Arc;

use retrom_codegen::retrom::{
    platform_service_client::PlatformServiceClient, GetPlatformsRequest, GetPlatformsResponse,
};
use tauri::{async_runtime::Mutex, State};
use tonic::transport::Channel;

#[tracing::instrument(level = "info")]
#[tauri::command]
pub async fn get_platforms(
    req: GetPlatformsRequest,
    games_client: State<'_, Arc<Mutex<PlatformServiceClient<Channel>>>>,
) -> Result<GetPlatformsResponse, String> {
    let request = tonic::Request::new(req);

    let games_client = games_client.inner().clone();
    let mut games_client = games_client.lock().await;

    match games_client.get_platforms(request).await {
        Ok(res) => Ok(res.into_inner()),
        Err(status) => Err(status.message().into()),
    }
}
