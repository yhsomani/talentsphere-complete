import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { colors, spacing } from '@talentsphere/ui';
import { ShieldCheckIcon } from './ui/Icons.js';

export const Layout: React.FC = () => {
  const location = useLocation();
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOnline(navigator.onLine);

    try {
      const stored = localStorage.getItem('talentsphere_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.email) setUserEmail(parsed.email);
      }
    } catch {
      // Ignored
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [location.pathname]);

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard', testId: 'nav-dashboard' },
    { label: 'Evidence', path: '/evidence', testId: 'nav-evidence' },
    { label: 'Assessments', path: '/assessments', testId: 'nav-assessments' },
    { label: 'Opportunities', path: '/jobs', testId: 'nav-jobs' },
    { label: 'Pricing', path: '/checkout', testId: 'nav-checkout' },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: colors.neutral[50],
        color: colors.neutral[900],
      }}
    >
      {/* WCAG 2.2 AA Skip Link */}
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 'auto',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          zIndex: 9999,
          background: colors.primary[700],
          color: '#ffffff',
          padding: `${spacing.sm} ${spacing.md}`,
          fontWeight: 600,
          borderRadius: '4px',
          textDecoration: 'none',
        }}
        onFocus={(e) => {
          e.currentTarget.style.position = 'fixed';
          e.currentTarget.style.top = '12px';
          e.currentTarget.style.left = '12px';
          e.currentTarget.style.width = 'auto';
          e.currentTarget.style.height = 'auto';
        }}
        onBlur={(e) => {
          e.currentTarget.style.position = 'absolute';
          e.currentTarget.style.left = '-9999px';
          e.currentTarget.style.width = '1px';
          e.currentTarget.style.height = '1px';
        }}
      >
        Skip to main content
      </a>

      {/* Offline Safety Indicator */}
      {!isOnline && (
        <div
          role="status"
          aria-live="polite"
          style={{
            backgroundColor: colors.semantic.warning,
            color: '#000000',
            textAlign: 'center',
            padding: `${spacing.xs} ${spacing.md}`,
            fontSize: '0.8125rem',
            fontWeight: 600,
          }}
        >
          You are currently offline. Viewing cached credentials and saved opportunities.
        </div>
      )}

      {/* App Header */}
      <header
        style={{
          backgroundColor: '#ffffff',
          borderBottom: `1px solid ${colors.neutral[200]}`,
          padding: `0 ${spacing.xl}`,
          height: '64px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xl }}>
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              fontWeight: 800,
              fontSize: '1.1875rem',
              letterSpacing: '-0.02em',
              color: colors.neutral[900],
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                backgroundColor: colors.primary[700],
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <ShieldCheckIcon size={16} />
            </div>
            <span>TalentSphere</span>
          </Link>

          <nav aria-label="Main Navigation" style={{ display: 'flex', gap: spacing.xs, alignItems: 'center' }}>
            {navLinks.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  data-testid={item.testId}
                  style={{
                    textDecoration: 'none',
                    color: isActive ? colors.primary[700] : colors.neutral[600],
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.875rem',
                    padding: `${spacing.xs} ${spacing.sm}`,
                    borderRadius: '4px',
                    backgroundColor: isActive ? colors.primary[50] : 'transparent',
                    transition: 'all 0.15s ease-in-out',
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              color: colors.neutral[700],
              backgroundColor: colors.neutral[100],
              border: `1px solid ${colors.neutral[300]}`,
              padding: '2px 8px',
              borderRadius: '4px',
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: colors.semantic.success,
                display: 'inline-block',
              }}
            />
            <span>PWA Active</span>
          </div>

          {userEmail ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
              <span style={{ fontSize: '0.8125rem', color: colors.neutral[600] }}>
                {userEmail}
              </span>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('talentsphere_user');
                  localStorage.removeItem('talentsphere_token');
                  setUserEmail(null);
                }}
                style={{
                  fontSize: '0.75rem',
                  color: colors.neutral[500],
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              data-testid="nav-login"
              style={{
                textDecoration: 'none',
                color: location.pathname === '/login' ? colors.primary[800] : colors.primary[700],
                fontWeight: 600,
                fontSize: '0.875rem',
                padding: '6px 14px',
                borderRadius: '4px',
                border: `1px solid ${colors.primary[300]}`,
                backgroundColor: location.pathname === '/login' ? colors.primary[50] : '#ffffff',
              }}
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main
        id="main-content"
        tabIndex={-1}
        style={{
          flex: 1,
          padding: `${spacing.xl} ${spacing.lg}`,
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
          outline: 'none',
        }}
      >
        <Outlet />
      </main>

      {/* Production Footer */}
      <footer
        style={{
          borderTop: `1px solid ${colors.neutral[200]}`,
          backgroundColor: '#ffffff',
          padding: `${spacing['2xl']} ${spacing.xl} ${spacing.xl}`,
          marginTop: 'auto',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: spacing.xl,
            marginBottom: spacing.xl,
          }}
        >
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: colors.neutral[900], marginBottom: spacing.xs }}>
              TalentSphere
            </div>
            <p style={{ fontSize: '0.8125rem', color: colors.neutral[600], lineHeight: 1.6, margin: 0 }}>
              The cryptographic talent network. Grounding human capability in verifiable evidence, proctored benchmarks, and transparent matching.
            </p>
          </div>

          <div>
            <div style={{ fontWeight: 600, fontSize: '0.8125rem', textTransform: 'uppercase', color: colors.neutral[400], marginBottom: spacing.sm, letterSpacing: '0.05em' }}>
              Platform
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: spacing.xs, fontSize: '0.875rem' }}>
              <li><Link to="/evidence" style={{ color: colors.neutral[600], textDecoration: 'none' }}>Evidence Graph</Link></li>
              <li><Link to="/assessments" style={{ color: colors.neutral[600], textDecoration: 'none' }}>Proctored Sandbox</Link></li>
              <li><Link to="/jobs" style={{ color: colors.neutral[600], textDecoration: 'none' }}>Verifiable Opportunities</Link></li>
              <li><Link to="/checkout" style={{ color: colors.neutral[600], textDecoration: 'none' }}>Plans & Pricing</Link></li>
            </ul>
          </div>

          <div>
            <div style={{ fontWeight: 600, fontSize: '0.8125rem', textTransform: 'uppercase', color: colors.neutral[400], marginBottom: spacing.sm, letterSpacing: '0.05em' }}>
              Trust & Governance
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: spacing.xs, fontSize: '0.875rem' }}>
              <li><Link to="/privacy" style={{ color: colors.neutral[600], textDecoration: 'none' }}>Privacy Policy (GDPR/CCPA)</Link></li>
              <li><Link to="/terms" style={{ color: colors.neutral[600], textDecoration: 'none' }}>Terms & Integrity Standards</Link></li>
              <li><span style={{ color: colors.neutral[500], cursor: 'default' }}>Differential Privacy (k &ge; 10)</span></li>
              <li><span style={{ color: colors.neutral[500], cursor: 'default' }}>Anti-LLM Scraping Safe</span></li>
            </ul>
          </div>

          <div>
            <div style={{ fontWeight: 600, fontSize: '0.8125rem', textTransform: 'uppercase', color: colors.neutral[400], marginBottom: spacing.sm, letterSpacing: '0.05em' }}>
              Verification SLA
            </div>
            <p style={{ fontSize: '0.8125rem', color: colors.neutral[600], lineHeight: 1.6, margin: 0 }}>
              All employer signature requests execute through cryptographically hashed challenge tokens. Disposable email domains strictly barred.
            </p>
          </div>
        </div>

        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            borderTop: `1px solid ${colors.neutral[200]}`,
            paddingTop: spacing.md,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: spacing.sm,
            fontSize: '0.75rem',
            color: colors.neutral[500],
          }}
        >
          <div>TalentSphere &copy; 2026. Cryptographically Verified Talent Network. All rights reserved.</div>
          <div style={{ display: 'flex', gap: spacing.md }}>
            <Link to="/privacy" style={{ color: colors.neutral[500], textDecoration: 'none' }}>Privacy</Link>
            <Link to="/terms" style={{ color: colors.neutral[500], textDecoration: 'none' }}>Terms</Link>
            <span style={{ color: colors.neutral[400] }}>SOC2 Type II Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
