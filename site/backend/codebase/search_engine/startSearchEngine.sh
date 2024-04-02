#!/usr/bin/env bash
read -p "Enter region ('develop' or 'production'): " region

if [ $region = "develop" ]; then
    echo "Starting development environment 'HAST_DEV'..."
    sleep 5
    docker compose -p 'HAST_DEV' up -d
fi

if [ $region = "production" ]; then
    echo "Starting production environment 'HAST_PROD'..."
    sleep 5
    docker compose -p 'HAST_PROD' up -d
fi