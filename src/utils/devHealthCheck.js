// ===== Development Health Check =====
// Test script to verify mock API and services are working

import { getCurrentConfig } from '../config/environment.js';

const config = getCurrentConfig();

export class DevHealthCheck {
  static async runHealthCheck() {
    console.log('🏥 Running development health check...');
    console.log('📊 Environment:', config.APP_ENV);
    console.log('🔧 Mock Data Enabled:', config.USE_MOCK_DATA);
    
    const results = {
      environment: config.APP_ENV,
      mockDataEnabled: config.USE_MOCK_DATA,
      tests: []
    };

    // Test 1: Environment Configuration
    try {
      console.log('✅ Environment configuration loaded successfully');
      results.tests.push({ name: 'Environment Config', status: 'PASS' });
    } catch (error) {
      console.error('❌ Environment configuration failed:', error);
      results.tests.push({ name: 'Environment Config', status: 'FAIL', error: error.message });
    }

    // Test 2: Mock API Endpoints
    const endpoints = [
      '/api/dashboard/stats',
      '/api/calls/live',
      '/api/campaigns/active',
      '/api/analytics/overview'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`http://localhost:3000${endpoint}`);
        const data = await response.json();
        
        if (response.ok && data) {
          console.log(`✅ Mock API ${endpoint}: OK`);
          results.tests.push({ name: `Mock API ${endpoint}`, status: 'PASS' });
        } else {
          console.warn(`⚠️ Mock API ${endpoint}: Invalid response`);
          results.tests.push({ name: `Mock API ${endpoint}`, status: 'WARN' });
        }
      } catch (error) {
        console.error(`❌ Mock API ${endpoint}: ${error.message}`);
        results.tests.push({ name: `Mock API ${endpoint}`, status: 'FAIL', error: error.message });
      }
    }

    // Test 3: WebSocket Mock
    try {
      if (window.WebSocket) {
        console.log('✅ WebSocket constructor available');
        results.tests.push({ name: 'WebSocket Support', status: 'PASS' });
      } else {
        console.warn('⚠️ WebSocket not supported');
        results.tests.push({ name: 'WebSocket Support', status: 'WARN' });
      }
    } catch (error) {
      console.error('❌ WebSocket test failed:', error);
      results.tests.push({ name: 'WebSocket Support', status: 'FAIL', error: error.message });
    }

    // Test 4: Local Storage
    try {
      localStorage.setItem('health-check', 'test');
      const value = localStorage.getItem('health-check');
      localStorage.removeItem('health-check');
      
      if (value === 'test') {
        console.log('✅ Local storage working');
        results.tests.push({ name: 'Local Storage', status: 'PASS' });
      } else {
        console.warn('⚠️ Local storage issue');
        results.tests.push({ name: 'Local Storage', status: 'WARN' });
      }
    } catch (error) {
      console.error('❌ Local storage failed:', error);
      results.tests.push({ name: 'Local Storage', status: 'FAIL', error: error.message });
    }

    // Summary
    const passed = results.tests.filter(t => t.status === 'PASS').length;
    const warned = results.tests.filter(t => t.status === 'WARN').length;
    const failed = results.tests.filter(t => t.status === 'FAIL').length;
    
    console.log(`\n🏥 Health Check Summary:`);
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ⚠️ Warnings: ${warned}`);
    console.log(`   ❌ Failed: ${failed}`);
    
    if (failed === 0) {
      console.log(`\n🎉 All systems operational! Development environment ready.`);
    } else {
      console.log(`\n🚨 ${failed} issues detected. Check the console for details.`);
    }

    return results;
  }

  static async testMockAPI() {
    console.log('🔧 Testing Mock API endpoints...');
    
    const tests = [
      {
        name: 'Dashboard Stats',
        url: '/api/dashboard/stats',
        expectedKeys: ['activeSessions', 'totalCalls', 'channels']
      },
      {
        name: 'Live Calls',
        url: '/api/calls/live',
        expectedKeys: ['length'] // Should be an array
      },
      {
        name: 'Analytics Overview',
        url: '/api/analytics/overview',
        expectedKeys: ['totalInteractions', 'trends']
      }
    ];

    for (const test of tests) {
      try {
        const response = await fetch(`http://localhost:3000${test.url}`);
        const data = await response.json();
        
        const hasExpectedKeys = test.expectedKeys.every(key => {
          return Array.isArray(data) ? data.hasOwnProperty(key) : (key in data || data.hasOwnProperty(key));
        });
        
        if (hasExpectedKeys) {
          console.log(`✅ ${test.name}: Data structure valid`);
        } else {
          console.warn(`⚠️ ${test.name}: Missing expected keys`, test.expectedKeys);
        }
      } catch (error) {
        console.error(`❌ ${test.name}: ${error.message}`);
      }
    }
  }
}

// Auto-run health check in development
if (config.DEBUG_MODE && typeof window !== 'undefined') {
  setTimeout(() => {
    DevHealthCheck.runHealthCheck();
  }, 2000); // Wait 2 seconds for app to initialize
}

export default DevHealthCheck;
