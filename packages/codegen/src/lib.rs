pub mod storage_type;
pub mod timestamp;

pub mod igdb {
    tonic::include_proto!("igdb");
}

pub mod retrom {
    pub mod files {
        tonic::include_proto!("retrom.files");
    }

    use std::path::PathBuf;

    tonic::include_proto!("retrom");

    pub const FILE_DESCRIPTOR_SET: &[u8] = tonic::include_file_descriptor_set!("retrom_descriptor");

    impl TryFrom<PathBuf> for crate::retrom::FilesystemNode {
        type Error = ();

        fn try_from(_path: PathBuf) -> Result<Self, Self::Error> {
            let _path = _path.canonicalize().or(Err(()))?;
            let path = _path.to_str().ok_or(())?.into();

            if path == "/" {
                return Ok(crate::retrom::FilesystemNode {
                    node_type: crate::retrom::FilesystemNodeType::Directory.into(),
                    path,
                    name: "/".into(),
                });
            };

            let name = _path.file_name().ok_or(())?.to_str().ok_or(())?.into();

            let node_type = match _path.is_dir() {
                true => crate::retrom::FilesystemNodeType::Directory.into(),
                false => crate::retrom::FilesystemNodeType::File.into(),
            };

            Ok(crate::retrom::FilesystemNode {
                node_type,
                path,
                name,
            })
        }
    }

    impl TryFrom<PathBuf> for crate::retrom::files::FileStat {
        type Error = ();

        fn try_from(path_buf: PathBuf) -> Result<Self, Self::Error> {
            let metadata = path_buf.metadata().ok();
            let path = path_buf.to_str().ok_or(())?.into();

            let node_type = match metadata.as_ref().map(|m| m.is_dir()) {
                Some(true) => crate::retrom::FilesystemNodeType::Directory as i32,
                Some(false) => crate::retrom::FilesystemNodeType::File as i32,
                None => crate::retrom::FilesystemNodeType::Unknown as i32,
            };

            let created_at = metadata
                .as_ref()
                .and_then(|m| m.created().ok().map(|t| t.into()));

            let updated_at = metadata
                .as_ref()
                .and_then(|m| m.modified().ok().map(|t| t.into()));

            let byte_size = metadata.as_ref().map(|m| m.len());

            Ok(crate::retrom::files::FileStat {
                path,
                node_type,
                created_at,
                updated_at,
                byte_size,
            })
        }
    }
}
