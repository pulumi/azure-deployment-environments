import * as pulumi from "@pulumi/pulumi";
import * as authorization from "@pulumi/azure-native/authorization";
import * as resources from "@pulumi/azure-native/resources";
import * as devcenter from "@pulumi/azure-native/devcenter";
import * as keyvault from "@pulumi/azure-native/keyvault";
import * as operationalinsights from "@pulumi/azure-native/operationalinsights";
import * as insights from "@pulumi/azure-native/insights";

const config = pulumi.output(authorization.getClientConfig());
const currentUserPrincipalId = config.objectId;
const subscriptionId = config.subscriptionId;

function subscriptionResourceId(resourceId: string) {
    return pulumi.interpolate`/subscriptions/${subscriptionId}/providers/Microsoft.Authorization/roleDefinitions/${resourceId}`;
}
const userRole = subscriptionResourceId('18e40d4e-8d2e-438d-97e1-9528336e149c')
const ownerRole = subscriptionResourceId('8e3af657-a8ff-443c-a75c-2fe8c4bcb635')

// Create an Azure Resource Group
const resourceGroup = new resources.ResourceGroup("azuredevenv");

const workspace = new operationalinsights.Workspace("workspace", {
    resourceGroupName: resourceGroup.name,
});

const devcent = new devcenter.DevCenter("devcenter", {
    resourceGroupName: resourceGroup.name,
    identity: {
        type: "SystemAssigned",
    },
});

new authorization.RoleAssignment("devcenter-owner", {
    scope: pulumi.interpolate`/subscriptions/${subscriptionId}`,
    principalType: "ServicePrincipal",
    principalId: devcent.identity.apply(id => id!.principalId),
    roleDefinitionId: ownerRole,
});

const secretsRead = new keyvault.AccessPolicy("secrets-read", {
    resourceGroupName: "pulumi-dev-shared",
    vaultName: "pulumi-testing",
    policy: {
        objectId: devcent.identity.apply(id => id!.principalId),
        tenantId: config.tenantId,
        permissions: {
            secrets: [ "get" ],
        },
    },
});

new insights.DiagnosticSetting("devcenter-logs", {
    name: "logs",
    resourceUri: devcent.id,
    workspaceId: workspace.id,
    logs: [{
        categoryGroup: 'audit',
        enabled: true
      },
      {
        categoryGroup: 'allLogs',
        enabled: true
      }]
})

const envtype = new devcenter.EnvironmentType("dev", {
    resourceGroupName: resourceGroup.name,
    devCenterName: devcent.name,
});

const proj = new devcenter.Project("project", {
    resourceGroupName: resourceGroup.name,
    devCenterId: devcent.id,
    tags: {
        "CreatedBy": "Pulumi", // It will propagate to environments' resource groups.
    },
});

new authorization.RoleAssignment("project-role", {
    scope: proj.id,
    principalType: "User",
    principalId: currentUserPrincipalId,
    roleDefinitionId: userRole,
});

const projEnvType = new devcenter.ProjectEnvironmentType("dev", {
    resourceGroupName: resourceGroup.name,
    projectName: proj.name,
    identity: {
        type: "SystemAssigned",
    },
    deploymentTargetId: pulumi.interpolate`/subscriptions/${subscriptionId}`,
    status: "Enabled",
    creatorRoleAssignment: {
        // https://github.com/Azure-Samples/azd-deployment-environments/blob/main/infra/core/devcenter/project-environment-type.bicep#L38
        roles: ['8e3af657-a8ff-443c-a75c-2fe8c4bcb635',
        'b24988ac-6180-42a0-ab88-20f7382dd24c',
        'acdd72a7-3385-48ef-bd42-f606fba81ae7'],
    }
});

new authorization.RoleAssignment("project-env-role", {
    scope: projEnvType.id,
    principalType: "User",
    principalId: currentUserPrincipalId,
    roleDefinitionId: userRole,
});

new authorization.RoleAssignment("projEnvType-owner", {
    scope: pulumi.interpolate`/subscriptions/${subscriptionId}`,
    principalType: "ServicePrincipal",
    principalId: projEnvType.identity.apply(id => id!.principalId),
    roleDefinitionId: ownerRole,
});

const cfg = new pulumi.Config();
const keyVaultName = cfg.require("keyVaultName");
const keySecretName = cfg.require("keySecretName");

new keyvault.AccessPolicy("secrets-read-msi", {
    resourceGroupName: "pulumi-dev-shared",
    vaultName: keyVaultName,
    policy: {
        objectId: projEnvType.identity.apply(id => id!.principalId),
        tenantId: config.tenantId,
        permissions: {
            secrets: [ "get" ],
        },
    },
});

new devcenter.Catalog("pulumi", {
    resourceGroupName: resourceGroup.name,
    devCenterName: devcent.name,
    gitHub: {
        uri: "https://github.com/pulumi/azure-deployment-environments.git",
        path: "Environments",
        branch: "main",
        secretIdentifier: `https://${keyVaultName}.vault.azure.net/secrets/${keySecretName}`,
    },
}, { dependsOn: [secretsRead] });
