import React from 'react';
import { BrowserRouter, Navigate, Routes, Route, useLocation } from 'react-router-dom';
import { getToken } from './lib/session.js';
import { SessionProvider } from './lib/SessionContext.js';
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
// anyone else is sent to /login with the requested destination preserved in
// ?return= (SSOT auth contract), so signing in resumes the deep link instead
// of silently dropping the user on /dashboard.
const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const location = useLocation();
  if (getToken()) return children;
  const from = `${location.pathname}${location.search}`;
  return <Navigate to={`/login?return=${encodeURIComponent(from)}`} replace />;
};

export const App: React.FC = () => {
  return (
    <SessionProvider>
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
    </SessionProvider>
  );
};

export default App;
