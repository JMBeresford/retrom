use bigdecimal::ToPrimitive;
use diesel::{ExpressionMethods, QueryDsl};
use diesel_async::RunQueryDsl;
use retrom_codegen::retrom::{NewGame, StorageType, UpdateLibraryRequest, UpdateLibraryResponse};
use retrom_db::schema::{self};
use tonic::{Request, Status};
use tracing::warn;

use super::{
    content_resolver::ContentResolver, game_resolver::ResolvedGame, LibraryServiceHandlers,
};

#[tracing::instrument(skip_all)]
pub(super) async fn update_library(
    state: &LibraryServiceHandlers,
    _request: Request<UpdateLibraryRequest>,
) -> Result<UpdateLibraryResponse, Status> {
    let content_dirs = state.config.content_directories.clone();
    let db_pool = state.db_pool.clone();

    let tasks: Vec<_> = content_dirs
        .into_iter()
        .map(ContentResolver::from_content_dir)
        .flat_map(|content_dir| {
            let db_pool = db_pool.clone();

            let platform_resolvers = match content_dir.resolve_platforms() {
                Ok(platform_resolvers) => platform_resolvers,
                Err(why) => {
                    warn!("Failed to resolve platforms: {}", why);
                    Vec::new()
                }
            };

            platform_resolvers
                .into_iter()
                .map(move |platform_resolver| {
                    let db_pool = db_pool.clone();

                    async move {
                        let resolved_platform =
                            match platform_resolver.resolve(db_pool.clone()).await {
                                Ok(platform) => platform,
                                Err(why) => {
                                    return Err(why.to_string());
                                }
                            };

                        let game_resolvers = resolved_platform.get_game_resolvers();
                        let mut game_join_set = tokio::task::JoinSet::new();

                        game_resolvers.into_iter().for_each(|game_resolver| {
                            let db_pool = db_pool.clone();
                            game_join_set
                                .spawn(async move { game_resolver.resolve(db_pool.clone()).await });
                        });

                        let resolved_games: Vec<ResolvedGame> = game_join_set
                            .join_all()
                            .await
                            .into_iter()
                            .filter_map(|handle| match handle {
                                Ok(game) => Some(game),
                                Err(why) => {
                                    warn!("Failed to resolve game: {}", why);
                                    None
                                }
                            })
                            .collect();

                        let mut file_join_set = tokio::task::JoinSet::new();

                        resolved_games.into_iter().for_each(|resolved_game| {
                            let db_pool = db_pool.clone();
                            file_join_set.spawn(async move {
                                resolved_game.resolve_files(db_pool.clone()).await
                            });
                        });

                        file_join_set.join_all().await;

                        Ok(())
                    }
                })
        })
        .collect();

    let steam_provider = state.steam_web_api_client.clone();
    let steam_library_res = if let Some(steam_provider) = steam_provider.as_ref() {
        Some(steam_provider.get_owned_games().await.ok()).flatten()
    } else {
        None
    };

    let steam_tasks: Vec<_> = if let Some(steam_library_res) = steam_library_res {
        let db_pool = db_pool.clone();
        let mut conn = db_pool.get().await.unwrap();

        let steam_platform_id: i32 = schema::platforms::table
            .select(schema::platforms::id)
            .filter(schema::platforms::path.eq("__RETROM_RESERVED__/Steam"))
            .first(&mut conn)
            .await
            .expect("Could not fetch Steam platform ID");

        steam_library_res
            .response
            .games
            .into_iter()
            .map(|game| {
                let db_pool = db_pool.clone();

                async move {
                    let mut conn = db_pool.get().await.unwrap();

                    let new_game = NewGame {
                        platform_id: Some(steam_platform_id),
                        path: game.name,
                        third_party: Some(true),
                        steam_app_id: game.appid.to_i64(),
                        storage_type: Some(StorageType::SingleFileGame.into()),
                        ..Default::default()
                    };

                    if new_game.steam_app_id.is_none() {
                        tracing::warn!("Game {} has no parsable Steam App ID", new_game.path);
                        return Ok(());
                    }

                    diesel::insert_into(schema::games::table)
                        .values(&new_game)
                        .on_conflict_do_nothing()
                        .execute(&mut conn)
                        .await?;

                    Ok::<(), diesel::result::Error>(())
                }
            })
            .collect()
    } else {
        Vec::new()
    };

    let mut job_ids = vec![];

    if !tasks.is_empty() {
        let job_id = state
            .job_manager
            .spawn("Update Library", tasks, None)
            .await
            .into();

        job_ids.push(job_id);
    }

    if !steam_tasks.is_empty() {
        let job_id = state
            .job_manager
            .spawn("Update Steam Library", steam_tasks, None)
            .await
            .into();

        job_ids.push(job_id);
    }

    if job_ids.is_empty() {
        return Err(Status::internal("No library content found"));
    }

    Ok(UpdateLibraryResponse { job_ids })
}
