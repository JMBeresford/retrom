fn main() {
    #[cfg(target_os = "windows")]
    println!("cargo::rustc-link-search=\"C:\\Program Files\\PostgreSQL\\16\\lib\"");
    #[cfg(target_os = "windows")]
    println!("cargo:rustc-link-lib=libpq");

    tauri_build::build()
}
