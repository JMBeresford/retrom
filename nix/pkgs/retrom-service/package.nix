{
  lib,
  fetchFromGitHub,
  nodejs_24,
  pnpm_10,
  faketty,
  pkg-config,
  rustPlatform,
  perl,
  protobuf_29,
  openssl,
  makeWrapper,
  nix-update-script,
}:

rustPlatform.buildRustPackage (finalAttrs: {
  pname = "retrom-service";
  version = "0.7.43";

  src = fetchFromGitHub {
    owner = "JMBeresford";
    repo = "retrom";
    rev = "v${finalAttrs.version}";
    hash = "sha256-G9FnZJTrNIdPXL1OalmoHu0iF8aotc72AB4DMc/MhwM=";
  };

  pnpmDeps = pnpm_10.fetchDeps {
    inherit (finalAttrs) pname version src;
    fetcherVersion = 2;
    hash = "sha256-q+IUP3WZWSR2JRHCnQjrq8ndndQOf0GbalQ9GF4niJ4=";
  };

  cargoHash = "sha256-b6pV25rFwMnQDHuLA+vCwDhMSZROkXfiorAvGgKMfN0=";
  buildAndTestSubdir = "packages/service";

  nativeBuildInputs = [
    nodejs_24
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

  passthru.updateScript = nix-update-script { };

  meta = with lib; {
    description = "A centralized game library/collection management service with a focus on emulation";
    homepage = "https://github.com/JMBeresford/retrom";
    license = licenses.gpl3;
    platforms = platforms.all;
    maintainers = with maintainers; [ concurac ];
    mainProgram = "retrom-service";
  };
})
