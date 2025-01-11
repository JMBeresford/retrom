use postgresql_embedded::{Settings, VersionReq};

pub use postgresql_embedded::PostgreSQL;

pub const DB_NAME: &str = "retrom";

#[tracing::instrument]
pub async fn start_embedded_db(url: &str) -> crate::Result<impl PgCtlFailsafeOperations> {
    let mut settings = Settings::from_url(url)?;
    settings.temporary = false;
    settings.version = VersionReq::parse("=17.2.0").expect("Could not parse version requirement");

    tracing::debug!("Starting embedded database: {:#?}", settings);

    let mut psql = PostgreSQL::new(settings);
    psql.setup().await?;

    if psql.status() == postgresql_embedded::Status::Started {
        tracing::warn!("Embedded database is already running, stopping it");
        psql.failsafe_stop().await?;
    };

    psql.failsafe_start().await?;

    if !psql.database_exists(DB_NAME).await? {
        psql.create_database(DB_NAME).await?;
    };

    if !psql.database_exists(DB_NAME).await? {
        return Err(crate::Error::NotExists);
    }

    Ok(psql)
}

// occasionally commands are not properly detected as 'finished'
// so, we just check the status manually and ignore the error
// in these cases
pub trait PgCtlFailsafeOperations {
    fn failsafe_start(&mut self) -> impl std::future::Future<Output = crate::Result<()>> + Send;
    fn failsafe_stop(&self) -> impl std::future::Future<Output = crate::Result<()>> + Send;
    fn status(&self) -> postgresql_embedded::Status;
    fn settings(&self) -> &Settings;
}

impl PgCtlFailsafeOperations for PostgreSQL {
    async fn failsafe_start(&mut self) -> crate::Result<()> {
        use postgresql_embedded::Error as EmbeddedError;

        if let Err(err) = self.start().await {
            match &err {
                EmbeddedError::DatabaseStartError(_) => {
                    if self.status() != postgresql_embedded::Status::Started {
                        return Err(crate::Error::EmbeddedError(err));
                    };
                }
                _ => {
                    return Err(crate::Error::EmbeddedError(err));
                }
            }
        }

        Ok(())
    }

    async fn failsafe_stop(&self) -> crate::Result<()> {
        use postgresql_embedded::Error as EmbeddedError;

        if let Err(err) = self.stop().await {
            match &err {
                EmbeddedError::DatabaseStopError(_) => {
                    if self.status() != postgresql_embedded::Status::Stopped {
                        return Err(crate::Error::EmbeddedError(err));
                    };
                }
                _ => {
                    return Err(crate::Error::EmbeddedError(err));
                }
            }
        }

        Ok(())
    }

    fn status(&self) -> postgresql_embedded::Status {
        self.status()
    }

    fn settings(&self) -> &Settings {
        self.settings()
    }
}
