import * as pulumi from "@pulumi/pulumi";
import * as storage from "@pulumi/azure-native/storage";

const config = new pulumi.Config();
const resourceGroupName = config.require("resource-group-name");
const skuName = config.get("sku") ?? "Standard_LRS";

const storageAccount = new storage.StorageAccount("sa", {
    resourceGroupName: resourceGroupName,
    sku: {
        name: skuName,
    },
    kind: storage.Kind.StorageV2,
});

export const saname = storageAccount.name;