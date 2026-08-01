use retrom_codegen::retrom::services::metadata::v1::{
    metadata_provider_service_server::MetadataProviderService, ListMetadataProvidersRequest,
    ListMetadataProvidersResponse, MetadataProvider, MetadataProviderRow,
};
use retrom_db::DbPool;
use sqlx::QueryBuilder;
use tonic::{Request, Response, Status};

pub mod router;

#[derive(Clone)]
pub struct MetadataProviderServiceHandlers {
    pub(crate) db_pool: DbPool,
}

fn metadata_provider_from_row(row: MetadataProviderRow) -> MetadataProvider {
    MetadataProvider {
        id: row.id,
        name: row.name,
        created_at: row.created_at,
        updated_at: row.updated_at,
    }
}

#[tonic::async_trait]
impl MetadataProviderService for MetadataProviderServiceHandlers {
    async fn list_metadata_providers(
        &self,
        _request: Request<ListMetadataProvidersRequest>,
    ) -> Result<Response<ListMetadataProvidersResponse>, Status> {
        let rows: Vec<MetadataProviderRow> = QueryBuilder::new("select * from metadata_providers")
            .build_query_as()
            .fetch_all(&self.db_pool)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        let providers = rows.into_iter().map(metadata_provider_from_row).collect();

        Ok(Response::new(ListMetadataProvidersResponse { providers }))
    }
}
