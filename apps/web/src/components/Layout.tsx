import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { colors, spacing } from '@talentsphere/ui';

export const Layout: React.FC = () => {
  const location = useLocation();
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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
          background: colors.primary[600],
          color: '#fff',
          padding: spacing.sm,
        }}
        onFocus={(e) => {
          e.currentTarget.style.position = 'static';
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
            color: '#000',
            textAlign: 'center',
            padding: `${spacing.xs} ${spacing.md}`,
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          You are currently offline. Viewing cached evidence and saved opportunities.
        </div>
      )}

      {/* App Header */}
      <header
        style={{
          backgroundColor: '#ffffff',
          borderBottom: `1px solid ${colors.neutral[200]}`,
          padding: `${spacing.md} ${spacing.lg}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.lg }}>
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '1.25rem',
              color: colors.primary[700],
              display: 'flex',
              alignItems: 'center',
              gap: spacing.xs,
            }}
          >
            <span>TalentSphere</span>
          </Link>

          <nav aria-label="Main Navigation" style={{ display: 'flex', gap: spacing.md, alignItems: 'center' }}>
            <Link
              to="/dashboard"
              data-testid="nav-dashboard"
              style={{
                textDecoration: 'none',
                color:
                  location.pathname === '/dashboard' ? colors.primary[600] : colors.neutral[600],
                fontWeight: location.pathname === '/dashboard' ? 600 : 400,
                fontSize: '0.875rem',
              }}
            >
              Dashboard
            </Link>
            <Link
              to="/checkout"
              data-testid="nav-checkout"
              style={{
                textDecoration: 'none',
                color:
                  location.pathname === '/checkout' ? colors.primary[600] : colors.neutral[600],
                fontWeight: location.pathname === '/checkout' ? 600 : 400,
                fontSize: '0.875rem',
              }}
            >
              Plans & Pricing
            </Link>
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
          <Link
            to="/login"
            data-testid="nav-login"
            style={{
              textDecoration: 'none',
              color: location.pathname === '/login' ? colors.primary[700] : colors.primary[600],
              fontWeight: 600,
              fontSize: '0.875rem',
              padding: `${spacing.xs} ${spacing.sm}`,
              borderRadius: '6px',
              border: `1px solid ${colors.primary[200]}`,
              backgroundColor: location.pathname === '/login' ? colors.primary[50] : '#ffffff',
            }}
          >
            Sign In
          </Link>
          <span
            style={{
              fontSize: '0.75rem',
              backgroundColor: colors.primary[50],
              color: colors.primary[700],
              padding: `2px 8px`,
              borderRadius: '9999px',
              fontWeight: 600,
            }}
          >
            PWA Active
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main
        id="main-content"
        tabIndex={-1}
        style={{
          flex: 1,
          padding: spacing.lg,
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
          outline: 'none',
        }}
      >
        <Outlet />
      </main>

      {/* Accessible Footer */}
      <footer
        style={{
          borderTop: `1px solid ${colors.neutral[200]}`,
          padding: spacing.md,
          textAlign: 'center',
          fontSize: '0.75rem',
          color: colors.neutral[500],
          backgroundColor: '#ffffff',
        }}
      >
        TalentSphere &copy; 2026. Verified Talent Graph & Evidence Graph.
      </footer>
    </div>
  );
};
