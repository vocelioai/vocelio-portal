import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { SettingsState, SettingsContextType, UserProfile, VoicePreferences, Organization, SupportTicket, APIKey, WebhookEndpoint, Integration, NotificationPreferences } from '../types/settings';
import { settingsAPI } from '../services/settingsAPI';

// Settings Actions
type SettingsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SETTINGS'; payload: SettingsState }
  | { type: 'UPDATE_USER_PROFILE'; payload: UserProfile }
  | { type: 'UPDATE_VOICE_PREFERENCES'; payload: VoicePreferences }
  | { type: 'UPDATE_ORGANIZATION'; payload: Organization }
  | { type: 'ADD_SUPPORT_TICKET'; payload: SupportTicket }
  | { type: 'UPDATE_SUPPORT_TICKET'; payload: { id: string; updates: Partial<SupportTicket> } }
  | { type: 'ADD_API_KEY'; payload: APIKey }
  | { type: 'REMOVE_API_KEY'; payload: string }
  | { type: 'UPDATE_API_KEY'; payload: { id: string; updates: Partial<APIKey> } }
  | { type: 'ADD_WEBHOOK'; payload: WebhookEndpoint }
  | { type: 'UPDATE_WEBHOOK'; payload: { id: string; updates: Partial<WebhookEndpoint> } }
  | { type: 'REMOVE_WEBHOOK'; payload: string }
  | { type: 'UPDATE_INTEGRATION'; payload: { id: string; updates: Partial<Integration> } }
  | { type: 'UPDATE_NOTIFICATIONS'; payload: NotificationPreferences };

// Settings State with UI state
interface SettingsContextState {
  settings: SettingsState | null;
  loading: boolean;
  error: string | null;
}

const initialState: SettingsContextState = {
  settings: null,
  loading: true,
  error: null,
};

// Reducer
function settingsReducer(state: SettingsContextState, action: SettingsAction): SettingsContextState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload, loading: false, error: null };
    
    case 'UPDATE_USER_PROFILE':
      if (!state.settings) return state;
      return {
        ...state,
        settings: { ...state.settings, userProfile: action.payload }
      };
    
    case 'UPDATE_VOICE_PREFERENCES':
      if (!state.settings) return state;
      return {
        ...state,
        settings: { ...state.settings, voicePreferences: action.payload }
      };
    
    case 'UPDATE_ORGANIZATION':
      if (!state.settings) return state;
      return {
        ...state,
        settings: { ...state.settings, organization: action.payload }
      };
    
    case 'ADD_SUPPORT_TICKET':
      if (!state.settings) return state;
      return {
        ...state,
        settings: {
          ...state.settings,
          supportTickets: [...state.settings.supportTickets, action.payload]
        }
      };
    
    case 'UPDATE_SUPPORT_TICKET':
      if (!state.settings) return state;
      return {
        ...state,
        settings: {
          ...state.settings,
          supportTickets: state.settings.supportTickets.map(ticket =>
            ticket.ticket_id === action.payload.id
              ? { ...ticket, ...action.payload.updates }
              : ticket
          )
        }
      };
    
    case 'ADD_API_KEY':
      if (!state.settings) return state;
      return {
        ...state,
        settings: {
          ...state.settings,
          apiKeys: [...state.settings.apiKeys, action.payload]
        }
      };
    
    case 'REMOVE_API_KEY':
      if (!state.settings) return state;
      return {
        ...state,
        settings: {
          ...state.settings,
          apiKeys: state.settings.apiKeys.filter(key => key.id !== action.payload)
        }
      };
    
    case 'UPDATE_API_KEY':
      if (!state.settings) return state;
      return {
        ...state,
        settings: {
          ...state.settings,
          apiKeys: state.settings.apiKeys.map(key =>
            key.id === action.payload.id
              ? { ...key, ...action.payload.updates }
              : key
          )
        }
      };
    
    case 'ADD_WEBHOOK':
      if (!state.settings) return state;
      return {
        ...state,
        settings: {
          ...state.settings,
          webhooks: [...state.settings.webhooks, action.payload]
        }
      };
    
    case 'UPDATE_WEBHOOK':
      if (!state.settings) return state;
      return {
        ...state,
        settings: {
          ...state.settings,
          webhooks: state.settings.webhooks.map(webhook =>
            webhook.id === action.payload.id
              ? { ...webhook, ...action.payload.updates }
              : webhook
          )
        }
      };
    
    case 'REMOVE_WEBHOOK':
      if (!state.settings) return state;
      return {
        ...state,
        settings: {
          ...state.settings,
          webhooks: state.settings.webhooks.filter(webhook => webhook.id !== action.payload)
        }
      };
    
    case 'UPDATE_INTEGRATION':
      if (!state.settings) return state;
      return {
        ...state,
        settings: {
          ...state.settings,
          integrations: state.settings.integrations.map(integration =>
            integration.id === action.payload.id
              ? { ...integration, ...action.payload.updates }
              : integration
          )
        }
      };
    
    case 'UPDATE_NOTIFICATIONS':
      if (!state.settings) return state;
      return {
        ...state,
        settings: { ...state.settings, notifications: action.payload }
      };
    
    default:
      return state;
  }
}

// Context
const SettingsContext = createContext<SettingsContextType | null>(null);

// Provider Props
interface SettingsProviderProps {
  children: ReactNode;
}

// Provider Component
export function SettingsProvider({ children }: SettingsProviderProps) {
  const [state, dispatch] = useReducer(settingsReducer, initialState);

  // Load initial settings
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Load all settings data in parallel
      const [
        userResponse,
        ticketsResponse,
        apiKeysResponse,
        webhooksResponse,
        integrationsResponse,
        calendarResponse,
        notificationsResponse
      ] = await Promise.all([
        settingsAPI.getCurrentUser(),
        settingsAPI.getSupportTickets(),
        settingsAPI.getAPIKeys(),
        settingsAPI.getWebhooks(),
        settingsAPI.getIntegrations(),
        settingsAPI.getCalendarIntegrations(),
        settingsAPI.getNotificationPreferences()
      ]);

      if (!userResponse.success) {
        throw new Error(userResponse.error || 'Failed to load user profile');
      }

      const userProfile = userResponse.data!;

      // Load organization and voice preferences using user data
      const [orgResponse, voiceResponse, billingResponse] = await Promise.all([
        settingsAPI.getOrganization(userProfile.organization_id),
        settingsAPI.getVoicePreferences(userProfile.id),
        settingsAPI.getBillingInfo()
      ]);

      const settings: SettingsState = {
        userProfile,
        voicePreferences: voiceResponse.success ? voiceResponse.data! : {
          customer_id: userProfile.id,
          voice_tier: 'regular',
          preferred_voice: 'default',
          language: 'en-US',
          agent_type: 'professional',
          call_settings: {
            max_duration: 300,
            retry_attempts: 3,
            voice_speed: 1.0,
            voice_pitch: 1.0,
            voice_volume: 1.0
          },
          cost_optimization: true,
          usage_analytics: true
        },
        organization: orgResponse.success ? orgResponse.data! : {
          id: userProfile.organization_id,
          name: userProfile.organization_name,
          subdomain: '',
          subscription_tier: userProfile.subscription_tier,
          voice_tier: 'basic',
          team_size: 1,
          max_team_size: 2,
          created_at: new Date().toISOString(),
          settings: {
            default_voice: 'default',
            call_recording: true,
            data_retention_days: 30,
            api_access_enabled: true,
            webhook_notifications: true
          }
        },
        billing: billingResponse.success ? billingResponse.data! : {
          subscription: {
            tier: userProfile.subscription_tier,
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            monthly_cost: 0,
            next_invoice_amount: 0
          },
          usage: {
            regular_minutes_used: 0,
            premium_minutes_used: 0,
            regular_minutes_cost: 0,
            premium_minutes_cost: 0,
            total_cost: 0,
            billing_cycle_start: new Date().toISOString()
          },
          payment_methods: [],
          invoices: [],
          spending_limits: {
            alert_threshold: 80
          }
        },
        apiKeys: apiKeysResponse.success ? apiKeysResponse.data! : [],
        integrations: integrationsResponse.success ? integrationsResponse.data! : [],
        supportTickets: ticketsResponse.success ? ticketsResponse.data! : [],
        calendarIntegrations: calendarResponse.success ? calendarResponse.data! : [],
        webhooks: webhooksResponse.success ? webhooksResponse.data! : [],
        notifications: notificationsResponse.success ? notificationsResponse.data! : {
          email_notifications: {
            billing_updates: true,
            support_updates: true,
            system_alerts: true,
            usage_reports: false
          },
          sms_notifications: {
            critical_alerts: true,
            billing_failures: true
          },
          in_app_notifications: {
            real_time_updates: true,
            call_completions: true,
            team_activities: false
          }
        }
      };

      dispatch({ type: 'SET_SETTINGS', payload: settings });
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to load settings' 
      });
    }
  };

  // Context methods
  const updateUserProfile = async (data: Partial<UserProfile>) => {
    try {
      const response = await settingsAPI.updateUserProfile(data);
      if (response.success && response.data) {
        dispatch({ type: 'UPDATE_USER_PROFILE', payload: response.data });
      } else {
        throw new Error(response.error || 'Failed to update profile');
      }
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to update profile' 
      });
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const response = await settingsAPI.changePassword(currentPassword, newPassword);
      if (!response.success) {
        throw new Error(response.error || 'Failed to change password');
      }
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to change password' 
      });
      throw error;
    }
  };

  const setupTwoFactor = async () => {
    const response = await settingsAPI.setupTwoFactor();
    if (!response.success) {
      throw new Error(response.error || 'Failed to setup two-factor authentication');
    }
    return response.data!;
  };

  const updateVoicePreferences = async (data: Partial<VoicePreferences>) => {
    try {
      if (!state.settings) throw new Error('Settings not loaded');
      
      const response = await settingsAPI.updateVoicePreferences(state.settings.userProfile.id, data);
      if (response.success && response.data) {
        dispatch({ type: 'UPDATE_VOICE_PREFERENCES', payload: response.data });
      } else {
        throw new Error(response.error || 'Failed to update voice preferences');
      }
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to update voice preferences' 
      });
      throw error;
    }
  };

  const previewVoice = async (voiceId: string, text: string) => {
    const response = await settingsAPI.previewVoice(voiceId, text);
    if (!response.success) {
      throw new Error(response.error || 'Failed to preview voice');
    }
    return response.data!.audio_url;
  };

  const updateOrganization = async (data: Partial<Organization>) => {
    try {
      if (!state.settings) throw new Error('Settings not loaded');
      
      const response = await settingsAPI.updateOrganization(state.settings.organization.id, data);
      if (response.success && response.data) {
        dispatch({ type: 'UPDATE_ORGANIZATION', payload: response.data });
      } else {
        throw new Error(response.error || 'Failed to update organization');
      }
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to update organization' 
      });
      throw error;
    }
  };

  const inviteTeamMember = async (email: string, role: string) => {
    try {
      if (!state.settings) throw new Error('Settings not loaded');
      
      const response = await settingsAPI.inviteTeamMember(state.settings.organization.id, email, role);
      if (!response.success) {
        throw new Error(response.error || 'Failed to invite team member');
      }
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to invite team member' 
      });
      throw error;
    }
  };

  const removeTeamMember = async (userId: string) => {
    try {
      if (!state.settings) throw new Error('Settings not loaded');
      
      const response = await settingsAPI.removeTeamMember(state.settings.organization.id, userId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to remove team member');
      }
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to remove team member' 
      });
      throw error;
    }
  };

  const createSupportTicket = async (ticket: Omit<SupportTicket, 'ticket_id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await settingsAPI.createSupportTicket(ticket);
      if (response.success && response.data) {
        const newTicket: SupportTicket = {
          ...ticket,
          ticket_id: response.data.ticket_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          messages: []
        };
        dispatch({ type: 'ADD_SUPPORT_TICKET', payload: newTicket });
        return response.data.ticket_id;
      } else {
        throw new Error(response.error || 'Failed to create support ticket');
      }
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to create support ticket' 
      });
      throw error;
    }
  };

  const updateTicket = async (ticketId: string, updates: Partial<SupportTicket>) => {
    dispatch({ type: 'UPDATE_SUPPORT_TICKET', payload: { id: ticketId, updates } });
  };

  const addTicketMessage = async (ticketId: string, message: string, attachments?: File[]) => {
    try {
      const response = await settingsAPI.addTicketMessage(ticketId, message, attachments);
      if (!response.success) {
        throw new Error(response.error || 'Failed to add message');
      }
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to add message' 
      });
      throw error;
    }
  };

  const updatePaymentMethod = async (paymentMethodId: string) => {
    try {
      const response = await settingsAPI.updatePaymentMethod(paymentMethodId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update payment method');
      }
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to update payment method' 
      });
      throw error;
    }
  };

  const downloadInvoice = async (invoiceId: string) => {
    try {
      const response = await settingsAPI.downloadInvoice(invoiceId);
      if (response.success && response.data) {
        window.open(response.data.pdf_url, '_blank');
      } else {
        throw new Error(response.error || 'Failed to download invoice');
      }
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to download invoice' 
      });
      throw error;
    }
  };

  const updateSpendingLimits = async (limits: Partial<{ monthly_limit?: number; alert_threshold: number }>) => {
    // This would update the billing info in state
    // Implementation depends on API structure
    if (!state.settings) throw new Error('Settings not loaded');
    
    // Update local state optimistically
    const updatedBilling = {
      ...state.settings.billing,
      spending_limits: { ...state.settings.billing.spending_limits, ...limits }
    };
    
    // Here you would make an API call to update spending limits
    // For now, we'll just update local state
  };

  const connectCalendar = async (provider: string) => {
    const response = await settingsAPI.initiateCalendarAuth(provider);
    if (!response.success) {
      throw new Error(response.error || 'Failed to initiate calendar connection');
    }
    return response.data!.auth_url;
  };

  const disconnectCalendar = async (integrationId: string) => {
    try {
      const response = await settingsAPI.disconnectCalendar(integrationId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to disconnect calendar');
      }
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to disconnect calendar' 
      });
      throw error;
    }
  };

  const syncCalendar = async (integrationId: string) => {
    try {
      const response = await settingsAPI.syncCalendar(integrationId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to sync calendar');
      }
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to sync calendar' 
      });
      throw error;
    }
  };

  const createAPIKey = async (name: string, permissions: string[]) => {
    try {
      const response = await settingsAPI.createAPIKey(name, permissions);
      if (response.success && response.data) {
        dispatch({ type: 'ADD_API_KEY', payload: response.data });
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to create API key');
      }
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to create API key' 
      });
      throw error;
    }
  };

  const revokeAPIKey = async (keyId: string) => {
    try {
      const response = await settingsAPI.revokeAPIKey(keyId);
      if (response.success) {
        dispatch({ type: 'REMOVE_API_KEY', payload: keyId });
      } else {
        throw new Error(response.error || 'Failed to revoke API key');
      }
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to revoke API key' 
      });
      throw error;
    }
  };

  const updateAPIKey = async (keyId: string, updates: Partial<APIKey>) => {
    try {
      const response = await settingsAPI.updateAPIKey(keyId, updates);
      if (response.success && response.data) {
        dispatch({ type: 'UPDATE_API_KEY', payload: { id: keyId, updates: response.data } });
      } else {
        throw new Error(response.error || 'Failed to update API key');
      }
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to update API key' 
      });
      throw error;
    }
  };

  const createWebhook = async (webhook: Omit<WebhookEndpoint, 'id' | 'last_delivery' | 'failure_count'>) => {
    try {
      const response = await settingsAPI.createWebhook(webhook);
      if (response.success && response.data) {
        const newWebhook: WebhookEndpoint = {
          ...webhook,
          id: response.data.id,
          last_delivery: {
            success: false,
            status_code: 0,
            timestamp: '',
            response_time: 0
          },
          failure_count: 0
        };
        dispatch({ type: 'ADD_WEBHOOK', payload: newWebhook });
        return response.data.id;
      } else {
        throw new Error(response.error || 'Failed to create webhook');
      }
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to create webhook' 
      });
      throw error;
    }
  };

  const updateWebhook = async (webhookId: string, updates: Partial<WebhookEndpoint>) => {
    try {
      const response = await settingsAPI.updateWebhook(webhookId, updates);
      if (response.success) {
        dispatch({ type: 'UPDATE_WEBHOOK', payload: { id: webhookId, updates } });
      } else {
        throw new Error(response.error || 'Failed to update webhook');
      }
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to update webhook' 
      });
      throw error;
    }
  };

  const testWebhook = async (webhookId: string) => {
    const response = await settingsAPI.testWebhook(webhookId);
    if (!response.success) {
      throw new Error(response.error || 'Failed to test webhook');
    }
    return response.data!.success;
  };

  const connectIntegration = async (type: string, config: Record<string, any>) => {
    try {
      const response = await settingsAPI.connectIntegration(type, config);
      if (!response.success) {
        throw new Error(response.error || 'Failed to connect integration');
      }
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to connect integration' 
      });
      throw error;
    }
  };

  const disconnectIntegration = async (integrationId: string) => {
    try {
      const response = await settingsAPI.disconnectIntegration(integrationId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to disconnect integration');
      }
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to disconnect integration' 
      });
      throw error;
    }
  };

  const updateNotificationPreferences = async (preferences: Partial<NotificationPreferences>) => {
    try {
      const response = await settingsAPI.updateNotificationPreferences(preferences);
      if (response.success && response.data) {
        dispatch({ type: 'UPDATE_NOTIFICATIONS', payload: response.data });
      } else {
        throw new Error(response.error || 'Failed to update notification preferences');
      }
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to update notification preferences' 
      });
      throw error;
    }
  };

  const contextValue: SettingsContextType = {
    settings: state.settings,
    loading: state.loading,
    error: state.error,
    updateUserProfile,
    changePassword,
    setupTwoFactor,
    updateVoicePreferences,
    previewVoice,
    updateOrganization,
    inviteTeamMember,
    removeTeamMember,
    createSupportTicket,
    updateTicket,
    addTicketMessage,
    updatePaymentMethod,
    downloadInvoice,
    updateSpendingLimits,
    connectCalendar,
    disconnectCalendar,
    syncCalendar,
    createAPIKey,
    revokeAPIKey,
    updateAPIKey,
    createWebhook,
    updateWebhook,
    testWebhook,
    connectIntegration,
    disconnectIntegration,
    updateNotificationPreferences,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

// Hook to use settings context
export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
