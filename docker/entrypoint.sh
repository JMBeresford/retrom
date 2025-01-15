#!/bin/bash

set -e

echo "Setting up permissions for user $USER"
chown -R $USER /app

exec runuser -u $USER -- "$@"
