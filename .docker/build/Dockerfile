# Dockerfile for gsa-$VERSION-$COMPILER-build

# Define ARG we use through the build
ARG VERSION=master
ARG BUILD_TYPE=Debug
ARG COMPILER=gcc

FROM greenbone/gsa-$VERSION-$COMPILER-testing

# This will make apt-get install without question
ARG DEBIAN_FRONTEND=noninteractive

COPY . /usr/local/src/gsa
WORKDIR /usr/local/src

# clone and install gsa
RUN cd gsa && \
    mkdir build && \
    cd build && \
    cmake -DCMAKE_BUILD_TYPE=Release .. && \
    make install
