use config_manager::ServerConfigManager;
use retrom_codegen::retrom::services::config::v1::{
    config_service_server::ConfigService, version::Pre, GetServerConfigRequest,
    GetServerInfoRequest, ServerConfig, ServerInfo, UpdateServerConfigRequest, Version,
};
use std::sync::Arc;
use tracing::instrument;

mod config_manager;
pub mod router;

const VERSION: &str = env!("CARGO_PKG_VERSION");

pub struct ConfigServiceHandlers {
    config: Arc<ServerConfigManager>,
}

impl ConfigServiceHandlers {
    pub fn new(config_manager: ServerConfigManager) -> Self {
        Self {
            config: Arc::new(config_manager),
        }
    }
}

fn parse_version() -> Option<Version> {
    let parts: Vec<&str> = VERSION.split('-').collect();

    let version: Vec<i32> = parts[0]
        .split('.')
        .map(|ver_str| ver_str.parse::<i32>().unwrap_or(0))
        .collect();

    let [major, minor, patch] = version.as_slice() else {
        tracing::warn!("Could not parse version string: {VERSION}");
        return None;
    };

    let pre = parts.get(1).and_then(|pre_str| {
        let pre_parts: Vec<&str> = pre_str.split('.').collect();
        let pre_qualifier = match pre_parts.first().map(|qualifier| qualifier.to_string()) {
            Some(qualifier) => qualifier,
            None => return None,
        };

        let pre_version = pre_parts
            .get(1)
            .and_then(|ver_str| ver_str.parse::<i32>().ok())
            .unwrap_or(0);

        Some(Pre {
            name: pre_qualifier,
            number: pre_version,
        })
    });

    Some(Version {
        major: *major,
        minor: *minor,
        patch: *patch,
        pre,
    })
}

#[tonic::async_trait]
impl ConfigService for ConfigServiceHandlers {
    #[instrument(skip_all)]
    async fn get_server_info(
        &self,
        _request: tonic::Request<GetServerInfoRequest>,
    ) -> Result<tonic::Response<ServerInfo>, tonic::Status> {
        let version = parse_version();

        Ok(tonic::Response::new(ServerInfo { version }))
    }

    #[instrument(skip_all)]
    async fn get_server_config(
        &self,
        _request: tonic::Request<GetServerConfigRequest>,
    ) -> Result<tonic::Response<ServerConfig>, tonic::Status> {
        let config = self.config.get_config().await;

        Ok(tonic::Response::new(config))
    }

    #[instrument(skip_all)]
    async fn update_server_config(
        &self,
        request: tonic::Request<UpdateServerConfigRequest>,
    ) -> Result<tonic::Response<ServerConfig>, tonic::Status> {
        let new_config = request
            .into_inner()
            .config
            .ok_or_else(|| tonic::Status::invalid_argument("Missing config in request"))?;

        if let Err(why) = self.config.update_config(new_config.clone()).await {
            let msg = format!("Error updating config: {why}");
            tracing::error!(msg);
            return Err(tonic::Status::internal(msg));
        }

        Ok(tonic::Response::new(new_config))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_version() {
        let version = parse_version();

        assert!(version.is_some());

        let version = version.unwrap();
        assert!(version.major >= 0);
        assert!(version.minor >= 0);
        assert!(version.patch >= 0);
    }
}
