{
  config,
  lib,
  pkgs,
  ...
}:
let
  cfg = config.services.retrom;
  defaultPort = 5101;
  dbUrl =
    if !isNull cfg.dbUrl then
      cfg.dbUrl
    else if cfg.enableDatabase then
      "postgres:///retrom?host=/var/run/postgresql"
    else
      null;
  connection =
    lib.optionalAttrs (cfg.port != defaultPort) { inherit (cfg) port; }
    // lib.optionalAttrs (!isNull dbUrl) { inherit dbUrl; };
  settings = cfg.settings // lib.optionalAttrs (connection != { }) { inherit connection; };
  initialConfigFile = pkgs.writeText "retrom-service-config.json" (builtins.toJSON settings);
  configFilePath =
    if !isNull cfg.configFile then
      cfg.configFile
    else if settings != { } then
      "${cfg.dataDir}/.config/retrom/server/config.json"
    else
      null;
  seedConfig = isNull cfg.configFile && settings != { };
in {
  options.services.retrom = {
    enable = lib.mkEnableOption "Enable Retrom service.";
    package = lib.mkOption {
      type = lib.types.package;
    };
    user = lib.mkOption {
      type = lib.types.str;
      default = "retrom";
      description = "System user to use for retrom systemd service.";
    };
    group = lib.mkOption {
      type = lib.types.str;
      default = "retrom";
      description = "System group to use for retrom systemd service.";
    };
    dataDir = lib.mkOption {
      type = lib.types.str;
      default = "/var/lib/retrom";
      description = "Directory to store service data. Will be set as the service user's home.";
    };
    enableDatabase = lib.mkEnableOption "Configure the local postgresql database for Retrom.";
    dbUrl = lib.mkOption {
      type = lib.types.nullOr lib.types.str;
      default = null;
      description = "URL for the database. If not set will point to local database.";
    };
    port = lib.mkOption {
      type = lib.types.int;
      default = defaultPort;
      description = "Port to run the service on. If configFile is set this will only have effect with the openFirewall option.";
    };
    openFirewall = lib.mkEnableOption "Open firewall for TCP port.";
    settings = lib.mkOption {
      type = lib.types.anything;
      default = { };
      description = ''
        Initial settings for the Retrom service. If this is set, the module
        seeds a writable configuration file before the first service start.
        Existing configuration files are left in place so Retrom can update its
        own server configuration at runtime.
      '';
    };
    configFile = lib.mkOption {
      type = lib.types.nullOr lib.types.str;
      default = null;
      description = ''
        Path to the configuration file. If unset and no initial settings are
        needed, RETROM_CONFIG is left unset and Retrom uses its default writable
        configuration path. This can point at an immutable generated file when
        fully declarative configuration is desired.
      '';
    };
  };

  config = lib.mkIf cfg.enable {
    users = {
      users.${cfg.user} = {
        home = cfg.dataDir;
        createHome = true;
        isSystemUser = true;
        group = cfg.group;
      };
      groups.${cfg.group} = { };
    };

    services.postgresql = lib.mkIf cfg.enableDatabase {
      enable = true;
      ensureUsers = [
        {
          name = cfg.user;
          ensureDBOwnership = true;
        }
      ];
      ensureDatabases = [ "retrom" ];
      authentication = ''
        local retrom ${cfg.user} peer
      '';
    };

    systemd.services.retrom = {
      description = "Retrom Service";
      after = [
        "network.target"
        "postgresql.target"
      ];

      wantedBy = [ "multi-user.target" ];

      preStart = lib.mkIf seedConfig ''
        config_file=${lib.escapeShellArg configFilePath}
        mkdir -p "$(dirname "$config_file")"

        if [ ! -e "$config_file" ]; then
          install -m 0640 ${initialConfigFile} "$config_file"
        fi
      '';

      serviceConfig = {
        ExecStart = "${lib.getExe cfg.package}";
        Restart = "on-failure";
        User = cfg.user;
        Group = cfg.group;
        WorkingDirectory = cfg.dataDir;
        Environment =
          [
            "RETROM_DATA_DIR=${cfg.dataDir}"
          ]
          ++ lib.optional (!isNull configFilePath) "RETROM_CONFIG=${configFilePath}";
      };
    };

    networking.firewall.allowedTCPPorts = lib.mkIf cfg.openFirewall [ cfg.port ];
  };
}
