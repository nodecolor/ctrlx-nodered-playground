#!/bin/sh
set -e
if [ -z "$PORT" ]; then PORT=1881; fi
export PORT

# settings.js search hierarchy: Active Configuration -> $SNAP_DATA -> $SNAP
if [ -f $SNAP_DATA/solutions/activeConfiguration/node-RED/settings.js ]; then
    SETTINGS=$SNAP_DATA/solutions/activeConfiguration/node-RED/settings.js
elif [ -f $SNAP_DATA/settings.js ]; then
    SETTINGS=$SNAP_DATA/settings.js
else
    SETTINGS=$SNAP/settings.js
fi

USERDIR=$SNAP_DATA/solutions/activeConfiguration/node-RED

echo ----------------------------------
echo STARTING NODE-RED APP
echo ----------------------------------
echo PORT: $PORT
echo SETTINGS: $SETTINGS
echo USERDIR: $USERDIR
echo ----------------------------------

"$SNAP"/bin/node "$SNAP"/lib/node_modules/.bin/node-red -s "$SETTINGS" -u "$USERDIR"
