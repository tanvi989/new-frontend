# GCP Deployment Guide for Multifolks.in

This guide will help you deploy the Multifolks application to Google Cloud Platform and connect it to your domain `multifolks.in`.

## Prerequisites

1. **Google Cloud Account**: You need a GCP account with billing enabled
2. **Google Cloud SDK (gcloud)**: Install from https://cloud.google.com/sdk/docs/install
3. **Domain**: You should have access to manage DNS for `multifolks.in`
4. **MongoDB Atlas**: Your MongoDB connection string ready

## Step 1: Initial GCP Setup

### 1.1 Login to Google Cloud

```bash
# Login to your Google Cloud account
gcloud auth login

# Set your project (create one if needed)
gcloud projects create multifolks-project --name="Multifolks"
gcloud config set project multifolks-project

# Enable billing (required for Cloud Run)
# Go to: https://console.cloud.google.com/billing
```

### 1.2 Enable Required APIs

```bash
# Enable Cloud Run API
gcloud services enable run.googleapis.com

# Enable Cloud Build API
gcloud services enable cloudbuild.googleapis.com

# Enable Container Registry API
gcloud services enable containerregistry.googleapis.com

# Enable Cloud DNS API (for custom domain)
gcloud services enable dns.googleapis.com
```

## Step 2: Configure Environment Variables

### 2.1 Backend Environment Variables

You need to set these in Cloud Run:

- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: A strong random string for JWT signing (generate with: `openssl rand -base64 32`)
- `PORT`: Set to `5001` (backend port)

### 2.2 Frontend Environment Variables

For the frontend build, you'll need:

- `VITE_API_TARGET`: The backend API URL (will be set after deployment)
- `VITE_GEMINI_API_KEY`: Your Gemini API key (if used)

## Step 3: Deploy to Cloud Run

### Option A: Using Cloud Build (Recommended)

1. **Push your code to a Git repository** (GitHub, GitLab, or Cloud Source Repositories)

2. **Create a Cloud Build trigger** or run manually:

```bash
# Build and deploy
gcloud builds submit --config cloudbuild.yaml
```

### Option B: Manual Deployment

```bash
# Build the Docker image
docker build -t gcr.io/$(gcloud config get-value project)/multifolks-app:latest -f Dockerfile.cloudrun .

# Push to Container Registry
docker push gcr.io/$(gcloud config get-value project)/multifolks-app:latest

# Deploy to Cloud Run
gcloud run deploy multifolks-app \
  --image gcr.io/$(gcloud config get-value project)/multifolks-app:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 2Gi \
  --cpu 2 \
  --min-instances 1 \
  --max-instances 10 \
  --set-env-vars "MONGODB_URI=your_mongodb_uri,JWT_SECRET=your_jwt_secret,PORT=5001" \
  --timeout 300 \
  --concurrency 80
```

**Important**: Replace `your_mongodb_uri` and `your_jwt_secret` with actual values.

### 3.1 Get Your Service URL

After deployment, you'll get a URL like:
```
https://multifolks-app-xxxxx-uc.a.run.app
```

Save this URL - you'll need it for the next steps.

## Step 4: Connect Custom Domain

### 4.1 Map Domain to Cloud Run Service

```bash
# Map your domain to the Cloud Run service
gcloud run domain-mappings create \
  --service multifolks-app \
  --domain multifolks.in \
  --region us-central1

# For www subdomain
gcloud run domain-mappings create \
  --service multifolks-app \
  --domain www.multifolks.in \
  --region us-central1
```

### 4.2 Get DNS Records

After creating domain mappings, GCP will provide DNS records. Get them:

```bash
gcloud run domain-mappings describe --domain multifolks.in --region us-central1
```

You'll see output like:
```
status:
  resourceRecords:
  - name: multifolks.in
    rrdata: ghs.googlehosted.com
    type: A
  - name: multifolks.in
    rrdata: ghs.googlehosted.com
    type: AAAA
```

### 4.3 Update DNS Records

Go to your domain registrar (where you manage `multifolks.in`) and add:

1. **A Record**: 
   - Name: `@` or `multifolks.in`
   - Value: `216.239.32.21` (or the IP from GCP)
   - TTL: 3600

2. **AAAA Record** (IPv6):
   - Name: `@` or `multifolks.in`
   - Value: `2001:4860:4802:32::15` (or IPv6 from GCP)
   - TTL: 3600

3. **CNAME Record for www**:
   - Name: `www`
   - Value: `ghs.googlehosted.com`
   - TTL: 3600

**Note**: The exact values will be provided by GCP when you create the domain mapping.

### 4.4 Verify Domain

```bash
# Check domain mapping status
gcloud run domain-mappings describe --domain multifolks.in --region us-central1
```

Wait for status to show "Active" (can take up to 48 hours for DNS propagation).

## Step 5: Update Frontend API Configuration

After deployment, update your frontend to use the correct API endpoint:

1. **If using environment variables in build**:
   - Rebuild with `VITE_API_TARGET=https://multifolks.in/api` or your backend URL
   - Redeploy

2. **Or update vite.config.ts** to use the production API URL

## Step 6: SSL Certificate

Cloud Run automatically provides SSL certificates for custom domains. No additional configuration needed!

## Step 7: Monitoring and Logs

### View Logs

```bash
# View Cloud Run logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=multifolks-app" --limit 50
```

### Monitor in Console

Visit: https://console.cloud.google.com/run

## Troubleshooting

### Issue: Service not accessible
- Check that `--allow-unauthenticated` flag was used
- Verify environment variables are set correctly
- Check Cloud Run logs for errors

### Issue: Domain not working
- Verify DNS records are correct (use `dig multifolks.in` or `nslookup multifolks.in`)
- Wait for DNS propagation (can take 24-48 hours)
- Check domain mapping status in GCP Console

### Issue: Backend not connecting to MongoDB
- Verify `MONGODB_URI` is set correctly
- Check MongoDB Atlas IP whitelist (add `0.0.0.0/0` for Cloud Run)
- Verify MongoDB credentials

### Issue: Build fails
- Check Dockerfile syntax
- Verify all dependencies in package.json
- Check Cloud Build logs

## Cost Optimization

- **Min instances**: Set to 0 if you want to scale to zero (saves cost but adds cold start latency)
- **Max instances**: Adjust based on expected traffic
- **Memory/CPU**: Start with 1Gi/1 CPU and scale up if needed
- **Region**: Choose closest to your users (us-central1 is usually cheapest)

## Security Best Practices

1. **Environment Variables**: Use Secret Manager for sensitive data:
   ```bash
   # Create secret
   echo -n "your-secret-value" | gcloud secrets create jwt-secret --data-file=-
   
   # Use in Cloud Run
   gcloud run services update multifolks-app \
     --update-secrets JWT_SECRET=jwt-secret:latest
   ```

2. **CORS**: Update backend CORS settings to only allow your domain

3. **MongoDB**: Use connection string with authentication, restrict IP access

## Next Steps

1. Set up monitoring and alerts
2. Configure backup strategy for MongoDB
3. Set up CI/CD pipeline
4. Configure custom error pages
5. Set up CDN for static assets (Cloud CDN)

## Support

For issues:
- GCP Documentation: https://cloud.google.com/run/docs
- Cloud Run Logs: https://console.cloud.google.com/run
- Cloud Build Logs: https://console.cloud.google.com/cloud-build





