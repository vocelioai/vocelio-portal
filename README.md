# Vocilio AI Dashboard 🚀

A modern, responsive dashboard for Vocilio's AI-powered calling platform. Built with React, Tailwind CSS, and deployed on Google Cloud Run with CDN support.

![Vocilio Dashboard](https://img.shields.io/badge/React-18.2.0-blue?logo=react)
![Cloud Run](https://img.shields.io/badge/Google%20Cloud%20Run-Ready-green?logo=google-cloud)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.3.0-blue?logo=tailwindcss)

## 🌟 Features

- **Real-time Dashboard** - Live call monitoring and campaign tracking
- **Campaign Management** - Create, manage, and monitor AI calling campaigns
- **Voice Configuration** - Multiple voice tiers (Regular & Premium)
- **Contact Management** - CSV upload, CRM integration, DNC management
- **Analytics & Reporting** - Performance metrics, AI insights, ROI tracking
- **Billing Integration** - Usage tracking and cost management
- **Responsive Design** - Mobile-first, works on all devices
- **Cloud-Native** - Built for Google Cloud Run with auto-scaling

## 🏗️ Architecture

```
Frontend (React + Vite)
├── Cloud Run Deployment
├── Google Cloud CDN
├── Load Balancer
└── Backend API Integration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Google Cloud SDK
- Docker (optional)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd vocelio-portal
npm install
```

### 2. Environment Configuration

Create a `.env` file:

```env
NODE_ENV=development
BACKEND_URL=https://your-backend-url.run.app
REACT_APP_API_URL=http://localhost:3001/api
```

### 3. Local Development

```bash
npm run dev
```

Visit `http://localhost:3000`

## 🌐 Deployment

### Option 1: One-Click Deployment (Windows)

```bash
# Set environment variables
set PROJECT_ID=your-gcp-project-id
set BACKEND_URL=https://your-backend-url.run.app

# Run deployment script
deploy.bat
```

### Option 2: One-Click Deployment (Linux/Mac)

```bash
# Set environment variables
export PROJECT_ID="your-gcp-project-id"
export BACKEND_URL="https://your-backend-url.run.app"

# Make script executable and run
chmod +x deploy.sh
./deploy.sh
```

### Option 3: Manual Deployment

```bash
# Build the app
npm run build

# Deploy to Cloud Run
gcloud run deploy vocilio-dashboard \
  --source . \
  --port 8080 \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,BACKEND_URL=$BACKEND_URL
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment mode | ✅ |
| `BACKEND_URL` | Backend API URL | ✅ |
| `PORT` | Server port (default: 8080) | ❌ |
| `REACT_APP_API_URL` | Frontend API endpoint | ❌ |

### Cloud Run Settings

- **Memory**: 1Gi
- **CPU**: 1 vCPU
- **Max Instances**: 10
- **Port**: 8080
- **Timeout**: 300s

## 📋 API Integration

The dashboard integrates with your backend through these endpoints:

### Dashboard APIs
```javascript
GET /api/dashboard/stats          // Dashboard statistics
GET /api/dashboard/live-calls     // Real-time call data
```

### Campaign APIs
```javascript
GET /api/campaigns               // List campaigns
POST /api/campaigns              // Create campaign
PUT /api/campaigns/:id           // Update campaign
DELETE /api/campaigns/:id        // Delete campaign
```

### Contact APIs
```javascript
GET /api/contacts/lists          // Contact lists
POST /api/contacts/upload        // Upload contacts
```

See `src/services/api.js` for complete API documentation.

## 🎨 Customization

### Branding

Update colors in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      'vocilio-blue': {
        50: '#eff6ff',
        // ... your brand colors
        900: '#1e3a8a',
      }
    }
  }
}
```

### Components

All dashboard components are in `src/components/`:
- `VocilioDashboard.jsx` - Main dashboard
- `DashboardComponents.jsx` - Individual sections

## 🔒 Security Features

- **Helmet.js** - Security headers
- **CSP** - Content Security Policy
- **CORS** - Cross-origin protection
- **Non-root container** - Secure Docker setup
- **JWT Authentication** - Token-based auth

## 📊 Monitoring

### Health Checks

The app includes a health endpoint:
```
GET /health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-09-01T12:00:00Z",
  "version": "1.0.0"
}
```

### Logging

Structured logging for Cloud Run:
- Request/response logs
- Error tracking
- Performance metrics

## 🚀 Performance

### Optimizations

- **Code Splitting** - Lazy loading components
- **CDN** - Static asset delivery
- **Compression** - Gzip/Brotli compression
- **Caching** - Browser and CDN caching
- **Image Optimization** - WebP support

### Metrics

- **Lighthouse Score**: 95+
- **First Contentful Paint**: <1.5s
- **Largest Contentful Paint**: <2.5s

## 🛠️ Development

### Project Structure

```
vocelio-portal/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   ├── services/         # API services
│   └── main.jsx          # Entry point
├── server.js             # Express server
├── Dockerfile            # Container config
├── cloudbuild.yaml       # Cloud Build config
└── deploy.sh             # Deployment script
```

### Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview build
npm start        # Production server
```

### Testing

```bash
# Run tests (when added)
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🔧 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules dist
   npm install
   npm run build
   ```

2. **API Connection Issues**
   - Verify `BACKEND_URL` is correct
   - Check CORS settings on backend
   - Ensure authentication tokens are valid

3. **Deployment Issues**
   ```bash
   # Check logs
   gcloud logs tail --service=vocilio-dashboard --region=us-central1
   
   # Verify environment variables
   gcloud run services describe vocilio-dashboard --region=us-central1
   ```

### Debug Mode

Enable debug logging:
```bash
export DEBUG=vocilio:*
npm run dev
```

## 📚 Documentation

- [Deployment Guide](DEPLOYMENT.md) - Detailed deployment instructions
- [API Documentation](src/services/api.js) - Complete API reference
- [Component Library](src/components/) - Reusable components

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style

- Use Prettier for formatting
- Follow React best practices
- Write descriptive commit messages
- Add JSDoc comments for functions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- 📧 Email: support@vocilio.ai
- 💬 Slack: #vocilio-dashboard
- 📖 Docs: [docs.vocilio.ai](https://docs.vocilio.ai)

## 🗺️ Roadmap

- [ ] WebSocket integration for real-time updates
- [ ] Advanced analytics with charts
- [ ] Multi-tenant support
- [ ] Mobile app companion
- [ ] A/B testing framework
- [ ] Advanced call flow builder

---

**Made with ❤️ by the Vocilio Team**
