use retrom_codegen::retrom::services::config::v1::{
    config_service_server::ConfigService, GetServerConfigRequest as ConfigGetServerConfigRequest,
    GetServerInfoRequest as ConfigGetServerInfoRequest,
    UpdateServerConfigRequest as ConfigUpdateServerConfigRequest,
};
use retrom_codegen::retrom::{
    server_service_server::ServerService, GetServerConfigRequest, GetServerConfigResponse,
    GetServerInfoRequest, GetServerInfoResponse, UpdateServerConfigRequest,
    UpdateServerConfigResponse,
};
use retrom_service_config::ConfigServiceHandlers;
use std::sync::Arc;

/// Forwarding stub — all RPCs delegate to `retrom.services.config.v1.ConfigService`
/// equivalents in [`ConfigServiceHandlers`].
pub struct ServerServiceHandlers {
    pub config_handlers: Arc<ConfigServiceHandlers>,
}

impl ServerServiceHandlers {
    pub fn new(config_handlers: Arc<ConfigServiceHandlers>) -> Self {
        Self { config_handlers }
    }
}

#[tonic::async_trait]
impl ServerService for ServerServiceHandlers {
    async fn get_server_info(
        &self,
        _request: tonic::Request<GetServerInfoRequest>,
    ) -> Result<tonic::Response<GetServerInfoResponse>, tonic::Status> {
        let resp = self
            .config_handlers
            .get_server_info(tonic::Request::new(ConfigGetServerInfoRequest {}))
            .await?;
        let inner = resp.into_inner();
        Ok(tonic::Response::new(GetServerInfoResponse {
            server_info: inner.server_info,
        }))
    }

    async fn get_server_config(
        &self,
        _request: tonic::Request<GetServerConfigRequest>,
    ) -> Result<tonic::Response<GetServerConfigResponse>, tonic::Status> {
        let resp = self
            .config_handlers
            .get_server_config(tonic::Request::new(ConfigGetServerConfigRequest {}))
            .await?;
        let inner = resp.into_inner();
        Ok(tonic::Response::new(GetServerConfigResponse {
            config: inner.config,
        }))
    }

    async fn update_server_config(
        &self,
        request: tonic::Request<UpdateServerConfigRequest>,
    ) -> Result<tonic::Response<UpdateServerConfigResponse>, tonic::Status> {
        let config = request.into_inner().config;
        let resp = self
            .config_handlers
            .update_server_config(tonic::Request::new(ConfigUpdateServerConfigRequest {
                config,
            }))
            .await?;
        let inner = resp.into_inner();
        Ok(tonic::Response::new(UpdateServerConfigResponse {
            config_updated: inner.config_updated,
        }))
    }
}
