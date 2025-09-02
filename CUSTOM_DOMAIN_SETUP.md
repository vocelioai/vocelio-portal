# 🌐 Custom Domain Setup for Vocilio Portal

## ✅ **RECOMMENDED: app.vocelio.ai**

### Why app.vocelio.ai is the best choice:
- ✅ **Industry Standard**: Following modern SaaS conventions
- ✅ **Professional**: Clean, memorable, enterprise-ready  
- ✅ **Shorter**: Easy to type and remember
- ✅ **Scalable**: Leaves room for api.vocelio.ai, docs.vocelio.ai
- ✅ **Modern**: Used by Slack, Notion, Zoom, etc.

## Step 1: DNS Configuration  
Point your **app.vocelio.ai** subdomain to: **34.102.170.45**

### A Record Setup:
```
Type: A
Name: app
Value: 34.102.170.45
TTL: 300 (5 minutes)
```

### Example DNS Records:
```
# For root domain (vocilio-app.com)
A    @    34.102.170.45

# For subdomain (app.vocilio.com)
A    app    34.102.170.45

# Optional CNAME for www
CNAME www    vocilio-app.com
```

## Step 3: Update SSL Certificate
Run this command with YOUR domain:

```powershell
# Replace 'YOUR-DOMAIN.com' with your actual domain
gcloud compute ssl-certificates delete vocilio-v2-ssl --global --quiet
gcloud compute ssl-certificates create vocilio-v2-ssl --domains=YOUR-DOMAIN.com --global
```

## Step 4: Create HTTPS Proxy
```powershell
gcloud compute target-https-proxies create vocilio-v2-https-proxy --url-map=vocilio-v2-map --ssl-certificates=vocilio-v2-ssl
```

## Step 5: Add HTTPS Forwarding Rule
```powershell
gcloud compute forwarding-rules create vocilio-v2-https-rule --global --target-https-proxy=vocilio-v2-https-proxy --ports=443
```

## Step 6: HTTP to HTTPS Redirect
```powershell
# Create redirect URL map
gcloud compute url-maps create vocilio-v2-redirect --default-url-redirect-redirect-response-code=301,https-redirect=True

# Update HTTP proxy to use redirect
gcloud compute target-http-proxies update vocilio-v2-proxy --url-map=vocilio-v2-redirect
```

## Popular Domain Providers:
- **Namecheap**: Easy DNS management
- **GoDaddy**: Popular choice
- **Cloudflare**: Free with additional CDN
- **Google Domains**: Integrates well with GCP

## What's Your Domain?
Tell me your domain name and I'll run the commands for you!
