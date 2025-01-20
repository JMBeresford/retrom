#!/bin/bash

function on_error() {
    echo "Error in retrom startup script, line $1"
    exit 1
}

trap 'on_error $LINENO' ERR

# Start the web server
cd /app/web
pnpm preview &

# Start the API server
cd /app

./retrom-service &

wait -n

exit $?
