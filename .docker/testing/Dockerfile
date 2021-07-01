# Dockerfile for gsa-$VERSION-$COMPILER-testing

# Define ARG we use through the build
ARG VERSION=master
ARG BUILD_TYPE=Debug
ARG COMPILER=gcc

# We want gvm-libs to be ready so we use the build docker image of gvm-libs
FROM greenbone/gvm-libs-$VERSION-$COMPILER-build

# This will make apt-get install without question
ARG DEBIAN_FRONTEND=noninteractive

# Install node.js and yarn for gsa
# Install Debian core dependencies required for building gsad
RUN apt-get update && apt-get install --assume-yes \
    nodejs \
    yarnpkg \
    libmicrohttpd-dev \
    libxml2-dev \
    libxslt1-dev \
    && rm -rf /var/lib/apt/lists/*
