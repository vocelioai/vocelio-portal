/**
 * 🎉 WelcomeMessage Component - Post-registration welcome
 */
import React from 'react';

const WelcomeMessage = ({ user, onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Welcome Header */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎉 Welcome to Vocelio!
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Your account has been created successfully, {user?.first_name || 'there'}!
          </p>

          {/* Welcome Package Card */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-6 border border-green-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              🎁 Your Welcome Package
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">$4.00</div>
                <div className="text-sm text-gray-600">Free Balance</div>
                <div className="text-xs text-gray-500">Ready to use!</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">50</div>
                <div className="text-sm text-gray-600">Free Minutes</div>
                <div className="text-xs text-gray-500">Monthly</div>
              </div>
            </div>

            <div className="border-t border-green-200 pt-4">
              <h3 className="font-semibold text-gray-800 mb-2">✨ What's included:</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  $4.00 starting balance (no payment required)
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  50 free regular voice minutes every month
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Starter tier with volume discounts
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                  Full access to AI calling platform
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                  Multi-tenant organization management
                </div>
              </div>
            </div>
          </div>

          {/* Organization Info */}
          {user?.organization_name && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">🏢 Your Organization</h3>
              <div className="text-sm text-gray-600">
                <div><strong>Name:</strong> {user.organization_name}</div>
                {user.subdomain && (
                  <div><strong>URL:</strong> {user.subdomain}.vocelio.com</div>
                )}
              </div>
            </div>
          )}

          {/* Quick Start Tips */}
          <div className="text-left mb-6">
            <h3 className="font-semibold text-gray-800 mb-3 text-center">🚀 Quick Start Tips</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start">
                <span className="font-bold text-blue-600 mr-2">1.</span>
                <span>Explore the dashboard to see your wallet balance and usage</span>
              </div>
              <div className="flex items-start">
                <span className="font-bold text-blue-600 mr-2">2.</span>
                <span>Create your first AI voice flow using our drag-and-drop builder</span>
              </div>
              <div className="flex items-start">
                <span className="font-bold text-blue-600 mr-2">3.</span>
                <span>Test calls with your free minutes before going live</span>
              </div>
              <div className="flex items-start">
                <span className="font-bold text-blue-600 mr-2">4.</span>
                <span>Add funds anytime to scale your calling campaigns</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onGetStarted}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 transform hover:scale-105"
            >
              🎯 Go to Dashboard
            </button>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => window.open('/docs', '_blank')}
                className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200 text-sm"
              >
                📚 View Docs
              </button>
              <button
                onClick={() => window.open('/support', '_blank')}
                className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200 text-sm"
              >
                💬 Get Help
              </button>
            </div>
          </div>

          {/* Footer Message */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              🔒 Your account is secured with enterprise-grade encryption.<br/>
              Ready to build amazing voice experiences!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeMessage;
