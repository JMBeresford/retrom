use retrom_service_config::config;
pub use retrom_service_config::config::*;

#[deprecated(
    since = "0.1.0",
    note = "Use `retrom_service_config::config::ServerConfigManager` directly, \
            or fetch configuration via the ConfigService gRPC API."
)]
pub type ServerConfigManager = config::ServerConfigManager;

#[deprecated(
    since = "0.1.0",
    note = "Use `retrom_service_config::config::RetromConfigError` directly."
)]
pub type RetromConfigError = config::RetromConfigError;
