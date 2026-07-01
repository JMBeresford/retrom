# Nix

Retrom exposes flake packages, an overlay, and NixOS/Home Manager modules.

## Packages

```sh
nix build github:JMBeresford/retrom#retrom
nix build github:JMBeresford/retrom#retrom-service
```

## Overlay

```nix
{
  inputs.retrom.url = "github:JMBeresford/retrom";

  outputs =
    {
      nixpkgs,
      retrom,
      ...
    }:
    {
      nixosConfigurations.example = nixpkgs.lib.nixosSystem {
        system = "x86_64-linux";
        modules = [
          ({ pkgs, ... }: {
            nixpkgs.overlays = [ retrom.overlays.default ];
            environment.systemPackages = [ pkgs.retrom ];
          })
        ];
      };
    };
}
```

## Modules

The NixOS and Home Manager modules build their default packages with the
caller's `pkgs`. Override `programs.retrom.package` or `services.retrom.package`
to use a custom package.

```nix
{
  inputs.retrom.url = "github:JMBeresford/retrom";

  outputs =
    {
      nixpkgs,
      retrom,
      ...
    }:
    {
      nixosConfigurations.example = nixpkgs.lib.nixosSystem {
        system = "x86_64-linux";
        modules = [
          retrom.nixosModules.retrom
          {
            programs.retrom.enable = true;
            services.retrom.enable = true;
          }
        ];
      };
    };
}
```

The overlay and modules are tested against Retrom's locked Nixpkgs; other
Nixpkgs revisions may need package fixes.
