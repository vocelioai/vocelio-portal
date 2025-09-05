// Webhook Integration Service - Routes incoming calls to appropriate flows
class WebhookIntegrationService {
  constructor() {
    this.flowProcessorURL = import.meta.env.VITE_FLOW_PROCESSOR_URL;
    this.telephonyAdapterURL = import.meta.env.VITE_TELEPHONY_ADAPTER_URL;
    
    // Phone number to flow mapping
    this.phoneFlowMapping = new Map();
    this.loadPhoneFlowMapping();
  }

  // =============================================================================
  // PHONE NUMBER TO FLOW MAPPING MANAGEMENT
  // =============================================================================

  loadPhoneFlowMapping() {
    try {
      const deployedFlows = JSON.parse(localStorage.getItem('deployed_flows') || '[]');
      
      // Build mapping from deployed flows
      deployedFlows.forEach(flow => {
        if (flow.phone_numbers && flow.status === 'active') {
          flow.phone_numbers.forEach(phoneNumber => {
            this.phoneFlowMapping.set(phoneNumber, {
              flowId: flow.id,
              flowName: flow.name,
              voiceSettings: flow.voice_settings || {}
            });
          });
        }
      });
      
      console.log('📞 Phone-to-Flow mapping loaded:', Array.from(this.phoneFlowMapping.entries()));
    } catch (error) {
      console.error('Error loading phone-flow mapping:', error);
    }
  }

  registerPhoneFlow(phoneNumber, flowId, flowName, voiceSettings = {}) {
    this.phoneFlowMapping.set(phoneNumber, {
      flowId,
      flowName,
      voiceSettings
    });
    
    // Save to localStorage for persistence
    this.savePhoneFlowMapping();
    
    console.log(`📞 Registered ${phoneNumber} → ${flowId}`);
  }

  unregisterPhoneFlow(phoneNumber) {
    this.phoneFlowMapping.delete(phoneNumber);
    this.savePhoneFlowMapping();
    
    console.log(`📞 Unregistered ${phoneNumber}`);
  }

  savePhoneFlowMapping() {
    try {
      const mappingArray = Array.from(this.phoneFlowMapping.entries());
      localStorage.setItem('phone_flow_mapping', JSON.stringify(mappingArray));
    } catch (error) {
      console.error('Error saving phone-flow mapping:', error);
    }
  }

  getFlowForPhone(phoneNumber) {
    return this.phoneFlowMapping.get(phoneNumber);
  }

  // =============================================================================
  // INCOMING CALL WEBHOOK HANDLER
  // =============================================================================

  async handleIncomingCall(callData) {
    try {
      console.log('📞 Incoming call webhook:', callData);
      
      const { To: toNumber, From: fromNumber, CallSid: callSid } = callData;
      
      // Find the flow assigned to this phone number
      const flowMapping = this.getFlowForPhone(toNumber);
      
      if (!flowMapping) {
        console.warn(`⚠️ No flow assigned to phone number: ${toNumber}`);
        return this.generateDefaultResponse(callSid);
      }

      console.log(`🎯 Routing call ${callSid} to flow: ${flowMapping.flowId}`);
      
      // Start flow execution
      try {
        const flowState = await this.startFlowForCall(
          callSid, 
          flowMapping.flowId, 
          fromNumber,
          flowMapping.voiceSettings
        );
        
        return this.generateTwiMLResponse(flowState);
        
      } catch (flowError) {
        console.error('Flow execution failed:', flowError);
        return this.generateErrorResponse(callSid);
      }
      
    } catch (error) {
      console.error('❌ Incoming call handler error:', error);
      return this.generateErrorResponse();
    }
  }

  async startFlowForCall(callSid, flowId, customerPhone, voiceSettings) {
    console.log(`🎬 Starting flow ${flowId} for call ${callSid}`);
    
    const response = await fetch(`${this.flowProcessorURL}/flow/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
      },
      body: JSON.stringify({
        call_id: callSid,
        flow_id: flowId,
        user_data: {
          phone: customerPhone,
          started_at: new Date().toISOString(),
          voice_settings: voiceSettings
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Flow start failed: ${response.status}`);
    }

    const flowState = await response.json();
    console.log('✅ Flow started:', flowState);
    
    return flowState;
  }

  // =============================================================================
  // TWIML RESPONSE GENERATION
  // =============================================================================

  generateTwiMLResponse(flowState) {
    let twiml = '<?xml version="1.0" encoding="UTF-8"?><Response>';
    
    switch (flowState.node_type) {
      case 'say':
        twiml += `<Say voice="${this.getVoiceForTTS(flowState)}">${flowState.response_text}</Say>`;
        
        // If flow expects input, add gather
        if (flowState.next_action === 'gather') {
          twiml += `<Gather input="speech" action="/webhook/process-speech" method="POST" speechTimeout="3">`;
          twiml += `<Say voice="${this.getVoiceForTTS(flowState)}">Please speak your response.</Say>`;
          twiml += `</Gather>`;
        }
        break;
        
      case 'collect':
        twiml += `<Gather input="speech dtmf" action="/webhook/process-speech" method="POST" speechTimeout="5">`;
        twiml += `<Say voice="${this.getVoiceForTTS(flowState)}">${flowState.response_text}</Say>`;
        twiml += `</Gather>`;
        break;
        
      case 'transfer':
        if (flowState.transfer_required && flowState.transfer_queue) {
          twiml += `<Say voice="${this.getVoiceForTTS(flowState)}">Please hold while I transfer you.</Say>`;
          twiml += `<Dial>${flowState.transfer_queue}</Dial>`;
        }
        break;
        
      case 'end':
        twiml += `<Say voice="${this.getVoiceForTTS(flowState)}">${flowState.response_text || 'Thank you for calling. Goodbye!'}</Say>`;
        twiml += `<Hangup/>`;
        break;
        
      default:
        twiml += `<Say>I'm processing your request. Please hold on.</Say>`;
    }
    
    twiml += '</Response>';
    
    console.log('🎵 Generated TwiML:', twiml);
    return twiml;
  }

  generateDefaultResponse(callSid = null) {
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say voice="Polly.Joanna">Thank you for calling Vocelio AI. We're currently setting up your personalized experience. Please call back in a few moments.</Say>
        <Hangup/>
      </Response>`;
    
    console.log('📞 Generated default response');
    return twiml;
  }

  generateErrorResponse(callSid = null) {
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say voice="Polly.Joanna">We're experiencing technical difficulties. Please try calling again later.</Say>
        <Hangup/>
      </Response>`;
    
    console.log('❌ Generated error response');
    return twiml;
  }

  getVoiceForTTS(flowState) {
    // Default to a professional voice
    return 'Polly.Joanna';
  }

  // =============================================================================
  // SPEECH INPUT PROCESSING
  // =============================================================================

  async handleSpeechInput(speechData) {
    try {
      console.log('🎤 Processing speech input:', speechData);
      
      const { CallSid: callSid, SpeechResult: speechResult } = speechData;
      
      // Continue flow execution with speech input
      const response = await fetch(`${this.flowProcessorURL}/flow/continue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify({
          call_id: callSid,
          user_input: speechResult
        })
      });

      if (!response.ok) {
        throw new Error(`Flow continuation failed: ${response.status}`);
      }

      const flowState = await response.json();
      console.log('✅ Flow continued with speech input:', flowState);
      
      return this.generateTwiMLResponse(flowState);
      
    } catch (error) {
      console.error('❌ Speech processing error:', error);
      return this.generateErrorResponse();
    }
  }

  // =============================================================================
  // CALL STATUS HANDLING
  // =============================================================================

  async handleCallStatus(statusData) {
    try {
      console.log('📞 Call status update:', statusData);
      
      const { CallSid: callSid, CallStatus: status } = statusData;
      
      // If call ended, clean up flow context
      if (status === 'completed' || status === 'failed' || status === 'busy' || status === 'no-answer') {
        await this.cleanupFlowContext(callSid);
      }
      
    } catch (error) {
      console.error('❌ Call status handling error:', error);
    }
  }

  async cleanupFlowContext(callSid) {
    try {
      console.log('🧹 Cleaning up flow context for call:', callSid);
      
      await fetch(`${this.flowProcessorURL}/context/${callSid}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        }
      });
      
      console.log('✅ Flow context cleaned up');
      
    } catch (error) {
      console.warn('⚠️ Flow context cleanup failed:', error);
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  getActiveMappings() {
    return Array.from(this.phoneFlowMapping.entries()).map(([phone, mapping]) => ({
      phoneNumber: phone,
      ...mapping
    }));
  }

  refreshMapping() {
    this.loadPhoneFlowMapping();
  }
}

// Export singleton instance
export const webhookIntegrationService = new WebhookIntegrationService();
export default webhookIntegrationService;
