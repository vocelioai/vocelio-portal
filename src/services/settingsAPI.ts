import { APIResponse, UserProfile, VoicePreferences, Organization, SupportTicket, BillingInfo, APIKey, WebhookEndpoint, Integration, CalendarIntegration, NotificationPreferences } from '../types/settings';

// Backend service URLs
const BACKEND_SERVICES = {
  auth: 'https://auth-service-313373223340.us-central1.run.app',
  preferences: 'https://customer-preferences-313373223340.us-central1.run.app',
  dashboard: 'https://dashboard-service-313373223340.us-central1.run.app',
  support: 'https://tool-integration-313373223340.us-central1.run.app',
  omnichannel: 'https://omnichannel-hub-313373223340.us-central1.run.app'
};

class SettingsAPI {
  private async makeRequest<T>(
    url: string, 
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    try {
      const token = localStorage.getItem('vocelio_token');
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  // User Profile APIs
  async getCurrentUser(): Promise<APIResponse<UserProfile>> {
    return this.makeRequest<UserProfile>(`${BACKEND_SERVICES.auth}/auth/me`);
  }

  async updateUserProfile(data: Partial<UserProfile>): Promise<APIResponse<UserProfile>> {
    return this.makeRequest<UserProfile>(`${BACKEND_SERVICES.auth}/auth/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<APIResponse<void>> {
    return this.makeRequest<void>(`${BACKEND_SERVICES.auth}/auth/password-reset`, {
      method: 'POST',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });
  }

  async setupTwoFactor(): Promise<APIResponse<{ qr_code: string; backup_codes: string[] }>> {
    return this.makeRequest(`${BACKEND_SERVICES.auth}/auth/two-factor/setup`, {
      method: 'POST',
    });
  }

  async getActiveSessions(): Promise<APIResponse<any[]>> {
    return this.makeRequest(`${BACKEND_SERVICES.auth}/auth/sessions`);
  }

  // Voice Preferences APIs
  async getVoicePreferences(customerId: string): Promise<APIResponse<VoicePreferences>> {
    return this.makeRequest<VoicePreferences>(
      `${BACKEND_SERVICES.preferences}/customer/${customerId}/preferences`
    );
  }

  async updateVoicePreferences(customerId: string, data: Partial<VoicePreferences>): Promise<APIResponse<VoicePreferences>> {
    return this.makeRequest<VoicePreferences>(
      `${BACKEND_SERVICES.preferences}/customer/${customerId}/preferences`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async getVoiceTiers(): Promise<APIResponse<any[]>> {
    return this.makeRequest(`${BACKEND_SERVICES.preferences}/voice-tiers`);
  }

  async getAvailableVoices(tier: 'regular' | 'premium'): Promise<APIResponse<any[]>> {
    return this.makeRequest(`${BACKEND_SERVICES.preferences}/voices?tier=${tier}`);
  }

  async previewVoice(voiceId: string, text: string): Promise<APIResponse<{ audio_url: string }>> {
    return this.makeRequest(`${BACKEND_SERVICES.preferences}/voices/${voiceId}/preview`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  // Organization APIs
  async getOrganization(orgId: string): Promise<APIResponse<Organization>> {
    return this.makeRequest<Organization>(`${BACKEND_SERVICES.auth}/organizations/${orgId}`);
  }

  async updateOrganization(orgId: string, data: Partial<Organization>): Promise<APIResponse<Organization>> {
    return this.makeRequest<Organization>(`${BACKEND_SERVICES.auth}/organizations/${orgId}/settings`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async inviteTeamMember(orgId: string, email: string, role: string): Promise<APIResponse<void>> {
    return this.makeRequest(`${BACKEND_SERVICES.auth}/organizations/${orgId}/users`, {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  }

  async removeTeamMember(orgId: string, userId: string): Promise<APIResponse<void>> {
    return this.makeRequest(`${BACKEND_SERVICES.auth}/organizations/${orgId}/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Support APIs
  async getSupportTickets(): Promise<APIResponse<SupportTicket[]>> {
    return this.makeRequest<SupportTicket[]>(`${BACKEND_SERVICES.support}/tickets`);
  }

  async createSupportTicket(ticket: Omit<SupportTicket, 'ticket_id' | 'created_at' | 'updated_at'>): Promise<APIResponse<{ ticket_id: string }>> {
    return this.makeRequest(`${BACKEND_SERVICES.support}/tickets`, {
      method: 'POST',
      body: JSON.stringify(ticket),
    });
  }

  async getTicketDetails(ticketId: string): Promise<APIResponse<SupportTicket>> {
    return this.makeRequest<SupportTicket>(`${BACKEND_SERVICES.support}/tickets/${ticketId}`);
  }

  async addTicketMessage(ticketId: string, message: string, attachments?: File[]): Promise<APIResponse<void>> {
    const formData = new FormData();
    formData.append('message', message);
    
    if (attachments) {
      attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });
    }

    return this.makeRequest(`${BACKEND_SERVICES.support}/tickets/${ticketId}/messages`, {
      method: 'POST',
      body: formData,
      headers: {}, // Don't set Content-Type for FormData
    });
  }

  async searchKnowledgeBase(query: string): Promise<APIResponse<any[]>> {
    return this.makeRequest(`${BACKEND_SERVICES.support}/knowledge-base/search?q=${encodeURIComponent(query)}`);
  }

  // Billing APIs (would integrate with Stripe)
  async getBillingInfo(): Promise<APIResponse<BillingInfo>> {
    return this.makeRequest<BillingInfo>(`${BACKEND_SERVICES.dashboard}/billing`);
  }

  async getPaymentMethods(): Promise<APIResponse<any[]>> {
    return this.makeRequest(`${BACKEND_SERVICES.dashboard}/billing/payment-methods`);
  }

  async updatePaymentMethod(paymentMethodId: string): Promise<APIResponse<void>> {
    return this.makeRequest(`${BACKEND_SERVICES.dashboard}/billing/payment-methods/${paymentMethodId}`, {
      method: 'PUT',
    });
  }

  async getInvoices(): Promise<APIResponse<any[]>> {
    return this.makeRequest(`${BACKEND_SERVICES.dashboard}/billing/invoices`);
  }

  async downloadInvoice(invoiceId: string): Promise<APIResponse<{ pdf_url: string }>> {
    return this.makeRequest(`${BACKEND_SERVICES.dashboard}/billing/invoices/${invoiceId}/download`);
  }

  // API Key Management
  async getAPIKeys(): Promise<APIResponse<APIKey[]>> {
    return this.makeRequest<APIKey[]>(`${BACKEND_SERVICES.dashboard}/api-keys`);
  }

  async createAPIKey(name: string, permissions: string[]): Promise<APIResponse<APIKey>> {
    return this.makeRequest<APIKey>(`${BACKEND_SERVICES.dashboard}/api-keys`, {
      method: 'POST',
      body: JSON.stringify({ name, permissions }),
    });
  }

  async updateAPIKey(keyId: string, updates: Partial<APIKey>): Promise<APIResponse<APIKey>> {
    return this.makeRequest<APIKey>(`${BACKEND_SERVICES.dashboard}/api-keys/${keyId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async revokeAPIKey(keyId: string): Promise<APIResponse<void>> {
    return this.makeRequest(`${BACKEND_SERVICES.dashboard}/api-keys/${keyId}`, {
      method: 'DELETE',
    });
  }

  // Webhook Management
  async getWebhooks(): Promise<APIResponse<WebhookEndpoint[]>> {
    return this.makeRequest<WebhookEndpoint[]>(`${BACKEND_SERVICES.dashboard}/webhooks`);
  }

  async createWebhook(webhook: Omit<WebhookEndpoint, 'id' | 'last_delivery' | 'failure_count'>): Promise<APIResponse<{ id: string }>> {
    return this.makeRequest(`${BACKEND_SERVICES.dashboard}/webhooks`, {
      method: 'POST',
      body: JSON.stringify(webhook),
    });
  }

  async updateWebhook(webhookId: string, updates: Partial<WebhookEndpoint>): Promise<APIResponse<WebhookEndpoint>> {
    return this.makeRequest<WebhookEndpoint>(`${BACKEND_SERVICES.dashboard}/webhooks/${webhookId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async testWebhook(webhookId: string): Promise<APIResponse<{ success: boolean; response_time: number }>> {
    return this.makeRequest(`${BACKEND_SERVICES.dashboard}/webhooks/${webhookId}/test`, {
      method: 'POST',
    });
  }

  // Integration Management
  async getIntegrations(): Promise<APIResponse<Integration[]>> {
    return this.makeRequest<Integration[]>(`${BACKEND_SERVICES.support}/integrations`);
  }

  async connectIntegration(type: string, config: Record<string, any>): Promise<APIResponse<Integration>> {
    return this.makeRequest<Integration>(`${BACKEND_SERVICES.support}/integrations`, {
      method: 'POST',
      body: JSON.stringify({ type, config }),
    });
  }

  async disconnectIntegration(integrationId: string): Promise<APIResponse<void>> {
    return this.makeRequest(`${BACKEND_SERVICES.support}/integrations/${integrationId}`, {
      method: 'DELETE',
    });
  }

  async testIntegration(integrationId: string): Promise<APIResponse<{ success: boolean; message: string }>> {
    return this.makeRequest(`${BACKEND_SERVICES.support}/integrations/${integrationId}/test`, {
      method: 'POST',
    });
  }

  // Calendar Integration
  async getCalendarIntegrations(): Promise<APIResponse<CalendarIntegration[]>> {
    return this.makeRequest<CalendarIntegration[]>(`${BACKEND_SERVICES.dashboard}/calendar/integrations`);
  }

  async initiateCalendarAuth(provider: string): Promise<APIResponse<{ auth_url: string }>> {
    return this.makeRequest(`${BACKEND_SERVICES.dashboard}/calendar/auth/${provider}`, {
      method: 'POST',
    });
  }

  async disconnectCalendar(integrationId: string): Promise<APIResponse<void>> {
    return this.makeRequest(`${BACKEND_SERVICES.dashboard}/calendar/integrations/${integrationId}`, {
      method: 'DELETE',
    });
  }

  async syncCalendar(integrationId: string): Promise<APIResponse<{ synced_events: number }>> {
    return this.makeRequest(`${BACKEND_SERVICES.dashboard}/calendar/integrations/${integrationId}/sync`, {
      method: 'POST',
    });
  }

  // Notifications
  async getNotificationPreferences(): Promise<APIResponse<NotificationPreferences>> {
    return this.makeRequest<NotificationPreferences>(`${BACKEND_SERVICES.dashboard}/notifications/preferences`);
  }

  async updateNotificationPreferences(preferences: Partial<NotificationPreferences>): Promise<APIResponse<NotificationPreferences>> {
    return this.makeRequest<NotificationPreferences>(`${BACKEND_SERVICES.dashboard}/notifications/preferences`, {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  // File Upload
  async uploadFile(file: File, purpose: 'profile_picture' | 'support_attachment'): Promise<APIResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('purpose', purpose);

    return this.makeRequest(`${BACKEND_SERVICES.dashboard}/files/upload`, {
      method: 'POST',
      body: formData,
      headers: {}, // Don't set Content-Type for FormData
    });
  }
}

export const settingsAPI = new SettingsAPI();
