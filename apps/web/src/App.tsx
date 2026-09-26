import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout.js';
import { LandingPage } from './pages/LandingPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { EvidencePage } from './pages/EvidencePage.js';
import { AssessmentsPage } from './pages/AssessmentsPage.js';
import { JobsPage } from './pages/JobsPage.js';
import { PrivacyPage } from './pages/PrivacyPage.js';
import { TermsPage } from './pages/TermsPage.js';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="evidence" element={<EvidencePage />} />
          <Route path="assessments" element={<AssessmentsPage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
