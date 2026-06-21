//! Library metadata refresh, backed by sqlx + the v2 schema.
//!
//! Orchestrates manual, IGDB, and Steam metadata for every platform and game in the
//! database. IGDB and Steam lookups are delegated to the metadata service via the gRPC
//! clients carried on [`LibraryServiceHandlers`] (`igdb_svc_client`, `steam_svc_client`);
//! all persistence is performed locally with [`sqlx::QueryBuilder`].

use crate::LibraryServiceHandlers;
use retrom_codegen::retrom::services::{
    jobs::v1::JobStatus,
    library::v1::{UpdateLibraryMetadataRequest, UpdateLibraryMetadataResponse},
    metadata::v1::{DownloadGameMetadataRequest, DownloadPlatformMetadataRequest},
};
use sqlx::QueryBuilder;
use tonic::{Request, Status};
use tracing::Instrument;

pub async fn update_library_metadata(
    state: &LibraryServiceHandlers,
    request: Request<UpdateLibraryMetadataRequest>,
) -> Result<UpdateLibraryMetadataResponse, Status> {
    let request = request.into_inner();
    let _overwrite = request.overwrite();

    let platform_metadata_job = state
        .job_manager
        .create_job(
            "Updating Platform Metadata".to_string(),
            "Discovering and updating metadata for all platforms".to_string(),
        )
        .await;

    let game_metadata_job = state
        .job_manager
        .create_job(
            "Updating Game Metadata".to_string(),
            "Discovering and updating metadata for all games".to_string(),
        )
        .await;

    let extra_metadata_job = state
        .job_manager
        .create_job(
            "Updating Extra Metadata".to_string(),
            "Discovering and updating extra metadata for all library entries".to_string(),
        )
        .await;

    let db_pool = state.db_pool.clone();
    let platform_metadata_job_id = platform_metadata_job.id.clone();
    let extra_metadata_job_id = extra_metadata_job.id.clone();
    let metadata_svc = state.metadata_svc_client.clone();
    let job_manager = state.job_manager.clone();

    tokio::spawn(
        async move {
            job_manager
                .update_job(
                    &platform_metadata_job_id,
                    Some(0.0),
                    Some(JobStatus::Running),
                    None,
                )
                .await
                .map_err(|why| Status::internal(why.to_string()))?;

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
                tasks.spawn(
                    async move {
                        metadata_svc
                            .download_platform_metadata(DownloadPlatformMetadataRequest {
                                platform_id,
                            })
                            .await
                            .map_err(|why| Status::internal(why.to_string()))?;

                        Ok::<(), Status>(())
                    }
                    .in_current_span(),
                );
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

                job_manager
                    .update_job(
                        &platform_metadata_job_id,
                        Some(percent_complete),
                        if join_result.is_err() {
                            Some(JobStatus::Failed)
                        } else {
                            None
                        },
                        None,
                    )
                    .await
                    .map_err(|why| Status::internal(why.to_string()))?;

                completed_tasks += 1;
            }

            job_manager
                .update_job(
                    &platform_metadata_job_id,
                    Some(100.0),
                    Some(JobStatus::Complete),
                    None,
                )
                .await
                .map_err(|why| Status::internal(why.to_string()))?;

            Ok::<_, Status>(())
        }
        .instrument(tracing::info_span!("update_platform_metadata_job")),
    );

    let db_pool = state.db_pool.clone();
    let job_manager = state.job_manager.clone();
    let platform_metadata_job_id = platform_metadata_job.id.clone();
    let game_metadata_job_id = game_metadata_job.id.clone();
    let metadata_svc = state.metadata_svc_client.clone();

    tokio::spawn(
        async move {
            let mut sub = job_manager.subscribe(platform_metadata_job_id);

            while let Ok(update) = sub.recv().await {
                if update.status() == JobStatus::Complete {
                    break;
                }
            }

            job_manager
                .update_job(
                    &game_metadata_job_id,
                    Some(0.0),
                    Some(JobStatus::Running),
                    None,
                )
                .await
                .map_err(|why| Status::internal(why.to_string()))?;

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

                tasks.spawn(
                    async move {
                        metadata_svc
                            .download_game_metadata(DownloadGameMetadataRequest { game_id })
                            .await
                            .map_err(|why| Status::internal(why.to_string()))?;

                        Ok::<(), Status>(())
                    }
                    .in_current_span(),
                );
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

                job_manager
                    .update_job(
                        &game_metadata_job_id,
                        Some(percent_complete),
                        if join_result.is_err() {
                            Some(JobStatus::Failed)
                        } else {
                            None
                        },
                        None,
                    )
                    .await
                    .map_err(|why| Status::internal(why.to_string()))?;

                completed_tasks += 1;
            }

            job_manager
                .update_job(
                    &game_metadata_job_id,
                    Some(100.0),
                    Some(JobStatus::Complete),
                    None,
                )
                .await
                .map_err(|why| Status::internal(why.to_string()))?;

            Ok::<_, Status>(())
        }
        .instrument(tracing::info_span!("update_game_metadata_job")),
    );

    let job_manager = state.job_manager.clone();
    let db_pool = state.db_pool.clone();
    tokio::spawn(
        async move {
            job_manager
                .update_job(
                    &extra_metadata_job_id,
                    Some(0.0),
                    Some(JobStatus::Running),
                    None,
                )
                .await
                .map_err(|why| Status::internal(why.to_string()))?;

            let all_game_ids: Vec<String> = QueryBuilder::new("select id from games")
                .build_query_scalar()
                .fetch_all(&db_pool)
                .await
                .map_err(|why| Status::internal(why.to_string()))?;

            let mut tasks = tokio::task::JoinSet::new();
            all_game_ids.into_iter().for_each(|game_id| {
                let db_pool = db_pool.clone();

                tasks.spawn(
                    async move {
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

                        let mut insert_builder = QueryBuilder::new(
                            "insert into similar_games (game_id, similar_game_id) ",
                        );

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
                    }
                    .in_current_span(),
                );
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

                job_manager
                    .update_job(
                        &extra_metadata_job_id,
                        Some(percent_complete),
                        if join_result.is_err() {
                            Some(JobStatus::Failed)
                        } else {
                            None
                        },
                        None,
                    )
                    .await
                    .map_err(|why| Status::internal(why.to_string()))?;

                completed_tasks += 1;
            }

            job_manager
                .update_job(
                    &extra_metadata_job_id,
                    Some(100.0),
                    Some(JobStatus::Complete),
                    None,
                )
                .await
                .map_err(|why| Status::internal(why.to_string()))?;

            Ok::<(), Status>(())
        }
        .instrument(tracing::info_span!("update_extra_metadata_job")),
    );

    Ok(UpdateLibraryMetadataResponse {
        platform_metadata_job_id: platform_metadata_job.id,
        game_metadata_job_id: game_metadata_job.id,
        extra_metadata_job_id: extra_metadata_job.id,
    })
}
