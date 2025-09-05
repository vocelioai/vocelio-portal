import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Activity, Calendar } from 'lucide-react';

const FlowAnalyticsDashboard = ({ flowId, data }) => {
  const [analyticsData, setAnalyticsData] = useState({
    totalExecutions: 1245,
    successRate: 94.2,
    averageDuration: 2.3,
    activeUsers: 89,
    dailyStats: [
      { date: '2024-01-01', executions: 45, successRate: 92 },
      { date: '2024-01-02', executions: 52, successRate: 96 },
      { date: '2024-01-03', executions: 48, successRate: 94 },
      { date: '2024-01-04', executions: 67, successRate: 95 },
      { date: '2024-01-05', executions: 73, successRate: 93 }
    ]
  });

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-blue-600" />
        Analytics Dashboard
      </h3>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Executions</p>
              <p className="text-2xl font-bold text-blue-900">{analyticsData.totalExecutions.toLocaleString()}</p>
            </div>
            <Activity className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Success Rate</p>
              <p className="text-2xl font-bold text-green-900">{analyticsData.successRate}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Avg Duration</p>
              <p className="text-2xl font-bold text-purple-900">{analyticsData.averageDuration}s</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Active Users</p>
              <p className="text-2xl font-bold text-orange-900">{analyticsData.activeUsers}</p>
            </div>
            <Users className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Daily Execution Trends</h4>
        <div className="h-64 flex items-end justify-between gap-2">
          {analyticsData.dailyStats.map((stat, index) => {
            const height = (stat.executions / Math.max(...analyticsData.dailyStats.map(s => s.executions))) * 200;
            return (
              <div key={index} className="flex flex-col items-center gap-2">
                <div 
                  className="bg-blue-500 rounded-t min-w-[40px] transition-all duration-300"
                  style={{ height: `${height}px` }}
                  title={`${stat.executions} executions`}
                ></div>
                <div className="text-xs text-gray-600">
                  {new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6">
        <h4 className="font-semibold text-gray-900 mb-3">Recent Activity</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
            <span>Flow executed successfully</span>
            <span className="text-gray-500">2 minutes ago</span>
          </div>
          <div className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
            <span>New user started conversation</span>
            <span className="text-gray-500">5 minutes ago</span>
          </div>
          <div className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
            <span>Flow performance optimized</span>
            <span className="text-gray-500">15 minutes ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowAnalyticsDashboard;
