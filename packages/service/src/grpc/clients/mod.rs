use diesel::{ExpressionMethods, QueryDsl, SelectableHelper};
use diesel_async::{scoped_futures::ScopedFutureExt, AsyncConnection, RunQueryDsl};
use retrom_codegen::retrom::{
    client_service_server::ClientService, Client, CreateClientRequest, CreateClientResponse,
    DeleteClientsRequest, DeleteClientsResponse, GetClientsRequest, GetClientsResponse,
    UpdateClientsRequest, UpdateClientsResponse,
};
use std::sync::Arc;

use retrom_db::{schema, Pool};

pub struct ClientServiceHandlers {
    db_pool: Arc<Pool>,
}

impl ClientServiceHandlers {
    pub fn new(db_pool: Arc<Pool>) -> Self {
        Self { db_pool }
    }
}

#[tonic::async_trait]
impl ClientService for ClientServiceHandlers {
    async fn create_client(
        &self,
        request: tonic::Request<CreateClientRequest>,
    ) -> Result<tonic::Response<CreateClientResponse>, tonic::Status> {
        let request = request.into_inner();

        let mut conn = match self.db_pool.get().await {
            Ok(conn) => conn,
            Err(why) => return Err(tonic::Status::new(tonic::Code::Internal, why.to_string())),
        };

        let new_client = match request.client {
            Some(client) => client,
            None => {
                return Err(tonic::Status::new(
                    tonic::Code::InvalidArgument,
                    "Client is required".to_string(),
                ))
            }
        };

        let client: Client = match diesel::insert_into(schema::clients::table)
            .values(new_client)
            .get_result(&mut conn)
            .await
        {
            Ok(client) => client,
            Err(why) => return Err(tonic::Status::new(tonic::Code::Internal, why.to_string())),
        };

        Ok(tonic::Response::new(CreateClientResponse {
            client_created: Some(client),
        }))
    }

    async fn get_clients(
        &self,
        request: tonic::Request<GetClientsRequest>,
    ) -> Result<tonic::Response<GetClientsResponse>, tonic::Status> {
        let request = request.into_inner();

        let mut conn = match self.db_pool.get().await {
            Ok(conn) => conn,
            Err(why) => return Err(tonic::Status::new(tonic::Code::Internal, why.to_string())),
        };

        let ids = request.ids;
        let names = request.names;

        let mut query = schema::clients::table
            .into_boxed()
            .select(Client::as_select());

        if !ids.is_empty() {
            query = query.filter(schema::clients::id.eq_any(ids));
        }

        if !names.is_empty() {
            query = query.filter(schema::clients::name.eq_any(names));
        }

        let clients: Vec<Client> = match query.load(&mut conn).await {
            Ok(clients) => clients,
            Err(why) => return Err(tonic::Status::new(tonic::Code::Internal, why.to_string())),
        };

        Ok(tonic::Response::new(GetClientsResponse { clients }))
    }

    async fn update_clients(
        &self,
        request: tonic::Request<UpdateClientsRequest>,
    ) -> Result<tonic::Response<UpdateClientsResponse>, tonic::Status> {
        let request = request.into_inner();

        let mut conn = match self.db_pool.get().await {
            Ok(conn) => conn,
            Err(why) => return Err(tonic::Status::new(tonic::Code::Internal, why.to_string())),
        };

        let to_update = request.clients;
        let clients_updated = match conn
            .transaction(|mut conn| {
                async move {
                    let mut updated = Vec::new();

                    for client in to_update {
                        let id = client.id;

                        let updated_client = diesel::update(
                            schema::clients::table.filter(schema::clients::id.eq(id)),
                        )
                        .set(client)
                        .get_result(&mut conn)
                        .await
                        .unwrap();

                        updated.push(updated_client);
                    }

                    Ok::<Vec<Client>, diesel::result::Error>(updated)
                }
                .scope_boxed()
            })
            .await
        {
            Ok(clients) => clients,
            Err(why) => return Err(tonic::Status::new(tonic::Code::Internal, why.to_string())),
        };

        Ok(tonic::Response::new(UpdateClientsResponse {
            clients_updated,
        }))
    }

    async fn delete_clients(
        &self,
        request: tonic::Request<DeleteClientsRequest>,
    ) -> Result<tonic::Response<DeleteClientsResponse>, tonic::Status> {
        let request = request.into_inner();

        let mut conn = match self.db_pool.get().await {
            Ok(conn) => conn,
            Err(why) => return Err(tonic::Status::new(tonic::Code::Internal, why.to_string())),
        };

        let ids = request.ids;

        let clients_deleted = match conn
            .transaction(|mut conn| {
                async move {
                    diesel::delete(schema::clients::table.filter(schema::clients::id.eq_any(ids)))
                        .get_results(&mut conn)
                        .await
                }
                .scope_boxed()
            })
            .await
        {
            Ok(clients) => clients,
            Err(why) => return Err(tonic::Status::new(tonic::Code::Internal, why.to_string())),
        };

        Ok(tonic::Response::new(DeleteClientsResponse {
            clients_deleted,
        }))
    }
}
