# Dockerfile for gsa-$VERSION-$COMPILER-testing

# Define ARG we use through the build
ARG VERSION=main
ARG BUILD_TYPE=Debug
ARG COMPILER=gcc

# This will make apt-get install without question
ARG DEBIAN_FRONTEND=noninteractive

# Install curl and gnupg to add remote repositories
# Add repository for yarn & nodejs
RUN apt-get update && apt-get install --assume-yes \
    curl \
    gnupg \
 && rm -rf /var/lib/apt/lists/* \
 && curl --silent --show-error \
    https://dl.yarnpkg.com/debian/pubkey.gpg \
    | apt-key add - && \
    echo "deb http://dl.yarnpkg.com/debian/ stable main" \
    > /etc/apt/sources.list.d/yarn.list \
 && curl --silent --show-error \
    https://deb.nodesource.com/gpgkey/nodesource.gpg.key \
    | apt-key add - && \
    echo "deb https://deb.nodesource.com/node_14.x buster main" \
    > /etc/apt/sources.list.d/nodesource.list

# Install node.js and yarn for gsa
# Install Debian core dependencies required for building gsad

RUN apt-get update && apt-get install --assume-yes \
    libmicrohttpd-dev \
    nodejs \
    yarn \
    libxml2-dev \
    libxslt1-dev \
    && rm -rf /var/lib/apt/lists/*
