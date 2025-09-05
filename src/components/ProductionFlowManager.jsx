import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Play, 
  Pause, 
  Trash2, 
  Eye, 
  Activity,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';

const ProductionFlowManager = ({ isOpen, onClose }) => {
  const [deployedFlows, setDeployedFlows] = useState([]);
  const [activeFlows, setActiveFlows] = useState([]);
  const [flowMetrics, setFlowMetrics] = useState({});
  const [loading, setLoading] = useState(false);

  // Load deployed flows from localStorage and fetch live status
  useEffect(() => {
    if (isOpen) {
      loadDeployedFlows();
      loadActiveFlows();
      loadFlowMetrics();
      
      // Set up periodic refresh
      const interval = setInterval(() => {
        loadActiveFlows();
        loadFlowMetrics();
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const loadDeployedFlows = () => {
    try {
      const flows = JSON.parse(localStorage.getItem('deployed_flows') || '[]');
      setDeployedFlows(flows);
    } catch (error) {
      console.error('Error loading deployed flows:', error);
    }
  };

  const loadActiveFlows = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_TELEPHONY_ADAPTER_URL}/admin/active-calls`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setActiveFlows(data.active_calls || []);
      }
    } catch (error) {
      console.warn('Could not load active flows:', error);
    }
  };

  const loadFlowMetrics = async () => {
    try {
      const metrics = {};
      
      for (const flow of deployedFlows) {
        try {
          const response = await fetch(`${import.meta.env.VITE_FLOW_PROCESSOR_URL}/flows/${flow.id}/metrics`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            metrics[flow.id] = data;
          }
        } catch (error) {
          console.warn(`Metrics not available for flow ${flow.id}`);
        }
      }
      
      setFlowMetrics(metrics);
    } catch (error) {
      console.warn('Could not load flow metrics:', error);
    }
  };

  const toggleFlowStatus = async (flowId, currentStatus) => {
    setLoading(true);
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      
      // Update flow status
      const response = await fetch(`${import.meta.env.VITE_FLOW_PROCESSOR_URL}/flows/${flowId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Update local storage
        const flows = deployedFlows.map(flow => 
          flow.id === flowId ? { ...flow, status: newStatus } : flow
        );
        setDeployedFlows(flows);
        localStorage.setItem('deployed_flows', JSON.stringify(flows));
      }
    } catch (error) {
      console.error('Error updating flow status:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteFlow = async (flowId) => {
    if (!confirm('Are you sure you want to delete this production flow?')) return;
    
    setLoading(true);
    try {
      // Delete from backend
      await fetch(`${import.meta.env.VITE_FLOW_PROCESSOR_URL}/flows/${flowId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        }
      });

      // Update local storage
      const flows = deployedFlows.filter(flow => flow.id !== flowId);
      setDeployedFlows(flows);
      localStorage.setItem('deployed_flows', JSON.stringify(flows));
    } catch (error) {
      console.error('Error deleting flow:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDuration = (dateString) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Activity className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Production Flow Manager</h2>
            <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
              {deployedFlows.length} Deployed
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Stats Bar */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{deployedFlows.length}</div>
              <div className="text-sm text-gray-600">Total Flows</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {deployedFlows.filter(f => f.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{activeFlows.length}</div>
              <div className="text-sm text-gray-600">Live Calls</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Object.values(flowMetrics).reduce((sum, m) => sum + (m.total_executions || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Executions</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-6">
            {/* Active Calls Section */}
            {activeFlows.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Phone className="w-5 h-5 mr-2 text-green-500" />
                  Live Calls ({activeFlows.length})
                </h3>
                <div className="grid gap-4 mb-6">
                  {activeFlows.map((call, index) => (
                    <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <div>
                            <div className="font-medium text-gray-900">{call.phone_number || 'Unknown'}</div>
                            <div className="text-sm text-gray-600">Call ID: {call.call_sid}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {call.duration || 'Unknown duration'}
                          </div>
                          <div className="text-xs text-gray-600">
                            Flow: {call.flow_id || 'Not assigned'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deployed Flows Section */}
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Deployed Flows</h3>
            
            {deployedFlows.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Production Flows</h3>
                <p className="text-gray-600 mb-4">Deploy your first flow to start handling production calls</p>
                <button
                  onClick={onClose}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Flow Designer
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {deployedFlows.map((flow) => {
                  const metrics = flowMetrics[flow.id] || {};
                  
                  return (
                    <div key={flow.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getStatusIcon(flow.status)}
                            <h4 className="font-semibold text-gray-900">{flow.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              flow.status === 'active' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {flow.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            Flow ID: {flow.id}
                          </div>
                          <div className="text-sm text-gray-600">
                            Phone Numbers: {flow.phone_numbers?.join(', ') || 'None assigned'}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleFlowStatus(flow.id, flow.status)}
                            disabled={loading}
                            className={`p-2 rounded-lg transition-colors ${
                              flow.status === 'active'
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                            title={flow.status === 'active' ? 'Pause Flow' : 'Activate Flow'}
                          >
                            {flow.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                          
                          <button
                            onClick={() => deleteFlow(flow.id)}
                            disabled={loading}
                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            title="Delete Flow"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">
                            {metrics.total_executions || 0}
                          </div>
                          <div className="text-xs text-gray-600">Executions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-600">
                            {metrics.success_rate || 0}%
                          </div>
                          <div className="text-xs text-gray-600">Success Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-blue-600">
                            {metrics.avg_duration || '0s'}
                          </div>
                          <div className="text-xs text-gray-600">Avg Duration</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-600">
                            {formatDuration(flow.deployed_at)}
                          </div>
                          <div className="text-xs text-gray-600">Uptime</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionFlowManager;
