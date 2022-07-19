ARG VERSION=stable
ARG DEBIAN_FRONTEND=noninteractive

FROM debian:stable-slim as builder

ENV NODE_VERSION=node_14.x
ENV NODE_KEYRING=/usr/share/keyrings/nodesource.gpg
ENV DISTRIBUTION=bullseye
ENV YARN_KEYRING=/usr/share/keyrings/yarn.gpg

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    gnupg

RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource.gpg.key | gpg --dearmor | tee "$NODE_KEYRING" >/dev/null && \
    echo "deb [signed-by=$NODE_KEYRING] https://deb.nodesource.com/$NODE_VERSION $DISTRIBUTION main" | tee /etc/apt/sources.list.d/nodesource.list
RUN curl -fsSL https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor | tee "$YARN_KEYRING" >/dev/null && \
    echo "deb [signed-by=$YARN_KEYRING] https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list


# Install Debian core dependencies required for building gvm with PostgreSQL
# support and not yet installed as dependencies of gvm-libs-core
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    nodejs \
    yarn && \
    rm -rf /var/lib/apt/lists/*

COPY . /source
WORKDIR /source

RUN yarn && yarn build

FROM greenbone/gsad:${VERSION}

COPY --from=builder /source/build /usr/local/share/gvm/gsad/web/
