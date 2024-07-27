pub mod timestamp;

pub mod igdb {
    tonic::include_proto!("igdb");
}

pub mod retrom {
    use retrom_db::schema;
    tonic::include_proto!("retrom");

    pub const FILE_DESCRIPTOR_SET: &[u8] = tonic::include_file_descriptor_set!("retrom_descriptor");
}
