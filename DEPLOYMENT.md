# Vocilio AI Dashboard - Google Cloud Run Deployment

## Prerequisites
1. Google Cloud SDK installed and configured
2. Docker installed
3. Node.js 18+ installed

## Environment Setup

### 1. Set environment variables
```bash
export PROJECT_ID="your-gcp-project-id"
export REGION="us-central1"
export BACKEND_URL="https://your-backend-service-url.run.app"
```

### 2. Enable required APIs
```bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cdn.googleapis.com
```

## Local Development

### 1. Install dependencies
```bash
npm install
```

### 2. Start development server
```bash
npm run dev
```

### 3. Build for production
```bash
npm run build
```

## Cloud Run Deployment

### Method 1: Direct deployment with gcloud
```bash
# Build and deploy in one step
gcloud run deploy vocilio-dashboard \
  --source . \
  --port 8080 \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,BACKEND_URL=$BACKEND_URL
```

### Method 2: Using Cloud Build (Recommended)
```bash
# Submit build with substitutions
gcloud builds submit \
  --config cloudbuild.yaml \
  --substitutions _REGION=$REGION,_BACKEND_URL=$BACKEND_URL .
```

### Method 3: Container Registry approach
```bash
# Build and push container
docker build -t gcr.io/$PROJECT_ID/vocilio-dashboard .
docker push gcr.io/$PROJECT_ID/vocilio-dashboard

# Deploy to Cloud Run
gcloud run deploy vocilio-dashboard \
  --image gcr.io/$PROJECT_ID/vocilio-dashboard \
  --region $REGION \
  --port 8080 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,BACKEND_URL=$BACKEND_URL
```

## CDN Setup with Google Cloud CDN

### 1. Create static IP
```bash
gcloud compute addresses create vocilio-dashboard-ip --global
```

### 2. Get the IP address
```bash
gcloud compute addresses describe vocilio-dashboard-ip --global
```

### 3. Create backend service
```bash
# Create backend service pointing to Cloud Run
gcloud compute backend-services create vocilio-dashboard-backend \
  --global \
  --load-balancing-scheme=EXTERNAL \
  --protocol=HTTPS

# Add Cloud Run as backend
gcloud compute backend-services add-backend vocilio-dashboard-backend \
  --global \
  --network-endpoint-group=vocilio-dashboard-neg \
  --network-endpoint-group-region=$REGION
```

### 4. Create URL map and load balancer
```bash
# Create URL map
gcloud compute url-maps create vocilio-dashboard-map \
  --default-backend-service=vocilio-dashboard-backend

# Create HTTP(S) load balancer
gcloud compute target-https-proxies create vocilio-dashboard-proxy \
  --url-map=vocilio-dashboard-map \
  --ssl-certificates=your-ssl-certificate

# Create forwarding rule
gcloud compute forwarding-rules create vocilio-dashboard-rule \
  --global \
  --target-https-proxy=vocilio-dashboard-proxy \
  --address=vocilio-dashboard-ip \
  --ports=443
```

## Environment Variables

### Required Environment Variables
- `NODE_ENV`: Set to "production" for production builds
- `BACKEND_URL`: Your backend API URL
- `PORT`: Port number (default: 8080 for Cloud Run)

### Optional Environment Variables
- `REACT_APP_API_URL`: Frontend API URL override
- `REACT_APP_ANALYTICS_ID`: Google Analytics ID
- `REACT_APP_SENTRY_DSN`: Sentry error tracking DSN

## Health Checks and Monitoring

The service includes:
- Health check endpoint: `/health`
- Proper logging for Cloud Run
- Error handling and fallbacks
- Performance monitoring ready

## Custom Domain Setup

### 1. Map custom domain
```bash
gcloud run domain-mappings create \
  --service vocilio-dashboard \
  --domain your-domain.com \
  --region $REGION
```

### 2. Update DNS records
Add the CNAME record provided by Google Cloud Run to your DNS.

## Scaling Configuration

### Auto-scaling settings
```bash
gcloud run services update vocilio-dashboard \
  --region $REGION \
  --min-instances=1 \
  --max-instances=10 \
  --cpu=1 \
  --memory=1Gi \
  --concurrency=80
```

## Security Features

- Helmet.js for security headers
- CORS configuration
- Content Security Policy
- Compression enabled
- Non-root container user

## Troubleshooting

### Common Issues

1. **Build failures**: Check Node.js version and dependencies
2. **Connection issues**: Verify BACKEND_URL is correct
3. **CORS errors**: Configure backend CORS settings
4. **Performance**: Enable CDN and compression

### Logs
```bash
# View Cloud Run logs
gcloud logs read --service=vocilio-dashboard --region=$REGION

# Stream logs in real-time
gcloud logs tail --service=vocilio-dashboard --region=$REGION
```

## CI/CD Integration

### GitHub Actions example
```yaml
name: Deploy to Cloud Run
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: google-github-actions/setup-gcloud@v1
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ secrets.GCP_PROJECT_ID }}
      - run: |
          gcloud builds submit --config cloudbuild.yaml \
            --substitutions _BACKEND_URL=${{ secrets.BACKEND_URL }}
```

## Monitoring and Alerts

Set up monitoring for:
- Service availability
- Response times
- Error rates
- Resource usage

```bash
# Create uptime check
gcloud monitoring uptime create-http-check \
  --display-name="Vocilio Dashboard" \
  --hostname=your-domain.com \
  --path="/health"
```
