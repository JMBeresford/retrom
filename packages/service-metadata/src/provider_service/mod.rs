use retrom_codegen::retrom::services::metadata::v1::metadata_provider_service_server::MetadataProviderService;

pub mod router;

#[derive(Clone)]
pub struct MetadataProviderServiceHandlers {
    pub(crate) db_pool: Arc<Pool>,
}

#[tonic::async_trait]
impl MetadataProviderService for MetadataProviderServiceHandlers {
    async fn get_metadata_providers(
        &self,
        _request: Request<GetMetadataProvidersRequest>,
    ) -> Result<Response<GetMetadataProvidersResponse>, Status> {
        let mut conn = self
            .db_pool
            .get()
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        let providers = schema::metadata_providers::table
            .load::<MetadataProviderModel>(&mut conn)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        Ok(Response::new(GetMetadataProvidersResponse { providers }))
    }
}
