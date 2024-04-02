read -p "Enter region ('develop' or 'production'): " region

if [ $1 = "develop" ]; then
    echo "Stopping development environment 'HAST_DEV'..."
    sleep 5
    docker compose -p 'HAST_DEV' up -d
fi

if [ $1 = "production" ]; then
    echo "Stopping production environment 'HAST_PROD'..."
    sleep 5
    docker compose -p 'HAST_PROD' up -d
fi