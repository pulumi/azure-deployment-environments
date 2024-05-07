import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";
import * as resources from "@pulumi/azure-native/resources";
import * as containerregistry from "@pulumi/azure-native/containerregistry/v20231101preview";

const resourceGroup = new resources.ResourceGroup("ade-registry-rg");

const registry = new containerregistry.Registry("ade-registry", {
    resourceGroupName: resourceGroup.name,
    sku: {
        name: "Standard",
    },
    adminUserEnabled: true,
    anonymousPullEnabled: true,
});

const credentials = containerregistry.listRegistryCredentialsOutput({
    resourceGroupName: resourceGroup.name,
    registryName: registry.name,
});
const adminUsername = credentials.apply((c: containerregistry.ListRegistryCredentialsResult) => c.username!);
const adminPassword = credentials.apply((c: containerregistry.ListRegistryCredentialsResult) => c.passwords![0].value!);

// TODO: set the image version
const version = "0.1.0";

const image = new docker.Image("ade-pulumi", {
    imageName: pulumi.interpolate`${registry.loginServer}/ade-pulumi:v${version}`,
    build: { context: "../../Runner-Image" },
    registry: {
        server: registry.loginServer,
        username: adminUsername,
        password: adminPassword,
    },
});

export const imageName = image.imageName;
