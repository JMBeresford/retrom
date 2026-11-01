use super::{
    scan::{scan_library_target, LibraryScanTarget},
    LibraryServiceHandlers,
};
use pbjson_types::FieldMask;
use retrom_codegen::retrom::services::{
    files::v1::RegisterHostFileRequest,
    jobs::v1::{
        CreateJobRequest, DeleteJobRequest, GetJobRequest, Job, JobStatus, UpdateJobRequest,
    },
    library::v1::GetLibraryRequest,
};
use retrom_db::DbPool;
use sqlx::QueryBuilder;
use std::sync::OnceLock;
use tonic::Status;

static NAME_MATCH_ROUTER: OnceLock<matchit::Router<&'static str>> = OnceLock::new();

impl LibraryServiceHandlers {
    pub(crate) async fn list_library_ids_for_scan(&self) -> Result<Vec<String>, Status> {
        QueryBuilder::new("select id from libraries order by id asc")
            .build_query_scalar()
            .fetch_all(&self.db_pool)
            .await
            .map_err(|e| Status::internal(e.to_string()))
    }

    pub(crate) async fn scan_library_inner(
        &self,
        request: GetLibraryRequest,
    ) -> Result<Job, Status> {
        let library_id = match_library_id(&request.name)?;
        let (target, library_display_name) = load_scan_target(&self.db_pool, &library_id)
            .await
            .map_err(|e| Status::internal(e.to_string()))?
            .ok_or_else(|| Status::not_found(format!("Library not found: {}", request.name)))?;

        let mut file_client = self.file_svc_client.clone();
        file_client
            .register_host_file(RegisterHostFileRequest {
                absolute_path: target.root_path.clone(),
            })
            .await?;

        let job_parent = format!("libraries/{library_id}");
        let job_name = format!("{job_parent}/jobs/scan");

        let mut job_svc_client = self.job_svc_client.clone();
        ensure_job_available(&mut job_svc_client, &job_name).await?;

        let job = job_svc_client
            .create_job(CreateJobRequest {
                parent: Some(job_parent),
                job_name: Some(job_name.clone()),
                job: Some(Job {
                    status: JobStatus::Pending as i32,
                    display_name: format!("Scan Library: {library_display_name}"),
                    percent_complete: 0.0,
                    message: Some("Starting library scan".to_string()),
                    ..Default::default()
                }),
            })
            .await?
            .into_inner();

        let db_pool = self.db_pool.clone();
        tokio::spawn(async move {
            if let Err(why) = job_svc_client
                .update_job(UpdateJobRequest {
                    job: Some(Job {
                        name: job_name.clone(),
                        status: JobStatus::Running as i32,
                        message: Some("Scanning library".to_string()),
                        ..Default::default()
                    }),
                    update_mask: Some(FieldMask {
                        paths: vec!["status".to_string(), "message".to_string()],
                    }),
                })
                .await
            {
                tracing::error!("Failed to update job status to running: {}", why);
            };

            let (status, message) = match scan_library_target(&db_pool, &target).await {
                Ok(()) => (
                    JobStatus::Complete as i32,
                    "Library scan complete".to_string(),
                ),
                Err(why) => {
                    tracing::error!("Failed to scan library {}: {}", target.library_id, why);
                    (
                        JobStatus::Failed as i32,
                        "Library scan completed with errors".to_string(),
                    )
                }
            };

            if let Err(why) = job_svc_client
                .update_job(UpdateJobRequest {
                    job: Some(Job {
                        name: job_name,
                        status,
                        message: Some(message),
                        percent_complete: 1.0,
                        ..Default::default()
                    }),
                    update_mask: Some(FieldMask {
                        paths: vec![
                            "status".to_string(),
                            "message".to_string(),
                            "percent_complete".to_string(),
                        ],
                    }),
                })
                .await
            {
                tracing::error!("Failed to update job status to complete/failed: {}", why);
            }
        });

        Ok(job)
    }
}

fn get_name_matcher() -> &'static matchit::Router<&'static str> {
    NAME_MATCH_ROUTER.get_or_init(|| {
        let mut router = matchit::Router::new();
        router
            .insert("libraries/{library_id}", "Libraries handler")
            .expect("Failed to insert libraries route");
        router
    })
}

fn match_library_id(name: &str) -> Result<String, Status> {
    let library_id = get_name_matcher()
        .at(name)
        .map(|matched| matched.params.get("library_id").map(|s| s.to_string()))
        .map_err(|_| Status::invalid_argument("Invalid library name"))?;

    match library_id {
        Some(id) => Ok(id),
        None => Err(Status::invalid_argument(format!(
            "Library ID not found in name: {name}"
        ))),
    }
}

async fn ensure_job_available(
    job_svc_client: &mut retrom_service_common::grpc_clients::jobs_svc::CommonJobServiceClient,
    job_name: &str,
) -> Result<(), Status> {
    if let Ok(response) = job_svc_client
        .get_job(GetJobRequest {
            name: job_name.to_string(),
        })
        .await
    {
        let job = response.into_inner();
        match job.status() {
            JobStatus::Complete | JobStatus::Failed => {
                job_svc_client
                    .delete_job(DeleteJobRequest {
                        name: job_name.to_string(),
                    })
                    .await?;
            }
            _ => {
                return Err(Status::failed_precondition(format!(
                    "A scan job is already in progress for {job_name}",
                )));
            }
        }
    };

    Ok(())
}

async fn load_scan_target(
    db_pool: &DbPool,
    library_id: &str,
) -> Result<Option<(LibraryScanTarget, String)>, sqlx::Error> {
    let library: Option<(String, String, String, String)> = QueryBuilder::new(
        "select id, file_root_id, structure_definition, display_name from libraries where id = ",
    )
    .push_bind(library_id)
    .build_query_as()
    .fetch_optional(db_pool)
    .await?;

    let Some((library_id, file_root_id, structure_definition, display_name)) = library else {
        return Ok(None);
    };

    let ignore_patterns: Vec<String> =
        QueryBuilder::new("select pattern from library_ignore_patterns where library_id = ")
            .push_bind(&library_id)
            .push(" order by created_at asc, pattern asc")
            .build_query_scalar()
            .fetch_all(db_pool)
            .await?;

    let root_path: String = QueryBuilder::new("select absolute_path from files where id = ")
        .push_bind(&file_root_id)
        .build_query_scalar()
        .fetch_one(db_pool)
        .await?;

    Ok(Some((
        LibraryScanTarget {
            library_id,
            structure_definition,
            root_path,
            ignore_patterns,
        },
        display_name,
    )))
}
