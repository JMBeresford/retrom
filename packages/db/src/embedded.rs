use postgresql_embedded::{Settings, VersionReq};

pub use postgresql_embedded::PostgreSQL;

pub const DB_NAME: &str = "retrom";

#[tracing::instrument]
pub async fn start_embedded_db(url: &str) -> crate::Result<PostgreSQL> {
    let mut settings = Settings::from_url(url)?;
    settings.temporary = false;
    settings.version = VersionReq::parse("=17.2.0").expect("Could not parse version requirement");
    settings.timeout = Some(std::time::Duration::from_secs(30));

    tracing::debug!("Starting embedded database: {:#?}", settings);

    let mut psql = PostgreSQL::new(settings);
    psql.setup().await?;

    if psql.status() == postgresql_embedded::Status::Started {
        tracing::warn!("Embedded database is already running, stopping it");
        psql.stop().await?;
    };

    if let Err(err) = psql.start().await {
        use postgresql_embedded::Error as EmbeddedError;

        match &err {
            EmbeddedError::DatabaseStartError(_) => {
                // occasionally the start command is not properly detected as finished
                // so, we just check if the database is running and continue
                if psql.status() != postgresql_embedded::Status::Started {
                    return Err(crate::Error::EmbeddedError(err));
                };
            }
            _ => {
                return Err(crate::Error::EmbeddedError(err));
            }
        }
    }

    if !psql.database_exists(DB_NAME).await? {
        psql.create_database(DB_NAME).await?;
    };

    if !psql.database_exists(DB_NAME).await? {
        return Err(crate::Error::NotExists);
    }

    Ok(psql)
}
