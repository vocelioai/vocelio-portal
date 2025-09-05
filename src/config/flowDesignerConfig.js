// Enhanced Frontend API Configuration for Flow Designer
// Maps each node type to its required backend services

export const FLOW_DESIGNER_CONFIG = {
  // =============================================================================
  // 🎯 ESSENTIAL SERVICES (Always Required)
  // =============================================================================
  core: {
    flowDesigner: import.meta.env.VITE_FLOW_DESIGNER_URL,
    flowProcessor: import.meta.env.VITE_FLOW_PROCESSOR_URL,
    apiGateway: import.meta.env.VITE_API_GATEWAY_URL,
  },

  // =============================================================================
  // 🎙️ NODE-SPECIFIC SERVICE MAPPINGS
  // =============================================================================
  nodeServices: {
    // SAY NODE - Text-to-Speech Output
    sayNode: {
      primary: import.meta.env.VITE_TTS_ADAPTER_URL,
      streaming: import.meta.env.VITE_STREAMING_TTS_ADAPTER_URL,
      required: ['VITE_TTS_ADAPTER_URL'],
      endpoints: {
        synthesize: '/api/tts/synthesize',
        voices: '/api/tts/voices',
        streaming: '/api/tts/stream'
      }
    },

    // COLLECT NODE - Speech-to-Text Input
    collectNode: {
      primary: import.meta.env.VITE_ASR_ADAPTER_URL,
      vad: import.meta.env.VITE_VAD_SERVICE_URL,
      required: ['VITE_ASR_ADAPTER_URL'],
      endpoints: {
        recognize: '/api/asr/recognize',
        stream: '/api/asr/stream',
        vadDetect: '/api/vad/detect'
      }
    },

    // TRANSFER NODE - Call Transfer & Routing
    transferNode: {
      primary: import.meta.env.VITE_CALL_TRANSFER_URL,
      router: import.meta.env.VITE_VOICE_ROUTER_URL,
      telephony: import.meta.env.VITE_TELEPHONY_ADAPTER_URL,
      required: ['VITE_CALL_TRANSFER_URL', 'VITE_VOICE_ROUTER_URL'],
      endpoints: {
        transfer: '/api/call/transfer',
        route: '/api/voice/route',
        validate: '/api/transfer/validate'
      }
    },

    // DECISION NODE - Conditional Logic & AI Decisions
    decisionNode: {
      primary: import.meta.env.VITE_DECISION_ENGINE_URL,
      ai: import.meta.env.VITE_AI_VOICE_INTELLIGENCE_URL,
      required: ['VITE_DECISION_ENGINE_URL'],
      endpoints: {
        evaluate: '/api/decision/evaluate',
        conditions: '/api/decision/conditions',
        aiAnalyze: '/api/ai/analyze'
      }
    },

    // LLM NODE - AI Conversation & Dialog
    llmNode: {
      primary: import.meta.env.VITE_DIALOG_ORCHESTRATOR_URL,
      ai: import.meta.env.VITE_AI_VOICE_INTELLIGENCE_URL,
      learning: import.meta.env.VITE_SELF_LEARNING_ENGINE_URL,
      required: ['VITE_DIALOG_ORCHESTRATOR_URL'],
      endpoints: {
        process: '/api/dialog/process',
        context: '/api/dialog/context',
        learn: '/api/learning/update'
      }
    },

    // HANGUP NODE - Call Termination
    hangupNode: {
      primary: import.meta.env.VITE_TELEPHONY_ADAPTER_URL,
      recording: import.meta.env.VITE_CALL_RECORDING_URL,
      required: ['VITE_TELEPHONY_ADAPTER_URL'],
      endpoints: {
        hangup: '/api/call/hangup',
        recording: '/api/call/recording/stop'
      }
    },

    // END NODE - Flow Completion
    endNode: {
      primary: import.meta.env.VITE_FLOW_PROCESSOR_URL,
      analytics: import.meta.env.VITE_ANALYTICS_SERVICE_URL,
      required: ['VITE_FLOW_PROCESSOR_URL'],
      endpoints: {
        complete: '/api/flow/complete',
        analytics: '/api/analytics/record'
      }
    }
  },

  // =============================================================================
  // 📊 ANALYTICS & MONITORING SERVICES
  // =============================================================================
  analytics: {
    service: import.meta.env.VITE_ANALYTICS_SERVICE_URL,
    advanced: import.meta.env.VITE_ADVANCED_ANALYTICS_URL,
    monitoring: import.meta.env.VITE_REAL_TIME_MONITORING_URL,
    endpoints: {
      track: '/api/analytics/track',
      performance: '/api/analytics/performance',
      errors: '/api/monitoring/errors'
    }
  },

  // =============================================================================
  // 🌐 REAL-TIME SERVICES
  // =============================================================================
  realtime: {
    websocket: import.meta.env.VITE_WS_URL,
    pubsub: import.meta.env.VITE_PUBSUB_EVENT_STREAMING_URL,
    endpoints: {
      connect: '/ws/flow-designer',
      subscribe: '/ws/flow-updates',
      collaborate: '/ws/collaboration'
    }
  },

  // =============================================================================
  // 🔧 SERVICE VALIDATION & HEALTH CHECKS
  // =============================================================================
  async validateServices() {
    const results = {};
    
    // Check core services
    for (const [name, url] of Object.entries(this.core)) {
      if (url) {
        try {
          const response = await fetch(`${url}/health`, { 
            method: 'GET',
            timeout: 5000 
          });
          results[name] = response.ok;
        } catch (error) {
          results[name] = false;
          console.warn(`Service ${name} health check failed:`, error);
        }
      } else {
        results[name] = false;
        console.warn(`Service ${name} URL not configured`);
      }
    }
    
    return results;
  },

  // =============================================================================
  // 🎯 GET SERVICES FOR NODE TYPE
  // =============================================================================
  getServicesForNode(nodeType) {
    const services = this.nodeServices[nodeType];
    if (!services) {
      console.warn(`No services configured for node type: ${nodeType}`);
      return null;
    }

    // Check if required services are available
    const missing = services.required.filter(envVar => !import.meta.env[envVar]);
    if (missing.length > 0) {
      console.error(`Missing required environment variables for ${nodeType}:`, missing);
      return null;
    }

    return services;
  },

  // =============================================================================
  // 🚀 OPTIMIZED REQUEST METHODS
  // =============================================================================
  async makeNodeRequest(nodeType, endpoint, data = {}) {
    const services = this.getServicesForNode(nodeType);
    if (!services) {
      throw new Error(`Services not available for node type: ${nodeType}`);
    }

    const url = `${services.primary}${services.endpoints[endpoint]}`;
    const timeout = parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(timeout)
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Node request failed for ${nodeType}:`, error);
      throw error;
    }
  },

  getAuthToken() {
    return localStorage.getItem('vocelio_auth_token') || '';
  }
};

// =============================================================================
// 🎯 QUICK SETUP FUNCTIONS
// =============================================================================

// Minimal setup - just essential services
export function getMinimalConfig() {
  return {
    flowDesigner: FLOW_DESIGNER_CONFIG.core.flowDesigner,
    flowProcessor: FLOW_DESIGNER_CONFIG.core.flowProcessor,
    apiGateway: FLOW_DESIGNER_CONFIG.core.apiGateway
  };
}

// Voice-enabled setup - adds voice processing
export function getVoiceEnabledConfig() {
  return {
    ...getMinimalConfig(),
    tts: FLOW_DESIGNER_CONFIG.nodeServices.sayNode.primary,
    asr: FLOW_DESIGNER_CONFIG.nodeServices.collectNode.primary,
    telephony: FLOW_DESIGNER_CONFIG.nodeServices.transferNode.telephony
  };
}

// Full setup - all services
export function getFullConfig() {
  return FLOW_DESIGNER_CONFIG;
}

// =============================================================================
// 🔍 CONFIGURATION VALIDATOR
// =============================================================================
export function validateFlowDesignerConfig() {
  const issues = [];
  
  // Check core services
  Object.entries(FLOW_DESIGNER_CONFIG.core).forEach(([name, url]) => {
    if (!url) {
      issues.push(`Missing core service: ${name}`);
    }
  });

  // Check node services
  Object.entries(FLOW_DESIGNER_CONFIG.nodeServices).forEach(([nodeType, config]) => {
    config.required.forEach(envVar => {
      if (!import.meta.env[envVar]) {
        issues.push(`Missing required env var for ${nodeType}: ${envVar}`);
      }
    });
  });

  return {
    isValid: issues.length === 0,
    issues,
    missingServices: issues.length
  };
}

export default FLOW_DESIGNER_CONFIG;
