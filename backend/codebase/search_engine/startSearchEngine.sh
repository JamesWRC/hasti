#!/usr/bin/env bash
read -p "Enter region ('develop' or 'production'): " region

if [ $region = "develop" ]; then
    echo "Starting development environment 'HASTI_DEV'..."
    sleep 5
    docker compose -p 'HASTI_DEV' up -d
fi

if [ $region = "production" ]; then
    echo "Starting production environment 'HASTI_PROD'..."
    sleep 5
    docker compose -p 'HASTI_PROD' up -d
fi