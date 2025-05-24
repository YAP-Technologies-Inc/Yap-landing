#!/bin/bash

# Exit on error
set -e

# Build landing page image
echo "Building landing page Docker image..."
cd ../yap-landing
docker build -t yap-landing:latest .

# Apply k8s configurations
echo "Applying Kubernetes configurations..."
cd ../YAP-backend/infra/k8s
kubectl apply -f yap-landing.yaml
kubectl apply -f yap-ingress.yaml

# Wait for deployment to be ready
echo "Waiting for landing page deployment to be ready..."
kubectl rollout status deployment/yap-landing

# Check if host entry exists
if ! grep -q "yap.local" /etc/hosts; then
  echo "Adding yap.local to /etc/hosts..."
  MINIKUBE_IP=$(minikube ip)
  echo "$MINIKUBE_IP yap.local" | sudo tee -a /etc/hosts
  # Flush macOS DNS cache
  sudo killall -HUP mDNSResponder
fi

# Start minikube tunnel if not already running
if ! pgrep -f "minikube tunnel" > /dev/null; then
  echo "Starting minikube tunnel..."
  sudo minikube tunnel &
fi

echo "🚀 Landing page deployment complete!"
echo "Visit http://yap.local to view the site"
