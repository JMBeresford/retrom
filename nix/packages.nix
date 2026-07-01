{ pkgs }:

rec {
  retrom-unwrapped = pkgs.callPackage ./pkgs/retrom-unwrapped/package.nix { };
  retrom = pkgs.callPackage ./pkgs/retrom/package.nix {
    inherit retrom-unwrapped;
  };
  retrom-service = pkgs.callPackage ./pkgs/retrom-service/package.nix { };
}
