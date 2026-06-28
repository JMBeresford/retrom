use crate::svc_definitions::CONFIG_SVC_PORT;
use retrom_codegen::retrom::services::config::v1::config_service_client::ConfigServiceClient;
use tonic::transport::Channel;

pub fn get_config_svc_client(port: Option<u16>) -> ConfigServiceClient<Channel> {
    let config_svc_port = port.unwrap_or_else(|| {
        std::env::var("RETROM_CONFIG_SERVICE_PORT")
            .ok()
            .and_then(|p| p.parse::<u16>().ok())
            .unwrap_or(CONFIG_SVC_PORT)
    });

    let config_svc_host = format!("http://localhost:{config_svc_port}");

    let config_svc_transport = Channel::from_shared(config_svc_host.clone())
        .unwrap_or_else(|_| {
            panic!("Failed to create ConfigServiceClient with host {config_svc_host}")
        })
        .connect_lazy();

    ConfigServiceClient::new(config_svc_transport)
}

#[cfg(test)]
mod mock {
    use retrom_codegen::retrom::services::config::v1::config_service_client::ConfigServiceClient;
    use retrom_codegen::retrom::services::config::v1::config_service_server::{
        ConfigService, ConfigServiceServer,
    };
    use retrom_codegen::retrom::services::config::v1::{
        GetServerConfigRequest, GetServerConfigResponse, GetServerInfoRequest,
        GetServerInfoResponse, ServerConfig, UpdateServerConfigRequest, UpdateServerConfigResponse,
    };
    use tonic::Response;

    pub struct MockConfigGrpcService {
        pub config: ServerConfig,
    }

    #[tonic::async_trait]
    impl ConfigService for MockConfigGrpcService {
        async fn get_server_info(
            &self,
            _request: tonic::Request<GetServerInfoRequest>,
        ) -> Result<Response<GetServerInfoResponse>, tonic::Status> {
            unimplemented!("MockConfigGrpcService does not implement get_server_info")
        }

        async fn get_server_config(
            &self,
            _request: tonic::Request<GetServerConfigRequest>,
        ) -> Result<Response<GetServerConfigResponse>, tonic::Status> {
            Ok(GetServerConfigResponse {
                config: Some(self.config.clone()),
            }
            .into())
        }

        async fn update_server_config(
            &self,
            _request: tonic::Request<UpdateServerConfigRequest>,
        ) -> Result<Response<UpdateServerConfigResponse>, tonic::Status> {
            unimplemented!("MockConfigGrpcService does not implement update_server_config")
        }
    }

    pub fn get_mock_config_svc_client(
        config: Option<ServerConfig>,
    ) -> ConfigServiceClient<ConfigServiceServer<MockConfigGrpcService>> {
        ConfigServiceClient::new(ConfigServiceServer::new(MockConfigGrpcService {
            config: config.unwrap_or_default(),
        }))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use retrom_codegen::retrom::services::config::v1::{
        server_config::TelemetryConfig, ConnectionConfig, GetServerConfigRequest, ServerConfig,
    };

    #[tokio::test]
    async fn test_mock_config_svc_client() {
        let mut client = mock::get_mock_config_svc_client(None);

        let request = tonic::Request::new(GetServerConfigRequest {});

        let response = client
            .get_server_config(request)
            .await
            .expect("Failed to get server config");

        assert!(response.into_inner().config.is_some());
    }

    #[tokio::test]
    async fn test_mock_config_svc_client_with_custom_config() {
        let mut client = mock::get_mock_config_svc_client(Some(ServerConfig {
            connection: Some(ConnectionConfig {
                port: Some(9000),
                ..Default::default()
            }),
            telemetry: Some(TelemetryConfig { enabled: true }),
            ..Default::default()
        }));

        let request = tonic::Request::new(GetServerConfigRequest {});

        let response = client
            .get_server_config(request)
            .await
            .expect("Failed to get server config");

        let returned_config = response.into_inner().config.expect("No config returned");

        assert!(matches!(
            returned_config.telemetry,
            Some(TelemetryConfig { enabled: true })
        ));

        assert!(matches!(
            returned_config.connection,
            Some(ConnectionConfig {
                port: Some(9000),
                ..
            })
        ));
    }
}
