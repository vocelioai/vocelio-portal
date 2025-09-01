// TypeScript types for Phone Number Service integration
// Based on your production API documentation

export interface PhoneNumber {
  phone_number: string;
  friendly_name: string;
  locality: string;
  region: string;
  iso_country: string;
  capabilities: {
    voice: boolean;
    SMS: boolean;
    MMS: boolean;
  };
}

export interface OwnedPhoneNumber {
  phone_number: string;
  sid: string;
  friendly_name: string;
  voice_url: string;
  sms_url: string | null;
  status: string;
  capabilities: {
    voice: boolean;
    SMS: boolean;
    MMS: boolean;
  };
  date_created: string | null;
}

export interface NumberSearchRequest {
  country?: string;
  area_code?: string;
  contains?: string;
  limit?: number;
}

export interface NumberSearchResponse {
  available_numbers: PhoneNumber[];
  count: number;
  search_params: Record<string, any>;
}

export interface NumberPurchaseRequest {
  phone_number: string;
  friendly_name?: string;
  voice_url?: string;
  sms_url?: string;
}

export interface NumberPurchaseResponse {
  success: boolean;
  phone_number: string;
  sid: string;
  friendly_name: string;
  voice_url: string;
  status: string;
  purchased_at: string;
}

export interface OwnedNumbersResponse {
  phone_numbers: OwnedPhoneNumber[];
  count: number;
}

export interface NumberReleaseResponse {
  success: boolean;
  phone_number: string;
  sid: string;
  message: string;
  released_at: string;
}

export interface PricingInfo {
  country: string;
  iso_country: string;
  phone_number_prices: Array<{
    number_type: string;
    base_price: string;
    current_price: string;
  }>;
}

export interface PhoneServiceHealth {
  status: string;
  service: string;
  timestamp: string;
  twilio_connected: boolean;
}

// API endpoints constants
export const PHONE_SERVICE_ENDPOINTS = {
  SEARCH: '/api/numbers/search',
  BUY: '/api/numbers/buy',
  LIST: '/api/numbers',
  RELEASE: '/api/numbers/{sid}/release',
  PRICING: '/api/numbers/pricing',
  HEALTH: '/health'
} as const;

export const DEFAULT_SEARCH_PARAMS: NumberSearchRequest = {
  country: 'US',
  limit: 20
};

// Popular US Area Codes for quick selection
export const US_AREA_CODES = [
  { code: '212', city: 'New York, NY' },
  { code: '415', city: 'San Francisco, CA' },
  { code: '310', city: 'Los Angeles, CA' },
  { code: '312', city: 'Chicago, IL' },
  { code: '713', city: 'Houston, TX' },
  { code: '404', city: 'Atlanta, GA' },
  { code: '617', city: 'Boston, MA' },
  { code: '206', city: 'Seattle, WA' },
  { code: '305', city: 'Miami, FL' },
  { code: '702', city: 'Las Vegas, NV' }
];

// Utility functions
export const PhoneUtils = {
  formatPhoneNumber: (number: string): string => {
    // Format +18005551234 as (800) 555-1234
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const areaCode = cleaned.slice(1, 4);
      const exchange = cleaned.slice(4, 7);
      const subscriber = cleaned.slice(7);
      return `(${areaCode}) ${exchange}-${subscriber}`;
    }
    return number;
  },

  isValidUSNumber: (number: string): boolean => {
    const cleaned = number.replace(/\D/g, '');
    return cleaned.length === 11 && cleaned.startsWith('1');
  },

  getNumberCost: (pricing: PricingInfo, numberType: string = 'local'): string => {
    const price = pricing.phone_number_prices.find(p => p.number_type === numberType);
    return price?.current_price || '1.00';
  }
};
