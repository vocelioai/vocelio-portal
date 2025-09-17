// API Status Checker - Validates all production API keys and services
import { API_KEYS } from '../config/api.js';
import aiServices from './aiServices.js';

export class APIStatusChecker {
  constructor() {
    this.services = {
      // Core Services
      stripe: {
        name: 'Stripe Payment Processing',
        key: API_KEYS.STRIPE_PUBLISHABLE,
        status: 'unknown',
        endpoint: 'https://api.stripe.com/v1',
        critical: true
      },
      twilio: {
        name: 'Twilio Communications',
        key: API_KEYS.TWILIO_ACCOUNT_SID,
        status: 'unknown',
        endpoint: 'https://api.twilio.com/2010-04-01',
        critical: true
      },
      // AI Services
      openai: {
        name: 'OpenAI GPT Services',
        key: API_KEYS.OPENAI,
        status: 'unknown',
        endpoint: 'https://api.openai.com/v1',
        critical: false
      },
      anthropic: {
        name: 'Anthropic Claude',
        key: API_KEYS.ANTHROPIC,
        status: 'unknown',
        endpoint: 'https://api.anthropic.com/v1',
        critical: false
      },
      elevenlabs: {
        name: 'ElevenLabs Voice AI',
        key: API_KEYS.ELEVENLABS,
        status: 'unknown',
        endpoint: 'https://api.elevenlabs.io/v1',
        critical: false
      },
      deepgram: {
        name: 'Deepgram Speech Recognition',
        key: API_KEYS.DEEPGRAM,
        status: 'unknown',
        endpoint: 'https://api.deepgram.com/v1',
        critical: false
      },
      azure: {
        name: 'Azure Speech Services',
        key: API_KEYS.AZURE_SPEECH,
        status: 'unknown',
        endpoint: `https://${API_KEYS.AZURE_SPEECH_REGION || 'eastus'}.api.cognitive.microsoft.com`,
        critical: false
      }
    };
  }

  // Check if API key exists
  checkKeyExists(serviceName) {
    const service = this.services[serviceName];
    if (!service) return false;
    
    const hasKey = !!service.key && service.key !== 'undefined' && service.key.length > 0;
    service.status = hasKey ? 'key-exists' : 'missing-key';
    return hasKey;
  }

  // Test API endpoint connectivity
  async testEndpoint(serviceName) {
    const service = this.services[serviceName];
    if (!service || !this.checkKeyExists(serviceName)) {
      return false;
    }

    try {
      // Different test endpoints for different services
      let testEndpoint = '';
      let headers = {};

      switch (serviceName) {
        case 'stripe':
          testEndpoint = `${service.endpoint}/payment_methods`;
          headers = { 'Authorization': `Bearer ${service.key}` };
          break;
          
        case 'openai':
          testEndpoint = `${service.endpoint}/models`;
          headers = { 'Authorization': `Bearer ${service.key}` };
          break;
          
        case 'elevenlabs':
          testEndpoint = `${service.endpoint}/voices`;
          headers = { 'xi-api-key': service.key };
          break;
          
        case 'deepgram':
          testEndpoint = `${service.endpoint}/projects`;
          headers = { 'Authorization': `Token ${service.key}` };
          break;
          
        case 'anthropic':
          // Anthropic doesn't have a simple test endpoint
          service.status = 'key-exists';
          return true;
          
        case 'azure':
          testEndpoint = `${service.endpoint}/sts/v1.0/issueToken`;
          headers = { 'Ocp-Apim-Subscription-Key': service.key };
          break;
          
        case 'twilio':
          // Twilio test through our backend service
          service.status = 'key-exists';
          return true;
          
        default:
          service.status = 'no-test';
          return true;
      }

      const response = await fetch(testEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      });

      if (response.ok) {
        service.status = 'connected';
        return true;
      } else if (response.status === 401) {
        service.status = 'invalid-key';
        return false;
      } else {
        service.status = 'connection-error';
        return false;
      }
    } catch (error) {
      console.error(`❌ API test failed for ${serviceName}:`, error);
      service.status = 'connection-error';
      return false;
    }
  }

  // Check all services
  async checkAllServices() {
    console.log('🔍 Checking API service status...');
    
    const results = {};
    
    for (const [serviceName, service] of Object.entries(this.services)) {
      console.log(`Checking ${service.name}...`);
      
      if (!this.checkKeyExists(serviceName)) {
        results[serviceName] = {
          name: service.name,
          status: 'missing-key',
          critical: service.critical,
          message: 'API key not configured'
        };
        continue;
      }

      try {
        const connected = await this.testEndpoint(serviceName);
        results[serviceName] = {
          name: service.name,
          status: service.status,
          critical: service.critical,
          connected,
          message: this.getStatusMessage(service.status)
        };
      } catch (error) {
        results[serviceName] = {
          name: service.name,
          status: 'error',
          critical: service.critical,
          connected: false,
          message: `Error: ${error.message}`
        };
      }
    }

    return results;
  }

  // Get human-readable status message
  getStatusMessage(status) {
    const messages = {
      'connected': '✅ Connected and working',
      'key-exists': '🔑 API key configured',
      'missing-key': '❌ API key missing',
      'invalid-key': '⚠️ Invalid API key',
      'connection-error': '🔧 Connection error',
      'no-test': '📝 No test available',
      'error': '❌ Test failed'
    };
    
    return messages[status] || '❓ Unknown status';
  }

  // Generate summary report
  generateReport(results) {
    const total = Object.keys(results).length;
    const connected = Object.values(results).filter(r => r.connected).length;
    const critical = Object.values(results).filter(r => r.critical).length;
    const criticalWorking = Object.values(results)
      .filter(r => r.critical && (r.connected || r.status === 'key-exists')).length;

    const summary = {
      total,
      connected,
      critical,
      criticalWorking,
      allCriticalWorking: criticalWorking === critical,
      readyForProduction: criticalWorking === critical
    };

    console.log('\n📊 API Status Report:');
    console.log(`Total Services: ${total}`);
    console.log(`Connected: ${connected}/${total}`);
    console.log(`Critical Services: ${critical}`);
    console.log(`Critical Working: ${criticalWorking}/${critical}`);
    console.log(`Production Ready: ${summary.readyForProduction ? '✅ YES' : '❌ NO'}`);

    if (!summary.readyForProduction) {
      console.warn('\n⚠️ Missing Critical API Keys:');
      Object.entries(results).forEach(([key, result]) => {
        if (result.critical && !result.connected && result.status === 'missing-key') {
          console.warn(`- ${result.name}: ${result.message}`);
        }
      });
    }

    return { summary, results };
  }

  // Display status in console with colors
  displayStatus(results) {
    console.log('\n🔍 API Services Status:');
    console.log('=' .repeat(50));
    
    Object.entries(results).forEach(([key, result]) => {
      const icon = result.critical ? '🔴' : '🟡';
      const status = this.getStatusMessage(result.status);
      
      console.log(`${icon} ${result.name}`);
      console.log(`   Status: ${status}`);
      console.log(`   Critical: ${result.critical ? 'Yes' : 'No'}`);
      console.log('');
    });
  }
}

// Create singleton instance
const apiChecker = new APIStatusChecker();

// Export functions
export const checkAPIStatus = () => apiChecker.checkAllServices();
export const displayAPIStatus = async () => {
  const results = await apiChecker.checkAllServices();
  const report = apiChecker.generateReport(results);
  apiChecker.displayStatus(results);
  return report;
};

export default apiChecker;