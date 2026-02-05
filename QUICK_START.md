# Quick Start Guide - Deploy Multifolks to GCP

## Prerequisites Checklist

- [ ] Google Cloud account with billing enabled
- [ ] `gcloud` CLI installed ([Download](https://cloud.google.com/sdk/docs/install))
- [ ] Docker installed
- [ ] Domain `multifolks.in` DNS access
- [ ] MongoDB Atlas connection string

## Step-by-Step Deployment

### 1. Login to Google Cloud

```bash
gcloud auth login
```

### 2. Create/Select Project

```bash
# Create new project (or use existing)
gcloud projects create multifolks-project --name="Multifolks"
gcloud config set project multifolks-project

# Enable billing at: https://console.cloud.google.com/billing
```

### 3. Enable Required APIs

```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com containerregistry.googleapis.com dns.googleapis.com
```

### 4. Prepare Environment Variables

You'll need:
- **MONGODB_URI**: Your MongoDB Atlas connection string
- **JWT_SECRET**: Generate with: `openssl rand -base64 32` (or use any strong random string)

### 5. Deploy (Choose One Method)

#### Option A: Automated Script (Windows PowerShell)

```powershell
.\deploy.ps1
```

#### Option B: Automated Script (Linux/Mac)

```bash
chmod +x deploy.sh
./deploy.sh
```

#### Option C: Manual Deployment

```bash
# Set variables
export PROJECT_ID=$(gcloud config get-value project)
export MONGODB_URI="your_mongodb_connection_string"
export JWT_SECRET="your_jwt_secret"

# Build and push
docker build -t gcr.io/${PROJECT_ID}/multifolks-app:latest -f Dockerfile.cloudrun .
docker push gcr.io/${PROJECT_ID}/multifolks-app:latest

# Deploy
gcloud run deploy multifolks-app \
  --image gcr.io/${PROJECT_ID}/multifolks-app:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 2Gi \
  --cpu 2 \
  --set-env-vars "MONGODB_URI=${MONGODB_URI},JWT_SECRET=${JWT_SECRET},PORT=5001"
```

### 6. Get Your Service URL

After deployment, you'll get a URL like:
```
https://multifolks-app-xxxxx-uc.a.run.app
```

### 7. Connect Custom Domain

```bash
# Create domain mapping
gcloud run domain-mappings create \
  --service multifolks-app \
  --domain multifolks.in \
  --region us-central1

# Get DNS records
gcloud run domain-mappings describe --domain multifolks.in --region us-central1
```

### 8. Update DNS at Your Registrar

Add the DNS records provided by GCP to your domain registrar:
- **A Record**: Point to the IP provided
- **CNAME for www**: Point to `ghs.googlehosted.com`

Wait 24-48 hours for DNS propagation.

### 9. Verify Deployment

```bash
# Check service status
gcloud run services describe multifolks-app --region us-central1

# View logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=multifolks-app" --limit 50
```

## Common Issues

### "Permission denied" errors
- Make sure billing is enabled
- Verify you have Owner/Editor role on the project

### "Image not found" errors
- Ensure Container Registry API is enabled
- Check that image was pushed successfully

### Domain not working
- Verify DNS records are correct (use `dig multifolks.in`)
- Wait for DNS propagation (can take 24-48 hours)
- Check domain mapping status in GCP Console

### Backend not connecting
- Verify MongoDB URI is correct
- Check MongoDB Atlas IP whitelist (add `0.0.0.0/0` for Cloud Run)
- Check environment variables are set correctly

## Next Steps

- Set up monitoring and alerts
- Configure backups
- Set up CI/CD pipeline
- Review security settings

## Support

For detailed information, see [DEPLOYMENT.md](./DEPLOYMENT.md)





