{
  lib,
  pkg-config,
  rustPlatform,
  pnpmConfigHook,
  fetchPnpmDeps,
  pnpm_10,
  nodejs_24,
  faketty,
  perl,
  protobuf_29,
  openssl,
  makeWrapper,

  withEmbeddedDb ? false,
}:

rustPlatform.buildRustPackage (finalAttrs: {
  pname = "retrom-service";
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

  buildAndTestSubdir = "packages/service";

  cargoBuildFeatures = lib.optional withEmbeddedDb "embedded_db";

  cargoLock.lockFile = "${finalAttrs.src}/Cargo.lock";

  cargoLock.outputHashes = {
    "ludusavi-0.30.0" = "sha256-tDGfnX3fDDvrLvSnWvurIBwgDTWCjmbIJXDxgxQV5Og=";
    "webdav-meta-0.1.0" = "sha256-1XWBxlkdftg/Et7TexNmhKDZXl7ro+agMXodCRMV+e8=";
  };

  nativeBuildInputs = [
    pkg-config
    pnpmConfigHook
    pnpm_10
    nodejs_24
    faketty
    perl
    protobuf_29
    makeWrapper
  ];

  buildInputs = [
    openssl
  ];

  preBuild = ''
    export CI=true
    export NX_NO_CLOUD=true
    export NX_DAEMON=false

    export VITE_BASE_URL=/web
    export VITE_UPTRACE_DSN=https://KgFBXOxX2RFeJurwr7R-4w@api.uptrace.dev?grpc=4317

    # See https://github.com/nrwl/nx/issues/22445
    faketty pnpm nx build retrom-client-web

    # Work around for https://github.com/pnpm/pnpm/issues/5315
    mkdir -p web

    cp -r packages/client-web/dist web

    cp pnpm-workspace.yaml web
    cp pnpm-lock.yaml web
    cp package.json web
    cp README.md web
    cp packages/client-web/vite.config.ts web

    pushd web
    pnpm install --prod --offline --frozen-lockfile

    rm -f pnpm-workspace.yaml pnpm-lock.yaml
    popd
  '';

  postInstall = ''
    mkdir -p $out/share
    cp -r web $out/share/retrom
  '';

  postFixup = ''
    wrapProgram $out/bin/retrom-service --set RETROM_WEB_DIR $out/share/retrom
  '';

  meta = {
    description = "Server component of the Retrom game library management service";
    homepage = "https://github.com/JMBeresford/retrom";
    license = lib.licenses.gpl3Only;
    platforms = lib.platforms.linux;
    mainProgram = "retrom-service";
  };
})
