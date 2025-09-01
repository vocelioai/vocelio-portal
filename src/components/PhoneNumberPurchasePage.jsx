import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDown, Phone, MessageSquare, Mail, FileText, RefreshCw } from 'lucide-react';
import twilioAPI from '../lib/twilioAPI';

const PhoneNumberPurchasePage = () => {
  const [selectedCountry, setSelectedCountry] = useState('US (+1) United States - US');
  const [searchQuery, setSearchQuery] = useState('');
  const [matchCriteria, setMatchCriteria] = useState('First part of number');
  const [selectedCapabilities, setSelectedCapabilities] = useState({
    voice: true,
    sms: false,
    mms: false,
    fax: false
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  
  // API and data state - using singleton instance
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Advanced search filters
  const [numberTypes, setNumberTypes] = useState({
    local: true,
    mobile: true,
    tollFree: true
  });
  const [addressRequirement, setAddressRequirement] = useState('Any');
  const [excludeBeta, setExcludeBeta] = useState(false);
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Comprehensive list of countries where Twilio offers phone numbers
  const availableCountries = [
    { code: 'AD', name: 'Andorra', dialCode: '+376' },
    { code: 'AR', name: 'Argentina', dialCode: '+54' },
    { code: 'AU', name: 'Australia', dialCode: '+61' },
    { code: 'AT', name: 'Austria', dialCode: '+43' },
    { code: 'BE', name: 'Belgium', dialCode: '+32' },
    { code: 'BZ', name: 'Belize', dialCode: '+501' },
    { code: 'BR', name: 'Brazil', dialCode: '+55' },
    { code: 'BG', name: 'Bulgaria', dialCode: '+359' },
    { code: 'CA', name: 'Canada', dialCode: '+1' },
    { code: 'CL', name: 'Chile', dialCode: '+56' },
    { code: 'CO', name: 'Colombia', dialCode: '+57' },
    { code: 'CR', name: 'Costa Rica', dialCode: '+506' },
    { code: 'HR', name: 'Croatia', dialCode: '+385' },
    { code: 'CY', name: 'Cyprus', dialCode: '+357' },
    { code: 'CZ', name: 'Czech Republic', dialCode: '+420' },
    { code: 'DK', name: 'Denmark', dialCode: '+45' },
    { code: 'DO', name: 'Dominican Republic', dialCode: '+1' },
    { code: 'EE', name: 'Estonia', dialCode: '+372' },
    { code: 'FI', name: 'Finland', dialCode: '+358' },
    { code: 'FR', name: 'France', dialCode: '+33' },
    { code: 'GE', name: 'Georgia', dialCode: '+995' },
    { code: 'DE', name: 'Germany', dialCode: '+49' },
    { code: 'GR', name: 'Greece', dialCode: '+30' },
    { code: 'HK', name: 'Hong Kong', dialCode: '+852' },
    { code: 'HU', name: 'Hungary', dialCode: '+36' },
    { code: 'IS', name: 'Iceland', dialCode: '+354' },
    { code: 'IN', name: 'India', dialCode: '+91' },
    { code: 'ID', name: 'Indonesia', dialCode: '+62' },
    { code: 'IE', name: 'Ireland', dialCode: '+353' },
    { code: 'IL', name: 'Israel', dialCode: '+972' },
    { code: 'IT', name: 'Italy', dialCode: '+39' },
    { code: 'JP', name: 'Japan', dialCode: '+81' },
    { code: 'KE', name: 'Kenya', dialCode: '+254' },
    { code: 'KR', name: 'South Korea', dialCode: '+82' },
    { code: 'LV', name: 'Latvia', dialCode: '+371' },
    { code: 'LT', name: 'Lithuania', dialCode: '+370' },
    { code: 'LU', name: 'Luxembourg', dialCode: '+352' },
    { code: 'MY', name: 'Malaysia', dialCode: '+60' },
    { code: 'MT', name: 'Malta', dialCode: '+356' },
    { code: 'MX', name: 'Mexico', dialCode: '+52' },
    { code: 'NL', name: 'Netherlands', dialCode: '+31' },
    { code: 'NZ', name: 'New Zealand', dialCode: '+64' },
    { code: 'NG', name: 'Nigeria', dialCode: '+234' },
    { code: 'NO', name: 'Norway', dialCode: '+47' },
    { code: 'PA', name: 'Panama', dialCode: '+507' },
    { code: 'PE', name: 'Peru', dialCode: '+51' },
    { code: 'PH', name: 'Philippines', dialCode: '+63' },
    { code: 'PL', name: 'Poland', dialCode: '+48' },
    { code: 'PT', name: 'Portugal', dialCode: '+351' },
    { code: 'PR', name: 'Puerto Rico', dialCode: '+1' },
    { code: 'RO', name: 'Romania', dialCode: '+40' },
    { code: 'SG', name: 'Singapore', dialCode: '+65' },
    { code: 'SK', name: 'Slovakia', dialCode: '+421' },
    { code: 'SI', name: 'Slovenia', dialCode: '+386' },
    { code: 'ZA', name: 'South Africa', dialCode: '+27' },
    { code: 'ES', name: 'Spain', dialCode: '+34' },
    { code: 'SE', name: 'Sweden', dialCode: '+46' },
    { code: 'CH', name: 'Switzerland', dialCode: '+41' },
    { code: 'TW', name: 'Taiwan', dialCode: '+886' },
    { code: 'TH', name: 'Thailand', dialCode: '+66' },
    { code: 'TT', name: 'Trinidad and Tobago', dialCode: '+1' },
    { code: 'GB', name: 'United Kingdom', dialCode: '+44' },
    { code: 'US', name: 'United States', dialCode: '+1' },
    { code: 'UY', name: 'Uruguay', dialCode: '+598' },
    { code: 'VE', name: 'Venezuela', dialCode: '+58' }
  ];

  // Load phone numbers from Twilio API
  const loadPhoneNumbers = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Extract country code properly - format is "Country Name - XX"
      const countryParts = selectedCountry.split(' - ');
      const country = countryParts.length > 1 ? countryParts[1] : 'US';
      
      const searchOptions = {
        limit: pageSize,
      };
      
      // Add search criteria
      if (searchQuery && searchQuery.trim()) {
        const cleanSearch = searchQuery.replace(/[^\d]/g, '');
        
        if (matchCriteria === 'First part of number' && cleanSearch.length >= 3) {
          // For area code search, use the first 3 digits
          searchOptions.AreaCode = cleanSearch.substring(0, 3);
        } else if (matchCriteria === 'Contains' && cleanSearch.length > 0) {
          // For contains search, use the clean digits
          searchOptions.Contains = cleanSearch;
        } else if (matchCriteria === 'Ends with' && cleanSearch.length > 0) {
          // For ends with, we'll use contains for now as Twilio doesn't have "ends with"
          searchOptions.Contains = cleanSearch;
        }
      }
      
      // Determine number type based on filters
      let numberType = 'Local';
      if (!numberTypes.local && numberTypes.mobile) {
        numberType = 'Mobile';
      } else if (!numberTypes.local && !numberTypes.mobile && numberTypes.tollFree) {
        numberType = 'TollFree';
      }
      
      searchOptions.type = numberType;
      
      const response = await twilioAPI.searchAvailableNumbers(country, searchOptions);
      
      // Check both possible response formats from backend
      let numbersArray = null;
      if (response && response.available_phone_numbers) {
        numbersArray = response.available_phone_numbers;
      } else if (response && response.available_numbers) {
        numbersArray = response.available_numbers;
      }
      
      if (numbersArray && numbersArray.length > 0) {
        // Transform backend API response to our format
        const transformedNumbers = numbersArray.map((num, index) => {
          const phoneNumber = num.phone_number || num.phoneNumber || num.number || 'NO_PHONE_NUMBER';
          const friendlyName = num.friendly_name || num.friendlyName || phoneNumber;
          
          return {
            number: phoneNumber,
            friendlyName: friendlyName,
            type: numberType || 'Local',
            location: `${num.locality || ''}, ${num.region || ''} ${num.iso_country || ''}`.trim(),
            capabilities: {
              voice: num.capabilities?.voice || true,
              sms: num.capabilities?.SMS || num.capabilities?.sms || true,
              mms: num.capabilities?.MMS || num.capabilities?.mms || false,
              fax: false
            },
            addressRequirement: 'None',
            monthlyFee: `$1.00`,
            isBeta: num.beta || false,
            emergencyCapable: true,
            sid: num.sid || `temp_${Math.random().toString(36).substring(2, 15)}`,
            priceUnit: 'USD'
          };
        });
        
        setPhoneNumbers(transformedNumbers);
      } else {
        setPhoneNumbers([]);
      }
      
    } catch (error) {
      console.error('❌ Error loading phone numbers:', error);
      setError(error.message);
      setPhoneNumbers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load numbers on component mount and when filters change
  useEffect(() => {
    loadPhoneNumbers();
  }, [selectedCountry, searchQuery, matchCriteria, numberTypes, pageSize]);

  // Purchase a phone number
  const purchaseNumber = async (phoneNumber, friendlyName = '') => {
    try {
      setIsLoading(true);
      
      const purchaseOptions = {
        friendlyName: friendlyName || `Number ${phoneNumber}`,
        voiceUrl: import.meta.env.VITE_VOICE_WEBHOOK_URL || process.env.REACT_APP_VOICE_WEBHOOK_URL,
        smsUrl: import.meta.env.VITE_SMS_WEBHOOK_URL || process.env.REACT_APP_SMS_WEBHOOK_URL
      };
      
      const result = await twilioAPI.purchaseNumber(phoneNumber, purchaseOptions);
      
      if (result && result.sid) {
        alert(`✅ Successfully purchased ${phoneNumber}!`);
        // Reload numbers to show updated list
        await loadPhoneNumbers();
      } else {
        throw new Error('Purchase failed - no SID returned');
      }
      
    } catch (error) {
      console.error('❌ Error purchasing phone number:', error);
      alert(`❌ Failed to purchase ${phoneNumber}: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNumbers = useMemo(() => {
    return phoneNumbers.filter(num => {
      // Capability filters
      if (selectedCapabilities.voice && !num.capabilities.voice) return false;
      if (selectedCapabilities.sms && !num.capabilities.sms) return false;
      if (selectedCapabilities.mms && !num.capabilities.mms) return false;
      if (selectedCapabilities.fax && !num.capabilities.fax) return false;

      // Address requirement filter (Advanced)
      if (addressRequirement !== 'Any') {
        if (addressRequirement === 'None' && num.addressRequirement !== 'None') return false;
        if (addressRequirement === 'Exclude local requirements' && num.addressRequirement === 'Local') return false;
        if (addressRequirement === 'Exclude foreign requirements' && num.addressRequirement === 'Foreign') return false;
      }

      // Beta numbers filter (Advanced)
      if (excludeBeta && num.isBeta) return false;

      // Emergency calling filter (Advanced)
      if (emergencyOnly && !num.emergencyCapable) return false;

      return true;
    });
  }, [phoneNumbers, selectedCapabilities, addressRequirement, excludeBeta, emergencyOnly]);

  // Pagination logic
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedNumbers = filteredNumbers.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredNumbers.length / pageSize);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setLastRefresh(new Date());
    await loadPhoneNumbers();
    setIsRefreshing(false);
  };

  const handleCapabilityChange = (capability) => {
    setSelectedCapabilities(prev => ({
      ...prev,
      [capability]: !prev[capability]
    }));
  };

  const CapabilityIcon = ({ type, enabled }) => {
    const icons = {
      voice: Phone,
      sms: MessageSquare,
      mms: Mail,
      fax: FileText
    };
    const Icon = icons[type];
    return (
      <div className={`p-2 rounded ${enabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
        <Icon size={16} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading phone numbers
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {error}
                </div>
                <div className="mt-4">
                  <button
                    onClick={loadPhoneNumbers}
                    className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && phoneNumbers.length === 0 && (
          <div className="text-center py-12">
            <RefreshCw className="mx-auto h-12 w-12 text-blue-600 animate-spin mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading phone numbers...</h3>
            <p className="text-gray-500">Searching Twilio for available numbers</p>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900">Buy a Number</h1>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border transition-all ${
                isRefreshing || isLoading
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
              }`}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          <button className="text-blue-600 hover:text-blue-800 font-medium">
            Can't find a number?
          </button>
        </div>

        {/* Main Content - Only show when not in initial loading state */}
        {!(isLoading && phoneNumbers.length === 0) && (
          <>
            {/* Country Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
            <div className="relative">
              <select 
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-900"
              >
                {availableCountries.map((country) => (
                  <option key={country.code} value={`${country.code} (${country.dialCode}) ${country.name} - ${country.code}`} className="text-gray-900 bg-white">
                    {country.code} ({country.dialCode}) {country.name} - {country.code}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Capabilities */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Capabilities</label>
            <div className="flex gap-4">
              {[
                { key: 'voice', label: 'Voice', icon: 'voice' },
                { key: 'sms', label: 'SMS', icon: 'sms' },
                { key: 'mms', label: 'MMS', icon: 'mms' },
                { key: 'fax', label: 'Fax', icon: 'fax' }
              ].map(({ key, label, icon }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCapabilities[key]}
                    onChange={() => handleCapabilityChange(key)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Search Criteria - Two Row Layout */}
          <div className="space-y-4 mb-6">
            {/* First Row: Search Criteria and Match To */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search criteria</label>
                <select className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900">
                  <option className="text-gray-900 bg-white">Number</option>
                  <option className="text-gray-900 bg-white">Area Code</option>
                  <option className="text-gray-900 bg-white">City</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Match to</label>
                <select 
                  value={matchCriteria}
                  onChange={(e) => setMatchCriteria(e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                >
                  <option className="text-gray-900 bg-white">First part of number</option>
                  <option className="text-gray-900 bg-white">Contains</option>
                  <option className="text-gray-900 bg-white">Ends with</option>
                </select>
              </div>
            </div>
            
            {/* Second Row: Search Input and Buttons */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search query</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      loadPhoneNumbers();
                    }
                  }}
                  placeholder="Enter digits or phrases to search"
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                />
              </div>
              <div className="flex gap-2 items-end">
                <button 
                  onClick={loadPhoneNumbers}
                  disabled={isLoading}
                  className="h-10 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed font-medium whitespace-nowrap"
                >
                  {isLoading ? 'Searching...' : 'Search'}
                </button>
                {searchQuery && (
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      // The useEffect will automatically trigger loadPhoneNumbers when searchQuery changes
                    }}
                    className="h-10 px-4 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium whitespace-nowrap"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Search by area code, prefix, or characters you want in your phone number
          </p>

          {/* Advanced Search Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            Advanced Search
          </button>

          {/* Advanced Search Section */}
          {showAdvanced && (
            <div className="mt-6 space-y-6 border-t border-gray-200 pt-6">
              {/* Number Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Number type</label>
                <div className="flex gap-4">
                  {[
                    { key: 'local', label: 'Local' },
                    { key: 'mobile', label: 'Mobile' },
                    { key: 'tollFree', label: 'Toll-free' }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={numberTypes[key]}
                        onChange={(e) => setNumberTypes(prev => ({ ...prev, [key]: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Address Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address requirements
                  <span className="ml-1 text-gray-400 cursor-help" title="Some numbers require address verification">ⓘ</span>
                </label>
                <select 
                  value={addressRequirement}
                  onChange={(e) => setAddressRequirement(e.target.value)}
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                >
                  <option value="Any" className="text-gray-900 bg-white">Any</option>
                  <option value="None" className="text-gray-900 bg-white">None</option>
                  <option value="Exclude local requirements" className="text-gray-900 bg-white">Exclude local requirements</option>
                  <option value="Exclude foreign requirements" className="text-gray-900 bg-white">Exclude foreign requirements</option>
                </select>
              </div>

              {/* Beta Numbers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beta numbers
                  <span className="ml-1 text-gray-400 cursor-help" title="Beta numbers may have limited features">ⓘ</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={excludeBeta}
                    onChange={(e) => setExcludeBeta(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Exclude beta phone numbers in search results.</span>
                </label>
              </div>

              {/* Emergency Calling */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Calling</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emergencyOnly}
                    onChange={(e) => setEmergencyOnly(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Only include phone numbers capable of emergency calling.</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                    Capabilities
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                    Address Requirement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                    Monthly fee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedNumbers.map((number, index) => (
                  <tr key={index} className="hover:bg-gray-50 border-b border-gray-100">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span 
                          className="font-medium text-blue-600" 
                          style={{color: '#1d4ed8', fontWeight: '500', fontSize: '14px'}}
                        >
                          {number.number && number.number !== 'NO_PHONE_NUMBER' ? number.number : `[Number ${index + 1}]`}
                        </span>
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      </div>
                      <div 
                        className="text-sm font-medium text-gray-700" 
                        style={{color: '#374151', fontWeight: '500'}}
                      >
                        {number.location || 'Location N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span 
                          className="text-sm font-medium text-gray-800"
                          style={{color: '#1f2937', fontWeight: '500'}}
                        >
                          {number.type || 'Local'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <CapabilityIcon type="voice" enabled={number.capabilities.voice} />
                        <CapabilityIcon type="sms" enabled={number.capabilities.sms} />
                        <CapabilityIcon type="mms" enabled={number.capabilities.mms} />
                        <CapabilityIcon type="fax" enabled={number.capabilities.fax} />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className="text-sm font-medium text-gray-800"
                        style={{color: '#1f2937', fontWeight: '500'}}
                      >
                        {number.addressRequirement || 'None'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className="text-sm font-bold text-green-600"
                        style={{color: '#059669', fontWeight: '700', fontSize: '14px'}}
                      >
                        {number.monthlyFee || '$1.00'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => purchaseNumber(number.number, `${number.type} ${number.location}`)}
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{backgroundColor: '#2563eb', color: '#ffffff'}}
                      >
                        {isLoading ? 'Processing...' : 'Buy'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {paginatedNumbers.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Phone className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No numbers found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or filters</p>
              <div className="mt-4 text-xs text-gray-400">
                Debug: phoneNumbers.length = {phoneNumbers.length}, filteredNumbers.length = {filteredNumbers.length}
              </div>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {filteredNumbers.length > 0 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(endIndex, filteredNumbers.length)}</span> of{' '}
                  <span className="font-medium">{filteredNumbers.length}</span> results
                </p>
                <div className="ml-4 flex items-center gap-2">
                  <label className="text-sm text-gray-700">Show:</label>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  >
                    <option value={10} className="text-gray-900 bg-white">10</option>
                    <option value={20} className="text-gray-900 bg-white">20</option>
                    <option value={50} className="text-gray-900 bg-white">50</option>
                  </select>
                  <span className="text-sm text-gray-700">per page</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 text-sm font-medium rounded-md ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Info */}
        {filteredNumbers.length > 0 && (
          <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
            <span>Showing {filteredNumbers.length} available numbers</span>
            <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
};

export default PhoneNumberPurchasePage;
