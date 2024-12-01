fn main() {
    #[cfg(target_os = "windows")]
    println!("cargo::rustc-link-search=C:\\Program Files\\PostgreSQL\\16\\lib");
    #[cfg(target_os = "windows")]
    println!("cargo:rustc-link-lib=libpq");

    #[cfg(target_os = "macos")]
    {
        println!("cargo:rustc-link-search=$DYLD_FALLBACK_LIBRARY_PATH");
    }

    tauri_build::build()
}
