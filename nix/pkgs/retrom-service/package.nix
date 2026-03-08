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
  rustfmt,
  makeWrapper,
}:

rustPlatform.buildRustPackage (finalAttrs: {
  pname = "retrom-service";
  inherit ((builtins.fromTOML (builtins.readFile ../../../Cargo.toml)).workspace.package) version;

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
    fetcherVersion = 3;
    hash = "sha256-r3TFgV07do9qDSv9prUyzRMi4buj4QkhhrtHqJ4p37Y=";
  };

  cargoLock.lockFile = "${finalAttrs.src}/Cargo.lock";

  cargoLock.outputHashes = {
    "ludusavi-0.30.0" = "sha256-tDGfnX3fDDvrLvSnWvurIBwgDTWCjmbIJXDxgxQV5Og=";
    "webdav-meta-0.1.0" = "sha256-1XWBxlkdftg/Et7TexNmhKDZXl7ro+agMXodCRMV+e8=";
  };

  buildAndTestSubdir = "packages/service";

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
    rustfmt
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
    dst=$out/share/retrom
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
    wrapProgram $out/bin/retrom-service --set RETROM_WEB_DIR $out/share/retrom
  '';

  meta = with lib; {
    description = "A centralized game library/collection management service with a focus on emulation";
    homepage = "https://github.com/JMBeresford/retrom";
    license = licenses.gpl3;
    platforms = platforms.linux;
    mainProgram = "retrom-service";
  };
})
