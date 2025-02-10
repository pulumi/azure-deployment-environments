# Copyright 2024, Pulumi Corporation.

ARG BASE_IMAGE=mcr.microsoft.com/deployment-environments/runners/core
ARG IMAGE_VERSION=latest

FROM ${BASE_IMAGE}:${IMAGE_VERSION}
WORKDIR /

ARG IMAGE_VERSION

# Metadata as defined at http://label-schema.org
ARG BUILD_DATE

# install pulumi
RUN apk add curl || \
    (echo "Failed to install curl with apk, trying with tdnf" && \
    tdnf install -y tar gzip && \
    tdnf install -y curl)
RUN curl -fsSL https://get.pulumi.com | sh
ENV PATH="${PATH}:/root/.pulumi/bin"
RUN pulumi plugin install resource azure-native

# install dotnet
RUN wget https://dot.net/v1/dotnet-install.sh -O dotnet-install.sh
RUN chmod +x ./dotnet-install.sh
RUN ./dotnet-install.sh --version latest
ENV DOTNET_ROOT="/root/.dotnet"
ENV PATH="${PATH}:/root/.dotnet:/root/.dotnet/tools"

# install node.js
RUN apk add nodejs npm || \
    (echo "Failed to install nodejs and npm with apk, trying with tdnf" && \
    tdnf install -y nodejs npm)
RUN npm install typescript -g

# Grab all .sh files from scripts, copy to
# root scripts, replace line-endings and make them all executable
COPY scripts/* /scripts/
RUN find /scripts/ -type f -iname "*.sh" -exec dos2unix '{}' '+'
RUN find /scripts/ -type f -iname "*.sh" -exec chmod +x {} \;
