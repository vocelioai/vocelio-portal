# Vocilio Portal v2 - Production Deployment to vocelio-portalv2 bucket
# Deploy to Cloud Storage + CDN

Write-Host "🚀 Starting Vocilio Portal v2 Production Deployment..." -ForegroundColor Blue
Write-Host "📦 Deploying to: vocelio-portalv2 bucket" -ForegroundColor Cyan

$BUCKET_NAME = "vocelio-portalv2"

# Check if build exists
if (-not (Test-Path "dist")) {
    Write-Host "❌ Build directory not found. Running build first..." -ForegroundColor Red
    npm run build
}

Write-Host "📁 Uploading files to Cloud Storage bucket: $BUCKET_NAME" -ForegroundColor Cyan

# Upload all files from dist folder with proper caching headers
Write-Host "🔄 Syncing files..." -ForegroundColor Yellow
gsutil -m rsync -r -d dist/ gs://vocilio-portal-v2/

# Set cache control headers for optimization
Write-Host "⚡ Setting cache control headers..." -ForegroundColor Yellow

# CSS and JS files - cache for 1 year  
gsutil -m setmeta -h "Cache-Control:public, max-age=31536000" gs://vocilio-portal-v2/assets/*.css
gsutil -m setmeta -h "Cache-Control:public, max-age=31536000" gs://vocilio-portal-v2/assets/*.js

# HTML files - no cache, always fresh
gsutil -m setmeta -h "Cache-Control:public, max-age=0, must-revalidate" gs://vocilio-portal-v2/*.html

# Set proper content types
gsutil -m setmeta -h "Content-Type:text/html" gs://vocilio-portal-v2/index.html
gsutil -m setmeta -h "Content-Type:text/css" gs://vocilio-portal-v2/assets/*.css  
gsutil -m setmeta -h "Content-Type:application/javascript" gs://vocilio-portal-v2/assets/*.js

Write-Host "🌐 Making bucket publicly accessible..." -ForegroundColor Cyan
gsutil iam ch allUsers:objectViewer gs://vocilio-portal-v2/

Write-Host "🎯 Setting up website configuration..." -ForegroundColor Cyan  
gsutil web set -m index.html -e index.html gs://vocilio-portal-v2/

Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "🌍 Your Vocilio Portal v2 is now live!" -ForegroundColor Green
Write-Host "🔗 URL: https://storage.googleapis.com/$BUCKET_NAME/index.html" -ForegroundColor Cyan

# Show deployment summary
Write-Host "`n📊 Deployment Summary:" -ForegroundColor Blue
Write-Host "   • Bucket: $BUCKET_NAME" -ForegroundColor White
Write-Host "   • Files: $(Get-ChildItem -Recurse dist | Measure-Object).Count files uploaded" -ForegroundColor White
Write-Host "   • Cache: Optimized for performance" -ForegroundColor White
Write-Host "   • CDN: Ready for global distribution" -ForegroundColor White
