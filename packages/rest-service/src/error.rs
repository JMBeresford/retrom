use warp::reject::{Reject, Rejection};

#[derive(thiserror::Error, Debug)]
pub enum Error {
    #[error("Error: {1}")]
    StatusCode(http::StatusCode, String),

    #[error("IoError: {0}")]
    IoError(#[from] std::io::Error),
}

impl Reject for Error {}

pub async fn handle_rejection(
    err: Rejection,
) -> Result<impl warp::Reply, std::convert::Infallible> {
    tracing::error!("unhandled rejection: {:?}", err);
    match err.find::<Error>() {
        Some(Error::StatusCode(code, _)) => {
            return Ok(warp::reply::with_status(
                warp::reply::json(&format!("{err:#?}")),
                *code,
            ));
        }
        Some(err) => {
            return Ok(warp::reply::with_status(
                warp::reply::json(&format!("{err:#?}")),
                warp::http::StatusCode::INTERNAL_SERVER_ERROR,
            ));
        }
        _ => {}
    };

    Ok(warp::reply::with_status(
        warp::reply::json(&"Internal Server Error"),
        warp::http::StatusCode::INTERNAL_SERVER_ERROR,
    ))
}
