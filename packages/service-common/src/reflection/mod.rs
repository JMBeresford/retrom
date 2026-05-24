use retrom_codegen::descriptors::retrom::FILE_DESCRIPTOR_SET;

pub fn reflection_router() -> axum::Router {
    let reflection_service = tonic_reflection::server::Builder::configure()
        .register_encoded_file_descriptor_set(FILE_DESCRIPTOR_SET)
        .build_v1()
        .expect("Failed to build gRPC reflection service");

    let reflection_service_alpha = tonic_reflection::server::Builder::configure()
        .register_encoded_file_descriptor_set(FILE_DESCRIPTOR_SET)
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
