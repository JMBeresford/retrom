use postgresql_embedded::{Settings, VersionReq};

pub use postgresql_embedded::PostgreSQL;

pub const DB_NAME: &str = "retrom";

#[tracing::instrument]
pub async fn start_embedded_db(url: &str) -> crate::Result<PostgreSQL> {
    let mut settings = Settings::from_url(url)?;
    settings.temporary = false;
    settings.version = VersionReq::parse("=17.2.0").expect("Could not parse version requirement");

    if !settings.data_dir.exists() {
        tokio::fs::create_dir_all(&settings.data_dir).await?;
    }

    tracing::debug!("Starting embedded database: {:#?}", settings);

    let mut psql = PostgreSQL::new(settings);

    if psql.status() == postgresql_embedded::Status::Started {
        tracing::info!(
            "Embedded database is possibly already running, or was not properly stopped. \
            Attempting to restart..."
        );

        psql.stop().await?;
    }

    if let Err(err) = psql.setup().await {
        use postgresql_embedded::Error as EmbeddedError;

        match &err {
            EmbeddedError::DatabaseInitializationError(_) => {
                let status = psql.status();

                tracing::warn!(
                    "Could not confirm embedded DB has initialized, current status: {:?}",
                    status
                );
            }
            _ => return Err(crate::Error::EmbeddedError(err)),
        }
    };

    psql.start().await?;

    if !psql.database_exists(DB_NAME).await? {
        psql.create_database(DB_NAME).await?;
    };

    if !psql.database_exists(DB_NAME).await? {
        return Err(crate::Error::NotExists);
    }

    Ok(psql)
}
