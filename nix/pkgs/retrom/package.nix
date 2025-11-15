{
  lib,
  runCommand,
  makeWrapper,

  retrom-unwrapped,

  supportNvidia ? false,
}:
runCommand retrom-unwrapped.name
  {
    inherit (retrom-unwrapped) pname version meta;

    nativeBuildInputs = [
      makeWrapper
    ];
  }
  ''
    mkdir -p $out/bin
    ln -s ${retrom-unwrapped}/share $out/share

    makeWrapper ${retrom-unwrapped}/bin/Retrom $out/bin/Retrom \
      ${lib.optionalString supportNvidia "--set WEBKIT_DISABLE_DMABUF_RENDERER 1"}
  ''
