use super::{
    scan::{scan_library_target, LibraryScanTarget},
    LibraryServiceHandlers,
};
use retrom_codegen::retrom::services::{
    jobs::v1::JobStatus,
    library::v1::{ScanLibraryRequest, ScanLibraryResponse},
};
use retrom_db::DbPool;
use sqlx::QueryBuilder;
use tonic::Status;
use tracing::{error, warn};

pub async fn scan_library(
    state: &LibraryServiceHandlers,
    _: ScanLibraryRequest,
) -> Result<ScanLibraryResponse, Status> {
    let db_pool = state.db_pool.clone();

    let targets = load_scan_targets(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    if targets.is_empty() {
        return Err(Status::internal("No library content found"));
    }

    let job = state
        .job_manager
        .create_job("Scan Library".to_string(), "Scanning library".to_string())
        .await;

    let job_id = job.id.clone();

    let job_manager = state.job_manager.clone();
    let task_job_id = job_id.clone();

    tokio::spawn(async move {
        let _ = job_manager
            .update_job(
                &task_job_id,
                Some(0.0),
                Some(JobStatus::Running),
                Some("Scanning library".to_string()),
            )
            .await;

        let total = targets.len();
        let mut failed = false;

        for (index, target) in targets.iter().enumerate() {
            if let Err(why) = scan_library_target(&db_pool, target).await {
                error!("Failed to scan library {}: {}", target.library_id, why);
                failed = true;
            }

            let percent = ((index + 1) as f32 / total as f32).min(1.0);
            let _ = job_manager
                .update_job(&task_job_id, Some(percent), None, None)
                .await;
        }

        let message = if failed {
            "Library scan completed with errors".to_string()
        } else {
            "Library scan complete".to_string()
        };

        if let Err(why) = job_manager
            .complete_job(&task_job_id, failed, message)
            .await
        {
            warn!("Failed to mark scan job complete: {}", why);
        }
    });

    Ok(ScanLibraryResponse {
        job_ids: vec![job_id],
    })
}

async fn load_scan_targets(db_pool: &DbPool) -> Result<Vec<LibraryScanTarget>, sqlx::Error> {
    let libraries: Vec<(String, String)> =
        sqlx::query_as("select id, structure_definition from libraries")
            .fetch_all(db_pool)
            .await?;

    let mut targets = Vec::with_capacity(libraries.len());

    for (library_id, structure_definition) in libraries {
        let mut builder = QueryBuilder::new(
            "select rd.path from root_directories rd \
             join library_root_directories lrd on lrd.root_directory_id = rd.id \
             where lrd.library_id = ",
        );
        builder.push_bind(&library_id);

        let root_paths: Vec<String> = builder.build_query_scalar().fetch_all(db_pool).await?;

        if root_paths.is_empty() {
            continue;
        }

        targets.push(LibraryScanTarget {
            library_id,
            structure_definition,
            root_paths,
        });
    }

    Ok(targets)
}
