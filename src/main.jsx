import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Initialize API services
import { validateAPIKeys } from './config/api.js'
import aiServices from './services/aiServices.js'
import { displayAPIStatus } from './services/apiStatusChecker.js'

// Comprehensive API validation on startup
const initializeApplication = async () => {
  console.log('🚀 Initializing Vocilio AI Dashboard...');
  
  // Validate critical API keys
  const apiKeysValid = validateAPIKeys();
  if (apiKeysValid) {
    console.log('✅ Critical API keys configured');
  } else {
    console.warn('⚠️ Some critical API keys missing');
  }
  
  // Initialize AI services
  const aiStatus = aiServices.initialize();
  console.log('🤖 AI Services initialized:', aiStatus);
  
  // Skip API status check in development to avoid CORS issues
  if (import.meta.env.DEV) {
    console.log('🔧 Development mode: Skipping external API checks to avoid CORS');
    window.vocelioAPIStatus = {
      summary: {
        readyForProduction: true,
        devMode: true
      },
      services: {}
    };
  } else {
    // Only run comprehensive API status check in production
    try {
      const statusReport = await displayAPIStatus();
      
      if (statusReport.summary.readyForProduction) {
        console.log('🎉 All critical services ready for production!');
      } else {
        console.warn('⚠️ Some critical services need attention');
      }
      
      // Store status for dashboard display
      window.vocelioAPIStatus = statusReport;
      
    } catch (error) {
      console.error('❌ API status check failed:', error);
      // Fallback status for failed checks
      window.vocelioAPIStatus = {
        summary: {
          readyForProduction: false,
          error: true
        },
        services: {}
      };
    }
  }
  
  console.log('✅ Application initialization complete');
};

// Initialize and render
initializeApplication();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
