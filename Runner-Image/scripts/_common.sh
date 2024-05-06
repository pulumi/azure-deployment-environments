#!/bin/bash

# Copyright 2024, Pulumi Corporation.

pulumiLogin() {
    export PULUMI_ACCESS_TOKEN_SECRET=$(echo $ADE_OPERATION_PARAMETERS | jq -r '.pulumiAccessTokenSecret')
    if [ ! -z "$PULUMI_ACCESS_TOKEN_SECRET" ]; then
        echo "Signing into Azure using MSI"
        while true; do
            # managed identity isn't available immediately
            # we need to do retry after a short nap
            az login --identity --allow-no-subscriptions --only-show-errors --output none && {
                echo "Successfully signed into Azure"
                break
            } || sleep 5
        done
        echo -e "\n>>> Retrieving PULUMI_ACCESS_TOKEN from KeyVault...\n"
        export PULUMI_ACCESS_TOKEN=$(az keyvault secret show --id $PULUMI_ACCESS_TOKEN_SECRET | jq -r '.value')
    else
        export PULUMI_ACCESS_TOKEN=$(echo $ADE_OPERATION_PARAMETERS | jq -r '.pulumiAccessToken')
    fi

    if [ ! -z "$PULUMI_ACCESS_TOKEN" ]; then
        echo -e "\n>>> Pulumi Cloud Login...\n"
        pulumi login
    else
        echo -e "\n>>> Pulumi Local Login...\n"
        mkdir -p $ADE_STORAGE
        export PULUMI_CONFIG_PASSPHRASE=
        pulumi login file://$ADE_STORAGE
    fi

    # Set up Pulumi Azure Native managed identity.
    export ARM_USE_MSI=true
    export ARM_CLIENT_ID=$ADE_CLIENT_ID
    export ARM_TENANT_ID=$ADE_TENANT_ID
    export ARM_SUBSCRIPTION_ID=$ADE_SUBSCRIPTION_ID
}
