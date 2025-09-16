# 🚀 BACKEND IMPLEMENTATION PRIORITY GUIDE

*Complete Implementation Roadmap for Vocelio Backend Services*

---

## 🎯 **IMPLEMENTATION OVERVIEW**

Your frontend systems (Call Center + Contact Management + Omnichannel) are **production-ready** but need these backend services to be fully functional:

### **✅ PRIORITY 1: CRITICAL SERVICES (Week 1)**
1. **Call Transfer Service** - For live call management and agent routing
2. **Telephony Adapter** - Core calling functionality 
3. **Environment Variables** - Service configuration

### **🔄 PRIORITY 2: ENHANCED SERVICES (Week 2)**
1. **TTS Service Integration** - Voice synthesis
2. **Contact Management APIs** - Database operations
3. **Real-time WebSocket Services** - Live updates

### **🌟 PRIORITY 3: ADVANCED SERVICES (Week 3+)**
1. **CRM Integration Service** - Salesforce, HubSpot, etc.
2. **Omnichannel Hub Service** - Multi-channel orchestration
3. **Analytics & Reporting Service** - Business intelligence

---

## 🔥 **PRIORITY 1: CRITICAL SERVICES**

### 1. 📞 **CALL TRANSFER SERVICE** 
*Status: Required for live call monitoring and agent management*

#### **Service Requirements:**
```
URL: https://call-transfer-service-313373223340.us-central1.run.app
Port: 8098
Framework: Node.js/Express or Python/FastAPI
Database: PostgreSQL or MongoDB
```

#### **Required API Endpoints:**

```javascript
// Department Management
POST   /departments                 // Create department
GET    /departments                 // List all departments  
PUT    /departments/{id}            // Update department
DELETE /departments/{id}            // Delete department

// Call Transfer Operations
POST   /transfer/request            // Request call transfer
GET    /transfer/{transfer_id}      // Get transfer status
POST   /transfer/{transfer_id}/complete // Mark transfer complete
GET    /call/{call_id}/transfer-history // Transfer history

// Agent Management
GET    /agents                      // List all agents
POST   /agents/register             // Register new agent
PUT    /agents/{agent_id}/status    // Update agent status
GET    /agents/{agent_id}           // Get agent details

// Queue Management
GET    /departments/{dept}/queue    // Get department queue
GET    /queue/status                // Overall queue status

// Call Logs & Analytics
GET    /call-logs                   // Get call history
GET    /calls/active                // Get active calls
GET    /analytics/transfers         // Transfer analytics

// Real-time Updates
WebSocket: /ws/transfers            // Live transfer updates
```

#### **Database Schema:**
```sql
-- Departments table
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Agents table
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'offline',
    skills TEXT[],
    languages TEXT[],
    performance_rating DECIMAL(3,2) DEFAULT 4.0,
    last_activity TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Transfer requests table
CREATE TABLE transfer_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_id VARCHAR(100) UNIQUE NOT NULL,
    call_id VARCHAR(100) NOT NULL,
    from_number VARCHAR(20),
    to_department VARCHAR(100) NOT NULL,
    agent_id VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    reason TEXT,
    context_data JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Call logs table
CREATE TABLE call_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id VARCHAR(100) UNIQUE NOT NULL,
    caller_phone VARCHAR(20),
    duration INTEGER DEFAULT 0,
    status VARCHAR(50),
    department VARCHAR(100),
    agent_id VARCHAR(100),
    transfer_count INTEGER DEFAULT 0,
    cost_ai DECIMAL(10,4),
    cost_human DECIMAL(10,4),
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### **Implementation Template (Node.js):**
```javascript
// server.js
const express = require('express');
const { Pool } = require('pg');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Department endpoints
app.get('/departments', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM departments WHERE status = $1', ['active']);
    res.json({ departments: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/departments', async (req, res) => {
  const { name, phone_number } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO departments (name, phone_number) VALUES ($1, $2) RETURNING *',
      [name, phone_number]
    );
    res.status(201).json({ department: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Transfer endpoints
app.post('/transfer/request', async (req, res) => {
  const { call_id, department, reason, context } = req.body;
  const transfer_id = `transfer_${Date.now()}`;
  
  try {
    const result = await pool.query(`
      INSERT INTO transfer_requests (transfer_id, call_id, to_department, reason, context_data)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, [transfer_id, call_id, department, reason, context]);
    
    // Broadcast to WebSocket clients
    broadcastTransferUpdate({
      type: 'transfer_requested',
      data: result.rows[0]
    });
    
    res.status(201).json({ transfer: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Agent endpoints
app.post('/agents/register', async (req, res) => {
  const { agent_id, name, email, department, skills, languages } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO agents (agent_id, name, email, department, skills, languages)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `, [agent_id, name, email, department, skills, languages]);
    
    res.status(201).json({ agent: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// WebSocket server for real-time updates
const wss = new WebSocket.Server({ port: 8099 });

function broadcastTransferUpdate(message) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

app.listen(8098, () => {
  console.log('Call Transfer Service running on port 8098');
});
```

### 2. 🔌 **TELEPHONY ADAPTER CONFIGURATION**
*Status: Core service for making and managing calls*

#### **Service Requirements:**
```
URL: VITE_TELEPHONY_ADAPTER_URL
Framework: Node.js/Express with Twilio SDK
Dependencies: Twilio, WebSocket support
```

#### **Required Endpoints:**
```javascript
// Core calling functionality
POST   /api/calls/make              // Make outbound call
GET    /api/calls/{call_sid}/status // Get call status
POST   /calls/transfer              // Transfer call
GET    /admin/active-calls          // Get active calls
POST   /admin/register-flow         // Register call flow
DELETE /admin/unregister-flow       // Unregister flow

// Call control
POST   /api/calls/{call_sid}/mute   // Mute/unmute call
POST   /api/calls/{call_sid}/hold   // Hold/unhold call
POST   /api/calls/{call_sid}/end    // End call
```

#### **Implementation Template:**
```javascript
// telephony-adapter.js
const express = require('express');
const twilio = require('twilio');

const app = express();
app.use(express.json());

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Make outbound call
app.post('/api/calls/make', async (req, res) => {
  const { to, from, message, voice_settings } = req.body;
  
  try {
    const call = await client.calls.create({
      to: to,
      from: from || process.env.TWILIO_PHONE_NUMBER,
      twiml: `<Response><Say voice="${voice_settings?.voice_id || 'alice'}">${message}</Say></Response>`
    });
    
    res.json({
      call_sid: call.sid,
      status: call.status,
      to: call.to,
      from: call.from
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get call status
app.get('/api/calls/:call_sid/status', async (req, res) => {
  try {
    const call = await client.calls(req.params.call_sid).fetch();
    res.json({
      call_sid: call.sid,
      status: call.status,
      duration: call.duration,
      start_time: call.startTime,
      end_time: call.endTime
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Transfer call
app.post('/calls/transfer', async (req, res) => {
  const { call_sid, transfer_to } = req.body;
  
  try {
    const call = await client.calls(call_sid).update({
      twiml: `<Response><Dial>${transfer_to}</Dial></Response>`
    });
    
    res.json({ success: true, call_sid: call.sid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(process.env.TELEPHONY_PORT || 8001, () => {
  console.log('Telephony Adapter running on port 8001');
});
```

### 3. 🎤 **TTS SERVICE INTEGRATION**
*Status: Required for voice synthesis in calls*

#### **Service Requirements:**
```
URL: VITE_TTS_ADAPTER_URL
Providers: Azure TTS + ElevenLabs
Framework: Node.js/Python with provider SDKs
```

#### **Required Endpoints:**
```javascript
// Voice management
GET    /tiers                       // Get voice tiers (regular/premium)
GET    /voices/{provider}           // Get voices for provider
POST   /synthesize                  // Synthesize speech
GET    /voices/preview/{voice_id}   // Preview voice

// Streaming (for real-time)
POST   /stream/synthesize           // Stream TTS
WebSocket: /ws/tts                  // Real-time TTS streaming
```

#### **Implementation Template:**
```javascript
// tts-adapter.js
const express = require('express');
const axios = require('axios');
const fs = require('fs');

const app = express();
app.use(express.json());

// Voice tier configuration
const VOICE_TIERS = {
  regular: {
    tts_provider: 'azure',
    price_per_minute: 0.08,
    voices: ['en-US-AriaNeural', 'en-US-JennyNeural']
  },
  premium: {
    tts_provider: 'elevenlabs',
    price_per_minute: 0.25,
    voices: ['pNInz6obpgDQGcFmaJgB', 'EXAVITQu4vr4xnSDxMaL']
  }
};

// Get tiers
app.get('/tiers', (req, res) => {
  res.json({ tiers: VOICE_TIERS });
});

// Get voices for provider
app.get('/voices/:provider', async (req, res) => {
  const provider = req.params.provider;
  
  try {
    let voices = [];
    
    if (provider === 'azure') {
      // Azure TTS voices
      voices = [
        { id: 'en-US-AriaNeural', name: 'Aria (Neural)', language: 'en-US', gender: 'female' },
        { id: 'en-US-JennyNeural', name: 'Jenny (Neural)', language: 'en-US', gender: 'female' },
        { id: 'en-US-GuyNeural', name: 'Guy (Neural)', language: 'en-US', gender: 'male' }
      ];
    } else if (provider === 'elevenlabs') {
      // ElevenLabs API call to get voices
      const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
        headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY }
      });
      voices = response.data.voices.map(v => ({
        id: v.voice_id,
        name: v.name,
        language: 'en-US',
        gender: v.labels?.gender || 'unknown'
      }));
    }
    
    res.json({ voices });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Synthesize speech
app.post('/synthesize', async (req, res) => {
  const { text, voice_id, provider } = req.body;
  
  try {
    let audioBuffer;
    
    if (provider === 'azure' || !provider) {
      // Azure TTS synthesis
      audioBuffer = await synthesizeAzure(text, voice_id);
    } else if (provider === 'elevenlabs') {
      // ElevenLabs synthesis
      audioBuffer = await synthesizeElevenLabs(text, voice_id);
    }
    
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
      'Provider': provider
    });
    res.send(audioBuffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function synthesizeAzure(text, voice) {
  // Azure Speech SDK implementation
  const sdk = require('microsoft-cognitiveservices-speech-sdk');
  
  const speechConfig = sdk.SpeechConfig.fromSubscription(
    process.env.AZURE_SPEECH_KEY,
    process.env.AZURE_SPEECH_REGION
  );
  speechConfig.speechSynthesisVoiceName = voice;
  speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;
  
  const synthesizer = new sdk.SpeechSynthesizer(speechConfig);
  
  return new Promise((resolve, reject) => {
    synthesizer.speakTextAsync(text, result => {
      if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
        resolve(Buffer.from(result.audioData));
      } else {
        reject(new Error(result.errorDetails));
      }
      synthesizer.close();
    });
  });
}

async function synthesizeElevenLabs(text, voiceId) {
  const response = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    { text, model_id: 'eleven_monolingual_v1' },
    {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      responseType: 'arraybuffer'
    }
  );
  
  return Buffer.from(response.data);
}

app.listen(process.env.TTS_PORT || 8002, () => {
  console.log('TTS Adapter running on port 8002');
});
```

### 4. ⚙️ **ENVIRONMENT VARIABLE SETUP**

#### **Create `.env` file:**
```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/vocelio
REDIS_URL=redis://localhost:6379

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Azure Speech Services
AZURE_SPEECH_KEY=your_azure_speech_key
AZURE_SPEECH_REGION=your_azure_region

# ElevenLabs API
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Service URLs
VITE_API_GATEWAY_URL=http://localhost:8000
VITE_TELEPHONY_ADAPTER_URL=http://localhost:8001
VITE_TTS_ADAPTER_URL=http://localhost:8002
VITE_STREAMING_TTS_ADAPTER_URL=http://localhost:8003
VITE_VOICE_ROUTER_URL=http://localhost:8004
VITE_ASR_ADAPTER_URL=http://localhost:8005
VITE_VAD_SERVICE_URL=http://localhost:8006

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-256-bits-long
JWT_EXPIRES_IN=24h

# File Storage
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_BUCKET_NAME=vocelio-uploads
AWS_REGION=us-east-1

# Service Ports
TELEPHONY_PORT=8001
TTS_PORT=8002
TRANSFER_SERVICE_PORT=8098
```

#### **Production Environment Variables (for deployment):**
```bash
# Production URLs
VITE_API_GATEWAY_URL=https://api.vocelio.com
VITE_TELEPHONY_ADAPTER_URL=https://telephony.vocelio.com
VITE_TTS_ADAPTER_URL=https://tts.vocelio.com
VITE_VOICE_ROUTER_URL=https://voice-router.vocelio.com

# Database (Production)
DATABASE_URL=postgresql://prod_user:secure_password@prod-db.vocelio.com:5432/vocelio_prod

# External Services
TWILIO_PHONE_NUMBER=your_production_twilio_number
```

---

## 🔄 **PRIORITY 2: ENHANCED SERVICES**

### 1. 📊 **CONTACT MANAGEMENT API SERVICE**
*Based on your Contact Management Backend Guide*

#### **Quick Implementation (Node.js/Express):**
```javascript
// contact-api.js
const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Contact Lists
app.get('/v1/contact-lists', async (req, res) => {
  const { page = 1, limit = 50, search, status = 'active' } = req.query;
  const offset = (page - 1) * limit;
  
  try {
    let query = 'SELECT * FROM contact_lists WHERE status = $1';
    let params = [status];
    
    if (search) {
      query += ' AND name ILIKE $2';
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    const countResult = await pool.query('SELECT COUNT(*) FROM contact_lists WHERE status = $1', [status]);
    
    res.json({
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Contacts
app.get('/v1/contacts', async (req, res) => {
  const { page = 1, limit = 50, search, listId, status, tags } = req.query;
  // Implementation similar to contact-lists but with contacts table
  // Include joins with contact_list_memberships if listId provided
});

app.post('/v1/contact-lists', async (req, res) => {
  const { name, description, tags } = req.body;
  // Implementation for creating contact lists
});

// More endpoints as per the backend guide...

app.listen(8000, () => {
  console.log('Contact Management API running on port 8000');
});
```

### 2. 🌐 **REAL-TIME WEBSOCKET SERVICE**
```javascript
// websocket-service.js
const WebSocket = require('ws');
const { createServer } = require('http');

const server = createServer();
const wss = new WebSocket.Server({ server });

// Connection handling
wss.on('connection', (ws) => {
  console.log('New WebSocket connection');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'subscribe':
          // Handle subscription to channels
          ws.channel = data.channel;
          ws.filters = data.filters;
          break;
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

// Broadcast function for other services
function broadcast(channel, data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN && client.channel === channel) {
      client.send(JSON.stringify(data));
    }
  });
}

server.listen(8007, () => {
  console.log('WebSocket service running on port 8007');
});

module.exports = { broadcast };
```

---

## 📋 **QUICK START CHECKLIST**

### **Week 1 Implementation:**
- [ ] Set up PostgreSQL database
- [ ] Create database tables (departments, agents, transfer_requests, call_logs)
- [ ] Implement Call Transfer Service (basic endpoints)
- [ ] Set up Twilio account and implement Telephony Adapter
- [ ] Configure environment variables
- [ ] Test basic call making and transfer functionality

### **Week 2 Implementation:**
- [ ] Implement TTS Service with Azure/ElevenLabs integration
- [ ] Add Contact Management API endpoints
- [ ] Set up WebSocket service for real-time updates
- [ ] Implement authentication middleware
- [ ] Add error handling and logging

### **Week 3 Implementation:**
- [ ] Add CRM integration endpoints (Salesforce, HubSpot)
- [ ] Implement file upload and processing
- [ ] Add analytics and reporting endpoints
- [ ] Set up monitoring and health checks
- [ ] Deploy to production environment

---

## 🚀 **DEPLOYMENT ARCHITECTURE**

### **Recommended Infrastructure:**
```yaml
# docker-compose.yml
version: '3.8'
services:
  # Database
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: vocelio
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  # Redis for caching and sessions
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  # Call Transfer Service
  call-transfer:
    build: ./call-transfer-service
    ports:
      - "8098:8098"
    environment:
      - DATABASE_URL=postgresql://admin:secure_password@postgres:5432/vocelio
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  # Telephony Adapter
  telephony:
    build: ./telephony-adapter
    ports:
      - "8001:8001"
    environment:
      - TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
      - TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
      - TWILIO_PHONE_NUMBER=${TWILIO_PHONE_NUMBER}

  # TTS Service
  tts:
    build: ./tts-service
    ports:
      - "8002:8002"
    environment:
      - AZURE_SPEECH_KEY=${AZURE_SPEECH_KEY}
      - AZURE_SPEECH_REGION=${AZURE_SPEECH_REGION}
      - ELEVENLABS_API_KEY=${ELEVENLABS_API_KEY}

  # Contact Management API
  contacts-api:
    build: ./contacts-api
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://admin:secure_password@postgres:5432/vocelio
    depends_on:
      - postgres

volumes:
  postgres_data:
```

---

## 🎯 **SUCCESS METRICS**

### **Week 1 Goals:**
- ✅ Make successful outbound call via Telephony Adapter
- ✅ Create department and transfer call via Call Transfer Service
- ✅ Register agent and update status
- ✅ View active calls in Live Call Monitor

### **Week 2 Goals:**
- ✅ Synthesize speech using both Azure and ElevenLabs
- ✅ Create and manage contact lists via API
- ✅ Real-time updates working in frontend
- ✅ End-to-end call → transfer → agent workflow

### **Week 3 Goals:**
- ✅ Full contact management system operational
- ✅ CRM sync working with at least one provider
- ✅ Production deployment successful
- ✅ All frontend features fully functional

---

## 🔧 **DEVELOPMENT TOOLS & TESTING**

### **API Testing:**
```bash
# Test Call Transfer Service
curl -X POST http://localhost:8098/departments \
  -H "Content-Type: application/json" \
  -d '{"name": "Sales", "phone_number": "+1555-SALES-01"}'

# Test Telephony Adapter
curl -X POST http://localhost:8001/api/calls/make \
  -H "Content-Type: application/json" \
  -d '{"to": "+1234567890", "message": "Hello from Vocelio!"}'

# Test TTS Service
curl -X POST http://localhost:8002/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world", "voice_id": "en-US-AriaNeural", "provider": "azure"}' \
  --output test_audio.mp3
```

### **Database Setup:**
```sql
-- Create database
CREATE DATABASE vocelio;

-- Run migrations
\i migrations/001_create_departments.sql
\i migrations/002_create_agents.sql
\i migrations/003_create_transfers.sql
\i migrations/004_create_call_logs.sql
```

---

This implementation guide provides everything you need to get your backend services operational. Start with Priority 1 services to get core functionality working, then expand with Priority 2 and 3 services.

**Your frontend is already production-ready - these backend services will make it fully functional!** 🚀
