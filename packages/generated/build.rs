fn main() {
    tonic_build::configure()
        .compile(
            &["./protos/igdb.proto", "./protos/retrom.proto"],
            &["./protos"],
        )
        .unwrap();
}
