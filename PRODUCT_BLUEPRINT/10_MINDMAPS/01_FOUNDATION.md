<!-- Generated from PRODUCT_BLUEPRINT sources. Regenerate instead of editing by hand. -->

# Mind map: Foundation

Every module, sub-module and feature in this domain (128 features). Feature labels carry the id suffix; the owning module file has the full specification.

```mermaid
mindmap
  root((Foundation))
    IDN Identity, Authentication Account
      Features
        IDN-001 Email and password registration
        IDN-002 Email verification by one-time code
        IDN-003 Phone number verification
        IDN-004 Social sign-in
        IDN-005 Enterprise SSO for organizations
        IDN-006 Passkey registration and sign-in
        IDN-007 Email code and magic-link sign-in
        IDN-008 Password sign-in with progressive
        IDN-009 Session family and token model
        IDN-010 Silent refresh, rotation and reuse
        IDN-011 Sessions and devices list with revoke
        IDN-012 New-device sign-in alerts and personal
        IDN-013 Authenticator-app enrollment and
        IDN-014 MFA challenge at sign-in and recovery
        IDN-015 Step-up re-authentication for sensitive
        IDN-016 Mandatory MFA and hardened sessions for
        IDN-017 Password change and password set
        IDN-018 Password reset by emailed link
        IDN-019 Email address change
        IDN-020 Account recovery when all factors are
        IDN-021 Role onboarding wizard
        IDN-022 Role context switching
        IDN-023 Membership and scoped role grants
        IDN-024 Account linking, collision handling and
        IDN-025 Organization invitations and
        IDN-026 Account deactivation and reactivation
        IDN-027 Account deletion request
        IDN-031 Suspended-account appeal access
        IDN-028 Support impersonation with audit
        IDN-030 Bot protection and abuse throttling
        IDN-029 Age gate and guardian handling
        IDN-032 Policy re-acceptance gate
    SET Settings, Privacy, Consent Data Rights
      Features
        SET-001 Settings shell, information
        SET-002 Account settings page
        SET-003 Profile visibility presets and
        SET-004 Preview as recruiter or public visitor
        SET-005 Consent management screen
        SET-006 Consent ledger, projection and
        SET-007 Per-grantee grants with expiry and
        SET-008 Re-confirmation prompts and
        SET-009 Cookie and tracking consent
        SET-010 Organization blocklist
        SET-011 Search exclusion
        SET-012 Access log
        SET-013 Data export request and archive build
        SET-014 Export download
        SET-015 Account erasure request and execution
        SET-016 Rectification, restriction and
        SET-017 DSAR operations queue and assisted
        SET-018 Legal hold on data requests
        SET-019 Retention schedule engine
        SET-020 Language, region, time zone and formats
        SET-021 Accessibility preferences
        SET-022 Display and theme
        SET-023 Connected apps
        SET-024 Personal API tokens
        SET-025 Connected accounts and integrations
        SET-026 Privacy dashboard
        SET-027 Regional compliance rules and toggles
        SET-028 Policy documents, versions and
        SET-029 AI and personalization settings
        SET-030 Settings change history and protected
        SET-031 Managed-account policy locks
        SET-032 Guardian and minor consent management
    NTF Notifications Communication Channels
      Features
        NTF-001 Event intake and routing decision
        NTF-002 Notification catalog and preference
        NTF-018 Deduplication, collapsing and grouping
        NTF-019 Throttling and provider rate limits
        NTF-023 Retry, dead-letter and provider failover
        NTF-003 In-app notification center
        NTF-004 Unread count and reconciliation
        NTF-005 Read, archive, snooze and turn off this
        NTF-006 Real-time in-app delivery and cross-tab
        NTF-007 Transactional email delivery
        NTF-008 Email rendering, layout and
        NTF-009 Unsubscribe and email preference landing
        NTF-010 Bounce, complaint and suppression
        NTF-011 Web push notifications
        NTF-012 Mobile and PWA push endpoints
        NTF-013 SMS notifications
        NTF-014 Preference center
        NTF-015 Quiet hours and time-zone-aware
        NTF-016 Digests
        NTF-017 Nudges and frequency caps
        NTF-028 Scheduled reminders
        NTF-030 Alert subscriptions
        NTF-020 Template management console
        NTF-021 Localization and locale fallback
        NTF-022 Delivery tracking and timeline
        NTF-026 User-visible delivery log and support
        NTF-031 Deliverability monitoring
        NTF-032 Development outbox and sandbox
        NTF-024 Marketing and product-news campaigns
        NTF-025 Admin broadcast and system banners
        NTF-027 Team and organization notification
        NTF-029 Security and account notifications
        NTF-033 Personal automation rules
    REP Gamification, Reputation Recognition
      Features
        REP-001 XP rule catalog and award engine
        REP-002 XP ledger
        REP-003 XP reversal and clawback
        REP-004 Levels and progression
        REP-005 Progress screen and dashboard widget
        REP-006 Badge catalog and criteria
        REP-007 Badge issuance and display
        REP-008 Badge revocation and expiry
        REP-009 Verifiable badge export
        REP-010 Peer recognition
        REP-028 Achievement share cards
        REP-011 Streaks
        REP-012 Streak protection and reminders
        REP-013 Goals and weekly quests
        REP-014 Leaderboards
        REP-015 Leaderboard privacy anonymity, alias
        REP-016 Institutional leaderboards
        REP-017 Enterprise internal leaderboards
        REP-027 Seasons and period resets
        REP-018 Reputation engine
        REP-019 Reputation signal intake, registry and
        REP-020 Reputation recovery paths
        REP-021 Reputation visibility and consent
        REP-022 Signal weighting, source credibility
        REP-023 Context reputations
        REP-031 Reputation explanation and transparency
        REP-024 Anti-gaming detection
        REP-025 Integrity review queue, sanctions and
        REP-026 Gamification opt-out and intensity
        REP-029 Rule administration, simulation and
        REP-030 Fairness and ethics audit
```

## Specifications

- [IDN — Identity, Authentication & Account](../02_MODULES/IDN_Identity_Authentication_Account.md)
- [SET — Settings, Privacy, Consent & Data Rights](../02_MODULES/SET_Settings_Privacy_Consent.md)
- [NTF — Notifications & Communication Channels](../02_MODULES/NTF_Notifications_Communication.md)
- [REP — Gamification, Reputation & Recognition](../02_MODULES/REP_Gamification_Reputation.md)
