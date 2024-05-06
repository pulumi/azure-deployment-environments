#!/bin/bash

# Copyright 2024, Pulumi Corporation.

set -e # exit on error

DIR=$(dirname "$0")
source  $DIR/_common.sh

echo -e "\n>>> Pulumi/.NET/Node/Python Versions...\n"
pulumi version
dotnet --version
node --version
python --version

# Login to Pulumi (Cloud or Local)
pulumiLogin

echo -e "\n>>> Initializing Pulumi Stack...\n"
pulumi stack select $ADE_ENVIRONMENT_NAME --create

export PULUMI_CONFIG_FILE=$ADE_STORAGE/Pulumi.$ADE_ENVIRONMENT_NAME.yaml

echo -e "\n>>> Setting Pulumi Configuration...\n"
pulumi config set azure-native:location $ADE_ENVIRONMENT_LOCATION --config-file $PULUMI_CONFIG_FILE
pulumi config set resource-group-name $ADE_RESOURCE_GROUP_NAME --config-file $PULUMI_CONFIG_FILE
echo "$ADE_OPERATION_PARAMETERS" | jq -r 'to_entries|.[]|[.key, .value] | @tsv' |
  while IFS=$'\t' read -r key value; do
    if [ "$key" != "pulumiAccessToken" ] && [ "$key" != "pulumiAccessTokenSecret" ]; then
      pulumi config set $key $value --config-file $PULUMI_CONFIG_FILE
    fi
  done

echo -e "\n>>> Restore dependencies...\n"
if [ -f "package.json" ]; then
   npm install --logevel error
fi

echo -e "\n>>> Running Pulumi Up...\n"
pulumi up --refresh --yes --config-file $PULUMI_CONFIG_FILE

# Save outputs.
stackout=$(pulumi stack output --json | jq -r 'to_entries|.[]|{(.key): {type: "string", value: (.value)}}')
echo "{\"outputs\": ${stackout:-{\}}}" > $ADE_OUTPUTS
echo "Outputs successfully generated for ADE"