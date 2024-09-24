use retrom_codegen::retrom::{UpdateLibraryRequest, UpdateLibraryResponse};
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

            content_dir
                .resolve_platforms()
                .into_iter()
                .map(move |platform_resolver| {
                    let db_pool = db_pool.clone();

                    async move {
                        let resolved_platform =
                            match platform_resolver.resolve(db_pool.clone()).await {
                                Ok(platform) => platform,
                                Err(why) => {
                                    warn!("Failed to resolve platform: {}", why);
                                    return;
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
                    }
                })
        })
        .collect();

    if tasks.is_empty() {
        return Err(Status::internal("No content directories found"));
    }

    let job_id = state
        .job_manager
        .spawn("Update Library", tasks, None)
        .await
        .into();

    Ok(UpdateLibraryResponse { job_id })
}
