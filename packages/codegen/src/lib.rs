pub mod storage_type;
pub mod timestamp;

pub mod igdb {
    tonic::include_proto!("igdb");
}

pub mod retrom {

    pub mod client {
        pub mod v1 {
            tonic::include_proto!("retrom.client.v1");
        }

        pub mod installation {
            pub mod v1 {
                tonic::include_proto!("retrom.client.installation.v1");
            }
        }

        pub mod saves {
            pub mod v1 {
                tonic::include_proto!("retrom.client.saves.v1");
            }
        }
    }

    pub mod files {
        pub mod v1 {
            tonic::include_proto!("retrom.files.v1");
        }
    }

    pub mod providers {
        pub mod igdb {
            pub mod v1 {
                tonic::include_proto!("retrom.providers.igdb.v1");
            }
        }
    }

    pub mod services {
        pub mod clients {
            pub mod v1 {
                tonic::include_proto!("retrom.services.clients.v1");
            }
        }

        pub mod config {
            pub mod v1 {
                tonic::include_proto!("retrom.services.config.v1");
            }
        }

        pub mod library {
            pub mod v1 {
                tonic::include_proto!("retrom.services.library.v1");
            }
        }

        pub mod metadata {
            pub mod v1 {
                tonic::include_proto!("retrom.services.metadata.v1");
            }
        }

        pub mod emulators {
            pub mod v1 {
                tonic::include_proto!("retrom.services.emulators.v1");
            }
        }

        pub mod file_explorer {
            pub mod v1 {
                tonic::include_proto!("retrom.services.file_explorer.v1");
            }
        }

        pub mod saves {
            pub mod v1 {
                tonic::include_proto!("retrom.services.saves.v1");
            }

            pub mod v2 {
                tonic::include_proto!("retrom.services.saves.v2");
            }
        }

        pub mod jobs {
            pub mod v1 {
                tonic::include_proto!("retrom.services.jobs.v1");
            }
        }

        pub mod tags {
            pub mod v1 {
                tonic::include_proto!("retrom.services.tags.v1");
            }
        }
    }
}

use std::path::{Component, Path, PathBuf};

use crate::retrom::files::v1::{FileStat, FilesystemNode, FilesystemNodeType};

pub mod descriptors {
    pub mod retrom {
        pub const FILE_DESCRIPTOR_SET: &[u8] =
            tonic::include_file_descriptor_set!("retrom_descriptor");
    }
}

impl TryFrom<PathBuf> for FilesystemNode {
    type Error = ();

    fn try_from(_path: PathBuf) -> Result<Self, Self::Error> {
        let _path = _path.canonicalize().or(Err(()))?;
        let path = _path.to_str().ok_or(())?.into();

        if path == "/" {
            return Ok(FilesystemNode {
                node_type: FilesystemNodeType::Directory.into(),
                path,
                name: "/".into(),
            });
        };

        let name = _path.file_name().ok_or(())?.to_str().ok_or(())?.into();

        let node_type = match _path.is_dir() {
            true => FilesystemNodeType::Directory.into(),
            false => FilesystemNodeType::File.into(),
        };

        Ok(FilesystemNode {
            node_type,
            path,
            name,
        })
    }
}

impl FileStat {
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

impl TryFrom<PathBuf> for FileStat {
    type Error = ();

    fn try_from(path_buf: PathBuf) -> Result<Self, Self::Error> {
        use std::hash::{DefaultHasher, Hash, Hasher};
        let metadata = path_buf.metadata().ok();
        let path = path_buf.to_str().ok_or(())?.into();

        let node_type = match metadata.as_ref().map(|m| m.is_dir()) {
            Some(true) => FilesystemNodeType::Directory as i32,
            Some(false) => FilesystemNodeType::File as i32,
            None => FilesystemNodeType::Unknown as i32,
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

        Ok(FileStat {
            path,
            node_type,
            created_at,
            updated_at,
            byte_size,
            etag,
        })
    }
}
