use retrom_codegen::retrom::{files::FileStat, FilesystemNodeType};
use serde::{Deserialize, Serialize};
use std::{
    path::{Path, PathBuf},
    time::SystemTime,
};
use walkdir::WalkDir;
use webdav_meta::xml::{
    elements::{Multistatus, Properties, Response},
    properties::{ContentLength, CreationDate, ETag, LastModified, ResourceType},
};

use crate::SaveManagerError;

pub const SNAPSHOT_FILE_NAME: &str = ".retrom-save-snapshot.json";

pub const IGNORED_FILES: &[&str] = &[SNAPSHOT_FILE_NAME, ".ds_store"];

// Snapshot of file stats at a given point in time.
// Used to determine if changes have occurred in a
// local save directory since the last sync.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub(crate) struct Snapshot {
    root: PathBuf,

    // FileStats relative to root, inclusive of root
    files: Vec<FileStat>,
}

impl Snapshot {
    pub fn files(&self) -> &Vec<FileStat> {
        &self.files
    }

    pub fn into_files(self) -> Vec<FileStat> {
        self.files
    }

    pub fn from_root(p: impl AsRef<Path>) -> Option<Self> {
        let path = p.as_ref();

        let mut files = vec![];
        let nodes = WalkDir::new(path).into_iter();
        for node in nodes {
            let node = node.ok()?;
            let fname = node.file_name().to_str();
            if fname.is_some_and(|f| IGNORED_FILES.contains(&f.to_lowercase().as_str())) {
                continue;
            }

            let file = FileStat::try_from(node.path().to_path_buf())
                .ok()?
                .relative_to(path)?;

            files.push(file);
        }

        if files.is_empty() {
            return None;
        }

        let root = path.to_path_buf();

        Some(Self { root, files })
    }

    pub(crate) fn try_from_multistatus(
        remote_root_path: impl AsRef<Path>,
        ms: Multistatus,
    ) -> Option<Self> {
        let remote_root_path = remote_root_path.as_ref();

        fn file_stat_from_props(path: impl AsRef<Path>, props: &Properties) -> Option<FileStat> {
            let path = path.as_ref().to_str()?.to_string();
            let path = match urlencoding::decode(&path) {
                Ok(decoded) => decoded.into_owned(),
                Err(why) => {
                    tracing::warn!("Failed to decode path from WebDAV response: {why:?}");
                    return None;
                }
            };

            FileStat {
                path,
                node_type: match props.get::<ResourceType>().flatten().and_then(|rt| rt.ok()) {
                    Some(rt) => {
                        if rt.is_collection() {
                            FilesystemNodeType::Directory.into()
                        } else {
                            FilesystemNodeType::File.into()
                        }
                    }
                    None => FilesystemNodeType::Unknown.into(),
                },
                byte_size: props
                    .get::<ContentLength>()
                    .flatten()
                    .and_then(|cl| cl.ok().map(|c| c.0)),
                created_at: props.get::<CreationDate>().flatten().and_then(|cd| {
                    cd.ok()
                        .and_then(|c| c.0.checked_to_utc())
                        .map(|c| SystemTime::from(c).into())
                }),
                updated_at: props
                    .get::<LastModified>()
                    .flatten()
                    .and_then(|lm| lm.ok().map(|lm| SystemTime::from(lm.0).into())),
                etag: props
                    .get::<ETag>()
                    .flatten()
                    .and_then(|e| e.ok().map(|et| et.0))?
                    .to_string(),
            }
            .into()
        }

        let props_by_href = ms
            .response
            .into_iter()
            .filter_map(|r| match r {
                Response::Propstat { href, propstat, .. } => {
                    let all_props = propstat.into_iter().map(|ps| ps.prop).collect::<Vec<_>>();
                    let props = all_props.into_iter().fold(
                        webdav_meta::xml::elements::Properties::new(),
                        |mut acc, p| {
                            if let Some(creation_date) =
                                p.get::<CreationDate>().flatten().and_then(|cd| cd.ok())
                            {
                                acc = acc.with(creation_date);
                            }
                            if let Some(get_last_modified) =
                                p.get::<LastModified>().flatten().and_then(|lm| lm.ok())
                            {
                                acc = acc.with(get_last_modified);
                            }
                            if let Some(get_content_length) =
                                p.get::<ContentLength>().flatten().and_then(|cl| cl.ok())
                            {
                                acc = acc.with(get_content_length);
                            }
                            if let Some(etag) = p.get::<ETag>().flatten().and_then(|e| e.ok()) {
                                acc = acc.with(etag);
                            }
                            if let Some(resouce_type) =
                                p.get::<ResourceType>().flatten().and_then(|rt| rt.ok())
                            {
                                acc = acc.with(resouce_type);
                            }
                            acc
                        },
                    );

                    Some((href, props))
                }
                _ => None,
            })
            .collect::<Vec<_>>();

        let Some(root) = props_by_href.iter().find_map(|(href, _)| {
            let file_path = PathBuf::from(href.0.to_string());
            let root_path = remote_root_path;

            tracing::debug!(
                "Matching root for snapshot creation: path_str={file_path:?}, root_str={root_path:?}"
            );
            if file_path == root_path {
                Some(file_path)
            } else {
                None
            }
        }) else {
            tracing::warn!(
                "Failed to find root in multistatus for snapshot creation: root_path={remote_root_path:?}"
            );

            return None;
        };

        let files = props_by_href
            .into_iter()
            .filter(|(href, _)| {
                let path_str = href.0.to_string().to_lowercase();
                !IGNORED_FILES.iter().any(|&f| path_str.ends_with(f))
            })
            .filter_map(|(href, props)| {
                let path_str = href.0.to_string();
                file_stat_from_props(&path_str, &props)
                    .and_then(|fs| fs.relative_to(remote_root_path))
            })
            .collect();

        Some(Snapshot { root, files })
    }
}

impl TryFrom<&PathBuf> for Snapshot {
    type Error = SaveManagerError;

    fn try_from(p: &PathBuf) -> std::result::Result<Self, Self::Error> {
        Snapshot::from_root(p).ok_or_else(|| {
            SaveManagerError::Internal(format!(
                "Failed to create snapshot from path: {}",
                p.display()
            ))
        })
    }
}

impl PartialEq for Snapshot {
    fn eq(&self, other: &Self) -> bool {
        self.files.len() == other.files.len()
            && self.files.iter().all(|file_a| {
                other
                    .files
                    .iter()
                    .find(|file_b| file_a.path == file_b.path)
                    .is_some_and(|file_b| {
                        (file_a.updated_at == file_b.updated_at)
                            && file_a.byte_size == file_b.byte_size
                    })
            })
    }
}

// If one snapshot is strictly newer than another, we can say it's greater.
// In other words, for Snapshots A and B, A >= B if and only if:
// `for (file_a, file_b) in A.files.zip(B.files): file_a.updated_at >= file_b.updated_at`
//
// If no such ordering exists, we return None.
impl PartialOrd for Snapshot {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        use std::cmp::Ordering;

        let mut self_newer = false;
        let mut other_newer = false;

        for self_file in &self.files {
            if let Some(other_file) = other.files.iter().find(|f| f.path == self_file.path) {
                if self_file.updated_at > other_file.updated_at {
                    self_newer = true;
                } else if self_file.updated_at < other_file.updated_at {
                    other_newer = true;
                }
            }
        }

        for other_file in &other.files {
            if let Some(self_file) = self.files.iter().find(|f| f.path == other_file.path) {
                if other_file.updated_at > self_file.updated_at {
                    other_newer = true;
                } else if other_file.updated_at < self_file.updated_at {
                    self_newer = true;
                }
            }
        }

        match (self_newer, other_newer) {
            (true, false) => Some(Ordering::Greater),
            (false, true) => Some(Ordering::Less),
            (false, false) => Some(Ordering::Equal),
            (true, true) => None,
        }
    }
}
