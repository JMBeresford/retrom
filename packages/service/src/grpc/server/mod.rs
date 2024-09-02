use retrom_codegen::retrom::{
    server_service_server::ServerService, version::Pre, GetServerInfoRequest,
    GetServerInfoResponse, ServerInfo, Version,
};

const VERSION: &str = env!("CARGO_PKG_VERSION");

pub struct ServerServiceHandlers {}

impl ServerServiceHandlers {
    pub fn new() -> Self {
        Self {}
    }
}

fn parse_version() -> Option<Version> {
    let parts: Vec<&str> = VERSION.split('-').collect();

    let version: Vec<i32> = parts[0]
        .split('.')
        .map(|ver_str| ver_str.parse::<i32>().unwrap_or(0))
        .collect();

    let [major, minor, patch] = version.as_slice() else {
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
impl ServerService for ServerServiceHandlers {
    async fn get_server_info(
        &self,
        _request: tonic::Request<GetServerInfoRequest>,
    ) -> Result<tonic::Response<GetServerInfoResponse>, tonic::Status> {
        let version = parse_version();

        let server_info = Some(ServerInfo { version });

        Ok(tonic::Response::new(GetServerInfoResponse { server_info }))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_version() {
        let version = parse_version();

        assert!(version.is_some());
    }
}
