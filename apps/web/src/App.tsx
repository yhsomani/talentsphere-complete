import React from 'react';
import { BrowserRouter, Navigate, Routes, Route, useLocation } from 'react-router-dom';
import { getToken } from './lib/session.js';
import { SessionProvider } from './lib/SessionContext.js';
import { Layout } from './components/Layout.js';
import { LandingPage } from './pages/LandingPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { SignUpPage } from './pages/SignUpPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { EvidencePage } from './pages/EvidencePage.js';
import { AssessmentsPage } from './pages/AssessmentsPage.js';
import { JobsPage } from './pages/JobsPage.js';
import { JobDetailPage } from './pages/JobDetailPage.js';
import { ApplicationsPage } from './pages/ApplicationsPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { HiringPage } from './pages/HiringPage.js';
import { HiringJobPage } from './pages/HiringJobPage.js';
import { ReferencePage } from './pages/ReferencePage.js';
import { NotificationsPage } from './pages/NotificationsPage.js';
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

const guarded = (element: React.ReactElement) => <RequireAuth>{element}</RequireAuth>;

export const App: React.FC = () => {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<LandingPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignUpPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="terms" element={<TermsPage />} />
            {/* Job browsing is public; applying requires a session. */}
            <Route path="jobs" element={<JobsPage />} />
            <Route path="jobs/:id" element={<JobDetailPage />} />
            {/* A referee responds from an emailed link, without an account. */}
            <Route path="reference/:id" element={<ReferencePage />} />
            <Route path="dashboard" element={guarded(<DashboardPage />)} />
            <Route path="applications" element={guarded(<ApplicationsPage />)} />
            <Route path="evidence" element={guarded(<EvidencePage />)} />
            <Route path="profile" element={guarded(<ProfilePage />)} />
            <Route path="notifications" element={guarded(<NotificationsPage />)} />
            <Route path="hiring" element={guarded(<HiringPage />)} />
            <Route path="hiring/jobs/:id" element={guarded(<HiringJobPage />)} />
            <Route path="assessments" element={guarded(<AssessmentsPage />)} />
            {/* Catch-all: friendly 404 page for any unknown route */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  );
};

export default App;
