# Quick Deploy to Existing GCP Infrastructure
# Vocilio Portal - Update Deployment

$PROJECT_ID = "vocilio-dashboard"
$BUCKET_NAME = "vocelio-portal-v2"
$EXISTING_IP = "35.227.201.121"

Write-Host "🔄 Quick deployment to existing infrastructure..."

# Build the latest version
Write-Host "🏗️  Building latest version..."
npm run build

# Upload to existing bucket
Write-Host "📤 Uploading to Cloud Storage..."
gsutil -m rsync -r -d ./dist gs://$BUCKET_NAME

# Invalidate CDN cache
Write-Host "🔄 Invalidating CDN cache..."
gcloud compute url-maps invalidate-cdn-cache vocilio-portal-map --path="/*"

Write-Host "✅ Deployment complete!"
Write-Host "🌍 Live at: http://$EXISTING_IP"
Write-Host "⚡ CDN cache invalidated - changes should be visible immediately"

# Test the deployment
Write-Host "🧪 Testing deployment..."
$response = Invoke-WebRequest -Uri "http://$EXISTING_IP" -UseBasicParsing
if ($response.StatusCode -eq 200) {
    Write-Host "✅ Deployment successful - Application is live!"
} else {
    Write-Host "❌ Deployment check failed - Status: $($response.StatusCode)"
}
