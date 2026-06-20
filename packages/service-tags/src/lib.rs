use std::collections::HashMap;

use retrom_codegen::retrom::services::tags::v1::{
    tags_service_server::TagsService, AddGameTagsRequest, AddGameTagsResponse,
    AddPlatformTagsRequest, AddPlatformTagsResponse, CreateTagDomainsRequest,
    CreateTagDomainsResponse, CreateTagsRequest, CreateTagsResponse, DeleteGameTagsRequest,
    DeleteGameTagsResponse, DeletePlatformTagsRequest, DeletePlatformTagsResponse,
    DeleteTagDomainsRequest, DeleteTagDomainsResponse, DeleteTagsRequest, DeleteTagsResponse,
    GetGameTagsRequest, GetGameTagsResponse, GetPlatformTagsRequest, GetPlatformTagsResponse,
    GetTagDomainsRequest, GetTagDomainsResponse, GetTagsRequest, GetTagsResponse, Tag, TagDomain,
    TagView,
};
use retrom_db::{DbPool, RetromDB};
use sqlx::Execute;
use tracing::instrument;

pub mod router;

#[derive(Clone)]
pub struct TagServiceHandlers {
    db_pool: DbPool,
}

impl TagServiceHandlers {
    pub fn new(db_pool: DbPool) -> Self {
        Self { db_pool }
    }

    async fn fetch_tags_by_ids(&self, tag_ids: &[String]) -> Result<Vec<Tag>, tonic::Status> {
        let mut builder = sqlx::QueryBuilder::new("select * from tags where id in (");

        let mut separated = builder.separated(", ");
        for id in tag_ids {
            separated.push_bind(id);
        }
        separated.push_unseparated(")");

        let tags: Vec<Tag> = builder
            .build_query_as()
            .fetch_all(&self.db_pool)
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

        Ok(tags)
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
        let ids = request.ids;

        let mut builder = sqlx::QueryBuilder::new("select * from tag_domains");

        if !ids.is_empty() {
            builder.push(" where id in (");

            let mut separated = builder.separated(", ");
            for id in ids.iter() {
                separated.push_bind(id);
            }

            separated.push_unseparated(")");
        }

        let tag_domains: Vec<TagDomain> = builder
            .build_query_as()
            .fetch_all(&self.db_pool)
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
        let to_create = request.tag_domains;

        if to_create.is_empty() {
            return Err(tonic::Status::invalid_argument(
                "At least one tag domain must be provided",
            ));
        }

        let mut builder =
            sqlx::QueryBuilder::new("insert into tag_domains (id, name, is_well_known) values ");

        for (i, domain) in to_create.iter().enumerate() {
            if i > 0 {
                builder.push(", ");
            }

            builder.push("(");
            let mut separated = builder.separated(", ");

            separated.push_bind(uuid::Uuid::now_v7().to_string());
            separated.push_bind(&domain.name);
            separated.push_bind(false);

            separated.push_unseparated(")");
        }

        builder.push(" on conflict (name) do update set name = excluded.name ");
        builder.push(" returning *");

        let tag_domains_created: Vec<TagDomain> = builder
            .build_query_as()
            .fetch_all(&self.db_pool)
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
        let ids = request.ids;

        let mut builder = sqlx::QueryBuilder::new("delete from tag_domains");

        builder.push(" where is_well_known = ");
        builder.push_bind(false);
        builder.push(" and id in (");

        let mut separated = builder.separated(", ");
        for id in ids.iter() {
            separated.push_bind(id);
        }

        separated.push_unseparated(") returning *");

        let tag_domains_deleted: Vec<TagDomain> = builder
            .build_query_as()
            .fetch_all(&self.db_pool)
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
        let ids = request.ids;
        let tag_domain_ids = request.tag_domain_ids;

        let mut builder = sqlx::QueryBuilder::new("select * from tags");

        let mut conditions = Vec::new();
        if !ids.is_empty() {
            let mut condition = sqlx::QueryBuilder::<RetromDB>::new("id in (");
            let mut separated = condition.separated(", ");
            for id in ids.iter() {
                separated.push_bind(id);
            }
            separated.push_unseparated(")");
            conditions.push(condition.build().sql().to_string());
        }

        if !tag_domain_ids.is_empty() {
            let mut condition = sqlx::QueryBuilder::<RetromDB>::new("tag_domain_id in (");
            let mut separated = condition.separated(", ");
            for id in tag_domain_ids.iter() {
                separated.push_bind(id);
            }
            separated.push_unseparated(")");
            conditions.push(condition.build().sql().to_string());
        }

        if !conditions.is_empty() {
            builder.push(" where ");
            let mut separated = builder.separated(" and ");
            for condition in conditions {
                separated.push(condition);
            }
        }

        let tags: Vec<Tag> = builder
            .build_query_as()
            .fetch_all(&self.db_pool)
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
        let to_create = request.tags;

        if to_create.is_empty() {
            return Err(tonic::Status::invalid_argument(
                "At least one tag must be provided",
            ));
        }

        let mut builder =
            sqlx::QueryBuilder::new("insert into tags (id, tag_domain_id, value) values ");

        for (i, tag) in to_create.iter().enumerate() {
            if i > 0 {
                builder.push(", ");
            }

            builder.push("(");
            let mut separated = builder.separated(", ");

            separated.push_bind(uuid::Uuid::now_v7().to_string());
            separated.push_bind(&tag.tag_domain_id);
            separated.push_bind(&tag.value);

            separated.push_unseparated(")");
        }

        builder.push(" on conflict (tag_domain_id, value) do update set value = excluded.value ");
        builder.push(" returning *");

        let tags_created: Vec<Tag> = builder
            .build_query_as()
            .fetch_all(&self.db_pool)
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
        let ids = request.ids;

        if ids.is_empty() {
            return Err(tonic::Status::invalid_argument(
                "At least one tag ID must be provided",
            ));
        }

        let mut builder = sqlx::QueryBuilder::new("delete from tags where id in (");
        let mut separated = builder.separated(", ");
        for id in ids.iter() {
            separated.push_bind(id);
        }

        separated.push_unseparated(") returning *");

        let tags_deleted: Vec<Tag> = builder
            .build_query_as()
            .fetch_all(&self.db_pool)
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

        let mut builder = sqlx::QueryBuilder::new(
            r#"
                select
                    t.*,
                from tags t
                join game_tags gt
                    on t.id = gt.tag_id
                where gt.game_id =
            "#,
        );

        builder.push_bind(game_id);

        let tags: Vec<Tag> = builder
            .build_query_as()
            .fetch_all(&self.db_pool)
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

        let mut builder = sqlx::QueryBuilder::new("select * from tag_domains where id in (");
        let mut separated = builder.separated(", ");
        for tag in tags.iter() {
            separated.push_bind(&tag.tag_domain_id);
        }

        separated.push_unseparated(")");
        let tag_domains: HashMap<String, TagDomain> = builder
            .build_query_as::<TagDomain>()
            .fetch_all(&self.db_pool)
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?
            .into_iter()
            .map(|domain| (domain.id.clone(), domain))
            .collect();

        let tag_views = tags
            .into_iter()
            .map(|tag| {
                let domain = tag_domains.get(&tag.tag_domain_id).cloned();

                TagView {
                    domain,
                    tag: Some(tag),
                }
            })
            .collect();

        Ok(tonic::Response::new(GetGameTagsResponse {
            tags: tag_views,
        }))
    }

    #[instrument(skip_all)]
    async fn add_game_tags(
        &self,
        request: tonic::Request<AddGameTagsRequest>,
    ) -> Result<tonic::Response<AddGameTagsResponse>, tonic::Status> {
        let request = request.into_inner();
        let game_id = request.game_id;
        let tags = request.tags;

        let domains = self
            .create_tag_domains(tonic::Request::new(CreateTagDomainsRequest {
                tag_domains: tags
                    .iter()
                    .filter_map(|t| t.domain.as_ref().cloned())
                    .collect(),
            }))
            .await?
            .into_inner()
            .tag_domains_created;

        let tags = self
            .create_tags(tonic::Request::new(CreateTagsRequest {
                tags: tags
                    .into_iter()
                    .filter_map(|t| {
                        let domain = domains
                            .iter()
                            .find(|d| Some(&d.name) == t.domain.as_ref().map(|d| &d.name))?;

                        t.tag.map(|mut t| {
                            t.tag_domain_id = domain.id.clone();
                            t
                        })
                    })
                    .collect(),
            }))
            .await?
            .into_inner()
            .tags_created;

        let mut builder =
            sqlx::QueryBuilder::new("insert into game_tags (game_id, tag_id) values ");

        for (i, tag) in tags.iter().enumerate() {
            if i > 0 {
                builder.push(", ");
            }

            builder.push("(");
            let mut separated = builder.separated(", ");

            separated.push_bind(&game_id);
            separated.push_bind(&tag.id);

            separated.push_unseparated(")");
        }

        builder.push(" on conflict do nothing returning tag_id");

        let inserted_ids: Vec<String> = builder
            .build_query_scalar()
            .fetch_all(&self.db_pool)
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

        let tags_added = self.fetch_tags_by_ids(&inserted_ids).await?;

        let tag_views = tags_added
            .into_iter()
            .map(|tag| {
                let domain = domains.iter().find(|d| d.id == tag.tag_domain_id).cloned();

                TagView {
                    domain,
                    tag: Some(tag),
                }
            })
            .collect();

        Ok(tonic::Response::new(AddGameTagsResponse {
            tags_added: tag_views,
        }))
    }

    #[instrument(skip_all)]
    async fn delete_game_tags(
        &self,
        request: tonic::Request<DeleteGameTagsRequest>,
    ) -> Result<tonic::Response<DeleteGameTagsResponse>, tonic::Status> {
        let request = request.into_inner();
        let game_id = request.game_id;

        let mut builder = sqlx::QueryBuilder::new("delete from game_tag where game_id = ");
        builder.push_bind(game_id);
        builder.push(" and tag_id in (");

        let mut separated = builder.separated(", ");
        for tag_id in request.tag_ids.iter() {
            separated.push_bind(tag_id);
        }

        separated.push_unseparated(") returning tag_id");

        let deleted_tag_ids: Vec<String> = builder
            .build_query_scalar()
            .fetch_all(&self.db_pool)
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

        let tags_deleted = self.fetch_tags_by_ids(&deleted_tag_ids).await?;

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

        let mut builder = sqlx::QueryBuilder::new(
            r#"
                select
                    t.*
                from tags t
                join platform_tag pt
                    on t.id = pt.tag_id
                where pt.platform_id =
            "#,
        );

        builder.push_bind(platform_id);

        let tags: Vec<Tag> = builder
            .build_query_as()
            .fetch_all(&self.db_pool)
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

        let mut builder = sqlx::QueryBuilder::new("select * from tag_domains where id in (");
        let mut separated = builder.separated(", ");
        for tag in tags.iter() {
            separated.push_bind(&tag.tag_domain_id);
        }

        separated.push_unseparated(")");
        let tag_domains: HashMap<String, TagDomain> = builder
            .build_query_as::<TagDomain>()
            .fetch_all(&self.db_pool)
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?
            .into_iter()
            .map(|domain| (domain.id.clone(), domain))
            .collect();

        let tags = tags
            .into_iter()
            .map(|tag| {
                let domain = tag_domains.get(&tag.tag_domain_id).cloned();

                TagView {
                    domain,
                    tag: Some(tag),
                }
            })
            .collect();

        Ok(tonic::Response::new(GetPlatformTagsResponse { tags }))
    }

    #[instrument(skip_all)]
    async fn add_platform_tags(
        &self,
        request: tonic::Request<AddPlatformTagsRequest>,
    ) -> Result<tonic::Response<AddPlatformTagsResponse>, tonic::Status> {
        let request = request.into_inner();
        let platform_id = request.platform_id;
        let tags = request.tags;

        if tags.is_empty() {
            return Err(tonic::Status::invalid_argument(
                "At least one tag ID must be provided",
            ));
        }

        let domains = self
            .create_tag_domains(tonic::Request::new(CreateTagDomainsRequest {
                tag_domains: tags
                    .iter()
                    .filter_map(|t| t.domain.as_ref().cloned())
                    .collect(),
            }))
            .await?
            .into_inner()
            .tag_domains_created;

        let tags = self
            .create_tags(tonic::Request::new(CreateTagsRequest {
                tags: tags
                    .into_iter()
                    .filter_map(|t| {
                        let domain = domains
                            .iter()
                            .find(|d| Some(&d.name) == t.domain.as_ref().map(|d| &d.name))?;

                        t.tag.map(|mut t| {
                            t.tag_domain_id = domain.id.clone();
                            t
                        })
                    })
                    .collect(),
            }))
            .await?
            .into_inner()
            .tags_created;

        let mut builder =
            sqlx::QueryBuilder::new("insert into platform_tag (platform_id, tag_id) values ");

        for (i, tag) in tags.iter().enumerate() {
            if i > 0 {
                builder.push(", ");
            }

            builder.push("(");
            let mut separated = builder.separated(", ");

            separated.push_bind(&platform_id);
            separated.push_bind(&tag.id);

            separated.push_unseparated(")");
        }

        builder.push(" on conflict do nothing returning tag_id");

        let inserted_ids: Vec<String> = builder
            .build_query_scalar()
            .fetch_all(&self.db_pool)
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

        let tags_added = self.fetch_tags_by_ids(&inserted_ids).await?;

        let tag_views = tags_added
            .into_iter()
            .map(|tag| {
                let domain = domains.iter().find(|d| d.id == tag.tag_domain_id).cloned();

                TagView {
                    domain,
                    tag: Some(tag),
                }
            })
            .collect();

        Ok(tonic::Response::new(AddPlatformTagsResponse {
            tags_added: tag_views,
        }))
    }

    #[instrument(skip_all)]
    async fn delete_platform_tags(
        &self,
        request: tonic::Request<DeletePlatformTagsRequest>,
    ) -> Result<tonic::Response<DeletePlatformTagsResponse>, tonic::Status> {
        let request = request.into_inner();
        let platform_id = request.platform_id;
        let tag_ids = request.tag_ids;

        if tag_ids.is_empty() {
            return Err(tonic::Status::invalid_argument(
                "At least one tag ID must be provided",
            ));
        }

        let mut builder = sqlx::QueryBuilder::new("delete from platform_tag where platform_id = ");

        builder.push_bind(platform_id);
        builder.push(" and tag_id in (");

        let mut separated = builder.separated(", ");
        for tag_id in tag_ids.iter() {
            separated.push_bind(tag_id);
        }

        separated.push_unseparated(") returning tag_id");

        let deleted_tag_ids: Vec<String> = builder
            .build_query_scalar()
            .fetch_all(&self.db_pool)
            .await
            .map_err(|e| tonic::Status::internal(e.to_string()))?;

        let tags_deleted = self.fetch_tags_by_ids(&deleted_tag_ids).await?;

        Ok(tonic::Response::new(DeletePlatformTagsResponse {
            tags_deleted,
        }))
    }
}
