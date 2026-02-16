{
  lib,
  nodejs_22,
  pnpm_10,
  faketty,
  pkg-config,
  rustPlatform,
  perl,
  protobuf_29,
  openssl,
  makeWrapper,
}:
rustPlatform.buildRustPackage (finalAttrs: {
  pname = "retrom-service";
  version = "0.7.45"; # x-release-please-version

  src = ./../../..;

  pnpmDeps = pnpm_10.fetchDeps {
    inherit (finalAttrs) pname version src;
    fetcherVersion = 2;
    hash = "sha256-q+IUP3WZWSR2JRHCnQjrq8ndndQOf0GbalQ9GF4niJ4=";
  };

  cargoLock.lockFile = "${finalAttrs.src}/Cargo.lock";
  buildAndTestSubdir = "packages/service";

  nativeBuildInputs = [
    nodejs_22
    pnpm_10.configHook
    faketty
    pkg-config
    perl
    protobuf_29
    makeWrapper
  ];

  buildInputs = [
    openssl
  ];

  buildPhase = ''
    export CI=true
    export NX_NO_CLOUD=true
    export NX_DAEMON=false

    export VITE_BASE_URL=/web
    export VITE_UPTRACE_DSN=https://KgFBXOxX2RFeJurwr7R-4w@api.uptrace.dev?grpc=4317

    # See https://github.com/nrwl/nx/issues/22445
    faketty pnpm nx build retrom-client-web

    runHook cargoBuildHook
  '';

  postInstall = ''
    dst=$out/srv/www
    mkdir -p $dst

    # Work around for https://github.com/pnpm/pnpm/issues/5315
    cp -r packages/client-web/dist $dst

    cp pnpm-workspace.yaml $dst
    cp pnpm-lock.yaml $dst
    cp package.json $dst

    cp README.md $dst
    cp packages/client-web/vite.config.ts $dst

    cd $dst
    pnpm install --prod --offline --frozen-lockfile

    rm pnpm-workspace.yaml
    rm pnpm-lock.yaml
  '';

  postFixup = ''
    wrapProgram $out/bin/retrom-service --set RETROM_WEB_DIR $out/srv/www
  '';

  meta = with lib; {
    description = "A centralized game library/collection management service with a focus on emulation";
    homepage = "https://github.com/JMBeresford/retrom";
    license = licenses.gpl3;
    platforms = platforms.linux;
    mainProgram = "retrom-service";
  };
})
