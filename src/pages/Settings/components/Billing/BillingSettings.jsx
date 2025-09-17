import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  Receipt,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw
} from 'lucide-react';

// Production Billing Service Integration
const BILLING_SERVICE_URL = import.meta.env.VITE_BILLING_SERVICE_URL || 'https://billing-service-313373223340.us-central1.run.app';

// Helper function for billing API calls
const billingApiCall = async (endpoint, options = {}) => {
  const response = await fetch(`${BILLING_SERVICE_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      'Content-Type': 'application/json',
      'X-Tenant-ID': localStorage.getItem('tenant_id') || '',
      ...options.headers
    },
    ...options
  });
  
  if (!response.ok) {
    throw new Error(`Billing API error: ${response.status}`);
  }
  
  return response.json();
};

const BillingSettings = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [billingData, setBillingData] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [usage, setUsage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock billing data
  const mockBillingData = {
    currentPlan: 'Enterprise',
    monthlyAmount: 499.00,
    nextBillingDate: '2024-02-15',
    status: 'active',
    currency: 'USD',
    billingCycle: 'monthly',
    seats: 25,
    usedSeats: 18,
    overageCharges: 45.50
  };

  const mockPaymentMethods = [
    {
      id: 1,
      type: 'card',
      brand: 'Visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true
    },
    {
      id: 2,
      type: 'card',
      brand: 'Mastercard',
      last4: '5555',
      expiryMonth: 8,
      expiryYear: 2026,
      isDefault: false
    }
  ];

  const mockInvoices = [
    {
      id: 'INV-2024-001',
      date: '2024-01-15',
      amount: 544.50,
      status: 'paid',
      description: 'Enterprise Plan + Overages',
      downloadUrl: '#'
    },
    {
      id: 'INV-2023-012',
      date: '2023-12-15',
      amount: 499.00,
      status: 'paid',
      description: 'Enterprise Plan',
      downloadUrl: '#'
    },
    {
      id: 'INV-2023-011',
      date: '2023-11-15',
      amount: 499.00,
      status: 'paid',
      description: 'Enterprise Plan',
      downloadUrl: '#'
    }
  ];

  const mockUsage = {
    currentPeriod: {
      start: '2024-01-15',
      end: '2024-02-14'
    },
    calls: {
      included: 10000,
      used: 8750,
      overage: 250,
      overageRate: 0.05
    },
    minutes: {
      included: 50000,
      used: 47500,
      overage: 2500,
      overageRate: 0.02
    },
    sms: {
      included: 5000,
      used: 3200,
      overage: 0,
      overageRate: 0.01
    }
  };

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setBillingData(mockBillingData);
      setPaymentMethods(mockPaymentMethods);
      setInvoices(mockInvoices);
      setUsage(mockUsage);
      setIsLoading(false);
    }, 1000);
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: DollarSign },
    { id: 'usage', label: 'Usage & Limits', icon: TrendingUp },
    { id: 'payments', label: 'Payment Methods', icon: CreditCard },
    { id: 'invoices', label: 'Invoices', icon: Receipt }
  ];

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      past_due: 'bg-red-100 text-red-800',
      canceled: 'bg-gray-100 text-gray-800',
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getCardIcon = (brand) => {
    const brandColors = {
      Visa: 'text-blue-600',
      Mastercard: 'text-red-600',
      'American Express': 'text-green-600'
    };

    return (
      <CreditCard className={`w-8 h-8 ${brandColors[brand] || 'text-gray-600'}`} />
    );
  };

  const BillingOverview = () => (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Subscription</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">{billingData?.currentPlan}</h4>
                <p className="text-sm text-gray-600">Current plan</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly amount:</span>
                <span className="font-bold text-xl">${billingData?.monthlyAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Next billing:</span>
                <span className="font-medium">
                  {new Date(billingData?.nextBillingDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                {getStatusBadge(billingData?.status)}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">Seat Usage</h5>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">
                  {billingData?.usedSeats} of {billingData?.seats} seats used
                </span>
                <span className="text-sm font-medium">
                  {Math.round((billingData?.usedSeats / billingData?.seats) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(billingData?.usedSeats / billingData?.seats) * 100}%` }}
                ></div>
              </div>
            </div>
            {billingData?.overageCharges > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                  <span className="font-medium text-yellow-800">Overage Charges</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Additional ${billingData?.overageCharges} for usage beyond plan limits
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="mt-6 flex space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Upgrade Plan
          </button>
          <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">
            Add Seats
          </button>
          <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">
            Change Plan
          </button>
        </div>
      </div>

      {/* Upcoming Charges */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Charges</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Enterprise Plan (Monthly)</span>
            <span className="font-medium">${billingData?.monthlyAmount}</span>
          </div>
          {billingData?.overageCharges > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Overage Charges</span>
              <span className="font-medium">${billingData?.overageCharges}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-2 pt-4 font-bold text-lg">
            <span>Total</span>
            <span>${(billingData?.monthlyAmount + billingData?.overageCharges).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const UsageAndLimits = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Current Billing Period ({new Date(usage?.currentPeriod.start).toLocaleDateString()} - {new Date(usage?.currentPeriod.end).toLocaleDateString()})
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Calls */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Calls</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Used</span>
                <span className="font-medium">{usage?.calls.used.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Included</span>
                <span className="font-medium">{usage?.calls.included.toLocaleString()}</span>
              </div>
              {usage?.calls.overage > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Overage</span>
                  <span className="font-medium">{usage?.calls.overage.toLocaleString()}</span>
                </div>
              )}
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div 
                  className={`h-2 rounded-full ${usage?.calls.used > usage?.calls.included ? 'bg-red-500' : 'bg-blue-600'}`}
                  style={{ width: `${Math.min((usage?.calls.used / usage?.calls.included) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Minutes */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Minutes</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Used</span>
                <span className="font-medium">{usage?.minutes.used.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Included</span>
                <span className="font-medium">{usage?.minutes.included.toLocaleString()}</span>
              </div>
              {usage?.minutes.overage > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Overage</span>
                  <span className="font-medium">{usage?.minutes.overage.toLocaleString()}</span>
                </div>
              )}
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div 
                  className={`h-2 rounded-full ${usage?.minutes.used > usage?.minutes.included ? 'bg-red-500' : 'bg-green-600'}`}
                  style={{ width: `${Math.min((usage?.minutes.used / usage?.minutes.included) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* SMS */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">SMS Messages</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Used</span>
                <span className="font-medium">{usage?.sms.used.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Included</span>
                <span className="font-medium">{usage?.sms.included.toLocaleString()}</span>
              </div>
              {usage?.sms.overage > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Overage</span>
                  <span className="font-medium">{usage?.sms.overage.toLocaleString()}</span>
                </div>
              )}
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div 
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${Math.min((usage?.sms.used / usage?.sms.included) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Overage Rates */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Overage Rates</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Calls:</span>
              <span className="font-medium">${usage?.calls.overageRate} per call</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Minutes:</span>
              <span className="font-medium">${usage?.minutes.overageRate} per minute</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">SMS:</span>
              <span className="font-medium">${usage?.sms.overageRate} per message</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const PaymentMethods = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Payment Method
          </button>
        </div>
        
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <div key={method.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center">
                {getCardIcon(method.brand)}
                <div className="ml-4">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900">
                      {method.brand} •••• {method.last4}
                    </span>
                    {method.isDefault && (
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    Expires {method.expiryMonth}/{method.expiryYear}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="text-blue-600 hover:text-blue-900">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="text-red-600 hover:text-red-900">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const InvoicesTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Billing History</h3>
          <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center hover:bg-gray-300">
            <Download className="w-4 h-4 mr-2" />
            Export All
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{invoice.id}</div>
                      <div className="text-sm text-gray-500">{invoice.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(invoice.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${invoice.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(invoice.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                      <button className="text-green-600 hover:text-green-900 flex items-center">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading billing information...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return <BillingOverview />;
      case 'usage':
        return <UsageAndLimits />;
      case 'payments':
        return <PaymentMethods />;
      case 'invoices':
        return <InvoicesTab />;
      default:
        return <BillingOverview />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Billing & Payments</h1>
        <p className="text-gray-600 mt-2">Manage your subscription, payment methods, and billing history</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
};

export default BillingSettings;