{
  lib,
  fetchFromGitHub,
  pkg-config,
  rustPlatform,
  cargo-tauri,
  nodejs_24,
  pnpm_10,
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
  version = "0.7.43"; # x-release-please-version

  src = fetchFromGitHub {
    owner = "JMBeresford";
    repo = "retrom";
    tag = "v${finalAttrs.version}";
    hash = "sha256-G9FnZJTrNIdPXL1OalmoHu0iF8aotc72AB4DMc/MhwM=";
  };

  pnpmDeps = pnpm_10.fetchDeps {
    inherit (finalAttrs) pname version src;
    fetcherVersion = 2;
    hash = "sha256-q+IUP3WZWSR2JRHCnQjrq8ndndQOf0GbalQ9GF4niJ4=";
  };

  cargoLock.lockFile = "${finalAttrs.src}/Cargo.lock";
  buildAndTestSubdir = "packages/client";

  nativeBuildInputs = [
    nodejs_24
    pnpm_10.configHook
    faketty
    pkg-config
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

  buildPhase = ''
    export CI=true
    export NX_NO_CLOUD=true
    export NX_DAEMON=false

    # See https://github.com/nrwl/nx/issues/22445
    faketty pnpm nx build:desktop retrom-client-web

    runHook tauriBuildHook
  '';

  meta = with lib; {
    description = "A centralized game library/collection management service with a focus on emulation";
    homepage = "https://github.com/JMBeresford/retrom";
    license = licenses.gpl3;
    platforms = platforms.all;
    mainProgram = "Retrom";
  };
})
