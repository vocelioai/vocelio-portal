// Settings Types & Interfaces
export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  organization_id: string;
  organization_name: string;
  role: 'admin' | 'manager' | 'user' | 'viewer';
  subscription_tier: 'starter' | 'professional' | 'enterprise';
  created_at: string;
  last_login?: string;
  two_factor_enabled: boolean;
  profile_picture?: string;
  timezone: string;
}

export interface VoicePreferences {
  customer_id: string;
  voice_tier: 'regular' | 'premium';
  preferred_voice: string;
  language: string;
  agent_type: string;
  call_settings: {
    max_duration: number;
    retry_attempts: number;
    voice_speed: number;
    voice_pitch: number;
    voice_volume: number;
  };
  cost_optimization: boolean;
  usage_analytics: boolean;
}

export interface Organization {
  id: string;
  name: string;
  subdomain: string;
  subscription_tier: 'starter' | 'professional' | 'enterprise';
  voice_tier: 'basic' | 'premium';
  team_size: number;
  max_team_size: number;
  created_at: string;
  settings: {
    default_voice: string;
    call_recording: boolean;
    data_retention_days: number;
    api_access_enabled: boolean;
    webhook_notifications: boolean;
  };
  billing_info?: {
    payment_method: string;
    next_billing_date: string;
    monthly_cost: number;
  };
}

export interface SupportTicket {
  ticket_id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  category: string;
  created_at: string;
  updated_at: string;
  assignee?: string;
  customer_info: {
    user_id: string;
    organization: string;
    subscription_tier: string;
  };
  attachments: FileAttachment[];
  messages: TicketMessage[];
}

export interface FileAttachment {
  id: string;
  filename: string;
  size: number;
  mime_type: string;
  url: string;
}

export interface TicketMessage {
  id: string;
  message: string;
  sender: 'customer' | 'support';
  timestamp: string;
  attachments?: FileAttachment[];
}

export interface BillingInfo {
  subscription: {
    tier: 'starter' | 'professional' | 'enterprise';
    status: 'active' | 'cancelled' | 'past_due' | 'trialing';
    current_period_start: string;
    current_period_end: string;
    monthly_cost: number;
    next_invoice_amount: number;
  };
  usage: {
    regular_minutes_used: number;
    premium_minutes_used: number;
    regular_minutes_cost: number;
    premium_minutes_cost: number;
    total_cost: number;
    billing_cycle_start: string;
  };
  payment_methods: PaymentMethod[];
  invoices: Invoice[];
  spending_limits: {
    monthly_limit?: number;
    alert_threshold: number;
  };
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  brand?: string;
  last4: string;
  exp_month?: number;
  exp_year?: number;
  is_default: boolean;
}

export interface Invoice {
  id: string;
  number: string;
  amount: number;
  status: 'paid' | 'open' | 'void' | 'draft';
  created_at: string;
  due_date: string;
  pdf_url: string;
  line_items: InvoiceLineItem[];
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface CalendarIntegration {
  provider: 'google' | 'outlook' | 'apple';
  connected: boolean;
  account_email: string;
  sync_enabled: boolean;
  calendar_ids: string[];
  webhook_url?: string;
  last_sync: string;
  permissions: string[];
}

export interface APIKey {
  id: string;
  name: string;
  key: string; // Masked in UI
  permissions: string[];
  rate_limit: {
    requests_per_minute: number;
    requests_per_day: number;
  };
  usage: {
    requests_today: number;
    requests_this_month: number;
    last_used: string;
  };
  created_at: string;
  expires_at?: string;
  status: 'active' | 'disabled' | 'expired';
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  secret: string;
  last_delivery: {
    success: boolean;
    status_code: number;
    timestamp: string;
    response_time: number;
  };
  failure_count: number;
}

export interface Integration {
  id: string;
  type: 'calendly' | 'stripe' | 'sendgrid' | 'salesforce' | 'hubspot' | 'slack' | 'teams';
  name: string;
  connected: boolean;
  config: Record<string, any>;
  last_sync?: string;
  status: 'active' | 'error' | 'disabled';
}

export interface NotificationPreferences {
  email_notifications: {
    billing_updates: boolean;
    support_updates: boolean;
    system_alerts: boolean;
    usage_reports: boolean;
  };
  sms_notifications: {
    critical_alerts: boolean;
    billing_failures: boolean;
  };
  in_app_notifications: {
    real_time_updates: boolean;
    call_completions: boolean;
    team_activities: boolean;
  };
}

export interface SettingsState {
  userProfile: UserProfile;
  voicePreferences: VoicePreferences;
  organization: Organization;
  billing: BillingInfo;
  apiKeys: APIKey[];
  integrations: Integration[];
  supportTickets: SupportTicket[];
  calendarIntegrations: CalendarIntegration[];
  webhooks: WebhookEndpoint[];
  notifications: NotificationPreferences;
}

export interface SettingsContextType {
  settings: SettingsState | null;
  loading: boolean;
  error: string | null;
  
  // User Profile
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  setupTwoFactor: () => Promise<{ qr_code: string; backup_codes: string[] }>;
  
  // Voice Preferences
  updateVoicePreferences: (data: Partial<VoicePreferences>) => Promise<void>;
  previewVoice: (voiceId: string, text: string) => Promise<string>;
  
  // Organization
  updateOrganization: (data: Partial<Organization>) => Promise<void>;
  inviteTeamMember: (email: string, role: string) => Promise<void>;
  removeTeamMember: (userId: string) => Promise<void>;
  
  // Support
  createSupportTicket: (ticket: Omit<SupportTicket, 'ticket_id' | 'created_at' | 'updated_at'>) => Promise<string>;
  updateTicket: (ticketId: string, updates: Partial<SupportTicket>) => Promise<void>;
  addTicketMessage: (ticketId: string, message: string, attachments?: File[]) => Promise<void>;
  
  // Billing
  updatePaymentMethod: (paymentMethodId: string) => Promise<void>;
  downloadInvoice: (invoiceId: string) => Promise<void>;
  updateSpendingLimits: (limits: Partial<BillingInfo['spending_limits']>) => Promise<void>;
  
  // Calendar
  connectCalendar: (provider: string) => Promise<string>; // Returns OAuth URL
  disconnectCalendar: (integrationId: string) => Promise<void>;
  syncCalendar: (integrationId: string) => Promise<void>;
  
  // API Management
  createAPIKey: (name: string, permissions: string[]) => Promise<APIKey>;
  revokeAPIKey: (keyId: string) => Promise<void>;
  updateAPIKey: (keyId: string, updates: Partial<APIKey>) => Promise<void>;
  
  // Webhooks
  createWebhook: (webhook: Omit<WebhookEndpoint, 'id' | 'last_delivery' | 'failure_count'>) => Promise<string>;
  updateWebhook: (webhookId: string, updates: Partial<WebhookEndpoint>) => Promise<void>;
  testWebhook: (webhookId: string) => Promise<boolean>;
  
  // Integrations
  connectIntegration: (type: string, config: Record<string, any>) => Promise<void>;
  disconnectIntegration: (integrationId: string) => Promise<void>;
  
  // Notifications
  updateNotificationPreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form Types
export interface UserProfileFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  timezone: string;
}

export interface PasswordChangeFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface SupportTicketFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  attachments?: File[];
}
