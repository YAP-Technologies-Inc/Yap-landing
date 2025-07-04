#!/bin/bash

# YAP-Landing Production Build and Deployment Script for DOKS
# This script builds the Angular app and deploys it to DigitalOcean Container Registry

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICE_NAME="yap-landing"
REGISTRY="registry.digitalocean.com/yap-cr"
IMAGE_TAG="latest"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 YAP-Landing Production Deployment${NC}"
echo "======================================="

# Step 1: Clean and install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
cd "$SCRIPT_DIR"
npm ci --production=false

# Step 2: Build production version
echo -e "${YELLOW}🔨 Building production Angular app...${NC}"
npm run build -- --configuration production

# Check if build was successful
if [ ! -d "www" ]; then
    echo -e "${RED}❌ Build failed - www directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

# Step 3: Build Docker image
echo -e "${YELLOW}🐳 Building Docker image...${NC}"
docker build -t $SERVICE_NAME:$IMAGE_TAG .

# Step 4: Tag image for DigitalOcean Container Registry
echo -e "${YELLOW}🏷️  Tagging image for registry...${NC}"
docker tag $SERVICE_NAME:$IMAGE_TAG $REGISTRY/$SERVICE_NAME:$IMAGE_TAG

# Step 5: Push to DigitalOcean Container Registry
echo -e "${YELLOW}📤 Pushing to DigitalOcean Container Registry...${NC}"
docker push $REGISTRY/$SERVICE_NAME:$IMAGE_TAG

# Step 6: Deploy to DOKS cluster
echo -e "${YELLOW}🚀 Deploying to DOKS cluster...${NC}"

# Apply the deployment configuration
kubectl apply -f ../YAP-backend/infra/pre/yap-landing.yaml

# Force rollout restart to pull the new image
echo -e "${YELLOW}🔄 Rolling out new deployment...${NC}"
kubectl rollout restart deployment/$SERVICE_NAME

# Wait for rollout to complete
echo -e "${YELLOW}⏳ Waiting for rollout to complete...${NC}"
kubectl rollout status deployment/$SERVICE_NAME --timeout=300s

# Get the current status
echo -e "${YELLOW}📊 Current deployment status:${NC}"
kubectl get pods -l app=$SERVICE_NAME
kubectl get service $SERVICE_NAME

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}🌐 Your application should be available at:${NC}"
echo -e "${GREEN}  • https://goyap.ai${NC}"
echo -e "${GREEN}  • https://www.goyap.ai${NC}"
echo ""
echo -e "${YELLOW}💡 To check logs:${NC}"
echo "   kubectl logs -f deployment/$SERVICE_NAME"
echo ""
echo -e "${YELLOW}💡 To check ingress status:${NC}"
echo "   kubectl get ingress yap-services"
