use retrom_service_config::retrom_dirs;
pub use retrom_service_config::retrom_dirs::*;

#[deprecated(
    since = "0.1.0",
    note = "Use `retrom_service_config::retrom_dirs::RetromDirs` directly."
)]
pub type RetromDirs = retrom_dirs::RetromDirs;
