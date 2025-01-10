use postgresql_embedded::{Settings, VersionReq};

pub use postgresql_embedded::PostgreSQL;

pub const DB_NAME: &str = "retrom";

#[tracing::instrument]
pub async fn start_embedded_db(url: &str) -> crate::Result<PostgreSQL> {
    let mut settings = Settings::from_url(url)?;
    settings.temporary = false;
    settings.version = VersionReq::parse("=17.2.0").expect("Could not parse version requirement");

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
            EmbeddedError::IoError(why) => {
                tracing::error!("IO error: {:#?}", why);
            }
            EmbeddedError::ArchiveError(why) => {
                tracing::error!("Archive error: {:#?}", why);
            }
            EmbeddedError::CommandError { stdout, stderr } => {
                tracing::error!("Command error stdout: {:#?}", stdout);
                tracing::error!("Command error stderr: {:#?}", stderr);
            }
            EmbeddedError::DatabaseStartError(why) => {
                tracing::error!("Database start error: {:#?}", why);
            }
            EmbeddedError::DatabaseInitializationError(why) => {
                tracing::error!("Database initialization error: {:#?}", why);
            }
            EmbeddedError::DatabaseStopError(why) => {
                tracing::error!("Database stop error: {:#?}", why);
            }
            _ => {
                tracing::error!("Unknown error: {:#?}", err);
            }
        }

        return Err(crate::Error::EmbeddedError(err));
    }

    if !psql.database_exists(DB_NAME).await? {
        psql.create_database(DB_NAME).await?;
    };

    if !psql.database_exists(DB_NAME).await? {
        return Err(crate::Error::NotExists);
    }

    Ok(psql)
}
