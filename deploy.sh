#!/bin/bash

destiny="/volume2/Proyectos/dashboard/htdocs/"
port=7183

# npm run build

if [ ! -d dist/dashboard/ ]; then
  echo "Build files not found."
fi

echo "Copying files to server..."
scp -P $port -r dist/dashboard/* Alex@192.168.1.134:$destiny