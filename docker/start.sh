#!/bin/bash

set -e

# Start the web server
cd /app/www
pnpm --filter web preview &

# Start the API server
cd /app

./retrom-service
