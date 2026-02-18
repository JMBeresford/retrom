{
  stdenv,
  lib,
  buildFHSEnv,
  runCommand,
  makeWrapper,

  glibc,
  zlib,
  python311,
  readline,
  postgresql,
  lz4,
  krb5,
  zstd,
  openssl,
  libxslt,
  libxml2_13,
  libossp_uuid,
  tzdata,

  retrom-unwrapped,

  supportNvidia ? false,
}:
let
  libossp_uuid' = stdenv.mkDerivation rec {
    inherit (libossp_uuid) pname version meta;
    src = libossp_uuid;
    buildPhase = ''
      mkdir -p $out/lib
      ln -s ${src}/lib/libuuid.so.16 $out/lib/libossp-uuid.so.16
    '';
  };
  retrom-unwrapped' = buildFHSEnv {
    inherit (retrom-unwrapped) pname version meta;
    executableName = retrom-unwrapped.meta.mainProgram;
    targetPkgs = pkgs: with pkgs; [
      glibc
      zlib
      python311
      readline
      postgresql.lib
      lz4.lib
      krb5.lib
      zstd.out
      openssl.out
      libxslt.out
      libxml2_13.out

      libossp_uuid'

      tzdata
    ];
    runScript = lib.getExe retrom-unwrapped;
    profile = ''
      ${lib.optionalString (supportNvidia && stdenv.isLinux) "export WEBKIT_DISABLE_DMABUF_RENDERER=1"}
    '';
  };
in runCommand retrom-unwrapped'.name
  {
    inherit (retrom-unwrapped') pname version meta;
    nativeBuildInputs = [
      makeWrapper
    ];
  }
  ''
    mkdir -p $out/bin
    ln -s ${retrom-unwrapped}/share $out/share
    makeWrapper ${retrom-unwrapped'}/bin/Retrom $out/bin/Retrom
  ''
