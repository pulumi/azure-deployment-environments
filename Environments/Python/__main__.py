"""An Azure Python Pulumi program"""

import pulumi
from pulumi_azure_native import storage

config = pulumi.Config()
resource_group_name = config.require("resource-group-name")
sku_name = config.get("sku") or storage.SkuName.STANDARD_LRS

account = storage.StorageAccount(
    "sa",
    resource_group_name=resource_group_name,
    sku=storage.SkuArgs(
        name=sku_name,
    ),
    kind=storage.Kind.STORAGE_V2,
)

pulumi.export("saname", account.name)
