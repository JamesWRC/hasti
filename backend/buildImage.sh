#! /bin/sh
docker buildx build --platform linux/arm64 -t jameswrc/hastibackend --push . --no-cache
