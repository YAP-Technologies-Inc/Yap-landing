#!/bin/zsh
set -e

echo "Building and deploying yap-landing with updated NGINX configuration..."

# Navigate to the yap-landing directory
cd /Users/gregbrown/github/YAP/yap-landing

# Build the Docker image with updated NGINX configuration
echo "Building Docker image..."
docker build -t registry.digitalocean.com/yap-cr/yap-landing:latest .

# Push the image to the container registry
echo "Pushing image to DigitalOcean Container Registry..."
docker push registry.digitalocean.com/yap-cr/yap-landing:latest

# Apply the Kubernetes configuration
echo "Redeploying yap-landing in Kubernetes..."
kubectl rollout restart deployment/yap-landing

echo "Deployment initiated. To check status:"
echo "kubectl rollout status deployment/yap-landing"
