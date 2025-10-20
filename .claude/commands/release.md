---
description: Create a new release of the Pulumi runner image
---

You are tasked with creating a new release of the Pulumi Azure Deployment Environments runner image. Follow these steps:

## Step 1: Determine Next Version Number

1. Use `git tag --list 'v*' --sort=-version:refname` to get all existing version tags
2. Parse the latest version tag (e.g., v0.1.0)
3. Increment the minor version (e.g., v0.1.0 → v0.2.0) unless the user specifies otherwise
4. Confirm the new version number with the user using AskUserQuestion

## Step 2: Update Runner Image Tags

1. Find all `environment.yaml` files in the `Environments/` directory using Glob
2. For each file, update the `runner:` field to use the new version tag
   - Current format is typically: `pulumi/azure-deployment-environments:latest` or `pulumi/azure-deployment-environments:v0.1.0`
   - Update to: `pulumi/azure-deployment-environments:<new-version>`
3. Use the Edit tool to update each file

## Step 3: Create Release Preparation PR

1. Create a new branch named `release/v<new-version>` (e.g., `release/v0.2.0`)
2. Commit the environment.yaml changes with message: "Prepare release v<new-version>"
3. Push the branch to origin
4. Create a PR titled "Prepare Release v<new-version>" with a body that:
   - Lists the changes since the last release
   - Mentions this prepares the release
   - Notes that merging will NOT trigger the release (that happens in step 3)
5. Note that opening a PR has the effect of doing a dry-run build of the docker image.

## Step 4: Tag and Push to Trigger Release

1. After the PR is merged (wait for user confirmation or check PR status)
2. Ensure you're on the main branch and pull the latest changes
3. Create an annotated git tag: `git tag -a v<new-version> -m "Release v<new-version>"`
4. Push the tag: `git push origin v<new-version>`
5. Inform the user that this will trigger the `docker-hub.yaml` workflow
6. Provide a link to monitor the workflow run

## Important Notes

- ALWAYS confirm the version number with the user before proceeding
- ALWAYS wait for user confirmation before pushing the tag in step 3
- The docker-hub.yaml workflow will automatically build and push to Docker Hub when a version tag is pushed
- After successful release, suggest updating issue #3 with the release information
