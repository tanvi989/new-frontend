# Multifolks GCP Deployment Script for Windows PowerShell
# This script automates the deployment process

$ErrorActionPreference = "Stop"

Write-Host "=== Multifolks GCP Deployment Script ===" -ForegroundColor Green
Write-Host ""

# Check if gcloud is installed
try {
    $null = Get-Command gcloud -ErrorAction Stop
} catch {
    Write-Host "Error: gcloud CLI is not installed." -ForegroundColor Red
    Write-Host "Please install from: https://cloud.google.com/sdk/docs/install"
    exit 1
}

# Check if docker is installed
try {
    $null = Get-Command docker -ErrorAction Stop
} catch {
    Write-Host "Error: Docker is not installed." -ForegroundColor Red
    exit 1
}

# Get project ID
$PROJECT_ID = gcloud config get-value project 2>$null

if ([string]::IsNullOrEmpty($PROJECT_ID)) {
    Write-Host "No GCP project set." -ForegroundColor Yellow
    $PROJECT_ID = Read-Host "Enter your GCP Project ID"
    gcloud config set project $PROJECT_ID
}

Write-Host "Using project: $PROJECT_ID" -ForegroundColor Green
Write-Host ""

# Check if user is authenticated
$activeAccount = gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>$null
if ([string]::IsNullOrEmpty($activeAccount)) {
    Write-Host "Not authenticated. Logging in..." -ForegroundColor Yellow
    gcloud auth login
}

# Enable required APIs
Write-Host "Enabling required APIs..." -ForegroundColor Green
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable dns.googleapis.com

# Get environment variables
Write-Host ""
Write-Host "=== Environment Variables ===" -ForegroundColor Yellow
$MONGODB_URI = Read-Host "Enter MongoDB URI"
$JWT_SECRET = Read-Host "Enter JWT Secret" -AsSecureString
$JWT_SECRET_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($JWT_SECRET)
)

# Generate JWT Secret if empty
if ([string]::IsNullOrEmpty($JWT_SECRET_PLAIN)) {
    Write-Host "Generating JWT Secret..." -ForegroundColor Yellow
    $bytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    $JWT_SECRET_PLAIN = [Convert]::ToBase64String($bytes)
    Write-Host "Generated JWT Secret: $JWT_SECRET_PLAIN" -ForegroundColor Green
    Write-Host "Save this secret!" -ForegroundColor Yellow
    Write-Host ""
}

# Build Docker image
Write-Host ""
Write-Host "Building Docker image..." -ForegroundColor Green
docker build -t "gcr.io/${PROJECT_ID}/multifolks-app:latest" -f Dockerfile.cloudrun .

# Push to Container Registry
Write-Host ""
Write-Host "Pushing image to Container Registry..." -ForegroundColor Green
docker push "gcr.io/${PROJECT_ID}/multifolks-app:latest"

# Deploy to Cloud Run
Write-Host ""
Write-Host "Deploying to Cloud Run..." -ForegroundColor Green
$envVars = "MONGODB_URI=${MONGODB_URI},JWT_SECRET=${JWT_SECRET_PLAIN},PORT=5001"

gcloud run deploy multifolks-app `
    --image "gcr.io/${PROJECT_ID}/multifolks-app:latest" `
    --platform managed `
    --region us-central1 `
    --allow-unauthenticated `
    --port 8080 `
    --memory 2Gi `
    --cpu 2 `
    --min-instances 1 `
    --max-instances 10 `
    --set-env-vars $envVars `
    --timeout 300 `
    --concurrency 80

# Get service URL
$SERVICE_URL = gcloud run services describe multifolks-app --region us-central1 --format 'value(status.url)'
Write-Host ""
Write-Host "Deployment successful!" -ForegroundColor Green
Write-Host "Service URL: $SERVICE_URL" -ForegroundColor Green
Write-Host ""

# Ask about custom domain
$connectDomain = Read-Host "Do you want to connect a custom domain? (y/n)"

if ($connectDomain -eq "y" -or $connectDomain -eq "Y") {
    $domain = Read-Host "Enter your domain (e.g., multifolks.in)"
    
    Write-Host ""
    Write-Host "Creating domain mapping..." -ForegroundColor Green
    gcloud run domain-mappings create `
        --service multifolks-app `
        --domain $domain `
        --region us-central1
    
    Write-Host ""
    Write-Host "=== DNS Configuration Required ===" -ForegroundColor Yellow
    Write-Host "Please add the following DNS records at your domain registrar:"
    Write-Host ""
    gcloud run domain-mappings describe --domain $domain --region us-central1 --format="yaml(status.resourceRecords)"
    Write-Host ""
    Write-Host "After adding DNS records, wait 24-48 hours for propagation." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Deployment Complete ===" -ForegroundColor Green
Write-Host "Service URL: $SERVICE_URL"
Write-Host "View logs: gcloud logging read `"resource.type=cloud_run_revision AND resource.labels.service_name=multifolks-app`" --limit 50"
Write-Host "Update service: gcloud run services update multifolks-app --region us-central1"





