# Vocilio Portal - Quick Update Script
# Use this for future deployments

Write-Host "🚀 Updating Vocilio Portal..."

# Build latest version
Write-Host "📦 Building application..."
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!"
    exit 1
}

# Upload to production bucket
Write-Host "☁️ Uploading to Cloud Storage..."
gsutil -m rsync -r -d ./dist gs://vocilio-portal-v2

# Clear CDN cache
Write-Host "🔄 Clearing CDN cache..."
gcloud compute url-maps invalidate-cdn-cache vocilio-v2-map --path="/*"

Write-Host "✅ Deployment complete!"
Write-Host "🌍 Live at: http://34.102.170.45"
Write-Host "⚡ Changes should be visible in 1-2 minutes"
