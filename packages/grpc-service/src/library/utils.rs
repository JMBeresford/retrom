use std::sync::Arc;

use diesel_async::{pooled_connection::bb8::RunError, RunQueryDsl};
use retrom_codegen::retrom::{Platform, PlatformMetadata};
use retrom_db::{schema, Pool};

use crate::providers::igdb::provider::IGDBProvider;

#[derive(Debug, thiserror::Error)]
enum Error {
    #[error("Failed to get connection from pool: {0}")]
    PoolError(#[from] RunError),
    #[error("Failed to load data: {0}")]
    DieselError(#[from] diesel::result::Error),
}

type Result<T> = std::result::Result<T, Error>;

pub async fn download_platform_metadata(
    provider: Arc<IGDBProvider>,
    db_pool: Pool,
) -> Result<PlatformMetadata> {
    let mut conn = db_pool.get().await?;

    let platforms: Vec<Platform> = schema::platforms::table.load(&mut conn).await?;

    Ok(())
}
