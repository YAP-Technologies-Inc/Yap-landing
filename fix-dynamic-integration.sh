#!/bin/bash

# Print a message indicating what this script does
echo "Setting up a mock Dynamic.xyz wallet integration for Angular"
echo "This script will remove React dependencies and set up a simulated wallet instead"

# Update package.json to remove React dependencies
echo "Removing React dependencies..."
npm uninstall react react-dom @types/react @types/react-dom @dynamic-labs/sdk-react-core || true

# Keep only the API core for type definitions
npm install @dynamic-labs/sdk-api-core --save

# Install other required dependencies
echo "Installing required dependencies..."
npm install buffer crypto-browserify stream-browserify process --save-dev

# Create .npmrc with legacy peer deps setting
echo "Setting legacy-peer-deps=true in .npmrc..."
echo "legacy-peer-deps=true" > .npmrc

# Install dependencies with legacy peer deps
echo "Installing dependencies with legacy peer deps..."
npm install

echo ""
echo "Setup complete! The project now uses a simplified mock implementation for Dynamic.xyz wallets"
echo "Check the dynamic.service.ts file to see the implementation details"
