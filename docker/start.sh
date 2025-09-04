#!/bin/bash

function on_error() {
    echo "Error in retrom startup script, line $1"
    exit 1
}

trap 'on_error $LINENO' ERR
ulimit -n 65536

# Start the web server
cd /app/web
VITE_RETROM_LOCAL_SERVICE_HOST=http://localhost:5101 pnpm vite preview &

# Start the API server
cd /app

./retrom-service &

wait -n

exit $?
