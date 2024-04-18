use db::models::{
    game::NewGameBuilder, game_file::NewGameFileBuilder, platform::NewPlatformBuilder,
};
use sha256::try_digest;
use std::{fs::DirEntry, future::Future, path::Path};
use tokio::fs::canonicalize;
use tracing::{instrument, trace};

pub type Result<T> = std::result::Result<T, IndexerError>;

pub trait DirRepresented: Sized + Send {
    fn from_dir(dir: &Path) -> impl Future<Output = Result<Self>> + Send;
    fn from_dirs(dirs: Vec<DirEntry>) -> impl std::future::Future<Output = Result<Vec<Self>>> + Send
    where
        Self: 'static,
    {
        async move {
            let mut handles = vec![];

            for dir in dirs {
                let handle = tokio::spawn(async move {
                    match Self::from_dir(&dir.path()).await {
                        Ok(item) => Some(item),
                        Err(why) => {
                            trace!("Could not create platform from directory: {}", why);
                            None
                        }
                    }
                });

                handles.push(handle);
            }

            let mut ret: Vec<Self> = vec![];

            for handle in handles {
                if let Some(platform) = handle.await.unwrap() {
                    ret.push(platform);
                }
            }

            Ok(ret)
        }
    }
}

pub trait FileRepresented: Sized + Send {
    fn from_file(file: &Path) -> impl Future<Output = Result<Self>> + Send;
    fn from_files(
        dirs: Vec<DirEntry>,
    ) -> impl std::future::Future<Output = Result<Vec<Self>>> + Send
    where
        Self: 'static,
    {
        async move {
            let mut handles = vec![];

            for dir in dirs {
                let handle = tokio::spawn(async move {
                    match Self::from_file(&dir.path()).await {
                        Ok(item) => Some(item),
                        Err(why) => {
                            trace!("Could not create platform from directory: {}", why);
                            None
                        }
                    }
                });

                handles.push(handle);
            }

            let mut ret: Vec<Self> = vec![];

            for handle in handles {
                if let Some(platform) = handle.await.unwrap() {
                    ret.push(platform);
                }
            }

            Ok(ret)
        }
    }
}

#[derive(Debug, Clone)]
pub struct IndexerError {
    pub msg: String,
}

impl IndexerError {
    pub fn new(msg: String) -> Self {
        IndexerError { msg }
    }
}

impl std::fmt::Display for IndexerError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "Content directory error: {}", self.msg)
    }
}

impl DirRepresented for NewPlatformBuilder {
    #[instrument]
    async fn from_dir(dir: &Path) -> Result<NewPlatformBuilder> {
        if !dir.is_dir() {
            return Err(IndexerError::new(
                "Platform directory does not exist".into(),
            ));
        }

        trace!(
            "Creating new platform from directory: {:?}",
            canonicalize(dir)
                .await
                .expect("Could not canonicalize platform directory")
        );

        let name = match dir.file_name() {
            Some(name) => name.to_string_lossy().into_owned(),
            None => {
                return Err(IndexerError::new(
                    "Could not get platform directory name".into(),
                ))
            }
        };

        let path = canonicalize(dir)
            .await
            .expect("Could not canonicalize platform directory")
            .to_string_lossy()
            .into();

        let id = uuid::Uuid::now_v7();

        Ok(NewPlatformBuilder::default()
            .id(id)
            .name(name)
            .path(path)
            .to_owned())
    }
}

impl DirRepresented for NewGameBuilder {
    #[instrument]
    async fn from_dir(dir: &Path) -> Result<NewGameBuilder> {
        if !dir.is_dir() {
            return Err(IndexerError::new("Game directory does not exist".into()));
        }

        trace!(
            "Creating new game from directory: {:?}",
            canonicalize(dir)
                .await
                .expect("Could not canonicalize game directory")
        );

        let name = match dir.file_name() {
            Some(name) => name.to_string_lossy().into_owned(),
            None => {
                return Err(IndexerError::new(
                    "Could not get game directory name".into(),
                ))
            }
        };

        let path = canonicalize(dir)
            .await
            .expect("Could not canonicalize game directory")
            .to_string_lossy()
            .into();

        let id = uuid::Uuid::now_v7();

        Ok(NewGameBuilder::default()
            .id(id)
            .name(name)
            .path(path)
            .to_owned())
    }
}

impl FileRepresented for NewGameFileBuilder {
    #[instrument]
    async fn from_file(file: &std::path::Path) -> Result<NewGameFileBuilder> {
        let path = match canonicalize(file).await {
            Ok(path) => path,
            Err(why) => {
                return Err(IndexerError::new(format!(
                    "Could not get game file path: {}",
                    why
                )))
            }
        };

        trace!("Creating new game file from file: {:?}", path);

        let name = match file.file_name() {
            Some(name) => name.to_string_lossy().into_owned(),
            None => return Err(IndexerError::new("Could not get game file name".into())),
        };

        let byte_size = match file.metadata() {
            Ok(metadata) => metadata.len(),
            Err(why) => {
                return Err(IndexerError::new(format!(
                    "Could not get game file size: {}",
                    why
                )))
            }
        };

        let hash = match try_digest(file) {
            Ok(hash) => hash,
            Err(why) => {
                return Err(IndexerError::new(format!(
                    "Could not hash game file: {}",
                    why
                )))
            }
        };

        let id = uuid::Uuid::now_v7();

        Ok(NewGameFileBuilder::default()
            .id(id)
            .name(name)
            .byte_size(byte_size as i32)
            .hash(hash)
            .path(path.display().to_string())
            .to_owned())
    }
}
