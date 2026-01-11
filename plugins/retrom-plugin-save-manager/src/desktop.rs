use crate::{
    error::{Result, SaveManagerError},
    snapshot::{Snapshot, SNAPSHOT_FILE_NAME},
};
use futures_util::{future::join_all, StreamExt};
use headers::HeaderMapExt;
use http::StatusCode;
use retrom_codegen::retrom::{
    client::saves::{ConflictReport, SaveSyncStatus, SyncEmulatorSavesResponse},
    files::FileStat,
    services::saves::v2::{backup_save_files_request, BackupSaveFilesRequest},
    Client, FilesystemNodeType, GetLocalEmulatorConfigsRequest, LocalEmulatorConfig,
};
use retrom_plugin_config::ConfigExt;
use retrom_plugin_service_client::RetromPluginServiceClientExt;
use retrom_plugin_webdav_client::{
    LockOptions, MkcolOptions, PropFindOptions, PutOptions, UnlockOptions, WebdavClientExt,
};
use serde::de::DeserializeOwned;
use std::{
    cmp::Ordering,
    collections::HashSet,
    fmt::Debug,
    path::{Path, PathBuf},
    str::FromStr,
    time::SystemTime,
};
use tauri::{plugin::PluginApi, AppHandle, Runtime};
use tokio::{
    io::{AsyncWriteExt, BufReader},
    sync::RwLock,
};
use tracing::instrument;
use webdav_meta::{
    headers::{self as dav_headers, Depth, If, Timeout},
    xml::{
        elements::{LockInfo, LockScope, LockType, Multistatus, Properties, Propfind},
        properties::{CreationDate, ETag, LastModified, ResourceType},
        FromXml,
    },
};

pub fn init<R: Runtime, C: DeserializeOwned>(
    app: &AppHandle<R>,
    _api: PluginApi<R, C>,
) -> Result<SaveManager<R>> {
    Ok(SaveManager::new(app.clone()))
}

/// Access to the save-manager APIs.
pub struct SaveManager<R: Runtime> {
    app_handle: AppHandle<R>,
    active_syncs: RwLock<HashSet<i32>>,
}

impl<R: Runtime> SaveManager<R> {
    pub fn new(app_handle: AppHandle<R>) -> Self {
        Self {
            app_handle,
            active_syncs: RwLock::new(HashSet::new()),
        }
    }

    #[instrument(skip(self))]
    async fn get_local_emulator_config(
        &self,
        emulator_id: i32,
    ) -> Result<Option<LocalEmulatorConfig>> {
        let config = self.app_handle.config_manager().get_config().await.config;

        let Some(Client { id, .. }) = config.and_then(|c| c.client_info) else {
            return Err(SaveManagerError::Internal(
                "Client info is not set in the configuration".into(),
            ));
        };

        let mut emulator_client = self.app_handle.get_emulator_client().await;

        let response = emulator_client
            .get_local_emulator_configs(GetLocalEmulatorConfigsRequest {
                emulator_ids: vec![emulator_id],
                client_id: id,
            })
            .await?
            .into_inner();

        Ok(response
            .configs
            .into_iter()
            .find(|c| c.emulator_id == emulator_id))
    }

    #[instrument(skip(self))]
    async fn get_local_save_dir(&self, emulator_id: i32) -> Result<Option<PathBuf>> {
        let local_config = self.get_local_emulator_config(emulator_id).await?;
        let local_save_dir = local_config.and_then(|c| c.save_data_path.map(PathBuf::from));

        Ok(local_save_dir)
    }

    #[instrument(skip(self))]
    async fn write_snapshot_file(&self, emulator_id: i32, snapshot: &Snapshot) -> Result<()> {
        let Some(local_save_dir) = self.get_local_save_dir(emulator_id).await? else {
            return Err(SaveManagerError::Internal(
                "Local save directory not found for emulator".into(),
            ));
        };

        let snapshot_file_path = local_save_dir.join(SNAPSHOT_FILE_NAME);
        let bytes = serde_json::to_vec_pretty(snapshot)?;
        let file = tokio::fs::File::create(snapshot_file_path).await?;
        let mut writer = tokio::io::BufWriter::new(file);

        writer.write_all(&bytes).await?;
        writer.flush().await?;

        Ok(())
    }

    #[instrument(skip(self))]
    async fn read_snapshot_file(&self, emulator_id: i32) -> Result<Option<Snapshot>> {
        let Some(local_save_dir) = self.get_local_save_dir(emulator_id).await? else {
            return Err(SaveManagerError::Internal(
                "Local save directory not found for emulator".into(),
            ));
        };

        let snapshot_file_path = local_save_dir.join(SNAPSHOT_FILE_NAME);
        if !snapshot_file_path.exists() {
            return Ok(None);
        }

        let bytes = tokio::fs::read(snapshot_file_path).await?;
        let snapshot_file: Snapshot = serde_json::from_slice(&bytes)?;

        Ok(Some(snapshot_file))
    }

    #[instrument(skip(self))]
    async fn acquire_lock_for_resource(
        &self,
        resource: impl AsRef<Path> + Debug,
        opts: LockOptions,
    ) -> Result<dav_headers::LockToken> {
        tracing::debug!(
            "Acquiring lock for resource: {:?} with options: {:?}",
            resource,
            opts
        );

        let webdav_client = self.app_handle.webdav_client();
        let lock_response = webdav_client.lock(resource.as_ref(), Some(opts)).await?;

        let Some(lock_token) = lock_response
            .headers()
            .typed_get::<dav_headers::LockToken>()
        else {
            return Err(SaveManagerError::Internal(
                "Lock token not found in WebDAV lock response".into(),
            ));
        };

        tracing::debug!(
            "Acquired lock for resource: {:?} with lock token: {:?}",
            resource,
            lock_token
        );

        Ok(lock_token)
    }

    #[instrument(skip(self))]
    async fn download_file(
        &self,
        remote_path: impl AsRef<Path> + Debug,
        local_path: impl AsRef<Path> + Debug,
        remote_file_stat: FileStat,
    ) -> Result<()> {
        let local_path = local_path.as_ref();
        let remote_path = remote_path.as_ref();

        tracing::debug!(
            "Downloading file from remote path: {:?} to local path: {:?}",
            remote_path,
            local_path
        );

        if remote_file_stat.node_type() == FilesystemNodeType::Directory && !local_path.exists() {
            tokio::fs::create_dir_all(&local_path).await?;
            return Ok(());
        }

        if let Some(parent) = local_path.parent() {
            if !parent.exists() {
                tokio::fs::create_dir_all(parent).await?;
            }
        }

        let webdav_client = self.app_handle.webdav_client();
        let mut stream = webdav_client.get(remote_path).await?.bytes_stream();
        let file = tokio::fs::File::create(&local_path).await?;
        let mut writer = tokio::io::BufWriter::new(file);

        while let Some(chunk) = stream.next().await {
            writer.write_all(&chunk?).await?;
        }

        writer.flush().await?;

        tracing::debug!(
            "Finished downloading file from remote path: {:?} to local path: {:?}",
            remote_path,
            local_path
        );

        Ok(())
    }

    #[instrument(skip(self))]
    async fn upload_file(
        &self,
        remote_path: impl AsRef<Path> + Debug,
        local_path: impl AsRef<Path> + Debug,
        lock_token: dav_headers::If,
    ) -> Result<()> {
        let local_path = local_path.as_ref();
        let remote_path = remote_path.as_ref();
        let mut headers = http::HeaderMap::new();
        headers.typed_insert(lock_token);

        let webdav_client = self.app_handle.webdav_client();
        let file = tokio::fs::File::open(&local_path).await?;
        let file_size = file.metadata().await.ok().map(|m| m.len());
        if let Some(size) = file_size {
            headers.typed_insert(headers::ContentLength(size));
        }

        let reader = BufReader::new(file);
        let stream = tokio_util::io::ReaderStream::new(reader);

        let body = reqwest::Body::wrap_stream(stream);
        webdav_client
            .put(
                body,
                remote_path,
                Some(PutOptions {
                    headers: Some(headers),
                }),
            )
            .await?
            .error_for_status()?;

        Ok(())
    }

    #[instrument(skip(self))]
    async fn update_local_file_metadata(
        &self,
        local_path: impl AsRef<Path> + Debug,
        remote_file_stat: &FileStat,
    ) -> Result<()> {
        let local_path = local_path.as_ref().to_path_buf();

        tracing::debug!("Updating local file metadata for path: {:?}", local_path);

        let Some(updated_at) = remote_file_stat
            .updated_at
            .and_then(|t| SystemTime::try_from(t).ok())
        else {
            return Err(SaveManagerError::Internal(
                "Remote file stat missing updated_at timestamp".into(),
            ));
        };

        match tokio::task::spawn_blocking(move || {
            Result::Ok(fs_set_times::set_mtime(local_path, updated_at.into())?)
        })
        .await
        {
            Ok(Ok(())) => Ok(()),
            Ok(Err(e)) => return Err(e),
            Err(e) => {
                return Err(SaveManagerError::Internal(format!(
                    "Failed to set file metadata: {}",
                    e
                )))
            }
        }
    }

    #[instrument(skip(self))]
    pub async fn download_cloud_save_files(&self, emulator_id: i32) -> Result<()> {
        if self.active_syncs.read().await.contains(&emulator_id) {
            return Err(SaveManagerError::Internal(
                "A sync is already in progress for this emulator".into(),
            ));
        }

        let Some(local_save_dir) = self.get_local_save_dir(emulator_id).await? else {
            return Err(SaveManagerError::Internal(
                "Local save directory not found for emulator".into(),
            ));
        };

        let Some(cloud_snapshot) = self.get_cloud_snapshot(emulator_id).await? else {
            return Err(SaveManagerError::NoCloudSave(emulator_id));
        };

        self.active_syncs.write().await.insert(emulator_id);

        if local_save_dir.exists() {
            tokio::fs::remove_dir_all(&local_save_dir).await?;
        }

        let download_jobs = cloud_snapshot
            .clone()
            .into_files()
            .into_iter()
            .map(|file_stat| {
                let mut remote_path = PathBuf::from("saves");
                remote_path.push(emulator_id.to_string());
                remote_path.push(&file_stat.path);

                let local_path = local_save_dir.join(&file_stat.path);

                async { self.download_file(remote_path, local_path, file_stat).await }
            })
            .collect::<Vec<_>>();

        let res = join_all(download_jobs)
            .await
            .into_iter()
            .collect::<Vec<_>>();

        // Write snapshot file *before* updating metadata, else the write
        // will modify the root directory's metadata.
        self.write_snapshot_file(emulator_id, &cloud_snapshot)
            .await?;

        let all_files = cloud_snapshot.files().clone();

        let metadata_update_jobs = all_files
            .into_iter()
            .map(|file_stat| {
                let local_path = local_save_dir.join(&file_stat.path);
                async move {
                    self.update_local_file_metadata(local_path, &file_stat)
                        .await
                }
            })
            .collect::<Vec<_>>();

        let metadata_res = join_all(metadata_update_jobs)
            .await
            .into_iter()
            .collect::<Vec<_>>();

        self.active_syncs.write().await.remove(&emulator_id);

        if let Some(Err(e)) = res.into_iter().find(|r| r.is_err()) {
            tracing::error!("Error during download jobs: {:?}", e);
            return Err(e);
        }

        if let Some(Err(e)) = metadata_res.into_iter().find(|r| r.is_err()) {
            tracing::error!("Error during metadata update jobs: {:?}", e);
            return Err(e);
        }

        tracing::info!(
            "Successfully downloaded cloud save files for emulator {}",
            emulator_id
        );

        Ok(())
    }

    #[instrument(skip(self))]
    async fn get_cloud_snapshot(&self, emulator_id: i32) -> Result<Option<Snapshot>> {
        let webdav_client = self.app_handle.webdav_client();

        let properties = Properties::new()
            .with_name::<ETag>()
            .with_name::<ResourceType>()
            .with_name::<CreationDate>()
            .with_name::<LastModified>();

        let remote_save_dir = PathBuf::from("saves").join(emulator_id.to_string());
        let response = webdav_client
            .propfind(
                &remote_save_dir,
                PropFindOptions {
                    depth: Depth::Infinity,
                    prop_find: Propfind::Prop(properties),
                },
            )
            .await?;

        if response.status() == StatusCode::NOT_FOUND {
            return Ok(None);
        }

        let bytes = response.bytes().await?;
        let multistatus = Multistatus::from_xml(bytes)?;
        let remote_base = PathBuf::from("/dav").join(&remote_save_dir);
        let snapshot = Snapshot::try_from_multistatus(&remote_base, multistatus);

        Ok(snapshot)
    }

    #[instrument(skip(self))]
    pub async fn check_save_sync_status(
        &self,
        emulator_id: i32,
    ) -> Result<SyncEmulatorSavesResponse> {
        if self.active_syncs.read().await.contains(&emulator_id) {
            return Ok(SyncEmulatorSavesResponse {
                status: SaveSyncStatus::Syncing.into(),
                emulator_id,
                conflict_report: None,
            });
        }

        let Some(local_save_dir) = self.get_local_save_dir(emulator_id).await? else {
            return Ok(SyncEmulatorSavesResponse {
                status: SaveSyncStatus::Untracked.into(),
                emulator_id,
                conflict_report: None,
            });
        };

        let cloud_snapshot = self.get_cloud_snapshot(emulator_id).await?;
        let cached_snapshot = self.read_snapshot_file(emulator_id).await?;
        let current_snapshot = Snapshot::from_root(&local_save_dir);

        tracing::debug!(
            "Current snapshot for emulator {}: {:?}",
            emulator_id,
            current_snapshot
        );

        tracing::debug!(
            "Cached snapshot for emulator {}: {:?}",
            emulator_id,
            cached_snapshot
        );

        tracing::debug!(
            "Cloud snapshot for emulator {}: {:?}",
            emulator_id,
            cloud_snapshot
        );

        let current_vs_cached = current_snapshot.partial_cmp(&cached_snapshot);
        let cloud_vs_cached = cloud_snapshot.partial_cmp(&cached_snapshot);

        let status = match (current_vs_cached, cloud_vs_cached) {
            // Conflict between current save data and cached snapshot, or
            // conflict between cloud save data and cached snapshot.
            (None, _) | (_, None) => SaveSyncStatus::LocalError,
            // Current state is *behind* cached state, or cloud state is *behind* cached state,
            // both of which should not be possible.
            (Some(Ordering::Less), _) | (_, Some(Ordering::Less)) => SaveSyncStatus::LocalError,
            // Both current is newer than cached, and cloud is newer than cached. This indicates
            // a conflict between local and cloud saves. Likely the local save was modified
            // outside of the save manager since the last sync.
            (Some(Ordering::Greater), Some(Ordering::Greater)) => SaveSyncStatus::LocalError,

            (Some(Ordering::Greater), Some(Ordering::Equal)) => SaveSyncStatus::LocalNewer,
            (Some(Ordering::Equal), Some(Ordering::Greater)) => SaveSyncStatus::CloudNewer,
            (Some(Ordering::Equal), Some(Ordering::Equal)) => SaveSyncStatus::InSync,
        };

        let cloud_last_modified = cloud_snapshot
            .as_ref()
            .and_then(|cloud| cloud.files().iter().max_by_key(|f| f.updated_at))
            .and_then(|f| f.updated_at);

        let local_last_modified = current_snapshot
            .as_ref()
            .and_then(|current| current.files().iter().max_by_key(|f| f.updated_at))
            .and_then(|f| f.updated_at);

        let conflict_report = Some(ConflictReport {
            cloud_last_modified,
            local_last_modified,
        });

        Ok(SyncEmulatorSavesResponse {
            status: status.into(),
            emulator_id,
            conflict_report,
        })
    }

    #[instrument(skip(self))]
    pub async fn upload_local_save_files(&self, emulator_id: i32) -> Result<()> {
        if self.active_syncs.read().await.contains(&emulator_id) {
            return Err(SaveManagerError::Internal(
                "A download is already in progress for this emulator".into(),
            ));
        }

        let Some(local_save_dir) = self.get_local_save_dir(emulator_id).await? else {
            return Err(SaveManagerError::Internal(
                "Local save directory not found for emulator".into(),
            ));
        };

        let Some(snapshot) = Snapshot::from_root(&local_save_dir) else {
            return Err(SaveManagerError::Internal(
                "Failed to create snapshot from local save directory".into(),
            ));
        };

        let remote_save_dir = PathBuf::from("/saves").join(emulator_id.to_string());
        let webdav_client = self.app_handle.webdav_client();
        let mut saves_client = self.app_handle.get_emulator_saves_client().await;

        self.active_syncs.write().await.insert(emulator_id);

        saves_client
            .backup_save_files(BackupSaveFilesRequest {
                save_files_selectors: vec![backup_save_files_request::Selector { emulator_id }],
                ..Default::default()
            })
            .await?;

        // Clear out the remote save directory before uploading new files.
        if let Err(err) = webdav_client
            .delete(&remote_save_dir, None)
            .await?
            .error_for_status()
        {
            match err.status() {
                Some(StatusCode::NOT_FOUND) => {}
                _ => {
                    return Err(err)?;
                }
            };
        };

        // Re-create the remote save directory, then immediately lock it for the upload.
        webdav_client.mkcol(&remote_save_dir, None).await?;

        let lock_token = self
            .acquire_lock_for_resource(
                &remote_save_dir,
                LockOptions {
                    depth: Depth::Infinity,
                    // This lock is for the upload of all files.
                    // 1 minute should be sufficient for most uploads,
                    // but the lock will be refreshed after each file upload
                    // and immediatly released after all uploads complete.
                    timeout: Timeout::Seconds(300),
                    lock_info: Some(LockInfo {
                        lock_scope: LockScope::Exclusive,
                        lock_type: LockType::Write(Default::default()),
                        owner: None,
                    }),
                },
            )
            .await?;

        let if_header_str = format!("({})", &lock_token.0.to_string());

        // Must create directories first, in order from shallowest to deepest
        // as a PUT or MKCOL call will fail if the parent directory does not exist.
        // Order matters here, so we make these calls sequentially based on depth.
        let mut directories = snapshot
            .files()
            .iter()
            .filter_map(|f| {
                if f.node_type() == FilesystemNodeType::Directory {
                    Some(PathBuf::from(&f.path))
                } else {
                    None
                }
            })
            .collect::<Vec<_>>();

        directories.sort_by_key(|a| a.components().count());

        for dir in directories {
            let if_header = If::from_str(&if_header_str)?;
            let mut headers = http::HeaderMap::new();
            headers.typed_insert(if_header);

            let remote_path = remote_save_dir.join(dir);

            match webdav_client
                .mkcol(
                    remote_path,
                    Some(MkcolOptions {
                        headers: Some(headers),
                    }),
                )
                .await?
                .error_for_status()
            {
                Ok(_) => {}
                Err(e) => match e.status() {
                    // 405 indicates the directory already exists, which is fine.
                    Some(StatusCode::METHOD_NOT_ALLOWED) => {}
                    _ => return Err(e)?,
                },
            };
        }

        let files = snapshot
            .files()
            .iter()
            .filter_map(|f| {
                if f.node_type() == FilesystemNodeType::File {
                    Some(PathBuf::from(&f.path))
                } else {
                    None
                }
            })
            .collect::<Vec<_>>();

        let upload_jobs = files
            .into_iter()
            .filter_map(|path| {
                let local_path = local_save_dir.join(&path);
                let remote_path = remote_save_dir.join(path);
                let if_header = If::from_str(&if_header_str).ok()?;

                Some(async move { self.upload_file(remote_path, local_path, if_header).await })
            })
            .collect::<Vec<_>>();

        let res = join_all(upload_jobs).await.into_iter().collect::<Vec<_>>();

        let Some(new_cloud_snapshot) = self.get_cloud_snapshot(emulator_id).await? else {
            return Err(SaveManagerError::Internal(
                "Failed to retrieve cloud snapshot after upload".into(),
            ));
        };

        self.write_snapshot_file(emulator_id, &new_cloud_snapshot)
            .await?;

        let metadata_update_jobs = new_cloud_snapshot
            .files()
            .iter()
            .map(|file_stat| {
                let local_path = local_save_dir.join(&file_stat.path);
                async move { self.update_local_file_metadata(local_path, file_stat).await }
            })
            .collect::<Vec<_>>();

        let metadata_res = join_all(metadata_update_jobs)
            .await
            .into_iter()
            .collect::<Vec<_>>();

        self.active_syncs.write().await.remove(&emulator_id);

        webdav_client
            .unlock(&remote_save_dir, UnlockOptions { lock_token })
            .await?;

        if let Some(Err(e)) = res.into_iter().find(|r| r.is_err()) {
            tracing::error!("Error during upload jobs: {:?}", e);
            return Err(e);
        }

        if let Some(Err(e)) = metadata_res.into_iter().find(|r| r.is_err()) {
            tracing::error!("Error during metadata update jobs: {:?}", e);
            return Err(e);
        }

        tracing::info!(
            "Successfully uploaded local save files for emulator {}",
            emulator_id
        );

        Ok(())
    }
}
