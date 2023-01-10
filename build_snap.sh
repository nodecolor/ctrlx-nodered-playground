#!/bin/sh

# sudo snap install lxd && sudo lxd init        # if you don’t have LXD already
# sudo usermod -a -G lxd $USER && newgrp lxd    # if your user is not in the lxd group already
# sudo snap install --classic snapcraft         # if you don’t have snapcraft already

rm -f node-red*.snap
snapcraft clean
snapcraft
# snapcraft push node-red*.snap --release beta  # push this build to the beta channel
