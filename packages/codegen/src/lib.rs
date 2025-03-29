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
}
