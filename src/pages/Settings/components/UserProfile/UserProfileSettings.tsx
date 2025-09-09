import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { 
  User, 
  Camera, 
  Shield, 
  Key, 
  Smartphone,
  Globe,
  Mail,
  Phone,
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { useSettings } from '../../../../contexts/SettingsContext';
import { UserProfileFormData, PasswordChangeFormData } from '../../../../types/settings';

interface SecuritySession {
  id: string;
  device: string;
  location: string;
  ip_address: string;
  last_active: string;
  current: boolean;
}

// Mock sessions data - would come from API
const mockSessions: SecuritySession[] = [
  {
    id: '1',
    device: 'Chrome on Windows',
    location: 'New York, US',
    ip_address: '192.168.1.1',
    last_active: new Date().toISOString(),
    current: true
  },
  {
    id: '2',
    device: 'Safari on iPhone',
    location: 'New York, US', 
    ip_address: '10.0.0.1',
    last_active: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    current: false
  }
];

export function UserProfileSettings() {
  const { settings, updateUserProfile, changePassword, setupTwoFactor } = useSettings();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'sessions'>('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [twoFactorSetup, setTwoFactorSetup] = useState<{ qr_code?: string; backup_codes?: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profileForm = useForm<UserProfileFormData>({
    defaultValues: settings ? {
      first_name: settings.userProfile.first_name,
      last_name: settings.userProfile.last_name,
      email: settings.userProfile.email,
      phone: settings.userProfile.phone || '',
      timezone: settings.userProfile.timezone
    } : undefined
  });

  const passwordForm = useForm<PasswordChangeFormData>();

  if (!settings) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  const onProfileSubmit = async (data: UserProfileFormData) => {
    try {
      await updateUserProfile(data);
      // Show success message
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const onPasswordSubmit = async (data: PasswordChangeFormData) => {
    try {
      if (data.new_password !== data.confirm_password) {
        passwordForm.setError('confirm_password', { message: 'Passwords do not match' });
        return;
      }
      await changePassword(data.current_password, data.new_password);
      passwordForm.reset();
      // Show success message
    } catch (error) {
      console.error('Failed to change password:', error);
      passwordForm.setError('current_password', { message: 'Current password is incorrect' });
    }
  };

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Would upload to your file service
      const formData = new FormData();
      formData.append('file', file);
      formData.append('purpose', 'profile_picture');
      
      // Mock upload - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update user profile with new picture URL
      await updateUserProfile({ 
        profile_picture: URL.createObjectURL(file) 
      });
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetupTwoFactor = async () => {
    try {
      const result = await setupTwoFactor();
      setTwoFactorSetup(result);
    } catch (error) {
      console.error('Failed to setup 2FA:', error);
    }
  };

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'security' as const, label: 'Security', icon: Shield },
    { id: 'sessions' as const, label: 'Sessions', icon: Smartphone }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
        <p className="text-gray-600 mt-2">
          Manage your personal information, security settings, and active sessions
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl">
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
            {/* Profile Picture */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                {settings.userProfile.profile_picture ? (
                  <img
                    src={settings.userProfile.profile_picture}
                    alt="Profile"
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-medium">
                      {settings.userProfile.first_name[0]}{settings.userProfile.last_name[0]}
                    </span>
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white"></div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  className="hidden"
                />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Profile Picture</h3>
                <p className="text-sm text-gray-500">
                  Upload a profile picture to personalize your account
                </p>
              </div>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  {...profileForm.register('first_name', { required: 'First name is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {profileForm.formState.errors.first_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {profileForm.formState.errors.first_name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  {...profileForm.register('last_name', { required: 'Last name is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {profileForm.formState.errors.last_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {profileForm.formState.errors.last_name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  {...profileForm.register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {profileForm.formState.errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {profileForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4 inline mr-2" />
                  Phone Number
                </label>
                <input
                  {...profileForm.register('phone')}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="h-4 w-4 inline mr-2" />
                  Timezone
                </label>
                <select
                  {...profileForm.register('timezone')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="America/New_York">Eastern Time (UTC-5)</option>
                  <option value="America/Chicago">Central Time (UTC-6)</option>
                  <option value="America/Denver">Mountain Time (UTC-7)</option>
                  <option value="America/Los_Angeles">Pacific Time (UTC-8)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </div>

            {/* Organization Info (Read-only) */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Organization Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Organization:</span>
                  <p className="font-medium">{settings.userProfile.organization_name}</p>
                </div>
                <div>
                  <span className="text-gray-500">Role:</span>
                  <p className="font-medium capitalize">{settings.userProfile.role}</p>
                </div>
                <div>
                  <span className="text-gray-500">Subscription:</span>
                  <p className="font-medium capitalize">{settings.userProfile.subscription_tier}</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={profileForm.formState.isSubmitting}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>
                  {profileForm.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="max-w-2xl space-y-8">
          {/* Password Change */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Key className="h-5 w-5 mr-2" />
              Change Password
            </h3>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    {...passwordForm.register('current_password', { required: 'Current password is required' })}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordForm.formState.errors.current_password && (
                  <p className="text-red-500 text-sm mt-1">
                    {passwordForm.formState.errors.current_password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  {...passwordForm.register('new_password', { 
                    required: 'New password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' }
                  })}
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {passwordForm.formState.errors.new_password && (
                  <p className="text-red-500 text-sm mt-1">
                    {passwordForm.formState.errors.new_password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  {...passwordForm.register('confirm_password', { required: 'Please confirm your password' })}
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {passwordForm.formState.errors.confirm_password && (
                  <p className="text-red-500 text-sm mt-1">
                    {passwordForm.formState.errors.confirm_password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={passwordForm.formState.isSubmitting}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {passwordForm.formState.isSubmitting ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>

          {/* Two-Factor Authentication */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Two-Factor Authentication
            </h3>
            
            {settings.userProfile.two_factor_enabled ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <div>
                    <p className="font-medium text-gray-900">2FA is enabled</p>
                    <p className="text-sm text-gray-500">Your account is protected with two-factor authentication</p>
                  </div>
                </div>
                <button className="text-red-600 hover:text-red-700 font-medium">
                  Disable 2FA
                </button>
              </div>
            ) : (
              <div>
                {!twoFactorSetup ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="h-6 w-6 text-amber-500" />
                      <div>
                        <p className="font-medium text-gray-900">2FA is not enabled</p>
                        <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                      </div>
                    </div>
                    <button
                      onClick={handleSetupTwoFactor}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Enable 2FA
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Setup Two-Factor Authentication</h4>
                      <button
                        onClick={() => setTwoFactorSetup(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    
                    {twoFactorSetup.qr_code && (
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-4">
                          Scan this QR code with your authenticator app
                        </p>
                        <img src={twoFactorSetup.qr_code} alt="2FA QR Code" className="mx-auto" />
                      </div>
                    )}
                    
                    {twoFactorSetup.backup_codes && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-medium text-gray-900 mb-2">Backup Codes</h5>
                        <p className="text-sm text-gray-600 mb-3">
                          Save these backup codes in a secure location. You can use them to access your account if you lose your phone.
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                          {twoFactorSetup.backup_codes.map((code, index) => (
                            <div key={index} className="bg-white p-2 rounded border text-center">
                              {code}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="max-w-4xl">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Sessions</h3>
            <p className="text-gray-600">
              Manage your active login sessions across different devices and locations
            </p>
          </div>

          <div className="space-y-4">
            {mockSessions.map((session) => (
              <div key={session.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                      session.current ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <Smartphone className={`h-6 w-6 ${
                        session.current ? 'text-green-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">{session.device}</p>
                        {session.current && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Current session
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{session.location}</p>
                      <p className="text-xs text-gray-400">
                        IP: {session.ip_address} • Last active: {new Date(session.last_active).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {!session.current && (
                    <button className="text-red-600 hover:text-red-700 font-medium text-sm">
                      Terminate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800">Security Notice</p>
                <p className="text-amber-700">
                  If you notice any suspicious activity or unrecognized sessions, terminate them immediately and change your password.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
