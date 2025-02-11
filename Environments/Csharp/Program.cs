using Pulumi;
using Pulumi.AzureNative.Storage;
using Pulumi.AzureNative.Storage.Inputs;
using System.Collections.Generic;

return await Deployment.RunAsync(() =>
{
    var config = new Config();
    
    // Get the resource group name provisioned by ADE.
    var resourceGroupName = config.Require("resource-group-name");

    // Get the configuration parameter passed by the user.
    var skuName = config.Get("sku") ?? "Standard_LRS";

    // Deploy the storage account.
    var storageAccount = new StorageAccount("sa", new StorageAccountArgs
    {
        ResourceGroupName = resourceGroupName,
        Sku = new SkuArgs
        {
            Name = skuName
        },
        Kind = Kind.StorageV2
    });

    // Return outputs.
    return new Dictionary<string, object?>{
        ["saname"] = storageAccount.Name
    };
});
