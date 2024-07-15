#! /bin/sh
# docker buildx build --platform linux/amd64,linux/arm64 -t jameswrc/hastibackend --push . --no-cache
docker build --no-cache -t jameswrc/hastibackend --push .