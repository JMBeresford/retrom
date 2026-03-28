use diesel::{ExpressionMethods, QueryDsl, SelectableHelper};
use diesel_async::{scoped_futures::ScopedFutureExt, AsyncConnection, RunQueryDsl};
use retrom_codegen::retrom::services::tags::v1::{
    tag_service_server::{TagService, TagServiceServer},
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

/// Well-known tag domain names seeded idempotently at startup.
const WELL_KNOWN_DOMAINS: [&str; 4] = ["genre", "favorites", "franchise", "region"];

/// Local DB struct for the `tags` table (the proto `Tag` has a nested `TagDomain`
/// which does not match the flat DB row, so we use a dedicated struct here).
#[derive(diesel::Queryable, diesel::Selectable, diesel::Identifiable)]
#[diesel(table_name = retrom_db::schema::tags, check_for_backend(diesel::pg::Pg))]
struct DbTag {
    pub id: i32,
    pub tag_domain_id: i32,
    pub value: String,
    pub created_at: Option<retrom_codegen::timestamp::Timestamp>,
    pub updated_at: Option<retrom_codegen::timestamp::Timestamp>,
}

/// Insertable struct for the `tags` table.
#[derive(diesel::Insertable)]
#[diesel(table_name = retrom_db::schema::tags, check_for_backend(diesel::pg::Pg))]
struct NewDbTag {
    pub tag_domain_id: i32,
    pub value: String,
}

/// Insertable struct for the `tag_domains` table (custom, non-well-known domains).
#[derive(diesel::Insertable)]
#[diesel(table_name = retrom_db::schema::tag_domains, check_for_backend(diesel::pg::Pg))]
struct NewTagDomain {
    pub name: String,
    pub is_well_known: bool,
}

/// Insertable struct for `game_tag_maps`.
#[derive(diesel::Insertable)]
#[diesel(table_name = retrom_db::schema::game_tag_maps, check_for_backend(diesel::pg::Pg))]
struct NewGameTagMap {
    pub game_id: i32,
    pub tag_id: i32,
}

/// Insertable struct for `platform_tag_maps`.
#[derive(diesel::Insertable)]
#[diesel(table_name = retrom_db::schema::platform_tag_maps, check_for_backend(diesel::pg::Pg))]
struct NewPlatformTagMap {
    pub platform_id: i32,
    pub tag_id: i32,
}

#[derive(Clone)]
pub struct TagServiceHandlers {
    db_pool: Arc<Pool>,
}

impl TagServiceHandlers {
    pub fn new(db_pool: Arc<Pool>) -> Self {
        Self { db_pool }
    }

    /// Seed well-known tag domains idempotently. This should be called once at startup.
    pub async fn seed_well_known_domains(&self) -> Result<(), String> {
        let mut conn = self.db_pool.get().await.map_err(|e| e.to_string())?;

        conn.transaction(|conn| {
            async move {
                for name in WELL_KNOWN_DOMAINS {
                    diesel::insert_into(schema::tag_domains::table)
                        .values(NewTagDomain {
                            name: name.to_string(),
                            is_well_known: true,
                        })
                        .on_conflict(schema::tag_domains::name)
                        .do_nothing()
                        .execute(conn)
                        .await?;
                }
                Ok::<(), diesel::result::Error>(())
            }
            .scope_boxed()
        })
        .await
        .map_err(|e| e.to_string())
    }

    /// Fetch tags by their IDs, joining with `tag_domains` to build proto `Tag` messages.
    async fn fetch_tags_by_ids(
        conn: &mut retrom_db::DBConnection,
        tag_ids: &[i32],
    ) -> Result<Vec<Tag>, tonic::Status> {
        let db_tags: Vec<DbTag> = schema::tags::table
            .into_boxed()
            .select(DbTag::as_select())
            .filter(schema::tags::id.eq_any(tag_ids))
            .load(conn)
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

        Self::db_tags_to_proto(conn, db_tags).await
    }

    /// Convert `DbTag` rows into proto `Tag` messages by fetching the associated domains.
    async fn db_tags_to_proto(
        conn: &mut retrom_db::DBConnection,
        db_tags: Vec<DbTag>,
    ) -> Result<Vec<Tag>, tonic::Status> {
        let domain_ids: Vec<i32> = db_tags.iter().map(|t| t.tag_domain_id).collect();

        let domains: Vec<TagDomain> = schema::tag_domains::table
            .into_boxed()
            .select(TagDomain::as_select())
            .filter(schema::tag_domains::id.eq_any(&domain_ids))
            .load(conn)
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

        let tags = db_tags
            .into_iter()
            .map(|t| {
                let domain = domains.iter().find(|d| d.id == t.tag_domain_id).cloned();
                Tag {
                    id: t.id,
                    domain,
                    value: t.value,
                    created_at: t.created_at,
                    updated_at: t.updated_at,
                }
            })
            .collect();

        Ok(tags)
    }
}

#[tonic::async_trait]
impl TagService for TagServiceHandlers {
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

        let new_domains: Vec<NewTagDomain> = request
            .tag_domains
            .into_iter()
            .map(|d| NewTagDomain {
                name: d.name,
                is_well_known: false,
            })
            .collect();

        let tag_domains_created: Vec<TagDomain> = diesel::insert_into(schema::tag_domains::table)
            .values(&new_domains)
            .get_results(&mut conn)
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

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

        let mut query = schema::tags::table.into_boxed().select(DbTag::as_select());

        if !request.ids.is_empty() {
            query = query.filter(schema::tags::id.eq_any(request.ids));
        }

        if !request.tag_domain_ids.is_empty() {
            query = query.filter(schema::tags::tag_domain_id.eq_any(request.tag_domain_ids));
        }

        let db_tags: Vec<DbTag> = query
            .load(&mut conn)
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

        let tags = Self::db_tags_to_proto(&mut conn, db_tags).await?;

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

        let new_tags: Result<Vec<NewDbTag>, tonic::Status> = request
            .tags
            .into_iter()
            .map(|t| {
                let tag_domain_id = t
                    .domain
                    .ok_or_else(|| {
                        tonic::Status::invalid_argument(
                            "Each tag must specify a domain with a valid id",
                        )
                    })?
                    .id;
                Ok(NewDbTag {
                    tag_domain_id,
                    value: t.value,
                })
            })
            .collect();

        let new_tags = new_tags?;

        let created_db_tags: Vec<DbTag> = diesel::insert_into(schema::tags::table)
            .values(&new_tags)
            .get_results(&mut conn)
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

        let tags_created = Self::db_tags_to_proto(&mut conn, created_db_tags).await?;

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

        let deleted_db_tags: Vec<DbTag> = diesel::delete(schema::tags::table)
            .filter(schema::tags::id.eq_any(request.ids))
            .get_results(&mut conn)
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

        let tags_deleted = Self::db_tags_to_proto(&mut conn, deleted_db_tags).await?;

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

                        let new_maps: Vec<NewGameTagMap> = map
                            .tags
                            .iter()
                            .map(|t| NewGameTagMap {
                                game_id,
                                tag_id: t.id,
                            })
                            .collect();

                        if !new_maps.is_empty() {
                            diesel::insert_into(schema::game_tag_maps::table)
                                .values(&new_maps)
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

                        let new_maps: Vec<NewPlatformTagMap> = map
                            .tags
                            .iter()
                            .map(|t| NewPlatformTagMap {
                                platform_id,
                                tag_id: t.id,
                            })
                            .collect();

                        if !new_maps.is_empty() {
                            diesel::insert_into(schema::platform_tag_maps::table)
                                .values(&new_maps)
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

/// Build an [`axum::Router`] that serves the [`TagService`] gRPC endpoints.
pub fn tags_router(db_pool: Arc<Pool>) -> axum::Router {
    let tag_service = TagServiceServer::new(TagServiceHandlers::new(db_pool));

    let mut routes_builder = tonic::service::Routes::builder();
    routes_builder.add_service(tag_service);

    routes_builder.routes().into_axum_router()
}
