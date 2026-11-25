#!/usr/bin/env python3
"""Usage: python3 -I project-mindmap/tools/mermaid_master.py <workdir>   (workdir = extract.py output; run generate.py first)

Builds the MASTER mind map as Mermaid only (no images):
  master/MASTER_PROJECT_MINDMAP.mmd      rich `mindmap`: root -> 20 branches -> sub-branches -> items (status emoji prefix)
  master/MASTER_PROJECT_DIAGRAMS.md      overview flowchart (hub, branches, cross-connection chain) + one colour-coded flowchart per zone
Every label is computed from master/MASTER_PROJECT_GRAPH.json, features/COMPLETE_FEATURE_INVENTORY.json or the extractor's aux.json.
"""

import json, os, sys, re, collections, glob

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
WORK = sys.argv[1]
OUT = os.path.join(ROOT, 'project-mindmap', 'master')
G = json.load(open(os.path.join(OUT, 'MASTER_PROJECT_GRAPH.json')))
A = json.load(open(os.path.join(WORK, 'aux.json')))
N_MIG = len(glob.glob(os.path.join(ROOT, 'supabase', 'migrations', '*.sql')))
nodes = {n['id']: n for n in G['nodes']}
edges = G['edges']
by_type = collections.defaultdict(list)
for n in G['nodes']:
    by_type[n['type']].append(n)
EXE = A.get('execution') or {}
EXE_SUITES = EXE.get('suites', {}) if EXE.get('available') else {}
def exe_line(k):
    s = EXE_SUITES.get(k)
    return f"{k} · {s['passed']}/{s['total']} passed" if s else f'{k} · not run'
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
    sub('Run results (e2e)', [b(f"{k} · {v}", 'IMPLEMENTED' if k == 'passed' else 'BROKEN' if k == 'failed' else 'UNKNOWN') for k, v in collections.Counter((j.get('execution') or {}).get('outcome', 'not run') for j in jours).most_common()]),
    sub(f"Documented target journeys J-01..J-{len(by_type['DOCJ']):02d}", [b(f"cited by code or tests · {sum(1 for n in by_type['DOCJ'] if n.get('code_links') or n.get('test_links'))}", 'PARTIALLY_IMPLEMENTED'), b(f"named by nothing · {sum(1 for n in by_type['DOCJ'] if not (n.get('code_links') or n.get('test_links')))}", 'UNKNOWN')]),
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
    sub(f"Documented features F-01..F-{len(by_type['DOCF'])}", [b(f"cited by source · {sum(1 for n in by_type['DOCF'] if n.get('code_links'))}", 'PARTIALLY_IMPLEMENTED')] + [b(f"documented status {k} · {v}", {'Partially implemented': 'PARTIALLY_IMPLEMENTED', 'Not implemented': 'NOT_IMPLEMENTED', 'Implemented, unverified': 'IMPLEMENTED', 'Broken or regressed': 'BROKEN', 'Deprecated or rejected': 'DEPRECATED'}.get(k)) for k, v in collections.Counter(n.get('doc_status') for n in by_type['DOCF']).most_common()]),
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
    sub('PWA / offline', [b('manifest + display-mode detection', 'PARTIALLY_IMPLEMENTED'), b('service-worker registration: none found', 'NOT_IMPLEMENTED'), b('offline data sync: none found', 'NOT_IMPLEMENTED')]),
    sub('Rule copies', [b('web lib/types.ts mirrors application and job transition tables', 'PARTIALLY_IMPLEMENTED')]),
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
    sub(f'{len(apis)} REST endpoints · 0 GraphQL/WS/RPC', [b(f"{m} · {len(v)} endpoints · {sum(1 for x in v if x['durability'] == 'durable')} durable", 'IMPLEMENTED' if all(x['durability'] == 'durable' for x in v) else 'PARTIALLY_IMPLEMENTED') for m, v in sorted(api_mods.items(), key=lambda kv: -len(kv[1]))[:12]], more_text(len(api_mods), 12, 'architecture/API_ARCHITECTURE.md')),
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
    sub('Postgres', [b(f'{len(dbs)} tables · {sum(1 for n in dbs if n.get("rls"))} with RLS · {N_MIG} migrations'), b(f"{len(A['enums'])} enums · {len(A['views'])} view · {len(A['functions'])} function")]),
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
    sub(f'{len(tests)} files · {sum(cc.values())} static cases', [b(f'{k} · {tc[k]} files · {cc[k]} cases') for k in sorted(tc)]),
    sub(f"Executed {EXE.get('date', '')}".strip(), [b(exe_line(k), 'IMPLEMENTED' if EXE_SUITES.get(k, {}).get('failed') == 0 else 'UNKNOWN') for k in ('vitest', 'vitest-pg', 'e2e', 'node-test')] + [b(f"{c['name'][:40]} · {c['result']}", 'IMPLEMENTED' if c['result'] == 'PASS' else 'BROKEN') for c in EXE.get('checks', [])]),
    sub('Link coverage (textual)', [b(f"endpoints referenced by a test · {sum(1 for n in apis if n.get('tests'))}/{len(apis)}"), b(f"screens with an e2e goto · {sum(1 for n in scrs if outs(n['id'], 'TESTED_BY', 'TEST'))}/{len(scrs)}"), b('HIGH confidence = passing linked test (path-level)' if EXE_SUITES else 'no HIGH confidence: nothing executed', 'IMPLEMENTED' if EXE_SUITES else 'UNKNOWN')]),
]))
# BRANCH 19
cards.append(Card('19', 'INFRASTRUCTURE & DEPLOYMENT', 'C', 'architecture/BACKEND_ARCHITECTURE.md', [
    sub('CI workflows', [b(f"{os.path.basename(n['name'])} · {len(n.get('steps', []))} steps", 'PARTIALLY_IMPLEMENTED' if 'ci.yml' in n['name'] else 'IMPLEMENTED') for n in infra if n.get('kind') == 'ci-workflow']),
    sub('Deploy targets', [b(f"{n['name']} · {', '.join(n.get('files', []))[:40]}") for n in infra if n.get('kind') == 'deployment']),
    sub('Config', [b(f"{len(A['env_vars'])} env vars validated (zod)"), b(f"{sum(1 for n in infra if n.get('kind') == 'script')} scripts · {N_MIG} SQL migrations"), b('CI on main red since 2026-10-26 at the Prettier step', 'BROKEN')]),
]))
# BRANCH 20
dead_rules = sum(1 for n in rules if n.get('prod_references') == 0) if rules and 'prod_references' in rules[0] else None
no_ui = sum(1 for n in apis if not n.get('web_callers') and not n['path'].startswith(('/health', '/ready', '/api/v1/health')))
noop_jobs = job_noop
cards.append(Card('20', 'IMPLEMENTATION GAPS & DEBT', 'C', 'quality/IMPLEMENTATION_GAPS.md', [
    sub('Status distribution (capabilities)', [b(f'{k} · {v}', k) for k, v in collections.Counter(n.get('status') for t in ('API', 'SCR', 'INT', 'COMP', 'RULE', 'DB', 'EXT', 'JOUR', 'SVC', 'INFRA') for n in by_type[t] if n.get('status')).most_common()]),
    sub('Gaps with evidence', [b(f'{len(apis) - n_dur} ephemeral endpoints', 'PARTIALLY_IMPLEMENTED'), b(f'{schema_only} schema-only tables', 'NOT_IMPLEMENTED'), b(f'{no_ui} endpoints with no web caller', 'UNKNOWN'), b(f'{noop_jobs} no-op job kinds', 'PARTIALLY_IMPLEMENTED'), b('interview meeting link: fixed template', 'MOCKED'), b('no service-worker registration', 'NOT_IMPLEMENTED')]),
    sub('Documentation vs code', [b(f"features documented as built but cited nowhere · {sum(1 for n in by_type['DOCF'] if (n.get('disagreement') or '').startswith('documented as (partially)'))}", 'UNKNOWN'), b(f"features documented as missing but cited by handlers · {sum(1 for n in by_type['DOCF'] if (n.get('disagreement') or '').startswith('documented as not'))}", 'PARTIALLY_IMPLEMENTED'), b(f"endpoints citing no documented ID · {sum(1 for n in apis if not any(e['rel'] == 'IMPLEMENTS' for e in out_e[n['id']]))}", 'UNKNOWN')]),
]))

order = {c.bid: c for c in cards}

# ------------------------------------------------------------------ Mermaid emitters
EMOJI = {'IMPLEMENTED': '✅', 'PARTIALLY_IMPLEMENTED': '⚠️', 'NOT_IMPLEMENTED': '❌', 'BROKEN': '❌', 'MOCKED': '🟠', 'UNREACHABLE': '❌', 'DEPRECATED': '⚪', 'UNKNOWN': '⚪', None: '▫️'}

def clean(s, n=72):
    s = str(s).replace('→', ' to ').replace('·', '-').replace('■', '#').replace('□', '.').replace('🔒', '(locked)').replace('—', '-').replace('…', '...').replace('▸', '').replace('◂', '')
    s = s.replace('&', ' and ').replace('>', ' to ').replace('|', ' or ')
    s = re.sub(r"[#.]{4,}", '', s)
    s = re.sub(r"[^A-Za-z0-9 /._\-+%:,#=]", ' ', s)
    s = re.sub(r"\s+", ' ', s).strip()
    return s if len(s) <= n else s[:n - 3].rstrip() + '...'

order_ids = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20']
GCLS = {'A': 'grpA', 'B': 'grpB', 'C': 'grpC'}

# ---- 1. master mindmap: 20 branches -> sub-branches (items are in the per-branch mindmaps)
mm = ['%%{init: {"mindmap": {"padding": 28, "maxNodeWidth": 240}}}%%', 'mindmap', '  root((COMPLETE PROJECT ECOSYSTEM))']
for g in ('A', 'B', 'C'):
    mm.append(f'    {clean(GROUP[g]["name"], 40)}')
    for bid in [i for i in order_ids if order[i].group == g]:
        c = order[bid]
        mm.append(f'      BRANCH {bid} {clean(c.title, 40)}')
        for sb in c.subs:
            mm.append(f'        {clean(sb["title"], 56)}')
mm_text = '\n'.join(mm) + '\n'
open(os.path.join(OUT, 'MASTER_PROJECT_MINDMAP.mmd'), 'w', encoding='utf8').write(mm_text)

# ---- 2. per-branch detail mindmaps
def branch_mindmap(bid):
    c = order[bid]
    L = ['mindmap', f'  root(("BRANCH {bid}<br/>{clean(c.title, 40)}"))']
    for sb in c.subs:
        L.append(f'    {clean(sb["title"], 56)}')
        for label, status, _t in sb['items']:
            L.append(f'      {EMOJI[status]} {clean(label)}')
        if sb.get('more'):
            L.append(f'      {clean(sb["more"], 70)}')
    return '\n'.join(L)

# ---- 3. overview flowchart: hub -> zones -> branches
HEAD = ['  classDef grpA fill:#e8f1fd,stroke:#1565c0,color:#1b2733,stroke-width:2px;', '  classDef grpB fill:#f3eafa,stroke:#6a1b9a,color:#1b2733,stroke-width:2px;', '  classDef grpC fill:#e3f5f2,stroke:#00796b,color:#1b2733,stroke-width:2px;',
        '  classDef hub fill:#ffffff,stroke:#1b2733,stroke-width:4px,color:#1b2733;', '  classDef api fill:#fff3e0,stroke:#e65100,color:#1b2733;']
OV = ['flowchart LR', f'  HUB(("COMPLETE PROJECT ECOSYSTEM<br/>TalentSphere<br/>{len(nodes):,} nodes - {len(edges):,} edges")):::hub']
for g in ('A', 'B', 'C'):
    OV.append(f'  Z{g}["{clean(GROUP[g]["name"], 40)}"]:::{GCLS[g]}')
    OV.append(f'  HUB ==> Z{g}')
    for bid in [i for i in order_ids if order[i].group == g]:
        c = order[bid]
        OV.append(f'  B{bid}["{bid} {clean(c.title, 36)}<br/>{clean(c.detail, 48)}"]:::{GCLS[g]}')
        OV.append(f'  Z{g} --> B{bid}')
OV += HEAD
overview = '\n'.join(OV)

# ---- 4. cross-connection chain
def ncount(s, rels, d):
    return sum(1 for e in edges if e['rel'] in rels and nodes[e['src']]['type'] == s and nodes[e['dst']]['type'] == d)
CH = ['flowchart LR',
      f'  R["ROLE ({len(by_type["ROLE"])})"]:::grpA -->|"AUTHORIZES {ncount("ROLE", ("AUTHORIZES",), "SCR"):,}"| S["SCR ({len(by_type["SCR"])})"]:::grpA',
      f'  S -->|"CALLS {ncount("SCR", ("CALLS",), "API") + ncount("COMP", ("CALLS",), "API"):,}"| P["API ({len(by_type["API"])})"]:::api',
      f'  I["INT ({len(by_type["INT"])})"]:::grpA -->|"TRIGGERS {ncount("INT", ("TRIGGERS",), "API"):,}"| P',
      f'  J["JOUR ({len(by_type["JOUR"])})"]:::grpA -->|"NAVIGATES_TO {ncount("JOUR", ("NAVIGATES_TO",), "SCR"):,}"| S',
      f'  P -->|"VALIDATES {ncount("API", ("VALIDATES",), "SCH"):,}"| SC["SCH ({len(by_type["SCH"])})"]:::grpB',
      f'  P -->|"CALLS {ncount("API", ("CALLS",), "RULE"):,}"| RU["RULE ({len(by_type["RULE"])})"]:::grpB',
      f'  P -->|"CALLS {ncount("API", ("CALLS",), "SVC"):,}"| SV["SVC ({len(by_type["SVC"])})"]:::grpB',
      f'  P -->|"TRIGGERS {ncount("API", ("TRIGGERS",), "SVC"):,}"| JB["job kinds"]:::grpB',
      f'  SV -->|"READS/WRITES {ncount("SVC", ("READS", "WRITES", "UPDATES"), "DB"):,}"| D["DB ({len(by_type["DB"])})"]:::grpC',
      f'  P -->|"WRITES via persist kind {ncount("API", ("WRITES",), "DB"):,}"| D',
      f'  P -->|"PRODUCES {ncount("API", ("PRODUCES",), "ERR"):,}"| E["ERR ({len(by_type["ERR"])})"]:::bad',
      f'  P -->|"TESTED_BY {ncount("API", ("TESTED_BY",), "TEST"):,}"| T["TEST ({len(by_type["TEST"])})"]:::grpC']
CH += HEAD + ['  classDef bad fill:#ffebee,stroke:#c62828,color:#1b2733;']
chain = '\n'.join(CH)

legend = """| Marker | Meaning |
| --- | --- |
| ✅ | IMPLEMENTED: source supports it (HIGH confidence where a linked test passed; see the master map section 4) |
| ⚠️ | PARTIALLY_IMPLEMENTED: works but ephemeral, no-op, or opt-in |
| ❌ | NOT_IMPLEMENTED / BROKEN: schema-only, absent, or CI red |
| 🟠 | MOCKED: a template stands in for an integration |
| ⚪ | UNKNOWN: the scan could not tell |
| ▫️ | informational (no status applies) |"""
doc = f"""# Master Diagrams (Mermaid)

The master mind map as Mermaid only, generated from the graph by `tools/mermaid_master.py`. Every item is a node or a count of nodes in [`MASTER_PROJECT_GRAPH.json`](MASTER_PROJECT_GRAPH.json).

- **Master mind map** (20 branches, sub-branches): [`MASTER_PROJECT_MINDMAP.mmd`](MASTER_PROJECT_MINDMAP.mmd), embedded in [`MASTER_PROJECT_MINDMAP.md`](MASTER_PROJECT_MINDMAP.md).
- **One detail mind map per branch** (every item, with status): section 3 below.
- **Overview flowchart** (hub to zones to branches) and **cross-connection chain**: sections 1 and 2.
- Zone colours: blue = product and experience, purple = application and logic, teal = data, platform and quality, orange = APIs.

{legend}

## 1. Overview: hub, zones and the 20 branches

```mermaid
{overview}
```

## 2. Cross-connection chain (edge counts from the graph)

```mermaid
{chain}
```

## 3. Detail mind maps, one per branch

""" + '\n'.join(f"""### Branch {bid}: {order[bid].title.title()}

Detail file: [`{order[bid].detail}`](../{order[bid].detail})

```mermaid
{branch_mindmap(bid)}
```
""" for bid in order_ids)
open(os.path.join(OUT, 'MASTER_PROJECT_DIAGRAMS.md'), 'w', encoding='utf8').write(doc)
print('mermaid master ok:', len(mm), 'master mindmap lines;', len(order_ids), 'branch mindmaps')
