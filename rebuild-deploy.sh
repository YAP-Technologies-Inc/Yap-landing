#!/bin/bash

# Exit on error
set -e

echo "===== Rebuilding yap-landing with button styling and language ticker fixes ====="

# Clear any previous builds from cache to ensure fresh build
echo "Building landing page Docker image with fresh build..."
cd "$(dirname "$0")"
docker build --no-cache -t yap-landing:latest .

# Load the image into minikube
echo "Loading Docker image into minikube..."
minikube image load --overwrite yap-landing:latest

# Delete the existing pods to force pulling the new image
echo "Forcing pods to restart with new image..."
kubectl delete pods -l app=yap-landing

# Restart the landing page deployment to pick up the new image
echo "Restarting the landing page deployment..."
kubectl rollout restart deployment/yap-landing

# Wait for deployment to be ready
echo "Waiting for landing page deployment to be ready..."
kubectl rollout status deployment/yap-landing

echo "🚀 Landing page updated successfully!"
echo "Visit http://yap.local to view the changes"
echo 
echo "Changes applied:"
echo "1. Fixed the button colors to use brand blue (#5C6BC0)"
echo "2. Updated API endpoint paths for Kubernetes ingress (/auth/waitlist)"
