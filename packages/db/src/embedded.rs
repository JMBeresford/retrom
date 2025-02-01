use postgresql_commands::{
    pg_ctl::{Mode, PgCtlBuilder},
    CommandBuilder,
};
use postgresql_embedded::{Settings, VersionReq};

pub use postgresql_embedded::PostgreSQL;

pub const DB_NAME: &str = "retrom";

#[tracing::instrument]
pub async fn start_embedded_db(url: &str) -> crate::Result<impl PgCtlFailsafeOperations> {
    let mut settings = Settings::from_url(url)?;
    settings.temporary = false;
    settings.version = VersionReq::parse("=17.2.0").expect("Could not parse version requirement");

    if !settings.data_dir.exists() {
        tokio::fs::create_dir_all(&settings.data_dir).await?;
    }

    tracing::debug!("Starting embedded database: {:#?}", settings);

    let mut psql = PostgreSQL::new(settings);
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
    fn maybe_prune_pid_file(&self) -> impl std::future::Future<Output = crate::Result<()>> + Send;
    fn settings(&self) -> &Settings;
}

impl PgCtlFailsafeOperations for PostgreSQL {
    async fn failsafe_start(&mut self) -> crate::Result<()> {
        use postgresql_embedded::Error as EmbeddedError;

        self.maybe_prune_pid_file().await?;
        if self.status() == postgresql_embedded::Status::Started {
            tracing::warn!("Embedded database is already running, stopping it");
            self.failsafe_stop().await?;
        };

        if let Err(err) = self.start().await {
            match &err {
                EmbeddedError::DatabaseStartError(_) | EmbeddedError::CommandError { .. } => {
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
                EmbeddedError::DatabaseStopError(_) | EmbeddedError::CommandError { .. } => {
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

    async fn maybe_prune_pid_file(&self) -> crate::Result<()> {
        let settings = self.settings();
        let pid_file = settings.data_dir.join("postmaster.pid");

        if pid_file.exists() {
            let mut pg_ctl_cmd = PgCtlBuilder::from(settings)
                .mode(Mode::Status)
                .pgdata(&settings.data_dir)
                .wait()
                .build_tokio();

            let pg_ctl_status = pg_ctl_cmd.status().await?;

            if pg_ctl_status.code() == Some(3) {
                tracing::warn!("Found stale PID file, was Retrom not terminated correctly? Removing file: {:?}", pid_file);
                tokio::fs::remove_file(pid_file).await?;
            }
        }

        Ok(())
    }

    fn settings(&self) -> &Settings {
        self.settings()
    }
}
