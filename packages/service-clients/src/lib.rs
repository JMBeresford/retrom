use retrom_codegen::retrom::services::clients::v1::{
    client_service_server::ClientService, Client, CreateClientRequest, CreateClientResponse,
    DeleteClientsRequest, DeleteClientsResponse, GetClientsRequest, GetClientsResponse,
    UpdateClientsRequest, UpdateClientsResponse,
};
use retrom_db::DbPool;
use tracing::instrument;

pub mod router;

pub struct ClientServiceHandlers {
    db_pool: DbPool,
}

impl ClientServiceHandlers {
    pub fn new(db_pool: DbPool) -> Self {
        Self { db_pool }
    }
}

#[tonic::async_trait]
impl ClientService for ClientServiceHandlers {
    #[instrument(skip_all)]
    async fn create_client(
        &self,
        request: tonic::Request<CreateClientRequest>,
    ) -> Result<tonic::Response<CreateClientResponse>, tonic::Status> {
        let request = request.into_inner();

        let new_client = match request.client {
            Some(client) => client,
            None => {
                return Err(tonic::Status::new(
                    tonic::Code::InvalidArgument,
                    "Client is required".to_string(),
                ))
            }
        };

        let mut builder = sqlx::QueryBuilder::new("insert into clients (id, name) values (");

        builder.push_bind(uuid::Uuid::now_v7().to_string());
        builder.push(", ");
        builder.push_bind(new_client.name);
        builder.push(") returning *");

        let client: Client = builder
            .build_query_as()
            .fetch_one(&self.db_pool)
            .await
            .map_err(|why| tonic::Status::new(tonic::Code::Internal, why.to_string()))?;

        tracing::debug!("Created client: {:?}", client);

        Ok(tonic::Response::new(CreateClientResponse {
            client_created: Some(client),
        }))
    }

    #[instrument(skip_all)]
    async fn get_clients(
        &self,
        request: tonic::Request<GetClientsRequest>,
    ) -> Result<tonic::Response<GetClientsResponse>, tonic::Status> {
        let request = request.into_inner();

        let ids = request.ids;
        let names = request.names;

        let mut builder = sqlx::QueryBuilder::new("select * from clients");

        if !ids.is_empty() {
            builder.push(" where id in (");

            let mut separated = builder.separated(", ");

            for id in ids.iter() {
                separated.push_bind(id);
            }

            separated.push_unseparated(")");
        }

        if !names.is_empty() {
            if ids.is_empty() {
                builder.push(" where ");
            } else {
                builder.push(" or ");
            }

            builder.push("name in (");

            let mut separated = builder.separated(", ");

            for name in names.iter() {
                separated.push_bind(name);
            }

            separated.push_unseparated(")");
        }

        let clients: Vec<Client> = builder
            .build_query_as()
            .fetch_all(&self.db_pool)
            .await
            .map_err(|why| {
                tonic::Status::new(
                    tonic::Code::Internal,
                    format!("Failed to fetch clients: {}", why),
                )
            })?;

        tracing::debug!("Fetched clients: {:?}", clients);

        Ok(tonic::Response::new(GetClientsResponse { clients }))
    }

    #[instrument(skip_all)]
    async fn update_clients(
        &self,
        request: tonic::Request<UpdateClientsRequest>,
    ) -> Result<tonic::Response<UpdateClientsResponse>, tonic::Status> {
        let request = request.into_inner();

        let to_update = request.clients;

        let mut tx = self.db_pool.begin().await.map_err(|why| {
            tonic::Status::new(
                tonic::Code::Internal,
                format!("Failed to begin transaction: {}", why),
            )
        })?;

        let mut clients_updated = Vec::new();

        for client in to_update {
            let updated_client: Client = match sqlx::query_as(
                r#"
                update clients
                set name = $1
                where id = $2
                returning *
                "#,
            )
            .bind(client.name)
            .bind(client.id)
            .fetch_one(&mut *tx)
            .await
            {
                Ok(client) => client,
                Err(why) => {
                    tx.rollback().await.map_err(|rollback_why| {
                        tonic::Status::new(
                            tonic::Code::Internal,
                            format!(
                                "Failed to rollback transaction after error: {}, original error: {}",
                                rollback_why, why
                            ),
                        )
                    })?;

                    return Err(tonic::Status::new(
                        tonic::Code::Internal,
                        format!("Failed to update client: {}", why),
                    ));
                }
            };

            clients_updated.push(updated_client);
        }

        tx.commit().await.map_err(|why| {
            tonic::Status::new(
                tonic::Code::Internal,
                format!("Failed to commit transaction: {}", why),
            )
        })?;

        Ok(tonic::Response::new(UpdateClientsResponse {
            clients_updated,
        }))
    }

    #[instrument(skip_all)]
    async fn delete_clients(
        &self,
        request: tonic::Request<DeleteClientsRequest>,
    ) -> Result<tonic::Response<DeleteClientsResponse>, tonic::Status> {
        let request = request.into_inner();
        let ids = request.ids;

        if ids.is_empty() {
            return Err(tonic::Status::new(
                tonic::Code::InvalidArgument,
                "At least one client ID is required".to_string(),
            ));
        }

        let mut builder = sqlx::QueryBuilder::new("delete from clients where id in (");

        let mut separated = builder.separated(", ");
        for id in ids.iter() {
            separated.push_bind(id);
        }
        separated.push_unseparated(") returning *");

        let clients_deleted: Vec<Client> = builder
            .build_query_as()
            .fetch_all(&self.db_pool)
            .await
            .map_err(|why| {
                tonic::Status::new(
                    tonic::Code::Internal,
                    format!("Failed to delete clients: {}", why),
                )
            })?;

        Ok(tonic::Response::new(DeleteClientsResponse {
            clients_deleted,
        }))
    }
}
