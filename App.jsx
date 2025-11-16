import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from './utils/api';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Users from './pages/Users';
import Handovers from './pages/Handovers';

// Components
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Main App Component with Theme
const AppContent = () => {
  const { i18n } = useTranslation();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    // Fetch system settings for branding
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        const { appName, primaryColor, secondaryColor, defaultLanguage } = response.data.data.settings;
        
        setSettings({ appName, primaryColor, secondaryColor, defaultLanguage });
        
        // Apply theme colors
        document.documentElement.style.setProperty('--color-primary', primaryColor);
        document.documentElement.style.setProperty('--color-secondary', secondaryColor);
        
        // Apply default language
        i18n.changeLanguage(defaultLanguage);
        document.documentElement.setAttribute('dir', defaultLanguage === 'ar' ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', defaultLanguage);
        
        // Update page title
        document.title = appName || 'Najm Althuraya';
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };

    fetchSettings();
  }, [i18n]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login settings={settings} />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout settings={settings} setSettings={setSettings} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route 
            path="users" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
                <Users />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="handovers" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
                <Handovers />
              </ProtectedRoute>
            } 
          />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
