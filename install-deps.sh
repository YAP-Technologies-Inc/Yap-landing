#!/bin/bash

echo "Installing required dependencies for Dynamic SDK integration..."
npm install --save path-browserify assert util

echo "Ensuring all Dynamic SDK packages are on the same version..."
DYNAMIC_VERSION=$(npm list @dynamic-labs/sdk-react-core | grep sdk-react-core | awk '{print $2}' | sed 's/@//g')
echo "Found Dynamic SDK version: $DYNAMIC_VERSION"

npm install --save @dynamic-labs/sdk-api-core@^0.0.671 @dynamic-labs/sdk-react-core@^4.18.6

echo "Installation complete!"
