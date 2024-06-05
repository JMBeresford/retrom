use diesel_async::{scoped_futures::ScopedFutureExt, AsyncConnection, RunQueryDsl};
use retrom_codegen::retrom::{DeleteLibraryRequest, DeleteLibraryResponse};
use retrom_db::DBConnection;
use tonic::Status;
use tracing::error;

use super::LibraryServiceHandlers;

pub async fn delete_library(
    state: &LibraryServiceHandlers,
    _request: DeleteLibraryRequest,
) -> Result<DeleteLibraryResponse, Status> {
    let mut conn = match state.db_pool.get().await {
        Ok(conn) => conn,
        Err(why) => return Err(Status::internal(why.to_string())),
    };

    match conn
        .transaction(|conn| async move { do_delete(conn).await }.scope_boxed())
        .await
    {
        Ok(_) => Ok(DeleteLibraryResponse {}),
        Err(why) => {
            error!("Failed to delete library: {}", why);
            Err(Status::internal(why.to_string()))
        }
    }
}

async fn do_delete(conn: &mut DBConnection<'_>) -> Result<(), diesel::result::Error> {
    if let Err(e) = diesel::delete(retrom_db::schema::platforms::table)
        .execute(conn)
        .await
    {
        return Err(e);
    }

    Ok(())
}
