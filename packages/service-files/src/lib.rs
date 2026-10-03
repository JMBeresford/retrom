use retrom_codegen::{
    retrom::services::files::v1::{
        explore_host_paths_response::HostNode, file_service_server::FileService, CreateFileRequest,
        DeleteFileRequest, ExploreHostPathsRequest, ExploreHostPathsResponse, File, FileRow,
        FileType, GetFileRequest, ListFilesRequest, ListFilesResponse, RegisterHostFileRequest,
        RegisterHostFileResponse, UpdateFileRequest,
    },
    timestamp::Timestamp,
};
use retrom_db::{page_cursor::PageCursor, DbPool};
use serde::{Deserialize, Serialize};
use sqlx::QueryBuilder;
use std::{
    path::{Path, PathBuf},
    sync::OnceLock,
};
use tonic::{Request, Response, Status};

pub mod router;

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
struct FileQueryFilter {
    parent_id: Option<String>,
}

type FileCursor = PageCursor<FileQueryFilter>;

static ROUTER: OnceLock<matchit::Router<&'static str>> = OnceLock::new();

fn get_router() -> &'static matchit::Router<&'static str> {
    ROUTER.get_or_init(|| {
        let mut router = matchit::Router::new();
        router
            .insert("files/{file_id}", "File handler")
            .expect("Failed to insert route");

        router
    })
}

pub struct FileServiceHandlers {
    pub db_pool: DbPool,
}

impl FileServiceHandlers {
    pub fn new(db_pool: DbPool) -> Self {
        Self { db_pool }
    }
}

async fn calculate_etag_from_file_row(file_row: &FileRow) -> String {
    if file_row.file_type() == FileType::Directory {
        return format!(
            "W/\"dir-{}-{}\"",
            file_row.updated_at.as_ref().map_or(0, |ts| ts.seconds),
            file_row.byte_size
        );
    }

    match file_row.sha256_hash {
        Some(ref hash) => format!("\"{hash}\""),
        None => format!(
            "W/\"file-{}-{}\"",
            file_row.updated_at.as_ref().map_or(0, |ts| ts.seconds),
            file_row.byte_size
        ),
    }
}

fn file_row_to_file(file_row: FileRow, etag: &str) -> File {
    File {
        name: format!("files/{}", file_row.id),
        parent: match file_row.parent_id {
            Some(parent) => format!("files/{}", parent),
            None => "files/root".to_string(),
        },
        created_at: file_row.created_at,
        updated_at: file_row.updated_at,
        file_name: file_row.file_name,
        file_type: file_row.file_type,
        download_uri: "".to_string(), // Placeholder, implement logic to generate download URI
        byte_size: file_row.byte_size,
        sha256_hash: file_row.sha256_hash,
        etag: etag.to_string(),
        is_deleted: file_row.is_deleted,
    }
}

async fn calculate_sha256_hash(file_path: impl AsRef<Path>) -> Result<String, Status> {
    use sha2::{Digest, Sha256};

    let file_path = file_path.as_ref().to_owned();
    tokio::task::spawn_blocking(move || {
        use std::{fs::File, io::Read};

        let mut file = File::open(file_path)?;

        let mut hasher = Sha256::new();
        let mut buffer = [0u8; 8192];

        loop {
            let bytes_read = file.read(&mut buffer)?;

            if bytes_read == 0 {
                break;
            }

            hasher.update(&buffer[..bytes_read]);
        }

        Ok(format!("{:x}", hasher.finalize()))
    })
    .await
    .map_err(|e| Status::internal(format!("Failed to calculate SHA256 hash: {e}")))?
}

fn match_file_id(name: &str) -> Result<String, Status> {
    let file_id = get_router()
        .at(name)
        .map(|matched| matched.params.get("file_id").map(|s| s.to_string()))
        .map_err(|_| Status::invalid_argument("Invalid file path"))?;

    match file_id {
        Some(id) => Ok(id),
        None => Err(Status::invalid_argument(format!(
            "File ID not found in name: {name}"
        ))),
    }
}

#[tonic::async_trait]
impl FileService for FileServiceHandlers {
    async fn get_file(&self, request: Request<GetFileRequest>) -> Result<Response<File>, Status> {
        let request = request.into_inner();
        let file_id = match_file_id(&request.name)?;

        let file_row: Option<FileRow> = QueryBuilder::new("select * from files where id = ")
            .push_bind(&file_id)
            .push(" limit 1")
            .build_query_as()
            .fetch_optional(&self.db_pool)
            .await
            .map_err(|e| Status::internal(format!("Internal server error: {e}")))?;

        let mut file_row = match file_row {
            Some(file) => file,
            None => {
                return Err(Status::not_found("File not found"));
            }
        };

        let file_meta = match tokio::fs::metadata(&file_row.absolute_path).await {
            Ok(meta) => meta,
            Err(_) => {
                return Err(Status::not_found("File not found on disk"));
            }
        };

        let curr_byte_size = file_meta.len();
        let curr_updated_at: Timestamp = file_meta
            .modified()
            .unwrap_or(std::time::SystemTime::UNIX_EPOCH)
            .into();

        // Disk modified w/o notifying the database, trigger an update to the database record with the new size
        // and updated_at timestamp along with a background job to calculate the new SHA256 hash of
        // the file.
        if curr_byte_size != file_row.byte_size || Some(curr_updated_at) != file_row.updated_at {
            // TODO: Update the file record in the database with the new size and updated_at
            // timestamp

            file_row.byte_size = curr_byte_size;
            file_row.updated_at = Some(curr_updated_at);
        }

        let etag = calculate_etag_from_file_row(&file_row).await;

        Ok(Response::new(file_row_to_file(file_row, &etag)))
    }

    async fn create_file(
        &self,
        request: Request<CreateFileRequest>,
    ) -> Result<Response<File>, Status> {
        let request = request.into_inner();
        let parent_id = match_file_id(&request.parent)?;
        let to_create_id = request
            .file_id
            .unwrap_or_else(|| uuid::Uuid::now_v7().to_string());

        let to_create = match request.file {
            Some(file) => file,
            None => return Err(Status::invalid_argument("Missing file data")),
        };

        let parent_path: Option<String> =
            QueryBuilder::new("select absolute_path from files where id = ")
                .push_bind(&parent_id)
                .build_query_scalar()
                .fetch_optional(&self.db_pool)
                .await
                .map_err(|e| Status::internal(format!("Internal server error: {e}")))?;

        let parent_path = match parent_path {
            Some(path) => PathBuf::from(path),
            None => return Err(Status::not_found("Parent file not found")),
        };

        let file_path = parent_path.join(&to_create.file_name);

        if !file_path.exists() {
            match to_create.file_type() {
                FileType::Directory => {
                    tokio::fs::create_dir(&file_path).await.map_err(|e| {
                        Status::internal(format!("Failed to create directory: {e}"))
                    })?;
                }
                FileType::File => {
                    tokio::fs::File::create(&file_path)
                        .await
                        .map_err(|e| Status::internal(format!("Failed to create file: {e}")))?;
                }
                FileType::Unspecified => {
                    return Err(Status::invalid_argument(
                        "File type must be specified for creation",
                    ));
                }
            };
        }

        let absolute_path = file_path
            .canonicalize()
            .map(|p| p.to_string_lossy().to_string())
            .map_err(|e| Status::internal(format!("Failed to canonicalize path: {e}")))?;

        let metadata = tokio::fs::metadata(&file_path)
            .await
            .map_err(|e| Status::internal(format!("Failed to get file metadata: {e}")))?;

        let file_type = match file_path.is_dir() {
            true => FileType::Directory as i32,
            false => FileType::File as i32,
        };

        let byte_size = metadata.len();

        let sha256_hash = if file_path.is_file() && byte_size < 10 * 1000000 {
            Some(calculate_sha256_hash(&file_path).await?)
        } else {
            // TODO: Trigger a background job to calculate the SHA256 hash for large files
            None
        };

        let created_at: Option<Timestamp> = metadata.created().ok().map(|t| t.into());
        let updated_at: Option<Timestamp> = metadata.modified().ok().map(|t| t.into());

        let mut builder = QueryBuilder::new(
            r#"
            insert into files (
                id,
                parent_id,
                file_name,
                file_type,
                byte_size,
                sha256_hash,
                absolute_path,
                created_at,
                updated_at
            ) values (
            "#,
        );

        let mut sep = builder.separated(", ");
        sep.push_bind(&to_create_id);
        sep.push_bind(&parent_id);
        sep.push_bind(&to_create.file_name);
        sep.push_bind(file_type);
        sep.push_bind(byte_size as i64);
        sep.push_bind(&sha256_hash);
        sep.push_bind(&absolute_path);
        sep.push_bind(created_at);
        sep.push_bind(updated_at);

        builder.push(") returning *");

        let file_row: FileRow = builder
            .build_query_as()
            .fetch_one(&self.db_pool)
            .await
            .map_err(|e| {
                Status::internal(format!("Failed to insert file record into database: {e}"))
            })?;

        let etag = calculate_etag_from_file_row(&file_row).await;

        Ok(Response::new(file_row_to_file(file_row, &etag)))
    }

    async fn list_files(
        &self,
        request: Request<ListFilesRequest>,
    ) -> Result<Response<ListFilesResponse>, Status> {
        let request = request.into_inner();

        let cursor = match FileCursor::deserialize(request.page_token()) {
            Some(existing_token) => existing_token,
            None => {
                let parsed_limit = match request.page_size() {
                    0 => 250, // Default page size
                    n if n < 0 => {
                        return Err(Status::invalid_argument("Page size must be non-negative"))
                    }
                    n if n > 1000 => 1000, // Max page size
                    n => n as u32,
                };

                let parsed_parent_id = if let Some(ref parent) = request.parent {
                    match_file_id(parent).ok()
                } else {
                    None
                };

                let initial_filter = FileQueryFilter {
                    parent_id: parsed_parent_id,
                };

                FileCursor {
                    offset: 0,
                    page_size: parsed_limit,
                    filter: initial_filter,
                }
            }
        };

        let current_filter = cursor.filter.clone();
        let query_limit = cursor.page_size + 1; // Fetch one extra to determine if there's a next page

        let mut builder = QueryBuilder::new("select * from files where parent_id ");
        if let Some(ref parent_id) = current_filter.parent_id {
            builder.push("= ");
            builder.push_bind(parent_id);
        } else {
            builder.push("is null");
        }

        builder.push(" order by file_name asc, id asc ");
        builder.push("limit ");
        builder.push_bind(query_limit);
        builder.push(" offset ");
        builder.push_bind(cursor.offset);

        let rows: Vec<FileRow> = builder
            .build_query_as()
            .fetch_all(&self.db_pool)
            .await
            .map_err(|e| Status::internal(format!("Internal server error: {e}")))?;

        let mut files = Vec::new();
        let num_rows_to_process = std::cmp::min(rows.len(), cursor.page_size as usize);

        let next_page_token = if rows.len() > cursor.page_size as usize {
            let next_cursor = FileCursor {
                offset: cursor.offset + cursor.page_size as u32,
                page_size: cursor.page_size,
                filter: cursor.filter,
            };

            Some(next_cursor.serialize())
        } else {
            None
        };

        for file_row in rows.into_iter().take(num_rows_to_process) {
            let etag = calculate_etag_from_file_row(&file_row).await;
            files.push(file_row_to_file(file_row, &etag));
        }

        Ok(Response::new(ListFilesResponse {
            files,
            next_page_token,
        }))
    }

    async fn update_file(
        &self,
        request: Request<UpdateFileRequest>,
    ) -> Result<Response<File>, Status> {
        let request = request.into_inner();

        let file = match request.file {
            Some(file) => file,
            None => return Err(Status::invalid_argument("Missing file data")),
        };

        let file_id = match_file_id(&file.name)?;

        let absolute_path: Option<String> =
            QueryBuilder::new("select absolute_path from files where id = ")
                .push_bind(&file_id)
                .build_query_scalar()
                .fetch_optional(&self.db_pool)
                .await
                .map_err(|e| Status::internal(format!("Internal server error: {e}")))?;

        let absolute_path = match absolute_path {
            Some(path) => path,
            None => return Err(Status::not_found("File not found")),
        };

        let new_file_name = PathBuf::from(&absolute_path)
            .parent()
            .unwrap_or_else(|| Path::new("."))
            .join(&file.file_name);

        let new_absolute_path = new_file_name.to_string_lossy().to_string();

        let mut builder = QueryBuilder::new("update files set ");
        builder.push("absolute_path = ");
        builder.push_bind(&new_absolute_path);
        builder.push(", file_name = ");
        builder.push_bind(&file.file_name);
        builder.push(" where id = ");
        builder.push_bind(&file_id);

        let mut tx = self
            .db_pool
            .begin()
            .await
            .map_err(|e| Status::internal(format!("Failed to begin transaction: {e}")))?;

        builder
            .build()
            .execute(&mut *tx)
            .await
            .map_err(|e| Status::internal(format!("Failed to update file record: {e}")))?;

        tokio::fs::rename(&absolute_path, &new_file_name)
            .await
            .map_err(|e| Status::internal(format!("Failed to rename file on disk: {e}")))?;

        tx.commit()
            .await
            .map_err(|e| Status::internal(format!("Failed to commit transaction: {e}")))?;

        self.get_file(Request::new(GetFileRequest { name: file.name }))
            .await
    }

    async fn delete_file(
        &self,
        request: Request<DeleteFileRequest>,
    ) -> Result<Response<File>, Status> {
        let request = request.into_inner();
        let file_id = match_file_id(&request.name)?;
        let soft_delete = request.soft_delete();
        let delete_from_disk = request.delete_from_disk();

        let mut builder = if soft_delete {
            let mut b = QueryBuilder::new("update files set is_deleted = ");
            b.push_bind(true);
            b.push(" where id = ");
            b.push_bind(&file_id);
            b.push(" returning *");

            b
        } else {
            let mut b = QueryBuilder::new("delete from files where id = ");
            b.push_bind(&file_id);
            b.push(" returning *");
            b
        };

        let mut tx = self
            .db_pool
            .begin()
            .await
            .map_err(|e| Status::internal(format!("Failed to begin transaction: {e}")))?;

        let deleted_file_row: Option<FileRow> = builder
            .build_query_as()
            .fetch_optional(&mut *tx)
            .await
            .map_err(|e| Status::internal(format!("Failed to delete file record: {e}")))?;

        let deleted_file_row = match deleted_file_row {
            Some(file) => file,
            None => return Err(Status::not_found("File not found")),
        };

        if delete_from_disk {
            if let Err(e) = tokio::fs::remove_file(&deleted_file_row.absolute_path).await {
                return Err(Status::internal(format!(
                    "Failed to delete file from disk: {e}"
                )));
            }
        }

        tx.commit()
            .await
            .map_err(|e| Status::internal(format!("Failed to commit transaction: {e}")))?;

        let etag = calculate_etag_from_file_row(&deleted_file_row).await;
        let mut file = file_row_to_file(deleted_file_row, &etag);
        file.is_deleted = true;

        Ok(Response::new(file))
    }

    async fn explore_host_paths(
        &self,
        request: Request<ExploreHostPathsRequest>,
    ) -> Result<Response<ExploreHostPathsResponse>, Status> {
        let request = request.into_inner();
        let path = PathBuf::from(&request.absolute_path);

        let parent_absolute_path = path
            .canonicalize()
            .map_err(|e| Status::invalid_argument(format!("Invalid path: {e}")))?
            .to_string_lossy()
            .to_string();

        // Select child records that have a parent_id that refers to a file with `absolute_path`
        // equal to the requested path. This will allow us to determine which child paths are
        // already tracked in the database.
        let tracked_children_paths: Vec<String> = QueryBuilder::new(
            r#"
            select distinct f.absolute_path
            from files f
            join files p on f.parent_id = p.id
            where p.absolute_path = 
            "#,
        )
        .push_bind(&parent_absolute_path)
        .build_query_scalar()
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| Status::internal(format!("Internal server error: {e}")))?;

        let nodes: Vec<HostNode> = match path.read_dir().ok().map(|rd| {
            rd.filter_map(Result::ok)
                .filter_map(|entry| {
                    let metadata = entry.metadata().ok()?;

                    let absolute_path = entry
                        .path()
                        .canonicalize()
                        .ok()?
                        .to_string_lossy()
                        .to_string();

                    let file_name = entry.file_name().to_string_lossy().to_string();
                    let is_tracked = tracked_children_paths.contains(&absolute_path);

                    Some(HostNode {
                        absolute_path,
                        file_name,
                        is_directory: metadata.is_dir(),
                        is_tracked,
                    })
                })
                .collect()
        }) {
            Some(children) => children,
            None => {
                return Err(Status::not_found(format!(
                    "Path not found or inaccessible: {}",
                    parent_absolute_path
                )))
            }
        };

        Ok(Response::new(ExploreHostPathsResponse { nodes }))
    }

    async fn register_host_file(
        &self,
        request: Request<RegisterHostFileRequest>,
    ) -> Result<Response<RegisterHostFileResponse>, Status> {
        let request = request.into_inner();
        let path = PathBuf::from(&request.absolute_path);

        if !path.exists() {
            return Err(Status::not_found("Path does not exist"));
        }

        let aboslute_path = path
            .canonicalize()
            .map_err(|e| Status::invalid_argument(format!("Invalid path: {e}")))?
            .to_string_lossy()
            .to_string();

        let file_name = path
            .file_name()
            .ok_or_else(|| Status::invalid_argument("Invalid file name"))?
            .to_string_lossy()
            .to_string();

        let file_type = if path.is_dir() {
            FileType::Directory
        } else {
            FileType::File
        };

        let metadata = tokio::fs::metadata(&aboslute_path)
            .await
            .map_err(|e| Status::internal(format!("Failed to get file metadata: {e}")))?;

        let byte_size = metadata.len();
        let created_at: Option<Timestamp> = metadata.created().ok().map(|t| t.into());
        let updated_at: Timestamp = metadata
            .modified()
            .unwrap_or(std::time::SystemTime::UNIX_EPOCH)
            .into();

        let mut builder = QueryBuilder::new(
            r#"
            insert into files (
                id,
                file_name,
                file_type,
                byte_size,
                absolute_path,
                created_at,
                updated_at
            ) values (
            "#,
        );

        let mut sep = builder.separated(", ");
        sep.push_bind(uuid::Uuid::now_v7().to_string());
        sep.push_bind(&file_name);
        sep.push_bind(file_type as i32);
        sep.push_bind(byte_size as i64);
        sep.push_bind(&aboslute_path);
        sep.push_bind(created_at);
        sep.push_bind(updated_at);

        builder.push(") returning *");

        let file_row: FileRow = builder
            .build_query_as()
            .fetch_one(&self.db_pool)
            .await
            .map_err(|e| {
                Status::internal(format!("Failed to insert file record into database: {e}"))
            })?;

        let etag = calculate_etag_from_file_row(&file_row).await;
        let file = file_row_to_file(file_row, &etag).into();

        Ok(Response::new(RegisterHostFileResponse { file }))
    }
}
