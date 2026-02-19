{
  config,
  lib,
  pkgs,
  ...
}:
let
  cfg = config.services.retrom;
  pgPort = config.services.postgresql.settings.port;
  settings = cfg.settings // {
    connection = {
      inherit (cfg) port;
      dbUrl = cfg.dbUrl or "postgres://${cfg.user}@localhost:${toString pgPort}/${cfg.user}";
    };
  };
  configFile = cfg.configFile or pkgs.writeText "retrom-service-config.json" (builtins.toJSON settings);
in
{
  options.services.retrom = {
    enable = lib.mkEnableOption "Enable Retrom service.";
    package = lib.mkOption {
      type = lib.types.package;
    };
    user = lib.mkOption {
      type = lib.types.str;
      default = "retrom";
      description = "System and database user to use for Retrom.";
    };
    dataDir = lib.mkOption {
      type = lib.types.str;
      default = "/var/lib/retrom-service";
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
      default = 5101;
      description = "Port to run the service on. If configFile is set this will only have effect with the openFirewall option.";
    };
    openFirewall = lib.mkEnableOption "Open firewall for TCP port.";
    settings = lib.mkOption {
      type = lib.types.anything;
      default = { };
      description = "Settings for retrom service. If configFile is set these will be ignored.";
    };
    configFile = lib.mkOption {
      type = lib.types.nullOr lib.types.str;
      default = null;
      description = "Path to the configuration file. If this is set settings will be replaced by it.";
    };
  };

  config = lib.mkIf cfg.enable {
    users = {
      users.${cfg.user} = {
        home = cfg.dataDir;
        createHome = true;
        isSystemUser = true;
        group = cfg.user;
      };
      groups.${cfg.user} = { };
    };

    services.postgresql = lib.mkIf cfg.enableDatabase {
      enable = true;
      ensureUsers = [
        {
          name = cfg.user;
          ensureDBOwnership = true;
        }
      ];
      ensureDatabases = [ cfg.user ];
      authentication = ''
        local ${cfg.user} ${cfg.user} trust
        host ${cfg.user} ${cfg.user} 127.0.0.1/32 trust
        host ${cfg.user} ${cfg.user} ::1/128 trust
      '';
    };

    systemd.services.retrom = {
      description = "Retrom Service";
      after = [
        "network.target"
        "postgresql.target"
      ];

      wantedBy = [ "multi-user.target" ];

      serviceConfig = {
        ExecStart = "${lib.getExe cfg.package}";
        Restart = "on-failure";
        User = cfg.user;
        Group = cfg.user;
        WorkingDirectory = cfg.dataDir;
        Environment = [
          "RETROM_DATA_DIR=${cfg.dataDir}"
          "RETROM_CONFIG=${configFile}"
        ];
      };
    };

    networking.firewall.allowedTCPPorts = lib.mkIf cfg.openFirewall [ cfg.port ];
  };
}
