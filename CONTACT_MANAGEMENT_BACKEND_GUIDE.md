# 🚀 Vocelio Contact Management Backend Implementation Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Authentication & Authorization](#authentication--authorization)
5. [CRM Integrations](#crm-integrations)
6. [DNC Management](#dnc-management)
7. [File Upload & Processing](#file-upload--processing)
8. [Real-time Features](#real-time-features)
9. [Security & Compliance](#security--compliance)
10. [Testing Strategy](#testing-strategy)
11. [Deployment Guide](#deployment-guide)

---

## 🎯 Overview

This guide provides complete backend implementation specifications for the Vocelio Contact Management system. The backend should support:

- **Multi-tenant architecture** with organization isolation
- **Real-time synchronization** with WebSocket connections
- **Enterprise-grade security** with RBAC and audit logging
- **Scalable file processing** for bulk imports
- **CRM integrations** with major platforms
- **Compliance management** for DNC regulations

### Technology Stack Recommendations

**Primary Stack:**
- **Runtime:** Node.js 20+ or Python 3.11+
- **Framework:** Express.js/Fastify or FastAPI/Django
- **Database:** PostgreSQL 15+ with Redis for caching
- **Queue System:** Bull (Node.js) or Celery (Python) with Redis
- **File Storage:** AWS S3 or Google Cloud Storage
- **Search Engine:** Elasticsearch or PostgreSQL Full-Text Search

**Alternative Stacks:**
- **Enterprise:** Java Spring Boot with PostgreSQL
- **Serverless:** AWS Lambda with DynamoDB
- **Microservices:** Docker containers with Kubernetes

---

## 🗄️ Database Schema

### Core Tables

#### 1. Organizations Table
```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}',
    subscription_tier VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
```

#### 2. Contact Lists Table
```sql
CREATE TABLE contact_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    tags TEXT[] DEFAULT '{}',
    created_by UUID NOT NULL,
    contact_count INTEGER DEFAULT 0,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_list_name_per_org UNIQUE(organization_id, name)
);

CREATE INDEX idx_contact_lists_org ON contact_lists(organization_id);
CREATE INDEX idx_contact_lists_status ON contact_lists(status);
CREATE INDEX idx_contact_lists_tags ON contact_lists USING GIN(tags);
```

#### 3. Contacts Table
```sql
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Personal Information
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(320),
    phone VARCHAR(20) NOT NULL,
    phone_formatted VARCHAR(30), -- E.164 format
    
    -- Additional Information
    company VARCHAR(255),
    title VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip VARCHAR(20),
    country VARCHAR(2) DEFAULT 'US',
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active',
    source VARCHAR(100),
    notes TEXT,
    
    -- Tracking
    created_by UUID NOT NULL,
    last_contact_date TIMESTAMP WITH TIME ZONE,
    contact_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_phone_per_org UNIQUE(organization_id, phone_formatted)
);

-- Indexes for performance
CREATE INDEX idx_contacts_org ON contacts(organization_id);
CREATE INDEX idx_contacts_phone ON contacts(phone_formatted);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_name ON contacts(first_name, last_name);
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_tags ON contacts USING GIN(tags);
CREATE INDEX idx_contacts_custom_fields ON contacts USING GIN(custom_fields);
CREATE INDEX idx_contacts_full_text ON contacts USING GIN(
    to_tsvector('english', 
        COALESCE(first_name, '') || ' ' || 
        COALESCE(last_name, '') || ' ' || 
        COALESCE(email, '') || ' ' || 
        COALESCE(company, '')
    )
);
```

#### 4. Contact List Memberships Table
```sql
CREATE TABLE contact_list_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    list_id UUID NOT NULL REFERENCES contact_lists(id) ON DELETE CASCADE,
    added_by UUID NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_contact_list_membership UNIQUE(contact_id, list_id)
);

CREATE INDEX idx_memberships_contact ON contact_list_memberships(contact_id);
CREATE INDEX idx_memberships_list ON contact_list_memberships(list_id);
```

#### 5. CRM Integrations Table
```sql
CREATE TABLE crm_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    crm_type VARCHAR(50) NOT NULL, -- 'salesforce', 'hubspot', 'pipedrive', 'zoho'
    name VARCHAR(255) NOT NULL,
    
    -- Configuration
    api_key_encrypted TEXT NOT NULL,
    endpoint_url VARCHAR(500),
    field_mappings JSONB DEFAULT '{}',
    sync_settings JSONB DEFAULT '{}',
    
    -- Status
    status VARCHAR(50) DEFAULT 'disconnected',
    auto_sync BOOLEAN DEFAULT false,
    sync_frequency INTEGER DEFAULT 30, -- minutes
    last_sync_at TIMESTAMP WITH TIME ZONE,
    
    -- Metrics
    total_contacts INTEGER DEFAULT 0,
    synced_contacts INTEGER DEFAULT 0,
    failed_contacts INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_crm_per_org UNIQUE(organization_id, crm_type)
);

CREATE INDEX idx_crm_integrations_org ON crm_integrations(organization_id);
CREATE INDEX idx_crm_integrations_status ON crm_integrations(status);
```

#### 6. CRM Sync Logs Table
```sql
CREATE TABLE crm_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES crm_integrations(id) ON DELETE CASCADE,
    sync_type VARCHAR(50) NOT NULL, -- 'auto_sync', 'manual_sync'
    
    -- Results
    status VARCHAR(50) NOT NULL, -- 'success', 'error', 'warning'
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER,
    
    -- Metrics
    contacts_processed INTEGER DEFAULT 0,
    contacts_added INTEGER DEFAULT 0,
    contacts_updated INTEGER DEFAULT 0,
    contacts_skipped INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    
    -- Details
    error_message TEXT,
    sync_details JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sync_logs_integration ON crm_sync_logs(integration_id);
CREATE INDEX idx_sync_logs_status ON crm_sync_logs(status);
CREATE INDEX idx_sync_logs_date ON crm_sync_logs(started_at DESC);
```

#### 7. DNC Lists Table
```sql
CREATE TABLE dnc_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'federal', 'state', 'company', 'industry'
    description TEXT,
    
    -- Configuration
    compliance_level VARCHAR(50) NOT NULL,
    auto_update BOOLEAN DEFAULT false,
    update_frequency INTEGER, -- hours
    source VARCHAR(255),
    
    -- Metrics
    contact_count BIGINT DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_dnc_lists_org ON dnc_lists(organization_id);
CREATE INDEX idx_dnc_lists_type ON dnc_lists(type);
```

#### 8. DNC Entries Table
```sql
CREATE TABLE dnc_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id UUID NOT NULL REFERENCES dnc_lists(id) ON DELETE CASCADE,
    phone_number VARCHAR(30) NOT NULL, -- E.164 format
    
    -- Details
    source VARCHAR(255),
    reason VARCHAR(255),
    notes TEXT,
    expiry_date TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active',
    
    -- Metadata
    added_by UUID,
    date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_phone_per_list UNIQUE(list_id, phone_number)
);

CREATE INDEX idx_dnc_entries_list ON dnc_entries(list_id);
CREATE INDEX idx_dnc_entries_phone ON dnc_entries(phone_number);
CREATE INDEX idx_dnc_entries_status ON dnc_entries(status);
```

#### 9. Import Jobs Table
```sql
CREATE TABLE import_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    target_list_id UUID REFERENCES contact_lists(id) ON DELETE SET NULL,
    
    -- Job Details
    filename VARCHAR(500),
    file_path VARCHAR(1000),
    file_size BIGINT,
    import_type VARCHAR(50) DEFAULT 'csv', -- 'csv', 'excel', 'api'
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    progress_percentage INTEGER DEFAULT 0,
    
    -- Results
    total_rows INTEGER DEFAULT 0,
    valid_contacts INTEGER DEFAULT 0,
    invalid_contacts INTEGER DEFAULT 0,
    duplicates INTEGER DEFAULT 0,
    imported_contacts INTEGER DEFAULT 0,
    
    -- Metadata
    settings JSONB DEFAULT '{}',
    validation_errors JSONB DEFAULT '[]',
    created_by UUID NOT NULL,
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_import_jobs_org ON import_jobs(organization_id);
CREATE INDEX idx_import_jobs_status ON import_jobs(status);
CREATE INDEX idx_import_jobs_created ON import_jobs(created_at DESC);
```

---

## 🔌 API Endpoints

### Base URL Structure
```
Production: https://api.vocelio.com/v1
Development: http://localhost:8000/v1
```

### Authentication Headers
```http
Authorization: Bearer <jwt_token>
X-Organization-ID: <organization_uuid>
Content-Type: application/json
```

---

## 📝 Contact Management Endpoints

### 1. Contact Lists

#### GET /contact-lists
```http
GET /contact-lists?page=1&limit=50&search=real%20estate&status=active

Response:
{
  "data": [
    {
      "id": "uuid",
      "name": "Real Estate Leads Q4 2025",
      "description": "Qualified leads from Q4 campaigns",
      "status": "active",
      "contactCount": 1247,
      "tags": ["real-estate", "q4-2025"],
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-10T12:00:00Z",
      "createdBy": {
        "id": "uuid",
        "name": "John Doe"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 156,
    "pages": 4
  }
}
```

#### POST /contact-lists
```http
POST /contact-lists

Body:
{
  "name": "New Lead List",
  "description": "Fresh leads from website forms",
  "tags": ["website", "new-leads"]
}

Response:
{
  "data": {
    "id": "uuid",
    "name": "New Lead List",
    "description": "Fresh leads from website forms",
    "status": "active",
    "contactCount": 0,
    "tags": ["website", "new-leads"],
    "createdAt": "2025-01-11T10:30:00Z"
  }
}
```

#### PUT /contact-lists/:id
```http
PUT /contact-lists/uuid

Body:
{
  "name": "Updated List Name",
  "description": "Updated description",
  "tags": ["updated", "tags"]
}
```

#### DELETE /contact-lists/:id
```http
DELETE /contact-lists/uuid

Response:
{
  "message": "Contact list deleted successfully"
}
```

### 2. Contacts

#### GET /contacts
```http
GET /contacts?page=1&limit=50&search=john&listId=uuid&status=active&tags=vip

Response:
{
  "data": [
    {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "phoneFormatted": "+1 (234) 567-8900",
      "company": "Acme Corporation",
      "title": "Sales Manager",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zip": "10001",
      "country": "US",
      "tags": ["vip", "qualified"],
      "customFields": {
        "leadScore": 85,
        "source": "website"
      },
      "status": "active",
      "source": "Manual Entry",
      "notes": "Interested in premium package",
      "lastContactDate": "2025-01-10T14:30:00Z",
      "contactCount": 3,
      "createdAt": "2025-01-01T09:00:00Z",
      "updatedAt": "2025-01-10T14:30:00Z",
      "lists": [
        {
          "id": "uuid",
          "name": "VIP Customers",
          "addedAt": "2025-01-05T10:00:00Z"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1247,
    "pages": 25
  },
  "filters": {
    "totalContacts": 15420,
    "activeContacts": 14832,
    "inactiveContacts": 588
  }
}
```

#### POST /contacts
```http
POST /contacts

Body:
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phone": "+0987654321",
  "company": "Tech Inc",
  "title": "Marketing Director",
  "address": "456 Oak Ave",
  "city": "Los Angeles",
  "state": "CA",
  "zip": "90210",
  "tags": ["new-lead", "marketing"],
  "customFields": {
    "leadScore": 75,
    "source": "conference"
  },
  "listIds": ["uuid1", "uuid2"],
  "notes": "Met at tech conference 2025"
}

Response:
{
  "data": {
    "id": "uuid",
    "firstName": "Jane",
    "lastName": "Smith",
    // ... full contact object
  }
}
```

#### PUT /contacts/:id
```http
PUT /contacts/uuid

Body:
{
  "firstName": "Jane Updated",
  "tags": ["updated", "vip"],
  "customFields": {
    "leadScore": 90,
    "source": "conference",
    "priority": "high"
  }
}
```

#### DELETE /contacts/:id
```http
DELETE /contacts/uuid
```

#### POST /contacts/bulk-operations
```http
POST /contacts/bulk-operations

Body:
{
  "action": "add-tags", // "add-tags", "remove-tags", "move-to-list", "delete"
  "contactIds": ["uuid1", "uuid2", "uuid3"],
  "data": {
    "tags": ["bulk-updated", "2025-campaign"]
  }
}

Response:
{
  "message": "Bulk operation completed",
  "processed": 3,
  "successful": 3,
  "failed": 0,
  "errors": []
}
```

---

## 📤 Upload & Import Endpoints

### 1. File Upload

#### POST /uploads/contacts
```http
POST /uploads/contacts
Content-Type: multipart/form-data

Form Data:
- file: contacts.csv
- listId: uuid (optional - for existing list)
- listName: "New Import List" (optional - to create new list)
- skipDuplicates: true
- validatePhones: true

Response:
{
  "data": {
    "jobId": "uuid",
    "filename": "contacts.csv",
    "fileSize": 1024000,
    "status": "pending",
    "estimatedProcessingTime": "2-3 minutes"
  }
}
```

#### GET /uploads/contacts/:jobId
```http
GET /uploads/contacts/uuid

Response:
{
  "data": {
    "id": "uuid",
    "filename": "contacts.csv",
    "status": "completed", // "pending", "processing", "completed", "failed"
    "progress": 100,
    "results": {
      "totalRows": 1250,
      "validContacts": 1180,
      "invalidContacts": 70,
      "duplicates": 45,
      "imported": 1135,
      "skipped": 115
    },
    "validationErrors": [
      {
        "row": 15,
        "error": "Invalid phone number format",
        "data": { "phone": "555-CALL" }
      }
    ],
    "createdAt": "2025-01-11T10:00:00Z",
    "completedAt": "2025-01-11T10:03:45Z"
  }
}
```

### 2. Manual Contact Entry

#### POST /contacts/manual
```http
POST /contacts/manual

Body:
{
  "firstName": "Manual",
  "lastName": "Entry",
  "phone": "+1555123456",
  "email": "manual@example.com",
  "company": "Manual Corp",
  "listId": "uuid"
}
```

### 3. CSV Template Download

#### GET /uploads/template
```http
GET /uploads/template?format=csv

Response: CSV file download with headers:
first_name,last_name,phone,email,company,title,address,city,state,zip
```

---

## 🔄 CRM Integration Endpoints

### 1. CRM Connections

#### GET /crm-integrations
```http
GET /crm-integrations

Response:
{
  "data": [
    {
      "id": "uuid",
      "crmType": "salesforce",
      "name": "Salesforce Production",
      "status": "connected",
      "autoSync": true,
      "syncFrequency": 15,
      "lastSyncAt": "2025-01-11T09:30:00Z",
      "totalContacts": 15847,
      "syncedContacts": 15203,
      "failedContacts": 644,
      "fieldMappings": {
        "firstName": "FirstName",
        "lastName": "LastName",
        "email": "Email",
        "phone": "Phone"
      },
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /crm-integrations
```http
POST /crm-integrations

Body:
{
  "crmType": "hubspot",
  "name": "HubSpot Marketing",
  "apiKey": "hub_api_key_here",
  "endpointUrl": "https://api.hubapi.com",
  "fieldMappings": {
    "firstName": "firstname",
    "lastName": "lastname",
    "email": "email",
    "phone": "phone"
  },
  "syncSettings": {
    "autoSync": true,
    "syncFrequency": 30,
    "syncDirection": "bidirectional"
  }
}
```

#### PUT /crm-integrations/:id
```http
PUT /crm-integrations/uuid

Body:
{
  "autoSync": false,
  "syncFrequency": 60,
  "fieldMappings": {
    "firstName": "first_name_updated"
  }
}
```

### 2. CRM Sync Operations

#### POST /crm-integrations/:id/sync
```http
POST /crm-integrations/uuid/sync

Body:
{
  "syncType": "manual_sync",
  "options": {
    "fullSync": false,
    "dateFrom": "2025-01-01T00:00:00Z"
  }
}

Response:
{
  "data": {
    "syncJobId": "uuid",
    "status": "started",
    "estimatedDuration": "3-5 minutes"
  }
}
```

#### GET /crm-integrations/:id/sync-logs
```http
GET /crm-integrations/uuid/sync-logs?page=1&limit=20

Response:
{
  "data": [
    {
      "id": "uuid",
      "syncType": "auto_sync",
      "status": "success",
      "startedAt": "2025-01-11T09:30:00Z",
      "completedAt": "2025-01-11T09:32:34Z",
      "duration": 154000,
      "contactsProcessed": 1247,
      "contactsAdded": 23,
      "contactsUpdated": 89,
      "contactsSkipped": 5,
      "errorCount": 0
    }
  ]
}
```

---

## 🛡️ DNC Management Endpoints

### 1. DNC Lists

#### GET /dnc-lists
```http
GET /dnc-lists

Response:
{
  "data": [
    {
      "id": "uuid",
      "name": "Federal Do Not Call Registry",
      "type": "federal",
      "description": "Official FTC Do Not Call Registry",
      "complianceLevel": "federal",
      "contactCount": 245000000,
      "lastUpdated": "2025-01-10T00:00:00Z",
      "autoUpdate": true,
      "source": "FTC Registry",
      "status": "active"
    }
  ]
}
```

#### POST /dnc-lists
```http
POST /dnc-lists

Body:
{
  "name": "Company Internal DNC",
  "type": "company",
  "description": "Internal opt-out requests",
  "complianceLevel": "internal",
  "autoUpdate": false
}
```

### 2. DNC Entries

#### GET /dnc-entries
```http
GET /dnc-entries?listId=uuid&search=+1234567890&page=1&limit=50

Response:
{
  "data": [
    {
      "id": "uuid",
      "phoneNumber": "+1234567890",
      "listId": "uuid",
      "listName": "Federal DNC",
      "source": "FTC Registry",
      "reason": "Consumer registration",
      "dateAdded": "2024-12-15T00:00:00Z",
      "expiryDate": null,
      "status": "active",
      "notes": "Registered via FTC website"
    }
  ]
}
```

#### POST /dnc-entries
```http
POST /dnc-entries

Body:
{
  "listId": "uuid",
  "phoneNumber": "+1234567890",
  "source": "Customer Request",
  "reason": "Opt-out request",
  "notes": "Customer called to remove from marketing calls"
}
```

### 3. Campaign Scrubbing

#### POST /dnc/scrub-campaign
```http
POST /dnc/scrub-campaign

Body:
{
  "campaignId": "uuid",
  "contactListIds": ["uuid1", "uuid2"],
  "dncListIds": ["uuid1", "uuid2", "uuid3"],
  "options": {
    "createCleanList": true,
    "cleanListName": "Scrubbed Campaign List"
  }
}

Response:
{
  "data": {
    "scrubJobId": "uuid",
    "status": "processing",
    "totalContacts": 15420,
    "estimatedCompletion": "2025-01-11T10:35:00Z"
  }
}
```

#### GET /dnc/scrub-results/:jobId
```http
GET /dnc/scrub-results/uuid

Response:
{
  "data": {
    "id": "uuid",
    "campaignId": "uuid",
    "status": "completed",
    "totalContacts": 15420,
    "matchedDNC": 342,
    "cleanContacts": 15078,
    "complianceRate": 97.8,
    "listsChecked": ["federal_dnc", "state_dnc_ca", "company_dnc"],
    "completedAt": "2025-01-11T10:32:15Z",
    "cleanListId": "uuid"
  }
}
```

---

## 🔒 Authentication & Authorization

### JWT Token Structure
```javascript
{
  "sub": "user_uuid",
  "org": "organization_uuid", 
  "role": "admin|manager|agent",
  "permissions": [
    "contacts:read",
    "contacts:write", 
    "contacts:delete",
    "lists:manage",
    "dnc:manage",
    "crm:manage"
  ],
  "iat": 1641917400,
  "exp": 1641921000
}
```

### Permission Matrix

| Action | Admin | Manager | Agent |
|--------|-------|---------|-------|
| View Contacts | ✅ | ✅ | ✅ |
| Create/Edit Contacts | ✅ | ✅ | ✅ |
| Delete Contacts | ✅ | ✅ | ❌ |
| Manage Lists | ✅ | ✅ | ❌ |
| Bulk Operations | ✅ | ✅ | ❌ |
| CRM Integrations | ✅ | ❌ | ❌ |
| DNC Management | ✅ | ✅ | ❌ |
| Import/Export | ✅ | ✅ | ❌ |

---

## 📊 Real-time Features

### WebSocket Events

#### Client → Server
```javascript
// Subscribe to contact updates
ws.send({
  type: 'subscribe',
  channel: 'contacts',
  filters: { listId: 'uuid' }
});

// Subscribe to import progress
ws.send({
  type: 'subscribe', 
  channel: 'import_progress',
  jobId: 'uuid'
});
```

#### Server → Client
```javascript
// Contact updated
{
  type: 'contact_updated',
  data: {
    contactId: 'uuid',
    changes: { status: 'active' },
    updatedBy: 'user_uuid'
  }
}

// Import progress
{
  type: 'import_progress',
  data: {
    jobId: 'uuid',
    progress: 75,
    processed: 750,
    total: 1000,
    errors: []
  }
}

// CRM sync status
{
  type: 'crm_sync_update',
  data: {
    integrationId: 'uuid',
    status: 'syncing',
    progress: 45,
    contactsProcessed: 450
  }
}
```

---

## 🏗️ Implementation Architecture

### Microservices Structure

```
┌─ Gateway Service (Port 8000)
├─ Auth Service (Port 8001)
├─ Contact Service (Port 8002)
├─ CRM Integration Service (Port 8003)
├─ File Processing Service (Port 8004)
├─ DNC Service (Port 8005)
├─ Notification Service (Port 8006)
└─ Analytics Service (Port 8007)
```

### Queue Processing

#### Contact Import Queue
```javascript
// Job structure
{
  type: 'process_contact_import',
  data: {
    jobId: 'uuid',
    filePath: '/uploads/contacts_uuid.csv',
    organizationId: 'uuid',
    listId: 'uuid',
    options: {
      skipDuplicates: true,
      validatePhones: true
    }
  }
}
```

#### CRM Sync Queue
```javascript
{
  type: 'crm_sync',
  data: {
    integrationId: 'uuid',
    syncType: 'auto_sync',
    options: {
      fullSync: false,
      batchSize: 100
    }
  }
}
```

---

## 🔐 Security Implementation

### Data Encryption
- **At Rest:** AES-256 for sensitive fields (API keys, personal data)
- **In Transit:** TLS 1.3 for all API communication
- **API Keys:** Encrypted with organization-specific keys

### Rate Limiting
```javascript
// API Rate limits per organization
{
  "free": {
    "contacts": "1000/hour",
    "imports": "5/day", 
    "api_calls": "10000/day"
  },
  "pro": {
    "contacts": "10000/hour",
    "imports": "50/day",
    "api_calls": "100000/day" 
  },
  "enterprise": {
    "contacts": "unlimited",
    "imports": "unlimited",
    "api_calls": "1000000/day"
  }
}
```

### Audit Logging
```javascript
// Audit log entry structure
{
  "id": "uuid",
  "organizationId": "uuid",
  "userId": "uuid", 
  "action": "contact_deleted",
  "resource": "contact",
  "resourceId": "uuid",
  "details": {
    "contactName": "John Doe",
    "contactPhone": "+1234567890"
  },
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "timestamp": "2025-01-11T10:30:00Z"
}
```

---

## 🧪 Testing Strategy

### Unit Tests
```javascript
// Contact service tests
describe('ContactService', () => {
  test('should create contact with valid data', async () => {
    const contactData = {
      firstName: 'John',
      lastName: 'Doe', 
      phone: '+1234567890',
      organizationId: 'uuid'
    };
    
    const contact = await contactService.create(contactData);
    expect(contact.id).toBeDefined();
    expect(contact.phoneFormatted).toBe('+1 (234) 567-8900');
  });
  
  test('should reject duplicate phone numbers', async () => {
    // Test implementation
  });
});
```

### Integration Tests
```javascript
describe('Contact API Integration', () => {
  test('POST /contacts should create contact and add to list', async () => {
    const response = await request(app)
      .post('/v1/contacts')
      .set('Authorization', `Bearer ${token}`)
      .send(contactData)
      .expect(201);
      
    expect(response.body.data.id).toBeDefined();
  });
});
```

### Load Tests
- **Contact Creation:** 1000 contacts/minute
- **Bulk Import:** 50,000 contacts in 5 minutes
- **CRM Sync:** 10,000 contacts in 2 minutes
- **API Throughput:** 1000 requests/second

---

## 🚀 Deployment Guide

### Docker Configuration

#### Dockerfile
```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
EXPOSE 8000

USER node
CMD ["node", "server.js"]
```

#### docker-compose.yml
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/vocelio
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=your_secret_here
    depends_on:
      - db
      - redis
      
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: vocelio
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
      
  redis:
    image: redis:7-alpine
    
  worker:
    build: .
    command: node worker.js
    depends_on:
      - db
      - redis

volumes:
  postgres_data:
```

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/vocelio
REDIS_URL=redis://localhost:6379

# Authentication  
JWT_SECRET=your-256-bit-secret
JWT_EXPIRES_IN=24h

# File Storage
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BUCKET_NAME=vocelio-uploads
AWS_REGION=us-east-1

# CRM API Keys (encrypted)
SALESFORCE_CLIENT_ID=your_client_id
SALESFORCE_CLIENT_SECRET=your_client_secret
HUBSPOT_API_KEY=your_api_key

# Rate Limiting
RATE_LIMIT_WINDOW=3600 # 1 hour in seconds
RATE_LIMIT_MAX=1000   # requests per window

# Monitoring
NEW_RELIC_LICENSE_KEY=your_key
SENTRY_DSN=your_sentry_dsn

# Email
SENDGRID_API_KEY=your_sendgrid_key
FROM_EMAIL=noreply@vocelio.com
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vocelio-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: vocelio-api
  template:
    metadata:
      labels:
        app: vocelio-api
    spec:
      containers:
      - name: api
        image: vocelio/api:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: vocelio-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

---

## 📈 Monitoring & Analytics

### Key Metrics to Track

#### Performance Metrics
```javascript
// API Response Times
{
  "contacts_create_avg": "120ms",
  "contacts_list_avg": "80ms", 
  "import_processing_avg": "2.3min",
  "crm_sync_avg": "4.1min"
}

// Throughput
{
  "contacts_created_per_minute": 150,
  "api_requests_per_second": 45,
  "concurrent_imports": 8
}
```

#### Business Metrics
```javascript
{
  "total_contacts": 1547892,
  "active_organizations": 1247,
  "contacts_imported_today": 15420,
  "crm_syncs_completed": 89,
  "dnc_compliance_rate": 98.7
}
```

### Health Check Endpoints

#### GET /health
```http
GET /health

Response:
{
  "status": "healthy",
  "timestamp": "2025-01-11T10:30:00Z",
  "services": {
    "database": "healthy",
    "redis": "healthy", 
    "s3": "healthy",
    "queue": "healthy"
  },
  "metrics": {
    "uptime": 86400,
    "memory_usage": "45%",
    "cpu_usage": "23%"
  }
}
```

---

## 📋 API Error Codes

### Standard HTTP Status Codes
- **200 OK:** Successful operation
- **201 Created:** Resource created successfully
- **400 Bad Request:** Invalid request data
- **401 Unauthorized:** Authentication required
- **403 Forbidden:** Insufficient permissions
- **404 Not Found:** Resource not found
- **409 Conflict:** Resource conflict (duplicate)
- **422 Unprocessable Entity:** Validation errors
- **429 Too Many Requests:** Rate limit exceeded
- **500 Internal Server Error:** Server error

### Custom Error Response Format
```javascript
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Phone number is required",
    "details": {
      "field": "phone",
      "value": "",
      "constraint": "required"
    },
    "timestamp": "2025-01-11T10:30:00Z",
    "requestId": "req_uuid"
  }
}
```

---

## 🔄 Migration Scripts

### Database Migrations

#### 001_initial_schema.sql
```sql
-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create base tables
-- (Include all table creation scripts above)

-- Create indexes
-- (Include all index creation scripts above)

-- Insert default data
INSERT INTO dnc_lists (id, organization_id, name, type, compliance_level, status)
VALUES 
  (gen_random_uuid(), NULL, 'Federal DNC Registry', 'federal', 'federal', 'active'),
  (gen_random_uuid(), NULL, 'California State DNC', 'state', 'state', 'active');
```

### Data Migration Tools

#### Contact Deduplication
```javascript
// Remove duplicate contacts based on phone number
async function deduplicateContacts(organizationId) {
  const duplicates = await db.query(`
    SELECT phone_formatted, array_agg(id) as contact_ids
    FROM contacts 
    WHERE organization_id = $1
    GROUP BY phone_formatted 
    HAVING count(*) > 1
  `, [organizationId]);
  
  // Keep the newest contact, merge data from others
  for (const duplicate of duplicates) {
    await mergeDuplicateContacts(duplicate.contact_ids);
  }
}
```

---

## 📚 Additional Resources

### API Documentation Tools
- **Swagger/OpenAPI:** Auto-generated API docs
- **Postman Collection:** Pre-configured API requests
- **SDK Generation:** Client libraries for popular languages

### Monitoring Tools
- **Application Performance:** New Relic, DataDog
- **Error Tracking:** Sentry, Bugsnag
- **Logging:** ELK Stack, Splunk
- **Uptime Monitoring:** Pingdom, StatusPage

### Development Tools
- **Database Admin:** pgAdmin, DataGrip
- **Queue Monitoring:** Bull Dashboard, Celery Flower  
- **API Testing:** Postman, Insomnia
- **Load Testing:** Artillery, k6

---

## 🎯 Implementation Priorities

### Phase 1 (MVP - 2-3 weeks)
1. ✅ Core contact CRUD operations
2. ✅ Contact list management
3. ✅ Basic file import (CSV)
4. ✅ Authentication & authorization
5. ✅ Basic search and filtering

### Phase 2 (Enhanced Features - 2-3 weeks)  
1. ✅ CRM integrations (Salesforce, HubSpot)
2. ✅ Advanced import (Excel, validation)
3. ✅ DNC list management
4. ✅ Real-time updates (WebSocket)
5. ✅ Bulk operations

### Phase 3 (Enterprise Features - 3-4 weeks)
1. ✅ Advanced analytics and reporting
2. ✅ Audit logging and compliance
3. ✅ Advanced search (Elasticsearch)
4. ✅ Performance optimizations
5. ✅ Multi-tenant enhancements

### Phase 4 (Scale & Polish - 2-3 weeks)
1. ✅ Load testing and optimization  
2. ✅ Comprehensive monitoring
3. ✅ Documentation and SDKs
4. ✅ Production deployment
5. ✅ Security audit and penetration testing

---

This comprehensive backend implementation guide provides everything needed to build a production-ready contact management system that seamlessly integrates with the frontend components we created. The architecture is designed for scalability, security, and maintainability while supporting enterprise-grade features and compliance requirements.
