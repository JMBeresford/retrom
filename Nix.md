> [!TIP]
> After installation, make sure to check out the [Quickstart guide](./Quick-Start) to get up and running quickly!

> [!CAUTION]
> The Nix flake and modules provided here are **community maintained**. If you encounter issues, please report them on GitHub.

# Retrom Nix Integration

Retrom provides Nix modules for both **NixOS** and **Home Manager**, making it easy to install and configure Retrom declaratively.

- The **NixOS module** provides both the `retrom` desktop application and the `retrom-service` backend server.
- The **Home Manager module** provides only the `retrom` desktop application (client).

You can use either or both, depending on your setup.

---

## Quick Start with Nix CLI

You can try Retrom without any configuration using the Nix CLI:

Try the retrom desktop application with
```sh
nix run github:JMBeresford/retrom#retrom         
```

---

## NixOS Module

The NixOS module provides both the `retrom` desktop application and the `retrom-service` backend server.

### Adding the Flake to Your NixOS Configuration

Add Retrom as an input in your `flake.nix`:

```nix
{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    retrom = {
      url = "github:JMBeresford/retrom";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };
  outputs = { nixpkgs, retrom, ... }: {
    nixosConfigurations.example = nixpkgs.lib.nixosSystem {
      modules = [
        retrom.nixosModules.retrom
      ];
    };
  };
}
```

---

### Retrom (Desktop Application) Setup

Enable the `retrom` desktop application with a minimal configuration:

```nix
programs.retrom.enable = true;
```

> [!NOTE]
> If you have an NVIDIA GPU, set `programs.retrom.supportNvidia = true;` to apply necessary workarounds for WebkitGTK.
>
> [!WARNING]
> Enabling `supportNvidia` sets `WEBKIT_DISABLE_DMABUF_RENDERER` to resolve issues with WebkitGTK on NVIDIA hardware. This causes fallback to software rendering, which may decrease performance. See [tauri-apps/tauri#9394](https://github.com/tauri-apps/tauri/issues/9394) for more information.

---

### Retrom-Service (Backend Server) Setup

Enable `retrom-service` in you NixOS configuration:

```nix
services.retrom = {
  enable = true;
  enableDatabase = true; # Enables and configures a local PostgreSQL database
  settings = {
    contentDirectories = [
      { path = "/app/library1/"; storageType = "MultiFileGame"; }
      { path = "/app/library2/"; storageType = "SingleFileGame"; }
    ];
    igdb = {
      clientId = "your_igdb_client_id";
      clientSecret = "your_igdb_client_secret";
    };
    steam = {
      apiKey = "your_steam_api_key";
      userId = "your_steam_user_id";
    };
  };
};
```

If you want to use a remote PostgreSQL instance, set `services.retrom.dbUrl` accordingly without enabling `services.retrom.enableDatabase` otherwise the local database will be configured.

> [!TIP]
> You can use `services.retrom.configFile` to provide a custom JSON config file for `retrom-service`. When set, this will override the `settings` option. This is useful for managing secrets with tools like sops or agenix.

> [!CAUTION]
> If you manually edit the config file, ensure it matches the Nix module’s expected structure to avoid inconsistencies.

Example config file:

```json
{
  "connection": {
    "port": 5101,
    "dbUrl": "postgres://retrom@localhost/retrom"
  },
  "contentDirectories": [
    { "path": "/app/library1/", "storageType": "MultiFileGame" },
    { "path": "/app/library2/", "storageType": "SingleFileGame" }
  ],
  "igdb": {
    "clientId": "your_igdb_client_id",
    "clientSecret": "your_igdb_client_secret"
  },
  "steam": {
    "apiKey": "your_steam_api_key",
    "userId": "your_steam_user_id"
  }
}
```

---

## Home Manager Module

The Home Manager module provides only the `retrom` desktop application (client). It does **not** provide the `retrom-service` backend.

### Adding the Flake to Home Manager

Add Retrom as an input in your `flake.nix`:

```nix
{
  inputs = {
    home-manager.url = "github:nix-community/home-manager";
    retrom = {
      url = "github:JMBeresford/retrom";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };
  outputs = { home-manager, retrom, ... }: {
    homeConfigurations.example = home-manager.lib.homeManagerConfiguration {
      modules = [
        retrom.homeModules.retrom
      ];
    };
  };
}
```

---

### Retrom (Desktop Application) Setup

Enable the `retrom` desktop application in your Home Manager configuration:

```nix
programs.retrom.enable = true;
```

> [!NOTE]
> If you have an NVIDIA GPU, set `programs.retrom.supportNvidia = true;` for compatibility.
>
> [!WARNING]
> Enabling `supportNvidia` sets `WEBKIT_DISABLE_DMABUF_RENDERER` to resolve issues with WebkitGTK on NVIDIA hardware. This causes fallback to software rendering, which may decrease performance. See [tauri-apps/tauri#9394](https://github.com/tauri-apps/tauri/issues/9394) for more information.
