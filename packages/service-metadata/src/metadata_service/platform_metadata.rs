use retrom_codegen::retrom::services::metadata::v1::{PlatformMetadata, PlatformMetadataRow};
use retrom_db::RetromDB;
use sqlx::{Executor, QueryBuilder};
use tonic::Status;

pub fn platform_metadata_from_rows(row: PlatformMetadataRow) -> PlatformMetadata {
    unimplemented!()
}

pub fn rows_from_platform_metadata(metadata: PlatformMetadata) -> PlatformMetadataRow {
    unimplemented!()
}

pub async fn insert_platform_metadata(
    conn: impl Executor<'_, Database = RetromDB>,
    metadata: PlatformMetadataRow,
) -> Result<(), Status> {
    unimplemented!()
}
