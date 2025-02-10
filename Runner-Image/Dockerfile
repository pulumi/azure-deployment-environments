# Copyright 2024, Pulumi Corporation.

ARG BASE_IMAGE=acradamasmarimageupdates.azurecr.io/deployment-environments/runners/core
ARG IMAGE_VERSION=dual-6.0.0

FROM ${BASE_IMAGE}:${IMAGE_VERSION}
WORKDIR /

ARG IMAGE_VERSION

# Metadata as defined at http://label-schema.org
ARG BUILD_DATE

# install pulumi
RUN tdnf install -y tar gzip
RUN tdnf install -y curl
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
RUN tdnf install -y nodejs npm
RUN npm install typescript -g

# Grab all .sh files from scripts, copy to
# root scripts, replace line-endings and make them all executable
COPY scripts/* /scripts/
RUN find /scripts/ -type f -iname "*.sh" -exec dos2unix '{}' '+'
RUN find /scripts/ -type f -iname "*.sh" -exec chmod +x {} \;
