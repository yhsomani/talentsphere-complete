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
import { MenuIcon, PhoneIcon, ShieldCheckIcon, XIcon } from './ui/Icons.js';
import { describePwaCapability, usePwaCapability } from '../pwa.js';
import { clearSession, getStoredUser } from '../lib/session.js';

const SUPPORT_EMAIL = 'support@talentsphere.io';
const SUPPORT_PHONE = '+1-415-555-0142';
const SUPPORT_PHONE_HREF = 'tel:+14155550142';

export const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [routeAnnouncement, setRouteAnnouncement] = useState<string>('');
  const pwaCapability = usePwaCapability();
  const pwaStatus = describePwaCapability(pwaCapability);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const isFirstRouteChange = useRef(true);

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

    const storedUser = getStoredUser();
    if (storedUser?.email) setUserEmail(storedUser.email);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [location.pathname]);

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
    // Focus strands on <body> when navigation unmounts the active element:
    // the mobile menu closes on this route change (close-menu effect above),
    // dropping its focused link one commit later — after this effect has
    // already run. So recover now, while that link still exists: if focus is
    // on <body> or inside the closing menu, move it to the main landmark.
    // Focus resting anywhere else (e.g. a desktop nav link, which stays
    // mounted) is left alone. preventScroll keeps the browser's restored
    // scroll position on Back/Forward intact.
    const active = document.activeElement;
    if (active === document.body || active?.closest('[data-testid="mobile-menu"]')) {
      document.getElementById('main-content')?.focus({ preventScroll: true });
    }
  }, [location.pathname, navigationType]);

  // The mobile menu is a disclosure: Escape must close it and return focus
  // to the toggle that opened it.
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

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard', testId: 'nav-dashboard' },
    { label: 'Evidence', path: '/evidence', testId: 'nav-evidence' },
    { label: 'Assessments', path: '/assessments', testId: 'nav-assessments' },
    { label: 'Opportunities', path: '/jobs', testId: 'nav-jobs' },
    { label: 'Pricing', path: '/checkout', testId: 'nav-checkout' },
  ];

  // Hover affordance for desktop nav links (declarative, token-driven).
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

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
      {/* WCAG 2.2 AA Skip Link — hidden/revealed by .skip-link CSS (:focus-visible), not JS */}
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

      {/* SPA route-change announcement: role="status" + aria-live="polite"
          announces the new destination after client-side navigation (the
          title itself is set by each page's usePageMeta effect, whose child
          effect runs before this parent effect). */}
      <div
        role="status"
        aria-live="polite"
        data-testid="route-announcer"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {routeAnnouncement}
      </div>

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
          backgroundColor: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
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
            to="/"
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
            <div
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
            </div>
            <span style={{ fontWeight: 800 }}>
              <span className="wordmark-serif">Talent</span>Sphere
            </span>
          </Link>

          {/* Desktop navigation — hidden on small screens in favour of the menu button */}
          <nav
            aria-label="Main Navigation"
            className="desktop-nav"
            style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.xs, alignItems: 'center' }}
          >
            {navLinks.map((item) => {
              const isActive = location.pathname === item.path;
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

          {/* Mobile hamburger toggle */}
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

          {userEmail ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
              <span style={{ fontSize: '0.8125rem', color: colors.neutral[600] }} title={userEmail}>
                {userEmail}
              </span>
              <button
                type="button"
                onClick={() => {
                  clearSession();
                  setUserEmail(null);
                  // Signing out must not leave the signed-out user parked on a
                  // protected page until some later route change notices;
                  // replace so Back does not return to protected UI.
                  navigate('/login', { replace: true });
                }}
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
            <Link
              to="/login"
              data-testid="nav-login"
              style={{
                textDecoration: 'none',
                color: location.pathname === '/login' ? '#ffffff' : colors.primary[700],
                fontWeight: 700,
                fontSize: '0.875rem',
                padding: '8px 18px',
                minHeight: '40px',
                borderRadius: '6px',
                border: `1px solid ${location.pathname === '/login' ? colors.primary[700] : colors.primary[300]}`,
                backgroundColor: location.pathname === '/login' ? colors.primary[700] : '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                transition: `background-color ${motion.duration.fast} ${motion.easing.easeOut}, border-color ${motion.duration.fast} ${motion.easing.easeOut}`,
              }}
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Mobile Navigation Menu (rendered below the sticky header) */}
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
            const isActive = location.pathname === item.path;
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
          <div
            style={{
              borderTop: `1px solid ${colors.neutral[200]}`,
              marginTop: spacing.xs,
              paddingTop: spacing.sm,
              display: 'flex',
              flexDirection: 'column',
              gap: spacing.xs,
            }}
          >
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              data-testid="footer-email-mobile"
              style={{
                color: colors.primary[700],
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9375rem',
                padding: `${spacing.sm} ${spacing.md}`,
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {SUPPORT_EMAIL}
            </a>
            <a
              href={SUPPORT_PHONE_HREF}
              data-testid="footer-phone-mobile"
              style={{
                color: colors.primary[700],
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9375rem',
                padding: `${spacing.sm} ${spacing.md}`,
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <PhoneIcon size={16} /> {SUPPORT_PHONE}
            </a>
          </div>
        </nav>
      )}

      {/* Main Content Area */}
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
            <div
              style={{
                fontWeight: 800,
                fontSize: '1rem',
                color: colors.neutral[900],
                marginBottom: spacing.xs,
                letterSpacing: '-0.02em',
              }}
            >
              <span className="wordmark-serif">Talent</span>Sphere
            </div>
            <p
              style={{
                fontSize: '0.8125rem',
                color: colors.neutral[600],
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              The cryptographic talent network. Grounding human capability in verifiable evidence,
              proctored benchmarks, and transparent matching.
            </p>
          </div>

          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: '0.8125rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: colors.neutral[600],
                marginBottom: spacing.sm,
              }}
            >
              Platform
            </div>
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: spacing.xs,
                fontSize: '0.875rem',
              }}
            >
              {/* Footer destinations mirror the header nav verbatim so the
                  same action never carries two names. Dashboard is the
                  signed-in home and does not belong in the public footer. */}
              {navLinks
                .filter((item) => item.path !== '/dashboard')
                .map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className="footer-link"
                      style={{ color: colors.neutral[600], textDecoration: 'none' }}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: '0.8125rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: colors.neutral[600],
                marginBottom: spacing.sm,
              }}
            >
              Trust & Governance
            </div>
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: spacing.xs,
                fontSize: '0.875rem',
              }}
            >
              <li>
                <Link
                  to="/privacy"
                  className="footer-link"
                  style={{ color: colors.neutral[600], textDecoration: 'none' }}
                >
                  Privacy Policy (GDPR/CCPA)
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="footer-link"
                  style={{ color: colors.neutral[600], textDecoration: 'none' }}
                >
                  Terms & Integrity Standards
                </Link>
              </li>
              <li>
                <span style={{ color: colors.neutral[600], cursor: 'default' }}>
                  Differential Privacy (k &ge; 10)
                </span>
              </li>
              <li>
                <span style={{ color: colors.neutral[600], cursor: 'default' }}>
                  Anti-LLM Scraping Safe
                </span>
              </li>
            </ul>
          </div>

          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: '0.8125rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: colors.neutral[600],
                marginBottom: spacing.sm,
              }}
            >
              Verification SLA
            </div>
            <p
              style={{
                fontSize: '0.8125rem',
                color: colors.neutral[600],
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              All employer signature requests execute through cryptographically hashed challenge
              tokens. Disposable email domains strictly barred.
            </p>
          </div>

          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: '0.8125rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: colors.neutral[600],
                marginBottom: spacing.sm,
              }}
            >
              Support
            </div>
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: spacing.xs,
                fontSize: '0.875rem',
              }}
            >
              <li>
                {/* Clickable email */}
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  data-testid="footer-email"
                  style={{
                    color: colors.primary[700],
                    textDecoration: 'underline',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    minHeight: '44px',
                  }}
                >
                  {SUPPORT_EMAIL}
                </a>
              </li>
              <li>
                {/* Clickable phone number */}
                <a
                  href={SUPPORT_PHONE_HREF}
                  data-testid="footer-phone"
                  style={{
                    color: colors.primary[700],
                    textDecoration: 'underline',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    minHeight: '44px',
                  }}
                >
                  <PhoneIcon size={14} /> {SUPPORT_PHONE}
                </a>
              </li>
              <li style={{ color: colors.neutral[600] }}>Mon–Fri, 9:00–18:00 UTC</li>
            </ul>
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
            color: colors.neutral[600],
          }}
        >
          <div>
            TalentSphere &copy; 2026. Cryptographically Verified Talent Network. All rights
            reserved.
          </div>
          <div style={{ display: 'flex', gap: spacing.md }}>
            <Link to="/privacy" style={{ color: colors.neutral[600], textDecoration: 'underline' }}>
              Privacy
            </Link>
            <Link to="/terms" style={{ color: colors.neutral[600], textDecoration: 'underline' }}>
              Terms
            </Link>
            <span style={{ color: colors.neutral[600] }}>SOC2 Type II Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
