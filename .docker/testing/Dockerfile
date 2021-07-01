# Dockerfile for gsa-$VERSION-$COMPILER-testing

# Define ARG we use through the build
ARG VERSION=master
ARG BUILD_TYPE=Debug
ARG COMPILER=gcc

# We want gvm-libs to be ready so we use the build docker image of gvm-libs
FROM greenbone/gvm-libs-$VERSION-$COMPILER-build

# This will make apt-get install without question
ARG DEBIAN_FRONTEND=noninteractive

# Install curl and gnupg to add remote repositories
RUN apt-get update && apt-get install --assume-yes \
    curl \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# Add repository for yarn
RUN curl --silent --show-error \
    https://dl.yarnpkg.com/debian/pubkey.gpg \
    | apt-key add - && \
    echo "deb http://dl.yarnpkg.com/debian/ stable main" \
    > /etc/apt/sources.list.d/yarn.list

# Add repository for node.js
RUN curl --silent --show-error \
    https://deb.nodesource.com/gpgkey/nodesource.gpg.key \
    | apt-key add - && \
    echo "deb http://deb.nodesource.com/node_10.x buster main" \
    > /etc/apt/sources.list.d/nodesource.list

# Install node.js and yarn for gsa
RUN apt-get update && apt-get install --assume-yes \
    nodejs \
    yarn \
    && rm -rf /var/lib/apt/lists/*

# Install Debian core dependencies required for building gsad
RUN apt-get update && apt-get install --assume-yes \
    libmicrohttpd-dev \
    libxml2-dev \
    libxslt1-dev \
    && rm -rf /var/lib/apt/lists/*
