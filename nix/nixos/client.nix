{
  config,
  lib,
  pkgs,
  ...
}:
let
  cfg = config.programs.retrom;
in
{
  options.programs.retrom = {
    enable = lib.mkEnableOption "Enable Retrom. A centralized game library/collection management service with a focus on emulation";
    package = lib.mkOption {
      type = lib.types.package;
    };
    supportNvidia = lib.mkOption {
      type = lib.types.bool;
      default = config.hardware.nvidia.enabled;
      defaultText = lib.literalString "config.hardware.nvidia.enabled";
      description = ''
        Configure to run on nvidia hardware. Makes the following changes:

        #### Linux:
        - Sets WEBKIT_DISABLE_DMABUF_RENDERER, resolves issues with WebkitGTK.
          Fallback software rendering may decrease performance.

        For more information, see <https://github.com/tauri-apps/tauri/issues/9394>.
      '';
    };
  };

  config = lib.mkIf cfg.enable {
    environment.systemPackages = [
      (pkgs.callPackage ../pkgs/retrom/package.nix {
        inherit (cfg) supportNvidia;
        retrom-unwrapped = cfg.package;
      })
    ];
  };
}
