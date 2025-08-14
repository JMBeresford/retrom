use warp::{Reply};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use retrom_db::Pool;

use diesel::{prelude::*};
use diesel_async::RunQueryDsl;
use retrom_db::schemas::auth_schema;

#[derive(Queryable, Selectable)]
#[diesel(table_name = auth_schema::auth::users)]
pub struct User {
    pub user_id: i32,
    pub username: String,
}

// Request/Response DTOs
#[derive(Deserialize)]
pub struct LoginRequest {
    pub username: String,
    pub password: String,
}

#[derive(Serialize)]
pub struct LoginResponse {
    pub token: String,
}

// TODO: Implement password validation
// TODO: Implement token generation and validation
// TODO: Return proper error responses

pub async fn handle_login(
    request: LoginRequest,
    pool: Arc<Pool>,
) -> Result<impl Reply, warp::Rejection> {
    
    tracing::info!("Login attempt for user: {}", request.username);
    
    let mut conn = pool.get().await.map_err(|e| {
        tracing::error!("Failed to get database connection: {}", e);
        warp::reject()
    })?;
    
    let user_result: QueryResult<User> = auth_schema::auth::users::table
        .filter(auth_schema::auth::users::username.eq(&request.username))
        .select((auth_schema::auth::users::user_id, auth_schema::auth::users::username))
        .first::<User>(&mut conn)
        .await;
    
    match user_result {
        Ok(user) => {
            tracing::info!("Found user - ID: {}, Username: {}", user.user_id, user.username);
        },
        Err(diesel::NotFound) => {
            tracing::warn!("User not found: {}", request.username);
            return Err(warp::reject::not_found());
        },
        Err(e) => {
            tracing::error!("Database error querying user: {}", e);
            return Err(warp::reject());
        }
    }

    let response = LoginResponse {
        token: String::new(),
    };
    return Ok(warp::reply::json(&response));
}