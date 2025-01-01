use std::path::PathBuf;

use retrom_codegen::retrom::{
    file_explorer_service_server::FileExplorerService, FilesystemNode, GetFilesystemNodeRequest,
    GetFilesystemNodeResponse,
};

pub struct FileExplorerServiceHandlers {}

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
}
