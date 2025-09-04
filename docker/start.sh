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
web_pid=$!

# Start the API server
cd /app

./retrom-service &
api_pid=$!

function kill_children() {
    kill $web_pid $api_pid
    wait $web_pid $api_pid
    exit 0
}

trap kill_children SIGINT SIGTERM

wait -n

exit $?
