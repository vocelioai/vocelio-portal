import React, { useState, useEffect } from 'react';
import { 
  Phone, PhoneForwarded, Clock, User, DollarSign, Calendar, 
  Filter, Download, Search, ChevronLeft, ChevronRight, 
  AlertCircle, Loader, Receipt, Building2
} from 'lucide-react';
import { callTransferAPI } from '../../config/api.js';

const CallLogsPage = () => {
  const [callLogs, setCallLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    dateRange: '7days',
    status: 'all',
    hasTransfer: 'all',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0
  });

  // Department colors for transfer badges
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

  // Load call logs
  const loadCallLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        date_range: filters.dateRange,
        status: filters.status !== 'all' ? filters.status : undefined,
        has_transfer: filters.hasTransfer !== 'all' ? filters.hasTransfer === 'true' : undefined,
        search: filters.search || undefined
      };

      // Remove undefined values
      Object.keys(params).forEach(key => {
        if (params[key] === undefined) {
          delete params[key];
        }
      });

      const data = await callTransferAPI.getCallLogs(params);
      setCallLogs(data.call_logs || []);
      setPagination(prev => ({
        ...prev,
        total: data.total || 0,
        totalPages: Math.ceil((data.total || 0) / prev.limit)
      }));
    } catch (err) {
      console.error('Failed to load call logs:', err);
      setError('Failed to load call logs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load data when filters or pagination change
  useEffect(() => {
    loadCallLogs();
  }, [filters, pagination.page]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  // Handle search
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      loadCallLogs();
    }
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
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

  // Format duration
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get call status color
  const getCallStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'transferred':
        return 'bg-blue-100 text-blue-800';
      case 'missed':
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'abandoned':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate total costs
  const calculateTotalCosts = (callLog) => {
    const aiMinutes = callLog.ai_minutes || 0;
    const transferMinutes = callLog.transfer_minutes || 0;
    const aiCost = aiMinutes * 0.05; // $0.05 per AI minute
    const transferCost = transferMinutes * 0.15; // $0.15 per transfer minute
    return { aiCost, transferCost, total: aiCost + transferCost };
  };

  if (loading && callLogs.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading call logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Call Logs</h2>
          <p className="text-gray-600 mt-1">View call history with transfer tracking and cost breakdown</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition duration-200 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                onKeyPress={handleSearch}
                placeholder="Call ID, phone number..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="1day">Last 24 hours</option>
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="transferred">Transferred</option>
              <option value="missed">Missed</option>
              <option value="abandoned">Abandoned</option>
            </select>
          </div>

          {/* Transfer Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transfers</label>
            <select
              value={filters.hasTransfer}
              onChange={(e) => handleFilterChange('hasTransfer', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Calls</option>
              <option value="true">With Transfers</option>
              <option value="false">No Transfers</option>
            </select>
          </div>
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

      {/* Call Logs Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <Loader className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-gray-600 text-sm">Loading...</p>
          </div>
        ) : callLogs.length === 0 ? (
          <div className="p-8 text-center">
            <Receipt className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Call Logs</h3>
            <p className="text-gray-600">No calls found matching your criteria.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Call Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status & Transfers
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost Breakdown
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {callLogs.map((callLog) => {
                    const costs = calculateTotalCosts(callLog);
                    return (
                      <tr key={callLog.call_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Phone className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {formatPhoneNumber(callLog.caller_number)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatDate(callLog.start_time)}
                              </div>
                              <div className="text-xs text-gray-400">
                                ID: {callLog.call_id?.substring(0, 12)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Clock className="w-4 h-4 text-gray-400 mr-2" />
                            {formatDuration(callLog.total_duration || 0)}
                          </div>
                          {callLog.ai_minutes && (
                            <div className="text-xs text-gray-500">
                              AI: {Math.round(callLog.ai_minutes)}m
                            </div>
                          )}
                          {callLog.transfer_minutes && (
                            <div className="text-xs text-gray-500">
                              Transfer: {Math.round(callLog.transfer_minutes)}m
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCallStatusColor(callLog.status)}`}>
                              {callLog.status || 'Completed'}
                            </span>
                            {callLog.transfers && callLog.transfers.length > 0 && (
                              <div className="space-y-1">
                                {callLog.transfers.map((transfer, index) => (
                                  <div key={index} className="flex items-center space-x-2">
                                    <PhoneForwarded className="w-3 h-3 text-gray-400" />
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getDepartmentColor(transfer.target_department)}`}>
                                      Transferred to: {transfer.target_department}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {callLog.ai_minutes > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">AI Minutes:</span>
                                <span className="font-medium">${costs.aiCost.toFixed(2)}</span>
                              </div>
                            )}
                            {callLog.transfer_minutes > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Transfer Minutes:</span>
                                <span className="font-medium">${costs.transferCost.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-sm font-semibold border-t pt-1">
                              <span>Total:</span>
                              <span>${costs.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CallLogsPage;
