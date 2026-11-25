# Frontend Architecture

React 19 + TypeScript + Vite, `react-router-dom`. Server state is a small `fetch` helper; there is no TanStack Query, Redux or Zustand (no import of them in `apps/web/src`).

| Concern         | Finding                                                                                                                                            | Evidence                            |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Bootstrap       | `main.tsx` renders `<App/>` in StrictMode; `App` wraps `BrowserRouter` in `SessionProvider`                                                        | `apps/web/src/main.tsx`, `App.tsx`  |
| Routing         | 29 route entries under a single `Layout` route; 18 guarded with `RequireAuth`; `*` → NotFoundPage                                                  | `App.tsx`                           |
| Global state    | One React context (`SessionContext`): `status` anonymous/loading/ready/error, user, profile, memberships, `isRecruiter`, `isRestricted`            | `lib/SessionContext.tsx`            |
| Local state     | `useState`/`useEffect` per page; no shared cache layer                                                                                             | pages                               |
| API client      | `apiFetch` (adds Bearer token; one 401 policy) and `apiJson` (JSON, 20 s timeout, `ApiError` with server message)                                  | `lib/api.ts`                        |
| Storage         | `localStorage` keys `talentsphere_token`, `talentsphere_user`; `sessionStorage` `talentsphere_session_ended`; no IndexedDB use found               | `lib/session.ts`                    |
| Offline / PWA   | service-worker and display-mode detection only (`usePwaCapability`); no offline data sync or queue found in source                                 | `pwa.ts`                            |
| Layout          | one-row header at every width; role-specific nav sets; account menu; live-region route announcer; unread-notification badge polled on route change | `components/Layout.tsx`             |
| UI primitives   | 29 components in `components/ui` (Badge, Button, Card, EmptyState, Field, Input, LoadError, Modal, Notice, PageHeader, ...)                        | `components/ui`                     |
| Error boundary  | `RouteErrorBoundary`                                                                                                                               | `components/RouteErrorBoundary.tsx` |
| Idempotency     | client helper for idempotency keys (used by checkout)                                                                                              | `lib/idempotency.ts`                |
| Tokens / design | colours read from `packages/ui` tokens in Layout                                                                                                   | `Layout.tsx` imports                |

Every screen, its API calls and interactions: [Screen and interaction inventory](../ui/SCREEN_INTERACTION_INVENTORY.md). Component → API edges are `CALLS` edges in the graph (screens: 24/29 call at least one API directly).
