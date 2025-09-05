// Flow Execution Service - Bridges FlowDesigner with Production Calls
class FlowExecutionService {
  constructor() {
    this.flowProcessorURL = import.meta.env.VITE_FLOW_PROCESSOR_URL;
    this.telephonyAdapterURL = import.meta.env.VITE_TELEPHONY_ADAPTER_URL;
    this.ttsAdapterURL = import.meta.env.VITE_TTS_ADAPTER_URL;
    this.voiceRouterURL = import.meta.env.VITE_VOICE_ROUTER_URL;
    
    // Active call sessions
    this.activeSessions = new Map();
  }

  // Authentication helper
  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
    };
  }

  // =============================================================================
  // FLOW DEPLOYMENT MANAGEMENT
  // =============================================================================

  async deployFlow(flowData) {
    try {
      console.log('🚀 Deploying flow to production:', flowData.id);
      
      // Deploy to flow processor
      const response = await fetch(`${this.flowProcessorURL}/flows`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(flowData)
      });

      if (!response.ok) {
        throw new Error(`Flow deployment failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Flow deployed successfully:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Flow deployment error:', error);
      throw error;
    }
  }

  async registerFlowWithTelephony(flowId, phoneNumbers) {
    try {
      console.log('📞 Registering flow with telephony:', { flowId, phoneNumbers });
      
      const response = await fetch(`${this.telephonyAdapterURL}/admin/register-flow`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          flow_id: flowId,
          phone_numbers: phoneNumbers,
          webhook_url: `${this.flowProcessorURL}/webhook/execute`
        })
      });

      if (!response.ok) {
        throw new Error(`Telephony registration failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Flow registered with telephony:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Telephony registration error:', error);
      throw error;
    }
  }

  // =============================================================================
  // REAL-TIME FLOW EXECUTION
  // =============================================================================

  async startFlowExecution(callId, flowId, customerPhone, voiceSettings = {}) {
    try {
      console.log('🎬 Starting flow execution:', { callId, flowId, customerPhone });
      
      // Initialize flow execution
      const response = await fetch(`${this.flowProcessorURL}/flow/start`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          call_id: callId,
          flow_id: flowId,
          user_data: {
            phone: customerPhone,
            started_at: new Date().toISOString(),
            voice_settings: voiceSettings
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Flow execution start failed: ${response.status}`);
      }

      const flowState = await response.json();
      
      // Store session info
      this.activeSessions.set(callId, {
        flowId,
        startedAt: new Date(),
        currentNode: flowState.node_type,
        voiceSettings
      });

      console.log('✅ Flow execution started:', flowState);
      
      // Execute the first action
      await this.executeFlowAction(callId, flowState);
      
      return flowState;
      
    } catch (error) {
      console.error('❌ Flow execution start error:', error);
      throw error;
    }
  }

  async continueFlowExecution(callId, userInput) {
    try {
      console.log('⏭️ Continuing flow execution:', { callId, userInput });
      
      const session = this.activeSessions.get(callId);
      if (!session) {
        throw new Error(`No active session found for call: ${callId}`);
      }

      // Continue flow with user input
      const response = await fetch(`${this.flowProcessorURL}/flow/continue`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          call_id: callId,
          flow_id: session.flowId,
          user_input: userInput
        })
      });

      if (!response.ok) {
        throw new Error(`Flow continuation failed: ${response.status}`);
      }

      const flowState = await response.json();
      
      // Update session
      session.currentNode = flowState.node_type;
      session.lastUpdate = new Date();
      
      console.log('✅ Flow continued:', flowState);
      
      // Execute the next action
      await this.executeFlowAction(callId, flowState);
      
      return flowState;
      
    } catch (error) {
      console.error('❌ Flow continuation error:', error);
      throw error;
    }
  }

  // =============================================================================
  // NODE EXECUTION HANDLERS
  // =============================================================================

  async executeFlowAction(callId, flowState) {
    try {
      console.log(`🎯 Executing ${flowState.node_type} node:`, flowState);
      
      switch (flowState.node_type) {
        case 'say':
          await this.executeSayNode(callId, flowState);
          break;
          
        case 'collect':
          await this.executeCollectNode(callId, flowState);
          break;
          
        case 'decision':
          await this.executeDecisionNode(callId, flowState);
          break;
          
        case 'transfer':
          await this.executeTransferNode(callId, flowState);
          break;
          
        case 'end':
          await this.executeEndNode(callId, flowState);
          break;
          
        default:
          console.warn(`⚠️ Unknown node type: ${flowState.node_type}`);
      }
      
    } catch (error) {
      console.error('❌ Flow action execution error:', error);
      throw error;
    }
  }

  async executeSayNode(callId, flowState) {
    try {
      const session = this.activeSessions.get(callId);
      const voiceSettings = session?.voiceSettings || {};
      
      // Use voice service to speak the text
      const response = await fetch(`${this.ttsAdapterURL}/synthesize`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          text: flowState.response_text,
          voice_id: voiceSettings.selectedVoice || 'en-US-AriaNeural',
          provider: voiceSettings.voiceTier === 'premium' ? 'elevenlabs' : 'azure',
          call_id: callId
        })
      });

      if (!response.ok) {
        throw new Error(`TTS failed: ${response.status}`);
      }

      console.log('🗣️ Say node executed successfully');
      
      // If flow is not waiting for input, continue automatically
      if (flowState.next_action === 'continue') {
        setTimeout(() => this.continueFlowExecution(callId, null), 2000);
      }
      
    } catch (error) {
      console.error('❌ Say node execution error:', error);
      throw error;
    }
  }

  async executeCollectNode(callId, flowState) {
    try {
      console.log('🎤 Collect node: Waiting for user input...');
      
      // The collect node sets up listening for user input
      // The actual input will come through continueFlowExecution
      // when speech is detected and transcribed
      
      // Set up ASR for this call if not already active
      await this.setupASRForCall(callId);
      
    } catch (error) {
      console.error('❌ Collect node execution error:', error);
      throw error;
    }
  }

  async executeDecisionNode(callId, flowState) {
    try {
      console.log('🤔 Decision node: Processing logic...');
      
      // Decision nodes are processed by the flow processor
      // and should return the next action automatically
      if (flowState.next_action === 'continue') {
        setTimeout(() => this.continueFlowExecution(callId, null), 500);
      }
      
    } catch (error) {
      console.error('❌ Decision node execution error:', error);
      throw error;
    }
  }

  async executeTransferNode(callId, flowState) {
    try {
      console.log('📞 Transfer node: Routing to agent...');
      
      if (flowState.transfer_required && flowState.transfer_queue) {
        // Transfer the call
        const response = await fetch(`${this.telephonyAdapterURL}/api/calls/${callId}/transfer`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({
            transfer_to: flowState.transfer_queue,
            context: flowState.collected_data
          })
        });

        if (!response.ok) {
          throw new Error(`Transfer failed: ${response.status}`);
        }

        console.log('✅ Call transferred successfully');
        
        // End flow execution after transfer
        await this.endFlowExecution(callId);
      }
      
    } catch (error) {
      console.error('❌ Transfer node execution error:', error);
      throw error;
    }
  }

  async executeEndNode(callId, flowState) {
    try {
      console.log('🏁 End node: Completing flow...');
      
      if (flowState.response_text) {
        await this.executeSayNode(callId, flowState);
      }
      
      // End the call if configured to do so
      setTimeout(async () => {
        await this.endFlowExecution(callId);
        
        // Optionally end the call
        try {
          await fetch(`${this.telephonyAdapterURL}/api/calls/${callId}/end`, {
            method: 'POST',
            headers: this.getAuthHeaders()
          });
        } catch (error) {
          console.warn('Call end request failed:', error);
        }
      }, 3000);
      
    } catch (error) {
      console.error('❌ End node execution error:', error);
      throw error;
    }
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  async setupASRForCall(callId) {
    try {
      // Set up ASR listening for the call
      const response = await fetch(`${this.telephonyAdapterURL}/api/calls/${callId}/asr/start`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          language: 'en-US',
          interim_results: true
        })
      });

      if (!response.ok) {
        console.warn('ASR setup failed:', response.status);
      }
      
    } catch (error) {
      console.warn('ASR setup error:', error);
    }
  }

  async endFlowExecution(callId) {
    try {
      console.log('🏁 Ending flow execution for call:', callId);
      
      // Clean up flow context
      const response = await fetch(`${this.flowProcessorURL}/context/${callId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        console.warn('Flow context cleanup failed:', response.status);
      }

      // Remove from active sessions
      this.activeSessions.delete(callId);
      
      console.log('✅ Flow execution ended');
      
    } catch (error) {
      console.error('❌ Flow end error:', error);
    }
  }

  // =============================================================================
  // MONITORING & ANALYTICS
  // =============================================================================

  getActiveSessionsCount() {
    return this.activeSessions.size;
  }

  getSessionInfo(callId) {
    return this.activeSessions.get(callId);
  }

  getAllActiveSessions() {
    return Array.from(this.activeSessions.entries()).map(([callId, session]) => ({
      callId,
      ...session
    }));
  }
}

// Export singleton instance
export const flowExecutionService = new FlowExecutionService();
export default flowExecutionService;
