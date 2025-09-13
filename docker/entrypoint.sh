#!/bin/bash

umask ${UMASK}
if [ "$(id -u)" = 0 ] && [ -n "$ULIMIT_FILE_LIMIT" ]; then
    ulimit -n "$ULIMIT_FILE_LIMIT"
fi

## VARIABLES
SEP="\n------------------------------------------"

read -r -d '' USERMOD_ERROR << EOF
Could not execute usermod, is the container not running as root?

If rootless mode is enabled, use the --user flag to specify a user with the correct permissions
for your host system. So long as the user and group IDs are the same in the container as they are
on the host, you can *probably* ignore resulting permission errors.

Retrom may not work correctly if the user and group IDs are not set correctly!!!
EOF

declare -a app_dirs=("/app/config" "/app/data" "/app/web" "/app/psql")

## RUNTIME
echo -e $SEP
echo -e "Running usermod\n"

(usermod -o -u ${PUID} retrom && groupmod -o -g ${PGID} retrom) || echo "$USERMOD_ERROR" 1>&2

echo "Retrom UID: $(id -u retrom)"
echo "Retrom GID: $(id -g retrom)"

echo -e $SEP

chown retrom:retrom /app
for i in "${app_dirs[@]}"; do
    if [  -d "$i" ]; then
        echo -e "Setting permissions for ${i}\n"
        chmod "=rwx" "$i"

        find "$i" \( ! -user retrom -or ! -group retrom \) -exec chown retrom:retrom {} +
    fi
done

# psql db dir needs 700 or 750 permissions
chmod 750 /app/data/db

if [ "$(id -u)" = 0 ]; then
    exec runuser -u retrom "$@"
else
    exec "$@"
fi

