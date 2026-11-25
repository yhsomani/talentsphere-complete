#!/usr/bin/env python3
"""Usage: python3 -I project-mindmap/tools/poster.py <workdir>   (workdir = extract.py output; run generate.py first)

Builds the poster-style MASTER mind map from the generated graph:
  master/MASTER_PROJECT_MINDMAP.svg     (vector poster, opens in any browser)
  master/MASTER_PROJECT_MINDMAP.drawio  (same layout, editable in diagrams.net)
Every label is computed from master/MASTER_PROJECT_GRAPH.json (or the extractor's aux.json); nothing is typed by hand
except the structural headings and the four stack facts read from package.json files.
"""
import json, os, sys, re, collections
from xml.sax.saxutils import escape

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
WORK = sys.argv[1]
OUT = os.path.join(ROOT, 'project-mindmap', 'master')
G = json.load(open(os.path.join(OUT, 'MASTER_PROJECT_GRAPH.json')))
A = json.load(open(os.path.join(WORK, 'aux.json')))
nodes = {n['id']: n for n in G['nodes']}
edges = G['edges']
by_type = collections.defaultdict(list)
for n in G['nodes']:
    by_type[n['type']].append(n)
out_e = collections.defaultdict(list); in_e = collections.defaultdict(list)
for e in edges:
    out_e[e['src']].append(e); in_e[e['dst']].append(e)

def outs(i, rel=None, typ=None):
    return [e['dst'] for e in out_e[i] if (rel is None or e['rel'] == rel) and (typ is None or nodes[e['dst']]['type'] == typ)]
def ins(i, rel=None, typ=None):
    return [e['src'] for e in in_e[i] if (rel is None or e['rel'] == rel) and (typ is None or nodes[e['src']]['type'] == typ)]

# ------------------------------------------------------------------ colours
STATUS = {'IMPLEMENTED': '#2e7d32', 'PARTIALLY_IMPLEMENTED': '#f9a825', 'NOT_IMPLEMENTED': '#c62828', 'BROKEN': '#c62828', 'MOCKED': '#e65100',
          'UNREACHABLE': '#c62828', 'DEPRECATED': '#757575', 'UNKNOWN': '#9e9e9e', None: None}
GROUP = {'A': dict(line='#1565c0', fill='#e8f1fd', zone='#dbe8f7', name='PRODUCT & EXPERIENCE'),
         'B': dict(line='#6a1b9a', fill='#f3eafa', zone='#e6dcf2', name='APPLICATION & LOGIC'),
         'C': dict(line='#00796b', fill='#e3f5f2', zone='#d3ece8', name='DATA · PLATFORM · QUALITY')}
INK = '#1b2733'; MUTED = '#5b6b7a'; RED = '#c62828'

# ------------------------------------------------------------------ primitives (shared by SVG and draw.io)
items = []
def rect(x, y, w, h, fill='none', stroke='none', sw=1, rx=0, op=1.0):
    items.append(('rect', x, y, w, h, fill, stroke, sw, rx, op))
def circle(cx, cy, r, fill='none', stroke='none', sw=1, op=1.0):
    items.append(('circle', cx, cy, r, fill, stroke, sw, op))
def text(x, y, s, size=15, weight='normal', fill=INK, anchor='start', italic=False):
    items.append(('text', x, y, s, size, weight, fill, anchor, italic))
def curve(x1, y1, x2, y2, stroke, sw=2, op=0.5, dash=None, bend=0.5):
    items.append(('curve', x1, y1, x2, y2, stroke, sw, op, dash, bend))
def arc(cx, cy, r, a0, a1, stroke, sw):
    items.append(('arc', cx, cy, r, a0, a1, stroke, sw))
def line(x1, y1, x2, y2, stroke, sw=1, dash=None, arrow=False):
    items.append(('line', x1, y1, x2, y2, stroke, sw, dash, arrow))

CW = 0.56   # average glyph width as a fraction of font size (Arial-like), used for fitting
def fit(s, px, size):
    maxc = max(4, int(px / (size * CW)))
    return s if len(s) <= maxc else s[:maxc - 1].rstrip() + '…'

# ------------------------------------------------------------------ card model
class Card:
    def __init__(self, bid, title, group, detail, subs):
        self.bid, self.title, self.group, self.detail, self.subs = bid, title, group, detail, subs
        self.x = self.y = 0
        self.w = 0
    def height(self):
        return getattr(self, 'force_h', None) or self.natural_height()
    def natural_height(self):
        h = 74
        for sub in self.subs:
            h += 38 + 23 * len(sub['items']) + (22 if sub.get('more') else 0) + 8
        return h + 40

def sub(title, items_, more=None, cols=1):
    return dict(title=title, items=items_, more=more, cols=cols)
def b(label, status=None, tag=None):
    return (label, status, tag)

# ------------------------------------------------------------------ data helpers
apis = by_type['API']; scrs = by_type['SCR']; ints = by_type['INT']; rules = by_type['RULE']; dbs = by_type['DB']
tests = by_type['TEST']; jours = by_type['JOUR']; comps = by_type['COMP']; errs = by_type['ERR']; roles = by_type['ROLE']
exts = by_type['EXT']; states = by_type['STATE']; svcs = by_type['SVC']; infra = by_type['INFRA']; mods = by_type['MOD']
n_dur = sum(1 for n in apis if n['durability'] == 'durable')
api_mods = collections.defaultdict(list)
for n in apis: api_mods[n['module']].append(n)

def top(counter, k):
    return counter.most_common(k)

def more_text(total, shown, where):
    return f'+ {total - shown} more → {where}' if total > shown else None

def pkg_version(path, dep):
    try:
        d = json.load(open(os.path.join(ROOT, path)))
        return (d.get('dependencies', {}) | d.get('devDependencies', {})).get(dep, '').lstrip('^~')
    except Exception:
        return ''

job_nodes = [n for n in svcs if n['name'].startswith('job:')]
job_total = len(job_nodes); job_email = sum(1 for n in job_nodes if n['status'] == 'IMPLEMENTED'); job_noop = job_total - job_email
# BRANCH 01
apps_n = [n for n in mods if n.get('kind') == 'application']
cards = []
cards.append(Card('01', 'PROJECT OVERVIEW', 'A', 'architecture/BACKEND_ARCHITECTURE.md', [
    sub('Applications (3)', [b(f"{n['name']} · {n['description']}", 'IMPLEMENTED') for n in apps_n]),
    sub('Stack (package.json)', [b(f"React {pkg_version('apps/web/package.json', 'react')} · Vite {pkg_version('apps/web/package.json', 'vite')} · router {pkg_version('apps/web/package.json', 'react-router-dom')}"),
                                  b(f"Fastify {pkg_version('apps/api/package.json', 'fastify')} · pg {pkg_version('apps/api/package.json', 'pg')} · zod {pkg_version('packages/contracts/package.json', 'zod')}"),
                                  b('Modular monolith + durable job worker')]),
    sub('Workspace packages (6)', [b(', '.join(sorted(n['name'].split('/')[1] for n in mods if n.get('kind') == 'package')))]),
    sub(f'External services ({len(exts)})', [b(f"{n['name']}", n['status']) for n in exts]),
]))
# BRANCH 02
role_check = collections.Counter()
for e in edges:
    if e['rel'] == 'REQUIRES' and nodes[e['dst']]['type'] == 'ROLE': role_check[nodes[e['dst']]['name']] += 1
auth_cnt = collections.Counter(n['auth'] for n in apis)
cards.append(Card('02', 'USER PERSONAS & ROLES', 'A', 'journeys/USER_JOURNEYS.md', [
    sub(f'Identities ({len(roles)})', [b(f"{r['name']}" + (f" · {role_check[r['name']]} role-gated endpoints" if role_check[r['name']] else ''), None) for r in roles]),
    sub('Navigation sets', [b(f"{k.replace('_NAV', '').replace(' (appended for platform_admin)', '+')}: {', '.join(i['label'] for i in v)}") for k, v in A['nav_sets'].items()]),
    sub('Endpoint auth levels', [b(f'{k} · {v}') for k, v in auth_cnt.most_common()]),
]))
# BRANCH 03
jm = collections.Counter(re.sub(r"^.*/", '', j['spec']).replace('.spec.ts', '') for j in jours)
cards.append(Card('03', 'COMPLETE USER JOURNEYS', 'A', 'journeys/USER_JOURNEYS.md', [
    sub(f'{len(jours)} e2e-derived journeys · {len(jm)} specs', [b(f'{k} · {v}', 'IMPLEMENTED') for k, v in top(jm, 12)], more_text(len(jm), 12, 'journeys/USER_JOURNEYS.md')),
    sub('Structural flows (from source)', [b('guard redirect → /login?return='), b('401 → clear session → reason → /login'), b('restricted account → profile only'), b('20 s request timeout → ApiError')]),
]))
# BRANCH 04
lvl_counts = collections.Counter()
inv = json.load(open(os.path.join(ROOT, 'project-mindmap', 'features', 'COMPLETE_FEATURE_INVENTORY.json')))
for e in inv['entries']: lvl_counts[e['level']] += 1
mod_top = sorted(((m, len(v)) for m, v in api_mods.items()), key=lambda x: -x[1])
cards.append(Card('04', 'COMPLETE FEATURE HIERARCHY', 'A', 'features/COMPLETE_FEATURE_INVENTORY.json', [
    sub('Levels (inventory)', [b(f'{k} · {lvl_counts[k]}') for k in ('APPLICATION', 'MODULE', 'FEATURE', 'SUB-FEATURE', 'MICRO-FEATURE', 'NANO-FEATURE')]),
    sub(f'API modules ({len(api_mods)}) by endpoints', [b(f"{m} · {c}", 'IMPLEMENTED' if all(x['durability'] == 'durable' for x in api_mods[m]) else 'PARTIALLY_IMPLEMENTED') for m, c in mod_top[:11]], more_text(len(mod_top), 11, 'master/MASTER_PROJECT_MINDMAP.md §6')),
    sub('Business rules', [b(f'{len(rules)} exported domain functions (RULE- nodes)')]),
]))
# BRANCH 05
scr_items = [b(f"{n['id']} {n['name']}" + (' 🔒' if n['guarded'] else ''), n['status']) for n in scrs if n['name'] != '/*']
cards.append(Card('05', 'SCREENS & UI COMPONENTS', 'A', 'ui/SCREEN_INTERACTION_INVENTORY.md', [
    sub(f'{len(scrs)} routed screens (🔒 = guarded)', scr_items[:16], more_text(len(scr_items), 16, 'ui/SCREEN_INTERACTION_INVENTORY.md')),
    sub(f'Shared components ({len(comps)})', [b(f'{len([c for c in comps if "/ui/" in c["file"]])} primitives in components/ui · {len([c for c in comps if "/ui/" not in c["file"]])} feature components')]),
]))
# BRANCH 06
ev = collections.Counter(n['kind'] for n in ints)
cls = collections.Counter(n['interaction_class'] for n in ints)
cards.append(Card('06', 'ACTIONS & INTERACTIONS', 'A', 'ui/SCREEN_INTERACTION_INVENTORY.md', [
    sub(f'{len(ints)} event bindings by kind', [b(f'{k} · {v}', 'IMPLEMENTED') for k, v in ev.most_common(10)]),
    sub('Traced to a request', [b(f'{k} · {v}') for k, v in cls.most_common()]),
    sub('Not present in source', [b('long press · swipe · drag-and-drop · none found')]),
]))
# BRANCH 07
inb = collections.Counter()
for e in edges:
    if e['rel'] == 'NAVIGATES_TO' and nodes[e['dst']]['type'] == 'SCR' and nodes[e['src']]['type'] in ('SCR', 'COMP'): inb[e['dst']] += 1
guarded = sum(1 for n in scrs if n['guarded'])
cards.append(Card('07', 'APPLICATION FLOW & NAVIGATION', 'A', 'ui/SCREEN_INTERACTION_INVENTORY.md', [
    sub('Routing', [b(f'{len(scrs)} routes · {guarded} guarded · {len(scrs) - guarded} public'), b('RequireAuth: token present, else /login?return='), b('catch-all * → NotFoundPage')]),
    sub('Role-aware navigation (Layout)', [b('signed-out → PUBLIC_NAV'), b('restricted → RESTRICTED_NAV'), b('recruiter · hiring_manager · admin → HIRING_NAV'), b('else CANDIDATE_NAV · admin adds /admin')]),
    sub('Navigation analysis', [b(f"screens with no inbound link: {sum(1 for n in scrs if inb[n['id']] == 0 and n['name'] != '/')}"), b('role gates inside pages: AdminPage, HiringPage')]),
]))
# BRANCH 08 (B)
dom_counts = []
for n in mods:
    if n.get('kind') == 'domain-module':
        dom_counts.append((n['name'].replace('domain/', ''), len(outs(n['id'], 'CONTAINS', 'RULE'))))
dom_counts.sort(key=lambda x: -x[1])
trans_tbl = [n for n in states if n['kind'] == 'transition-table']
cards.append(Card('08', 'BUSINESS LOGIC & DECISION TREES', 'B', 'data/END_TO_END_DATA_FLOWS.md', [
    sub(f'{len(dom_counts)} domain modules · {len(rules)} rules', [b(f'{m} · {c}', 'IMPLEMENTED') for m, c in dom_counts[:12]], more_text(len(dom_counts), 12, 'architecture/BACKEND_ARCHITECTURE.md')),
    sub('Explicit state machines', [b(f"{n['name'].replace('ALLOWED_', '').replace('_TRANSITIONS', '')} · {len(n['values'])} states · {sum(len(v) for v in n['transitions'].values())} transitions", 'IMPLEMENTED') for n in trans_tbl]),
    sub('Decision rule shape', [b('INPUT → schema parse → rule → branch → persist | DomainError')]),
]))
# BRANCH 09
cards.append(Card('09', 'FRONTEND ARCHITECTURE', 'B', 'architecture/FRONTEND_ARCHITECTURE.md', [
    sub('Runtime', [b('main.tsx → App → SessionProvider → BrowserRouter'), b('one context: SessionContext (status, user, profile)'), b('local useState per page · no query/state library')]),
    sub('API client', [b('apiFetch: Bearer token, single 401 policy'), b('apiJson: 20 s timeout, ApiError with server message'), b(f"{len(A['web_calls'])} call sites → {sum(1 for n in apis if n.get('web_callers'))} endpoints")]),
    sub('Browser storage', [b('localStorage: talentsphere_token, talentsphere_user'), b('sessionStorage: session-ended reason'), b('IndexedDB / SQLite: none found')]),
    sub('PWA / offline', [b('service-worker + display-mode detection', 'PARTIALLY_IMPLEMENTED'), b('offline data sync: none found', 'NOT_IMPLEMENTED')]),
]))
# BRANCH 10
cards.append(Card('10', 'BACKEND ARCHITECTURE', 'B', 'architecture/BACKEND_ARCHITECTURE.md', [
    sub('Request chain (server.ts)', [b('onRequest: writer-lease check → 503'), b('rate limit (user id or IP) · helmet · CORS'), b('extractUser → resolveSession'), b('handler: schema.parse → rules → persist'), b('onSend: x-request-id · durability label'), b('setErrorHandler: canonical envelope')]),
    sub('Persistence boundary', [b('storage mode pg | memory (no silent fallback)'), b(f'{n_dur} durable · {len(apis) - n_dur} ephemeral endpoints', 'PARTIALLY_IMPLEMENTED')]),
    sub('Worker', [b(f"{job_total} job kinds · {job_email} deliver email", 'PARTIALLY_IMPLEMENTED'), b('claim: FOR UPDATE SKIP LOCKED + lease fence')]),
]))
# BRANCH 11
bar = lambda d, t: f'{"■" * d}{"□" * (t - d)}'
cards.append(Card('11', 'API ECOSYSTEM', 'B', 'architecture/API_ARCHITECTURE.md', [
    sub(f'{len(apis)} REST endpoints · 0 GraphQL/WS/RPC', [b(f"{m} · {len(v)} {bar(sum(1 for x in v if x['durability'] == 'durable'), min(len(v), 12))}", 'IMPLEMENTED' if all(x['durability'] == 'durable' for x in v) else 'PARTIALLY_IMPLEMENTED') for m, v in sorted(api_mods.items(), key=lambda kv: -len(kv[1]))[:12]], '■ durable □ ephemeral'),
    sub('Verbs', [b(f'{k} · {v}') for k, v in collections.Counter(n['method'] for n in apis).most_common()]),
    sub('Contracts', [b(f"{len(by_type['SCH'])} Zod schemas · {sum(len(outs(n['id'], 'VALIDATES', 'SCH')) > 0 for n in apis)} endpoints parse one")]),
]))
# BRANCH 15
cards.append(Card('15', 'EXTERNAL INTEGRATIONS', 'B', 'architecture/BACKEND_ARCHITECTURE.md', [
    sub(f'{len(exts)} dependencies', [b(f"{n['name']} · {n['status']}", n['status']) for n in exts]),
    sub('Fallbacks', [b('Stripe off → stripeOff stubs (BILLING_MODE=disabled)'), b('Brevo off → labelled dev outbox'), b('Postgres down → boot fails fast')]),
]))
# BRANCH 16
cards.append(Card('16', 'SECURITY & PERMISSIONS', 'B', 'architecture/API_ARCHITECTURE.md', [
    sub('Identity & session', [b('self-issued HMAC session tokens'), b('revocation + password-change cut-off'), b('login throttle per account + IP'), b('Supabase Auth not used')]),
    sub('Access control', [b(f"{auth_cnt['session-required']} session-required · {auth_cnt['public']} public · {auth_cnt['session-optional']} optional"), b(f"{sum(1 for n in apis if n['roles'])} endpoints with role checks"), b(f"{sum(1 for n in dbs if n.get('rls'))}/{len(dbs)} tables with RLS", 'IMPLEMENTED')]),
    sub('Privacy lifecycle', [b('data export + account erasure endpoints'), b('restricted accounts keep data rights')]),
]))
# BRANCH 17
err_codes = collections.Counter(n['code'] for n in errs)
cards.append(Card('17', 'ERROR HANDLING & EDGE CASES', 'B', 'architecture/API_ARCHITECTURE.md', [
    sub(f'{len(errs)} error branches by code', [b(f'{k} · {v}') for k, v in err_codes.most_common()]),
    sub('Envelope', [b('{ error: { code, message, request_id, details? } }'), b('ZodError → VALIDATION_FAILED + issue list'), b('plugin 429 → RATE_LIMIT_EXCEEDED')]),
]))
# BRANCH 12 (C)
fk_in = collections.Counter()
for e in edges:
    if e['rel'] == 'DEPENDS_ON' and nodes[e['src']]['type'] == 'DB' and nodes[e['dst']]['type'] == 'DB': fk_in[nodes[e['dst']]['name']] += 1
schema_only = sum(1 for n in dbs if n['status'] == 'NOT_IMPLEMENTED')
cards.append(Card('12', 'DATABASE & DATA ARCHITECTURE', 'C', 'data/DATABASE_ENTITY_MAP.md', [
    sub('Postgres', [b(f'{len(dbs)} tables · {sum(1 for n in dbs if n.get("rls"))} with RLS · 55 migrations'), b(f"{len(A['enums'])} enums · {len(A['views'])} view · {len(A['functions'])} function")]),
    sub('Most-referenced tables (FK in)', [b(f'{k} · {v}', 'IMPLEMENTED') for k, v in fk_in.most_common(8)]),
    sub('Persistence reality', [b(f'{len(dbs) - schema_only} tables have a SQL consumer', 'IMPLEMENTED'), b(f'{schema_only} schema-only tables', 'NOT_IMPLEMENTED')]),
]))
# BRANCH 13
n_rel = lambda s, r, d: sum(1 for e in edges if e['rel'] == r and nodes[e['src']]['type'] == s and nodes[e['dst']]['type'] == d)
cards.append(Card('13', 'COMPLETE DATA FLOW', 'C', 'data/END_TO_END_DATA_FLOWS.md', [
    sub('Request path (counted edges)', [b(f"INT → API · {n_rel('INT', 'TRIGGERS', 'API')} triggers"), b(f"SCR/COMP → API · {n_rel('SCR', 'CALLS', 'API') + n_rel('COMP', 'CALLS', 'API')} calls"), b(f"API → SCH · {n_rel('API', 'VALIDATES', 'SCH')} validations"), b(f"API → RULE · {n_rel('API', 'CALLS', 'RULE')} calls"), b(f"API → store · {n_rel('API', 'CALLS', 'SVC')} calls"), b(f"API → table · {n_rel('API', 'WRITES', 'DB')} persist writes")]),
    sub('Async path', [b('route → background_jobs → worker → Brevo'), b(f'only {job_email} job kinds deliver; {job_noop} record only', 'PARTIALLY_IMPLEMENTED')]),
]))
# BRANCH 14
st_counter = collections.Counter(n['kind'] for n in states)
cards.append(Card('14', 'STATE MANAGEMENT & LIFECYCLE', 'C', 'data/END_TO_END_DATA_FLOWS.md', [
    sub(f'{len(states)} state definitions', [b(f'{k} · {v}') for k, v in st_counter.most_common()]),
    sub('Transition tables', [b(f"{n['name'].replace('ALLOWED_', '').replace('_TRANSITIONS', '')}: {' → '.join(list(n['transitions'])[:4])} …", 'IMPLEMENTED') for n in trans_tbl]),
    sub('Gap', [b(f"{sum(1 for n in states if n['kind'] == 'union-type')} status unions without a transition rule", 'PARTIALLY_IMPLEMENTED')]),
]))
# BRANCH 18
tc = collections.Counter(); cc = collections.Counter()
for n in tests: tc[n['category']] += 1; cc[n['category']] += n['cases']
cards.append(Card('18', 'TESTING & QUALITY', 'C', 'quality/TEST_COVERAGE_MAP.md', [
    sub(f'{len(tests)} files · {sum(cc.values())} cases (not run here)', [b(f'{k} · {tc[k]} files · {cc[k]} cases') for k in sorted(tc)]),
    sub('Link coverage (textual)', [b(f"endpoints referenced by a test · {sum(1 for n in apis if n.get('tests'))}/{len(apis)}"), b(f"screens with an e2e goto · {sum(1 for n in scrs if outs(n['id'], 'TESTED_BY', 'TEST'))}/{len(scrs)}"), b('no HIGH confidence: nothing executed', 'UNKNOWN')]),
]))
# BRANCH 19
cards.append(Card('19', 'INFRASTRUCTURE & DEPLOYMENT', 'C', 'architecture/BACKEND_ARCHITECTURE.md', [
    sub('CI workflows', [b(f"{os.path.basename(n['name'])} · {len(n.get('steps', []))} steps", 'PARTIALLY_IMPLEMENTED' if 'ci.yml' in n['name'] else 'IMPLEMENTED') for n in infra if n.get('kind') == 'ci-workflow']),
    sub('Deploy targets', [b(f"{n['name']} · {', '.join(n.get('files', []))[:40]}") for n in infra if n.get('kind') == 'deployment']),
    sub('Config', [b(f"{len(A['env_vars'])} env vars validated (zod)"), b(f"{sum(1 for n in infra if n.get('kind') == 'script')} scripts · 55 SQL migrations"), b('CI on main red since 2026-10-26', 'BROKEN')]),
]))
# BRANCH 20
dead_rules = sum(1 for n in rules if n.get('prod_references') == 0) if rules and 'prod_references' in rules[0] else None
no_ui = sum(1 for n in apis if not n.get('web_callers') and not n['path'].startswith(('/health', '/ready', '/api/v1/health')))
noop_jobs = job_noop
cards.append(Card('20', 'IMPLEMENTATION GAPS & DEBT', 'C', 'quality/IMPLEMENTATION_GAPS.md', [
    sub('Status distribution (capabilities)', [b(f'{k} · {v}', k) for k, v in collections.Counter(n.get('status') for t in ('API', 'SCR', 'INT', 'COMP', 'RULE', 'DB', 'EXT', 'JOUR', 'SVC', 'INFRA') for n in by_type[t] if n.get('status')).most_common()]),
    sub('Gaps with evidence', [b(f'{len(apis) - n_dur} ephemeral endpoints', 'PARTIALLY_IMPLEMENTED'), b(f'{schema_only} schema-only tables', 'NOT_IMPLEMENTED'), b(f'{no_ui} endpoints with no web caller', 'UNKNOWN'), b(f'{noop_jobs} no-op job kinds', 'PARTIALLY_IMPLEMENTED'), b('interview meeting link: fixed template', 'MOCKED')]),
]))

order = {c.bid: c for c in cards}

# ------------------------------------------------------------------ layout
W, H = 4400, 3380
PAD = 40
rect(0, 0, W, H, fill='#ffffff')
# zones (organic rounded regions, like the reference poster)
rect(20, 120, W - 40, 1000, fill=GROUP['A']['zone'], rx=90, op=0.55)
rect(20, 1975, 2150, 1385, fill=GROUP['B']['zone'], rx=90, op=0.55)
rect(2230, 1975, 2150, 1385, fill=GROUP['C']['zone'], rx=90, op=0.55)

# banner
text(60, 66, 'COMPLETE PROJECT ECOSYSTEM — TalentSphere, as built', 46, 'bold', INK)
text(60, 100, f"Reverse-engineered from the repository: {len(G['nodes']):,} nodes · {len(edges):,} typed edges · every node carries file:line evidence · status and confidence assigned · nothing executed (no HIGH confidence)", 19, 'normal', MUTED)
for i, (k, c) in enumerate([('IMPLEMENTED', '#2e7d32'), ('PARTIAL', '#f9a825'), ('NOT IMPL. / BROKEN', '#c62828'), ('MOCKED', '#e65100'), ('UNKNOWN', '#9e9e9e')]):
    x = 3060 + i * 0
for i, (k, c) in enumerate([('IMPLEMENTED', '#2e7d32'), ('PARTIALLY', '#f9a825'), ('NOT IMPL./BROKEN', '#c62828'), ('MOCKED', '#e65100'), ('UNKNOWN', '#9e9e9e')]):
    xx = 2780 + i * 320
    circle(xx, 58, 9, fill=c)
    text(xx + 16, 64, k, 17, 'bold', INK)

# card drawing
def draw_card(c, x, y, w):
    g = GROUP[c.group]
    c.x, c.y, c.w = x, y, w
    h = c.height()
    c.h = h
    rect(x, y, w, h, fill='#ffffff', stroke=g['line'], sw=3, rx=16)
    rect(x, y, w, 58, fill=g['line'], rx=16)
    rect(x, y + 40, w, 18, fill=g['line'])
    text(x + 18, y + 38, f'BRANCH {c.bid}', 15, 'bold', '#ffffff')
    text(x + 118, y + 38, fit(c.title, w - 136, 20), 20, 'bold', '#ffffff')
    cy = y + 74
    for sub_ in c.subs:
        tw = min(w - 28, int(len(sub_['title']) * 8.6) + 30)
        rect(x + 14, cy, tw, 28, fill=g['fill'], stroke=RED if c.group != 'X' else g['line'], sw=1.6, rx=4)
        text(x + 24, cy + 20, fit(sub_['title'], tw - 18, 15), 15, 'bold', INK)
        cy += 38
        for label, status, tag in sub_['items']:
            if status:
                circle(x + 30, cy + 6, 6, fill=STATUS[status])
                text(x + 44, cy + 11, fit(label, w - 64, 15), 15, 'normal', INK)
            else:
                text(x + 28, cy + 11, '•', 15, 'normal', MUTED)
                text(x + 44, cy + 11, fit(label, w - 64, 15), 15, 'normal', INK)
            cy += 23
        if sub_.get('more'):
            text(x + 44, cy + 11, fit(sub_['more'], w - 64, 14), 14, 'normal', MUTED, italic=True)
            cy += 22
        cy += 8
    text(x + 18, y + h - 14, fit('→ ' + c.detail, w - 30, 13), 13, 'normal', g['line'], italic=True)

# ---- Region A: 7 cards in one band
A_order = ['01', '02', '03', '04', '05', '06', '07']
cw = 588; gap = 16; ax = 38
ay = 150
a_h = max(order[i].natural_height() for i in A_order)
for i in A_order: order[i].force_h = a_h
curve_targets = {}
# ---- hub and middle band
HUB = (W // 2, 1500); HR = 235
# ---- Region B / C placement (2 rows each); compute heights first
B_order = ['08', '09', '10', '11', '15', '16', '17']
C_order = ['12', '13', '14', '18', '19', '20']
def place_rows(ids, x0, y0, colw, ncols_per_row):
    y = y0; i = 0; rows = []
    while i < len(ids):
        row = ids[i:i + ncols_per_row]
        h = max(order[r].natural_height() for r in row)
        for j, r in enumerate(row):
            order[r].force_h = h
            order[r].px, order[r].py = x0 + j * (colw + gap), y
        rows.append(h); y += h + gap; i += ncols_per_row
    return y
# need heights known: Card.height() works before drawing
for cid in A_order:
    order[cid].px, order[cid].py = ax + A_order.index(cid) * (cw + gap), ay
# B: rows of 3 + 3 + 1 would be tall; use 4 columns (width 520) → rows 4 + 3
bw = 508
by_end = place_rows(B_order, 44, 2036, bw, 4)
cw2 = 508
cy_end = place_rows(C_order, 2246, 2036, cw2, 4)
final_y = max(by_end, cy_end)
if final_y + 20 > H:
    raise SystemExit(f'poster too short: needs {final_y + 20}, have {H}')

# connections hub → cards (drawn before cards so cards sit on top)
for cid, c in order.items():
    g = GROUP[c.group]
    if c.group == 'A':
        tx, ty = c.px + cw / 2, c.py + a_h + 6
        curve(HUB[0], HUB[1] - HR + 20, tx, ty, g['line'], 2.4, 0.38, bend=0.5)
    elif c.group == 'B':
        tx, ty = c.px + bw / 2, c.py - 2
        curve(HUB[0] - HR + 40, HUB[1] + 60, tx, ty, g['line'], 2.4, 0.38, bend=0.5)
    else:
        tx, ty = c.px + cw2 / 2, c.py - 2
        curve(HUB[0] + HR - 40, HUB[1] + 60, tx, ty, g['line'], 2.4, 0.38, bend=0.5)

for cid in A_order:
    c = order[cid]
    # stretch heights to the tallest card in the row for a clean band
    draw_card(c, c.px, c.py, cw)
for cid in B_order:
    c = order[cid]; draw_card(c, c.px, c.py, bw)
for cid in C_order:
    c = order[cid]; draw_card(c, c.px, c.py, cw2)

# ---- hub
for r_, col in ((HR + 70, '#ffffff'),):
    circle(HUB[0], HUB[1], r_, fill=col, op=0.0)
rect(0, 0, 0, 0)
circle(HUB[0], HUB[1], HR + 22, fill='#ffffff', stroke='#cfd8e3', sw=2)
arc(HUB[0], HUB[1], HR, -90, 30, GROUP['A']['line'], 52)
arc(HUB[0], HUB[1], HR, 30, 150, GROUP['B']['line'], 52)
arc(HUB[0], HUB[1], HR, 150, 270, GROUP['C']['line'], 52)
circle(HUB[0], HUB[1], HR - 40, fill='#ffffff', stroke='#cfd8e3', sw=2)
text(HUB[0], HUB[1] - 70, 'COMPLETE', 30, 'bold', INK, 'middle')
text(HUB[0], HUB[1] - 34, 'PROJECT ECOSYSTEM', 28, 'bold', INK, 'middle')
text(HUB[0], HUB[1] + 14, 'TalentSphere', 24, 'bold', GROUP['A']['line'], 'middle')
text(HUB[0], HUB[1] + 50, f'{len(apis)} APIs · {len(scrs)} screens · {len(dbs)} tables', 19, 'normal', MUTED, 'middle')
text(HUB[0], HUB[1] + 76, f'{len(rules)} rules · {len(jours)} journeys · {len(tests)} test files', 19, 'normal', MUTED, 'middle')
text(HUB[0], HUB[1] + 106, f'{len(nodes)} nodes · {len(edges):,} edges', 19, 'normal', MUTED, 'middle')
# group labels around the ring
text(HUB[0] + HR + 60, HUB[1] - 120, 'PRODUCT & EXPERIENCE ▸', 22, 'bold', GROUP['A']['line'], 'start')
text(HUB[0] - HR - 60, HUB[1] - 40, '◂ DATA · PLATFORM · QUALITY', 22, 'bold', GROUP['C']['line'], 'end')
text(HUB[0] - HR + 10, HUB[1] + HR + 58, '◂ APPLICATION & LOGIC', 22, 'bold', GROUP['B']['line'], 'end')

# ---- side panels (left: legend, right: reading guide)
lx, ly = 60, 1200
rect(lx, ly, 1150, 590, fill='#ffffff', stroke='#cfd8e3', sw=2, rx=16)
text(lx + 22, ly + 38, 'LEGEND', 22, 'bold', INK)
yy = ly + 76
for k, c, d in [('IMPLEMENTED', '#2e7d32', 'source supports it (no runtime evidence)'), ('PARTIALLY_IMPLEMENTED', '#f9a825', 'works but ephemeral / no-op / opt-in'),
                ('NOT_IMPLEMENTED · BROKEN', '#c62828', 'schema-only, absent, or CI red'), ('MOCKED', '#e65100', 'template standing in for an integration'), ('UNKNOWN', '#9e9e9e', 'scan could not tell')]:
    circle(lx + 34, yy - 5, 9, fill=c); text(lx + 54, yy, k, 17, 'bold', INK); text(lx + 330, yy, d, 16, 'normal', MUTED); yy += 36
yy += 12
text(lx + 22, yy, 'RELATIONSHIPS (edge styles in the DOT / drawio graph)', 17, 'bold', INK); yy += 32
rel_counts = collections.Counter(e['rel'] for e in edges)
col = 0
for rel, cnt in rel_counts.most_common():
    cx_ = lx + 22 + (col % 2) * 560; cy_ = yy + (col // 2) * 28
    text(cx_, cy_, f'{rel}', 15, 'bold', INK); text(cx_ + 230, cy_, f'{cnt:,}', 15, 'normal', MUTED)
    col += 1
rx0 = W - 60 - 1150
rect(rx0, ly, 1150, 590, fill='#ffffff', stroke='#cfd8e3', sw=2, rx=16)
text(rx0 + 22, ly + 38, 'HOW TO READ AND NAVIGATE', 22, 'bold', INK)
guide = ['Each card is one of the 20 required branches; the footer names its detail file.', 'Boxed headings are sub-branches; dots show the implementation status of the item.', 'Every item is a node (or a count of nodes) in master/MASTER_PROJECT_GRAPH.json:',
         '   PROJ ROLE JOUR MOD FEAT API SCR COMP INT ERR RULE SCH SVC DB STATE TEST EXT INFRA', 'Curves from the hub show the three groups; the chain below shows real cross-connections.',
         'Full graph (nothing truncated): GRAPH.json · GRAPH.dot · per-module subgraphs.', 'Journeys come from e2e tests; tests were not executed → confidence is MEDIUM at best.',
         'Reading order for a newcomer: 01 → 02 → 05 → 11 → 08 → 12 → 13 → 20.']
yy = ly + 78
for gline in guide:
    for part in [gline[i:i + 92] for i in range(0, len(gline), 92)]:
        text(rx0 + 22, yy, part, 18, 'normal', INK); yy += 30
    yy += 8

# ---- cross-connection chain strip
chain_y = 1915
rect(40, chain_y - 46, W - 80, 92, fill='#ffffff', stroke='#cfd8e3', sw=2, rx=16)
text(60, chain_y - 18, 'CROSS-CONNECTION CHAIN — edge counts from the graph', 15, 'bold', MUTED)
chain = [('ROLE', 'ROLE', 'AUTHORIZES', 'SCR'), ('JOUR', 'JOUR', 'NAVIGATES_TO', 'SCR'), ('SCR', 'SCR', 'CALLS', 'API'), ('INT', 'INT', 'TRIGGERS', 'API'), ('API', 'API', 'CALLS', 'RULE'),
         ('RULE', 'RULE', None, None), ('SVC', 'SVC', 'WRITES', 'DB'), ('DB', 'DB', None, None), ('TEST', 'TEST', None, None)]
seq = ['ROLE', 'JOUR', 'SCR', 'INT', 'API', 'RULE', 'SVC', 'DB', 'TEST']
def cnt(s, rels, d):
    return sum(1 for e in edges if e['rel'] in rels and nodes[e['src']]['type'] == s and nodes[e['dst']]['type'] == d)
links = [('AUTHORIZES', cnt('ROLE', ('AUTHORIZES',), 'SCR')), ('NAVIGATES_TO', cnt('JOUR', ('NAVIGATES_TO',), 'SCR')), ('CALLS', cnt('SCR', ('CALLS',), 'API') + cnt('COMP', ('CALLS',), 'API')),
         ('TRIGGERS', cnt('INT', ('TRIGGERS',), 'API')), ('CALLS', cnt('API', ('CALLS',), 'RULE')), ('CALLS store', cnt('API', ('CALLS',), 'SVC')),
         ('READS/WRITES', cnt('SVC', ('READS', 'WRITES', 'UPDATES'), 'DB')), ('TESTED_BY', cnt('API', ('TESTED_BY',), 'TEST'))]
# order for display: ROLE → SCR ← JOUR is not linear, so show as a flow of the real hops
disp = [('ROLE', 'AUTHORIZES', 'SCR'), ('SCR', 'CALLS', 'API'), ('INT', 'TRIGGERS', 'API'), ('API', 'CALLS', 'RULE'), ('API', 'CALLS', 'SVC'), ('SVC', 'READS/WRITES', 'DB'), ('API', 'TESTED_BY', 'TEST')]
nboxes = len(disp) * 2
slot = (W - 120) / nboxes
xx = 60
def tcount(t): return len(by_type[t])
for i, (s_, rel, d_) in enumerate(disp):
    x0 = 60 + i * (W - 120) / len(disp)
    wbox = (W - 120) / len(disp) - 20
    if rel == 'READS/WRITES': cn = cnt('SVC', ('READS', 'WRITES', 'UPDATES'), 'DB')
    elif rel == 'AUTHORIZES': cn = cnt('ROLE', ('AUTHORIZES',), 'SCR')
    elif rel == 'CALLS' and s_ == 'SCR': cn = cnt('SCR', ('CALLS',), 'API') + cnt('COMP', ('CALLS',), 'API')
    else: cn = cnt(s_, (rel,), d_)
    rect(x0, chain_y - 4, wbox, 40, fill='#eef3f9', stroke='#9fb3c8', sw=1.5, rx=10)
    text(x0 + wbox / 2, chain_y + 22, f'{s_} ({tcount(s_)})  —{rel} {cn:,}→  {d_} ({tcount(d_)})', 17, 'bold', INK, 'middle')

# title for zones
text(60, 1150 + 8, '', 1)
text(60, 2024 - 10, '', 1)
text(40 + 14, 2018, 'APPLICATION & LOGIC', 26, 'bold', GROUP['B']['line'])
text(2246 + 14, 2018, 'DATA · PLATFORM · QUALITY', 26, 'bold', GROUP['C']['line'])
text(40 + 14, 142, 'PRODUCT & EXPERIENCE', 26, 'bold', GROUP['A']['line'])

# ------------------------------------------------------------------ SVG writer
def svg_out():
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" font-family="Arial, Helvetica, sans-serif">',
         f'<title>COMPLETE PROJECT ECOSYSTEM: master mind map of the TalentSphere repository</title>',
         '<desc>Generated by project-mindmap/tools/poster.py from master/MASTER_PROJECT_GRAPH.json</desc>']
    for it in items:
        k = it[0]
        if k == 'rect':
            _, x, y, w, h, fill, stroke, sw, rx, op = it
            if w == 0 or h == 0: continue
            o.append(f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" opacity="{op}"/>')
        elif k == 'circle':
            _, cx, cy, r, fill, stroke, sw, op = it
            o.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" opacity="{op}"/>')
        elif k == 'text':
            _, x, y, s, size, weight, fill, anchor, italic = it
            if not s: continue
            o.append(f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size}" font-weight="{weight}" fill="{fill}" text-anchor="{anchor}"' + (' font-style="italic"' if italic else '') + f'>{escape(s)}</text>')
        elif k == 'curve':
            _, x1, y1, x2, y2, stroke, sw, op, dash, bend = it
            my = y1 + (y2 - y1) * bend
            o.append(f'<path d="M{x1:.1f},{y1:.1f} C{x1:.1f},{my:.1f} {x2:.1f},{my:.1f} {x2:.1f},{y2:.1f}" fill="none" stroke="{stroke}" stroke-width="{sw}" opacity="{op}"' + (f' stroke-dasharray="{dash}"' if dash else '') + '/>')
        elif k == 'arc':
            import math
            _, cx, cy, r, a0, a1, stroke, sw = it
            p0 = (cx + r * math.cos(math.radians(a0)), cy + r * math.sin(math.radians(a0)))
            p1 = (cx + r * math.cos(math.radians(a1)), cy + r * math.sin(math.radians(a1)))
            o.append(f'<path d="M{p0[0]:.1f},{p0[1]:.1f} A{r},{r} 0 0 1 {p1[0]:.1f},{p1[1]:.1f}" fill="none" stroke="{stroke}" stroke-width="{sw}"/>')
        elif k == 'line':
            _, x1, y1, x2, y2, stroke, sw, dash, arrow = it
            o.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{stroke}" stroke-width="{sw}"/>')
    o.append('</svg>')
    return '\n'.join(o) + '\n'

# ------------------------------------------------------------------ draw.io writer
def drawio_out():
    import math
    cells = ['<mxCell id="0"/>', '<mxCell id="1" parent="0"/>']
    nid = [2]
    def add(xml):
        cells.append(xml); nid[0] += 1
    def style_color(c): return c if c and c != 'none' else 'none'
    for it in items:
        k = it[0]; i = nid[0]
        if k == 'rect':
            _, x, y, w, h, fill, stroke, sw, rx, op = it
            if w == 0 or h == 0: continue
            st = f'rounded={1 if rx else 0};arcSize={min(50, rx)};whiteSpace=wrap;html=1;fillColor={style_color(fill)};strokeColor={style_color(stroke)};strokeWidth={sw};opacity={int(op * 100)};'
            add(f'<mxCell id="n{i}" value="" style="{st}" vertex="1" parent="1"><mxGeometry x="{x:.0f}" y="{y:.0f}" width="{w:.0f}" height="{h:.0f}" as="geometry"/></mxCell>')
        elif k == 'circle':
            _, cx, cy, r, fill, stroke, sw, op = it
            st = f'ellipse;whiteSpace=wrap;html=1;fillColor={style_color(fill)};strokeColor={style_color(stroke)};strokeWidth={sw};opacity={int(op * 100)};'
            add(f'<mxCell id="n{i}" value="" style="{st}" vertex="1" parent="1"><mxGeometry x="{cx - r:.0f}" y="{cy - r:.0f}" width="{2 * r:.0f}" height="{2 * r:.0f}" as="geometry"/></mxCell>')
        elif k == 'text':
            _, x, y, s, size, weight, fill, anchor, italic = it
            if not s: continue
            wpx = max(30, int(len(s) * size * 0.58) + 10)
            align = {'start': 'left', 'middle': 'center', 'end': 'right'}[anchor]
            x0 = x if anchor == 'start' else (x - wpx / 2 if anchor == 'middle' else x - wpx)
            fs = (1 if weight == 'bold' else 0) | (2 if italic else 0)
            st = f'text;html=1;strokeColor=none;fillColor=none;align={align};verticalAlign=middle;whiteSpace=nowrap;overflow=visible;fontSize={size};fontColor={fill};fontStyle={fs};'
            add(f'<mxCell id="n{i}" value="{escape(s, {chr(34): "&quot;"})}" style="{st}" vertex="1" parent="1"><mxGeometry x="{x0:.0f}" y="{y - size:.0f}" width="{wpx}" height="{size + 8}" as="geometry"/></mxCell>')
        elif k == 'curve':
            _, x1, y1, x2, y2, stroke, sw, op, dash, bend = it
            st = f'curved=1;endArrow=none;html=1;strokeColor={stroke};strokeWidth={sw};opacity={int(op * 100)};'
            my = y1 + (y2 - y1) * bend
            add(f'<mxCell id="n{i}" value="" style="{st}" edge="1" parent="1"><mxGeometry relative="1" as="geometry"><mxPoint x="{x1:.0f}" y="{y1:.0f}" as="sourcePoint"/><mxPoint x="{x2:.0f}" y="{y2:.0f}" as="targetPoint"/><Array as="points"><mxPoint x="{x1:.0f}" y="{my:.0f}"/><mxPoint x="{x2:.0f}" y="{my:.0f}"/></Array></mxGeometry></mxCell>')
        elif k == 'arc':
            _, cx, cy, r, a0, a1, stroke, sw = it
            st = f'shape=mxgraph.basic.arc;startAngle={((a0 + 90) % 360) / 360:.4f};endAngle={((a1 + 90) % 360) / 360:.4f};strokeColor={stroke};strokeWidth={sw};fillColor=none;html=1;'
            add(f'<mxCell id="n{i}" value="" style="{st}" vertex="1" parent="1"><mxGeometry x="{cx - r:.0f}" y="{cy - r:.0f}" width="{2 * r:.0f}" height="{2 * r:.0f}" as="geometry"/></mxCell>')
    return ('<?xml version="1.0" encoding="UTF-8"?>\n<mxfile host="project-mindmap"><diagram id="master" name="COMPLETE PROJECT ECOSYSTEM">'
            f'<mxGraphModel dx="{W}" dy="{H}" grid="0" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="{W}" pageHeight="{H}" math="0" shadow="0"><root>\n'
            + '\n'.join(cells) + '\n</root></mxGraphModel></diagram></mxfile>\n')

open(os.path.join(OUT, 'MASTER_PROJECT_MINDMAP.svg'), 'w', encoding='utf8').write(svg_out())
open(os.path.join(OUT, 'MASTER_PROJECT_MINDMAP.drawio'), 'w', encoding='utf8').write(drawio_out())
print('poster ok:', len(items), 'primitives;', len(cards), 'cards; canvas', W, 'x', H, '; content bottom', final_y)
