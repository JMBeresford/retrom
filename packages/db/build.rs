fn main() {
    #[cfg(feature = "embedded")]
    {
        std::env::set_var("POSTGRESQL_VERSION", "=17.2.0");
    }
}
