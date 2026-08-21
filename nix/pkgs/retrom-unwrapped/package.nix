{
  lib,
  pkg-config,
  rustPlatform,
  cargo-tauri,
  pnpmConfigHook,
  fetchPnpmDeps,
  pnpm_10,
  nodejs_24,
  faketty,
  perl,
  protobuf_29,
  webkitgtk_4_1,
  openssl,
  glib-networking,
  gst_all_1,
  wrapGAppsHook3,
}:

rustPlatform.buildRustPackage (finalAttrs: {
  pname = "retrom";
  inherit ((fromTOML (builtins.readFile ../../../Cargo.toml)).workspace.package) version;

  __structuredAttrs = true;

  src = lib.cleanSourceWith {
    src = ../../../.;
    filter =
      path: _:
      !(builtins.any (prefix: lib.path.hasPrefix (../../../. + prefix) (/. + path)) [
        /nix
        /flake.nix
        /flake.lock

        /.github
        /.gitignore
      ]);
  };

  pnpmDeps = fetchPnpmDeps {
    inherit (finalAttrs) pname version src;
    pnpm = pnpm_10;
    fetcherVersion = 4;
    hash = "sha256-5FkJc/rtptg4ZWlf1NU/57Ga8cLbW1LVc4MLxs+iyrA=";
  };

  cargoLock.lockFile = "${finalAttrs.src}/Cargo.lock";

  cargoLock.outputHashes = {
    "ludusavi-0.30.0" = "sha256-tDGfnX3fDDvrLvSnWvurIBwgDTWCjmbIJXDxgxQV5Og=";
    "webdav-meta-0.1.0" = "sha256-1XWBxlkdftg/Et7TexNmhKDZXl7ro+agMXodCRMV+e8=";
  };

  buildAndTestSubdir = "packages/client";

  nativeBuildInputs = [
    pkg-config
    pnpmConfigHook
    pnpm_10
    nodejs_24
    faketty
    perl
    protobuf_29
    cargo-tauri.hook
    wrapGAppsHook3
  ];

  buildInputs = [
    openssl
    webkitgtk_4_1
    glib-networking
    gst_all_1.gst-plugins-base
    gst_all_1.gst-plugins-good
  ];

  preBuild = ''
    export CI=true
    export NX_NO_CLOUD=true
    export NX_DAEMON=false

    # See https://github.com/nrwl/nx/issues/22445
    faketty pnpm nx build:desktop retrom-client-web
  '';

  meta = {
    description = "Desktop client for the Retrom game library management service";
    homepage = "https://github.com/JMBeresford/retrom";
    license = lib.licenses.gpl3Only;
    platforms = lib.platforms.linux;
    mainProgram = "Retrom";
  };
})
