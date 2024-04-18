use tracing::instrument;

#[instrument]
#[tokio::main]
async fn main() {
    service::start_service().await;
}
