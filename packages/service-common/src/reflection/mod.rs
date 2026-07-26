use retrom_codegen::{
    google::api::FILE_DESCRIPTOR_SET as GOOGLE_API_FILE_DESCRIPTOR_SET,
    igdb::FILE_DESCRIPTOR_SET as IGDB_FILE_DESCRIPTOR_SET, GOOGLE_PROTOBUF_FILE_DESCRIPTOR_SET,
};

pub fn reflection_router(file_descriptor_sets: &[&[u8]]) -> axum::Router {
    let mut reflection_service = tonic_reflection::server::Builder::configure();

    for fds in file_descriptor_sets.iter() {
        reflection_service = reflection_service.register_encoded_file_descriptor_set(fds);
    }

    let reflection_service = reflection_service
        .register_encoded_file_descriptor_set(GOOGLE_PROTOBUF_FILE_DESCRIPTOR_SET)
        .register_encoded_file_descriptor_set(GOOGLE_API_FILE_DESCRIPTOR_SET)
        .register_encoded_file_descriptor_set(IGDB_FILE_DESCRIPTOR_SET)
        .build_v1()
        .expect("Failed to build gRPC reflection service");

    let mut reflection_service_alpha = tonic_reflection::server::Builder::configure();

    for fds in file_descriptor_sets.iter() {
        reflection_service_alpha =
            reflection_service_alpha.register_encoded_file_descriptor_set(fds);
    }

    let reflection_service_alpha = reflection_service_alpha
        .register_encoded_file_descriptor_set(GOOGLE_PROTOBUF_FILE_DESCRIPTOR_SET)
        .register_encoded_file_descriptor_set(GOOGLE_API_FILE_DESCRIPTOR_SET)
        .register_encoded_file_descriptor_set(IGDB_FILE_DESCRIPTOR_SET)
        .build_v1alpha()
        .expect("Failed to build gRPC reflection service (alpha)");

    let mut reflection_route_builder = tonic::service::Routes::builder();
    reflection_route_builder
        .add_service(reflection_service)
        .add_service(reflection_service_alpha);

    reflection_route_builder
        .routes()
        .into_axum_router()
        .reset_fallback()
}
