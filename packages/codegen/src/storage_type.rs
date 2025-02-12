use serde::{
    de::{self, Visitor},
    Deserializer,
};

struct StringifiedStorageTypeVisitor;

impl Visitor<'_> for StringifiedStorageTypeVisitor {
    type Value = Option<i32>;

    fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
        formatter.write_str("an integer or name representing a StorageType")
    }

    fn visit_str<E>(self, v: &str) -> Result<Self::Value, E>
    where
        E: de::Error,
    {
        match v {
            "MultiFileGame" => Ok(Some(crate::retrom::StorageType::MultiFileGame as i32)),
            "SingleFileGame" => Ok(Some(crate::retrom::StorageType::SingleFileGame as i32)),
            _ => Err(de::Error::unknown_variant(
                v,
                &["MultiFileGame", "SingleFileGame"],
            )),
        }
    }
}

pub fn deserialize<'de, D>(deserializer: D) -> Result<Option<i32>, D::Error>
where
    D: Deserializer<'de>,
{
    deserializer.deserialize_str(StringifiedStorageTypeVisitor)
}

pub fn serialize<S>(value: &Option<i32>, serializer: S) -> Result<S::Ok, S::Error>
where
    S: serde::Serializer,
{
    use crate::retrom::StorageType;

    let value: Option<StorageType> = value.map(|v| StorageType::try_from(v).unwrap_or_default());

    match value {
        Some(storage_type) => match storage_type {
            StorageType::MultiFileGame => serializer.serialize_i32(0),
            StorageType::SingleFileGame => serializer.serialize_i32(1),
            StorageType::Custom => serializer.serialize_i32(2),
        },
        None => serializer.serialize_none(),
    }
}
