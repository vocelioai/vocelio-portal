import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authManager } from './services/authManager.js';
import LoginForm from './components/auth/LoginForm.jsx';
import RegistrationForm from './components/auth/RegistrationForm.jsx';
import VocilioDashboard from './components/VocilioDashboard';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  if (!authManager.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orgContext, setOrgContext] = useState(null);

  useEffect(() => {
    // Check authentication status on app load
    const checkAuth = async () => {
      try {
        const authenticated = authManager.isAuthenticated();
        setIsAuthenticated(authenticated);
        
        if (authenticated) {
          // Get organization context for UI
          const context = authManager.getOrganizationContext();
          setOrgContext(context);
          console.log('🏢 Organization loaded:', context);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (userData) => {
    setIsAuthenticated(true);
    const context = authManager.getOrganizationContext();
    setOrgContext(context);
    console.log('✅ Login successful, org context:', context);
  };

  const handleLogout = () => {
    authManager.logout();
    setIsAuthenticated(false);
    setOrgContext(null);
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

  return (
    <Router>
      <div className="App">
        {/* Organization branding header */}
        {isAuthenticated && orgContext && (
          <div className="bg-blue-600 text-white px-4 py-2 text-sm">
            <div className="flex justify-between items-center max-w-7xl mx-auto">
              <span>
                {orgContext.organizationName} • {orgContext.subdomain}.vocelio.ai
              </span>
              <span>
                {orgContext.subscriptionTier} • Voice: {orgContext.voiceTier}
              </span>
            </div>
          </div>
        )}

        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <LoginForm onLoginSuccess={handleLoginSuccess} />
            } 
          />
          <Route 
            path="/register" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <RegistrationForm onRegistrationSuccess={handleLoginSuccess} />
            } 
          />
          <Route 
            path="/dashboard/*" 
            element={
              <ProtectedRoute>
                <VocilioDashboard 
                  onLogout={handleLogout} 
                  orgContext={orgContext}
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
