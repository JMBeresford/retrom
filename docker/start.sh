#!/bin/bash

set -e

# Start the web server
cd /app/web
pnpm preview &

# Start the API server
cd /app

./retrom-service &

wait -n

exit $?
