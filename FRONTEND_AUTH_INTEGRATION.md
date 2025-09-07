# 🔐 Vocelio Authentication Service Integration Guide

## Frontend Dashboard Integration for https://app.vocelio.ai

This guide shows how to integrate your frontend dashboard with the Vocelio Authentication Service for complete user authentication including login, signup, password reset, and SMS-based two-factor authentication.

## 🌐 Authentication Service Endpoints

**Base URL**: `https://auth-service-313373223340.us-central1.run.app`

## 📋 Frontend Integration Checklist

### 1. Authentication Flow Implementation

#### User Registration
```javascript
const registerUser = async (userData) => {
  const response = await fetch(`${AUTH_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: userData.email,
      password: userData.password,
      first_name: userData.firstName,
      last_name: userData.lastName,
      phone: userData.phone,
      organization_name: userData.organizationName,
      subdomain: userData.subdomain,
      subscription_tier: userData.tier || 'starter',
      voice_tier: userData.voiceTier || 'basic'
    })
  });
  
  if (response.ok) {
    const data = await response.json();
    // Store tokens and user info
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user_info', JSON.stringify(data.user_info));
    return data;
  } else {
    throw new Error('Registration failed');
  }
};
```

#### User Login (Basic)
```javascript
const loginUser = async (email, password) => {
  const response = await fetch(`${AUTH_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password })
  });
  
  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user_info', JSON.stringify(data.user_info));
    return data;
  } else {
    throw new Error('Login failed');
  }
};
```

#### Two-Factor Authentication Login
```javascript
const loginWith2FA = async (email, password, twoFactorCode = null) => {
  const response = await fetch(`${AUTH_BASE_URL}/auth/login-2fa`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      two_factor_code: twoFactorCode
    })
  });
  
  if (response.status === 202) {
    // 2FA code required
    return { requires2FA: true, message: 'Two-factor code sent to your phone' };
  } else if (response.ok) {
    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user_info', JSON.stringify(data.user_info));
    return data;
  } else {
    throw new Error('Login failed');
  }
};
```

#### Password Reset Request
```javascript
const requestPasswordReset = async (email) => {
  const response = await fetch(`${AUTH_BASE_URL}/auth/password-reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email })
  });
  
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error('Password reset request failed');
  }
};
```

#### Password Reset Confirmation
```javascript
const confirmPasswordReset = async (resetToken, newPassword) => {
  const response = await fetch(`${AUTH_BASE_URL}/auth/password-reset-confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reset_token: resetToken,
      new_password: newPassword
    })
  });
  
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error('Password reset failed');
  }
};
```

#### Two-Factor Authentication Setup
```javascript
const setup2FA = async (phone) => {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${AUTH_BASE_URL}/auth/two-factor/setup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ phone })
  });
  
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error('2FA setup failed');
  }
};

const verify2FA = async (phone, code) => {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${AUTH_BASE_URL}/auth/two-factor/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ phone, code })
  });
  
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error('2FA verification failed');
  }
};
```

### 2. Authentication State Management

#### Token Management
```javascript
class AuthManager {
  constructor() {
    this.baseURL = 'https://auth-service-313373223340.us-central1.run.app';
    this.token = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  async makeAuthenticatedRequest(url, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    let response = await fetch(url, {
      ...options,
      headers
    });

    // Handle token refresh
    if (response.status === 401 && this.refreshToken) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.token}`;
        response = await fetch(url, {
          ...options,
          headers
        });
      }
    }

    return response;
  }

  async refreshAccessToken() {
    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: this.refreshToken
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.token = data.access_token;
        localStorage.setItem('access_token', data.access_token);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    // Refresh failed, logout user
    this.logout();
    return false;
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    this.token = null;
    this.refreshToken = null;
    // Redirect to login page
    window.location.href = '/login';
  }

  isAuthenticated() {
    return !!this.token;
  }

  getUserInfo() {
    const userInfo = localStorage.getItem('user_info');
    return userInfo ? JSON.parse(userInfo) : null;
  }
}

// Initialize global auth manager
const authManager = new AuthManager();
```

### 3. Route Protection

#### React Router Protection
```javascript
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  if (!authManager.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Usage in your routes
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

### 4. Complete Login Component Example

```javascript
import React, { useState } from 'react';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await loginWith2FA(email, password, twoFactorCode);
      
      if (result.requires2FA) {
        setRequires2FA(true);
      } else {
        // Login successful, redirect to dashboard
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      {requires2FA && (
        <div>
          <label htmlFor="twoFactorCode">Two-Factor Code</label>
          <input
            type="text"
            id="twoFactorCode"
            value={twoFactorCode}
            onChange={(e) => setTwoFactorCode(e.target.value)}
            placeholder="Enter 6-digit code"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      )}

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </button>
    </form>
  );
};
```

### 5. Password Reset Component

```javascript
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const PasswordReset = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await confirmPasswordReset(token, newPassword);
      setSuccess(true);
    } catch (err) {
      setError('Password reset failed. The link may be expired.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold text-green-600">Password Reset Successful</h2>
        <p>You can now <a href="/login" className="text-blue-600">sign in</a> with your new password.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleReset} className="space-y-4">
      <h2 className="text-2xl font-bold">Reset Your Password</h2>
      
      <div>
        <label htmlFor="newPassword">New Password</label>
        <input
          type="password"
          id="newPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Resetting...' : 'Reset Password'}
      </button>
    </form>
  );
};
```

## 🔧 Environment Configuration

### Required Environment Variables for Auth Service

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key

# Database
DATABASE_URL=postgresql://vocelio_user:password@host:5432/vocelio

# Redis
REDIS_HOST=10.191.152.115
REDIS_PORT=6379

# Email Configuration (for password reset)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@vocelio.ai

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Frontend
FRONTEND_URL=https://app.vocelio.ai
```

## 🚀 Deployment Steps

1. **Update Auth Service**: Deploy the enhanced authentication service with new endpoints
2. **Frontend Integration**: Implement the authentication components in your React/Vue/Angular app
3. **Environment Setup**: Configure SMTP and SMS credentials
4. **Testing**: Test all authentication flows thoroughly

## 📱 SMS Provider Options

### Twilio (Recommended)
- Sign up at https://www.twilio.com
- Get Account SID, Auth Token, and Phone Number
- Very reliable, global coverage

### Alternative Providers
- AWS SNS
- MessageBird
- Vonage (Nexmo)

## 📧 Email Provider Options

### Gmail SMTP (Development)
- Use App Passwords for authentication
- SMTP Server: smtp.gmail.com:587

### Production Options
- SendGrid
- AWS SES
- Mailgun
- PostMark

## 🔐 Security Best Practices

1. **HTTPS Only**: Always use HTTPS in production
2. **Token Storage**: Use secure storage (HttpOnly cookies preferred over localStorage)
3. **Rate Limiting**: Implement rate limiting on auth endpoints
4. **Input Validation**: Validate all inputs on both frontend and backend
5. **Session Management**: Implement proper session timeout and cleanup

## 🧪 Testing Endpoints

```bash
# Test authentication service health
curl https://auth-service-313373223340.us-central1.run.app/health

# Test registration
curl -X POST https://auth-service-313373223340.us-central1.run.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "first_name": "Test",
    "last_name": "User",
    "organization_name": "Test Org",
    "subdomain": "testorg"
  }'

# Test login
curl -X POST https://auth-service-313373223340.us-central1.run.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

This integration guide provides everything needed to connect your https://app.vocelio.ai dashboard with the authentication service, including complete user management, security features, and production-ready patterns.
