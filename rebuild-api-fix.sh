#!/bin/bash
# Script to rebuild and deploy the updated YAP landing page with fixed API connections

set -e

echo "=== Rebuilding and deploying YAP landing page with API fixes ==="

# Navigate to the yap-landing directory
cd /Users/gregbrown/github/YAP/yap-landing

echo "Building Docker image..."
docker build -t yap-landing:latest .

echo "Loading image into minikube..."
minikube image load yap-landing:latest

echo "Applying Kubernetes configurations..."
kubectl delete pod -l app=yap-landing

echo "Waiting for new pod to be ready..."
kubectl wait --for=condition=ready pod -l app=yap-landing --timeout=60s

echo "=== Deployment complete! ==="
echo "Your updated YAP landing page should now be available at http://yap.local"
echo "The waitlist form should now correctly connect to the auth service."
