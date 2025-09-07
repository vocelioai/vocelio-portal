# 🔄 Call Transfer Frontend Integration Guide
**Complete setup guide for integrating Call Transfer Service with your frontend**

---

## 📋 **OVERVIEW**

This guide will help you integrate the Call Transfer Service into your frontend with two approaches:
- ✅ **Telephony Integration** - Built into your calling interface
- ✅ **Standalone Admin Panel** - Separate agent management dashboard
- ✅ **Real-time Updates** - WebSocket integration for live status
- ✅ **Agent Management** - Complete agent registration and status system
- ✅ **Transfer Analytics** - Transfer history and performance tracking

---

## 🔧 **BACKEND API ENDPOINTS**

### **Call Transfer Service URL**
```
Production: https://call-transfer-service-313373223340.us-central1.run.app
Port: 8098
```

### **Available API Endpoints**
```javascript
// Transfer Management
POST /transfer/request                 // Request call transfer
GET  /transfer/{transfer_id}          // Get transfer status
POST /transfer/{transfer_id}/complete // Mark transfer complete
GET  /call/{call_id}/transfer-history // Transfer history

// Agent Management  
GET  /agents                          // List all agents
POST /agents/register                 // Register new agent
PUT  /agents/{agent_id}/status        // Update agent status

// Queue Management
GET  /departments/{dept}/queue        // Get department queue

// Real-time Updates
WebSocket: /ws/transfers              // Live transfer updates
```

---

## 🎨 **APPROACH 1: TELEPHONY INTEGRATION**

### **1. Call Transfer Button Component**

```jsx
// components/CallTransferButton.jsx
import React, { useState, useEffect } from 'react';

const CallTransferButton = ({ callId, sessionId, onTransferInitiated }) => {
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferInProgress, setTransferInProgress] = useState(false);
  const [transferOptions, setTransferOptions] = useState({
    department: '',
    transferType: 'warm',
    reason: 'customer_request',
    urgency: 'medium',
    notes: ''
  });

  const departments = [
    { value: 'sales', label: '💰 Sales' },
    { value: 'support', label: '🛠️ Technical Support' },
    { value: 'billing', label: '💳 Billing' },
    { value: 'management', label: '👔 Management' }
  ];

  const transferTypes = [
    { value: 'warm', label: '🤝 Warm Transfer', desc: 'Introduce customer to agent' },
    { value: 'cold', label: '❄️ Cold Transfer', desc: 'Direct transfer to agent' },
    { value: 'conference', label: '📞 Conference', desc: '3-way call with agent' }
  ];

  const handleTransferRequest = async () => {
    setTransferInProgress(true);
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('https://call-transfer-service-313373223340.us-central1.run.app/transfer/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          call_id: callId,
          session_id: sessionId,
          transfer_type: transferOptions.transferType,
          transfer_reason: transferOptions.reason,
          target_department: transferOptions.department,
          urgency_level: transferOptions.urgency,
          context_summary: transferOptions.notes || 'Customer requested transfer',
          customer_notes: transferOptions.notes
        })
      });

      if (response.ok) {
        const transferData = await response.json();
        onTransferInitiated?.(transferData);
        setShowTransferModal(false);
        
        // Start monitoring transfer status
        monitorTransferStatus(transferData.transfer_id);
      } else {
        throw new Error('Transfer request failed');
      }
    } catch (error) {
      console.error('Transfer failed:', error);
      alert('Transfer request failed. Please try again.');
    } finally {
      setTransferInProgress(false);
    }
  };

  const monitorTransferStatus = async (transferId) => {
    const checkStatus = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`https://call-transfer-service-313373223340.us-central1.run.app/transfer/${transferId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const status = await response.json();
          console.log('Transfer status:', status);
          
          // Update UI based on status
          if (status.status === 'completed' || status.status === 'failed') {
            clearInterval(statusInterval);
          }
        }
      } catch (error) {
        console.error('Failed to check transfer status:', error);
      }
    };

    const statusInterval = setInterval(checkStatus, 2000);
    setTimeout(() => clearInterval(statusInterval), 30000); // Stop after 30 seconds
  };

  return (
    <>
      {/* Transfer Button */}
      <button 
        onClick={() => setShowTransferModal(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        disabled={transferInProgress}
      >
        <span>🔄</span>
        <span>{transferInProgress ? 'Transferring...' : 'Transfer Call'}</span>
      </button>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Transfer Call</h3>
            
            {/* Department Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <select
                value={transferOptions.department}
                onChange={(e) => setTransferOptions({...transferOptions, department: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.value} value={dept.value}>{dept.label}</option>
                ))}
              </select>
            </div>

            {/* Transfer Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transfer Type
              </label>
              <div className="space-y-2">
                {transferTypes.map(type => (
                  <label key={type.value} className="flex items-center">
                    <input
                      type="radio"
                      value={type.value}
                      checked={transferOptions.transferType === type.value}
                      onChange={(e) => setTransferOptions({...transferOptions, transferType: e.target.value})}
                      className="mr-2"
                    />
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-sm text-gray-600">{type.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Urgency Level */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urgency Level
              </label>
              <select
                value={transferOptions.urgency}
                onChange={(e) => setTransferOptions({...transferOptions, urgency: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🟠 High</option>
                <option value="critical">🔴 Critical</option>
              </select>
            </div>

            {/* Transfer Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transfer Notes
              </label>
              <textarea
                value={transferOptions.notes}
                onChange={(e) => setTransferOptions({...transferOptions, notes: e.target.value})}
                placeholder="Brief context about the customer's request..."
                className="w-full border border-gray-300 rounded px-3 py-2 h-20"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex space-x-3">
              <button
                onClick={handleTransferRequest}
                disabled={!transferOptions.department || transferInProgress}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
              >
                {transferInProgress ? 'Processing...' : 'Transfer Call'}
              </button>
              <button
                onClick={() => setShowTransferModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded"
                disabled={transferInProgress}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CallTransferButton;
```

### **2. Integration into Call Interface**

```jsx
// components/CallInterface.jsx
import React, { useState } from 'react';
import CallTransferButton from './CallTransferButton';

const CallInterface = ({ callId, sessionId, callStatus }) => {
  const [transferStatus, setTransferStatus] = useState(null);

  const handleTransferInitiated = (transferData) => {
    setTransferStatus({
      status: 'initiated',
      transferId: transferData.transfer_id,
      targetDepartment: transferData.target_department,
      estimatedWaitTime: transferData.estimated_wait_time
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Call Status Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Active Call</h2>
          <p className="text-gray-600">Call ID: {callId}</p>
        </div>
        <div className="text-right">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
            callStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            <div className="w-2 h-2 bg-current rounded-full mr-2"></div>
            {callStatus}
          </div>
        </div>
      </div>

      {/* Transfer Status Alert */}
      {transferStatus && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🔄</span>
            <div>
              <h4 className="font-medium text-blue-800">Transfer in Progress</h4>
              <p className="text-blue-600 text-sm">
                Connecting to {transferStatus.targetDepartment} department
                {transferStatus.estimatedWaitTime && (
                  <span> - Estimated wait: {Math.ceil(transferStatus.estimatedWaitTime / 60)} minutes</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Call Controls */}
      <div className="flex space-x-3">
        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">
          🔴 End Call
        </button>
        
        <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">
          🔇 Mute
        </button>
        
        <CallTransferButton 
          callId={callId}
          sessionId={sessionId}
          onTransferInitiated={handleTransferInitiated}
        />
      </div>

      {/* Call Information */}
      <div className="mt-6 pt-6 border-t">
        <h3 className="font-medium mb-3">Call Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Duration:</span>
            <span className="ml-2 font-medium">05:32</span>
          </div>
          <div>
            <span className="text-gray-600">Quality:</span>
            <span className="ml-2 font-medium">HD</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallInterface;
```

---

## 🎯 **APPROACH 2: STANDALONE AGENT DASHBOARD**

### **1. Agent Management Dashboard**

```jsx
// pages/AgentDashboard.jsx
import React, { useState, useEffect } from 'react';
import TransferQueue from '../components/TransferQueue';
import AgentStatus from '../components/AgentStatus';
import TransferHistory from '../components/TransferHistory';

const AgentDashboard = () => {
  const [activeTab, setActiveTab] = useState('queue');
  const [agentInfo, setAgentInfo] = useState(null);
  const [realTimeData, setRealTimeData] = useState({
    activeTransfers: 0,
    availableAgents: 0,
    totalQueueLength: 0
  });

  useEffect(() => {
    // Initialize WebSocket connection for real-time updates
    const ws = new WebSocket('ws://call-transfer-service-313373223340.us-central1.run.app/ws/transfers');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'transfer_status') {
        setRealTimeData(data.data);
      }
    };

    ws.onopen = () => {
      console.log('Connected to transfer WebSocket');
    };

    return () => {
      ws.close();
    };
  }, []);

  const tabs = [
    { id: 'queue', label: '📋 Transfer Queue', icon: '📋' },
    { id: 'agents', label: '👥 Agent Status', icon: '👥' },
    { id: 'history', label: '📊 Transfer History', icon: '📊' },
    { id: 'analytics', label: '📈 Analytics', icon: '📈' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Call Transfer Dashboard</h1>
              <p className="text-gray-600">Manage call transfers and agent assignments</p>
            </div>
            
            {/* Real-time Stats */}
            <div className="flex space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{realTimeData.activeTransfers}</div>
                <div className="text-sm text-gray-600">Active Transfers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{realTimeData.availableAgents}</div>
                <div className="text-sm text-gray-600">Available Agents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{realTimeData.totalQueueLength}</div>
                <div className="text-sm text-gray-600">Queue Length</div>
              </div>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'queue' && <TransferQueue />}
        {activeTab === 'agents' && <AgentStatus />}
        {activeTab === 'history' && <TransferHistory />}
        {activeTab === 'analytics' && <div>Analytics Coming Soon...</div>}
      </div>
    </div>
  );
};

export default AgentDashboard;
```

### **2. Transfer Queue Component**

```jsx
// components/TransferQueue.jsx
import React, { useState, useEffect } from 'react';

const TransferQueue = () => {
  const [queues, setQueues] = useState({});
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [loading, setLoading] = useState(true);

  const departments = ['sales', 'support', 'billing', 'management'];

  useEffect(() => {
    fetchQueueData();
    const interval = setInterval(fetchQueueData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchQueueData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const queueData = {};

      for (const dept of departments) {
        const response = await fetch(`https://call-transfer-service-313373223340.us-central1.run.app/departments/${dept}/queue`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          queueData[dept] = await response.json();
        }
      }

      setQueues(queueData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch queue data:', error);
      setLoading(false);
    }
  };

  const formatWaitTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    return minutes > 0 ? `${minutes}m` : `${seconds}s`;
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[urgency] || colors.medium;
  };

  if (loading) return <div className="text-center py-8">Loading queue data...</div>;

  const filteredQueues = selectedDepartment === 'all' 
    ? queues 
    : { [selectedDepartment]: queues[selectedDepartment] };

  return (
    <div className="space-y-6">
      {/* Department Filter */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">Filter by Department:</label>
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1"
        >
          <option value="all">All Departments</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>
              {dept.charAt(0).toUpperCase() + dept.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Queue Display */}
      {Object.entries(filteredQueues).map(([department, queueInfo]) => (
        <div key={department} className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {department.charAt(0).toUpperCase() + department.slice(1)} Department
              </h3>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Queue Length: <span className="font-medium">{queueInfo?.queue_length || 0}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {queueInfo?.queue_details?.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No transfers in queue
              </div>
            ) : (
              queueInfo?.queue_details?.map((transfer, index) => (
                <div key={transfer.transfer_id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                        #{index + 1}
                      </div>
                      
                      <div>
                        <div className="font-medium">Call ID: {transfer.call_id}</div>
                        <div className="text-sm text-gray-600">
                          {transfer.context_summary}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${getUrgencyColor(transfer.urgency_level)}`}>
                        {transfer.urgency_level}
                      </span>
                      
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          Wait: {formatWaitTime(transfer.wait_time)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Transfer ID: {transfer.transfer_id.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransferQueue;
```

### **3. Agent Status Component**

```jsx
// components/AgentStatus.jsx
import React, { useState, useEffect } from 'react';

const AgentStatus = () => {
  const [agents, setAgents] = useState([]);
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: '',
    email: '',
    department: 'support',
    skills: '',
    languages: 'en'
  });

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('https://call-transfer-service-313373223340.us-central1.run.app/agents', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAgents(data.agents || []);
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    }
  };

  const updateAgentStatus = async (agentId, newStatus) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`https://call-transfer-service-313373223340.us-central1.run.app/agents/${agentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Update local state
        setAgents(agents.map(agent => 
          agent.agent_id === agentId 
            ? { ...agent, status: newStatus }
            : agent
        ));
      }
    } catch (error) {
      console.error('Failed to update agent status:', error);
    }
  };

  const registerAgent = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const agentData = {
        agent_id: `agent_${Date.now()}`,
        name: newAgent.name,
        email: newAgent.email,
        department: newAgent.department,
        skills: newAgent.skills.split(',').map(s => s.trim()),
        status: 'available',
        languages: [newAgent.languages],
        performance_rating: 4.0,
        last_activity: new Date().toISOString()
      };

      const response = await fetch('https://call-transfer-service-313373223340.us-central1.run.app/agents/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(agentData)
      });

      if (response.ok) {
        setShowAddAgent(false);
        setNewAgent({ name: '', email: '', department: 'support', skills: '', languages: 'en' });
        fetchAgents(); // Refresh list
      }
    } catch (error) {
      console.error('Failed to register agent:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-green-100 text-green-800',
      busy: 'bg-red-100 text-red-800',
      on_break: 'bg-yellow-100 text-yellow-800',
      offline: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.offline;
  };

  const getStatusIcon = (status) => {
    const icons = {
      available: '🟢',
      busy: '🔴',
      on_break: '🟡',
      offline: '⚫'
    };
    return icons[status] || icons.offline;
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Agent Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Agent Management</h2>
        <button
          onClick={() => setShowAddAgent(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          ➕ Add Agent
        </button>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map(agent => (
          <div key={agent.agent_id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">{agent.name}</h3>
                <p className="text-sm text-gray-600">{agent.department}</p>
              </div>
              <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(agent.status)}`}>
                {getStatusIcon(agent.status)} {agent.status}
              </span>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <div><strong>Email:</strong> {agent.email}</div>
              <div><strong>Skills:</strong> {agent.skills?.join(', ') || 'None'}</div>
              <div><strong>Languages:</strong> {agent.languages?.join(', ') || 'en'}</div>
              <div><strong>Rating:</strong> ⭐ {agent.performance_rating?.toFixed(1) || '4.0'}</div>
              {agent.current_call_id && (
                <div><strong>Current Call:</strong> {agent.current_call_id}</div>
              )}
            </div>

            {/* Status Controls */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateAgentStatus(agent.agent_id, 'available')}
                disabled={agent.status === 'available'}
                className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded disabled:opacity-50"
              >
                Available
              </button>
              <button
                onClick={() => updateAgentStatus(agent.agent_id, 'on_break')}
                disabled={agent.status === 'on_break'}
                className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded disabled:opacity-50"
              >
                On Break
              </button>
              <button
                onClick={() => updateAgentStatus(agent.agent_id, 'busy')}
                disabled={agent.status === 'busy'}
                className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded disabled:opacity-50"
              >
                Busy
              </button>
              <button
                onClick={() => updateAgentStatus(agent.agent_id, 'offline')}
                disabled={agent.status === 'offline'}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded disabled:opacity-50"
              >
                Offline
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Agent Modal */}
      {showAddAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Add New Agent</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({...newAgent, name: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Agent full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newAgent.email}
                  onChange={(e) => setNewAgent({...newAgent, email: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="agent@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={newAgent.department}
                  onChange={(e) => setNewAgent({...newAgent, department: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="support">Support</option>
                  <option value="sales">Sales</option>
                  <option value="billing">Billing</option>
                  <option value="management">Management</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma-separated)</label>
                <input
                  type="text"
                  value={newAgent.skills}
                  onChange={(e) => setNewAgent({...newAgent, skills: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="technical, billing, customer service"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Languages</label>
                <select
                  value={newAgent.languages}
                  onChange={(e) => setNewAgent({...newAgent, languages: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={registerAgent}
                disabled={!newAgent.name || !newAgent.email}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
              >
                Add Agent
              </button>
              <button
                onClick={() => setShowAddAgent(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentStatus;
```

### **4. Transfer History Component**

```jsx
// components/TransferHistory.jsx
import React, { useState, useEffect } from 'react';

const TransferHistory = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchCallId, setSearchCallId] = useState('');

  useEffect(() => {
    // Since we need call IDs to fetch history, we'll show a search interface
    setLoading(false);
  }, []);

  const searchTransferHistory = async (callId) => {
    if (!callId.trim()) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`https://call-transfer-service-313373223340.us-central1.run.app/call/${callId}/transfer-history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTransfers(data.transfer_history || []);
      } else {
        setTransfers([]);
      }
    } catch (error) {
      console.error('Failed to fetch transfer history:', error);
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransferStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="space-y-6">
      {/* Search Interface */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Search Transfer History</h3>
        <div className="flex space-x-4">
          <input
            type="text"
            value={searchCallId}
            onChange={(e) => setSearchCallId(e.target.value)}
            placeholder="Enter Call ID to view transfer history"
            className="flex-1 border border-gray-300 rounded px-3 py-2"
            onKeyPress={(e) => e.key === 'Enter' && searchTransferHistory(searchCallId)}
          />
          <button
            onClick={() => searchTransferHistory(searchCallId)}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Search
          </button>
        </div>
      </div>

      {/* Transfer History Results */}
      {loading ? (
        <div className="text-center py-8">Loading transfer history...</div>
      ) : transfers.length > 0 ? (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">
              Transfer History for Call: {searchCallId}
            </h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {transfers.map((transfer, index) => (
              <div key={index} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                      #{index + 1}
                    </div>
                    
                    <div>
                      <div className="font-medium">
                        Transfer ID: {transfer.transfer_id}
                      </div>
                      <div className="text-sm text-gray-600">
                        Department: {transfer.department}
                      </div>
                      <div className="text-sm text-gray-600">
                        Reason: {transfer.reason}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {formatDate(transfer.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : searchCallId ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          No transfer history found for Call ID: {searchCallId}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          Enter a Call ID above to view transfer history
        </div>
      )}
    </div>
  );
};

export default TransferHistory;
```

---

## 🔌 **REAL-TIME WEBSOCKET INTEGRATION**

### **WebSocket Hook for Real-time Updates**

```jsx
// hooks/useTransferWebSocket.js
import { useState, useEffect, useCallback } from 'react';

export const useTransferWebSocket = (onTransferUpdate) => {
  const [connected, setConnected] = useState(false);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const websocket = new WebSocket('ws://call-transfer-service-313373223340.us-central1.run.app/ws/transfers');
    
    websocket.onopen = () => {
      console.log('Connected to transfer WebSocket');
      setConnected(true);
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onTransferUpdate?.(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    websocket.onclose = () => {
      console.log('Disconnected from transfer WebSocket');
      setConnected(false);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [onTransferUpdate]);

  const sendMessage = useCallback((message) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }, [ws]);

  return { connected, sendMessage };
};
```

---

## 📦 **REQUIRED DEPENDENCIES**

Add these to your `package.json`:

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

---

## 🚀 **DEPLOYMENT OPTIONS**

### **Option 1: Integration into Existing App**

1. **Add to your main app:**
   ```jsx
   // In your main App.jsx or routes
   import CallTransferButton from './components/CallTransferButton';
   import AgentDashboard from './pages/AgentDashboard';
   
   // Add routes
   <Route path="/agents" component={AgentDashboard} />
   ```

2. **Add to call interface:**
   ```jsx
   // In your existing call component
   <CallTransferButton 
     callId={currentCallId}
     sessionId={currentSessionId}
     onTransferInitiated={handleTransfer}
   />
   ```

### **Option 2: Standalone Admin Panel**

1. **Create separate admin app:**
   ```bash
   npx create-react-app agent-dashboard
   cd agent-dashboard
   npm install
   ```

2. **Set up routing:**
   ```jsx
   // App.js
   import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
   import AgentDashboard from './pages/AgentDashboard';
   
   function App() {
     return (
       <Router>
         <Routes>
           <Route path="/" element={<AgentDashboard />} />
         </Routes>
       </Router>
     );
   }
   ```

---

## 🔧 **ENVIRONMENT CONFIGURATION**

### **Environment Variables**

```bash
# .env.local or .env.production
REACT_APP_TRANSFER_SERVICE_URL=https://call-transfer-service-313373223340.us-central1.run.app
REACT_APP_TRANSFER_WS_URL=ws://call-transfer-service-313373223340.us-central1.run.app/ws/transfers
REACT_APP_AUTH_SERVICE_URL=https://auth-service-313373223340.us-central1.run.app
```

### **API Configuration**

```javascript
// config/api.js
const API_ENDPOINTS = {
  TRANSFER_SERVICE: process.env.REACT_APP_TRANSFER_SERVICE_URL,
  AUTH_SERVICE: process.env.REACT_APP_AUTH_SERVICE_URL,
  WS_TRANSFER: process.env.REACT_APP_TRANSFER_WS_URL
};

export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('access_token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_ENDPOINTS.TRANSFER_SERVICE}${endpoint}`, {
    ...defaultOptions,
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return response.json();
};
```

---

## ✅ **TESTING CHECKLIST**

### **Transfer Integration Tests:**
- [ ] **Transfer button appears** in call interface
- [ ] **Modal opens** when transfer button clicked
- [ ] **Department selection** works properly
- [ ] **Transfer types** (warm/cold/conference) selectable
- [ ] **Transfer request** sends successfully
- [ ] **Real-time status** updates work
- [ ] **Agent dashboard** displays correctly
- [ ] **WebSocket connection** establishes
- [ ] **Queue updates** in real-time
- [ ] **Agent status changes** work
- [ ] **Transfer history** searchable

### **Agent Management Tests:**
- [ ] **Agent registration** works
- [ ] **Status updates** functional
- [ ] **Department filtering** works
- [ ] **Queue display** accurate
- [ ] **Real-time updates** working

---

## 🎯 **RECOMMENDED IMPLEMENTATION APPROACH**

### **Phase 1: Basic Integration (Week 1)**
1. Add CallTransferButton to existing call interface
2. Implement basic transfer modal
3. Test transfer requests

### **Phase 2: Agent Dashboard (Week 2)**
1. Create standalone agent dashboard
2. Implement queue management
3. Add agent status controls

### **Phase 3: Real-time Features (Week 3)**
1. Add WebSocket integration
2. Implement live updates
3. Add transfer monitoring

### **Phase 4: Analytics (Week 4)**
1. Add transfer history
2. Implement performance metrics
3. Create reporting dashboard

---

**🚀 Your call transfer system is now ready for complete frontend integration!**

This setup provides both telephony integration and standalone management capabilities with real-time updates and comprehensive agent management.
