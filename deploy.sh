#!/bin/bash

# Multifolks GCP Deployment Script
# This script automates the deployment process

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Multifolks GCP Deployment Script ===${NC}\n"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed.${NC}"
    echo "Please install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed.${NC}"
    exit 1
fi

# Get project ID
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)

if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}No GCP project set.${NC}"
    read -p "Enter your GCP Project ID: " PROJECT_ID
    gcloud config set project $PROJECT_ID
fi

echo -e "${GREEN}Using project: ${PROJECT_ID}${NC}\n"

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo -e "${YELLOW}Not authenticated. Logging in...${NC}"
    gcloud auth login
fi

# Enable required APIs
echo -e "${GREEN}Enabling required APIs...${NC}"
gcloud services enable run.googleapis.com \
    cloudbuild.googleapis.com \
    containerregistry.googleapis.com \
    dns.googleapis.com

# Get environment variables
echo -e "\n${YELLOW}=== Environment Variables ===${NC}"
read -p "Enter MongoDB URI: " MONGODB_URI
read -sp "Enter JWT Secret: " JWT_SECRET
echo ""

# Generate JWT Secret if empty
if [ -z "$JWT_SECRET" ]; then
    echo -e "${YELLOW}Generating JWT Secret...${NC}"
    JWT_SECRET=$(openssl rand -base64 32)
    echo -e "${GREEN}Generated JWT Secret: ${JWT_SECRET}${NC}"
    echo -e "${YELLOW}Save this secret!${NC}\n"
fi

# Build Docker image
echo -e "\n${GREEN}Building Docker image...${NC}"
docker build -t gcr.io/${PROJECT_ID}/multifolks-app:latest -f Dockerfile.cloudrun .

# Push to Container Registry
echo -e "\n${GREEN}Pushing image to Container Registry...${NC}"
docker push gcr.io/${PROJECT_ID}/multifolks-app:latest

# Deploy to Cloud Run
echo -e "\n${GREEN}Deploying to Cloud Run...${NC}"
gcloud run deploy multifolks-app \
    --image gcr.io/${PROJECT_ID}/multifolks-app:latest \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --port 8080 \
    --memory 2Gi \
    --cpu 2 \
    --min-instances 1 \
    --max-instances 10 \
    --set-env-vars "MONGODB_URI=${MONGODB_URI},JWT_SECRET=${JWT_SECRET},PORT=5001" \
    --timeout 300 \
    --concurrency 80

# Get service URL
SERVICE_URL=$(gcloud run services describe multifolks-app --region us-central1 --format 'value(status.url)')
echo -e "\n${GREEN}Deployment successful!${NC}"
echo -e "${GREEN}Service URL: ${SERVICE_URL}${NC}\n"

# Ask about custom domain
read -p "Do you want to connect a custom domain? (y/n): " CONNECT_DOMAIN

if [ "$CONNECT_DOMAIN" = "y" ] || [ "$CONNECT_DOMAIN" = "Y" ]; then
    read -p "Enter your domain (e.g., multifolks.in): " DOMAIN
    
    echo -e "\n${GREEN}Creating domain mapping...${NC}"
    gcloud run domain-mappings create \
        --service multifolks-app \
        --domain ${DOMAIN} \
        --region us-central1
    
    echo -e "\n${YELLOW}=== DNS Configuration Required ===${NC}"
    echo "Please add the following DNS records at your domain registrar:"
    echo ""
    gcloud run domain-mappings describe --domain ${DOMAIN} --region us-central1 --format="yaml(status.resourceRecords)"
    echo ""
    echo -e "${YELLOW}After adding DNS records, wait 24-48 hours for propagation.${NC}"
fi

echo -e "\n${GREEN}=== Deployment Complete ===${NC}"
echo -e "Service URL: ${SERVICE_URL}"
echo -e "View logs: gcloud logging read \"resource.type=cloud_run_revision AND resource.labels.service_name=multifolks-app\" --limit 50"
echo -e "Update service: gcloud run services update multifolks-app --region us-central1"





