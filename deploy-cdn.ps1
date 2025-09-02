# Vocilio Dashboard - Cloud Storage + CDN Deployment
# Ultra-fast global deployment with Google Cloud CDN

# Configuration - UPDATE THESE VALUES
$PROJECT_ID = "durable-retina-470315-d1"  # Your Google Cloud project ID
$BUCKET_NAME = "vocilio-dashboard-$(Get-Random)"  # Unique bucket name
$REGION = "us-central1"

Write-Host "🚀 Starting Vocilio Dashboard CDN Deployment..." -ForegroundColor Blue

Write-Host "📦 Building production bundle..." -ForegroundColor Cyan
npm run build

Write-Host "🪣 Setting up Cloud Storage bucket..." -ForegroundColor Cyan
# Create bucket if it doesn't exist
try {
    gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://$BUCKET_NAME/
} catch {
    Write-Host "Bucket already exists" -ForegroundColor Yellow
}

# Enable website configuration
gsutil web set -m index.html -e 404.html gs://$BUCKET_NAME/

# Make bucket publicly readable
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME/

Write-Host "📁 Uploading files to Cloud Storage..." -ForegroundColor Cyan
# Upload all files from dist folder
gsutil -m rsync -r -d dist/ gs://$BUCKET_NAME/

Write-Host "⚡ Optimizing content types..." -ForegroundColor Cyan
# Set correct content types for optimal performance
gsutil -m setmeta -h "Content-Type:text/html" -h "Cache-Control:public, max-age=300" gs://$BUCKET_NAME/index.html
gsutil -m setmeta -h "Content-Type:text/css" -h "Cache-Control:public, max-age=31536000" gs://$BUCKET_NAME/assets/*.css
gsutil -m setmeta -h "Content-Type:application/javascript" -h "Cache-Control:public, max-age=31536000" gs://$BUCKET_NAME/assets/*.js

Write-Host "🌍 Setting up Cloud CDN (Load Balancer)..." -ForegroundColor Cyan

# Create backend bucket
try {
    gcloud compute backend-buckets create vocilio-dashboard-backend --gcs-bucket-name=$BUCKET_NAME --enable-cdn --cache-mode=CACHE_ALL_STATIC
} catch {
    Write-Host "Backend bucket already exists" -ForegroundColor Yellow
}

# Create URL map
try {
    gcloud compute url-maps create vocilio-dashboard-url-map --default-backend-bucket=vocilio-dashboard-backend
} catch {
    Write-Host "URL map already exists" -ForegroundColor Yellow
}

# Create HTTP proxy
try {
    gcloud compute target-http-proxies create vocilio-dashboard-http-proxy --url-map=vocilio-dashboard-url-map
} catch {
    Write-Host "HTTP proxy already exists" -ForegroundColor Yellow
}

# Reserve global IP address
try {
    gcloud compute addresses create vocilio-dashboard-ip --global
} catch {
    Write-Host "IP address already exists" -ForegroundColor Yellow
}

# Get the IP address
$GLOBAL_IP = gcloud compute addresses describe vocilio-dashboard-ip --global --format="value(address)"

# Create forwarding rule
try {
    gcloud compute forwarding-rules create vocilio-dashboard-http-rule --global --target-http-proxy=vocilio-dashboard-http-proxy --ports=80 --address=$GLOBAL_IP
} catch {
    Write-Host "Forwarding rule already exists" -ForegroundColor Yellow
}

Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "📍 Your dashboard is now live at:" -ForegroundColor Yellow
Write-Host "   http://$GLOBAL_IP" -ForegroundColor Green
Write-Host "🌍 Global CDN is enabled - users worldwide will get ultra-fast performance!" -ForegroundColor Yellow
Write-Host "⚡ Edge locations: Americas, Europe, Asia-Pacific" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔧 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Point your domain to: $GLOBAL_IP"
Write-Host "2. Set up HTTPS certificate (optional)"
Write-Host "3. Configure custom domain in Cloud Console"
Write-Host ""
Write-Host "🎉 Your Vocilio AI Dashboard is now globally distributed!" -ForegroundColor Green
