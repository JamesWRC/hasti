#!/usr/bin/env bash
read -p "Enter region ('develop' or 'production'): " region

if [ $region = "develop" ]; then
    echo "Stopping development environment 'HAST_DEV'..."
    sleep 5
    docker compose -p 'HASTI_DEV' -f docker-compose.dev.yml down
fi

if [ $region = "production" ]; then
    echo "Stopping production environment 'HASTI_PROD'..."
    sleep 5
    docker compose -p 'HASTI_PROD' down
fi