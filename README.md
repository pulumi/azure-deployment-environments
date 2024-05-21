## Integrating Pulumi with Azure Deployment Environments

This repository contains examples of how to use the [Pulumi](https://pulumi.com) Infrastructure-as-Code tool to provision custom environments in [Azure Deployment Environments](https://azure.microsoft.com/products/deployment-environments).

Repository structure is shown below.

### Runner-Image

The Pulumi team provides a sample image to get you started, which you can see in the [Runner-Image](https://github.com/pulumi/azure-deployment-environments/tree/main/Runner-Image) folder. This image is publicly available at Pulumi's Docker Hub as [`pulumi/azure-deployment-environments`](https://hub.docker.com/repository/docker/pulumi/azure-deployment-environments), so you can use it directly from your ADE environment defitions.

You can also use it as a base image or as a starting point to create your own custom image. You can use [our Pulumi program](https://github.com/pulumi/azure-deployment-environments/tree/main/Provisioning/custom-image) or [a GitHub workflow](https://github.com/pulumi/azure-deployment-environments/blob/main/.github/workflows/build-and-push-image.yml) to push the image to your own Azure Container Registry instance.

### Environments

The [Environments](https://github.com/pulumi/azure-deployment-environments/tree/main/Environments) folder contains sample environment defitinitions, examples of how to use the runner image to provision custom environments in ADE. Each subfolder contains an example for a particular Pulumi programming language.

### Provisioning

#### Custom Image

The [Provisioning/custom-image](https://github.com/pulumi/azure-deployment-environments/tree/main/Provisioning/custom-image) folder contains an example of how to use push a custom container image into a newly created Azure Container Registry, so that it can be used from within your Azure Deployment Environments.

#### ADE

The [Provisioning/ade](https://github.com/pulumi/azure-deployment-environments/tree/main/Provisioning/ade) folder contains an example of how to use Pulumi to provision a sample Dec Center instance and integrate it with a catalog of Pulumi-enabled environment defitions.
