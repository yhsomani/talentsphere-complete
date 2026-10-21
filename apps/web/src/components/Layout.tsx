import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate, useNavigationType } from 'react-router-dom';
import { colors } from '@talentsphere/ui';
import { BellIcon, ChevronDownIcon, MenuIcon, XIcon } from './ui/Icons.js';
import { VerificationSeal } from './ui/VerificationSeal.js';
import { describePwaCapability, usePwaCapability } from '../pwa.js';
import { getStoredUser } from '../lib/session.js';
import { useSession } from '../lib/SessionContext.js';
import { apiJson } from '../lib/api.js';
import { NOTIFICATIONS_EVENT } from '../lib/notifications.js';
import { CommandPalette } from './CommandPalette.js';
import { RouteErrorBoundary } from './RouteErrorBoundary.js';

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
  { label: 'Messages', path: '/messages', testId: 'nav-messages' },
];

const HIRING_NAV: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', testId: 'nav-dashboard' },
  { label: 'Hiring', path: '/hiring', testId: 'nav-hiring' },
  { label: 'Jobs', path: '/jobs', testId: 'nav-jobs' },
  { label: 'Messages', path: '/messages', testId: 'nav-messages' },
];

const isActivePath = (pathname: string, path: string) =>
  pathname === path || pathname.startsWith(`${path}/`);

/** "Casey Candidate" → "CC"; "casey@example.org" → "C". */
const initialsOf = (label?: string) => {
  if (!label) return '?';
  const words = label.includes('@') ? [label] : label.trim().split(/\s+/);
  return words
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
};

/**
 * Site chrome: a one-row header at every width (64 px), the page, and the
 * footer, all on one container so their edges line up from a 320 px phone to
 * a 2560 px display (styles/layout.css).
 *
 * - Laptop and up (≥1024 px): brand, destinations, notifications, and an
 *   account menu (profile, sign out).
 * - Below that: brand, notifications, and a menu button whose panel overlays
 *   the page. Signed-out visitors have only two destinations, which fit
 *   inline from 640 px.
 */
export const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const session = useSession();
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState<boolean>(false);
  const [routeAnnouncement, setRouteAnnouncement] = useState<string>('');
  const pwaStatus = describePwaCapability(usePwaCapability());
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const accountButtonRef = useRef<HTMLButtonElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const isFirstRouteChange = useRef(true);

  // Until the server answers, the roles saved at sign-in decide which
  // navigation to draw, so the header does not flicker on every load.
  const signedIn = session.status !== 'anonymous';
  const roles = session.user?.roles ?? (getStoredUser()?.roles as string[] | undefined) ?? [];
  const baseNavLinks = !signedIn
    ? PUBLIC_NAV
    : roles.some((r) => HIRING_ROLES.includes(r))
      ? HIRING_NAV
      : CANDIDATE_NAV;
  const navLinks =
    signedIn && roles.includes('platform_admin')
      ? [...baseNavLinks, { label: 'Admin', path: '/admin', testId: 'nav-admin' }]
      : baseNavLinks;
  const accountName = session.profile?.fullName ?? session.user?.email ?? getStoredUser()?.email;
  const accountEmail = session.user?.email ?? getStoredUser()?.email;
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

  // Menus close whenever the route changes.
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsAccountMenuOpen(false);
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
    // (e.g. a link inside a closing menu): recover to <main>.
    const active = document.activeElement;
    if (
      active === document.body ||
      active?.closest('[data-testid="mobile-menu"]') ||
      active?.closest('.account-menu__panel')
    ) {
      document.getElementById('main-content')?.focus({ preventScroll: true });
    }
  }, [location.pathname, navigationType]);

  // Both menus are disclosures: Escape closes and returns focus to the toggle.
  useEffect(() => {
    if (!isMobileMenuOpen && !isAccountMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
      if (isAccountMenuOpen) {
        setIsAccountMenuOpen(false);
        accountButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMobileMenuOpen, isAccountMenuOpen]);

  // A press outside the account menu closes it.
  useEffect(() => {
    if (!isAccountMenuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!accountMenuRef.current?.contains(e.target as Node)) setIsAccountMenuOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [isAccountMenuOpen]);

  const signOut = () => {
    session.signOut();
    // Replace, so Back does not return to protected UI.
    navigate('/login', { replace: true });
  };

  const bell = signedIn && (
    <Link
      to="/notifications"
      className="icon-button"
      data-testid="nav-notifications"
      aria-label={
        unreadNotifications > 0 ? `Notifications, ${unreadNotifications} unread` : 'Notifications'
      }
      aria-current={isActivePath(location.pathname, '/notifications') ? 'page' : undefined}
    >
      <BellIcon size={20} />
      {unreadNotifications > 0 && (
        <span data-testid="notifications-badge" aria-hidden="true" className="count-badge">
          {unreadNotifications > 99 ? '99+' : unreadNotifications}
        </span>
      )}
    </Link>
  );

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
          padding: '8px 16px',
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
            padding: '4px 16px',
            fontSize: '0.8125rem',
            fontWeight: 600,
          }}
        >
          You are offline. Pages you open and changes you make will not load or save until you
          reconnect.
        </div>
      )}

      <header
        className={`site-header ${signedIn ? 'site-header--signed-in' : 'site-header--anonymous'}`}
      >
        <div className="container site-header__bar">
          <Link to={signedIn ? '/dashboard' : '/'} aria-label="TalentSphere home" className="brand">
            <span aria-hidden="true" className="brand__mark">
              <VerificationSeal state="reference" size={26} />
            </span>
            <span>
              <span className="wordmark-serif">Talent</span>Sphere
            </span>
          </Link>

          <nav aria-label="Main Navigation" className="site-nav">
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="site-nav__link"
                data-testid={item.testId}
                aria-current={isActivePath(location.pathname, item.path) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="site-header__actions">
            {signedIn ? (
              <>
                {bell}
                <div className="account-menu" ref={accountMenuRef}>
                  <button
                    type="button"
                    ref={accountButtonRef}
                    className="account-menu__toggle"
                    data-testid="account-menu-toggle"
                    aria-expanded={isAccountMenuOpen}
                    aria-controls={isAccountMenuOpen ? 'account-menu-panel' : undefined}
                    aria-label={`Account: ${accountName ?? 'signed in'}`}
                    onClick={() => setIsAccountMenuOpen((open) => !open)}
                  >
                    <span className="avatar" aria-hidden="true">
                      {initialsOf(session.profile?.fullName ?? accountName)}
                    </span>
                    <span
                      className="account-menu__name"
                      data-testid="account-label"
                      title={accountName}
                    >
                      {accountName}
                    </span>
                    <ChevronDownIcon size={16} />
                  </button>
                  {isAccountMenuOpen && (
                    <div
                      id="account-menu-panel"
                      className="account-menu__panel"
                      data-testid="account-menu"
                    >
                      <div className="account-menu__who">
                        <strong>{session.profile?.fullName ?? 'Your account'}</strong>
                        {accountEmail && <span title={accountEmail}>{accountEmail}</span>}
                      </div>
                      <Link
                        to="/profile"
                        className="menu-item"
                        data-testid="nav-profile"
                        aria-current={
                          isActivePath(location.pathname, '/profile') ? 'page' : undefined
                        }
                      >
                        Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="menu-item"
                        data-testid="nav-settings"
                        aria-current={
                          isActivePath(location.pathname, '/settings') ? 'page' : undefined
                        }
                      >
                        Settings
                      </Link>
                      <button type="button" className="menu-item" onClick={signOut}>
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" data-testid="nav-login" className="header-link">
                  Sign in
                </Link>
                <Link to="/signup" data-testid="nav-signup" className="header-cta">
                  Create account
                </Link>
              </>
            )}
            <button
              type="button"
              ref={menuButtonRef}
              data-testid="mobile-menu-toggle"
              aria-expanded={isMobileMenuOpen}
              aria-controls={isMobileMenuOpen ? 'mobile-navigation' : undefined}
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className="icon-button icon-button--outlined menu-toggle"
            >
              {isMobileMenuOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="mobile-panel" id="mobile-navigation">
            <div className="container mobile-panel__inner">
              <nav
                aria-label="Mobile Navigation"
                data-testid="mobile-menu"
                style={{ display: 'flex', flexDirection: 'column', gap: 2 }}
              >
                {navLinks.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="menu-item"
                    data-testid={`mobile-nav-${item.path.replace('/', '')}`}
                    aria-current={isActivePath(location.pathname, item.path) ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                ))}
                {signedIn && (
                  <Link
                    to="/profile"
                    className="menu-item"
                    data-testid="mobile-nav-profile"
                    aria-current={isActivePath(location.pathname, '/profile') ? 'page' : undefined}
                  >
                    Profile
                  </Link>
                )}
                {signedIn && (
                  <Link
                    to="/settings"
                    className="menu-item"
                    data-testid="mobile-nav-settings"
                    aria-current={isActivePath(location.pathname, '/settings') ? 'page' : undefined}
                  >
                    Settings
                  </Link>
                )}
              </nav>
              <div className="mobile-panel__section">
                {signedIn ? (
                  <>
                    <div className="account-menu__who" style={{ borderBottom: 0, margin: 0 }}>
                      <strong>{session.profile?.fullName ?? 'Your account'}</strong>
                      {accountEmail && <span title={accountEmail}>{accountEmail}</span>}
                    </div>
                    <button type="button" className="menu-item" onClick={signOut}>
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/signup" className="menu-item" data-testid="mobile-nav-signup">
                      Create account
                    </Link>
                    <Link to="/login" className="menu-item" data-testid="mobile-nav-login">
                      Sign in
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <CommandPalette
        items={
          signedIn
            ? [
                ...navLinks,
                { label: 'Notifications', path: '/notifications' },
                { label: 'Profile', path: '/profile' },
                { label: 'Portfolio', path: '/portfolio' },
                { label: 'Resumes', path: '/resumes' },
                { label: 'Network', path: '/network' },
                { label: 'Learning', path: '/learning' },
                { label: 'Settings', path: '/settings' },
              ]
            : navLinks
        }
      />
      <main id="main-content" tabIndex={-1} className="site-main container">
        <RouteErrorBoundary resetKey={location.pathname}>
          <Outlet />
        </RouteErrorBoundary>
      </main>

      <footer className="site-footer">
        <div className="container">
          <div className="site-footer__grid">
            <div style={{ maxWidth: '360px' }}>
              <div style={{ fontWeight: 800, color: colors.neutral[900], marginBottom: 4 }}>
                <span className="wordmark-serif">Talent</span>Sphere
              </div>
              <p style={{ margin: 0, lineHeight: 1.6 }}>
                Work history that is checked, not just claimed — and the jobs to use it on.
              </p>
            </div>
            <nav aria-label="Footer" className="site-footer__nav">
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
          <div className="site-footer__meta">
            <span>© 2026 TalentSphere</span>
            {/* Measured, not claimed (manifest present; offline support is
                not shipped, so this never says "active"). */}
            <span
              data-testid="pwa-status"
              title={pwaStatus.detail}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: colors.neutral[600],
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
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
