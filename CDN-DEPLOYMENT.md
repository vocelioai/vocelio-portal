# Vocilio Dashboard - Cloud CDN Deployment Guide

## 🌍 Ultra-Fast Global CDN Deployment

Your React/Vite dashboard will be served from Google's global edge network for lightning-fast performance worldwide.

## 🚀 Quick Start

### Prerequisites
- Google Cloud SDK installed
- Project with billing enabled
- Storage Admin permissions

### 1. Update Configuration
Edit `deploy-cdn.ps1` or `deploy-cdn.sh` and set:
```bash
PROJECT_ID="your-actual-project-id"  # Your Google Cloud project
BUCKET_NAME="vocilio-dashboard"      # Choose unique bucket name
```

### 2. Deploy (Windows)
```powershell
.\deploy-cdn.ps1
```

### 3. Deploy (Linux/Mac)
```bash
chmod +x deploy-cdn.sh
./deploy-cdn.sh
```

## 🌟 What You Get

### ⚡ Performance Benefits
- **Global CDN**: 200+ edge locations worldwide
- **Ultra-low latency**: <50ms globally
- **Auto-scaling**: Handles traffic spikes
- **Optimized caching**: CSS/JS cached for 1 year

### 🌍 Architecture
```
User Request → Nearest Google Edge → Cloud Storage → Your Dashboard
     ↓              ↓                      ↓
   <50ms         Cached Response      Original Files
```

### 📊 Expected Performance
- **First Load**: 200-500ms (global)
- **Repeat Visits**: 50-100ms (cached)
- **Static Assets**: Served from edge
- **API Calls**: Direct to your Cloud Run backend

## 🔧 Advanced Configuration

### Custom Domain Setup
1. Get your global IP from deployment output
2. Create DNS A record: `dashboard.yourdomain.com → GLOBAL_IP`
3. Set up SSL certificate in Cloud Console

### HTTPS Setup (Recommended)
```bash
# Create SSL certificate
gcloud compute ssl-certificates create vocilio-dashboard-ssl \
    --domains=dashboard.yourdomain.com

# Update load balancer for HTTPS
gcloud compute target-https-proxies create vocilio-dashboard-https-proxy \
    --url-map=vocilio-dashboard-url-map \
    --ssl-certificates=vocilio-dashboard-ssl
```

## 📈 Monitoring & Analytics
- Cloud Console → Load Balancing → Monitor traffic
- Set up uptime checks
- Configure alerting for availability

## 💰 Cost Estimation
- **Storage**: ~$0.02/GB/month
- **CDN Traffic**: ~$0.08-$0.12/GB
- **Load Balancer**: ~$18/month
- **Total for typical usage**: $20-30/month

## 🔄 Updates & CI/CD
After initial deployment, update with:
```bash
npm run build
gsutil -m rsync -r -d dist/ gs://vocilio-dashboard/
```

## 🎯 Why This Setup is Perfect for AI Calling
1. **Global Performance**: Users worldwide get fast dashboard access
2. **Backend Proximity**: API calls still go to your Cloud Run (same region)
3. **Reliability**: Google's 99.9% uptime SLA
4. **Scalability**: Handles millions of requests automatically

Your dashboard will be lightning-fast globally while maintaining low-latency communication with your AI calling backend! 🚀
