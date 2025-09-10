# Vocilio Portal v2 - Production Deployment to vocelio-portal-v2 bucket
# Deploy to Cloud Storage + CDN

Write-Host "🚀 Starting Vocilio Portal v2 Production Deployment..." -ForegroundColor Blue
Write-Host "📦 Deploying to: vocelio-portal-v2 bucket" -ForegroundColor Cyan

$BUCKET_NAME = "vocelio-portal-v2"

# Check if build exists
if (-not (Test-Path "dist")) {
    Write-Host "❌ Build directory not found. Running build first..." -ForegroundColor Red
    npm run build
}

Write-Host "📁 Uploading files to Cloud Storage bucket: $BUCKET_NAME" -ForegroundColor Cyan

# Upload all files from dist folder with proper caching headers
Write-Host "🔄 Syncing files..." -ForegroundColor Yellow
gsutil -m rsync -r -d dist/ gs://$BUCKET_NAME/

# Set cache control headers for optimization
Write-Host "⚡ Setting cache control headers..." -ForegroundColor Yellow

# CSS and JS files - cache for 1 year  
gsutil -m setmeta -h "Cache-Control:public, max-age=31536000" gs://$BUCKET_NAME/assets/*.css
gsutil -m setmeta -h "Cache-Control:public, max-age=31536000" gs://$BUCKET_NAME/assets/*.js

# HTML files - no cache, always fresh
gsutil -m setmeta -h "Cache-Control:public, max-age=0, must-revalidate" gs://$BUCKET_NAME/*.html

# Set proper content types
gsutil -m setmeta -h "Content-Type:text/html" gs://$BUCKET_NAME/index.html
gsutil -m setmeta -h "Content-Type:text/css" gs://$BUCKET_NAME/assets/*.css  
gsutil -m setmeta -h "Content-Type:application/javascript" gs://$BUCKET_NAME/assets/*.js

Write-Host "🌐 Making bucket publicly accessible..." -ForegroundColor Cyan
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME/

Write-Host "🎯 Setting up website configuration..." -ForegroundColor Cyan  
gsutil web set -m index.html -e index.html gs://$BUCKET_NAME/

Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "🌍 Your Vocilio Portal v2 is now live!" -ForegroundColor Green
Write-Host "🔗 URL: https://storage.googleapis.com/$BUCKET_NAME/index.html" -ForegroundColor Cyan

# Show deployment summary
Write-Host "`n📊 Deployment Summary:" -ForegroundColor Blue
Write-Host "   • Bucket: $BUCKET_NAME" -ForegroundColor White
Write-Host "   • Files: $(Get-ChildItem -Recurse dist | Measure-Object).Count files uploaded" -ForegroundColor White
Write-Host "   • Cache: Optimized for performance" -ForegroundColor White
Write-Host "   • CDN: Ready for global distribution" -ForegroundColor White
