import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser, logout } from './utils/auth.js';
import LoginForm from './components/auth/LoginForm.jsx';
import RegistrationForm from './components/auth/RegistrationForm.jsx';
import WelcomeMessage from './components/WelcomeMessage.jsx';
import VocilioDashboard from './components/VocilioDashboard';
import AddFunds from './components/AddFunds.jsx';
import TransactionHistory from './components/TransactionHistory.jsx';
import UsageDashboard from './components/UsageDashboard.jsx';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [userAuthenticated, setUserAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Check authentication status on app load
    const checkAuth = async () => {
      try {
        const authenticated = isAuthenticated();
        setUserAuthenticated(authenticated);
        
        if (authenticated) {
          const userData = getCurrentUser();
          setUser(userData);
          console.log('🏢 User loaded:', userData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUserAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUserAuthenticated(true);
    setUser(userData.user || userData);
    console.log('✅ Login successful:', userData);
  };

  const handleRegistrationSuccess = (userData) => {
    setUserAuthenticated(true);
    setUser(userData.user || userData);
    setShowWelcome(true);
    console.log('✅ Registration successful:', userData);
  };

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
  };

  const handleLogout = () => {
    logout();
    setUserAuthenticated(false);
    setUser(null);
    setShowWelcome(false);
  };

  const handleAddFundsSuccess = (amount) => {
    console.log(`✅ Added $${amount} to wallet`);
    // You might want to refresh wallet balance here
    window.location.href = '/dashboard';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Vocelio...</p>
        </div>
      </div>
    );
  }

  // Show welcome message after registration
  if (showWelcome && userAuthenticated) {
    return (
      <WelcomeMessage 
        user={user} 
        onGetStarted={handleWelcomeComplete}
      />
    );
  }

  return (
    <Router>
      <div className="App">
        {/* Organization branding header */}
        {userAuthenticated && user && (
          <div className="bg-blue-600 text-white px-4 py-2 text-sm">
            <div className="flex justify-between items-center max-w-7xl mx-auto">
              <span>
                {user.organization_name} • {user.subdomain}.vocelio.com
              </span>
              <span>
                Starter Tier • Regular Voice • Wallet System Active
              </span>
            </div>
          </div>
        )}

        <Routes>
          <Route 
            path="/login" 
            element={
              userAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <LoginForm onLoginSuccess={handleLoginSuccess} />
            } 
          />
          <Route 
            path="/register" 
            element={
              userAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <RegistrationForm onRegistrationSuccess={handleRegistrationSuccess} />
            } 
          />
          
          {/* Wallet Routes */}
          <Route 
            path="/wallet/add-funds" 
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 py-8">
                  <div className="max-w-2xl mx-auto">
                    <AddFunds 
                      onSuccess={handleAddFundsSuccess}
                      onCancel={() => window.history.back()}
                    />
                  </div>
                </div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/wallet/history" 
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 py-8">
                  <div className="max-w-4xl mx-auto px-4">
                    <div className="mb-6">
                      <button
                        onClick={() => window.history.back()}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        ← Back to Dashboard
                      </button>
                    </div>
                    <TransactionHistory />
                  </div>
                </div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/usage" 
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 py-8">
                  <div className="max-w-6xl mx-auto px-4">
                    <div className="mb-6">
                      <button
                        onClick={() => window.history.back()}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        ← Back to Dashboard
                      </button>
                    </div>
                    <UsageDashboard />
                  </div>
                </div>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/dashboard/*" 
            element={
              <ProtectedRoute>
                <VocilioDashboard 
                  onLogout={handleLogout} 
                  user={user}
                />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/" 
            element={<Navigate to="/dashboard" replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
