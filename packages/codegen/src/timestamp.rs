use prost_types::TimestampError;
use sqlx::types::chrono::{NaiveDateTime, Utc};
use sqlx::{encode::IsNull, types::chrono::DateTime, Database, Decode, Encode, Type};
use std::time::{Duration, SystemTime};

#[derive(
    Clone,
    Eq,
    Hash,
    Copy,
    PartialEq,
    PartialOrd,
    Ord,
    ::prost::Message,
    ::serde::Serialize,
    ::serde::Deserialize,
)]
pub struct Timestamp {
    #[prost(int64, tag = "1")]
    pub seconds: i64,
    #[prost(int32, tag = "2")]
    pub nanos: i32,
}

impl<DB: Database> Type<DB> for Timestamp
where
    str: sqlx::Type<DB>,
{
    fn type_info() -> <DB as Database>::TypeInfo {
        <&str as Type<DB>>::type_info()
    }
}

impl<'r> Encode<'r, sqlx::Any> for Timestamp {
    fn encode_by_ref(
        &self,
        buf: &mut <sqlx::Any as Database>::ArgumentBuffer<'r>,
    ) -> Result<IsNull, Box<dyn std::error::Error + 'static + Send + Sync>> {
        let datetime = match DateTime::from_timestamp(self.seconds, self.nanos as u32) {
            Some(dt) => dt,
            None => return Err(Box::new(TimestampError::InvalidDateTime)),
        };

        let value = datetime.to_rfc3339();

        <String as Encode<'r, sqlx::Any>>::encode_by_ref(&value, buf)
    }
}

impl<'r> Decode<'r, sqlx::Sqlite> for Timestamp
where
    &'r str: Decode<'r, sqlx::Sqlite>,
{
    fn decode(
        value: <sqlx::Sqlite as Database>::ValueRef<'r>,
    ) -> Result<Timestamp, Box<dyn std::error::Error + 'static + Send + Sync>> {
        let value = <&str as Decode<'r, sqlx::Sqlite>>::decode(value)?;

        let format_str = "%Y-%m-%d %H:%M:%S";

        let datetime = match NaiveDateTime::parse_from_str(value, format_str) {
            Ok(dt) => dt.and_utc(),
            Err(err) => {
                tracing::error!("Failed to parse timestamp from value: {value}, error: {err}");
                return Err(err.into());
            }
        };

        let seconds = datetime.timestamp();
        let nanos = datetime.timestamp_subsec_nanos().try_into().unwrap_or(0);

        Ok(Timestamp { seconds, nanos })
    }
}

impl<'r> Decode<'r, sqlx::Postgres> for Timestamp
where
    &'r str: Decode<'r, sqlx::Postgres>,
{
    fn decode(
        value: <sqlx::Postgres as Database>::ValueRef<'r>,
    ) -> Result<Timestamp, Box<dyn std::error::Error + 'static + Send + Sync>> {
        let value = <&str as Decode<'r, sqlx::Postgres>>::decode(value)?;

        let format_str = "%Y-%m-%d %H:%M:%S%.6f%#z";

        let datetime = match DateTime::parse_from_str(value, format_str) {
            Ok(dt) => dt.with_timezone(&Utc),
            Err(err) => {
                tracing::error!("Failed to parse timestamp from value: {value}, error: {err}");
                return Err(err.into());
            }
        };

        let seconds = datetime.timestamp();
        let nanos = datetime.timestamp_subsec_nanos().try_into().unwrap_or(0);

        Ok(Timestamp { seconds, nanos })
    }
}

impl Timestamp {
    pub fn elapsed_since(&self, earlier: &Timestamp) -> Option<Duration> {
        let self_duration = Duration::new(self.seconds as u64, self.nanos as u32);
        let earlier_duration = Duration::new(earlier.seconds as u64, earlier.nanos as u32);

        self_duration.checked_sub(earlier_duration)
    }
}

impl From<Timestamp> for prost_types::Timestamp {
    fn from(value: Timestamp) -> Self {
        prost_types::Timestamp {
            seconds: value.seconds,
            nanos: value.nanos,
        }
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

impl TryFrom<Timestamp> for SystemTime {
    type Error = TimestampError;

    fn try_from(value: Timestamp) -> Result<Self, Self::Error> {
        let prost_timestamp: prost_types::Timestamp = value.into();
        prost_timestamp.try_into()
    }
}
