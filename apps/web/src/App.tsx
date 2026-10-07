import React from 'react';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout.js';
import { LandingPage } from './pages/LandingPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { EvidencePage } from './pages/EvidencePage.js';
import { AssessmentsPage } from './pages/AssessmentsPage.js';
import { JobsPage } from './pages/JobsPage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';
import { PrivacyPage } from './pages/PrivacyPage.js';
import { TermsPage } from './pages/TermsPage.js';

// QW-04: authenticated workspaces are reachable only with a session token;
// anyone else is sent to /login instead of seeing private UI.
const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) =>
  localStorage.getItem('talentsphere_token') ? children : <Navigate to="/login" replace />;

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />
          {/* Job browsing is public; the apply transaction itself requires auth. */}
          <Route path="jobs" element={<JobsPage />} />
          <Route
            path="dashboard"
            element={
              <RequireAuth>
                <DashboardPage />
              </RequireAuth>
            }
          />
          <Route
            path="evidence"
            element={
              <RequireAuth>
                <EvidencePage />
              </RequireAuth>
            }
          />
          <Route
            path="assessments"
            element={
              <RequireAuth>
                <AssessmentsPage />
              </RequireAuth>
            }
          />
          {/* Catch-all: friendly 404 page for any unknown route */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
