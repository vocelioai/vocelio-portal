# 🚀 Backend Implementation Guide - Call Management System

## 📋 **Complete Backend Implementation for Call Transfer & Department Management**

This guide provides step-by-step implementation for extending your existing backend to support the call management system frontend that's already built and ready.

---

## 🎯 **Overview: What You're Building**

Your frontend expects a **Call Transfer Service** at:
```
https://call-transfer-service-313373223340.us-central1.run.app
```

**Required API Endpoints:**
- Department Management (CRUD)
- Call Management & Transfer
- Real-time Events (EventSource)
- Call Logs & Analytics

---

## 📊 **Database Schema**

### **1. Departments Table**
```sql
CREATE TABLE departments (
    id VARCHAR(50) PRIMARY KEY DEFAULT (CONCAT('dept_', UUID_SHORT())),
    tenant_id VARCHAR(50) NOT NULL, -- For multi-tenant support
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    description TEXT,
    color VARCHAR(20) DEFAULT 'default',
    is_active BOOLEAN DEFAULT TRUE,
    business_hours JSON, -- Store schedule as JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_tenant_active (tenant_id, is_active),
    INDEX idx_name (name),
    UNIQUE KEY unique_tenant_name (tenant_id, name)
);
```

### **2. Agents Table**
```sql
CREATE TABLE agents (
    id VARCHAR(50) PRIMARY KEY DEFAULT (CONCAT('agent_', UUID_SHORT())),
    tenant_id VARCHAR(50) NOT NULL,
    department_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    status ENUM('available', 'busy', 'offline') DEFAULT 'offline',
    priority INT DEFAULT 1, -- 1=highest, 10=lowest
    max_concurrent_calls INT DEFAULT 1,
    current_calls INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    INDEX idx_dept_status (department_id, status),
    INDEX idx_tenant_status (tenant_id, status)
);
```

### **3. Calls Table**
```sql
CREATE TABLE calls (
    id VARCHAR(50) PRIMARY KEY DEFAULT (CONCAT('call_', UUID_SHORT())),
    tenant_id VARCHAR(50) NOT NULL,
    call_sid VARCHAR(100) UNIQUE NOT NULL, -- Twilio Call SID
    caller_number VARCHAR(20) NOT NULL,
    called_number VARCHAR(20) NOT NULL,
    status ENUM('initiated', 'ringing', 'in_progress', 'completed', 'failed', 'transferred') DEFAULT 'initiated',
    direction ENUM('inbound', 'outbound') NOT NULL,
    flow_id VARCHAR(50), -- Link to FlowDesigner flow
    ai_minutes DECIMAL(10,2) DEFAULT 0.00,
    transfer_minutes DECIMAL(10,2) DEFAULT 0.00,
    total_duration INT DEFAULT 0, -- seconds
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL,
    context JSON, -- Store conversation context
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_tenant_status (tenant_id, status),
    INDEX idx_call_sid (call_sid),
    INDEX idx_caller (caller_number),
    INDEX idx_start_time (start_time DESC)
);
```

### **4. Call Transfers Table**
```sql
CREATE TABLE call_transfers (
    id VARCHAR(50) PRIMARY KEY DEFAULT (CONCAT('transfer_', UUID_SHORT())),
    tenant_id VARCHAR(50) NOT NULL,
    call_id VARCHAR(50) NOT NULL,
    from_department_id VARCHAR(50),
    to_department_id VARCHAR(50) NOT NULL,
    agent_id VARCHAR(50),
    transfer_reason VARCHAR(255),
    transfer_type ENUM('warm', 'cold', 'blind') DEFAULT 'warm',
    status ENUM('initiated', 'connecting', 'connected', 'failed', 'completed') DEFAULT 'initiated',
    transfer_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    connection_time TIMESTAMP NULL,
    completion_time TIMESTAMP NULL,
    context JSON, -- Transfer context from AI conversation
    
    FOREIGN KEY (call_id) REFERENCES calls(id) ON DELETE CASCADE,
    FOREIGN KEY (to_department_id) REFERENCES departments(id),
    FOREIGN KEY (agent_id) REFERENCES agents(id),
    INDEX idx_call_id (call_id),
    INDEX idx_dept_time (to_department_id, transfer_time DESC),
    INDEX idx_tenant_time (tenant_id, transfer_time DESC)
);
```

### **5. Call Events Table (for real-time updates)**
```sql
CREATE TABLE call_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    call_id VARCHAR(50) NOT NULL,
    event_type ENUM('call_started', 'ai_response', 'transfer_initiated', 'transfer_completed', 'call_ended') NOT NULL,
    event_data JSON,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (call_id) REFERENCES calls(id) ON DELETE CASCADE,
    INDEX idx_call_timestamp (call_id, timestamp DESC),
    INDEX idx_tenant_timestamp (tenant_id, timestamp DESC)
);
```

---

## 🔧 **API Implementation (Node.js/Express Example)**

### **Setup & Dependencies**
```javascript
// package.json dependencies
{
  "express": "^4.18.2",
  "mysql2": "^3.6.0",
  "jsonwebtoken": "^9.0.2",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "uuid": "^9.0.0",
  "express-rate-limit": "^6.10.0"
}
```

### **Server Setup**
```javascript
// server.js
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'https://your-frontend-domain.com'],
  credentials: true
}));
app.use(express.json());

// Database connection
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes
app.use('/api/departments', authenticateToken, require('./routes/departments'));
app.use('/api/calls', authenticateToken, require('./routes/calls'));

app.listen(PORT, () => {
  console.log(`Call Transfer Service running on port ${PORT}`);
});

module.exports = app;
```

---

## 📁 **Department Management API**

### **routes/departments.js**
```javascript
const express = require('express');
const router = express.Router();
const { pool } = require('../database');
const { v4: uuidv4 } = require('uuid');

// GET /api/departments - List all departments
router.get('/', async (req, res) => {
  try {
    const tenantId = req.user.tenant_id || 'default';
    
    const [departments] = await pool.execute(
      'SELECT * FROM departments WHERE tenant_id = ? AND is_active = TRUE ORDER BY name',
      [tenantId]
    );

    res.json({
      success: true,
      departments: departments
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch departments' 
    });
  }
});

// POST /api/departments - Create new department
router.post('/', async (req, res) => {
  try {
    const { name, phone_number, description, color } = req.body;
    const tenantId = req.user.tenant_id || 'default';

    if (!name || !phone_number) {
      return res.status(400).json({
        success: false,
        error: 'Name and phone number are required'
      });
    }

    const departmentId = `dept_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const [result] = await pool.execute(
      `INSERT INTO departments (id, tenant_id, name, phone_number, description, color) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [departmentId, tenantId, name, phone_number, description, color || 'default']
    );

    // Fetch the created department
    const [departments] = await pool.execute(
      'SELECT * FROM departments WHERE id = ?',
      [departmentId]
    );

    res.status(201).json({
      success: true,
      department: departments[0]
    });
  } catch (error) {
    console.error('Error creating department:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        error: 'Department with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create department'
    });
  }
});

// PUT /api/departments/:id - Update department
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone_number, description, color } = req.body;
    const tenantId = req.user.tenant_id || 'default';

    const [result] = await pool.execute(
      `UPDATE departments 
       SET name = ?, phone_number = ?, description = ?, color = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND tenant_id = ?`,
      [name, phone_number, description, color, id, tenantId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Department not found'
      });
    }

    // Fetch updated department
    const [departments] = await pool.execute(
      'SELECT * FROM departments WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      department: departments[0]
    });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update department'
    });
  }
});

// DELETE /api/departments/:id - Delete department
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenant_id || 'default';

    // Check if department has active agents
    const [agents] = await pool.execute(
      'SELECT COUNT(*) as count FROM agents WHERE department_id = ? AND status != "offline"',
      [id]
    );

    if (agents[0].count > 0) {
      return res.status(409).json({
        success: false,
        error: 'Cannot delete department with active agents'
      });
    }

    const [result] = await pool.execute(
      'UPDATE departments SET is_active = FALSE WHERE id = ? AND tenant_id = ?',
      [id, tenantId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Department not found'
      });
    }

    res.json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete department'
    });
  }
});

module.exports = router;
```

---

## 📞 **Call Management API**

### **routes/calls.js**
```javascript
const express = require('express');
const router = express.Router();
const { pool } = require('../database');
const EventEmitter = require('events');

// EventEmitter for real-time updates
const callEvents = new EventEmitter();

// GET /api/calls/active - Get active calls
router.get('/active', async (req, res) => {
  try {
    const tenantId = req.user.tenant_id || 'default';
    
    const [calls] = await pool.execute(`
      SELECT 
        c.*,
        d.name as department_name,
        a.name as agent_name,
        TIMESTAMPDIFF(SECOND, c.start_time, NOW()) as duration_seconds
      FROM calls c
      LEFT JOIN call_transfers ct ON c.id = ct.call_id AND ct.status = 'connected'
      LEFT JOIN departments d ON ct.to_department_id = d.id
      LEFT JOIN agents a ON ct.agent_id = a.id
      WHERE c.tenant_id = ? AND c.status IN ('in_progress', 'ringing')
      ORDER BY c.start_time DESC
    `, [tenantId]);

    res.json({
      success: true,
      active_calls: calls
    });
  } catch (error) {
    console.error('Error fetching active calls:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch active calls'
    });
  }
});

// POST /api/calls/transfer - Transfer call to department
router.post('/transfer', async (req, res) => {
  try {
    const { call_id, department_id, transfer_reason, transfer_type = 'warm' } = req.body;
    const tenantId = req.user.tenant_id || 'default';

    if (!call_id || !department_id) {
      return res.status(400).json({
        success: false,
        error: 'call_id and department_id are required'
      });
    }

    // Verify call exists and belongs to tenant
    const [calls] = await pool.execute(
      'SELECT * FROM calls WHERE id = ? AND tenant_id = ?',
      [call_id, tenantId]
    );

    if (calls.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Call not found'
      });
    }

    // Find available agent in department
    const [availableAgents] = await pool.execute(`
      SELECT * FROM agents 
      WHERE department_id = ? AND status = 'available' 
        AND current_calls < max_concurrent_calls
      ORDER BY priority ASC, current_calls ASC
      LIMIT 1
    `, [department_id]);

    const agentId = availableAgents.length > 0 ? availableAgents[0].id : null;

    // Create transfer record
    const transferId = `transfer_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    await pool.execute(`
      INSERT INTO call_transfers 
      (id, tenant_id, call_id, to_department_id, agent_id, transfer_reason, transfer_type, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [transferId, tenantId, call_id, department_id, agentId, transfer_reason, transfer_type, 'initiated']);

    // Update call status
    await pool.execute(
      'UPDATE calls SET status = "transferred", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [call_id]
    );

    // Create call event
    await pool.execute(`
      INSERT INTO call_events (tenant_id, call_id, event_type, event_data)
      VALUES (?, ?, ?, ?)
    `, [tenantId, call_id, 'transfer_initiated', JSON.stringify({
      transfer_id: transferId,
      department_id,
      agent_id: agentId,
      timestamp: new Date().toISOString()
    })]);

    // Emit real-time event
    callEvents.emit('call_transfer', {
      call_id,
      transfer_id: transferId,
      department_id,
      agent_id: agentId,
      status: 'initiated'
    });

    res.json({
      success: true,
      transfer: {
        id: transferId,
        call_id,
        department_id,
        agent_id: agentId,
        status: 'initiated'
      }
    });
  } catch (error) {
    console.error('Error transferring call:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to transfer call'
    });
  }
});

// GET /api/calls/logs - Get call logs with filtering
router.get('/logs', async (req, res) => {
  try {
    const tenantId = req.user.tenant_id || 'default';
    const {
      page = 1,
      limit = 25,
      date_range = '7days',
      status,
      has_transfer,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Build WHERE clause
    let whereConditions = ['c.tenant_id = ?'];
    let queryParams = [tenantId];

    // Date range filter
    if (date_range) {
      const daysMap = {
        '1day': 1,
        '7days': 7,
        '30days': 30,
        '90days': 90
      };
      const days = daysMap[date_range] || 7;
      whereConditions.push('c.start_time >= DATE_SUB(NOW(), INTERVAL ? DAY)');
      queryParams.push(days);
    }

    // Status filter
    if (status && status !== 'all') {
      whereConditions.push('c.status = ?');
      queryParams.push(status);
    }

    // Transfer filter
    if (has_transfer === 'true') {
      whereConditions.push('EXISTS (SELECT 1 FROM call_transfers WHERE call_id = c.id)');
    } else if (has_transfer === 'false') {
      whereConditions.push('NOT EXISTS (SELECT 1 FROM call_transfers WHERE call_id = c.id)');
    }

    // Search filter
    if (search) {
      whereConditions.push('(c.caller_number LIKE ? OR c.id LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    // Get total count
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM calls c
      WHERE ${whereConditions.join(' AND ')}
    `, queryParams);

    // Get calls with transfer information
    const [calls] = await pool.execute(`
      SELECT 
        c.*,
        COALESCE(
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', ct.id,
              'department_id', ct.to_department_id,
              'department_name', d.name,
              'agent_id', ct.agent_id,
              'agent_name', a.name,
              'transfer_time', ct.transfer_time,
              'status', ct.status
            )
          ), 
          JSON_ARRAY()
        ) as transfers
      FROM calls c
      LEFT JOIN call_transfers ct ON c.id = ct.call_id
      LEFT JOIN departments d ON ct.to_department_id = d.id
      LEFT JOIN agents a ON ct.agent_id = a.id
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY c.id
      ORDER BY c.start_time DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), offset]);

    res.json({
      success: true,
      call_logs: calls.map(call => ({
        ...call,
        transfers: call.transfers || []
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        total_pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching call logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch call logs'
    });
  }
});

module.exports = router;
```

---

## 🔄 **Real-time Events (EventSource)**

### **Real-time Event Endpoints**
```javascript
// Add to routes/calls.js

// GET /api/calls/:id/events - EventSource for individual call updates
router.get('/:id/events', (req, res) => {
  const { id } = req.params;
  const tenantId = req.user.tenant_id || 'default';

  // Set up EventSource headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', call_id: id })}\n\n`);

  // Listen for call-specific events
  const handleCallEvent = (eventData) => {
    if (eventData.call_id === id) {
      res.write(`data: ${JSON.stringify(eventData)}\n\n`);
    }
  };

  callEvents.on('call_update', handleCallEvent);
  callEvents.on('call_transfer', handleCallEvent);

  // Clean up on disconnect
  req.on('close', () => {
    callEvents.removeListener('call_update', handleCallEvent);
    callEvents.removeListener('call_transfer', handleCallEvent);
  });
});

// GET /api/calls/events - EventSource for all active calls
router.get('/events', (req, res) => {
  const tenantId = req.user.tenant_id || 'default';

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

  const handleGlobalEvent = (eventData) => {
    // Filter events by tenant
    if (eventData.tenant_id === tenantId) {
      res.write(`data: ${JSON.stringify(eventData)}\n\n`);
    }
  };

  callEvents.on('call_update', handleGlobalEvent);
  callEvents.on('call_transfer', handleGlobalEvent);
  callEvents.on('call_ended', handleGlobalEvent);

  req.on('close', () => {
    callEvents.removeListener('call_update', handleGlobalEvent);
    callEvents.removeListener('call_transfer', handleGlobalEvent);
    callEvents.removeListener('call_ended', handleGlobalEvent);
  });
});
```

---

## 🔗 **Integration with Existing Telephony System**

### **Webhook Handler for Twilio**
```javascript
// routes/webhooks.js
const express = require('express');
const router = express.Router();

// POST /webhooks/twilio/call-status - Handle Twilio call status updates
router.post('/twilio/call-status', async (req, res) => {
  try {
    const {
      CallSid,
      From,
      To,
      CallStatus,
      Direction,
      Duration
    } = req.body;

    console.log('Twilio webhook:', req.body);

    // Update call status in database
    const [calls] = await pool.execute(
      'SELECT * FROM calls WHERE call_sid = ?',
      [CallSid]
    );

    if (calls.length > 0) {
      // Update existing call
      await pool.execute(`
        UPDATE calls 
        SET status = ?, total_duration = ?, end_time = IF(? IN ('completed', 'failed'), NOW(), end_time)
        WHERE call_sid = ?
      `, [CallStatus, Duration || 0, CallStatus, CallSid]);

      // Emit real-time event
      callEvents.emit('call_update', {
        call_id: calls[0].id,
        call_sid: CallSid,
        status: CallStatus,
        duration: Duration
      });
    } else if (CallStatus === 'ringing' || CallStatus === 'in-progress') {
      // Create new call record
      const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      
      await pool.execute(`
        INSERT INTO calls (id, tenant_id, call_sid, caller_number, called_number, status, direction)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [callId, 'default', CallSid, From, To, CallStatus, Direction]);

      callEvents.emit('call_update', {
        call_id: callId,
        call_sid: CallSid,
        status: CallStatus,
        caller_number: From
      });
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Error');
  }
});

module.exports = router;
```

---

## 🚀 **Deployment Configuration**

### **Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 8080

USER node

CMD ["node", "server.js"]
```

### **docker-compose.yml** (for local development)
```yaml
version: '3.8'

services:
  call-transfer-api:
    build: .
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=development
      - DB_HOST=db
      - DB_USER=root
      - DB_PASSWORD=password
      - DB_NAME=call_transfer
      - JWT_SECRET=your-jwt-secret
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=call_transfer
    ports:
      - "3306:3306"
    volumes:
      - db_data:/var/lib/mysql

volumes:
  db_data:
```

### **Google Cloud Run Deployment**
```bash
# Build and deploy to Cloud Run
gcloud builds submit --tag gcr.io/PROJECT_ID/call-transfer-service
gcloud run deploy call-transfer-service \
  --image gcr.io/PROJECT_ID/call-transfer-service \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production,DB_HOST=YOUR_DB_HOST"
```

---

## ✅ **Testing Your Implementation**

### **1. Test Department CRUD**
```bash
# Create department
curl -X POST https://call-transfer-service-313373223340.us-central1.run.app/api/departments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name": "Sales", "phone_number": "+1-555-SALES-01"}'

# List departments
curl -X GET https://call-transfer-service-313373223340.us-central1.run.app/api/departments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **2. Test Real-time Events**
```bash
# Test EventSource connection
curl -N -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://call-transfer-service-313373223340.us-central1.run.app/api/calls/events
```

### **3. Frontend Integration Test**
1. Navigate to your dashboard at `http://localhost:3001`
2. Go to "Call Management" → "Departments"
3. Try creating a new department
4. Check browser console for detailed logs

---

## 📈 **Performance & Scaling Considerations**

### **Database Optimization**
```sql
-- Add indexes for performance
CREATE INDEX idx_calls_tenant_status_time ON calls(tenant_id, status, start_time DESC);
CREATE INDEX idx_transfers_dept_time ON call_transfers(to_department_id, transfer_time DESC);
CREATE INDEX idx_events_call_time ON call_events(call_id, timestamp DESC);

-- Partition large tables by date
ALTER TABLE call_events 
PARTITION BY RANGE (UNIX_TIMESTAMP(timestamp)) (
  PARTITION p2025_09 VALUES LESS THAN (UNIX_TIMESTAMP('2025-10-01')),
  PARTITION p2025_10 VALUES LESS THAN (UNIX_TIMESTAMP('2025-11-01'))
);
```

### **Caching Strategy**
```javascript
const Redis = require('redis');
const client = Redis.createClient(process.env.REDIS_URL);

// Cache department list
const getCachedDepartments = async (tenantId) => {
  const key = `departments:${tenantId}`;
  const cached = await client.get(key);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Fetch from DB and cache for 5 minutes
  const departments = await fetchDepartmentsFromDB(tenantId);
  await client.setex(key, 300, JSON.stringify(departments));
  
  return departments;
};
```

---

## 🎯 **Next Steps & Advanced Features**

### **Phase 2: Agent Management** (1-2 weeks)
- Agent status tracking
- Skill-based routing
- Queue management with hold music

### **Phase 3: Advanced Analytics** (2-3 weeks)
- Call journey mapping
- Performance metrics
- Cost optimization insights

### **Phase 4: AI Integration** (3-4 weeks)
- Sentiment analysis
- Automatic transfer decisions
- Performance predictions

---

## 🔧 **Quick Start Commands**

```bash
# 1. Clone and setup
git clone your-repo
cd call-transfer-backend
npm install

# 2. Setup database
mysql -u root -p < setup.sql

# 3. Configure environment
cp .env.example .env
# Edit .env with your database credentials

# 4. Start development server
npm run dev

# 5. Test with frontend
# Your frontend at http://localhost:3001 should now work!
```

---

## 🎉 **Success Criteria**

Once implemented, your system will support:

✅ **Complete department management** - Create, edit, delete departments  
✅ **Real-time call monitoring** - Live dashboard with active calls  
✅ **Call transfer workflows** - Seamless AI-to-human handoffs  
✅ **Call history & analytics** - Complete audit trail with costs  
✅ **Multi-tenant support** - Scale to thousands of clients  
✅ **Real-time updates** - EventSource integration working  

**Your frontend is already complete and waiting for this backend!** 🚀

---

## 📞 **Support & Questions**

If you encounter issues during implementation:

1. **Check the enhanced error logging** in your browser console
2. **Verify database schema** matches the requirements
3. **Test API endpoints** individually before full integration
4. **Monitor server logs** for detailed error information

The frontend provides comprehensive error reporting to help you debug backend issues quickly! 🕵️‍♂️
