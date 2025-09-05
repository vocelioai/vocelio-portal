import React, { useState, useEffect } from 'react';
import { Play, Square, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const ExecutionMonitor = ({ executions = [], onStopExecution }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('startTime');

  const filteredExecutions = executions.filter(exec => {
    if (filter === 'all') return true;
    return exec.status === filter;
  });

  const sortedExecutions = [...filteredExecutions].sort((a, b) => {
    if (sortBy === 'startTime') {
      return new Date(b.startTime) - new Date(a.startTime);
    }
    return 0;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running': return <Play className="w-4 h-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'stopped': return <Square className="w-4 h-4 text-gray-500" />;
      default: return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const formatDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const duration = Math.floor((end - start) / 1000);
    
    if (duration < 60) return `${duration}s`;
    if (duration < 3600) return `${Math.floor(duration / 60)}m ${duration % 60}s`;
    return `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`;
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="px-4 py-3 border-b bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">Execution Monitor</h3>
        <div className="mt-2 flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1 border rounded text-sm"
          >
            <option value="all">All Status</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="stopped">Stopped</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 border rounded text-sm"
          >
            <option value="startTime">Sort by Start Time</option>
          </select>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {sortedExecutions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No executions found</p>
          </div>
        ) : (
          sortedExecutions.map((execution) => (
            <div key={execution.id} className="px-4 py-3 border-b hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(execution.status)}
                  <div>
                    <div className="font-medium text-gray-900">
                      {execution.flowName || 'Unnamed Flow'}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {execution.id}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Started: {new Date(execution.startTime).toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {formatDuration(execution.startTime, execution.endTime)}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {execution.status}
                  </div>
                  {execution.status === 'running' && onStopExecution && (
                    <button
                      onClick={() => onStopExecution(execution.id)}
                      className="mt-2 px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                    >
                      Stop
                    </button>
                  )}
                </div>
              </div>
              
              {execution.error && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  {execution.error}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExecutionMonitor;
