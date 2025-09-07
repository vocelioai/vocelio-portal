/**
 * 💳 AddFunds Component - Stripe Payment Integration
 */
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { stripeAPI } from '../config/api.js';

// Stripe publishable key
const stripePromise = loadStripe('pk_live_51RJXLjAJO2glRP32tkw33O0WSr4LxI7oVv6BAF8PS9bN8ephYSQqCEe9MXkPrEDwyk8sEUvFuYxKi8glFpfs1FJp00erLPG0qh');

const AddFundsForm = ({ onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [amount, setAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const presetAmounts = [10, 25, 50, 100, 250, 500];

  const getActualAmount = () => {
    return showCustom ? parseFloat(customAmount) || 0 : amount;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    if (!stripe || !elements) {
      setMessage('Stripe not loaded. Please try again.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    const finalAmount = getActualAmount();
    if (finalAmount < 5) {
      setMessage('Minimum amount is $5.00');
      setMessageType('error');
      setLoading(false);
      return;
    }

    if (finalAmount > 10000) {
      setMessage('Maximum amount is $10,000.00');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      // Create payment intent
      const { client_secret } = await stripeAPI.createPaymentIntent(finalAmount);

      // Confirm payment
      const result = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            // You can add billing details here if needed
          },
        }
      });

      if (result.error) {
        setMessage(result.error.message);
        setMessageType('error');
      } else {
        // Payment successful
        await stripeAPI.confirmPayment(result.paymentIntent.id);
        setMessage(`Successfully added $${finalAmount.toFixed(2)} to your wallet!`);
        setMessageType('success');
        
        // Call success callback after a short delay
        setTimeout(() => {
          onSuccess && onSuccess(finalAmount);
        }, 2000);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setMessage('Payment failed. Please try again.');
      setMessageType('error');
    }
    
    setLoading(false);
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setCustomAmount(value);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Add Funds to Wallet</h3>
        <p className="text-gray-600">Choose an amount to add to your Vocelio account</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Amount (USD)
          </label>
          
          {!showCustom && (
            <div className="grid grid-cols-3 gap-3 mb-3">
              {presetAmounts.map((presetAmount) => (
                <button
                  key={presetAmount}
                  type="button"
                  onClick={() => setAmount(presetAmount)}
                  className={`p-3 border-2 rounded-lg text-center font-medium transition-all ${
                    amount === presetAmount
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  ${presetAmount}
                </button>
              ))}
            </div>
          )}

          {showCustom && (
            <div className="mb-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="text"
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  placeholder="Enter amount"
                  className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Minimum: $5.00 • Maximum: $10,000.00
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowCustom(!showCustom)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {showCustom ? '← Choose preset amount' : 'Enter custom amount →'}
          </button>
        </div>

        {/* Amount Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Amount to add:</span>
            <span className="text-lg font-bold text-gray-900">
              ${getActualAmount().toFixed(2)}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            No additional fees • Instant availability
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Payment Method
          </label>
          <div className="border border-gray-300 rounded-lg p-4 bg-white">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#374151',
                    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                    '::placeholder': {
                      color: '#9CA3AF',
                    },
                    iconColor: '#6B7280',
                  },
                  invalid: {
                    color: '#EF4444',
                    iconColor: '#EF4444',
                  },
                },
                hidePostalCode: false,
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            🔒 Secured by Stripe • Your card details are never stored
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`p-4 rounded-lg border ${
            messageType === 'success' 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <div className="flex items-center">
              {messageType === 'success' ? (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              <span className="text-sm">{message}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!stripe || loading || getActualAmount() < 5}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : (
              `Add $${getActualAmount().toFixed(2)}`
            )}
          </button>
        </div>
      </form>

      {/* Security Notice */}
      <div className="mt-6 text-center text-xs text-gray-500">
        <p>🛡️ Payments are processed securely by Stripe</p>
        <p>Funds are immediately available in your account</p>
      </div>
    </div>
  );
};

const AddFunds = ({ onSuccess, onCancel }) => (
  <Elements stripe={stripePromise}>
    <AddFundsForm onSuccess={onSuccess} onCancel={onCancel} />
  </Elements>
);

export default AddFunds;
