use crate::retrom_dirs::RetromDirs;
use futures::StreamExt;
use std::path::PathBuf;

const EMULATOR_JS_VER: &str = "4.2.1";
const EMULATOR_JS_RELEASE_URL: &str =
    "https://github.com/EmulatorJS/EmulatorJS/releases/download/v";

pub struct EmulatorJs {
    dir: PathBuf,
}

#[derive(serde::Deserialize)]
struct PackageJson {
    version: String,
}

impl EmulatorJs {
    pub async fn new() -> Self {
        let dirs = RetromDirs::new();
        let dir = dirs.public_dir().join("emulator-js/");

        let s = Self { dir: dir.clone() };

        if !dir.exists() {
            tracing::info!("EmulatorJS directory does not exist, downloading release...");

            s.download_release().await;
        } else if dir.join(format!("{EMULATOR_JS_VER}.7z")).exists() {
            tracing::warn!("EmulatorJS install is corrupt, redownloading release...");

            s.uninstall().await;
            s.download_release().await;
        } else if let Ok(package_json) = tokio::fs::read_to_string(dir.join("package.json")).await {
            let parsed: Option<PackageJson> = serde_json::from_str(&package_json).ok();
            if parsed
                .map(|p| p.version != EMULATOR_JS_VER)
                .unwrap_or(false)
            {
                tracing::warn!("EmulatorJS version mismatch, redownloading release...");

                s.uninstall().await;
                s.download_release().await;
            }
        }

        s
    }

    pub fn version(&self) -> &str {
        EMULATOR_JS_VER
    }

    #[tracing::instrument(skip_all)]
    pub async fn download_release(&self) {
        let url = format!("{EMULATOR_JS_RELEASE_URL}{EMULATOR_JS_VER}/{EMULATOR_JS_VER}.7z");

        tokio::fs::create_dir_all(&self.dir)
            .await
            .expect("Could not create directory");

        let release_file_path = self.dir.join(format!("{EMULATOR_JS_VER}.7z"));
        let mut release_file = tokio::fs::File::create(&release_file_path)
            .await
            .expect("Could not create file");

        let mut stream = reqwest::get(&url)
            .await
            .expect("Could not download EmulatorJS release")
            .bytes_stream();

        while let Some(chunk) = stream.next().await {
            let chunk = chunk.expect("Could not download EmulatorJS release. Stream halted");

            tokio::io::copy(&mut chunk.as_ref(), &mut release_file)
                .await
                .expect("Could not write to file");
        }

        tracing::info!("Decompressing EmulatorJS release...");

        sevenz_rust2::decompress_file(&release_file_path, &self.dir)
            .expect("Could not decompress EmulatorJS release");

        tracing::info!("EmulatorJS release downloaded!");

        tokio::fs::remove_file(&release_file_path)
            .await
            .expect("Could not remove release file");
    }

    async fn uninstall(&self) {
        tokio::fs::remove_dir_all(&self.dir)
            .await
            .expect("Could not remove directory");
    }
}
