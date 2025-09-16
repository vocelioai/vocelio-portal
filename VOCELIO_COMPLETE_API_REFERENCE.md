# Vocelio Platform - Complete API Reference
*Generated: September 2025 | Version: 2.0.0 | Environment: Production*

## 🌟 Overview
Complete API reference for the Vocelio AI Voice Platform featuring 40+ microservices deployed on Google Cloud Run. This document provides all endpoints, URLs, and integration examples for frontend development.

---

## 🔗 Service URLs & Status

### Core Infrastructure Services
| Service | Status | Production URL | Description |
|---------|--------|----------------|-------------|
| **API Gateway** | ✅ Live | `https://api-gateway-313373223340.us-central1.run.app` | Main API gateway and routing |
| **Auth Service** | ✅ Live | `https://auth-service-313373223340.us-central1.run.app` | Authentication, JWT, user management |
| **Admin Dashboard** | ✅ Live | `https://admin-dashboard-313373223340.us-central1.run.app` | Admin panel and system management |

### Telephony & Voice Services
| Service | Status | Production URL | Description |
|---------|--------|----------------|-------------|
| **Telephony Adapter** | ✅ Live | `https://telephony-adapter-313373223340.us-central1.run.app` | Main telephony integration (Twilio) |
| **Voice Router** | ✅ Live | `https://voice-router-313373223340.us-central1.run.app` | Call routing and voice management |
| **TTS Adapter** | ✅ Live | `https://tts-adapter-313373223340.us-central1.run.app` | Text-to-speech conversion |
| **ASR Adapter** | ✅ Live | `https://asr-adapter-313373223340.us-central1.run.app` | Speech-to-text recognition |
| **Streaming TTS** | ✅ Live | `https://streaming-tts-adapter-313373223340.us-central1.run.app` | Real-time TTS streaming |
| **TTS/ASR Spatial** | ✅ Live | `https://tts-asr-adapter-313373223340.us-central1.run.app` | 3D spatial audio processing |

### AI & Intelligence Services
| Service | Status | Production URL | Description |
|---------|--------|----------------|-------------|
| **AI Voice Intelligence** | ✅ Live | `https://ai-voice-intelligence-313373223340.us-central1.run.app` | AI-powered voice analysis |
| **ML Prediction Service** | ✅ Live | `https://ml-prediction-service-313373223340.us-central1.run.app` | Machine learning predictions |
| **Dialog Orchestrator** | ✅ Live | `https://dialog-orchestrator-313373223340.us-central1.run.app` | Conversation flow management |
| **Decision Engine** | ✅ Live | `https://decision-engine-313373223340.us-central1.run.app` | AI decision making |
| **Analytics Service** | ✅ Live | `https://analytics-service-313373223340.us-central1.run.app` | Data analytics and insights |

### Flow Designer Services (New)
| Service | Status | Production URL | Description |
|---------|--------|----------------|-------------|
| **Flow Analytics** | ✅ Live | `https://flow-analytics-313373223340.us-central1.run.app` | Advanced flow execution analytics |
| **AI Flow Intelligence** | ✅ Live | `https://ai-flow-intelligence-313373223340.us-central1.run.app` | AI-powered flow optimization |
| **Flow Designer** | ✅ Live | `https://flow-designer-313373223340.us-central1.run.app` | Visual flow designer interface |

### Business Management Services
| Service | Status | Production URL | Description |
|---------|--------|----------------|-------------|
| **Campaign Management** | ✅ Live | `https://campaign-management-313373223340.us-central1.run.app` | Campaign creation and management |
| **Contact Management** | ✅ Live | `https://contact-management-313373223340.us-central1.run.app` | Contact database management |
| **Billing Service** | ✅ Live | `https://billing-service-313373223340.us-central1.run.app` | Payment and billing management |
| **Phone Number Service** | ✅ Live | `https://phone-number-service-313373223340.us-central1.run.app` | Phone number provisioning |

### Advanced Integration Services
| Service | Status | Production URL | Description |
|---------|--------|----------------|-------------|
| **Omnichannel Hub** | ✅ Live | `https://omnichannel-hub-313373223340.us-central1.run.app` | Multi-channel communication |
| **WebRTC Bridge** | ✅ Live | `https://webrtc-bridge-313373223340.us-central1.run.app` | Real-time web communication |
| **AR/VR Integration** | ✅ Live | `https://ar-vr-integration-313373223340.us-central1.run.app` | Augmented/Virtual reality support |
| **Video Intelligence** | ✅ Live | `https://video-intelligence-313373223340.us-central1.run.app` | Video analysis and processing |
| **Kafka Event Streaming** | ✅ Live | `https://kafka-event-streaming-313373223340.us-central1.run.app` | Event streaming and messaging |
| **Real-time Monitoring** | ✅ Live | `https://real-time-monitoring-313373223340.us-central1.run.app` | System monitoring and alerts |

---

## 📋 Core API Endpoints

### 1. API Gateway (`https://api-gateway-313373223340.us-central1.run.app`)

#### Campaign Management
```http
# Create Campaign
POST /campaigns
Content-Type: application/json
{
  "name": "Solar Leads Q4",
  "description": "California solar qualified leads",
  "objective": "appointment",
  "voice_tier": "premium",
  "voice_id": "sarah_elevenlabs",
  "timezone": "America/Los_Angeles",
  "daily_limit": 500
}

# List Campaigns
GET /campaigns

# Get Campaign Details
GET /campaigns/{campaign_id}

# Start Campaign
POST /campaigns/{campaign_id}/start

# Pause Campaign
POST /campaigns/{campaign_id}/pause

# Get Campaign Analytics
GET /campaigns/{campaign_id}/analytics

# Upload Contacts
POST /campaigns/{campaign_id}/contacts/upload
Content-Type: application/json
{
  "contacts": [
    {
      "name": "John Smith",
      "phone": "+15551234567",
      "email": "john@company.com"
    }
  ],
  "source": "csv"
}

# List Appointments
GET /appointments
```

### 2. Authentication Service (`https://auth-service-313373223340.us-central1.run.app`)

#### Authentication Endpoints
```http
# User Registration
POST /auth/register
Content-Type: application/json
{
  "email": "user@company.com",
  "password": "securePassword123",
  "full_name": "John Smith",
  "organization": "Acme Corp"
}

# User Login
POST /auth/login
Content-Type: application/json
{
  "email": "user@company.com",
  "password": "securePassword123"
}

# Refresh Token
POST /auth/refresh
Authorization: Bearer {refresh_token}

# Get User Profile
GET /auth/me
Authorization: Bearer {access_token}

# Logout
POST /auth/logout
Authorization: Bearer {access_token}

# Two-Factor Authentication Setup
POST /auth/two-factor/setup
Authorization: Bearer {access_token}

# Password Reset
POST /auth/password-reset
Content-Type: application/json
{
  "email": "user@company.com"
}
```

#### Wallet Management
```http
# Get Wallet Balance
GET /wallet/balance
Authorization: Bearer {access_token}

# Create Deposit
POST /wallet/deposit
Authorization: Bearer {access_token}
Content-Type: application/json
{
  "amount": 100.00,
  "payment_method": "stripe"
}

# Get Transaction History
GET /wallet/transactions
Authorization: Bearer {access_token}

# Get Monthly Usage
GET /wallet/monthly-usage
Authorization: Bearer {access_token}

# End Call (Billing)
POST /calls/end
Authorization: Bearer {access_token}
Content-Type: application/json
{
  "call_sid": "CAxxxxx",
  "duration": 120,
  "voice_tier": "premium"
}
```

### 3. Telephony Adapter (`https://telephony-adapter-313373223340.us-central1.run.app`)

#### Call Management
```http
# Make Outbound Call
POST /api/calls/make
Content-Type: application/json
{
  "to_number": "+15551234567",
  "from_number": "+13072262228",
  "campaign_id": "camp_123",
  "voice_settings": {
    "voice_id": "sarah_elevenlabs",
    "tier": "premium"
  }
}

# Get Call Status
GET /api/calls/{call_sid}/status

# Get Active Calls
GET /admin/active-calls

# Simulate Inbound Call (Testing)
POST /test/simulate-inbound
```

#### Voice Preferences
```http
# Get Available Voices
GET /api/voice/available?phone_number={phone}

# Get Voice Preference
GET /api/voice/preference?phone_number={phone}

# Set Voice Preference
POST /api/voice/preference
Content-Type: application/json
{
  "phone_number": "+15551234567",
  "preferred_voice": "sarah_elevenlabs",
  "voice_tier": "premium"
}

# Voice Preferences Dashboard
GET /voice-preferences
```

#### AR/VR Integration
```http
# Enable AR for Call
POST /calls/{call_sid}/enable-ar
Content-Type: application/json
{
  "ar_type": "overlay",
  "features": ["spatial_audio", "visual_overlay"]
}

# Add AR Overlay
POST /calls/{call_sid}/ar-overlay
Content-Type: application/json
{
  "overlay_type": "product_demo",
  "content": {...}
}

# Send AR Command
POST /calls/{call_sid}/ar-command
Content-Type: application/json
{
  "command": "show_product",
  "parameters": {...}
}

# Get AR Status
GET /calls/{call_sid}/ar-status
```

#### ML Integration
```http
# Get ML Prediction
POST /api/calls/ml-prediction
Content-Type: application/json
{
  "campaign_id": "camp_123",
  "contact_data": {...}
}

# Get Voice Recommendation
POST /api/calls/voice-recommendation
Content-Type: application/json
{
  "customer_profile": {...}
}

# ML Integration Status
GET /api/ml-integration-status
```

### 4. Flow Analytics (`https://flow-analytics-313373223340.us-central1.run.app`)

#### Flow Metrics
```http
# Get Flow Metrics
GET /metrics/flow/{flow_id}

# Get Node Metrics
GET /metrics/node/{node_id}

# Get Execution Metrics
GET /metrics/execution/{execution_id}

# Get Summary Metrics
GET /metrics/summary

# Analytics Dashboard
GET /dashboard
```

#### Flow Tracking
```http
# Track Flow Execution
POST /track/execution
Content-Type: application/json
{
  "flow_id": "flow_123",
  "user_id": "user_456",
  "context": {...}
}

# Update Execution Progress
POST /track/execution/{execution_id}/progress
Content-Type: application/json
{
  "node_id": "node_123",
  "status": "completed"
}

# Complete Execution
POST /track/execution/{execution_id}/complete
Content-Type: application/json
{
  "success": true,
  "result": {...}
}
```

### 5. AI Flow Intelligence (`https://ai-flow-intelligence-313373223340.us-central1.run.app`)

#### AI-Powered Flow Operations
```http
# Create AI Flow
POST /create-flow
Content-Type: application/json
{
  "intent": "Create a customer support flow",
  "context": "E-commerce customer service",
  "requirements": ["appointment booking", "issue resolution"]
}

# Recommend Next Node
POST /recommend-node
Content-Type: application/json
{
  "current_flow": {...},
  "context": {...}
}

# Optimize Flow
POST /optimize-flow/{flow_id}
Content-Type: application/json
{
  "optimization_goals": ["reduce_time", "increase_success"]
}

# Get AI Patterns
GET /patterns

# Analyze Intent
POST /analyze-intent
Content-Type: application/json
{
  "text": "I want to book an appointment for solar installation"
}
```

### 6. ML Prediction Service (`https://ml-prediction-service-313373223340.us-central1.run.app`)

#### Prediction Endpoints
```http
# Predict Campaign Success
POST /api/v2/ml/predict-campaign
Content-Type: application/json
{
  "campaign_id": "camp_123",
  "voice_tier": "premium",
  "target_demographics": {...},
  "historical_data": {...}
}

# Health Check
GET /health

# Service Info
GET /
```

---

## 🔧 Integration Examples

### Frontend Authentication Flow
```javascript
// Login
const loginResponse = await fetch('https://auth-service-313373223340.us-central1.run.app/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@company.com',
    password: 'password123'
  })
});

const { access_token, refresh_token } = await loginResponse.json();

// Make authenticated requests
const campaignsResponse = await fetch('https://api-gateway-313373223340.us-central1.run.app/campaigns', {
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  }
});
```

### Campaign Creation Workflow
```javascript
// 1. Create campaign
const campaign = await fetch('https://api-gateway-313373223340.us-central1.run.app/campaigns', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Solar Q4 Campaign',
    objective: 'appointment',
    voice_tier: 'premium'
  })
});

// 2. Upload contacts
await fetch(`https://api-gateway-313373223340.us-central1.run.app/campaigns/${campaign.id}/contacts/upload`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    contacts: [/* contact list */]
  })
});

// 3. Start campaign
await fetch(`https://api-gateway-313373223340.us-central1.run.app/campaigns/${campaign.id}/start`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Real-time Analytics Integration
```javascript
// WebSocket connection for real-time analytics
const ws = new WebSocket('wss://flow-analytics-313373223340.us-central1.run.app/ws/analytics');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Update dashboard with real-time metrics
  updateDashboard(data);
};

// Get flow metrics
const metrics = await fetch('https://flow-analytics-313373223340.us-central1.run.app/metrics/summary');
```

---

## 🛡️ Security & Headers

### Required Headers
```http
Authorization: Bearer {jwt_token}
Content-Type: application/json
User-Agent: VocelioApp/2.0.0
```

### CORS Configuration
All services support CORS with the following origins:
- `https://app.vocelio.ai` (Production Frontend)
- `https://vocelio.ai` (Marketing Site)
- `http://localhost:3000` (Development)
- `http://localhost:8080` (Testing)

### Rate Limiting
- Authentication: 100 requests/minute
- API Gateway: 1000 requests/minute
- Telephony: 500 requests/minute

---

## 🔗 Quick Reference Links

### Service Documentation
- **Main API**: `https://api-gateway-313373223340.us-central1.run.app/docs`
- **Auth Service**: `https://auth-service-313373223340.us-central1.run.app/docs`
- **Flow Analytics**: `https://flow-analytics-313373223340.us-central1.run.app/dashboard`
- **AR/VR Integration**: `https://ar-vr-integration-313373223340.us-central1.run.app/docs`

### Health Check Endpoints
All services support `/health` endpoint for monitoring:
```bash
curl https://api-gateway-313373223340.us-central1.run.app/health
curl https://auth-service-313373223340.us-central1.run.app/health
curl https://telephony-adapter-313373223340.us-central1.run.app/health
# ... etc for all services
```

---

*This document covers all 40+ production services in the Vocelio platform. For specific service documentation, visit the `/docs` endpoint of each service.*

**Frontend Repository**: Deployed on Google Cloud Storage with CDN  
**Backend Services**: All deployed on Google Cloud Run  
**Database**: Google Cloud SQL PostgreSQL  
**Authentication**: JWT-based with refresh tokens  
**Payment**: Stripe integration  
**Telephony**: Twilio integration  

Last Updated: September 2025 | Vocelio Platform v2.0.0