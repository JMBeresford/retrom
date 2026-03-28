use diesel::{ExpressionMethods, QueryDsl, SelectableHelper};
use diesel_async::{scoped_futures::ScopedFutureExt, AsyncConnection, RunQueryDsl};
use retrom_codegen::retrom::services::tags::v1::{
    tags_service_server::{TagsService, TagsServiceServer},
    CreateTagDomainsRequest, CreateTagDomainsResponse, CreateTagsRequest, CreateTagsResponse,
    DeleteTagDomainsRequest, DeleteTagDomainsResponse, DeleteTagsRequest, DeleteTagsResponse,
    GameTagMap, GetGameTagsRequest, GetGameTagsResponse, GetPlatformTagsRequest,
    GetPlatformTagsResponse, GetTagDomainsRequest, GetTagDomainsResponse, GetTagsRequest,
    GetTagsResponse, PlatformTagMap, Tag, TagDomain, UpdateGameTagsRequest, UpdateGameTagsResponse,
    UpdatePlatformTagsRequest, UpdatePlatformTagsResponse,
};
use retrom_db::{schema, Pool};
use std::sync::Arc;
use tracing::instrument;

#[derive(Clone)]
pub struct TagServiceHandlers {
    db_pool: Arc<Pool>,
}

impl TagServiceHandlers {
    pub fn new(db_pool: Arc<Pool>) -> Self {
        Self { db_pool }
    }

    async fn fetch_tags_by_ids(
        conn: &mut retrom_db::DBConnection,
        tag_ids: &[i32],
    ) -> Result<Vec<Tag>, tonic::Status> {
        schema::tags::table
            .into_boxed()
            .select(Tag::as_select())
            .filter(schema::tags::id.eq_any(tag_ids))
            .load(conn)
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))
    }
}

#[tonic::async_trait]
impl TagsService for TagServiceHandlers {
    #[instrument(skip_all)]
    async fn get_tag_domains(
        &self,
        request: tonic::Request<GetTagDomainsRequest>,
    ) -> Result<tonic::Response<GetTagDomainsResponse>, tonic::Status> {
        let request = request.into_inner();

        let mut conn = self
            .db_pool
            .get()
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

        let mut query = schema::tag_domains::table
            .into_boxed()
            .select(TagDomain::as_select());

        if !request.ids.is_empty() {
            query = query.filter(schema::tag_domains::id.eq_any(request.ids));
        }

        let tag_domains: Vec<TagDomain> = query
            .load(&mut conn)
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

        Ok(tonic::Response::new(GetTagDomainsResponse { tag_domains }))
    }

    #[instrument(skip_all)]
    async fn create_tag_domains(
        &self,
        request: tonic::Request<CreateTagDomainsRequest>,
    ) -> Result<tonic::Response<CreateTagDomainsResponse>, tonic::Status> {
        let request = request.into_inner();

        let mut conn = self
            .db_pool
            .get()
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

        let mut tag_domains_created: Vec<TagDomain> = Vec::new();

        for domain in request.tag_domains {
            let created: TagDomain = diesel::insert_into(schema::tag_domains::table)
                .values(schema::tag_domains::name.eq(&domain.name))
                .returning(TagDomain::as_select())
                .get_result(&mut conn)
                .await
                .map_err(|e| tonic::Status::internal(e.to_string()))?;

            tag_domains_created.push(created);
        }

        Ok(tonic::Response::new(CreateTagDomainsResponse {
            tag_domains_created,
        }))
    }

    #[instrument(skip_all)]
    async fn delete_tag_domains(
        &self,
        request: tonic::Request<DeleteTagDomainsRequest>,
    ) -> Result<tonic::Response<DeleteTagDomainsResponse>, tonic::Status> {
        let request = request.into_inner();

        let mut conn = self
            .db_pool
            .get()
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

        // Reject deletion of well-known domains.
        let well_known: Vec<TagDomain> = schema::tag_domains::table
            .into_boxed()
            .select(TagDomain::as_select())
            .filter(schema::tag_domains::id.eq_any(&request.ids))
            .filter(schema::tag_domains::is_well_known.eq(true))
            .load(&mut conn)
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

        if !well_known.is_empty() {
            let names: Vec<&str> = well_known.iter().map(|d| d.name.as_str()).collect();
            return Err(tonic::Status::failed_precondition(format!(
                "Cannot delete well-known tag domains: {}",
                names.join(", ")
            )));
        }

        let tag_domains_deleted: Vec<TagDomain> = diesel::delete(schema::tag_domains::table)
            .filter(schema::tag_domains::id.eq_any(request.ids))
            .returning(TagDomain::as_select())
            .get_results(&mut conn)
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

        Ok(tonic::Response::new(DeleteTagDomainsResponse {
            tag_domains_deleted,
        }))
    }

    #[instrument(skip_all)]
    async fn get_tags(
        &self,
        request: tonic::Request<GetTagsRequest>,
    ) -> Result<tonic::Response<GetTagsResponse>, tonic::Status> {
        let request = request.into_inner();

        let mut conn = self
            .db_pool
            .get()
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

        let mut query = schema::tags::table.into_boxed().select(Tag::as_select());

        if !request.ids.is_empty() {
            query = query.filter(schema::tags::id.eq_any(request.ids));
        }

        if !request.tag_domain_ids.is_empty() {
            query = query.filter(schema::tags::tag_domain_id.eq_any(request.tag_domain_ids));
        }

        let tags: Vec<Tag> = query
            .load(&mut conn)
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

        Ok(tonic::Response::new(GetTagsResponse { tags }))
    }

    #[instrument(skip_all)]
    async fn create_tags(
        &self,
        request: tonic::Request<CreateTagsRequest>,
    ) -> Result<tonic::Response<CreateTagsResponse>, tonic::Status> {
        let request = request.into_inner();

        let mut conn = self
            .db_pool
            .get()
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

        let mut tags_created: Vec<Tag> = Vec::new();

        for tag in request.tags {
            if tag.tag_domain_id == 0 {
                return Err(tonic::Status::invalid_argument(
                    "Each tag must specify a non-zero tag_domain_id",
                ));
            }

            let created: Tag = diesel::insert_into(schema::tags::table)
                .values((
                    schema::tags::tag_domain_id.eq(tag.tag_domain_id),
                    schema::tags::value.eq(&tag.value),
                ))
                .get_result(&mut conn)
                .await
                .map_err(|e| tonic::Status::internal(e.to_string()))?;

            tags_created.push(created);
        }

        Ok(tonic::Response::new(CreateTagsResponse { tags_created }))
    }

    #[instrument(skip_all)]
    async fn delete_tags(
        &self,
        request: tonic::Request<DeleteTagsRequest>,
    ) -> Result<tonic::Response<DeleteTagsResponse>, tonic::Status> {
        let request = request.into_inner();

        let mut conn = self
            .db_pool
            .get()
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

        let tags_deleted: Vec<Tag> = diesel::delete(schema::tags::table)
            .filter(schema::tags::id.eq_any(request.ids))
            .get_results(&mut conn)
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

        Ok(tonic::Response::new(DeleteTagsResponse { tags_deleted }))
    }

    #[instrument(skip_all)]
    async fn get_game_tags(
        &self,
        request: tonic::Request<GetGameTagsRequest>,
    ) -> Result<tonic::Response<GetGameTagsResponse>, tonic::Status> {
        let request = request.into_inner();

        let mut conn = self
            .db_pool
            .get()
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

        let game_ids = request.game_ids;

        let mut query = schema::game_tag_maps::table.into_boxed().select((
            schema::game_tag_maps::game_id,
            schema::game_tag_maps::tag_id,
        ));

        if !game_ids.is_empty() {
            query = query.filter(schema::game_tag_maps::game_id.eq_any(&game_ids));
        }

        let rows: Vec<(i32, i32)> = query
            .load(&mut conn)
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

        let all_tag_ids: Vec<i32> = rows.iter().map(|(_, tag_id)| *tag_id).collect();
        let all_tags = Self::fetch_tags_by_ids(&mut conn, &all_tag_ids).await?;

        // Group tags by game_id.
        let mut map: std::collections::HashMap<i32, Vec<Tag>> = std::collections::HashMap::new();
        for (game_id, tag_id) in &rows {
            if let Some(tag) = all_tags.iter().find(|t| t.id == *tag_id) {
                map.entry(*game_id).or_default().push(tag.clone());
            }
        }

        let mut game_tag_maps: Vec<GameTagMap> = map
            .into_iter()
            .map(|(game_id, tags)| GameTagMap { game_id, tags })
            .collect();

        // Include requested game IDs even if they have no tags.
        for game_id in &game_ids {
            if !game_tag_maps.iter().any(|m| m.game_id == *game_id) {
                game_tag_maps.push(GameTagMap {
                    game_id: *game_id,
                    tags: vec![],
                });
            }
        }

        Ok(tonic::Response::new(GetGameTagsResponse { game_tag_maps }))
    }

    #[instrument(skip_all)]
    async fn update_game_tags(
        &self,
        request: tonic::Request<UpdateGameTagsRequest>,
    ) -> Result<tonic::Response<UpdateGameTagsResponse>, tonic::Status> {
        let request = request.into_inner();

        let mut conn = self
            .db_pool
            .get()
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

        let game_tag_maps_updated = conn
            .transaction(|conn| {
                async move {
                    let mut result: Vec<GameTagMap> = Vec::new();

                    for map in request.game_tag_maps {
                        let game_id = map.game_id;

                        // Replace: delete existing entries then insert the new set.
                        diesel::delete(schema::game_tag_maps::table)
                            .filter(schema::game_tag_maps::game_id.eq(game_id))
                            .execute(conn)
                            .await?;

                        for tag in &map.tags {
                            diesel::insert_into(schema::game_tag_maps::table)
                                .values((
                                    schema::game_tag_maps::game_id.eq(game_id),
                                    schema::game_tag_maps::tag_id.eq(tag.id),
                                ))
                                .execute(conn)
                                .await?;
                        }

                        result.push(GameTagMap {
                            game_id,
                            tags: map.tags,
                        });
                    }

                    Ok::<Vec<GameTagMap>, diesel::result::Error>(result)
                }
                .scope_boxed()
            })
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

        Ok(tonic::Response::new(UpdateGameTagsResponse {
            game_tag_maps_updated,
        }))
    }

    #[instrument(skip_all)]
    async fn get_platform_tags(
        &self,
        request: tonic::Request<GetPlatformTagsRequest>,
    ) -> Result<tonic::Response<GetPlatformTagsResponse>, tonic::Status> {
        let request = request.into_inner();

        let mut conn = self
            .db_pool
            .get()
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

        let platform_ids = request.platform_ids;

        let mut query = schema::platform_tag_maps::table.into_boxed().select((
            schema::platform_tag_maps::platform_id,
            schema::platform_tag_maps::tag_id,
        ));

        if !platform_ids.is_empty() {
            query = query.filter(schema::platform_tag_maps::platform_id.eq_any(&platform_ids));
        }

        let rows: Vec<(i32, i32)> = query
            .load(&mut conn)
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

        let all_tag_ids: Vec<i32> = rows.iter().map(|(_, tag_id)| *tag_id).collect();
        let all_tags = Self::fetch_tags_by_ids(&mut conn, &all_tag_ids).await?;

        // Group tags by platform_id.
        let mut map: std::collections::HashMap<i32, Vec<Tag>> = std::collections::HashMap::new();
        for (platform_id, tag_id) in &rows {
            if let Some(tag) = all_tags.iter().find(|t| t.id == *tag_id) {
                map.entry(*platform_id).or_default().push(tag.clone());
            }
        }

        let mut platform_tag_maps: Vec<PlatformTagMap> = map
            .into_iter()
            .map(|(platform_id, tags)| PlatformTagMap { platform_id, tags })
            .collect();

        // Include requested platform IDs even if they have no tags.
        for platform_id in &platform_ids {
            if !platform_tag_maps
                .iter()
                .any(|m| m.platform_id == *platform_id)
            {
                platform_tag_maps.push(PlatformTagMap {
                    platform_id: *platform_id,
                    tags: vec![],
                });
            }
        }

        Ok(tonic::Response::new(GetPlatformTagsResponse {
            platform_tag_maps,
        }))
    }

    #[instrument(skip_all)]
    async fn update_platform_tags(
        &self,
        request: tonic::Request<UpdatePlatformTagsRequest>,
    ) -> Result<tonic::Response<UpdatePlatformTagsResponse>, tonic::Status> {
        let request = request.into_inner();

        let mut conn = self
            .db_pool
            .get()
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

        let platform_tag_maps_updated = conn
            .transaction(|conn| {
                async move {
                    let mut result: Vec<PlatformTagMap> = Vec::new();

                    for map in request.platform_tag_maps {
                        let platform_id = map.platform_id;

                        // Replace: delete existing entries then insert the new set.
                        diesel::delete(schema::platform_tag_maps::table)
                            .filter(schema::platform_tag_maps::platform_id.eq(platform_id))
                            .execute(conn)
                            .await?;

                        for tag in &map.tags {
                            diesel::insert_into(schema::platform_tag_maps::table)
                                .values((
                                    schema::platform_tag_maps::platform_id.eq(platform_id),
                                    schema::platform_tag_maps::tag_id.eq(tag.id),
                                ))
                                .execute(conn)
                                .await?;
                        }

                        result.push(PlatformTagMap {
                            platform_id,
                            tags: map.tags,
                        });
                    }

                    Ok::<Vec<PlatformTagMap>, diesel::result::Error>(result)
                }
                .scope_boxed()
            })
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

        Ok(tonic::Response::new(UpdatePlatformTagsResponse {
            platform_tag_maps_updated,
        }))
    }
}

/// Build an [`axum::Router`] that serves the [`TagsService`] gRPC endpoints.
pub fn tags_router(db_pool: Arc<Pool>) -> axum::Router {
    let tag_service = TagsServiceServer::new(TagServiceHandlers::new(db_pool));

    let mut routes_builder = tonic::service::Routes::builder();
    routes_builder.add_service(tag_service);

    routes_builder.routes().into_axum_router()
}
