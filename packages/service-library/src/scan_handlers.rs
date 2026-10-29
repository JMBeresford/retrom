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
    library::v1::{ScanAllLibrariesRequest, ScanAllLibrariesResponse},
};
use retrom_db::DbPool;
use sqlx::QueryBuilder;
use tonic::Status;

const SCAN_ALL_LIBRARIES_JOB_NAME: &str = "jobs/scan_all_libraries";

pub async fn scan_all_libraries(
    state: &LibraryServiceHandlers,
    _: ScanAllLibrariesRequest,
) -> Result<ScanAllLibrariesResponse, Status> {
    let db_pool = state.db_pool.clone();

    let targets = load_scan_targets(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    if targets.is_empty() {
        return Err(Status::internal("No library content found"));
    }

    for target in targets.iter() {
        let mut file_client = state.file_svc_client.clone();
        file_client
            .register_host_file(RegisterHostFileRequest {
                absolute_path: target.root_path.clone(),
            })
            .await?;
    }

    let mut job_svc_client = state.job_svc_client.clone();
    if let Ok(response) = job_svc_client
        .get_job(GetJobRequest {
            name: SCAN_ALL_LIBRARIES_JOB_NAME.to_string(),
        })
        .await
    {
        let job = response.into_inner();
        match job.status() {
            JobStatus::Complete | JobStatus::Failed => {
                job_svc_client
                    .delete_job(DeleteJobRequest {
                        name: SCAN_ALL_LIBRARIES_JOB_NAME.to_string(),
                    })
                    .await?;
            }
            _ => {
                return Err(Status::failed_precondition(
                    "A library scan job is already in progress",
                ));
            }
        }
    };

    let job = job_svc_client
        .create_job(CreateJobRequest {
            parent: None,
            job_name: Some(SCAN_ALL_LIBRARIES_JOB_NAME.to_string()),
            job: Some(Job {
                status: JobStatus::Pending as i32,
                display_name: "Scan All Libraries".to_string(),
                percent_complete: 0.0,
                message: Some("Starting library scan".to_string()),
                ..Default::default()
            }),
        })
        .await?
        .into_inner();

    tokio::spawn(async move {
        if let Err(why) = job_svc_client
            .update_job(UpdateJobRequest {
                job: Some(Job {
                    name: SCAN_ALL_LIBRARIES_JOB_NAME.to_string(),
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

        let total = targets.len();
        let mut failed = false;

        for (index, target) in targets.iter().enumerate() {
            if let Err(why) = scan_library_target(&db_pool, target).await {
                tracing::error!("Failed to scan library {}: {}", target.library_id, why);
                failed = true;
            }

            let percent = ((index + 1) as f32 / total as f32).min(1.0);
            if let Err(why) = job_svc_client
                .update_job(UpdateJobRequest {
                    job: Some(Job {
                        name: SCAN_ALL_LIBRARIES_JOB_NAME.to_string(),
                        percent_complete: percent,
                        ..Default::default()
                    }),
                    update_mask: Some(FieldMask {
                        paths: vec!["percent_complete".to_string()],
                    }),
                })
                .await
            {
                tracing::error!("Failed to update job progress: {}", why);
            }
        }

        let message = if failed {
            "Library scan completed with errors".to_string()
        } else {
            "Library scan complete".to_string()
        };

        if let Err(why) = job_svc_client
            .update_job(UpdateJobRequest {
                job: Some(Job {
                    name: SCAN_ALL_LIBRARIES_JOB_NAME.to_string(),
                    status: if failed {
                        JobStatus::Failed as i32
                    } else {
                        JobStatus::Complete as i32
                    },
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

    Ok(ScanAllLibrariesResponse { job: Some(job) })
}

async fn load_scan_targets(db_pool: &DbPool) -> Result<Vec<LibraryScanTarget>, sqlx::Error> {
    let libraries: Vec<(String, String, String)> =
        sqlx::query_as("select id, file_root_id, structure_definition from libraries")
            .fetch_all(db_pool)
            .await?;

    let mut targets = Vec::with_capacity(libraries.len());

    for (library_id, file_root_id, structure_definition) in libraries {
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

        targets.push(LibraryScanTarget {
            library_id,
            structure_definition,
            root_path,
            ignore_patterns,
        });
    }

    Ok(targets)
}
