use retrom_codegen::retrom::{
    file_explorer_service_server::FileExplorerService, files::FileStat, FilesystemNode,
    GetFilesystemNodeRequest, GetFilesystemNodeResponse, GetStatRequest, GetStatResponse,
};
use retrom_service_common::retrom_dirs::RetromDirs;
use std::path::PathBuf;
use walkdir::WalkDir;
pub struct FileExplorerServiceHandlers {}

impl Default for FileExplorerServiceHandlers {
    fn default() -> Self {
        Self::new()
    }
}

impl FileExplorerServiceHandlers {
    pub fn new() -> Self {
        Self {}
    }
}

#[tonic::async_trait]
impl FileExplorerService for FileExplorerServiceHandlers {
    async fn get_filesystem_node(
        &self,
        request: tonic::Request<GetFilesystemNodeRequest>,
    ) -> Result<tonic::Response<GetFilesystemNodeResponse>, tonic::Status> {
        let request = request.into_inner();
        let path: PathBuf = request.path.unwrap_or("./".to_string()).into();
        let node = match FilesystemNode::try_from(path.clone()) {
            Ok(node) => node,
            Err(_) => return Err(tonic::Status::not_found("Path not found")),
        };

        let mut children: Vec<FilesystemNode> = path
            .read_dir()
            .ok()
            .map(|rd| {
                rd.filter_map(Result::ok)
                    .filter_map(|entry| FilesystemNode::try_from(entry.path()).ok())
                    .collect()
            })
            .unwrap_or_default();

        children.sort_by(|a, b| a.path.cmp(&b.path));
        children.sort_by(|a, b| a.node_type.cmp(&b.node_type));

        if let Some(mut parent) = PathBuf::from(node.path.clone())
            .parent()
            .and_then(|p| FilesystemNode::try_from(p.to_path_buf()).ok())
        {
            parent.name = "..".to_string();
            children.insert(0, parent);
        }

        Ok(tonic::Response::new(GetFilesystemNodeResponse {
            node: Some(node),
            children,
        }))
    }

    async fn get_stat(
        &self,
        request: tonic::Request<GetStatRequest>,
    ) -> std::result::Result<tonic::Response<GetStatResponse>, tonic::Status> {
        let request = request.into_inner();
        let dirs = RetromDirs::new();
        let public_path = dirs.public_dir().clone();
        let path = public_path.join(&request.path);

        let mut walk = WalkDir::new(path);
        if let Some(depth) = request.max_depth {
            walk = walk.max_depth(depth as usize);
        }

        let stats: Vec<FileStat> = walk
            .into_iter()
            .filter_map(Result::ok)
            .map(|entry| entry.into_path())
            .filter(|path| request.include_directories() || path.is_file())
            .filter_map(|path| {
                FileStat::try_from(path.strip_prefix(&public_path).ok()?.to_path_buf()).ok()
            })
            .collect();

        Ok(tonic::Response::new(GetStatResponse { stats }))
    }
}
