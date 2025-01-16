#!/bin/bash

set -e

echo "Setting up permissions for user $USER"
chmod -R 775 /app/data
chmod -R 775 /app/config

exec runuser -u $USER -- "$@"
