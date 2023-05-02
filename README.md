# Node-RED by FlowForge CtrlX app

## Key Features

- Enterprise support option
- Custom nodes required for OT deployments that are supported by FlowForge
- Node-RED Dashboard for easy data visualization and interaction
- Node-RED’s intuitive, low-code development environment

## Installation Procedure

Follow these steps to install the Rexroth CtrlX App by FlowForge on your ctrlX device:

1. In the ctrlX CORE web interface, navigate to the window **Settings** ➔ **Apps**.

2. Switch the ctrlX device to the **Service** mode.

3. In the app overview, navigate to the category **Available apps**. This category displays all apps saved in the app storage on the ctrlX device and all apps provided via the ctrlX Store.

4. Search for the Rexroth CtrlX App to be installed and click on the Install button. If multiple app versions are provided for installation, a list of available versions and app sources will be displayed. In this case, select the desired app version from the list to start the installation. If only one app version is provided, the installation will start directly. After the installation, the app will be shown in the app overview, under the category **Installed apps**.

5. Switch the ctrlX device back to the **Operating** mode.

## Start and Login

1. Open the Flow Editor from the Node-RED menu in your ctrlX.
  
2. Log in using your ctrlX username and password.
  
3. A successful login requires a valid license and user permission.
  
4. Create your Node-RED flow.

## Building the Application

The app can be built for multiple architectures, specifically amd64 and arm64. The build process is managed using bash scripts or a GitHub Actions workflow.

### Build Scripts

There are two build scripts available for building the application:

1. **build-snap-amd64.sh**

This script is used to build the application for the amd64 architecture. The script executes the following commands:

```
#!/usr/bin/env bash
snapcraft clean --destructive-mode
snapcraft --destructive-mode --target-arch=amd64 --enable-experimental-target-arch
```

2. **build-snap-arm64.sh**

This script is used to build the application for the arm64 architecture. The script executes the following commands:

```
#!/usr/bin/env bash
snapcraft clean --destructive-mode
snapcraft --destructive-mode --target-arch=arm64 --enable-experimental-target-arch
```

### GitHub Actions Workflow

The build process is automated using a GitHub Actions workflow, defined in the file `.github/workflows/snapbuild_ctrlx.yml`. The workflow is triggered manually using the `workflow_dispatch` event.

The workflow contains a single job named `build`, which runs on an `ubuntu-latest` environment. The job uses a matrix strategy to build the application for both amd64 and arm64 platforms.

The steps in the `build` job include:

1. Checking out the code using the `actions/checkout@v3` action.
2. Setting up Docker environment using the `docker/setup-qemu-action@v2` action, specifying the platform from the matrix.
3. Building the application using the `diddlesnaps/snapcraft-multiarch-action@v1` action, passing the architecture from the matrix.
4. Uploading the built snap as an artifact using the `actions/upload-artifact@v3` action.

Once the build is complete, the resulting snap file will be available as an artifact in the GitHub Actions workflow.

## Enterprise Support

FlowForge's Node-RED version comes with a professional support option. FlowForge, who employ the core Node-RED developers, will be your expert partner to address any support issues when running Node-RED applications in a production environment and ensuring any security updates are made available.



## License

The FlowForge License
