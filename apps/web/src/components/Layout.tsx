import React, { useState, useEffect, useRef } from 'react';
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useNavigationType,
} from 'react-router-dom';
import { colors, spacing, motion } from '@talentsphere/ui';
import { BellIcon, MenuIcon, ShieldCheckIcon, XIcon } from './ui/Icons.js';
import { describePwaCapability, usePwaCapability } from '../pwa.js';
import { getStoredUser } from '../lib/session.js';
import { useSession } from '../lib/SessionContext.js';
import { apiJson } from '../lib/api.js';
import { NOTIFICATIONS_EVENT } from '../lib/notifications.js';

/**
 * Support contact is configuration, not copy: an address that nobody reads
 * (or a domain the business does not own) is worse than none. When
 * VITE_SUPPORT_EMAIL is unset the contact block is simply not rendered.
 */
const SUPPORT_EMAIL: string | undefined = import.meta.env.VITE_SUPPORT_EMAIL || undefined;

const HIRING_ROLES = ['recruiter', 'hiring_manager', 'platform_admin'];

interface NavItem {
  label: string;
  path: string;
  testId: string;
}

const PUBLIC_NAV: NavItem[] = [
  { label: 'Jobs', path: '/jobs', testId: 'nav-jobs' },
  { label: 'Pricing', path: '/checkout', testId: 'nav-checkout' },
];

const CANDIDATE_NAV: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', testId: 'nav-dashboard' },
  { label: 'Jobs', path: '/jobs', testId: 'nav-jobs' },
  { label: 'Applications', path: '/applications', testId: 'nav-applications' },
  { label: 'Work history', path: '/evidence', testId: 'nav-evidence' },
  { label: 'Profile', path: '/profile', testId: 'nav-profile' },
];

const HIRING_NAV: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', testId: 'nav-dashboard' },
  { label: 'Hiring', path: '/hiring', testId: 'nav-hiring' },
  { label: 'Jobs', path: '/jobs', testId: 'nav-jobs' },
  { label: 'Profile', path: '/profile', testId: 'nav-profile' },
];

const isActivePath = (pathname: string, path: string) =>
  pathname === path || pathname.startsWith(`${path}/`);

export const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const session = useSession();
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [routeAnnouncement, setRouteAnnouncement] = useState<string>('');
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const pwaStatus = describePwaCapability(usePwaCapability());
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const isFirstRouteChange = useRef(true);

  // Until the server answers, the roles saved at sign-in decide which
  // navigation to draw, so the header does not flicker on every load.
  const signedIn = session.status !== 'anonymous';
  const roles = session.user?.roles ?? (getStoredUser()?.roles as string[] | undefined) ?? [];
  const navLinks = !signedIn
    ? PUBLIC_NAV
    : roles.some((r) => HIRING_ROLES.includes(r))
      ? HIRING_NAV
      : CANDIDATE_NAV;
  const accountLabel = session.profile?.fullName ?? session.user?.email ?? getStoredUser()?.email;
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // The badge: one small read per page change, on focus, and right after the
  // user reads notifications. A failure leaves the last known count.
  useEffect(() => {
    if (session.status !== 'ready') {
      setUnreadNotifications(0);
      return;
    }
    let cancelled = false;
    const refresh = () => {
      apiJson<{ unreadCount: number }>('/api/v1/notifications/summary')
        .then((res) => !cancelled && setUnreadNotifications(res.unreadCount))
        .catch(() => undefined);
    };
    refresh();
    window.addEventListener('focus', refresh);
    window.addEventListener(NOTIFICATIONS_EVENT, refresh);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', refresh);
      window.removeEventListener(NOTIFICATIONS_EVENT, refresh);
    };
  }, [session.status, location.pathname]);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

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

  // Route-change contract: scroll, announce, and keep focus in the document.
  useEffect(() => {
    if (isFirstRouteChange.current) {
      isFirstRouteChange.current = false;
      return;
    }
    // Push/replace navigations start at the top; on Back/Forward (POP) the
    // browser restores the previous scroll position, so leave it alone.
    if (navigationType !== 'POP') window.scrollTo(0, 0);
    // Child pages set document.title in their effects, which run before this
    // parent effect, so the title already names the new destination.
    setRouteAnnouncement(document.title);
    // Focus strands on <body> when navigation unmounts the active element
    // (e.g. a link inside the closing mobile menu): recover to <main>.
    const active = document.activeElement;
    if (active === document.body || active?.closest('[data-testid="mobile-menu"]')) {
      document.getElementById('main-content')?.focus({ preventScroll: true });
    }
  }, [location.pathname, navigationType]);

  // The mobile menu is a disclosure: Escape closes it and returns focus to the toggle.
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMobileMenuOpen]);

  const signOut = () => {
    session.signOut();
    // Replace, so Back does not return to protected UI.
    navigate('/login', { replace: true });
  };

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
      {/* WCAG 2.2 AA skip link — revealed by .skip-link:focus-visible */}
      <a
        href="#main-content"
        className="skip-link"
        style={{
          zIndex: 9999,
          background: colors.primary[700],
          color: '#ffffff',
          padding: `${spacing.sm} ${spacing.md}`,
          fontWeight: 600,
          borderRadius: '4px',
          textDecoration: 'none',
        }}
      >
        Skip to main content
      </a>

      {/* SPA route-change announcement (the page title of the destination). */}
      <div role="status" aria-live="polite" data-testid="route-announcer" className="sr-only">
        {routeAnnouncement}
      </div>

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
          You are offline. Pages you open and changes you make will not load or save until you
          reconnect.
        </div>
      )}

      <header
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          borderBottom: `1px solid ${colors.neutral[200]}`,
          padding: `${spacing.sm} ${spacing.lg}`,
          minHeight: '64px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          columnGap: spacing.md,
          rowGap: spacing.sm,
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: spacing.md,
            minWidth: 0,
          }}
        >
          <Link
            to={signedIn ? '/dashboard' : '/'}
            aria-label="TalentSphere home"
            style={{
              textDecoration: 'none',
              fontSize: '1.125rem',
              letterSpacing: '-0.02em',
              color: colors.neutral[900],
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: '26px',
                height: '26px',
                backgroundColor: colors.primary[700],
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <ShieldCheckIcon size={16} />
            </span>
            <span style={{ fontWeight: 800 }}>
              <span className="wordmark-serif">Talent</span>Sphere
            </span>
          </Link>

          <nav
            aria-label="Main Navigation"
            className="desktop-nav"
            style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.xs, alignItems: 'center' }}
          >
            {navLinks.map((item) => {
              const isActive = isActivePath(location.pathname, item.path);
              const isHovered = hoveredNav === item.path && !isActive;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  data-testid={item.testId}
                  aria-current={isActive ? 'page' : undefined}
                  onMouseEnter={() => setHoveredNav(item.path)}
                  onMouseLeave={() => setHoveredNav(null)}
                  style={{
                    textDecoration: 'none',
                    color: isActive ? colors.primary[800] : colors.neutral[700],
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.875rem',
                    padding: `${spacing.sm} ${spacing.md}`,
                    borderRadius: '6px',
                    backgroundColor: isActive
                      ? colors.primary[50]
                      : isHovered
                        ? colors.neutral[100]
                        : 'transparent',
                    transition: `background-color ${motion.duration.fast} ${motion.easing.easeOut}, color ${motion.duration.fast} ${motion.easing.easeOut}`,
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            ref={menuButtonRef}
            data-testid="mobile-menu-toggle"
            aria-expanded={isMobileMenuOpen}
            aria-controls={isMobileMenuOpen ? 'mobile-navigation' : undefined}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="mobile-menu-button"
            style={{
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              padding: 0,
              border: `1px solid ${colors.neutral[300]}`,
              borderRadius: '8px',
              backgroundColor: isMobileMenuOpen ? colors.primary[50] : '#ffffff',
              color: isMobileMenuOpen ? colors.primary[800] : colors.neutral[800],
              cursor: 'pointer',
            }}
          >
            {isMobileMenuOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: spacing.md,
            minWidth: 0,
          }}
        >
          <div
            data-testid="pwa-status"
            title={pwaStatus.detail}
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
              aria-hidden="true"
              data-testid={`pwa-status-tone-${pwaStatus.tone}`}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor:
                  pwaStatus.tone === 'active'
                    ? colors.semantic.success
                    : pwaStatus.tone === 'pending'
                      ? colors.semantic.warning
                      : colors.neutral[400],
                display: 'inline-block',
              }}
            />
            <span>PWA {pwaStatus.label}</span>
          </div>

          {signedIn ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, minWidth: 0 }}>
              <Link
                to="/notifications"
                data-testid="nav-notifications"
                aria-label={
                  unreadNotifications > 0
                    ? `Notifications, ${unreadNotifications} unread`
                    : 'Notifications'
                }
                aria-current={
                  isActivePath(location.pathname, '/notifications') ? 'page' : undefined
                }
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  color: colors.neutral[700],
                  backgroundColor: isActivePath(location.pathname, '/notifications')
                    ? colors.primary[50]
                    : 'transparent',
                }}
              >
                <BellIcon size={20} />
                {unreadNotifications > 0 && (
                  <span
                    data-testid="notifications-badge"
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '2px',
                      minWidth: '18px',
                      height: '18px',
                      padding: '0 5px',
                      borderRadius: '9px',
                      backgroundColor: colors.semantic.error,
                      color: '#ffffff',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      lineHeight: '18px',
                      textAlign: 'center',
                    }}
                  >
                    {unreadNotifications > 99 ? '99+' : unreadNotifications}
                  </span>
                )}
              </Link>
              <span
                data-testid="account-label"
                style={{
                  fontSize: '0.8125rem',
                  color: colors.neutral[600],
                  maxWidth: '200px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={accountLabel}
              >
                {accountLabel}
              </span>
              <button
                type="button"
                onClick={signOut}
                style={{
                  fontSize: '0.8125rem',
                  color: colors.neutral[700],
                  background: 'none',
                  border: `1px solid ${colors.neutral[300]}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  padding: `${spacing.xs} ${spacing.sm}`,
                  minHeight: '36px',
                  fontWeight: 600,
                }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
              <Link
                to="/login"
                data-testid="nav-login"
                style={{
                  textDecoration: 'none',
                  color: colors.primary[700],
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  padding: '8px 12px',
                  minHeight: '40px',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                data-testid="nav-signup"
                style={{
                  textDecoration: 'none',
                  color: '#ffffff',
                  backgroundColor: colors.primary[700],
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  padding: '8px 16px',
                  minHeight: '40px',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                Create account
              </Link>
            </div>
          )}
        </div>
      </header>

      {isMobileMenuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile Navigation"
          data-testid="mobile-menu"
          style={{
            backgroundColor: '#ffffff',
            borderBottom: `1px solid ${colors.neutral[200]}`,
            padding: spacing.md,
            display: 'flex',
            flexDirection: 'column',
            gap: spacing.xs,
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
          }}
        >
          {navLinks.map((item) => {
            const isActive = isActivePath(location.pathname, item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                data-testid={`mobile-nav-${item.path.replace('/', '')}`}
                style={{
                  textDecoration: 'none',
                  color: isActive ? colors.primary[800] : colors.neutral[800],
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '1rem',
                  padding: `${spacing.sm} ${spacing.md}`,
                  borderRadius: '8px',
                  backgroundColor: isActive ? colors.primary[50] : 'transparent',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      )}

      <main
        id="main-content"
        tabIndex={-1}
        style={{
          flex: 1,
          padding: `${spacing.xl} ${spacing.lg} ${spacing['2xl']}`,
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
          outline: 'none',
        }}
      >
        <Outlet />
      </main>

      <footer
        style={{
          borderTop: `1px solid ${colors.neutral[200]}`,
          backgroundColor: '#ffffff',
          padding: `${spacing.xl} ${spacing.lg}`,
          marginTop: 'auto',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: spacing.lg,
            fontSize: '0.875rem',
            color: colors.neutral[600],
          }}
        >
          <div style={{ maxWidth: '360px' }}>
            <div style={{ fontWeight: 800, color: colors.neutral[900], marginBottom: spacing.xs }}>
              <span className="wordmark-serif">Talent</span>Sphere
            </div>
            <p style={{ margin: 0, lineHeight: 1.6 }}>
              Work history that is checked, not just claimed — and the jobs to use it on.
            </p>
          </div>
          <nav aria-label="Footer" style={{ display: 'flex', gap: spacing.lg, flexWrap: 'wrap' }}>
            <Link to="/jobs" className="footer-link" style={{ color: colors.neutral[600] }}>
              Jobs
            </Link>
            <Link to="/checkout" className="footer-link" style={{ color: colors.neutral[600] }}>
              Pricing
            </Link>
            <Link to="/privacy" className="footer-link" style={{ color: colors.neutral[600] }}>
              Privacy
            </Link>
            <Link to="/terms" className="footer-link" style={{ color: colors.neutral[600] }}>
              Terms
            </Link>
            {SUPPORT_EMAIL && (
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                data-testid="footer-email"
                className="footer-link"
                style={{ color: colors.neutral[600] }}
              >
                Contact support
              </a>
            )}
          </nav>
        </div>
        <div
          style={{
            maxWidth: '1200px',
            margin: `${spacing.lg} auto 0`,
            fontSize: '0.75rem',
            color: colors.neutral[600],
          }}
        >
          © 2026 TalentSphere
        </div>
      </footer>
    </div>
  );
};
