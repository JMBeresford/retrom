use std::time::{Duration, SystemTime, UNIX_EPOCH};

use diesel::sql_types::{self, SqlType};
use diesel::{
    deserialize::{FromSql, FromSqlRow},
    expression::AsExpression,
    pg::PgValue,
    serialize::{Output, ToSql},
};

fn pg_epoch() -> SystemTime {
    let thirty_years = Duration::from_secs(946_684_800);
    UNIX_EPOCH + thirty_years
}

#[derive(
    Clone,
    Eq,
    Hash,
    PartialEq,
    PartialOrd,
    Ord,
    ::prost::Message,
    ::serde::Serialize,
    ::serde::Deserialize,
    SqlType,
    AsExpression,
    FromSqlRow,
)]
#[diesel(postgres_type(oid = 1114, array_oid = 1115))]
#[diesel(sql_type = diesel::sql_types::Timestamp)]
#[diesel(sql_type = diesel::sql_types::Timestamptz)]
pub struct Timestamp {
    #[prost(int64, tag = "1")]
    pub seconds: i64,
    #[prost(int32, tag = "2")]
    pub nanos: i32,
}

impl Timestamp {}

impl TryFrom<Timestamp> for prost_types::Timestamp {
    type Error = prost::DecodeError;

    fn try_from(value: Timestamp) -> Result<Self, Self::Error> {
        Ok(prost_types::Timestamp {
            seconds: value.seconds,
            nanos: value.nanos,
        })
    }
}

impl From<prost_types::Timestamp> for Timestamp {
    fn from(value: prost_types::Timestamp) -> Self {
        Timestamp {
            seconds: value.seconds,
            nanos: value.nanos,
        }
    }
}

impl From<std::time::SystemTime> for Timestamp {
    fn from(time: std::time::SystemTime) -> Self {
        prost_types::Timestamp::from(time).into()
    }
}

impl ToSql<sql_types::Timestamp, diesel::pg::Pg> for Timestamp {
    fn to_sql<'b>(&'b self, out: &mut Output<'b, '_, diesel::pg::Pg>) -> diesel::serialize::Result {
        let thirty_years_seconds = 946_684_800;
        let micros = (self.seconds - thirty_years_seconds) * 1_000_000 + self.nanos as i64 / 1_000;

        ToSql::<sql_types::BigInt, diesel::pg::Pg>::to_sql(&micros, &mut out.reborrow())
    }
}

impl ToSql<sql_types::Timestamptz, diesel::pg::Pg> for Timestamp {
    fn to_sql<'b>(&'b self, out: &mut Output<'b, '_, diesel::pg::Pg>) -> diesel::serialize::Result {
        ToSql::<sql_types::Timestamp, diesel::pg::Pg>::to_sql(self, out)
    }
}

impl FromSql<sql_types::Timestamp, diesel::pg::Pg> for Timestamp {
    fn from_sql(bytes: PgValue<'_>) -> diesel::deserialize::Result<Self> {
        let micros = i64::from_sql(bytes)?;

        let pg_timestamp = match micros < 0 {
            true => pg_epoch() - Duration::from_micros(micros.unsigned_abs()),
            false => pg_epoch() + Duration::from_micros(micros.unsigned_abs()),
        };

        Ok(pg_timestamp.into())
    }
}

impl FromSql<sql_types::Timestamptz, diesel::pg::Pg> for Timestamp {
    fn from_sql(bytes: PgValue<'_>) -> diesel::deserialize::Result<Self> {
        FromSql::<sql_types::Timestamp, diesel::pg::Pg>::from_sql(bytes)
    }
}
