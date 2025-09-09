# Backend API Endpoints Required for Omnichannel Dashboard

## Overview
Your frontend is using RTK Query hooks that are trying to call these backend endpoints. These are ALL the endpoints you need to implement in your separated backend repository to fix the infinite loading issue in the Omnichannel Dashboard.

## Base URL
```
https://omnichannel-hub-313373223340.us-central1.run.app
```

---

## 1. CHANNEL MANAGEMENT ENDPOINTS

### GET /channels/integrations
**Purpose:** Get all channel integrations
**Method:** GET
**Response Example:**
```json
{
  "channels": [
    {
      "id": "whatsapp-1",
      "type": "whatsapp",
      "name": "WhatsApp Business",
      "status": "connected",
      "config": {
        "phone_number": "+1234567890",
        "webhook_url": "https://your-app.com/webhook"
      },
      "metrics": {
        "active_sessions": 5,
        "total_messages": 150,
        "response_time": 2.3
      }
    },
    {
      "id": "voice-1",
      "type": "voice",
      "name": "Voice System",
      "status": "connected",
      "config": {
        "twilio_account_sid": "ACxxxx",
        "phone_number": "+1987654321"
      },
      "metrics": {
        "active_calls": 2,
        "total_minutes": 450,
        "call_quality": 4.5
      }
    }
  ]
}
```

### POST /channels/{channelType}/configure
**Purpose:** Configure a specific channel
**Method:** POST
**URL Params:** channelType (whatsapp, voice, video, chat, email, sms)
**Body Example:**
```json
{
  "phone_number": "+1234567890",
  "webhook_url": "https://your-app.com/webhook",
  "api_key": "your-api-key"
}
```
**Response:**
```json
{
  "success": true,
  "channel_id": "whatsapp-1",
  "status": "configured"
}
```

### GET /channels/{channelType}/status
**Purpose:** Get status of specific channel
**Method:** GET
**URL Params:** channelType
**Response:**
```json
{
  "channel_type": "whatsapp",
  "status": "connected",
  "last_ping": "2024-01-20T10:30:00Z",
  "health": "healthy",
  "active_sessions": 5
}
```

---

## 2. SESSION MANAGEMENT ENDPOINTS

### GET /sessions/active
**Purpose:** Get all active sessions across channels
**Method:** GET
**Response:**
```json
{
  "sessions": [
    {
      "session_id": "sess_123",
      "customer_id": "cust_456",
      "channel_type": "whatsapp",
      "status": "active",
      "created_at": "2024-01-20T10:00:00Z",
      "last_activity": "2024-01-20T10:29:00Z",
      "agent_id": "agent_789",
      "priority": "high",
      "customer_info": {
        "name": "John Doe",
        "phone": "+1234567890"
      }
    }
  ]
}
```

### POST /sessions/create
**Purpose:** Create new session
**Method:** POST
**Body:**
```json
{
  "customer_id": "cust_456",
  "channel_type": "whatsapp",
  "priority": "normal",
  "initial_message": "Customer needs help"
}
```
**Response:**
```json
{
  "session_id": "sess_123",
  "status": "created",
  "created_at": "2024-01-20T10:30:00Z"
}
```

### PUT /sessions/{sessionId}
**Purpose:** Update session details
**Method:** PUT
**URL Params:** sessionId
**Body:**
```json
{
  "status": "resolved",
  "agent_id": "agent_789",
  "priority": "low"
}
```

### POST /sessions/{sessionId}/transfer
**Purpose:** Transfer session between channels
**Method:** POST
**URL Params:** sessionId
**Body:**
```json
{
  "from_channel": "chat",
  "to_channel": "voice",
  "reason": "Customer requested voice call",
  "agent_id": "agent_789"
}
```

---

## 3. ANALYTICS & REPORTING ENDPOINTS

### GET /analytics/dashboard
**Purpose:** Get dashboard analytics data
**Method:** GET
**Query Params:** range (1h, 24h, 7d, 30d)
**Response:**
```json
{
  "totalSessions": 45,
  "activeChannels": 6,
  "responseTime": 2.3,
  "satisfactionScore": 4.2,
  "channelMetrics": {
    "whatsapp": {
      "sessions": 15,
      "messages": 150,
      "avg_response_time": 1.8
    },
    "voice": {
      "calls": 8,
      "minutes": 240,
      "quality_score": 4.5
    }
  },
  "trends": [
    {
      "timestamp": "2024-01-20T09:00:00Z",
      "sessions": 5,
      "messages": 25
    }
  ]
}
```

### GET /analytics/channel-performance
**Purpose:** Get channel performance metrics
**Method:** GET
**Query Params:** channel, range
**Response:**
```json
{
  "channel": "whatsapp",
  "timeRange": "7d",
  "metrics": {
    "totalSessions": 50,
    "avgResponseTime": 1.8,
    "resolutionRate": 85.5,
    "customerSatisfaction": 4.2
  },
  "hourlyData": []
}
```

### GET /analytics/customer-satisfaction
**Purpose:** Get customer satisfaction metrics
**Method:** GET
**Response:**
```json
{
  "overallScore": 4.2,
  "totalResponses": 120,
  "byChannel": {
    "whatsapp": 4.3,
    "voice": 4.1,
    "chat": 4.0
  },
  "trends": []
}
```

---

## 4. CUSTOMER MANAGEMENT ENDPOINTS

### GET /customers/{customerId}/profile
**Purpose:** Get customer profile
**Method:** GET
**URL Params:** customerId
**Response:**
```json
{
  "customer_id": "cust_456",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "preferences": {
    "language": "en",
    "preferred_channel": "whatsapp"
  },
  "tags": ["vip", "returning"],
  "created_at": "2024-01-01T00:00:00Z"
}
```

### GET /customers/{customerId}/history
**Purpose:** Get customer interaction history
**Method:** GET
**URL Params:** customerId
**Query Params:** limit (default: 50)
**Response:**
```json
{
  "interactions": [
    {
      "session_id": "sess_123",
      "channel_type": "whatsapp",
      "created_at": "2024-01-20T10:00:00Z",
      "status": "resolved",
      "summary": "Product inquiry"
    }
  ]
}
```

### PUT /customers/{customerId}/profile
**Purpose:** Update customer profile
**Method:** PUT
**URL Params:** customerId
**Body:**
```json
{
  "name": "John Smith",
  "email": "john.smith@example.com",
  "preferences": {
    "language": "es"
  }
}
```

---

## 5. CAMPAIGN INTEGRATION ENDPOINTS

### GET /campaigns/{campaignId}/omnichannel
**Purpose:** Get campaign omnichannel data
**Method:** GET
**URL Params:** campaignId
**Response:**
```json
{
  "campaign_id": "camp_123",
  "name": "Summer Sale",
  "channels": ["whatsapp", "email", "sms"],
  "metrics": {
    "total_sent": 1000,
    "responses": 150,
    "conversions": 25
  }
}
```

### PUT /campaigns/{campaignId}/channels
**Purpose:** Update campaign channel settings
**Method:** PUT
**URL Params:** campaignId
**Body:**
```json
{
  "channels": ["whatsapp", "email"],
  "settings": {
    "whatsapp": {
      "template": "summer_sale_template"
    }
  }
}
```

---

## 6. NOTIFICATIONS ENDPOINTS

### GET /notifications
**Purpose:** Get notifications
**Method:** GET
**Query Params:** limit (default: 20), unread_only (default: false)
**Response:**
```json
{
  "notifications": [
    {
      "id": "notif_123",
      "type": "session_alert",
      "title": "High Priority Session",
      "message": "Customer waiting for 5+ minutes",
      "read": false,
      "created_at": "2024-01-20T10:25:00Z"
    }
  ]
}
```

### PUT /notifications/{notificationId}/read
**Purpose:** Mark notification as read
**Method:** PUT
**URL Params:** notificationId
**Response:**
```json
{
  "success": true,
  "notification_id": "notif_123"
}
```

---

## 7. SYSTEM HEALTH ENDPOINTS (Already Implemented)

### GET /health ✅
**Status:** Already working
**Response:**
```json
{
  "status": "healthy",
  "services": {
    "database": "up",
    "redis": "up",
    "webhooks": "up"
  },
  "uptime": 86400
}
```

### GET /capabilities ✅
**Status:** Already working
**Response:**
```json
{
  "channels": ["whatsapp", "voice", "video", "chat", "email", "sms"],
  "features": ["session_transfer", "analytics", "routing"],
  "version": "1.0.0"
}
```

---

## 8. INTEGRATION MANAGEMENT ENDPOINTS

### GET /integrations/status
**Purpose:** Get integration status
**Method:** GET
**Response:**
```json
{
  "integrations": [
    {
      "type": "whatsapp",
      "status": "connected",
      "last_sync": "2024-01-20T10:30:00Z"
    },
    {
      "type": "twilio",
      "status": "connected",
      "last_sync": "2024-01-20T10:29:00Z"
    }
  ]
}
```

### POST /integrations/{integrationType}/test
**Purpose:** Test integration connectivity
**Method:** POST
**URL Params:** integrationType
**Body:**
```json
{
  "api_key": "test-key",
  "phone_number": "+1234567890"
}
```
**Response:**
```json
{
  "success": true,
  "test_result": "Connection successful",
  "latency": 150
}
```

---

## 9. ADDITIONAL ENDPOINTS FROM DOCUMENTATION

### GET /messages/{sessionId}
**Purpose:** Get messages for a session
**Method:** GET
**Response:**
```json
{
  "messages": [
    {
      "message_id": "msg_123",
      "session_id": "sess_123",
      "sender": "customer",
      "content": "I need help with my order",
      "timestamp": "2024-01-20T10:15:00Z",
      "type": "text"
    }
  ]
}
```

### POST /messages/send
**Purpose:** Send message in session
**Method:** POST
**Body:**
```json
{
  "session_id": "sess_123",
  "content": "How can I help you?",
  "type": "text"
}
```

### GET /routing/rules
**Purpose:** Get routing rules
**Method:** GET
**Response:**
```json
{
  "rules": [
    {
      "id": "rule_1",
      "condition": "channel=whatsapp AND priority=high",
      "action": "assign_to_agent_group:vip"
    }
  ]
}
```

---

## PRIORITY IMPLEMENTATION ORDER

1. **Critical (Fix Loading Issue):**
   - GET /channels/integrations
   - GET /sessions/active  
   - GET /analytics/dashboard

2. **High Priority:**
   - POST /sessions/create
   - PUT /sessions/{sessionId}
   - GET /notifications

3. **Medium Priority:**
   - All analytics endpoints
   - Customer management endpoints

4. **Low Priority:**
   - Campaign endpoints
   - Advanced integration endpoints

---

## QUICK START IMPLEMENTATION

For a minimal working dashboard, implement these 3 endpoints first:

```javascript
// 1. GET /channels/integrations
app.get('/channels/integrations', (req, res) => {
  res.json({
    channels: [
      {
        id: 'whatsapp-1',
        type: 'whatsapp',
        name: 'WhatsApp Business',
        status: 'connected',
        metrics: { active_sessions: 0 }
      }
    ]
  });
});

// 2. GET /sessions/active  
app.get('/sessions/active', (req, res) => {
  res.json({ sessions: [] });
});

// 3. GET /analytics/dashboard
app.get('/analytics/dashboard', (req, res) => {
  res.json({
    totalSessions: 0,
    activeChannels: 1,
    responseTime: 0,
    satisfactionScore: 0,
    channelMetrics: {},
    trends: []
  });
});
```

This will stop the infinite loading and show an empty dashboard that you can then populate with real data.
