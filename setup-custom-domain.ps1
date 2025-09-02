# Custom Domain Setup Script for Vocilio Portal
# IMPORTANT: Replace YOUR-DOMAIN.com with your actual domain before running!

$DOMAIN = "YOUR-DOMAIN.com"  # ⚠️ CHANGE THIS TO YOUR DOMAIN

Write-Host "🌐 Setting up custom domain: $DOMAIN"
Write-Host "📋 Load Balancer IP: 34.102.170.45"
Write-Host ""
Write-Host "⚠️  FIRST: Point your domain's A record to 34.102.170.45"
Write-Host "⚠️  Wait for DNS propagation (5-60 minutes)"
Write-Host ""

$continue = Read-Host "Have you configured DNS? (y/n)"
if ($continue -ne "y") {
    Write-Host "❌ Please configure DNS first, then run this script again"
    exit
}

Write-Host "🔐 Creating SSL certificate for $DOMAIN..."
gcloud compute ssl-certificates delete vocilio-v2-ssl --global --quiet
gcloud compute ssl-certificates create vocilio-v2-ssl --domains=$DOMAIN --global

Write-Host "🔒 Setting up HTTPS proxy..."
gcloud compute target-https-proxies create vocilio-v2-https-proxy --url-map=vocilio-v2-map --ssl-certificates=vocilio-v2-ssl

Write-Host "🌐 Creating HTTPS forwarding rule..."
gcloud compute forwarding-rules create vocilio-v2-https-rule --global --target-https-proxy=vocilio-v2-https-proxy --ports=443

Write-Host "🔄 Setting up HTTP to HTTPS redirect..."
gcloud compute url-maps create vocilio-v2-redirect --default-url-redirect-redirect-response-code=301,https-redirect=True
gcloud compute target-http-proxies update vocilio-v2-proxy --url-map=vocilio-v2-redirect

Write-Host "✅ SSL setup complete!"
Write-Host "🌍 Your secure site will be available at: https://$DOMAIN"
Write-Host "⏳ SSL certificate provisioning may take 10-20 minutes"
Write-Host ""
Write-Host "🔍 Check certificate status:"
Write-Host "gcloud compute ssl-certificates describe vocilio-v2-ssl --global"
