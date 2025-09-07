/**
 * 📈 UsageDashboard Component - Monthly usage and discount tier display
 */
import React, { useState, useEffect } from 'react';
import { walletAPI, discountAPI } from '../config/api.js';

const UsageDashboard = () => {
  const [usage, setUsage] = useState(null);
  const [discountInfo, setDiscountInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsageData();
  }, []);

  const fetchUsageData = async () => {
    try {
      setLoading(true);
      
      // Get monthly usage stats and discount information in parallel
      const [usageData, discountData] = await Promise.all([
        walletAPI.getUsageStats(),
        discountAPI.getCurrentDiscount()
      ]);
      
      setUsage(usageData);
      setDiscountInfo(discountData);
      setError('');
    } catch (err) {
      console.error('Failed to fetch usage data:', err);
      setError('Unable to load usage data');
    } finally {
      setLoading(false);
    }
  };

  const calculateMinutesUsed = () => {
    if (!usage) return { total: 0, free: 0, paid: 0 };
    
    const freeUsed = usage.free_minutes_used || 0;
    const paidRegular = usage.paid_minutes_regular || 0;
    const paidPremium = usage.paid_minutes_premium || 0;
    
    return {
      total: freeUsed + paidRegular + paidPremium,
      free: freeUsed,
      paid: paidRegular + paidPremium
    };
  };

  const getDiscountColor = (percentage) => {
    if (percentage >= 30) return 'text-purple-600 bg-purple-100';
    if (percentage >= 15) return 'text-blue-600 bg-blue-100';
    if (percentage >= 5) return 'text-green-600 bg-green-100';
    return 'text-gray-600 bg-gray-100';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Monthly Usage Skeleton */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="text-center">
                  <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-20 mx-auto mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Discount Tier Skeleton */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
            <div className="flex items-center justify-between">
              <div>
                <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="text-right">
                <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
        <button
          onClick={fetchUsageData}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  const minutes = calculateMinutesUsed();
  const currentMonth = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="space-y-6">
      {/* Monthly Usage Overview */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Usage for {currentMonth}
          </h3>
          <button
            onClick={fetchUsageData}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh usage data"
          >
            <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free Minutes Used */}
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {minutes.free}
            </div>
            <div className="text-sm text-blue-700 font-medium mb-1">Free Minutes Used</div>
            <div className="text-xs text-blue-600">
              of 50 included monthly
            </div>
            <div className="mt-2">
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((minutes.free / 50) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Paid Regular Minutes */}
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {usage?.paid_minutes_regular || 0}
            </div>
            <div className="text-sm text-green-700 font-medium mb-1">Paid Regular Minutes</div>
            <div className="text-xs text-green-600">
              $0.05 per minute
            </div>
            {usage?.paid_minutes_regular > 0 && (
              <div className="text-xs text-green-700 mt-1">
                Cost: {formatCurrency((usage.paid_minutes_regular || 0) * 0.05)}
              </div>
            )}
          </div>
          
          {/* Premium Minutes */}
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {usage?.paid_minutes_premium || 0}
            </div>
            <div className="text-sm text-purple-700 font-medium mb-1">Premium Minutes</div>
            <div className="text-xs text-purple-600">
              $0.15 per minute
            </div>
            {usage?.paid_minutes_premium > 0 && (
              <div className="text-xs text-purple-700 mt-1">
                Cost: {formatCurrency((usage.paid_minutes_premium || 0) * 0.15)}
              </div>
            )}
          </div>
        </div>

        {/* Usage Summary */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900">{minutes.total}</div>
              <div className="text-sm text-gray-600">Total Minutes</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {formatCurrency((usage?.total_spent_this_month || 0))}
              </div>
              <div className="text-sm text-gray-600">Total Spent</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {formatCurrency((usage?.estimated_savings || 0))}
              </div>
              <div className="text-sm text-gray-600">Estimated Savings</div>
            </div>
          </div>
        </div>
      </div>

      {/* Discount Tier Info */}
      {discountInfo && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-lg border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Volume Discount Status</h3>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDiscountColor(discountInfo.discount_percentage)}`}>
                  {discountInfo.tier_name || 'Starter'}
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  {discountInfo.discount_percentage || 0}%
                </span>
                <span className="text-sm text-gray-600">discount</span>
              </div>
              <div className="text-sm text-gray-600">
                on all voice minutes
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-600">Monthly Spend</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(discountInfo.monthly_spend)}
              </div>
            </div>
          </div>

          {/* Next Tier Progress */}
          {discountInfo.next_tier && (
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-900">
                  Progress to {discountInfo.next_tier.name}
                </div>
                <div className="text-sm text-gray-600">
                  {discountInfo.next_tier.discount_percentage}% discount
                </div>
              </div>
              
              <div className="mb-2">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(((discountInfo.monthly_spend || 0) / discountInfo.next_tier.min_monthly_spend) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="flex justify-between text-sm text-gray-600">
                <span>{formatCurrency(discountInfo.monthly_spend || 0)}</span>
                <span>{formatCurrency(discountInfo.next_tier.min_monthly_spend)}</span>
              </div>
              
              <div className="text-center mt-2 text-sm">
                <span className="text-gray-600">
                  Spend {formatCurrency((discountInfo.next_tier.min_monthly_spend || 0) - (discountInfo.monthly_spend || 0))} more to unlock
                </span>
                <span className="font-medium text-purple-600 ml-1">
                  {discountInfo.next_tier.discount_percentage}% discount
                </span>
              </div>
            </div>
          )}

          {/* Discount Tiers Legend */}
          <div className="mt-4 pt-4 border-t border-blue-200">
            <div className="text-sm text-gray-600 mb-2">Available Discount Tiers:</div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
              <div className="text-center p-2 bg-white rounded border">
                <div className="font-medium">Starter</div>
                <div className="text-gray-600">0% • $0+</div>
              </div>
              <div className="text-center p-2 bg-white rounded border">
                <div className="font-medium">Growth</div>
                <div className="text-gray-600">5% • $100+</div>
              </div>
              <div className="text-center p-2 bg-white rounded border">
                <div className="font-medium">Business</div>
                <div className="text-gray-600">15% • $500+</div>
              </div>
              <div className="text-center p-2 bg-white rounded border">
                <div className="font-medium">Enterprise</div>
                <div className="text-gray-600">30% • $2000+</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsageDashboard;
