# Vocilio Portal - Cloud Storage + CDN Deployment
# Google Cloud Platform Deployment Script

## Prerequisites
- Google Cloud SDK installed and authenticated
- Project: vocilio-dashboard (or your preferred project ID)
- Billing enabled for the project

## Step 1: Set up environment variables
$PROJECT_ID = "vocilio-dashboard"
$BUCKET_NAME = "vocilio-portal-app"
$CDN_NAME = "vocilio-portal-cdn"

## Step 2: Create Cloud Storage bucket for static hosting
Write-Host "🚀 Creating Cloud Storage bucket for static website hosting..."
gsutil mb -p $PROJECT_ID -c STANDARD -l US gs://$BUCKET_NAME

## Step 3: Configure bucket for public web hosting
Write-Host "🔧 Configuring bucket for web hosting..."
gsutil web set -m index.html -e index.html gs://$BUCKET_NAME
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME

## Step 4: Upload the built application
Write-Host "📦 Uploading application files..."
gsutil -m rsync -r -d ./dist gs://$BUCKET_NAME

## Step 5: Set up Cloud CDN load balancer
Write-Host "🌐 Setting up Cloud CDN..."

# Create backend bucket
gcloud compute backend-buckets create $BUCKET_NAME-backend --gcs-bucket-name=$BUCKET_NAME

# Create URL map
gcloud compute url-maps create $CDN_NAME-map --default-backend-bucket=$BUCKET_NAME-backend

# Create SSL certificate (managed)
gcloud compute ssl-certificates create $CDN_NAME-ssl --domains=vocilio-app.com --global

# Create target HTTPS proxy
gcloud compute target-https-proxies create $CDN_NAME-proxy --url-map=$CDN_NAME-map --ssl-certificates=$CDN_NAME-ssl

# Create global forwarding rule
gcloud compute forwarding-rules create $CDN_NAME-rule --global --target-https-proxy=$CDN_NAME-proxy --ports=443

# Create HTTP redirect rule
gcloud compute url-maps create $CDN_NAME-http-redirect --default-url-redirect-redirect-response-code=301,https-redirect=True
gcloud compute target-http-proxies create $CDN_NAME-http-proxy --url-map=$CDN_NAME-http-redirect
gcloud compute forwarding-rules create $CDN_NAME-http-rule --global --target-http-proxy=$CDN_NAME-http-proxy --ports=80

Write-Host "✅ Deployment complete!"
Write-Host "🌍 Your application will be available at: https://vocilio-app.com"
Write-Host "📊 Bucket URL: https://storage.googleapis.com/$BUCKET_NAME/index.html"
