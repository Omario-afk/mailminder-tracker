
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/components/dashboard/Dashboard';
import OrganizationList from '@/components/organizations/OrganizationList';
import OrganizationForm from '@/components/organizations/OrganizationForm';
import MemberManagement from '@/components/organizations/MemberManagement';
import TemplateManagement from '@/components/templates/TemplateManagement';
import TemplateSettings from '@/components/templates/TemplateSettings';
import NetworkConnections from '@/components/network/NetworkConnections';
import MailTracking from '@/components/mail/MailTracking';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LoginPage from '@/components/auth/LoginPage';
import SignupPage from '@/pages/SignupPage';
import { AuthProvider } from '@/context/AuthContext';
import { OrganizationProvider } from '@/context/OrganizationContext';
import '@/i18n/config';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <OrganizationProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/organizations" element={<OrganizationList />} />
                      <Route path="/organizations/new" element={<OrganizationForm />} />
                      <Route path="/organizations/:organizationId/edit" element={<OrganizationForm />} />
                      <Route path="/organizations/:organizationId/members" element={<MemberManagement />} />
                      <Route path="/templates" element={<TemplateManagement />} />
                      <Route path="/templates/new" element={<TemplateSettings />} />
                      <Route path="/templates/:templateId/settings" element={<TemplateSettings />} />
                      <Route path="/network" element={<NetworkConnections />} />
                      <Route path="/mail" element={<MailTracking />} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster />
        </OrganizationProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
