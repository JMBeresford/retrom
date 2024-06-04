use std::sync::Arc;

use generated::retrom::{
    game_service_client::GameServiceClient, GetGamesRequest, GetGamesResponse,
};
use tauri::{async_runtime::Mutex, State};
use tonic::transport::Channel;

#[tracing::instrument(level = "info")]
#[tauri::command]
pub async fn get_games(
    req: GetGamesRequest,
    games_client: State<'_, Arc<Mutex<GameServiceClient<Channel>>>>,
) -> Result<GetGamesResponse, String> {
    let request = tonic::Request::new(req);

    let games_client = games_client.inner().clone();
    let mut games_client = games_client.lock().await;

    match games_client.get_games(request).await {
        Ok(res) => Ok(res.into_inner()),
        Err(status) => Err(status.message().into()),
    }
}
