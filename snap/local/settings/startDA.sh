#!/bin/sh

echo ----------------------------------
echo STARTING DEVICE AGENT APP
echo ----------------------------------

"$SNAP"/bin/node "$SNAP"/lib/node_modules/device-agent-ui/app.js"