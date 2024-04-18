#! /bin/sh
# docker buildx build --platform linux/amd64,linux/arm64 -t jameswrc/hastibackend --push . --no-cache
docker buildx build --platform linux/amd64 -t jameswrc/hastibackend --push . --no-cache
