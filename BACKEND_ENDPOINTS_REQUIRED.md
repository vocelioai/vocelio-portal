# Backend API Endpoints Required for Frontend Integration

Based on the frontend integration with your production Cloud Run microservices, here are the specific API endpoints that need to be implemented in your backend services:

## 🔧 **CRM Integration Service** (`https://crm-integration-313373223340.us-central1.run.app`)

### Contact Management
- `GET /api/contacts/lists` - Get all contact lists
- `GET /api/contacts/lists/{listId}/contacts` - Get contacts from specific list
  - Query params: `limit`, `page`, `search`, `status`, `phoneFilter`
- `GET /api/contacts/search` - Search contacts across all lists
  - Query params: `q`, `limit`, `includeInactive`
- `GET /api/contacts/{contactId}` - Get contact details
- `POST /api/contacts` - Create new contact
- `PUT /api/contacts/{contactId}` - Update contact
- `DELETE /api/contacts/{contactId}` - Delete contact

### Voice Management
- `GET /api/voices` - Get available TTS voices
- `POST /api/voices/test` - Test voice synthesis

## 🎯 **AI Voice Intelligence Service** (`https://ai-voice-intelligence-313373223340.us-central1.run.app`)

### Voice Analysis
- `POST /api/analyze/quality` - Analyze voice call quality
  - Body: `{ callId, audioData, analysisType }`
- `POST /api/insights` - Generate voice conversation insights
  - Body: `conversationData`

## 🎤 **TTS Adapter Service** (`https://tts-adapter-313373223340.us-central1.run.app`)

### Text-to-Speech
- `POST /api/synthesize` - Generate speech from text
  - Body: `{ text, voiceId, options: { speed, pitch, volume, format } }`
- `GET /api/voices` - Get available TTS voices

## 🎧 **ASR Adapter Service** (`https://asr-adapter-313373223340.us-central1.run.app`)

### Speech Recognition
- `POST /api/transcribe` - Transcribe audio to text
  - Body: `{ audioData, language, model, enableDiarization }`

## 📞 **Call Transfer Service** (`https://call-transfer-313373223340.us-central1.run.app`)

### Call Management
- `POST /api/transfer/initiate` - Transfer call to agent
  - Body: `{ callId, targetAgent, options }`
- `GET /api/calls/active` - Get all active calls
- `GET /api/calls/{callId}` - Get call details

## 📹 **Call Recording Service** (`https://call-recording-313373223340.us-central1.run.app`)

### Recording Management
- `POST /api/recording/start` - Start call recording
  - Body: `{ callId, options }`
- `POST /api/recording/{recordingId}/stop` - Stop recording
- `GET /api/recordings` - Get recordings list
- `GET /api/recordings/{recordingId}/download` - Download recording

## 📱 **Phone Number Service** (`https://phone-number-service-313373223340.us-central1.run.app`)

### Phone Number Management
- `GET /api/numbers/available` - Get available phone numbers
  - Query params: `areaCode`, `country`
- `POST /api/numbers/purchase` - Purchase phone number
  - Body: `{ phoneNumber }`
- `DELETE /api/numbers/release` - Release phone number
  - Body: `{ phoneNumber }`

## 🎥 **WebRTC Bridge Service** (`https://webrtc-bridge-313373223340.us-central1.run.app`)

### Video Calling
- `POST /api/session/create` - Create WebRTC session
  - Body: `options`
- `POST /api/session/{sessionId}/join` - Join WebRTC session
  - Body: `participantInfo`

## 📊 **Analytics Service** (`https://analytics-service-313373223340.us-central1.run.app`)

### Analytics & Reporting
- `GET /api/campaigns/{campaignId}/analytics` - Campaign analytics
  - Query params: `timeRange`
- `GET /api/campaigns/performance` - Campaign performance metrics
- `GET /api/calls/analytics` - Call analytics
- `GET /api/calls/{callId}/quality` - Voice quality metrics
- `GET /api/revenue` - Revenue analytics
  - Query params: `timeRange`
- `GET /api/campaigns/{campaignId}/roi` - ROI analysis
- `GET /api/usage` - Usage metrics
  - Query params: `timeRange`
- `GET /api/usage/api` - API usage statistics

## 📈 **Real-Time Monitoring Service** (`https://real-time-monitoring-313373223340.us-central1.run.app`)

### Dashboard & Live Data
- `GET /api/dashboard/stats` - Real-time dashboard statistics
- `GET /api/calls/live` - Live calls data
- `GET /api/system/health` - System health status

### WebSocket Endpoints
- `WS /ws/analytics` - Real-time analytics updates

## 🏗️ **Advanced Analytics Service** (`https://advanced-analytics-313373223340.us-central1.run.app`)

### Advanced Insights
- `GET /api/funnels/{campaignId}` - Conversion funnels
- `GET /api/journey/{customerId}` - Customer journey
- `POST /api/insights/predictive` - Predictive insights
  - Body: `{ dataType, timeRange }`
- `POST /api/reports/custom` - Generate custom report
  - Body: `reportConfig`
- `GET /api/reports/{reportId}/status` - Report status
- `GET /api/reports/{reportId}/download` - Download report
  - Query params: `format`

## 💳 **Billing Service** (`https://billing-service-313373223340.us-central1.run.app`)

### Billing & Subscriptions
- `GET /api/billing/subscription` - Get subscription details
- `GET /api/billing/payment-methods` - Get payment methods
- `GET /api/billing/invoices` - Get invoices list
- `GET /api/billing/usage` - Get usage data
- `POST /api/billing/payment-methods` - Add payment method
- `PUT /api/billing/subscription` - Update subscription
- `GET /api/billing/invoices/{invoiceId}/download` - Download invoice

## 🔌 **WebSocket Service** (`wss://websocket-service-313373223340.us-central1.run.app`)

### Real-Time Connections
- `WS /ws/dashboard` - Dashboard real-time updates
- `WS /ws/calls` - Call status updates
- `WS /ws/campaigns` - Campaign updates
- `WS /ws/notifications` - System notifications

## 🔐 **Required Headers for All Services**

All API endpoints should accept these headers:
- `Authorization: Bearer {token}` - JWT authentication
- `X-Tenant-ID: {tenantId}` - Multi-tenant isolation
- `Content-Type: application/json`

## 🚨 **Critical Missing Endpoints**

If any of these endpoints are not yet implemented in your backend services, the frontend will show errors. Priority implementation order:

1. **High Priority**: Contact management, Dashboard stats, System health
2. **Medium Priority**: Voice services, Call management, Analytics
3. **Low Priority**: Advanced analytics, Custom reports, WebRTC features

## 📝 **Response Format Standards**

All endpoints should return consistent JSON responses:
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message",
  "timestamp": "2025-09-17T10:30:00Z"
}
```

Error responses:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  },
  "timestamp": "2025-09-17T10:30:00Z"
}
```