pub mod storage_type;
pub mod timestamp;

pub mod igdb {
    tonic::include_proto!("igdb");
}

tonic_include_proto::namespaced!(
    "retrom",
    "retrom.files",
    "retrom.client.installation",
    "retrom.client.saves",
    "retrom.services.saves.v1"
    "retrom.services.saves.v2"
);

use std::path::{Component, Path, PathBuf};

use crate::retrom::files::FileStat;

pub mod descriptors {
    pub mod retrom {
        pub const FILE_DESCRIPTOR_SET: &[u8] =
            tonic::include_file_descriptor_set!("retrom_descriptor");
    }
}

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

impl crate::retrom::files::FileStat {
    pub fn relative_to<P: AsRef<Path>>(&self, path: P) -> Option<FileStat> {
        let base_path = path.as_ref();
        let file_path = PathBuf::from(&self.path);

        let relative_path: PathBuf = file_path
            .strip_prefix(base_path)
            .ok()?
            .components()
            .filter(|c| !matches!(c, Component::RootDir | Component::Prefix(_)))
            .collect();

        Some(FileStat {
            path: relative_path.to_str()?.into(),
            node_type: self.node_type,
            created_at: self.created_at,
            updated_at: self.updated_at,
            byte_size: self.byte_size,
            etag: self.etag.clone(),
        })
    }
}

impl TryFrom<PathBuf> for crate::retrom::files::FileStat {
    type Error = ();

    fn try_from(path_buf: PathBuf) -> Result<Self, Self::Error> {
        use std::hash::{DefaultHasher, Hash, Hasher};
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

        let mut hasher = DefaultHasher::new();
        let hash_str = format!("{:?}-{:?}-{:?}", path, created_at, updated_at);
        hash_str.hash(&mut hasher);
        let etag = hasher.finish().to_string();

        Ok(crate::retrom::files::FileStat {
            path,
            node_type,
            created_at,
            updated_at,
            byte_size,
            etag,
        })
    }
}
