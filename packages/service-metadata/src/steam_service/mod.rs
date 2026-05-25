use retrom_codegen::retrom::services::metadata::v1::steam_service_server::SteamService;
use retrom_db::DbPool;

pub mod router;

#[derive(Clone)]
pub struct SteamServiceHandlers {
    pub db_pool: DbPool,
    pub steam_provider: Arc<SteamWebApiProvider>,
}

#[tonic::async_trait]
impl SteamService for SteamServiceHandlers {
    #[tracing::instrument(level = Level::DEBUG, skip_all)]
    async fn sync_steam_metadata(
        &self,
        request: Request<SyncSteamMetadataRequest>,
    ) -> Result<Response<SyncSteamMetadataResponse>, Status> {
        let request = request.into_inner();
        let selectors = request.selectors;

        let steam_provider = self.steam_provider.clone();
        let pool = self.db_pool.clone();

        let game_ids = selectors.iter().map(|s| s.game_id).collect::<Vec<_>>();

        let mut conn = pool
            .get()
            .await
            .map_err(|why| Status::internal(why.to_string()))?;

        let games: Vec<retrom::Game> = match schema::games::table
            .filter(schema::games::id.eq_any(&game_ids))
            .filter(schema::games::steam_app_id.is_not_null())
            .load(&mut conn)
            .await
        {
            Ok(games) => games,
            Err(why) => {
                return Err(Status::internal(why.to_string()));
            }
        };

        drop(conn);

        let steam_games = Arc::new(RwLock::new(
            steam_provider
                .get_owned_games()
                .await
                .map_err(|why| {
                    error!("Failed to fetch owned games from Steam: {}", why);
                    Status::internal(why.to_string())
                })?
                .response
                .games,
        ));

        let tasks = games
            .into_iter()
            .map(|game| {
                let pool = pool.clone();
                let steam_games = steam_games.clone();

                async move {
                    if let Some(steam_game) = steam_games
                        .read()
                        .await
                        .iter()
                        .find(|g| g.appid == game.steam_app_id() as u32)
                    {
                        let last_played = if steam_game.rtime_last_played > 0 {
                            let dt = DateTime::from_timestamp(steam_game.rtime_last_played, 0);

                            dt.map(|dt| Timestamp {
                                seconds: dt.timestamp(),
                                nanos: 0,
                            })
                        } else {
                            None
                        };

                        let minutes_played = if steam_game.playtime_forever > 0 {
                            Some(steam_game.playtime_forever)
                        } else {
                            None
                        };

                        let updated_meta = UpdatedGameMetadata {
                            last_played,
                            minutes_played,
                            ..Default::default()
                        };

                        let mut conn = match pool.get().await {
                            Ok(conn) => conn,
                            Err(why) => {
                                return Err(Status::internal(why.to_string()));
                            }
                        };

                        diesel::update(schema::game_metadata::table)
                            .filter(schema::game_metadata::game_id.eq(game.id))
                            .set(&updated_meta)
                            .execute(&mut conn)
                            .await
                            .map_err(|why| Status::internal(why.to_string()))?;

                        Ok(Some(updated_meta))
                    } else {
                        Ok(None)
                    }
                }
                .instrument(tracing::info_span!("steam_sync_thread"))
            })
            .collect::<Vec<_>>();

        let res = join_all(tasks).await.into_iter().collect::<Vec<_>>();

        res.iter().for_each(|result| {
            if let Err(e) = result {
                tracing::warn!("Failed to update game metadata: {:?}", e);
            }
        });

        Ok(Response::new(SyncSteamMetadataResponse {}))
    }
}
