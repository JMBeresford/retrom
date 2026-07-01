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

By default the service module leaves `RETROM_CONFIG` unset, so the server
creates and updates configuration in its normal writable application config
directory. Setting `services.retrom.settings`, `services.retrom.dbUrl`,
`services.retrom.enableDatabase`, or a non-default `services.retrom.port` seeds
a writable service configuration before the first start. Existing configuration
files are left in place so Retrom can update its own server configuration at
runtime. Set `services.retrom.configFile` to point the service at another
explicit configuration file, including an immutable generated file when fully
declarative configuration is desired.

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
