use diesel::{ExpressionMethods, QueryDsl, SelectableHelper};
use diesel_async::{scoped_futures::ScopedFutureExt, AsyncConnection, RunQueryDsl};
use retrom_codegen::retrom::services::tags::v1::{
    tags_service_server::{TagsService, TagsServiceServer},
    AddGameTagsRequest, AddGameTagsResponse, AddPlatformTagsRequest, AddPlatformTagsResponse,
    CreateTagDomainsRequest, CreateTagDomainsResponse, CreateTagsRequest, CreateTagsResponse,
    DeleteGameTagsRequest, DeleteGameTagsResponse, DeletePlatformTagsRequest,
    DeletePlatformTagsResponse, DeleteTagDomainsRequest, DeleteTagDomainsResponse,
    DeleteTagsRequest, DeleteTagsResponse, GetGameTagsRequest, GetGameTagsResponse,
    GetPlatformTagsRequest, GetPlatformTagsResponse, GetTagDomainsRequest, GetTagDomainsResponse,
    GetTagsRequest, GetTagsResponse, Tag, TagDomain,
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

        let values: Vec<_> = request
            .tag_domains
            .iter()
            .map(|d| schema::tag_domains::name.eq(&d.name))
            .collect();

        let tag_domains_created: Vec<TagDomain> = diesel::insert_into(schema::tag_domains::table)
            .values(&values)
            .returning(TagDomain::as_select())
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

        if request.tags.iter().any(|t| t.tag_domain_id == 0) {
            return Err(tonic::Status::invalid_argument(
                "Each tag must specify a non-zero tag_domain_id",
            ));
        }

        let mut conn = self
            .db_pool
            .get()
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

        let values: Vec<_> = request
            .tags
            .iter()
            .map(|t| {
                (
                    schema::tags::tag_domain_id.eq(t.tag_domain_id),
                    schema::tags::value.eq(&t.value),
                )
            })
            .collect();

        let tags_created: Vec<Tag> = diesel::insert_into(schema::tags::table)
            .values(&values)
            .returning(Tag::as_select())
            .get_results(&mut conn)
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

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
        let game_id = request.into_inner().game_id;

        let mut conn = self
            .db_pool
            .get()
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

        let tag_ids: Vec<i32> = schema::game_tag_maps::table
            .select(schema::game_tag_maps::tag_id)
            .filter(schema::game_tag_maps::game_id.eq(game_id))
            .load(&mut conn)
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

        let tags = Self::fetch_tags_by_ids(&mut conn, &tag_ids).await?;

        Ok(tonic::Response::new(GetGameTagsResponse { tags }))
    }

    #[instrument(skip_all)]
    async fn add_game_tags(
        &self,
        request: tonic::Request<AddGameTagsRequest>,
    ) -> Result<tonic::Response<AddGameTagsResponse>, tonic::Status> {
        let request = request.into_inner();
        let game_id = request.game_id;

        let mut conn = self
            .db_pool
            .get()
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

        let values: Vec<_> = request
            .tag_ids
            .iter()
            .map(|&tag_id| {
                (
                    schema::game_tag_maps::game_id.eq(game_id),
                    schema::game_tag_maps::tag_id.eq(tag_id),
                )
            })
            .collect();

        conn.transaction(|conn| {
            let values = values.clone();
            async move {
                diesel::insert_into(schema::game_tag_maps::table)
                    .values(&values)
                    .on_conflict_do_nothing()
                    .execute(conn)
                    .await
            }
            .scope_boxed()
        })
        .await
        .map_err(|e| tonic::Status::internal(e.to_string()))?;

        let tags_added = Self::fetch_tags_by_ids(&mut conn, &request.tag_ids).await?;

        Ok(tonic::Response::new(AddGameTagsResponse { tags_added }))
    }

    #[instrument(skip_all)]
    async fn delete_game_tags(
        &self,
        request: tonic::Request<DeleteGameTagsRequest>,
    ) -> Result<tonic::Response<DeleteGameTagsResponse>, tonic::Status> {
        let request = request.into_inner();
        let game_id = request.game_id;

        let mut conn = self
            .db_pool
            .get()
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

        let tags_deleted = Self::fetch_tags_by_ids(&mut conn, &request.tag_ids).await?;

        diesel::delete(schema::game_tag_maps::table)
            .filter(schema::game_tag_maps::game_id.eq(game_id))
            .filter(schema::game_tag_maps::tag_id.eq_any(&request.tag_ids))
            .execute(&mut conn)
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

        Ok(tonic::Response::new(DeleteGameTagsResponse {
            tags_deleted,
        }))
    }

    #[instrument(skip_all)]
    async fn get_platform_tags(
        &self,
        request: tonic::Request<GetPlatformTagsRequest>,
    ) -> Result<tonic::Response<GetPlatformTagsResponse>, tonic::Status> {
        let platform_id = request.into_inner().platform_id;

        let mut conn = self
            .db_pool
            .get()
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

        let tag_ids: Vec<i32> = schema::platform_tag_maps::table
            .select(schema::platform_tag_maps::tag_id)
            .filter(schema::platform_tag_maps::platform_id.eq(platform_id))
            .load(&mut conn)
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

        let tags = Self::fetch_tags_by_ids(&mut conn, &tag_ids).await?;

        Ok(tonic::Response::new(GetPlatformTagsResponse { tags }))
    }

    #[instrument(skip_all)]
    async fn add_platform_tags(
        &self,
        request: tonic::Request<AddPlatformTagsRequest>,
    ) -> Result<tonic::Response<AddPlatformTagsResponse>, tonic::Status> {
        let request = request.into_inner();
        let platform_id = request.platform_id;

        let mut conn = self
            .db_pool
            .get()
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

        let values: Vec<_> = request
            .tag_ids
            .iter()
            .map(|&tag_id| {
                (
                    schema::platform_tag_maps::platform_id.eq(platform_id),
                    schema::platform_tag_maps::tag_id.eq(tag_id),
                )
            })
            .collect();

        conn.transaction(|conn| {
            let values = values.clone();
            async move {
                diesel::insert_into(schema::platform_tag_maps::table)
                    .values(&values)
                    .on_conflict_do_nothing()
                    .execute(conn)
                    .await
            }
            .scope_boxed()
        })
        .await
        .map_err(|e| tonic::Status::internal(e.to_string()))?;

        let tags_added = Self::fetch_tags_by_ids(&mut conn, &request.tag_ids).await?;

        Ok(tonic::Response::new(AddPlatformTagsResponse { tags_added }))
    }

    #[instrument(skip_all)]
    async fn delete_platform_tags(
        &self,
        request: tonic::Request<DeletePlatformTagsRequest>,
    ) -> Result<tonic::Response<DeletePlatformTagsResponse>, tonic::Status> {
        let request = request.into_inner();
        let platform_id = request.platform_id;

        let mut conn = self
            .db_pool
            .get()
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

        let tags_deleted = Self::fetch_tags_by_ids(&mut conn, &request.tag_ids).await?;

        diesel::delete(schema::platform_tag_maps::table)
            .filter(schema::platform_tag_maps::platform_id.eq(platform_id))
            .filter(schema::platform_tag_maps::tag_id.eq_any(&request.tag_ids))
            .execute(&mut conn)
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

        Ok(tonic::Response::new(DeletePlatformTagsResponse {
            tags_deleted,
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
