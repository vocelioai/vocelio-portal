/**
 * 📊 TransactionHistory Component - Wallet transaction display
 */
import React, { useState, useEffect } from 'react';
import { walletAPI } from '../config/api.js';

const TransactionHistory = ({ limit = 20 }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, [currentPage]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await walletAPI.getTransactions(limit, currentPage * limit);
      
      if (currentPage === 0) {
        setTransactions(data.transactions || []);
      } else {
        setTransactions(prev => [...prev, ...(data.transactions || [])]);
      }
      
      setHasMore((data.transactions || []).length === limit);
      setError('');
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setError('Unable to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type, subtype = '') => {
    switch (type) {
      case 'credit':
        if (subtype === 'payment') return '💳';
        if (subtype === 'welcome_bonus') return '🎁';
        if (subtype === 'refund') return '↩️';
        return '💰';
      case 'debit':
        if (subtype === 'call') return '📞';
        if (subtype === 'subscription') return '📅';
        return '💸';
      default:
        return '📄';
    }
  };

  const getTransactionColor = (type) => {
    return type === 'credit' ? 'text-green-600' : 'text-red-600';
  };

  const getTransactionDescription = (transaction) => {
    const { type, subtype, description, metadata } = transaction;
    
    if (description) return description;
    
    // Generate smart descriptions based on type and metadata
    if (type === 'credit') {
      if (subtype === 'payment') return 'Wallet top-up';
      if (subtype === 'welcome_bonus') return 'Welcome bonus';
      if (subtype === 'refund') return 'Call refund';
      return 'Account credit';
    }
    
    if (type === 'debit') {
      if (subtype === 'call') {
        if (metadata?.call_duration) {
          return `Voice call (${Math.ceil(metadata.call_duration / 60)} min)`;
        }
        return 'Voice call';
      }
      if (subtype === 'subscription') return 'Monthly subscription';
      return 'Account debit';
    }
    
    return 'Transaction';
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Transaction History</h3>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Transaction History</h3>
        </div>
        <div className="p-6 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
          <button
            onClick={fetchTransactions}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
          <button
            onClick={() => {
              setCurrentPage(0);
              setTransactions([]);
              fetchTransactions();
            }}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            title="Refresh"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {transactions.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-gray-500">No transactions yet</div>
            <p className="text-sm text-gray-400 mt-1">
              Your transaction history will appear here
            </p>
          </div>
        ) : (
          transactions.map((transaction, index) => (
            <div key={transaction.id || index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">
                      {getTransactionIcon(transaction.type, transaction.subtype)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 truncate">
                      {getTransactionDescription(transaction)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(transaction.created_at)} at {formatTime(transaction.created_at)}
                    </div>
                    {transaction.metadata?.call_id && (
                      <div className="text-xs text-gray-400">
                        Call ID: {transaction.metadata.call_id.substring(0, 8)}...
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex-shrink-0 text-right">
                  <div className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                    {transaction.type === 'credit' ? '+' : '-'}${Math.abs(transaction.amount_usd).toFixed(2)}
                  </div>
                  {transaction.balance_after_usd !== undefined && (
                    <div className="text-xs text-gray-500">
                      Balance: ${transaction.balance_after_usd.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More Button */}
      {hasMore && transactions.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </div>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}

      {/* Summary Footer */}
      {transactions.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            Showing {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
