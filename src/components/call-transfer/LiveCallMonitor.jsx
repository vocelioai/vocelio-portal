import React, { useState, useEffect } from 'react';
import { 
  Phone, PhoneForwarded, Clock, User, MapPin, AlertCircle, 
  CheckCircle, RefreshCw, Filter, Loader, Play, Pause 
} from 'lucide-react';
import { callTransferAPI } from '../../config/api.js';
import { useCallEvents } from '../../hooks/useCallEvents.js';

const LiveCallMonitor = () => {
  const [activeCalls, setActiveCalls] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transferModal, setTransferModal] = useState({ show: false, call: null });
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [transferring, setTransferring] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Department colors
  const departmentColors = {
    billing: 'bg-blue-100 text-blue-800 border-blue-200',
    sales: 'bg-green-100 text-green-800 border-green-200',
    support: 'bg-orange-100 text-orange-800 border-orange-200',
    management: 'bg-purple-100 text-purple-800 border-purple-200',
    default: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  const getDepartmentColor = (name) => {
    const lowerName = name?.toLowerCase() || '';
    return departmentColors[lowerName] || departmentColors.default;
  };

  // Load active calls
  const loadActiveCalls = async () => {
    try {
      setError(null);
      const data = await callTransferAPI.getActiveCalls();
      setActiveCalls(data.active_calls || []);
    } catch (err) {
      console.error('Failed to load active calls:', err);
      setError('Failed to load active calls. Please try again.');
    }
  };

  // Load departments
  const loadDepartments = async () => {
    try {
      const data = await callTransferAPI.getDepartments();
      setDepartments(data.departments || []);
    } catch (err) {
      console.error('Failed to load departments:', err);
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadActiveCalls(), loadDepartments()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Auto-refresh active calls
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(loadActiveCalls, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Handle transfer call
  const handleTransferCall = async () => {
    if (!selectedDepartment || !transferModal.call) return;

    setTransferring(true);
    try {
      await callTransferAPI.transferCall(transferModal.call.call_id, selectedDepartment);
      
      // Close modal and refresh calls
      setTransferModal({ show: false, call: null });
      setSelectedDepartment('');
      await loadActiveCalls();
      
      // Show success message (you could use a toast notification here)
      alert('Call transferred successfully!');
    } catch (err) {
      console.error('Failed to transfer call:', err);
      alert('Failed to transfer call. Please try again.');
    } finally {
      setTransferring(false);
    }
  };

  // Open transfer modal
  const openTransferModal = (call) => {
    setTransferModal({ show: true, call });
    setSelectedDepartment('');
  };

  // Close transfer modal
  const closeTransferModal = () => {
    setTransferModal({ show: false, call: null });
    setSelectedDepartment('');
  };

  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format phone number
  const formatPhoneNumber = (phone) => {
    const cleaned = phone?.replace(/\D/g, '') || '';
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone || 'Unknown';
  };

  // Get call status color
  const getCallStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'ringing':
        return 'bg-blue-100 text-blue-800';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'transferring':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading active calls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Live Call Monitor</h2>
          <p className="text-gray-600 mt-1">Monitor active calls and manage transfers in real-time</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition duration-200 ${
              autoRefresh 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            {autoRefresh ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            <span className="text-sm font-medium">
              {autoRefresh ? 'Live' : 'Paused'}
            </span>
          </button>
          <button
            onClick={loadActiveCalls}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      )}

      {/* Active Calls */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {activeCalls.length === 0 ? (
          <div className="p-8 text-center">
            <Phone className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Calls</h3>
            <p className="text-gray-600">Active calls will appear here when available.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Caller
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Flow/Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeCalls.map((call) => (
                  <tr key={call.call_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatPhoneNumber(call.caller_number)}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {call.call_id?.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {call.current_flow || call.assigned_agent || 'AI Assistant'}
                      </div>
                      {call.current_department && (
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getDepartmentColor(call.current_department)}`}>
                          {call.current_department}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        {formatDuration(call.duration || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCallStatusColor(call.status)}`}>
                        {call.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {call.can_transfer !== false && departments.length > 0 ? (
                        <button
                          onClick={() => openTransferModal(call)}
                          className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition duration-200 flex items-center space-x-1 mx-auto"
                        >
                          <PhoneForwarded className="w-4 h-4" />
                          <span>Transfer</span>
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">No Transfer</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transfer Modal */}
      {transferModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Transfer Call</h3>
            
            <div className="space-y-4">
              {/* Call Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="font-medium">
                    {formatPhoneNumber(transferModal.call?.caller_number)}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Duration: {formatDuration(transferModal.call?.duration || 0)}
                </div>
              </div>

              {/* Department Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transfer to Department
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} - {formatPhoneNumber(dept.phone_number)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Transfer Type Info */}
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-800 font-medium">Warm Transfer</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  The caller will be introduced to the department agent before transfer.
                </p>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleTransferCall}
                  disabled={!selectedDepartment || transferring}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition duration-200 flex items-center justify-center"
                >
                  {transferring ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                      Transferring...
                    </>
                  ) : (
                    <>
                      <PhoneForwarded className="w-4 h-4 mr-2" />
                      Transfer Call
                    </>
                  )}
                </button>
                <button
                  onClick={closeTransferModal}
                  disabled={transferring}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveCallMonitor;
