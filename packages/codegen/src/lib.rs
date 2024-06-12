pub mod igdb {
    tonic::include_proto!("igdb");
}

pub mod retrom {
    // use diesel::{deserialize::FromSql, sql_types::Integer};

    tonic::include_proto!("retrom");

    // impl<DB> FromSql<Integer, DB> for RomType
    // where
    //     DB: diesel::backend::Backend,
    //     i32: FromSql<Integer, DB>,
    // {
    //     fn from_sql(bytes: DB::RawValue<'_>) -> diesel::deserialize::Result<Self> {
    //         let value = i32::from_sql(bytes)?;
    //
    //         match value {
    //             0 => Ok(RomType::Custom),
    //             1 => Ok(RomType::SingleFile),
    //             2 => Ok(RomType::MultiFile),
    //             _ => Err(format!("Invalid RomType value: {}", value).into()),
    //         }
    //     }
    // }

    pub const FILE_DESCRIPTOR_SET: &[u8] = tonic::include_file_descriptor_set!("retrom_descriptor");
}
