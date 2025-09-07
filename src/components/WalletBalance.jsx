/**
 * 💰 WalletBalance Component - Real-time wallet and usage display
 */
import React, { useState, useEffect } from 'react';
import { walletAPI } from '../config/api.js';

const WalletBalance = ({ onAddFunds, onViewHistory }) => {
  const [balance, setBalance] = useState(0);
  const [freeMinutes, setFreeMinutes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWalletData();
    
    // Set up periodic refresh every 30 seconds
    const interval = setInterval(fetchWalletData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchWalletData = async () => {
    try {
      // Get wallet balance and free minutes in parallel
      const [balanceData, minutesData] = await Promise.all([
        walletAPI.getBalance(),
        walletAPI.getFreeMinutes()
      ]);
      
      setBalance(balanceData.balance_usd || 0);
      setFreeMinutes(minutesData.remaining_free_minutes || 0);
      setError('');
    } catch (err) {
      console.error('Failed to fetch wallet data:', err);
      setError('Unable to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchWalletData();
  };

  if (loading && balance === 0 && freeMinutes === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-20 mx-auto"></div>
            </div>
            <div className="text-center">
              <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Wallet & Usage</h3>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          title="Refresh wallet data"
        >
          <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="text-sm text-red-600">{error}</div>
          <button
            onClick={fetchWalletData}
            className="text-sm text-red-700 underline hover:no-underline mt-1"
          >
            Try again
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Account Balance */}
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-1">
            ${balance.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">Account Balance</div>
          {balance < 1 && (
            <div className="text-xs text-amber-600 mt-1">
              ⚠️ Low balance
            </div>
          )}
        </div>
        
        {/* Free Minutes */}
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {freeMinutes}
          </div>
          <div className="text-sm text-gray-600">Free Minutes Left</div>
          <div className="text-xs text-gray-500 mt-1">
            This month
          </div>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="border-t border-gray-200 pt-4 mb-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-sm font-medium text-gray-900">Regular</div>
            <div className="text-xs text-gray-600">$0.05/min</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Premium</div>
            <div className="text-xs text-gray-600">$0.15/min</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Free</div>
            <div className="text-xs text-gray-600">50/month</div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="space-y-3">
        <button 
          onClick={() => onAddFunds && onAddFunds()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
        >
          💳 Add Funds
        </button>
        
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => onViewHistory && onViewHistory()}
            className="bg-gray-100 text-gray-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200"
          >
            📊 History
          </button>
          <button 
            onClick={() => window.location.href = '/usage'}
            className="bg-gray-100 text-gray-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200"
          >
            📈 Usage
          </button>
        </div>
      </div>

      {/* Balance Warning */}
      {balance < 2 && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-amber-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-amber-800">
              Consider adding funds to avoid service interruption
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletBalance;
