#!/bin/bash
# rebuild-deploy.sh - Script to rebuild and deploy the yap-landing app with API fixes

# Exit on error
set -e

echo "Rebuilding and deploying yap-landing with API fixes..."

# Navigate to the yap-landing directory
cd "$(dirname "$0")"

# Build the Docker image
echo "Building Docker image..."
docker build -t yap-landing:latest .

# Load the Docker image into minikube
echo "Loading image into minikube..."
minikube image load yap-landing:latest

# Apply kubernetes configurations
echo "Applying Kubernetes configurations..."
kubectl delete deployment yap-landing || true
kubectl apply -f /Users/gregbrown/github/YAP/YAP-backend/infra/pre/yap-landing.yaml

# Wait for deployment to be ready
echo "Waiting for landing page deployment to be ready..."
kubectl rollout status deployment/yap-landing

echo "🚀 Landing page redeployment complete!"
echo "Visit http://yap.local to view the site"
