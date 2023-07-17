# Here is a basic script to build the container.


# docker buildx build --platform linux/amd64,linux/arm64 --build-arg BUILD_ENV=dev --pull --rm -f "Dockerfile" -t jameswrc/dauthbackend:latest "." 

docker buildx build --push --platform linux/arm64/v8 --build-arg BUILD_ENV=dev --pull --rm -f "Dockerfile" -t jameswrc/dauthbackend:arm64v8 "."
# docker buildx build --push --platform linux/arm64 --build-arg BUILD_ENV=dev --pull --rm -f "Dockerfile" -t jameswrc/dauthbackend:arm64 "."
# docker buildx build --push --platform linux/amd64 --build-arg BUILD_ENV=dev --pull --rm -f "Dockerfile" -t jameswrc/dauthbackend:amd64 "."

# docker manifest create \
# jameswrc/dauthbackend:latest \
# --amend jameswrc/dauthbackend:arm64v8 \
# --amend jameswrc/dauthbackend:arm64 \
# --amend jameswrc/dauthbackend:amd64 \

# docker manifest push jameswrc/dauthbackend:latest