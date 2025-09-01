// Twilio API Integration Library for Vocilio Portal
import axios from 'axios';

class TwilioAPI {
  constructor() {
    // Use your phone number service directly now that CORS is configured
    this.baseURL = import.meta.env.VITE_PHONE_NUMBER_SERVICE_URL || 
                   'https://phone-number-service-mqe4lv42za-uc.a.run.app';
    
    console.log('🔧 Twilio API Configuration (direct to phone service):', {
      baseURL: this.baseURL
    });
    
    // Create axios instance for direct connection to your phone service
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        if (import.meta.env.DEV) {
          console.log('🚀 Twilio API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            data: config.data
          });
        }
        return config;
      },
      (error) => {
        console.error('❌ Twilio Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        if (import.meta.env.DEV) {
          console.log('✅ Twilio API Response:', {
            status: response.status,
            data: response.data
          });
        }
        return response;
      },
      (error) => {
        console.error('❌ Twilio API Error:', {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data
        });
        return Promise.reject(this.enhanceError(error));
      }
    );
  }

  // Enhanced error handling
  enhanceError(error) {
    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    }
    if (error.response?.data?.more_info) {
      error.moreInfo = error.response.data.more_info;
    }
    return error;
  }

  // Convert object to URL encoded string for Twilio API
  toUrlEncoded(obj) {
    return Object.keys(obj)
      .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]))
      .join('&');
  }

  /**
   * Search for available phone numbers using your phone service directly
   * @param {string} countryCode - ISO country code (e.g., 'US', 'CA', 'GB')
   * @param {object} options - Search options
   * @returns {Promise} - Promise resolving to available numbers
   */
  async searchAvailableNumbers(countryCode = 'US', options = {}) {
    try {
      console.log('🔍 Searching available numbers via phone service:', { countryCode, options });

      // Build query parameters matching your backend API
      const queryParams = new URLSearchParams();
      
      queryParams.append('country', countryCode);
      if (options.AreaCode) queryParams.append('area_code', options.AreaCode);
      if (options.Contains) queryParams.append('contains', options.Contains);
      if (options.PageSize) queryParams.append('limit', options.PageSize.toString());

      // Direct call to your phone number service
      const response = await this.client.get(
        `/api/numbers/search?${queryParams.toString()}`
      );

      console.log('✅ Received LIVE data from phone service:', response.data);

      // Transform your backend response to match frontend expectations
      if (response.data && response.data.available_numbers) {
        const transformedNumbers = response.data.available_numbers.map(num => ({
          number: num.phone_number,
          friendlyName: num.friendly_name,
          type: options.type || 'Local',
          location: `${num.locality || ''}, ${num.region || ''} ${num.iso_country || ''}`.trim(),
          capabilities: {
            voice: num.capabilities?.voice || false,
            sms: num.capabilities?.SMS || false,
            mms: num.capabilities?.MMS || false,
            fax: false
          },
          addressRequirement: 'none',
          monthlyFee: '$1.00', // Your backend shows $1.00 base price
          isBeta: false,
          emergencyCapable: true,
          sid: `search_${Math.random().toString(36).substring(2, 15)}`, // Temporary for search results
          priceUnit: 'USD'
        }));

        return {
          success: true,
          available_phone_numbers: transformedNumbers,
          count: transformedNumbers.length,
          country: countryCode,
          type: options.type || 'Local'
        };
      }

      return response.data;
      
    } catch (error) {
      console.error('❌ Error searching numbers via phone service:', error);
      console.error('❌ CORS Error Details:', error.response?.status, error.response?.data);
      throw error;
    }
  }

  /**
   * Purchase a phone number
   * @param {string} phoneNumber - The phone number to purchase (E.164 format)
   * @param {object} options - Purchase options
   * @returns {Promise} - Promise resolving to purchase result
   */
  /**
   * Purchase a phone number using your phone service directly
   * @param {string} phoneNumber - The phone number to purchase (E.164 format)
   * @param {object} options - Purchase options
   * @returns {Promise} - Promise resolving to purchase result
   */
  async purchaseNumber(phoneNumber, options = {}) {
    try {
      console.log('💰 Purchasing number via phone service:', { phoneNumber, options });

      const purchaseData = {
        phone_number: phoneNumber,
        friendly_name: options.friendlyName || `Vocilio Number ${phoneNumber}`,
        voice_url: options.voiceUrl || 'https://telephony-adapter-mqe4lv42za-uc.a.run.app/webhook/inbound',
        sms_url: options.smsUrl
      };

      const response = await this.client.post(
        '/api/numbers/buy',
        purchaseData
      );

      console.log('✅ Number purchased LIVE via phone service:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error purchasing number via phone service:', error);
      throw error;
    }
  }

  /**
   * Get all owned phone numbers from your phone service directly
   * @param {object} options - Filter options
   * @returns {Promise} - Promise resolving to owned numbers
   */
  async getOwnedNumbers(options = {}) {
    try {
      console.log('📱 Fetching owned numbers from phone service...');
      
      const response = await this.client.get('/api/numbers');

      console.log('✅ Received LIVE owned numbers:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching owned numbers from phone service:', error);
      throw error;
    }
  }

  /**
   * Release a phone number using your production API
   * @param {string} numberSid - The SID of the phone number to release
   * @returns {Promise} - Promise resolving to release result
   */
  async releaseNumber(numberSid) {
    try {
      console.log('📞 Releasing number:', numberSid);

      const response = await this.client.delete(
        `/api/numbers/${numberSid}/release`
      );

      console.log('✅ Number released successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error releasing number:', error);
      throw error;
    }
  }

  /**
   * Get pricing information from your production API
   * @param {string} countryCode - Country code for pricing
   * @returns {Promise} - Promise resolving to pricing info
   */
  async getPricing(countryCode = 'US') {
    try {
      console.log('💰 Getting pricing for:', countryCode);

      const response = await this.client.get(
        `/api/numbers/pricing?country=${countryCode}`
      );

      console.log('✅ Pricing info received:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error getting pricing:', error);
      throw error;
    }
  }

  /**
   * Check service health
   * @returns {Promise} - Promise resolving to health status
   */
  async checkHealth() {
    try {
      const response = await this.client.get('/health');
      console.log('✅ Service health:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Service health check failed:', error);
      throw error;
    }
  }

  /**
   * Update phone number configuration
   * @param {string} numberSid - The SID of the phone number
   * @param {object} updates - Update data
   * @returns {Promise} - Promise resolving to update result
   */
  async updateNumber(numberSid, updates = {}) {
    try {
      console.log('🔧 Updating number:', { numberSid, updates });

      const response = await this.client.post(
        `/Accounts/${this.accountSid}/IncomingPhoneNumbers/${numberSid}.json`,
        this.toUrlEncoded(updates)
      );

      return response.data;
    } catch (error) {
      console.error('❌ Error updating number:', error);
      throw error;
    }
  }

  /**
   * Get account information
   * @returns {Promise} - Promise resolving to account info
   */
  async getAccountInfo() {
    try {
      const response = await this.client.get(`/Accounts/${this.accountSid}.json`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching account info:', error);
      throw error;
    }
  }

  /**
   * Get available countries for phone numbers
   * @returns {Promise} - Promise resolving to available countries
   */
  async getAvailableCountries() {
    try {
      const response = await this.client.get(
        `/Accounts/${this.accountSid}/AvailablePhoneNumbers.json`
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching available countries:', error);
      throw error;
    }
  }

  /**
   * Check if the API credentials are valid
   * @returns {Promise<boolean>} - Promise resolving to validation result
   */
  async validateCredentials() {
    try {
      await this.getAccountInfo();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get pricing information for a country
   * @param {string} countryCode - ISO country code
   * @returns {Promise} - Promise resolving to pricing info
   */
  async getPricing(countryCode = 'US') {
    try {
      const response = await this.client.get(
        `/Accounts/${this.accountSid}/Pricing/v2/PhoneNumbers/Countries/${countryCode}.json`
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching pricing:', error);
      throw error;
    }
  }
}

// Create singleton instance
const twilioAPI = new TwilioAPI();

export default twilioAPI;
