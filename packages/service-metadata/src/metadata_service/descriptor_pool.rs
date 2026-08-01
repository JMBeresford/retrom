use once_cell::sync::Lazy;
use prost_reflect::DescriptorPool;
use retrom_codegen::{
    google::api::FILE_DESCRIPTOR_SET as GOOGLE_API_FILE_DESCRIPTOR_SET,
    igdb::FILE_DESCRIPTOR_SET as IGDB_FILE_DESCRIPTOR_SET,
    retrom::{
        providers::igdb::v1::FILE_DESCRIPTOR_SET as IGDB_PROVIDER_FILE_DESCRIPTOR_SET,
        services::metadata::v1::FILE_DESCRIPTOR_SET,
    },
    GOOGLE_PROTOBUF_FILE_DESCRIPTOR_SET,
};

pub static DESCRIPTOR_POOL: Lazy<DescriptorPool> = Lazy::new(|| {
    let mut pool = DescriptorPool::new();

    for fds in &[
        GOOGLE_PROTOBUF_FILE_DESCRIPTOR_SET,
        GOOGLE_API_FILE_DESCRIPTOR_SET,
        IGDB_FILE_DESCRIPTOR_SET,
        IGDB_PROVIDER_FILE_DESCRIPTOR_SET,
        FILE_DESCRIPTOR_SET,
    ] {
        pool.decode_file_descriptor_set(*fds)
            .expect("Failed to decode file descriptor set");
    }

    pool
});
