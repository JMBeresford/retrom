//! Library metadata refresh, backed by sqlx + the v2 schema.
//!
//! Orchestrates manual, IGDB, and Steam metadata for every platform and game in the
//! database. IGDB and Steam lookups are delegated to the metadata service via the gRPC
//! clients carried on [`LibraryServiceHandlers`] (`igdb_svc_client`, `steam_svc_client`);
//! all persistence is performed locally with [`sqlx::QueryBuilder`].

use crate::LibraryServiceHandlers;
use pbjson_types::FieldMask;
use retrom_codegen::retrom::services::{
    jobs::v1::{
        CreateJobRequest, DeleteJobRequest, GetJobRequest, Job, JobStatus, UpdateJobRequest,
        WatchJobRequest,
    },
    library::v1::{UpdateLibraryMetadataRequest, UpdateLibraryMetadataResponse},
    metadata::v1::{DownloadGameMetadataRequest, DownloadPlatformMetadataRequest},
};
use sqlx::QueryBuilder;
use tonic::{Code, Request, Status};
use tracing::{Instrument, Span};

const UPDATE_PLATFORM_METADATA_JOB_NAME: &str = "jobs/update_platform_metadata";
const UPDATE_GAME_METADATA_JOB_NAME: &str = "jobs/update_game_metadata";
const UPDATE_EXTRA_METADATA_JOB_NAME: &str = "jobs/update_extra_metadata";

pub async fn update_library_metadata(
    state: &LibraryServiceHandlers,
    request: Request<UpdateLibraryMetadataRequest>,
) -> Result<UpdateLibraryMetadataResponse, Status> {
    let request = request.into_inner();
    let overwrite = request.overwrite();

    let mut job_svc_client = state.job_svc_client.clone();

    for job_name in [
        UPDATE_PLATFORM_METADATA_JOB_NAME,
        UPDATE_GAME_METADATA_JOB_NAME,
        UPDATE_EXTRA_METADATA_JOB_NAME,
    ] {
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
                        "A {job_name} job is already in progress"
                    )));
                }
            }
        };
    }

    let platform_metadata_job = job_svc_client
        .create_job(CreateJobRequest {
            parent: None,
            job_name: Some(UPDATE_PLATFORM_METADATA_JOB_NAME.to_string()),
            job: Some(Job {
                status: JobStatus::Pending as i32,
                display_name: "Updating Platform Metadata".to_string(),
                percent_complete: 0.0,
                message: Some("Downloading platform metadata".to_string()),
                ..Default::default()
            }),
        })
        .await?
        .into_inner();

    let game_metadata_job = job_svc_client
        .create_job(CreateJobRequest {
            parent: None,
            job_name: Some(UPDATE_GAME_METADATA_JOB_NAME.to_string()),
            job: Some(Job {
                status: JobStatus::Pending as i32,
                display_name: "Updating Game Metadata".to_string(),
                percent_complete: 0.0,
                message: Some("Downloading game metadata".to_string()),
                ..Default::default()
            }),
        })
        .await?
        .into_inner();

    let extra_metadata_job = job_svc_client
        .create_job(CreateJobRequest {
            parent: None,
            job_name: Some(UPDATE_EXTRA_METADATA_JOB_NAME.to_string()),
            job: Some(Job {
                status: JobStatus::Pending as i32,
                display_name: "Updating Extra Metadata".to_string(),
                percent_complete: 0.0,
                message: Some("Downloading extra metadata".to_string()),
                ..Default::default()
            }),
        })
        .await?
        .into_inner();

    let db_pool = state.db_pool.clone();
    let metadata_svc = state.metadata_svc_client.clone();

    let current_span = Span::current();

    let platform_update_span = tracing::info_span!(parent: None, "update_platform_metadata_job");
    platform_update_span.follows_from(&current_span);

    let mut job_svc_client = state.job_svc_client.clone();
    tokio::spawn(
        async move {
            if let Err(why) = job_svc_client
                .update_job(UpdateJobRequest {
                    job: Some(Job {
                        name: UPDATE_PLATFORM_METADATA_JOB_NAME.to_string(),
                        status: JobStatus::Running as i32,
                        ..Default::default()
                    }),
                    update_mask: Some(FieldMask {
                        paths: vec!["status".to_string()],
                    }),
                })
                .await
            {
                tracing::error!("Failed to update job status to running: {}", why);
            };

            let all_platform_ids: Vec<String> = match QueryBuilder::new("select id from platforms")
                .build_query_scalar()
                .fetch_all(&db_pool)
                .await
            {
                Ok(platform_ids) => platform_ids,
                Err(why) => {
                    tracing::error!("Failed to fetch platform ids: {why:#?}");
                    vec![]
                }
            };

            let mut tasks = tokio::task::JoinSet::new();
            all_platform_ids.into_iter().for_each(|platform_id| {
                let mut metadata_svc = metadata_svc.clone();
                tasks.spawn(async move {
                    match metadata_svc
                        .download_platform_metadata(DownloadPlatformMetadataRequest {
                            platform_id: platform_id.clone(),
                            overwrite,
                        })
                        .await
                    {
                        Ok(_) => {}
                        Err(status) => match status.code() {
                            Code::NotFound => tracing::debug!(
                                "No metadata found for platform_id {platform_id}: {}",
                                status.message()
                            ),
                            _ => return Err(status),
                        },
                    };

                    Ok::<(), Status>(())
                });
            });

            let total_tasks = tasks.len();
            let mut completed_tasks = 0;
            while let Some(join_result) = tasks.join_next().await {
                let percent_complete = (completed_tasks as f32 / total_tasks as f32) * 100.0;
                match &join_result {
                    Err(why) => {
                        tracing::error!(
                            "A task in the update library metadata job panicked: {why:#?}"
                        );
                    }
                    Ok(Err(why)) => {
                        tracing::error!(
                            "A task in the update library metadata job failed: {why:#?}"
                        );
                    }
                    _ => {}
                };

                if let Err(why) = job_svc_client
                    .update_job(UpdateJobRequest {
                        job: Some(Job {
                            name: UPDATE_PLATFORM_METADATA_JOB_NAME.to_string(),
                            percent_complete,
                            ..Default::default()
                        }),
                        update_mask: Some(FieldMask {
                            paths: vec!["percent_complete".to_string()],
                        }),
                    })
                    .await
                {
                    tracing::error!("Failed to update job progress: {}", why);
                };

                completed_tasks += 1;
            }

            if let Err(why) = job_svc_client
                .update_job(UpdateJobRequest {
                    job: Some(Job {
                        name: UPDATE_PLATFORM_METADATA_JOB_NAME.to_string(),
                        status: JobStatus::Complete as i32,
                        percent_complete: 100.0,
                        message: Some("Platform metadata update complete".to_string()),
                        ..Default::default()
                    }),
                    update_mask: Some(FieldMask {
                        paths: vec![
                            "status".to_string(),
                            "percent_complete".to_string(),
                            "message".to_string(),
                        ],
                    }),
                })
                .await
            {
                tracing::error!("Failed to update job status to complete: {}", why);
            };

            Ok::<_, Status>(())
        }
        .instrument(platform_update_span),
    );

    let db_pool = state.db_pool.clone();
    let metadata_svc = state.metadata_svc_client.clone();

    let game_update_span = tracing::info_span!(parent: None, "update_game_metadata_job");
    game_update_span.follows_from(&current_span);

    let mut job_svc_client = state.job_svc_client.clone();
    tokio::spawn(
        async move {
            let mut sub = job_svc_client
                .watch_job(WatchJobRequest {
                    name: UPDATE_PLATFORM_METADATA_JOB_NAME.to_string(),
                })
                .await?
                .into_inner();

            while let Some(response) = sub.message().await? {
                let job = response
                    .job
                    .ok_or_else(|| Status::internal("Received a watch job response with no job"))?;

                if matches!(job.status(), JobStatus::Complete | JobStatus::Failed) {
                    break;
                }
            }

            if let Err(why) = job_svc_client
                .update_job(UpdateJobRequest {
                    job: Some(Job {
                        name: UPDATE_GAME_METADATA_JOB_NAME.to_string(),
                        status: JobStatus::Running as i32,
                        ..Default::default()
                    }),
                    update_mask: Some(FieldMask {
                        paths: vec!["status".to_string()],
                    }),
                })
                .await
            {
                tracing::error!("Failed to update job status to running: {}", why);
            };

            let all_game_ids: Vec<String> = match QueryBuilder::new("select id from games")
                .build_query_scalar()
                .fetch_all(&db_pool)
                .await
            {
                Ok(game_ids) => game_ids,
                Err(why) => {
                    tracing::error!("Failed to fetch game ids: {why:#?}");
                    vec![]
                }
            };

            let mut tasks = tokio::task::JoinSet::new();
            all_game_ids.into_iter().for_each(|game_id| {
                let mut metadata_svc = metadata_svc.clone();

                tasks.spawn(async move {
                    match metadata_svc
                        .download_game_metadata(DownloadGameMetadataRequest {
                            game_id: game_id.clone(),
                            overwrite,
                        })
                        .await
                    {
                        Ok(_) => {}
                        Err(status) => match status.code() {
                            Code::NotFound => tracing::debug!(
                                "No metadata found for game_id {game_id}: {}",
                                status.message()
                            ),
                            _ => return Err(status),
                        },
                    }

                    Ok::<(), Status>(())
                });
            });

            let total_tasks = tasks.len();
            let mut completed_tasks = 0;
            while let Some(join_result) = tasks.join_next().await {
                let percent_complete = (completed_tasks as f32 / total_tasks as f32) * 100.0;
                match &join_result {
                    Err(why) => {
                        tracing::error!(
                            "A task in the update library metadata job panicked: {why}"
                        );
                    }
                    Ok(Err(why)) => {
                        tracing::error!("A task in the update library metadata job failed: {why}");
                    }
                    _ => {}
                };

                if let Err(why) = job_svc_client
                    .update_job(UpdateJobRequest {
                        job: Some(Job {
                            name: UPDATE_GAME_METADATA_JOB_NAME.to_string(),
                            percent_complete,
                            ..Default::default()
                        }),
                        update_mask: Some(FieldMask {
                            paths: vec!["percent_complete".to_string()],
                        }),
                    })
                    .await
                {
                    tracing::error!("Failed to update job progress: {}", why);
                };

                completed_tasks += 1;
            }

            if let Err(why) = job_svc_client
                .update_job(UpdateJobRequest {
                    job: Some(Job {
                        name: UPDATE_GAME_METADATA_JOB_NAME.to_string(),
                        status: JobStatus::Complete as i32,
                        percent_complete: 100.0,
                        message: Some("Game metadata update complete".to_string()),
                        ..Default::default()
                    }),
                    update_mask: Some(FieldMask {
                        paths: vec![
                            "status".to_string(),
                            "percent_complete".to_string(),
                            "message".to_string(),
                        ],
                    }),
                })
                .await
            {
                tracing::error!("Failed to update job status to complete: {}", why);
            };

            Ok::<_, Status>(())
        }
        .instrument(game_update_span),
    );

    let db_pool = state.db_pool.clone();

    let extra_metadata_update_span = tracing::info_span!(parent: None, "update_extra_metadata_job");
    extra_metadata_update_span.follows_from(&current_span);

    let mut job_svc_client = state.job_svc_client.clone();
    tokio::spawn(
        async move {
            let mut sub = job_svc_client
                .watch_job(WatchJobRequest {
                    name: UPDATE_GAME_METADATA_JOB_NAME.to_string(),
                })
                .await?
                .into_inner();

            while let Some(response) = sub.message().await? {
                let job = response
                    .job
                    .ok_or_else(|| Status::internal("Received a watch job response with no job"))?;

                if matches!(job.status(), JobStatus::Complete | JobStatus::Failed) {
                    break;
                }
            }

            if let Err(why) = job_svc_client
                .update_job(UpdateJobRequest {
                    job: Some(Job {
                        name: UPDATE_EXTRA_METADATA_JOB_NAME.to_string(),
                        status: JobStatus::Running as i32,
                        ..Default::default()
                    }),
                    update_mask: Some(FieldMask {
                        paths: vec!["status".to_string()],
                    }),
                })
                .await
            {
                tracing::error!("Failed to update job status to running: {}", why);
            };

            let all_game_ids: Vec<String> = QueryBuilder::new("select id from games")
                .build_query_scalar()
                .fetch_all(&db_pool)
                .await
                .map_err(|why| Status::internal(why.to_string()))?;

            let mut tasks = tokio::task::JoinSet::new();
            all_game_ids.into_iter().for_each(|game_id| {
                let db_pool = db_pool.clone();

                tasks.spawn(async move {
                    // Collect IDs of other games that share tags with this game.
                    let similar_game_ids: Vec<String> = QueryBuilder::new(
                        r#"
                            select distinct other_tags.game_id
                            from game_tags this_tags
                            join game_tags other_tags on this_tags.tag_id = other_tags.tag_id
                            where this_tags.game_id = 
                            "#,
                    )
                    .push_bind(&game_id)
                    .push(" and other_tags.game_id != ")
                    .push_bind(&game_id)
                    .build_query_scalar()
                    .fetch_all(&db_pool)
                    .await
                    .map_err(|why| Status::internal(why.to_string()))?;

                    if similar_game_ids.is_empty() {
                        return Ok::<(), Status>(());
                    }

                    let mut insert_builder =
                        QueryBuilder::new("insert into similar_games (game_id, similar_game_id) ");

                    insert_builder.push_values(
                        similar_game_ids.iter(),
                        |mut row, similar_game_id| {
                            row.push_bind(&game_id);
                            row.push_bind(similar_game_id);
                        },
                    );

                    insert_builder.push(" on conflict do nothing");

                    insert_builder
                        .build()
                        .execute(&db_pool)
                        .await
                        .map_err(|why| Status::internal(why.to_string()))?;

                    Ok::<(), Status>(())
                });
            });

            let total_tasks = tasks.len();
            let mut completed_tasks = 0;
            while let Some(join_result) = tasks.join_next().await {
                let percent_complete = (completed_tasks as f32 / total_tasks as f32) * 100.0;
                match &join_result {
                    Err(why) => {
                        tracing::error!(
                            "A task in the update library metadata job panicked: {why:#?}"
                        );
                    }
                    Ok(Err(why)) => {
                        tracing::error!(
                            "A task in the update library metadata job failed: {why:#?}"
                        );
                    }
                    _ => {}
                };

                if let Err(why) = job_svc_client
                    .update_job(UpdateJobRequest {
                        job: Some(Job {
                            name: UPDATE_EXTRA_METADATA_JOB_NAME.to_string(),
                            percent_complete,
                            ..Default::default()
                        }),
                        update_mask: Some(FieldMask {
                            paths: vec!["percent_complete".to_string()],
                        }),
                    })
                    .await
                {
                    tracing::error!("Failed to update job progress: {}", why);
                };

                completed_tasks += 1;
            }

            if let Err(why) = job_svc_client
                .update_job(UpdateJobRequest {
                    job: Some(Job {
                        name: UPDATE_EXTRA_METADATA_JOB_NAME.to_string(),
                        status: JobStatus::Complete as i32,
                        percent_complete: 100.0,
                        message: Some("Extra metadata update complete".to_string()),
                        ..Default::default()
                    }),
                    update_mask: Some(FieldMask {
                        paths: vec![
                            "status".to_string(),
                            "percent_complete".to_string(),
                            "message".to_string(),
                        ],
                    }),
                })
                .await
            {
                tracing::error!("Failed to update job status to complete: {}", why);
            };

            Ok::<(), Status>(())
        }
        .instrument(extra_metadata_update_span),
    );

    Ok(UpdateLibraryMetadataResponse {
        jobs: vec![platform_metadata_job, game_metadata_job, extra_metadata_job],
    })
}
