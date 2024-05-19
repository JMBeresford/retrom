use tracing::instrument;

#[instrument]
#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    service::start_service()
        .await
        .expect("Could not start service");
}
