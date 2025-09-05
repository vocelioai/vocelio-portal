/**
 * Context Management API - Cloud sync and team collaboration
 * Handles global prompts, workflow contexts, and template library
 */

class ContextAPI {
  constructor() {
    this.baseURL = import.meta.env.VITE_CONTEXT_API_URL || 'https://api.vocelio.ai/context';
    this.apiKey = import.meta.env.VITE_API_KEY || '';
    this.teamId = localStorage.getItem('vocelio-team-id') || 'default-team';
    this.userId = localStorage.getItem('vocelio-user-id') || 'default-user';
  }

  // =============================================================================
  // 🔧 UTILITY METHODS
  // =============================================================================

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'X-Team-ID': this.teamId,
      'X-User-ID': this.userId,
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Context API Error:', error);
      return { 
        success: false, 
        error: error.message,
        fallback: this.getFallbackData(endpoint)
      };
    }
  }

  getFallbackData(endpoint) {
    // Return localStorage data as fallback when API is unavailable
    if (endpoint.includes('/global-prompt')) {
      return { prompt: localStorage.getItem('vocelio-global-prompt') || '' };
    }
    if (endpoint.includes('/workflow-contexts')) {
      const contexts = localStorage.getItem('vocelio-workflow-contexts');
      return { contexts: contexts ? JSON.parse(contexts) : {} };
    }
    if (endpoint.includes('/templates')) {
      const templates = localStorage.getItem('vocelio-context-templates');
      return { templates: templates ? JSON.parse(templates) : [] };
    }
    return {};
  }

  // =============================================================================
  // 🌍 GLOBAL PROMPT MANAGEMENT
  // =============================================================================

  async saveGlobalPrompt(prompt) {
    const result = await this.makeRequest('/global-prompt', {
      method: 'PUT',
      body: {
        prompt,
        updatedAt: new Date().toISOString(),
        updatedBy: this.userId
      }
    });

    // Always save to localStorage as backup
    localStorage.setItem('vocelio-global-prompt', prompt);
    
    return result;
  }

  async getGlobalPrompt() {
    const result = await this.makeRequest('/global-prompt');
    
    if (result.success) {
      // Sync with localStorage
      localStorage.setItem('vocelio-global-prompt', result.data.prompt);
      return result;
    }
    
    // Use fallback data
    return {
      success: true,
      data: { prompt: result.fallback.prompt },
      isOffline: true
    };
  }

  // =============================================================================
  // 🎭 WORKFLOW CONTEXT MANAGEMENT
  // =============================================================================

  async saveWorkflowContexts(contexts) {
    const result = await this.makeRequest('/workflow-contexts', {
      method: 'PUT',
      body: {
        contexts,
        updatedAt: new Date().toISOString(),
        updatedBy: this.userId
      }
    });

    // Always save to localStorage as backup
    localStorage.setItem('vocelio-workflow-contexts', JSON.stringify(contexts));
    
    return result;
  }

  async getWorkflowContexts() {
    const result = await this.makeRequest('/workflow-contexts');
    
    if (result.success) {
      // Sync with localStorage
      localStorage.setItem('vocelio-workflow-contexts', JSON.stringify(result.data.contexts));
      return result;
    }
    
    // Use fallback data
    return {
      success: true,
      data: { contexts: result.fallback.contexts },
      isOffline: true
    };
  }

  async saveWorkflowContext(workflowId, context) {
    const result = await this.makeRequest(`/workflow-contexts/${workflowId}`, {
      method: 'PUT',
      body: {
        ...context,
        updatedAt: new Date().toISOString(),
        updatedBy: this.userId
      }
    });

    // Update localStorage
    const contexts = JSON.parse(localStorage.getItem('vocelio-workflow-contexts') || '{}');
    contexts[workflowId] = context;
    localStorage.setItem('vocelio-workflow-contexts', JSON.stringify(contexts));
    
    return result;
  }

  async deleteWorkflowContext(workflowId) {
    const result = await this.makeRequest(`/workflow-contexts/${workflowId}`, {
      method: 'DELETE'
    });

    // Update localStorage
    const contexts = JSON.parse(localStorage.getItem('vocelio-workflow-contexts') || '{}');
    delete contexts[workflowId];
    localStorage.setItem('vocelio-workflow-contexts', JSON.stringify(contexts));
    
    return result;
  }

  // =============================================================================
  // 📚 TEMPLATE LIBRARY MANAGEMENT
  // =============================================================================

  async getTemplateLibrary() {
    const result = await this.makeRequest('/templates');
    
    if (result.success) {
      // Sync custom templates with localStorage
      const customTemplates = result.data.templates.filter(t => !t.isBuiltIn);
      localStorage.setItem('vocelio-context-templates', JSON.stringify(customTemplates));
      return result;
    }
    
    // Use fallback data
    return {
      success: true,
      data: { templates: result.fallback.templates },
      isOffline: true
    };
  }

  async saveCustomTemplate(template) {
    const result = await this.makeRequest('/templates', {
      method: 'POST',
      body: {
        ...template,
        teamId: this.teamId,
        createdBy: this.userId,
        createdAt: new Date().toISOString()
      }
    });

    // Update localStorage
    const templates = JSON.parse(localStorage.getItem('vocelio-context-templates') || '[]');
    templates.push(template);
    localStorage.setItem('vocelio-context-templates', JSON.stringify(templates));
    
    return result;
  }

  async deleteCustomTemplate(templateId) {
    const result = await this.makeRequest(`/templates/${templateId}`, {
      method: 'DELETE'
    });

    // Update localStorage
    const templates = JSON.parse(localStorage.getItem('vocelio-context-templates') || '[]');
    const filteredTemplates = templates.filter(t => t.id !== templateId);
    localStorage.setItem('vocelio-context-templates', JSON.stringify(filteredTemplates));
    
    return result;
  }

  // =============================================================================
  // 👥 TEAM COLLABORATION
  // =============================================================================

  async getTeamMembers() {
    return await this.makeRequest('/team/members');
  }

  async inviteTeamMember(email, role = 'member') {
    return await this.makeRequest('/team/invite', {
      method: 'POST',
      body: { email, role }
    });
  }

  async getActivityLog(limit = 50) {
    return await this.makeRequest(`/activity?limit=${limit}`);
  }

  async logActivity(action, details) {
    return await this.makeRequest('/activity', {
      method: 'POST',
      body: {
        action,
        details,
        userId: this.userId,
        timestamp: new Date().toISOString()
      }
    });
  }

  // =============================================================================
  // 📊 ANALYTICS & INSIGHTS
  // =============================================================================

  async getContextAnalytics() {
    return await this.makeRequest('/analytics/contexts');
  }

  async getTemplateUsageStats() {
    return await this.makeRequest('/analytics/templates');
  }

  async recordTemplateUsage(templateId, workflowId) {
    return await this.makeRequest('/analytics/template-usage', {
      method: 'POST',
      body: {
        templateId,
        workflowId,
        userId: this.userId,
        timestamp: new Date().toISOString()
      }
    });
  }

  // =============================================================================
  // 🔄 REAL-TIME SYNC
  // =============================================================================

  setupRealtimeSync(callbacks = {}) {
    // WebSocket connection for real-time updates
    const wsUrl = import.meta.env.VITE_WS_URL || 'wss://api.vocelio.ai/ws';
    const ws = new WebSocket(`${wsUrl}?teamId=${this.teamId}&userId=${this.userId}`);

    ws.onopen = () => {
      console.log('🔗 Real-time sync connected');
      callbacks.onConnect?.();
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleRealtimeMessage(message, callbacks);
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    ws.onclose = () => {
      console.log('🔌 Real-time sync disconnected');
      callbacks.onDisconnect?.();
      
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        this.setupRealtimeSync(callbacks);
      }, 5000);
    };

    return ws;
  }

  handleRealtimeMessage(message, callbacks) {
    const { type, data, userId } = message;
    
    // Don't process our own updates
    if (userId === this.userId) return;

    switch (type) {
      case 'global-prompt-updated':
        localStorage.setItem('vocelio-global-prompt', data.prompt);
        callbacks.onGlobalPromptUpdate?.(data);
        break;
        
      case 'workflow-context-updated':
        const contexts = JSON.parse(localStorage.getItem('vocelio-workflow-contexts') || '{}');
        contexts[data.workflowId] = data.context;
        localStorage.setItem('vocelio-workflow-contexts', JSON.stringify(contexts));
        callbacks.onWorkflowContextUpdate?.(data);
        break;
        
      case 'template-created':
        const templates = JSON.parse(localStorage.getItem('vocelio-context-templates') || '[]');
        templates.push(data.template);
        localStorage.setItem('vocelio-context-templates', JSON.stringify(templates));
        callbacks.onTemplateCreated?.(data);
        break;
        
      case 'user-online':
        callbacks.onUserOnline?.(data);
        break;
        
      case 'user-offline':
        callbacks.onUserOffline?.(data);
        break;
        
      default:
        console.log('Unknown real-time message type:', type);
    }
  }

  // =============================================================================
  // 🚀 BULK OPERATIONS
  // =============================================================================

  async exportAllData() {
    const [globalPrompt, workflowContexts, templates] = await Promise.all([
      this.getGlobalPrompt(),
      this.getWorkflowContexts(),
      this.getTemplateLibrary()
    ]);

    return {
      exportedAt: new Date().toISOString(),
      teamId: this.teamId,
      globalPrompt: globalPrompt.data,
      workflowContexts: workflowContexts.data,
      templates: templates.data
    };
  }

  async importData(data) {
    const results = await Promise.all([
      this.saveGlobalPrompt(data.globalPrompt.prompt),
      this.saveWorkflowContexts(data.workflowContexts.contexts),
      // Templates would need individual imports due to ID conflicts
    ]);

    return {
      success: results.every(r => r.success),
      results
    };
  }

  // =============================================================================
  // 🔧 CONFIGURATION
  // =============================================================================

  setTeam(teamId) {
    this.teamId = teamId;
    localStorage.setItem('vocelio-team-id', teamId);
  }

  setUser(userId) {
    this.userId = userId;
    localStorage.setItem('vocelio-user-id', userId);
  }

  async testConnection() {
    const result = await this.makeRequest('/health');
    return {
      ...result,
      connectionInfo: {
        baseURL: this.baseURL,
        teamId: this.teamId,
        userId: this.userId,
        timestamp: new Date().toISOString()
      }
    };
  }
}

// Export singleton instance
export const contextAPI = new ContextAPI();
export default contextAPI;
