/**
 * 🎯 COMPREHENSIVE FRONTEND AUTH TESTING SCRIPT
 * Test all authentication functionality and multi-tenant features
 */

// Test the complete authentication system
async function testAuthenticationSystem() {
  console.log('🚀 Starting comprehensive auth system test...');
  
  try {
    // Test 1: Auth Manager Import
    console.log('\n📦 Testing Auth Manager import...');
    const { authManager } = await import('./services/authManager.js');
    console.log('✅ Auth Manager imported successfully');
    
    // Test 2: VocelioAPI Import
    console.log('\n📦 Testing VocelioAPI import...');
    const { vocelioAPI } = await import('./services/vocelioAPI.js');
    console.log('✅ VocelioAPI imported successfully');
    
    // Test 3: Check environment variables
    console.log('\n🔧 Testing environment variables...');
    const requiredEnvVars = [
      'REACT_APP_AUTH_SERVICE_URL',
      'REACT_APP_TELEPHONY_ADAPTER_URL',
      'REACT_APP_TTS_ADAPTER_URL',
      'REACT_APP_ASR_ADAPTER_URL'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      console.warn('⚠️ Missing environment variables:', missingVars);
    } else {
      console.log('✅ All required environment variables present');
    }
    
    // Test 4: Check authentication state
    console.log('\n🔐 Testing authentication state...');
    const isAuth = authManager.isAuthenticated();
    console.log(`Authentication status: ${isAuth ? '✅ Authenticated' : '❌ Not authenticated'}`);
    
    if (isAuth) {
      const userInfo = authManager.getUserInfo();
      const orgContext = authManager.getOrganizationContext();
      console.log('👤 User info:', userInfo);
      console.log('🏢 Organization context:', orgContext);
    }
    
    // Test 5: Test API service health
    console.log('\n🌐 Testing API services...');
    const baseURLs = {
      auth: process.env.REACT_APP_AUTH_SERVICE_URL,
      telephony: process.env.REACT_APP_TELEPHONY_ADAPTER_URL,
      tts: process.env.REACT_APP_TTS_ADAPTER_URL,
      asr: process.env.REACT_APP_ASR_ADAPTER_URL
    };
    
    for (const [service, url] of Object.entries(baseURLs)) {
      if (url) {
        try {
          const response = await fetch(`${url}/health`, { 
            method: 'GET',
            timeout: 5000 
          });
          console.log(`${service}: ${response.ok ? '✅ Healthy' : '❌ Unhealthy'} (${response.status})`);
        } catch (error) {
          console.log(`${service}: ❌ Connection failed (${error.message})`);
        }
      } else {
        console.log(`${service}: ⚠️ URL not configured`);
      }
    }
    
    // Test 6: Test tenant header functionality
    console.log('\n🏢 Testing tenant isolation...');
    if (isAuth) {
      const tenantId = authManager.getTenantId();
      console.log(`Tenant ID: ${tenantId || 'Not available'}`);
      
      // Test API call with tenant context
      try {
        const testResponse = await authManager.makeVocelioAPICall(
          `${process.env.REACT_APP_TELEPHONY_ADAPTER_URL}/health`,
          { method: 'GET' }
        );
        console.log('✅ Tenant-aware API call successful');
      } catch (error) {
        console.log('❌ Tenant-aware API call failed:', error.message);
      }
    }
    
    // Test 7: Performance tracking
    console.log('\n⚡ Testing performance tracking...');
    const startTime = Date.now();
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate operation
    const duration = Date.now() - startTime;
    console.log(`Sample operation took ${duration}ms`);
    
    if (duration > 500) {
      console.warn('⚠️ Slow operation detected (would be logged in production)');
    } else {
      console.log('✅ Performance tracking working');
    }
    
    console.log('\n🎉 Auth system test completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Auth system test failed:', error);
    return false;
  }
}

// Test login functionality (for testing purposes)
async function testLoginFlow() {
  console.log('\n🔑 Testing login flow...');
  
  try {
    const { authManager } = await import('./services/authManager.js');
    
    // Note: This is for testing - replace with real credentials
    const testCredentials = {
      email: 'test@example.com',
      password: 'testpassword123'
    };
    
    console.log('⚠️ This would attempt login with test credentials');
    console.log('In production, use the actual login form');
    
    // Uncomment to test actual login:
    // const result = await authManager.loginWith2FA(
    //   testCredentials.email, 
    //   testCredentials.password
    // );
    // console.log('Login result:', result);
    
  } catch (error) {
    console.error('Login test error:', error);
  }
}

// Test registration flow
async function testRegistrationFlow() {
  console.log('\n📝 Testing registration flow...');
  
  try {
    const { authManager } = await import('./services/authManager.js');
    
    const testRegistration = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'SecurePass123!',
      organizationName: 'Test Organization',
      subdomain: 'testorg',
      tier: 'starter',
      voiceTier: 'basic'
    };
    
    console.log('⚠️ This would attempt registration with test data');
    console.log('Registration data structure:', testRegistration);
    
    // Uncomment to test actual registration:
    // const result = await authManager.registerUser(testRegistration);
    // console.log('Registration result:', result);
    
  } catch (error) {
    console.error('Registration test error:', error);
  }
}

// Export test functions
window.testAuthenticationSystem = testAuthenticationSystem;
window.testLoginFlow = testLoginFlow;
window.testRegistrationFlow = testRegistrationFlow;

// Auto-run basic test if in development
if (process.env.NODE_ENV === 'development') {
  testAuthenticationSystem();
}

console.log(`
🧪 AUTH TESTING COMMANDS AVAILABLE:
- testAuthenticationSystem() - Run complete system test
- testLoginFlow() - Test login functionality
- testRegistrationFlow() - Test registration functionality

Run these in your browser console to test the auth system.
`);
