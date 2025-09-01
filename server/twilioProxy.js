// Twilio Proxy Server for Vocilio Portal
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3003'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Twilio Configuration
const TWILIO_ACCOUNT_SID = process.env.VITE_TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.VITE_TWILIO_AUTH_TOKEN;
const TWILIO_API_URL = 'https://api.twilio.com/2010-04-01';

console.log('🔧 Twilio Proxy Server Configuration:', {
  accountSid: TWILIO_ACCOUNT_SID ? `${TWILIO_ACCOUNT_SID.substring(0, 10)}...` : 'NOT SET',
  authToken: TWILIO_AUTH_TOKEN ? 'SET' : 'NOT SET',
  port: PORT
});

// Create axios instance for Twilio API
const twilioClient = axios.create({
  baseURL: TWILIO_API_URL,
  auth: {
    username: TWILIO_ACCOUNT_SID,
    password: TWILIO_AUTH_TOKEN
  },
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json'
  }
});

// Helper function to convert object to URL encoded string
const toUrlEncoded = (obj) => {
  return Object.keys(obj)
    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]))
    .join('&');
};

// Route: Search Available Phone Numbers
app.get('/api/twilio/available-numbers/:countryCode', async (req, res) => {
  try {
    const { countryCode } = req.params;
    const {
      areaCode,
      contains,
      nearNumber,
      nearLatLong,
      distance,
      type = 'Local', // Local, Mobile, TollFree
      limit = 20
    } = req.query;

    console.log('🔍 Searching phone numbers:', { countryCode, type, areaCode, contains });

    // Build endpoint based on number type
    let endpoint = `/Accounts/${TWILIO_ACCOUNT_SID}/AvailablePhoneNumbers/${countryCode}`;
    
    if (type === 'Mobile') {
      endpoint += '/Mobile.json';
    } else if (type === 'TollFree') {
      endpoint += '/TollFree.json';
    } else {
      endpoint += '/Local.json';
    }

    // Build search parameters
    const searchParams = {
      PageSize: Math.min(parseInt(limit), 50) // Twilio limits to 50 per request
    };

    if (areaCode) searchParams.AreaCode = areaCode;
    if (contains) searchParams.Contains = contains;
    if (nearNumber) searchParams.NearNumber = nearNumber;
    if (nearLatLong) searchParams.NearLatLong = nearLatLong;
    if (distance) searchParams.Distance = distance;

    console.log('🚀 Making Twilio API call:', endpoint, searchParams);

    const response = await twilioClient.get(endpoint, {
      params: searchParams
    });

    console.log('✅ Twilio API Response:', {
      status: response.status,
      numbersCount: response.data.available_phone_numbers?.length || 0
    });

    // Transform response for frontend
    const transformedNumbers = response.data.available_phone_numbers?.map(num => ({
      number: num.phone_number,
      friendlyName: num.friendly_name || num.phone_number,
      type: type,
      location: `${num.locality || ''}, ${num.region || ''} ${num.iso_country || ''}`.trim(),
      capabilities: {
        voice: num.capabilities?.voice !== false,
        sms: num.capabilities?.sms !== false,
        mms: num.capabilities?.mms !== false,
        fax: false
      },
      addressRequirement: num.address_requirements || 'none',
      monthlyFee: `$1.15`, // Standard Twilio pricing
      isBeta: num.beta || false,
      emergencyCapable: true,
      sid: num.sid,
      priceUnit: 'USD'
    })) || [];

    res.json({
      success: true,
      available_phone_numbers: transformedNumbers,
      count: transformedNumbers.length,
      country: countryCode,
      type: type
    });

  } catch (error) {
    console.error('❌ Error searching phone numbers:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.message || error.message,
      details: error.response?.data || 'Internal server error'
    });
  }
});

// Route: Purchase Phone Number
app.post('/api/twilio/purchase-number', async (req, res) => {
  try {
    const {
      phoneNumber,
      friendlyName,
      voiceUrl,
      smsUrl,
      statusCallback
    } = req.body;

    console.log('💰 Purchasing phone number:', phoneNumber);

    const purchaseData = {
      PhoneNumber: phoneNumber,
      FriendlyName: friendlyName || `Vocilio Number ${phoneNumber}`
    };

    if (voiceUrl) purchaseData.VoiceUrl = voiceUrl;
    if (smsUrl) purchaseData.SmsUrl = smsUrl;
    if (statusCallback) purchaseData.StatusCallback = statusCallback;

    const response = await twilioClient.post(
      `/Accounts/${TWILIO_ACCOUNT_SID}/IncomingPhoneNumbers.json`,
      toUrlEncoded(purchaseData)
    );

    console.log('✅ Phone number purchased successfully:', response.data.sid);

    res.json({
      success: true,
      phoneNumber: response.data,
      message: `Successfully purchased ${phoneNumber}`
    });

  } catch (error) {
    console.error('❌ Error purchasing phone number:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.message || error.message,
      details: error.response?.data || 'Internal server error'
    });
  }
});

// Route: List Owned Phone Numbers
app.get('/api/twilio/phone-numbers', async (req, res) => {
  try {
    console.log('📱 Fetching owned phone numbers...');

    const response = await twilioClient.get(
      `/Accounts/${TWILIO_ACCOUNT_SID}/IncomingPhoneNumbers.json`
    );

    const phoneNumbers = response.data.incoming_phone_numbers?.map(num => ({
      sid: num.sid,
      number: num.phone_number,
      friendlyName: num.friendly_name,
      capabilities: {
        voice: num.capabilities?.voice !== false,
        sms: num.capabilities?.sms !== false,
        mms: num.capabilities?.mms !== false
      },
      voiceUrl: num.voice_url,
      smsUrl: num.sms_url,
      dateCreated: num.date_created,
      dateUpdated: num.date_updated
    })) || [];

    res.json({
      success: true,
      phone_numbers: phoneNumbers,
      count: phoneNumbers.length
    });

  } catch (error) {
    console.error('❌ Error fetching phone numbers:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.message || error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Twilio Proxy Server',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('💥 Server Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Twilio Proxy Server running on http://localhost:${PORT}`);
  console.log('📡 Available endpoints:');
  console.log('  GET /api/twilio/available-numbers/:countryCode');
  console.log('  POST /api/twilio/purchase-number');
  console.log('  GET /api/twilio/phone-numbers');
  console.log('  GET /api/health');
});

module.exports = app;
