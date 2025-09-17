import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SettingsProvider } from '../../contexts/SettingsContext';
import { SettingsLayout } from './SettingsLayout';
import { UserProfileSettings } from './components/UserProfile/UserProfileSettings';
import { VoicePreferencesSettings } from './components/VoicePreferences/VoicePreferencesSettings';
import SupportSettingsComponent from './components/Support/SupportSettings';
import OrganizationSettingsComponent from './components/Organization/OrganizationSettings';
import BillingSettingsComponent from './components/Billing/BillingSettings';
// Import other settings components as they're created
// import { OrganizationSettings } from './components/Organization/OrganizationSettings';
// import { SupportSettings } from './components/Support/SupportSettings';
// import { BillingSettings } from './components/Billing/BillingSettings';
// import { CalendarSettings } from './components/Calendar/CalendarSettings';
// import { APISettings } from './components/API/APISettings';
// import { NotificationSettings } from './components/Notifications/NotificationSettings';

// Placeholder components for sections not yet implemented
const ComingSoonPlaceholder: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="text-center py-16">
    <div className="max-w-md mx-auto">
      <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">🚧</span>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
      <div className="mt-6">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          Coming Soon
        </span>
      </div>
    </div>
  </div>
);

const OrganizationSettings = () => <OrganizationSettingsComponent />;

const SupportSettings = () => <SupportSettingsComponent />;

const BillingSettings = () => <BillingSettingsComponent />;

const CalendarSettings = () => (
  <ComingSoonPlaceholder
    title="Calendar Integration"
    description="Google Calendar, Outlook, and scheduling integrations coming soon."
  />
);

const APISettings = () => (
  <ComingSoonPlaceholder
    title="API Management"
    description="API keys, webhooks, and developer tools will be available soon."
  />
);

const NotificationSettings = () => (
  <ComingSoonPlaceholder
    title="Notifications"
    description="Email, SMS, and in-app notification preferences coming soon."
  />
);

export function Settings() {
  return (
    <SettingsProvider>
      <Routes>
        <Route path="/" element={<SettingsLayout />}>
          <Route index element={<Navigate to="/settings/profile" replace />} />
          <Route path="profile" element={<UserProfileSettings />} />
          <Route path="voice" element={<VoicePreferencesSettings />} />
          <Route path="organization" element={<OrganizationSettings />} />
          <Route path="support" element={<SupportSettings />} />
          <Route path="billing" element={<BillingSettings />} />
          <Route path="calendar" element={<CalendarSettings />} />
          <Route path="api" element={<APISettings />} />
          <Route path="notifications" element={<NotificationSettings />} />
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/settings/profile" replace />} />
        </Route>
      </Routes>
    </SettingsProvider>
  );
}
