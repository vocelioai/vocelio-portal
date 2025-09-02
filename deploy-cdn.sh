#!/bin/bash

# Vocilio Dashboard - Cloud Storage + CDN Deployment Script
# Ultra-fast global deployment with Google Cloud CDN

set -e

echo "🚀 Starting Vocilio Dashboard CDN Deployment..."

# Configuration
PROJECT_ID="your-project-id"  # Replace with your Google Cloud project ID
BUCKET_NAME="vocilio-dashboard"  # Will be created if doesn't exist
REGION="us-central1"  # Same region as your backend for optimal performance

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Building production bundle...${NC}"
npm run build

echo -e "${BLUE}🪣 Setting up Cloud Storage bucket...${NC}"
# Create bucket if it doesn't exist
gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://$BUCKET_NAME/ 2>/dev/null || echo "Bucket already exists"

# Enable website configuration
gsutil web set -m index.html -e 404.html gs://$BUCKET_NAME/

# Make bucket publicly readable
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME/

echo -e "${BLUE}📁 Uploading files to Cloud Storage...${NC}"
# Upload all files from dist folder
gsutil -m rsync -r -d dist/ gs://$BUCKET_NAME/

# Set correct content types for optimal performance
echo -e "${BLUE}⚡ Optimizing content types...${NC}"
gsutil -m setmeta -h "Content-Type:text/html" -h "Cache-Control:public, max-age=300" gs://$BUCKET_NAME/index.html
gsutil -m setmeta -h "Content-Type:text/css" -h "Cache-Control:public, max-age=31536000" gs://$BUCKET_NAME/assets/*.css
gsutil -m setmeta -h "Content-Type:application/javascript" -h "Cache-Control:public, max-age=31536000" gs://$BUCKET_NAME/assets/*.js
gsutil -m setmeta -h "Content-Type:image/svg+xml" -h "Cache-Control:public, max-age=31536000" gs://$BUCKET_NAME/**/*.svg

echo -e "${BLUE}🌍 Setting up Cloud CDN (Load Balancer)...${NC}"

# Create HTTP(S) Load Balancer with Cloud CDN
# This gives you global edge locations for ultra-fast performance

# Create backend bucket
gcloud compute backend-buckets create vocilio-dashboard-backend \
    --gcs-bucket-name=$BUCKET_NAME \
    --enable-cdn \
    --cache-mode=CACHE_ALL_STATIC || echo "Backend bucket already exists"

# Create URL map
gcloud compute url-maps create vocilio-dashboard-url-map \
    --default-backend-bucket=vocilio-dashboard-backend || echo "URL map already exists"

# Create HTTP proxy
gcloud compute target-http-proxies create vocilio-dashboard-http-proxy \
    --url-map=vocilio-dashboard-url-map || echo "HTTP proxy already exists"

# Reserve global IP address
gcloud compute addresses create vocilio-dashboard-ip \
    --global || echo "IP address already exists"

# Get the IP address
GLOBAL_IP=$(gcloud compute addresses describe vocilio-dashboard-ip --global --format="value(address)")

# Create forwarding rule
gcloud compute forwarding-rules create vocilio-dashboard-http-rule \
    --global \
    --target-http-proxy=vocilio-dashboard-http-proxy \
    --ports=80 \
    --address=$GLOBAL_IP || echo "Forwarding rule already exists"

echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${YELLOW}📍 Your dashboard is now live at:${NC}"
echo -e "${GREEN}   http://$GLOBAL_IP${NC}"
echo -e "${YELLOW}🌍 Global CDN is enabled - users worldwide will get ultra-fast performance!${NC}"
echo -e "${YELLOW}⚡ Edge locations: Americas, Europe, Asia-Pacific${NC}"
echo ""
echo -e "${BLUE}🔧 Next Steps:${NC}"
echo -e "1. Point your domain to: $GLOBAL_IP"
echo -e "2. Set up HTTPS certificate (optional)"
echo -e "3. Configure custom domain in Cloud Console"
echo ""
echo -e "${GREEN}🎉 Your Vocilio AI Dashboard is now globally distributed!${NC}"
