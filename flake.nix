{
  description = "Retrom - A centralized game library/collection management service with a focus on emulation";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
      ...
    }:
    {
      nixosModules.retrom =
        { lib, pkgs, ... }:
        let
          retromPackages = self.packages.${pkgs.stdenv.hostPlatform.system};
        in
        {
          imports = [
            ./nix/nixos/client.nix
            ./nix/nixos/service.nix
          ];
          programs.retrom.package = lib.mkDefault retromPackages.retrom-unwrapped;
          services.retrom.package = lib.mkDefault retromPackages.retrom-service;
        };
      homeModules.retrom =
        { lib, pkgs, ... }:
        let
          retromPackages = self.packages.${pkgs.stdenv.hostPlatform.system};
        in
        {
          imports = [
            ./nix/home-manager/client.nix
          ];
          programs.retrom.package = lib.mkDefault retromPackages.retrom-unwrapped;
        };
    }
    // flake-utils.lib.eachSystem [ "x86_64-linux" "aarch64-linux" ] (
      system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        packages = rec {
          retrom-unwrapped = pkgs.callPackage ./nix/pkgs/retrom-unwrapped/package.nix { };
          retrom = pkgs.callPackage ./nix/pkgs/retrom/package.nix { inherit retrom-unwrapped; };
          retrom-service = pkgs.callPackage ./nix/pkgs/retrom-service/package.nix { };
        };
      }
    );
}
