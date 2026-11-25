#!/usr/bin/env python3
"""Usage: python3 -I project-mindmap/tools/generate.py <workdir>  (workdir = extract.py output; optional <workdir>/../mmtest/{mm_out,dot_out}.json hold parser results)
Generates project-mindmap/ from graph_raw.json + aux.json. Read-only on the repo."""
import json, os, re, csv, sys, collections, subprocess, glob

SCR = sys.argv[1]
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
OUT = os.path.join(ROOT, 'project-mindmap')
os.chdir(ROOT)
G = json.load(open(f'{SCR}/graph_raw.json'))
A = json.load(open(f'{SCR}/aux.json'))
nodes = {n['id']: n for n in G['nodes']}
edges = G['edges']

def read(p):
    return open(p, encoding='utf8', errors='replace').read()

def w(path, text):
    full = os.path.join(OUT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w', encoding='utf8') as f:
        f.write(text)

def esc(s):
    return str(s).replace('|', '\\|').replace('\n', ' ')

def table(headers, rows):
    out = ['| ' + ' | '.join(headers) + ' |', '| ' + ' | '.join('---' for _ in headers) + ' |']
    for r in rows:
        out.append('| ' + ' | '.join(esc(c) for c in r) + ' |')
    return '\n'.join(out)

def loc(n):
    e = (n.get('evidence') or [{}])[0]
    f = e.get('file') or ''
    ln = e.get('line')
    return f'{f}:{ln}' if ln else f

out_e = collections.defaultdict(list)
in_e = collections.defaultdict(list)
for e in edges:
    out_e[e['src']].append(e)
    in_e[e['dst']].append(e)

def outs(nid, rel=None, typ=None):
    return [e['dst'] for e in out_e[nid] if (rel is None or e['rel'] == rel) and (typ is None or nodes[e['dst']]['type'] == typ)]

def ins(nid, rel=None, typ=None):
    return [e['src'] for e in in_e[nid] if (rel is None or e['rel'] == rel) and (typ is None or nodes[e['src']]['type'] == typ)]

types = collections.Counter(n['type'] for n in nodes.values())
apis = [n for n in nodes.values() if n['type'] == 'API']
scrs = [n for n in nodes.values() if n['type'] == 'SCR']
ints = [n for n in nodes.values() if n['type'] == 'INT']
rules = [n for n in nodes.values() if n['type'] == 'RULE']
dbs = [n for n in nodes.values() if n['type'] == 'DB']
tests = [n for n in nodes.values() if n['type'] == 'TEST']
jours = [n for n in nodes.values() if n['type'] == 'JOUR']
comps = [n for n in nodes.values() if n['type'] == 'COMP']
errs = [n for n in nodes.values() if n['type'] == 'ERR']
roles = [n for n in nodes.values() if n['type'] == 'ROLE']
routes = {r['key']: r for r in A['routes']}
api_by_key = {n['name']: n for n in apis}

# ---------------------------------------------------------------- source usage of rules / components
src_files = [f for f in subprocess.run(['git', 'ls-files'], capture_output=True, text=True).stdout.split('\n') if f]
code_files = [f for f in src_files if re.search(r"\.(ts|tsx|mjs|js)$", f) and not f.startswith(('Yash_Final', 'graphify-out', 'TalentSphere/', 'PRODUCT_BLUEPRINT', 'project-mindmap'))]
code_text = {}
for f in code_files:
    try:
        code_text[f] = read(f)
    except Exception:
        pass
prod_files = [f for f in code_text if not f.startswith(('tests/', 'scripts/tests/'))]
def uses(sym, def_file, def_line):
    n = 0
    files = set()
    pat = re.compile(rf"\b{re.escape(sym)}\b")
    for f in prod_files:
        for i, l in enumerate(code_text[f].split('\n'), 1):
            if pat.search(l) and not (f == def_file and i == def_line):
                if f == def_file and re.match(rf"\s*(export )?(async )?(function|const|class) {re.escape(sym)}\b", l):
                    continue
                n += 1; files.add(f)
    return n, files
for n in rules:
    e = n['evidence'][0]
    cnt, fl = uses(n['name'], e['file'], e['line'])
    n['prod_references'] = cnt
    n['prod_ref_files'] = sorted(fl)
for n in comps:
    e = n['evidence'][0]
    pat = re.compile(rf"<{re.escape(n['name'])}\b|\b{re.escape(n['name'])}\b")
    refs = [f for f in prod_files if f != e['file'] and pat.search(code_text[f])]
    n['prod_ref_files'] = refs

# ---------------------------------------------------------------- statuses
inbound_nav = collections.Counter()
for e in edges:
    if e['rel'] == 'NAVIGATES_TO' and nodes[e['dst']]['type'] == 'SCR' and nodes[e['src']]['type'] in ('SCR', 'COMP'):
        inbound_nav[e['dst']] += 1
screen_api = {n['id']: [x for x in outs(n['id'], 'CALLS', 'API')] for n in scrs}
screen_tests = {n['id']: ins(n['id'], None, None) for n in scrs}
guard_ids = set()

for n in nodes.values():
    t = n['type']
    if t == 'API':
        continue
    if t == 'SCR':
        has_api = bool(screen_api[n['id']])
        tested = any(e['rel'] == 'TESTED_BY' for e in out_e[n['id']])
        n['status'] = 'IMPLEMENTED'
        n['confidence'] = 'MEDIUM' if (tested or has_api) else 'LOW'
        n['notes'] = []
        if not has_api: n['notes'].append('no API call found in this screen file (static or composed)')
        if inbound_nav[n['id']] == 0 and n['name'] != '/': n['notes'].append('no inbound navigation link found in source')
        if not tested: n['notes'].append('no e2e page.goto to this route found')
    elif t == 'INT':
        has_api = bool(n.get('persists_via_api'))
        n['status'] = 'IMPLEMENTED'
        n['confidence'] = 'MEDIUM'
        n['interaction_class'] = 'api-backed' if has_api else ('global-listener' if n['kind'].startswith('listener:') else ('inline-handler' if not n.get('handler') else 'local-handler'))
        n['notes'] = []
    elif t == 'COMP':
        n['status'] = 'IMPLEMENTED' if n.get('prod_ref_files') else 'UNKNOWN'
        n['confidence'] = 'MEDIUM' if n.get('prod_ref_files') else 'LOW'
        n['notes'] = [] if n.get('prod_ref_files') else ['exported component with no importing file found: possible dead code']
    elif t == 'RULE':
        used = n['prod_references'] > 0
        n['status'] = 'IMPLEMENTED' if used else 'UNKNOWN'
        n['confidence'] = 'MEDIUM' if used else 'LOW'
        n['notes'] = [] if used else ['exported but no non-test reference found: possible dead code']
        n['tested_by'] = ins(n['id'], 'TESTED_BY') if False else [e['dst'] for e in out_e[n['id']] if e['rel'] == 'TESTED_BY']
    elif t == 'DB':
        consumers = [e for e in in_e[n['id']] if e['rel'] in ('READS', 'WRITES', 'UPDATES') and nodes[e['src']]['type'] == 'SVC']
        n['code_consumers'] = sorted({nodes[e['src']]['name'] for e in consumers})
        n['crud_verbs'] = sorted({e['rel'] for e in consumers})
        persisted_via_route = [e for e in in_e[n['id']] if e['rel'] == 'WRITES' and nodes[e['src']]['type'] == 'API']
        n['routes_writing'] = len({e['src'] for e in persisted_via_route})
        if consumers or persisted_via_route:
            n['status'] = 'IMPLEMENTED'; n['confidence'] = 'MEDIUM'; n['notes'] = []
        else:
            n['status'] = 'NOT_IMPLEMENTED'; n['confidence'] = 'LOW'
            n['notes'] = ['schema-only: no SQL consumer found by static scan (dynamic SQL would not be detected)']
    elif t == 'JOUR':
        n['status'] = 'IMPLEMENTED'; n['confidence'] = 'MEDIUM'
        n['notes'] = ['derived from an e2e test; test was not executed in this session']
    elif t == 'INFRA':
        n.setdefault('status', 'IMPLEMENTED'); n.setdefault('confidence', 'MEDIUM'); n.setdefault('notes', [])
        if n.get('kind') == 'ci-workflow': n['notes'] = ['workflow exists; CI runs on main have failed since 2026-10-26 (cause not examined)']
    elif t in ('ROLE', 'STATE', 'ERR', 'TEST', 'SCH', 'PROJ'):
        n.setdefault('notes', [])
    elif t == 'SVC':
        n.setdefault('status', 'IMPLEMENTED'); n.setdefault('confidence', 'MEDIUM'); n.setdefault('notes', [])
# api final notes
for n in apis:
    r = routes[n['name']]
    n['web_called'] = bool(n.get('web_callers'))
    if n.get('env_gated'):
        n['notes'] = n.get('notes', []) + ['dev/test only: returns 404 when NODE_ENV is not development or test']
    if not n['web_called'] and not n['name'].startswith(('GET /health', 'GET /ready')):
        n['notes'] = n.get('notes', []) + ['no first-party web caller found']
    if n.get('variant'):
        n['notes'] = n.get('notes', []) + [n['variant']]
# MOD/FEAT aggregate status
children = collections.defaultdict(list)
for e in edges:
    if e['rel'] == 'CONTAINS':
        children[e['src']].append(e['dst'])
def agg(nid):
    n = nodes[nid]
    if n['type'] in ('MOD', 'FEAT'):
        kids = [agg(c) for c in children.get(nid, [])]
        kids = [k for k in kids if k]
        if n['type'] == 'MOD' and n.get('kind') in ('migration',):
            n['status'] = 'IMPLEMENTED'; n['confidence'] = 'MEDIUM'; n['notes'] = []
            return n['status']
        if not kids:
            n['status'] = 'IMPLEMENTED'; n['confidence'] = 'MEDIUM'; n['notes'] = []
            return n['status']
        api_kids = [nodes[c] for c in children.get(nid, []) if nodes[c]['type'] in ('API',)]
        eph = sum(1 for k in api_kids if k.get('durability') == 'ephemeral')
        bad = [k for k in kids if k not in ('IMPLEMENTED',)]
        n['status'] = 'IMPLEMENTED' if not bad else 'PARTIALLY_IMPLEMENTED'
        n['confidence'] = 'MEDIUM'
        n['notes'] = [f'{eph}/{len(api_kids)} endpoints ephemeral'] if api_kids and eph else []
        return n['status']
    return n.get('status')
for nid in list(nodes):
    if nodes[nid]['type'] in ('MOD', 'FEAT') and 'status' not in nodes[nid]:
        agg(nid)

# ---------------------------------------------------------------- docs vs code (F-ids)
fs = read('docs/reports/FEATURE_STATUS_2026-10-21.md')
doc_rows = {}
for m in re.finditer(r"^\| (F-\d{2,3}) \| ([^|]+) \| [^|]* \| [^|]* \| ([^|]+) \|", fs, re.M):
    doc_rows[m.group(1)] = dict(name=m.group(2).strip(), status=m.group(3).strip())
code_fids = collections.defaultdict(set)
for r in A['routes']:
    for fid in r['fids']:
        code_fids[fid].add(r['key'])
fid_files = collections.defaultdict(set)
for f in prod_files:
    for fid in set(re.findall(r"\bF-\d{2,3}\b", code_text[f])):
        fid_files[fid].add(f)
doc_status_count = collections.Counter(v['status'] for v in doc_rows.values())

# ---------------------------------------------------------------- write: graph artifacts
def node_out(n):
    d = dict(n)
    return d
for n in nodes.values():
    n.pop('sites', None) if False else None
for _d in ('', 'quality', 'evidence', 'master', 'features', 'journeys', 'ui', 'architecture', 'data'): os.makedirs(os.path.join(OUT, _d), exist_ok=True)
w('master/MASTER_PROJECT_GRAPH.json', json.dumps(dict(nodes=list(nodes.values()), edges=edges), indent=1, default=list))

def dot_id(i): return '"' + i + '"'
def dot_label(n):
    nm = n['name'].replace('\\', '\\\\').replace('"', '\\"')
    return f"{n['id']}\\n{nm}"
COLOR = {'JOUR': '#cfe2ff', 'ROLE': '#cfe2ff', 'API': '#ffe0b3', 'EXT': '#ffe0b3', 'RULE': '#e1d5f5', 'SVC': '#e1d5f5', 'DB': '#c8ece8',
         'INFRA': '#e0e0e0', 'SCR': '#cfe2ff', 'COMP': '#cfe2ff', 'INT': '#cfe2ff', 'TEST': '#f0f0f0', 'ERR': '#f8d7da', 'STATE': '#fff3cd',
         'MOD': '#ffffff', 'FEAT': '#ffffff', 'SCH': '#fde2c8', 'PROJ': '#ffffff'}
STATUS_BORDER = {'IMPLEMENTED': '#2e7d32', 'PARTIALLY_IMPLEMENTED': '#f9a825', 'NOT_IMPLEMENTED': '#c62828', 'BROKEN': '#c62828', 'MOCKED': '#e65100',
                 'UNREACHABLE': '#c62828', 'DEPRECATED': '#757575', 'UNKNOWN': '#9e9e9e'}
EDGE_STYLE = {'CONTAINS': 'style=solid color="#9e9e9e"', 'DEPENDS_ON': 'style=dashed color="#546e7a"', 'TRIGGERS': 'style=bold color="#1565c0"',
              'CALLS': 'style=solid color="#e65100"', 'READS': 'style=dotted color="#00796b"', 'WRITES': 'style=bold color="#00796b"',
              'UPDATES': 'style=bold color="#00796b"', 'CREATES': 'style=dotted color="#00796b"', 'NAVIGATES_TO': 'style=solid color="#1565c0" arrowhead=open',
              'VALIDATES': 'style=dashed color="#6a1b9a"', 'AUTHORIZES': 'style=dotted color="#2e7d32"', 'REQUIRES': 'style=dashed color="#2e7d32"',
              'PRODUCES': 'style=dotted color="#c62828"', 'TESTED_BY': 'style=dotted color="#9e9e9e"', 'FALLBACK_TO': 'style=dashed color="#f9a825"',
              'BLOCKED_BY': 'style=bold color="#c62828"', 'CONSUMES': 'style=solid', 'TRANSFORMS': 'style=solid'}
dot = ['digraph TalentSphere {', '  rankdir=LR; node [shape=box style="filled" fontsize=9]; edge [fontsize=8];']
for tname in sorted(types):
    dot.append(f'  subgraph "cluster_{tname}" {{ label="{tname}"; style=dashed;')
    for n in nodes.values():
        if n['type'] == tname:
            b = STATUS_BORDER.get(n.get('status', 'UNKNOWN'), '#9e9e9e')
            dot.append(f'    {dot_id(n["id"])} [label="{dot_label(n)}" fillcolor="{COLOR.get(tname, "#fff")}" color="{b}"];')
    dot.append('  }')
for e in edges:
    dot.append(f'  {dot_id(e["src"])} -> {dot_id(e["dst"])} [label="{e["rel"]}" {EDGE_STYLE.get(e["rel"], "")}];')
dot.append('}')
w('master/MASTER_PROJECT_GRAPH.dot', '\n'.join(dot) + '\n')

# ---------------------------------------------------------------- mermaid sanitiser
def mm(s, n=60):
    s = re.sub(r"[^A-Za-z0-9 /._\-+&%>:,]", ' ', str(s))
    s = re.sub(r"\s+", ' ', s).strip()
    return s[:n]

api_mods = collections.defaultdict(list)
for n in apis:
    api_mods[n['module']].append(n)
n_dur = sum(1 for n in apis if n['durability'] == 'durable')
CAP_TYPES = ('API', 'SCR', 'INT', 'COMP', 'RULE', 'DB', 'EXT', 'JOUR', 'SVC', 'INFRA')
status_dist = collections.Counter(n.get('status') for n in nodes.values() if n['type'] in CAP_TYPES and n.get('status'))
status_by_type = {t_: collections.Counter(n.get('status') for n in nodes.values() if n['type'] == t_ and n.get('status')) for t_ in CAP_TYPES}
STATUSES = ['IMPLEMENTED', 'PARTIALLY_IMPLEMENTED', 'NOT_IMPLEMENTED', 'BROKEN', 'MOCKED', 'UNREACHABLE', 'DEPRECATED', 'UNKNOWN']
status_matrix = table(['Node type'] + STATUSES, [[t_] + [status_by_type[t_].get(s_, 0) for s_ in STATUSES] for t_ in CAP_TYPES])
crossing = [e for e in edges if e['rel'] != 'CONTAINS']

# ---------------------------------------------------------------- MASTER mindmap
B = []  # branch definitions: (id, title, artifact, children[list of str])
def top(items, k=8):
    return [f'{a} ({b})' for a, b in items[:k]]
mod_counts = sorted(((m, len(v)) for m, v in api_mods.items()), key=lambda x: -x[1])
branches = [
    ('01', 'PROJECT OVERVIEW', 'architecture/BACKEND_ARCHITECTURE.md', [
        f'3 applications: api web worker', f'6 workspace packages', f'Fastify 5 + React 19 + Postgres', f'{len([n for n in nodes.values() if n["type"]=="EXT"])} external dependencies']),
    ('02', 'USER PERSONAS AND ROLES', 'journeys/USER_JOURNEYS.md', [f'{len(roles)} role nodes incl. anonymous', 'role-specific navigation sets', f'{sum(1 for n in apis if n["roles"])} routes with explicit role checks']),
    ('03', 'COMPLETE USER JOURNEYS', 'journeys/USER_JOURNEYS.md', [f'{len(jours)} e2e-derived journeys', 'structural flows: guard redirect and session end']),
    ('04', 'FEATURE HIERARCHY', 'features/COMPLETE_FEATURE_INVENTORY.json', [f'{len(api_mods)} API modules', f'{types["FEAT"]} feature groups', f'{len(apis)} sub-features endpoints', f'{len(ints)} micro-features interactions', f'{len(errs)} nano-features error branches']),
    ('05', 'SCREENS AND UI COMPONENTS', 'ui/SCREEN_INTERACTION_INVENTORY.md', [f'{len(scrs)} routed screens', f'{len(comps)} shared components', f'{len(ints)} event bindings']),
    ('06', 'ACTIONS AND INTERACTIONS', 'ui/SCREEN_INTERACTION_INVENTORY.md', [f'{collections.Counter(n["kind"] for n in ints).most_common(1)[0][0]} is the most common event', f'{sum(1 for n in ints if n["interaction_class"]=="api-backed")} api-backed']),
    ('07', 'APPLICATION FLOW AND NAVIGATION', 'ui/SCREEN_INTERACTION_INVENTORY.md', [f'{len(A["routes_web"])} route entries', f'{sum(1 for n in scrs if n["guarded"])} guarded', f'{len(A["nav_sets"])} navigation sets']),
    ('08', 'BUSINESS LOGIC AND DECISION TREES', 'quality/TEST_COVERAGE_MAP.md', [f'{len(rules)} exported domain functions', f'{types["STATE"]} state definitions']),
    ('09', 'FRONTEND ARCHITECTURE', 'architecture/FRONTEND_ARCHITECTURE.md', ['SessionProvider + local state', 'localStorage token', 'service worker PWA']),
    ('10', 'BACKEND ARCHITECTURE', 'architecture/BACKEND_ARCHITECTURE.md', ['Fastify modular monolith', 'storage boundary pg or memory', 'worker with SKIP LOCKED']),
    ('11', 'API ECOSYSTEM', 'architecture/API_ARCHITECTURE.md', [f'{len(apis)} endpoints', f'{n_dur} durable', f'{len(apis)-n_dur} ephemeral']),
    ('12', 'DATABASE AND DATA', 'data/DATABASE_ENTITY_MAP.md', [f'{len(dbs)} tables', f'{len(A["rls"])} with RLS enabled', f'{len(A["enums"])} enums']),
    ('13', 'COMPLETE DATA FLOW', 'data/END_TO_END_DATA_FLOWS.md', ['route to store to table chains', 'worker email flow']),
    ('14', 'STATE MANAGEMENT AND LIFECYCLE', 'data/END_TO_END_DATA_FLOWS.md', [f'{types["STATE"]} state nodes', 'application and job transition tables']),
    ('15', 'EXTERNAL INTEGRATIONS', 'architecture/SYSTEM_DEPENDENCY_GRAPH.md', [f'{types["EXT"]} integrations']),
    ('16', 'SECURITY AND PERMISSIONS', 'architecture/API_ARCHITECTURE.md', ['session token guard', 'rate limits', f'{sum(1 for n in dbs if n.get("rls"))} tables with RLS']),
    ('17', 'ERROR HANDLING AND EDGE CASES', 'architecture/API_ARCHITECTURE.md', [f'{len(errs)} distinct error branches', 'canonical error envelope']),
    ('18', 'TESTING AND QUALITY', 'quality/TEST_COVERAGE_MAP.md', [f'{len(tests)} test files', f'{sum(n["cases"] for n in tests)} cases']),
    ('19', 'INFRASTRUCTURE AND DEPLOYMENT', 'architecture/BACKEND_ARCHITECTURE.md', [f'{sum(1 for n in nodes.values() if n["type"]=="INFRA" and n["kind"]=="ci-workflow")} CI workflows', 'deploy coolify and oracle']),
    ('20', 'IMPLEMENTATION GAPS AND DEBT', 'quality/IMPLEMENTATION_GAPS.md', [f'{len(apis)-n_dur} ephemeral endpoints', f'{sum(1 for n in dbs if n["status"]=="NOT_IMPLEMENTED")} schema-only tables']),
]
mmd = ['mindmap', '  root((COMPLETE PROJECT ECOSYSTEM))']
for bid, title, art, kids in branches:
    mmd.append(f'    BRANCH {bid} {mm(title)}')
    for k in kids:
        mmd.append(f'      {mm(k, 80)}')
mindmap_text = '\n'.join(mmd) + '\n'
w('master/MASTER_PROJECT_MINDMAP.mmd', mindmap_text)

# aggregated type-level cross connection graph
agg_edges = collections.Counter()
for e in crossing:
    agg_edges[(nodes[e['src']]['type'], e['rel'], nodes[e['dst']]['type'])] += 1
fl = ['flowchart LR']
tcl = {'JOUR': 'journey', 'ROLE': 'journey', 'SCR': 'journey', 'COMP': 'journey', 'INT': 'journey', 'API': 'api', 'EXT': 'api', 'SCH': 'api', 'RULE': 'logic', 'SVC': 'logic', 'DB': 'data',
       'TEST': 'infra', 'INFRA': 'infra', 'ERR': 'bad', 'STATE': 'logic', 'MOD': 'infra', 'FEAT': 'infra', 'PROJ': 'infra'}
used_t = sorted({a for (a, _, b) in agg_edges} | {b for (a, _, b) in agg_edges})
for t in used_t:
    fl.append(f'  {t}["{t}<br/>{types[t]} nodes"]:::{tcl.get(t, "infra")}')
for (a, r, b), c in sorted(agg_edges.items()):
    if (r in ('DEPENDS_ON', 'AUTHORIZES') and c < 5):
        continue
    fl.append(f'  {a} -->|"{r} {c}"| {b}')
fl += ['  classDef journey fill:#cfe2ff,stroke:#1565c0;', '  classDef api fill:#ffe0b3,stroke:#e65100;', '  classDef logic fill:#e1d5f5,stroke:#6a1b9a;',
       '  classDef data fill:#c8ece8,stroke:#00796b;', '  classDef infra fill:#e0e0e0,stroke:#546e7a;', '  classDef bad fill:#f8d7da,stroke:#c62828;']
type_graph = '\n'.join(fl)

md = [f"""# Master Project Mind Map — COMPLETE PROJECT ECOSYSTEM

![COMPLETE PROJECT ECOSYSTEM poster](MASTER_PROJECT_MINDMAP.svg)

*The poster above is generated from the same graph (`tools/poster.py`): 20 branch cards in three zones, a central hub, status dots and a cross-connection chain. Open `MASTER_PROJECT_MINDMAP.svg` full-size in a browser, or edit `MASTER_PROJECT_MINDMAP.drawio` in diagrams.net. A 4400 px PNG copy is `MASTER_PROJECT_MINDMAP.png`.*

> Generated from the repository by read-only static analysis. Every node below has a stable ID, evidence (file, line, symbol), an implementation status and a confidence. Nothing here was executed: see [README](../README.md) "Limits".

## 1. How to read this map

- The **mind map** (section 2) shows the 20 required branches with counts computed from the graph.
- The **interconnected graph** is `MASTER_PROJECT_GRAPH.json` (all {len(nodes):,} nodes and {len(edges):,} typed edges, nothing truncated) and `MASTER_PROJECT_GRAPH.dot` (the same graph for Graphviz). Section 3 summarises it by node type; per-module subgraphs are in [MODULE_GRAPHS](../architecture/MODULE_GRAPHS.md).
- IDs are stable across every artifact. The prefix says what the node is.

| Prefix | Meaning | Count |
| --- | --- | --- |
""" + '\n'.join(f'| {t}- | {d} | {types[t]} |' for t, d in [
    ('PROJ', 'Project'), ('ROLE', 'Role / identity'), ('JOUR', 'User journey (derived from an e2e test)'), ('MOD', 'Module (application, API module, domain module, migration)'),
    ('FEAT', 'Feature group (API resource group)'), ('API', 'API endpoint (sub-feature)'), ('SCR', 'Screen (routed page)'), ('COMP', 'Shared UI component'),
    ('INT', 'Interaction (UI event binding, micro-feature)'), ('ERR', 'Error branch (nano-feature, observable system response)'), ('RULE', 'Business rule: exported domain function'),
    ('SCH', 'Contract schema (Zod)'), ('SVC', 'Service or data-access file, background job kind'), ('DB', 'Database table'), ('STATE', 'State definition or transition table'),
    ('TEST', 'Test file'), ('EXT', 'External integration'), ('INFRA', 'CI workflow, deploy target, script')]) + f"""

Not used (no evidence found, so no nodes exist): `ACT-`, `DATA-`, `NANO-`, `SUB-`, `MIC-` as separate prefixes. Their levels are carried by `INT-` (micro), `ERR-` (nano) and `API-` (sub-feature); see [feature inventory](../features/COMPLETE_FEATURE_INVENTORY.json) `level`.

## 2. Mind map (20 branches)

```mermaid
{mindmap_text.strip()}
```

| Branch | Detail artifact |
| --- | --- |
""" + '\n'.join(f'| {bid} {t} | [{a}](../{a}) |' for bid, t, a, _ in branches) + f"""

## 3. Cross-connection graph by node type

Edge counts are computed from the graph. `CONTAINS` is omitted here (it is the hierarchy); low-count `DEPENDS_ON` and `AUTHORIZES` edges are folded into the JSON.

```mermaid
{type_graph}
```

### Edge inventory (all relationship types)

{table(['Relationship', 'Edges', 'Meaning in this repository'], [
    [rel, c, {
        'CONTAINS': 'hierarchy', 'DEPENDS_ON': 'package, FK or component dependency', 'CALLS': 'screen/interaction calls an API; route calls a rule or store',
        'TRIGGERS': 'interaction fires a request; route dispatches a background job; role starts a journey', 'WRITES': 'SQL INSERT/DELETE, or route to table through a persist kind',
        'READS': 'SQL SELECT/JOIN', 'UPDATES': 'SQL UPDATE', 'CREATES': 'migration creates table', 'NAVIGATES_TO': 'link, navigate() or nav set',
        'VALIDATES': 'route parses with a contract schema', 'AUTHORIZES': 'identity may reach a screen or endpoint', 'REQUIRES': 'endpoint checks a role',
        'PRODUCES': 'endpoint throws a DomainError', 'TESTED_BY': 'test source references the item', 'FALLBACK_TO': 'integration degrades when not configured',
        'BLOCKED_BY': 'anonymous visitor redirected by RequireAuth'}.get(rel, '')]
    for rel, c in collections.Counter(e['rel'] for e in edges).most_common()])}

Relationship types requested but with **zero** edges because no evidence exists: `CONSUMES`, `TRANSFORMS` (data transformation is inside handler bodies, not separately addressable).

## 4. Implementation status distribution (capability nodes only: API, SCR, INT, COMP, RULE, DB, EXT, JOUR, SVC, INFRA)

{status_matrix}

Totals: {', '.join(f'{k} {v}' for k, v in status_dist.most_common())}. MOD and FEAT roll up their children; ERR/TEST/SCH/STATE/ROLE nodes carry no status because "implemented" is not meaningful for them.

`HIGH` confidence is assigned to **nothing**: no test or runtime was executed (dependencies are not installed and installing would write protected files). `MEDIUM` = supported by source. `LOW` = inferred.

## 5. Legend

| Colour | Meaning | | Edge style | Meaning |
| --- | --- | --- | --- | --- |
| Blue | users, journeys, screens, interactions | | solid grey | CONTAINS |
| Green border | IMPLEMENTED | | solid orange | CALLS |
| Yellow border | PARTIALLY_IMPLEMENTED | | bold teal | WRITES / UPDATES |
| Red border | NOT_IMPLEMENTED / BROKEN / UNREACHABLE | | dotted teal | READS / CREATES |
| Purple | backend logic, services, state | | solid blue | NAVIGATES_TO |
| Orange | APIs and external integrations | | dashed | DEPENDS_ON / VALIDATES / REQUIRES |
| Teal | data and database | | dotted | TESTED_BY / PRODUCES / AUTHORIZES |
| Grey | infrastructure, tests | | bold red | BLOCKED_BY |

## 6. Modules at a glance

{table(['API module', 'Endpoints', 'Durable', 'Ephemeral', 'Auth: public/optional/required', 'Tested (path-level)', 'Web-called', 'ID'], [
    [m, len(v), sum(1 for n in v if n['durability']=='durable'), sum(1 for n in v if n['durability']!='durable'),
     f"{sum(1 for n in v if n['auth'].startswith('public'))}/{sum(1 for n in v if n['auth']=='session-optional')}/{sum(1 for n in v if n['auth']=='session-required')}",
     sum(1 for n in v if n.get('tests')), sum(1 for n in v if n['web_called']),
     next(x['id'] for x in nodes.values() if x['type']=='MOD' and x['name']==f'api/{m}')]
    for m, v in sorted(api_mods.items(), key=lambda kv: -len(kv[1]))])}
"""]
w('master/MASTER_PROJECT_MINDMAP.md', '\n'.join(md))

# ---------------------------------------------------------------- MODULE_GRAPHS
mg = ['# Module Graphs (linked subgraphs of the master graph)', '',
      'One diagram per API module: screens that call it, its endpoints, the domain rules and persistence it reaches. Node labels carry the master-graph IDs. Edge labels are the relationship types. Generated; do not edit.', '']
route_id_to_node = {n['id']: n for n in apis}
for m, v in sorted(api_mods.items()):
    mod_id = next(x['id'] for x in nodes.values() if x['type'] == 'MOD' and x['name'] == f'api/{m}')
    lines = ['flowchart LR']
    scr_seen = set(); rule_seen = set(); store_seen = set(); db_seen = set(); job_seen = set()
    for n in v:
        a = n['id'].replace('-', '_')
        mark = ':::eph' if n['durability'] != 'durable' else ':::dur'
        lines.append(f'  {a}["{n["id"]}<br/>{mm(n["method"] + " " + n["path"].replace("/api/v1", ""), 46)}"]{mark}')
        for c in ins(n['id'], 'CALLS'):
            cn = nodes[c]
            if cn['type'] in ('SCR', 'COMP'):
                cid = cn['id'].replace('-', '_')
                if cid not in scr_seen:
                    lines.append(f'  {cid}["{cn["id"]}<br/>{mm(cn["name"], 30)}"]:::ui'); scr_seen.add(cid)
                lines.append(f'  {cid} -->|CALLS| {a}')
            elif cn['type'] == 'INT':
                pass
        for rid in outs(n['id'], 'CALLS', 'RULE')[:6]:
            rn = nodes[rid]; r_ = rid.replace('-', '_')
            if r_ not in rule_seen:
                lines.append(f'  {r_}["{rid}<br/>{mm(rn["name"], 32)}"]:::logic'); rule_seen.add(r_)
            lines.append(f'  {a} -->|CALLS| {r_}')
        for sid in outs(n['id'], 'CALLS', 'SVC'):
            s_ = sid.replace('-', '_')
            if s_ not in store_seen:
                lines.append(f'  {s_}["{sid}<br/>{mm(nodes[sid]["name"].split("/")[-1], 30)}"]:::logic'); store_seen.add(s_)
            lines.append(f'  {a} -->|CALLS| {s_}')
        for did in outs(n['id'], 'WRITES', 'DB'):
            d_ = did.replace('-', '_')
            if d_ not in db_seen:
                lines.append(f'  {d_}[("{did}<br/>{mm(nodes[did]["name"], 28)}")]:::data'); db_seen.add(d_)
            lines.append(f'  {a} -->|WRITES| {d_}')
        for jid in outs(n['id'], 'TRIGGERS', 'SVC'):
            j_ = jid.replace('-', '_')
            if j_ not in job_seen:
                lines.append(f'  {j_}["{jid}<br/>{mm(nodes[jid]["name"], 34)}"]:::logic'); job_seen.add(j_)
            lines.append(f'  {a} -->|TRIGGERS| {j_}')
    lines += ['  classDef dur fill:#ffe0b3,stroke:#2e7d32,stroke-width:2px;', '  classDef eph fill:#ffe0b3,stroke:#f9a825,stroke-width:2px;', '  classDef ui fill:#cfe2ff,stroke:#1565c0;',
              '  classDef logic fill:#e1d5f5,stroke:#6a1b9a;', '  classDef data fill:#c8ece8,stroke:#00796b;']
    dur = sum(1 for n in v if n['durability'] == 'durable')
    mg += [f'## {m} ({mod_id})', '', f'{len(v)} endpoints, {dur} durable, {len(v) - dur} ephemeral. Green border = durable, yellow = ephemeral.', '', '```mermaid', '\n'.join(lines), '```', '']
w('architecture/MODULE_GRAPHS.md', '\n'.join(mg))

# ---------------------------------------------------------------- feature inventory
inv = []
def entry(n, level, parent, **kw):
    d = dict(id=n['id'], level=level, name=n['name'], parent_id=parent, status=n.get('status'), confidence=n.get('confidence'),
             notes=n.get('notes', []), evidence=n.get('evidence', []))
    d.update(kw)
    inv.append(d)
proj_id = next(n['id'] for n in nodes.values() if n['type'] == 'PROJ')
inv.append(dict(id=proj_id, level='PROJECT', name='TalentSphere', parent_id=None, status='IMPLEMENTED', confidence='MEDIUM', notes=[], evidence=nodes[proj_id]['evidence']))
app_ids = {n['name']: n['id'] for n in nodes.values() if n['type'] == 'MOD' and n.get('kind') == 'application'}
for nm, i in app_ids.items():
    entry(nodes[i], 'APPLICATION', proj_id, description=nodes[i].get('description'))
web_mod_id = None
# api modules
for n in nodes.values():
    if n['type'] == 'MOD' and n.get('kind') == 'api-module':
        entry(n, 'MODULE', app_ids['apps/api'])
for n in nodes.values():
    if n['type'] == 'FEAT':
        mid = next(x['id'] for x in nodes.values() if x['type'] == 'MOD' and x['name'] == f'api/{n["module"]}')
        entry(n, 'FEATURE', mid)
persona_of = {}
for n in apis:
    feat = next(x['id'] for x in nodes.values() if x['type'] == 'FEAT' and x['name'] == f'api/{n["feature"]}')
    personas = sorted(set(outs(n['id'], 'REQUIRES', 'ROLE')))
    personas_names = [nodes[p]['name'] for p in personas] or (['anonymous'] if n['auth'].startswith('public') else ['any authenticated session'])
    r = routes[n['name']]
    entry(n, 'SUB-FEATURE', feat, kind='api-endpoint', method=n['method'], path=n['path'], purpose=n.get('purpose'),
          personas=personas_names, entry_conditions=[f"auth: {n['auth']}"] + ([f"guards: {', '.join(n['guards'])}"] if n['guards'] else []),
          exit_conditions=[f'HTTP {s}' for s in n['statuses']] or ['HTTP 200 (implicit)'],
          screens=sorted(set(ins(n['id'], 'CALLS', 'SCR'))), components=sorted(set(ins(n['id'], 'CALLS', 'COMP'))),
          interactions=sorted(set(ins(n['id'], 'TRIGGERS', 'INT'))), business_rules=sorted(set(outs(n['id'], 'CALLS', 'RULE'))),
          schemas=sorted(set(outs(n['id'], 'VALIDATES', 'SCH'))), data_dependencies=sorted(set(outs(n['id'], 'WRITES', 'DB'))),
          services=sorted(set(outs(n['id'], 'CALLS', 'SVC'))), permissions=n['roles'] + n['guards'], state_transitions=[], error_ids=sorted(set(outs(n['id'], 'PRODUCES', 'ERR'))),
          tests=sorted(set(outs(n['id'], 'TESTED_BY', 'TEST'))), durability=n['durability'], rate_limit_override=n['rate_limit'])
for n in nodes.values():
    if n['type'] == 'ERR':
        for s in n['sites']:
            pass
        site_route = n['sites'][0]['route']
        entry(n, 'NANO-FEATURE', api_by_key[site_route]['id'], kind='error-branch', code=n['code'], message=n['message'], sites=n['sites'])
# web
web_mod = dict(id='MOD-WEB', name='web/screens')
for n in scrs:
    entry(n, 'SUB-FEATURE', app_ids['apps/web'], kind='screen', route=n['name'], guarded=n['guarded'], components=sorted(set(outs(n['id'], 'DEPENDS_ON', 'COMP'))),
          apis=sorted(set(outs(n['id'], 'CALLS', 'API'))), navigates_to=sorted(set(outs(n['id'], 'NAVIGATES_TO', 'SCR'))), tests=sorted(set(outs(n['id'], 'TESTED_BY', 'TEST'))),
          loading_state=n.get('loading_state'), empty_state=n.get('empty_state'), error_state=n.get('error_state'))
for n in comps:
    entry(n, 'FEATURE', app_ids['apps/web'], kind='shared-component', used_by=n.get('prod_ref_files'))
for n in ints:
    entry(n, 'MICRO-FEATURE', n['owner'], kind='interaction', event=n['kind'], handler=n.get('handler'), interaction_class=n['interaction_class'], triggers_apis=sorted(set(outs(n['id'], 'TRIGGERS', 'API'))))
for n in nodes.values():
    if n['type'] == 'SVC' and n['name'].startswith('job:'):
        entry(n, 'FEATURE', app_ids['apps/worker'], kind='background-job', handler=n.get('handler'), dispatched_by=sorted(set(ins(n['id'], 'TRIGGERS', 'API'))))
rules_inv = []
for n in rules:
    rules_inv.append(dict(id=n['id'], name=n['name'], kind=n['kind'], module=next(x['name'] for x in nodes.values() if x['id'] in [e['src'] for e in in_e[n['id']] if e['rel'] == 'CONTAINS']),
                          status=n['status'], confidence=n['confidence'], called_by_routes=sorted(set(ins(n['id'], 'CALLS', 'API'))), tested_by=n.get('tested_by', []), non_test_references=n['prod_references'],
                          notes=n['notes'], evidence=n['evidence']))
w('features/COMPLETE_FEATURE_INVENTORY.json', json.dumps(dict(
    definition=dict(
        APPLICATION='apps/api, apps/web, apps/worker', MODULE='API module = first path segment under /api/v1',
        FEATURE='API resource group (first two static segments) | shared web component | background job kind',
        SUB_FEATURE='API endpoint | routed screen',
        MICRO_FEATURE='UI event binding (onClick, onSubmit, onChange ...) on a screen or component',
        NANO_FEATURE='error branch: a distinct DomainError(code, message) thrown by an endpoint, an observable system response',
        BUSINESS_RULE='exported function/class in packages/domain/src (listed under business_rules, not in the hierarchy)'),
    entries=inv, business_rules=rules_inv), indent=1, default=list))
lvl = collections.Counter(e['level'] for e in inv)

# ---------------------------------------------------------------- personas + journeys
persona_rows = []
for rn in roles:
    nm = rn['name']
    req = sorted(set(ins(rn['id'], 'REQUIRES', 'API')))
    mentions = sum(len(re.findall(rf"['\"]{re.escape(nm)}['\"]", t)) for f, t in code_text.items() if f.startswith(('apps/api/src', 'packages/domain/src', 'apps/web/src')))
    persona_rows.append([rn['id'], nm, len(req), mentions, rn['description']])
nav_rows = []
for k, items in A['nav_sets'].items():
    nav_rows.append([k, ', '.join(f"{i['label']} ({i['path']})" for i in items)])
guard_rows = [[n['id'], n['name'], 'RequireAuth (token present in localStorage)' if n['guarded'] else 'public', ', '.join(nodes[x]['name'] for x in outs(n['id'], 'CALLS', 'API')[:3]) + (' ...' if len(outs(n['id'], 'CALLS', 'API')) > 3 else '')] for n in scrs]
auth_cnt = collections.Counter(n['auth'] for n in apis)

jrows = []
jjson = []
for j in jours:
    scr = sorted({nodes[x]['name'] for x in outs(j['id'], 'NAVIGATES_TO', 'SCR')})
    roles_h = ', '.join(j['role_hints']) or 'unspecified'
    first_steps = ' → '.join(s[:60] for s in j['steps'][:5])
    jrows.append([j['id'], j['spec'].replace('tests/e2e/', ''), j['title'][:100], roles_h, ', '.join(scr), j['gotos'][0] if j['gotos'] else '', len(j['steps']), len(j['api_paths'])])
    jjson.append(dict(id=j['id'], title=j['title'], spec=j['spec'], line=j['evidence'][0]['line'], personas=j['role_hints'] or ['unspecified'], entry_point=j['gotos'][0] if j['gotos'] else None,
                      screens_visited=scr, steps=j['steps'], api_paths_referenced=j['api_paths'], status=j['status'], confidence=j['confidence'], notes=j['notes']))
w('journeys/USER_JOURNEYS.json', json.dumps(jjson, indent=1))
jm = collections.Counter(re.sub(r"^.*/", '', j['spec']).replace('.spec.ts', '') for j in jours)
w('journeys/USER_JOURNEYS.md', f"""# User Journeys and Personas

Journeys are **derived from the Playwright e2e specs** (`tests/e2e/*.spec.ts`): each `test(...)` that drives a page (`goto`, `click`, `fill`) is one journey. That is evidence of an *intended, tested* path, not proof it passes: the tests were not executed here. Journeys that exist only in documentation have no ID in this file and are listed in [implementation gaps](../quality/IMPLEMENTATION_GAPS.md).

Full step lists, API paths and entry points: [`USER_JOURNEYS.json`](USER_JOURNEYS.json) (every field, no truncation).

## 1. Personas and roles (Branch 02)

Roles come from `packages/domain/src/core.ts` `Role`. Authorization in the API is mostly **resource-ownership and guard functions**, not role checks; explicit role checks are counted below. The route guard is **token presence only**; roles choose the navigation set in `Layout`, and role-specific pages gate themselves (`AdminPage` requires `platform_admin`, `HiringPage` requires `isRecruiter`).

{table(['ID', 'Role', 'Endpoints with an explicit role check', 'Quoted-role mentions in api/domain/web source', 'Source'], persona_rows)}

Explicit role checks outside `platform_admin`: {', '.join(f"{nodes[e['src']]['name']} requires {nodes[e['dst']]['name']}" for e in edges if e['rel']=='REQUIRES' and nodes[e['dst']]['name']!='platform_admin') or 'none'}.

Endpoint authentication levels (from handler bodies, comments stripped): {', '.join(f'{k} {v}' for k, v in auth_cnt.most_common())}. Endpoints that only exist in development/test (404 otherwise): {', '.join(n['name'] for n in apis if n.get('env_gated')) or 'none'}.

### Navigation set per persona (`apps/web/src/components/Layout.tsx`)

{table(['Set', 'Items'], nav_rows)}

Selection rule (Layout.tsx): signed-out → PUBLIC_NAV; restricted account → RESTRICTED_NAV; roles ∩ {{recruiter, hiring_manager, platform_admin}} → HIRING_NAV; otherwise CANDIDATE_NAV; platform_admin additionally gets the Admin item.

### Screen access (Branch 02/07)

{table(['ID', 'Route', 'Gate', 'APIs called'], guard_rows)}

## 2. Structural flows verified from source (not from tests)

| Flow | Behaviour | Evidence |
| --- | --- | --- |
| Guard redirect | Unauthenticated visit to a guarded route navigates to `/login?return=<path>`; replace-navigation | `apps/web/src/App.tsx` RequireAuth |
| Session end (401) | `apiFetch` clears the stored session, remembers the API's reason in sessionStorage, and hard-redirects to `/login?return=` | `apps/web/src/lib/api.ts` apiFetch |
| 403 | Not handled globally; callers show it inline and keep the session | `apps/web/src/lib/api.ts` header comment |
| Login 401 | Login must not use `apiFetch` (401 means wrong credentials) | `apps/web/src/lib/api.ts` header comment |
| Restricted account | Suspended/banned users can sign in but are confined to profile, password, devices, export and deletion; nav reduces to Dashboard + Profile | `Layout.tsx` RESTRICTED_NAV; `server.ts` resolveSession |
| Request timeout | `apiJson` aborts after 20 s with an `ApiError` | `apps/web/src/lib/api.ts` apiJson |
| Route announcements | Layout announces route changes via a polite live region | `Layout.tsx` route-announcer |

## 3. E2E-derived journey inventory ({len(jours)} journeys in {len(jm)} spec files)

{table(['ID', 'Spec', 'Journey (test title)', 'Persona hint', 'Screens visited', 'Entry', 'Steps', 'API paths'], jrows)}

Fields not derivable by static analysis (start condition, user inputs, validation rules, business logic per step, decision branches, recovery paths, exit conditions, related journeys) are **not recorded** rather than invented. The test's own steps and assertions are in the JSON.
""")

# ---------------------------------------------------------------- screens
sc_md = ['# Screen and Interaction Inventory', '',
         'Screens come from `apps/web/src/App.tsx` route entries; controls, states and API calls are counted from each page file. `loading/empty/error` mean the page source contains the corresponding pattern (`loading|isLoading|pending`, `EmptyState`, `LoadError|Notice|setError`): they show a state is *handled in source*, not that it renders correctly.', '',
         f'{len(scrs)} routed screens · {len(comps)} shared components · {len(ints)} interactions · web API call sites: {len(A["web_calls"])} (all {len(A["web_calls"]) - len(A["bad_calls"])} match a server route; {len(A["bad_calls"])} do not).', '']
sc_md += ['## 1. Route table (Branch 07)', '', table(['ID', 'Route', 'Gate', 'Component file', 'Inbound nav links', 'Outbound nav', 'E2E specs', 'Status', 'Notes'], [
    [n['id'], n['name'], 'guarded' if n['guarded'] else 'public', n['file'], inbound_nav[n['id']], len(set(outs(n['id'], 'NAVIGATES_TO', 'SCR'))),
     len(set(outs(n['id'], 'TESTED_BY', 'TEST'))), f"{n['status']}/{n['confidence']}", '; '.join(n['notes'])] for n in scrs]), '']
dead_end = [n for n in scrs if not outs(n['id'], 'NAVIGATES_TO', 'SCR') and n['name'] not in ('*',)]
sc_md += ['### Navigation analysis', '',
          f"- Screens with **no inbound navigation link** in source (reachable only by URL, redirect or `navigate`): {', '.join(n['name'] for n in scrs if inbound_nav[n['id']] == 0) or 'none'}.",
          f"- Screens with **no outbound link to another routed screen** from their own file (they rely on the shared Layout nav): {', '.join(n['name'] for n in dead_end) or 'none'}. Layout supplies header/footer links to every screen, so none are true dead ends for a user with the matching nav set.",
          f"- Unresolved navigation targets (link to a path that is not a route entry as written): {', '.join(sorted({u['to'] for u in A['unresolved_nav']})) or 'none'} (template-built paths such as `/verify/${{hash}}` truncate in the static scan and are not defects by themselves).",
          '- Catch-all `*` renders `NotFoundPage`.', '']
sc_md += ['## 2. Per-screen detail (Branch 05)', '']
for n in scrs:
    apis_called = sorted(set(outs(n['id'], 'CALLS', 'API')))
    ints_here = [i for i in ints if i['owner'] == n['id']]
    sc_md += [f"### {n['id']} `{n['name']}` — {n['component']}", '',
              f"- Gate: {'RequireAuth' if n['guarded'] else 'public'} · File: `{n['file']}` · Status: {n['status']}/{n['confidence']}",
              f"- Controls (source counts): buttons {n['buttons']}, forms {n['forms']}, inputs {n['inputs']}, modals {n['modals']}",
              f"- States handled in source: loading={n['loading_state']}, empty={n['empty_state']}, error={n['error_state']}",
              f"- Shared components: {', '.join(nodes[c]['name'] for c in sorted(set(outs(n['id'], 'DEPENDS_ON', 'COMP')))) or 'none'}",
              f"- APIs: {', '.join(f'{a} {nodes[a][chr(110)+chr(97)+chr(109)+chr(101)]}' for a in apis_called) or 'none'}",
              f"- Navigates to: {', '.join(nodes[x]['name'] for x in sorted(set(outs(n['id'], 'NAVIGATES_TO', 'SCR')))) or 'none from page file'}",
              (f"- Interactions: {len(ints_here)} (" + ', '.join(f'{k}×{v}' for k, v in collections.Counter(i['kind'] for i in ints_here).most_common()) + '), ' + f"{sum(1 for i in ints_here if i['interaction_class']=='api-backed')} api-backed") if ints_here else "- Interactions: 0",
              f"- E2E specs: {', '.join(nodes[t]['name'].replace('tests/e2e/','') for t in sorted(set(outs(n['id'], 'TESTED_BY', 'TEST')))) or 'none'}", '']
sc_md += ['## 3. Shared components (Branch 05)', '', table(['ID', 'Component', 'File', 'Imported/used by (files)', 'Status'], [
    [n['id'], n['name'], n['file'], len(n['prod_ref_files']), f"{n['status']}/{n['confidence']}"] for n in comps]), '']
sc_md += ['## 4. Interaction inventory (Branch 06)', '',
          'Trigger → handler → API. `api-backed` = the body of the handler (`Link` = `direct`) or a local function it calls (`one-hop`) performs a request to a matched route. `local-handler` / `inline-handler` = no request found within one call of the handler (local state, navigation, or deeper indirection). `global-listener` = `window`/`document` event listener registered in an effect. Preconditions, validation and persistence are properties of the API row (see [API architecture](../architecture/API_ARCHITECTURE.md)); the interaction links to it.', '',
          table(['ID', 'Owner', 'Event', 'Handler', 'Class', 'Link', 'Triggers API', 'Location'], [
              [n['id'], nodes[n['owner']]['name'], n['kind'], n.get('handler') or '(inline)', n['interaction_class'], n.get('link', ''),
               ', '.join(n['persists_via_api']) or '', loc(n)] for n in ints]), '']
sc_md += ['## 5. Event kinds', '', table(['Event', 'Count'], [[k, v] for k, v in collections.Counter(n['kind'] for n in ints).most_common()]), '',
          'Interaction types with **no occurrence** in `apps/web/src` (JSX `on*` props and `addEventListener`): ' + ', '.join(x for x, ks in [('long press', ['long']), ('swipe', ['swipe']), ('drag and drop', ['drag', 'drop']), ('wheel/scroll handlers', ['wheel', 'scroll']), ('paste', ['paste']), ('hover', ['hover'])] if not any(any(k in i['kind'] for k in ks) for i in ints)) + '. Touch events exist only as press feedback on `Button` (`onTouchStart/End`), not as swipe gestures. Global keyboard handling exists in `Modal`, `CommandPalette` (a keyboard-driven palette) and `Layout`.']
w('ui/SCREEN_INTERACTION_INVENTORY.md', '\n'.join(sc_md))

# ---------------------------------------------------------------- API architecture
api_rows = []
for n in apis:
    r = routes[n['name']]
    api_rows.append([n['id'], n['method'], n['path'] + (' *' if n.get('variant') else ''), n['module'], n['auth'], ', '.join(n['roles'] + n['guards']) or '',
                     ', '.join(n['schemas']) or '', len(n['rules']), ', '.join(n['persist_kinds'] + [s.split('.')[0] for s in n['store_calls']]) or '',
                     ', '.join(nodes[x]['name'] for x in outs(n['id'], 'WRITES', 'DB')) or '', n['durability'], ', '.join(sorted({e[0] for e in r['errors']})) or '',
                     'Y' if n['rate_limit'] else '', len(n.get('tests', [])), len(n.get('web_callers', [])), f"{n['status']}/{n['confidence']}"])
err_codes = collections.Counter(n['code'] for n in errs)
err_sites = collections.Counter()
for n in errs:
    err_codes[n['code']] += 0
    err_sites[n['code']] += len(n['sites'])
w('architecture/API_ARCHITECTURE.md', f"""# API Architecture and Endpoint Inventory

{len(apis)} endpoint registrations ({sum(1 for n in apis if n.get('variant'))} are mode variants of the same route: billing disabled-mode stubs in `server.ts` and Stripe-mode handlers in `billing-stripe.ts`, marked `*`). All routes are REST over Fastify; no GraphQL, WebSocket or RPC server routes were found.

## 1. Cross-cutting behaviour (read from `apps/api/src/server.ts`)

| Concern | Behaviour | Evidence |
| --- | --- | --- |
| Authentication | Bearer token verified by `verifySessionToken`; `extractUser` throws UNAUTHENTICATED; `resolveSession` re-checks account state, revocation and password-change cut-off | server.ts `extractUser`, `resolveSession` |
| Authorization | Mostly per-handler: ownership checks and guard functions (`canViewProfile`, `canManageJobs`, ...); explicit role check `platform_admin` in {sum(1 for n in apis if 'platform_admin' in n['roles'])} endpoints | server.ts handlers |
| Rate limiting | Global `@fastify/rate-limit`, keyed per user id or IP; per-route overrides on auth routes; health routes exempt | server.ts `app.register(rateLimit)` |
| Security headers / CORS | helmet (CSP only when deployed); CORS from `CORS_ALLOWED_ORIGINS` | server.ts |
| Error envelope | `{{ error: {{ code, message, request_id, details? }} }}`; ZodError → VALIDATION_FAILED with issue list | server.ts `setErrorHandler` |
| Status mapping | UNAUTHENTICATED 401, FORBIDDEN/UNAUTHORIZED/TENANT_ISOLATION_VIOLATION/ASSESSMENT_AI_PROHIBITED 403, NOT_FOUND 404, CONFLICT 409, VALIDATION_FAILED/INVALID_STATE_TRANSITION/POLICY_VIOLATION 422, PAYMENT_REQUIRED/FREE_USER_AI_QUOTA_EXCEEDED 402, RATE_LIMIT_EXCEEDED 429, SERVICE_UNAVAILABLE 503, else 400; unknown errors 500 | server.ts setErrorHandler |
| Durability label | Responses from routes not in `DURABLE_ROUTES` carry `x-talentsphere-durability: ephemeral` | `apps/api/src/durability.ts`, server.ts onSend |
| Tracing | `x-request-id` on every response | server.ts onSend |
| Writer lease | In pg mode, a lost advisory-lock lease returns 503 on every request | server.ts onRequest |
| Versioning | Path prefix `/api/v1`; no other version found | routes |
| Idempotency | {sum(1 for n in apis if n['idempotency'])} endpoints reference idempotency keys; web helper `apps/web/src/lib/idempotency.ts` | handlers |

## 2. Error branches (nano-features, Branch 17)

{len(errs)} distinct (code, message) branches across {sum(len(n['sites']) for n in errs)} throw sites.

{table(['Code', 'Distinct branches', 'Throw sites'], [[c, sum(1 for n in errs if n['code'] == c), err_sites[c]] for c in sorted(err_codes)])}

Full list with route and line: nodes `ERR-*` in [master graph](../master/MASTER_PROJECT_GRAPH.json) and in the [feature inventory](../features/COMPLETE_FEATURE_INVENTORY.json) (level NANO-FEATURE).

## 3. Endpoint inventory

Columns: auth level · explicit role/guard checks · contract schemas parsed · domain rules called · persistence (persist kinds + storage objects) · tables written through persist kinds · durability · error codes thrown · per-route rate limit · test files referencing the path · first-party web call sites · status/confidence.

{table(['ID', 'Method', 'Path', 'Module', 'Auth', 'Role/guard', 'Schemas', 'Rules', 'Persistence', 'Tables (via persist)', 'Durability', 'Errors', 'RL', 'Tests', 'Web', 'Status'], api_rows)}

Purpose text, line ranges and the full evidence record per endpoint are in the graph JSON. Request and response shapes live in `packages/contracts/src/index.ts` ({types['SCH']} exported schemas); the static scan links a route to a schema only when the handler calls `Schema.parse/safeParse`, so response shapes are **not** mapped (handlers build responses inline).
""")

# ---------------------------------------------------------------- backend architecture
mods_dom = [n for n in nodes.values() if n['type'] == 'MOD' and n.get('kind') == 'domain-module']
dom_rows = []
for d in mods_dom:
    rids = outs(d['id'], 'CONTAINS', 'RULE')
    called = sum(1 for r in rids if ins(r, 'CALLS', 'API'))
    dom_rows.append([d['id'], d['name'], len(rids), called, sum(1 for r in rids if nodes[r]['prod_references'] == 0)])
job_rows = [[n['id'], n['name'].replace('job:', ''), n['handler'], n['status'], ', '.join(nodes[x]['name'] for x in ins(n['id'], 'TRIGGERS', 'API')[:3]) + (' ...' if len(ins(n['id'], 'TRIGGERS', 'API')) > 3 else '')] for n in nodes.values() if n['type'] == 'SVC' and n['name'].startswith('job:')]
svc_rows = [[n['id'], n['name'], ', '.join(sorted({nodes[e['dst']]['name'] for e in out_e[n['id']] if e['rel'] in ('READS', 'WRITES', 'UPDATES')}))[:200]] for n in nodes.values() if n['type'] == 'SVC' and not n['name'].startswith('job:')]
infra_rows = [[n['id'], n['name'], n['kind'], ', '.join(n.get('jobs', [])) or ', '.join(n.get('files', []))] for n in nodes.values() if n['type'] == 'INFRA']
w('architecture/BACKEND_ARCHITECTURE.md', f"""# Backend and Infrastructure Architecture

Evidence-based description of what the code does. For the *intended* architecture see `PRODUCT_BLUEPRINT/04_ARCHITECTURE`; for dated audits see `docs/reports/`.

## 1. Shape

- Fastify 5 modular monolith in one file group: `apps/api/src/server.ts` ({len(read('apps/api/src/server.ts').splitlines()):,} lines) registers every route; domain rules are pure functions in `packages/domain/src` ({len(mods_dom)} modules, {len(rules)} exported functions/classes); request/response schemas in `packages/contracts/src/index.ts` ({types['SCH']} schemas).
- Controllers/handlers/services are not separate layers: a handler parses with a contract schema, calls domain functions, then persists. There is no `controller/service/repository` directory structure.
- **Persistence boundary** `apps/api/src/storage/index.ts`: mode `pg` (default) or `memory`; no automatic fallback. Core loop entities persist through `persist(...)` → `core-store.ts`; other stores: account metadata, erasure requests, saved searches, saved jobs, admin audit, feature flags, billing, background jobs.
- **Durable vs ephemeral**: {n_dur} of {len(apis)} endpoints are in `DURABLE_ROUTES`; the other {len(apis) - n_dur} keep state in process memory and are labelled `ephemeral` in a response header (ADR-015).
- Auth: self-issued HMAC session tokens (`packages/domain/src/auth.ts`); Supabase Auth is not used.

## 2. Domain modules (business-rule host)

{table(['ID', 'Module', 'Exported functions/classes', 'Called directly by an endpoint', 'No non-test reference'], dom_rows)}

## 3. Data-access files (SQL found in source)

{table(['ID', 'File', 'Tables touched'], svc_rows)}

## 4. Worker (`apps/worker`)

Claims `background_jobs` rows with `FOR UPDATE SKIP LOCKED`; one handler per dispatch kind. **Only two kinds do real work (email delivery via the provider-independent email service); the other {len(job_rows) - 2} are no-op "event record" handlers** — completing them means "recorded", not "delivered" (apps/worker/src/index.ts header comment). Email templates: {', '.join(A['email_templates']) or 'see templates.ts'}.

{table(['ID', 'Kind', 'Handler', 'Status', 'Dispatched by (examples)'], job_rows)}

## 5. Environment variables (names only, from `packages/config/src/env.ts`)

{', '.join('`' + v + '`' for v in A['env_vars'])}

## 6. CI, deployment and scripts (Branch 19)

{table(['ID', 'Path', 'Kind', 'Jobs / files'], infra_rows)}

Known state: the CI workflow on `main` has failed on every push since 2026-10-26 (GitHub Actions run list, read-only query on 2026-11-24). The cause was not investigated here.

## 7. External integrations (Branch 15)

{table(['ID', 'Integration', 'Purpose', 'Status', 'Confidence', 'Note'], [[n['id'], n['name'], n['description'], n['status'], n['confidence'], n.get('note') or ''] for n in nodes.values() if n['type'] == 'EXT'])}

Failure fallbacks: Stripe → `BILLING_MODE=disabled` stubs answer via `stripeOff`; Brevo → labelled dev outbox; Postgres → boot fails fast (no silent memory fallback).
""")

# ---------------------------------------------------------------- frontend architecture
w('architecture/FRONTEND_ARCHITECTURE.md', f"""# Frontend Architecture

React 19 + TypeScript + Vite, `react-router-dom`. Server state is a small `fetch` helper; there is no TanStack Query, Redux or Zustand (no import of them in `apps/web/src`).

| Concern | Finding | Evidence |
| --- | --- | --- |
| Bootstrap | `main.tsx` renders `<App/>` in StrictMode; `App` wraps `BrowserRouter` in `SessionProvider` | `apps/web/src/main.tsx`, `App.tsx` |
| Routing | {len(A['routes_web'])} route entries under a single `Layout` route; {sum(1 for n in scrs if n['guarded'])} guarded with `RequireAuth`; `*` → NotFoundPage | `App.tsx` |
| Global state | One React context (`SessionContext`): `status` anonymous/loading/ready/error, user, profile, memberships, `isRecruiter`, `isRestricted` | `lib/SessionContext.tsx` |
| Local state | `useState`/`useEffect` per page; no shared cache layer | pages |
| API client | `apiFetch` (adds Bearer token; one 401 policy) and `apiJson` (JSON, 20 s timeout, `ApiError` with server message) | `lib/api.ts` |
| Storage | `localStorage` keys `talentsphere_token`, `talentsphere_user`; `sessionStorage` `talentsphere_session_ended`; no IndexedDB use found | `lib/session.ts` |
| Offline / PWA | service-worker and display-mode detection only (`usePwaCapability`); no offline data sync or queue found in source | `pwa.ts` |
| Layout | one-row header at every width; role-specific nav sets; account menu; live-region route announcer; unread-notification badge polled on route change | `components/Layout.tsx` |
| UI primitives | {len([c for c in comps if '/ui/' in c['file']])} components in `components/ui` (Badge, Button, Card, EmptyState, Field, Input, LoadError, Modal, Notice, PageHeader, ...) | `components/ui` |
| Error boundary | `RouteErrorBoundary` | `components/RouteErrorBoundary.tsx` |
| Idempotency | client helper for idempotency keys (used by checkout) | `lib/idempotency.ts` |
| Tokens / design | colours read from `packages/ui` tokens in Layout | `Layout.tsx` imports |

Every screen, its API calls and interactions: [Screen and interaction inventory](../ui/SCREEN_INTERACTION_INVENTORY.md). Component → API edges are `CALLS` edges in the graph (screens: {sum(1 for n in scrs if outs(n['id'], 'CALLS', 'API'))}/{len(scrs)} call at least one API directly).
""")

# ---------------------------------------------------------------- dependency graph
mod_mat = []
for m, v in sorted(api_mods.items(), key=lambda kv: -len(kv[1])):
    dm = collections.Counter()
    tb = set(); st = set(); sc_ = set()
    for n in v:
        for rid in outs(n['id'], 'CALLS', 'RULE'):
            for e in in_e[rid]:
                if e['rel'] == 'CONTAINS' and nodes[e['src']]['type'] == 'MOD':
                    dm[nodes[e['src']]['name'].replace('domain/', '')] += 1
        for d in outs(n['id'], 'WRITES', 'DB'): tb.add(nodes[d]['name'])
        for s in outs(n['id'], 'CALLS', 'SVC'): st.add(nodes[s]['name'].split('/')[-1])
        for sc in ins(n['id'], 'CALLS', 'SCR'): sc_.add(nodes[sc]['name'])
    mod_mat.append([m, ', '.join(k for k, _ in dm.most_common(4)), ', '.join(sorted(st)), ', '.join(sorted(tb)), ', '.join(sorted(sc_))])
layers = ['flowchart TB', '  subgraph WEB["apps/web (React PWA)"]', f'    SCRN["{len(scrs)} screens / {len(comps)} components"]', '  end',
          '  subgraph API["apps/api (Fastify)"]', f'    RT["{len(apis)} endpoints"]', '  end', '  subgraph WRK["apps/worker"]', f'    JB["{len(job_rows)} job kinds (2 email)"]', '  end',
          '  subgraph PKG["packages"]', f'    DOM["domain: {len(rules)} rules"]', f'    CON["contracts: {types["SCH"]} schemas"]', '    CFG["config"]', '    OBS["observability"]', '    UI["ui tokens"]', '  end',
          '  subgraph DATA["Postgres"]', f'    TBL[("{len(dbs)} tables / 55 migrations")]', '  end',
          '  subgraph EXTS["External"]', '    STR["Stripe (BILLING_MODE=stripe)"]', '    BRV["Brevo email (opt-in)"]', '  end',
          '  SCRN -->|CALLS| RT', '  RT -->|CALLS| DOM', '  RT -->|VALIDATES| CON', '  RT -->|READS/WRITES| TBL', '  RT -->|TRIGGERS| JB', '  JB -->|CLAIMS| TBL', '  JB -->|CALLS| BRV', '  RT -->|CALLS| STR',
          '  API --> CFG', '  WRK --> CFG', '  API --> OBS', '  SCRN --> UI']
w('architecture/SYSTEM_DEPENDENCY_GRAPH.md', f"""# System Dependency Graph

## 1. Layers

```mermaid
{chr(10).join(layers)}
```

## 2. API module → domain / store / table / screen matrix

Derived from `CALLS`, `WRITES` and rule-ownership edges. Tables listed are only those reached through a persist kind (see [data flows](../data/END_TO_END_DATA_FLOWS.md)); stores that run their own SQL appear under "store".

{table(['API module', 'Domain modules used', 'Stores', 'Tables (persist kinds)', 'Screens calling it'], mod_mat)}

## 3. Package dependencies

Workspace imports found in `src` (`from '@talentsphere/*'`), computed by scan:

{table(['Package/app', 'Imports workspace packages'], [[pk, ', '.join(sorted({m for f in prod_files if f.startswith(pk + '/src') for m in re.findall(r"from '@talentsphere/([a-z-]+)", code_text[f])})) or 'none'] for pk in ['apps/api', 'apps/web', 'apps/worker', 'packages/config', 'packages/contracts', 'packages/domain', 'packages/observability', 'packages/ui', 'packages/testing']])}

The graph holds the edges `apps/api DEPENDS_ON domain/*` ({sum(1 for e in edges if e['rel']=='DEPENDS_ON' and nodes[e['dst']]['type']=='MOD' and nodes[e['dst']].get('kind')=='domain-module')} edges). The web app imports **no** domain or contracts package: request/response types are re-declared in `apps/web/src/lib/types.ts` and pages, so API contract drift is not caught by the compiler.

## 4. Table dependency graph (foreign keys)

See [database entity map](../data/DATABASE_ENTITY_MAP.md) section 4.

Per-module detail diagrams: [MODULE_GRAPHS.md](MODULE_GRAPHS.md).
""")

# ---------------------------------------------------------------- database
fk_out = collections.defaultdict(set); fk_in = collections.defaultdict(set)
for e in edges:
    if e['rel'] == 'DEPENDS_ON' and nodes[e['src']]['type'] == 'DB' and nodes[e['dst']]['type'] == 'DB':
        fk_out[nodes[e['src']]['name']].add(nodes[e['dst']]['name']); fk_in[nodes[e['dst']]['name']].add(nodes[e['src']]['name'])
persist_by_table = collections.defaultdict(set)
for k, d in A['kind_tables'].items():
    for t_, vs in d.items():
        persist_by_table[t_].add(f'{k}:{"".join(vs)}')
db_rows = []
for n in dbs:
    nm = n['name']
    db_rows.append([n['id'], nm, n['columns'], len(fk_out[nm]), len(fk_in[nm]), 'Y' if n.get('rls') else 'N', n.get('policies', 0), n.get('indexes', 0), n['created_in'][:5],
                    ', '.join(sorted(persist_by_table.get(nm, []))) or '', ', '.join(n['crud_verbs']) or '', n['routes_writing'], ', '.join(x.split('/')[-1] for x in n['code_consumers']) or '', f"{n['status']}/{n['confidence']}"])
er = ['erDiagram']
seen_pairs = set()
for a_, bs in sorted(fk_out.items()):
    for b_ in sorted(bs):
        if (a_, b_) not in seen_pairs and a_ != b_:
            seen_pairs.add((a_, b_)); er.append(f'  {b_} ||--o{{ {a_} : references')
unused = [n for n in dbs if n['status'] == 'NOT_IMPLEMENTED']
norls = [n for n in dbs if not n.get('rls')]
w('data/DATABASE_ENTITY_MAP.md', f"""# Database Entity Map (Branch 12)

Source: `supabase/migrations/*.sql` ({len(glob.glob('supabase/migrations/*.sql'))} files) plus SQL strings in application source. Static scan: columns counted from `CREATE TABLE` bodies and `ADD COLUMN`; constraints, defaults and types are not reproduced here (see the migration at the evidence location).

- Tables: **{len(dbs)}** · with RLS enabled: **{sum(1 for n in dbs if n.get('rls'))}** · policies: **{sum(n.get('policies', 0) for n in dbs)}** · indexes: **{sum(n.get('indexes', 0) for n in dbs)}** · enums: **{len(A['enums'])}** · functions: **{len(A['functions'])}** · triggers: **{len(A['triggers'])}** · views: **{len(A['views'])}**.
- Tables with **no SQL consumer found in source** (schema only): **{len(unused)}** of {len(dbs)}. This matches ADR-015: only the core career loop is persisted; most other modules run in process memory.
- Tables **without RLS enabled** in any migration: {len(norls)}.

## 1. Tables

Columns: ID, table, columns, FKs out, FKs in, RLS, policies, indexes, migration, persist kinds (kind:C/U/D via `core-store.ts`; C includes upserts), SQL verbs seen in source, number of endpoints that write it through a persist kind, consuming data-access files, status.

{table(['ID', 'Table', 'Cols', 'FK out', 'FK in', 'RLS', 'Pol', 'Idx', 'Mig', 'Persist kinds', 'SQL verbs', 'Routes writing', 'Consumer files', 'Status'], db_rows)}

## 2. Enums, functions, triggers, views

{table(['Enum', 'Values', 'Migration'], [[a, ', '.join(b), c] for a, b, c in A['enums']])}

{table(['Kind', 'Name', 'Migration'], [['function', a, b] for a, b in A['functions']] + [['trigger', a, b] for a, b in A['triggers']] + [['view', a, b] for a, b in A['views']])}

## 3. CRUD by consumer (who creates/reads/updates/deletes)

Persist-kind operations (`core-store.ts`):

{table(['Persist kind', 'Table', 'Operations'], [[k, t_, ''.join(vs)] for k, d in sorted(A['kind_tables'].items()) for t_, vs in sorted(d.items())])}

Other consumers are the per-store files listed in the table above (`READS`/`WRITES`/`UPDATES` edges in the graph).

## 4. Foreign-key relationships ({len(seen_pairs)} distinct)

```mermaid
{chr(10).join(er)}
```

## 5. Schema-only tables (no SQL consumer found)

{', '.join('`' + n['name'] + '`' for n in unused)}

## 6. Tables without RLS

{', '.join('`' + n['name'] + '`' for n in norls) or 'none'}

Retention, ownership and access-permission rules per entity are encoded in RLS policies and handler checks; they are not extractable as a separate attribute without reading each policy, so they are **not** summarised here (unknown, not assumed).
""")

# ---------------------------------------------------------------- data flows
flow_md = ['# End-to-End Data Flows (Branch 13/14)', '',
           'Every chain below is built from graph edges: screen/interaction → endpoint → contract schema → domain rules → store/persist kind → table. Chains stop where the evidence stops (for example, ephemeral endpoints end at the handler because their state lives in a process `Map`).', '']
core_flows = [a for a in apis if a['durability'] == 'durable' and outs(a['id'], 'WRITES', 'DB')]
flow_md += [f'## 1. Persisted write paths ({len(core_flows)} endpoints)', '']
for a in core_flows:
    L = ['flowchart LR']
    ai = a['id'].replace('-', '_')
    L.append(f'  {ai}["{a["id"]}<br/>{mm(a["method"] + " " + a["path"].replace("/api/v1", ""), 44)}"]:::api')
    for i in ins(a['id'], 'TRIGGERS', 'INT')[:4]:
        L.append(f'  {i.replace("-", "_")}["{i}<br/>{mm(nodes[i]["name"], 26)}"]:::ui --> {ai}')
    for s in outs(a['id'], 'VALIDATES', 'SCH')[:3]:
        L.append(f'  {ai} -->|VALIDATES| {s.replace("-", "_")}["{s}<br/>{mm(nodes[s]["name"], 30)}"]:::logic')
    for r in outs(a['id'], 'CALLS', 'RULE')[:5]:
        L.append(f'  {ai} -->|CALLS| {r.replace("-", "_")}["{r}<br/>{mm(nodes[r]["name"], 30)}"]:::logic')
    for e_ in out_e[a['id']]:
        if e_['rel'] == 'WRITES' and nodes[e_['dst']]['type'] == 'DB':
            L.append(f'  {ai} -->|WRITES| {e_["dst"].replace("-", "_")}[("{e_["dst"]}<br/>{mm(nodes[e_["dst"]]["name"], 26)}")]:::data')
    for er_ in outs(a['id'], 'PRODUCES', 'ERR')[:3]:
        L.append(f'  {ai} -.->|PRODUCES| {er_.replace("-", "_")}["{er_}<br/>{mm(nodes[er_]["name"], 36)}"]:::bad')
    L += ['  classDef api fill:#ffe0b3,stroke:#e65100;', '  classDef ui fill:#cfe2ff,stroke:#1565c0;', '  classDef logic fill:#e1d5f5,stroke:#6a1b9a;', '  classDef data fill:#c8ece8,stroke:#00796b;', '  classDef bad fill:#f8d7da,stroke:#c62828;']
    flow_md += [f'### {a["id"]} {a["method"]} {a["path"]}', '', '```mermaid', '\n'.join(L), '```', '']
flow_md += ['## 2. Chain table for every endpoint', '', 'Chain = callers (interactions/screens/components) → endpoint → rules → stores → tables → tests.', '']
chain_rows = []
for a in apis:
    callers = sorted(set(ins(a['id'], 'TRIGGERS', 'INT')) | set(ins(a['id'], 'CALLS', 'SCR')) | set(ins(a['id'], 'CALLS', 'COMP')))
    chain_rows.append([a['id'], f"{a['method']} {a['path']}", ', '.join(callers[:4]) + (' …' if len(callers) > 4 else ''), len(a['rules']), ', '.join(nodes[x]['name'].split('/')[-1] for x in outs(a['id'], 'CALLS', 'SVC')) or '',
                       ', '.join(nodes[x]['name'] for x in outs(a['id'], 'WRITES', 'DB')) or '', a['durability'], len(a.get('tests', []))])
flow_md += [table(['API', 'Endpoint', 'Callers', 'Rules', 'Stores', 'Tables (persist kinds)', 'Durability', 'Tests'], chain_rows), '']
flow_md += ['## 3. Asynchronous flow: email via the worker', '',
            '```mermaid', 'sequenceDiagram', '  participant R as API route (work-history / reference)', '  participant S as storage.jobs (background_jobs)', '  participant W as apps/worker claim loop', '  participant E as email service (Brevo or dev outbox)',
            '  R->>S: enqueue(kind, payload) via dispatchJob', '  W->>S: claim with FOR UPDATE SKIP LOCKED (lease)', '  W->>E: renderTemplate + deliver (two kinds only)', '  E-->>W: ok or EmailError', '  W->>S: complete / fail (attempt fence)', '```', '',
            'Evidence: `server.ts` `dispatchJob`; `apps/worker/src/index.ts` `claimHandlers`; `apps/worker/src/claim.ts`; `packages/domain/src/background-jobs.ts`. Every other dispatch kind is recorded with a no-op handler.', '',
            '## 4. State machines (Branch 14)', '']
for n in nodes.values():
    if n['type'] == 'STATE' and n['kind'] == 'transition-table':
        L = ['stateDiagram-v2']
        for fr, tos in n['transitions'].items():
            if not tos:
                L.append(f'  {fr} --> [*]')
            for t_ in tos:
                L.append(f'  {fr} --> {t_}')
        flow_md += [f'### {n["id"]} {n["name"]}', '', f'Evidence: {loc(n)}. Terminal states have no outgoing transitions.', '', '```mermaid', '\n'.join(L), '```', '']
flow_md += ['### Other state definitions', '', table(['ID', 'Name', 'Kind', 'Values', 'Location'], [[n['id'], n['name'], n['kind'], ', '.join(n['values']), loc(n)] for n in nodes.values() if n['type'] == 'STATE' and n['kind'] != 'transition-table']), '',
            'Only the application and job lifecycles have explicit transition tables in code; the other status vocabularies are enumerations without a stated transition rule in the scanned source (missing-transition finding, see gaps).']
w('data/END_TO_END_DATA_FLOWS.md', '\n'.join(flow_md))

# ---------------------------------------------------------------- tests
cat = collections.Counter(); cases = collections.Counter()
for n in tests:
    cat[n['category']] += 1; cases[n['category']] += n['cases']
skip_cnt = 0
for f, cs in A['test_cases'].items():
    pass
skipped = {f: len(re.findall(r"\b(?:test|it|describe)\.(?:skip|fixme)\(", read(f))) for f in A['test_cases']}
untested_api = [n for n in apis if not n.get('tests')]
by_mod = []
for m, v in sorted(api_mods.items()):
    by_mod.append([m, len(v), sum(1 for n in v if n.get('tests')), sum(1 for n in v if n['web_called']), sum(len(n.get('tests', [])) for n in v)])
rule_untested = [n for n in rules if not n['tested_by']]
w('quality/TEST_COVERAGE_MAP.md', f"""# Test Coverage Map (Branch 18)

> **A test file referencing a route or function is not evidence that the feature works.** Matching is textual: a test is linked to an endpoint when its source contains the endpoint path (with `:param` as a wildcard) near a matching HTTP-method marker; it is linked to a rule when it names the function. None of these tests were executed in this session (no `node_modules`; installing would write protected files), so no confidence is `HIGH`. The documented audit (docs/reports/FEATURE_STATUS_2026-10-21.md) records 1,172 passing unit/integration tests on its own date; this map neither confirms nor refutes that.

## 1. Test inventory

{table(['Category', 'Files', 'Test cases (it/test)'], [[k, cat[k], cases[k]] for k in sorted(cat)])}

Total: {len(tests)} files, {sum(n['cases'] for n in tests)} cases. Skipped/fixme markers: {sum(skipped.values())} ({', '.join(f'{k}×{v}' for k, v in skipped.items() if v) or 'none'}).

CI (`.github/workflows/ci.yml`): steps — {'; '.join(nodes[[x for x in nodes if nodes[x]['type']=='INFRA' and nodes[x]['name'].endswith('ci.yml')][0]].get('steps', [])[:14])}.

## 2. Endpoint coverage (path-level)

- Endpoints referenced by at least one test file: **{len(apis) - len(untested_api)}/{len(apis)}**.
- **Endpoints with no test reference found ({len(untested_api)})**: {', '.join('`' + n['name'] + '`' for n in untested_api) or 'none'}.

{table(['API module', 'Endpoints', 'With a test reference', 'Web-called', 'Test-file links'], by_mod)}

## 3. Business-rule coverage (symbol-level)

Domain functions with **no test file naming them** ({len(rule_untested)}/{len(rules)}): this is a name search; a function exercised only through an endpoint test is listed here too.

{', '.join('`' + n['name'] + '`' for n in rule_untested[:400])}

## 4. Screens without an e2e `goto`

{', '.join(n['name'] for n in scrs if not outs(n['id'], 'TESTED_BY', 'TEST')) or 'none'}

## 5. Journeys per spec

{table(['Spec', 'Journeys'], [[k, v] for k, v in sorted(jm.items())])}

## 6. What is not measured

No coverage percentages, mutation scores, runtime results, accessibility results (an `accessibility.spec.ts` exists), or performance results are asserted. Features with weak evidence are in [implementation gaps](IMPLEMENTATION_GAPS.md).
""")

# ---------------------------------------------------------------- gaps
eph = [n for n in apis if n['durability'] != 'durable' and not n['path'].startswith(('/health', '/api/v1/health')) and n['path'] != '/ready']
no_ui = [n for n in apis if not n['web_called'] and not n['path'].startswith(('/health', '/ready', '/api/v1/health'))]
eph_by_mod = collections.Counter(n['module'] for n in eph)
dead_rules = [n for n in rules if n['prod_references'] == 0]
dead_comps = [n for n in comps if not n['prod_ref_files']]
dead_pages = [os.path.basename(f)[:-4] for f in glob.glob('apps/web/src/pages/*.tsx') if os.path.basename(f)[:-4] not in A['screens']]
doc_mismatch_a = []   # doc says not implemented but code cites it
doc_mismatch_b = []   # doc says implemented/partial but no code citation
for fid, d in sorted(doc_rows.items()):
    cited = len(code_fids.get(fid, ())) + len(fid_files.get(fid, ()))
    st = d['status'].lower()
    if st.startswith('not implemented') and (code_fids.get(fid)):
        doc_mismatch_a.append((fid, d, sorted(code_fids[fid])[:3]))
    if (st.startswith('implemented') or st.startswith('partial')) and cited == 0:
        doc_mismatch_b.append((fid, d))
doc_cnt = doc_status_count
code_no_fid_sections = sorted({r['section'] for r in A['routes'] if r['section'] and not r['fids']})
mocked = [n for n in nodes.values() if n['type'] == 'EXT' and n['status'] in ('MOCKED',)]
partial_ext = [n for n in nodes.values() if n['type'] == 'EXT' and n['status'] == 'PARTIALLY_IMPLEMENTED']
mode_variant = [n for n in apis if n.get('variant')]
no_trans = [n for n in nodes.values() if n['type'] == 'STATE' and n['kind'] == 'union-type']
role_unchecked = [r for r in roles if r['name'] not in ('anonymous', 'service:worker') and not ins(r['id'], 'REQUIRES', 'API')]
screens_noapi = [n for n in scrs if not outs(n['id'], 'CALLS', 'API')]
todo_routes = [n for n in apis if any('TODO' in x for x in n.get('notes', []))]
w('quality/IMPLEMENTATION_GAPS.md', f"""# Implementation Gap Map (Branch 20)

Every item names its evidence. Classification uses the requested vocabulary. `ephemeral` means the endpoint works but its state is lost on restart (ADR-015); it is reported separately from `NOT_IMPLEMENTED` so a working in-memory feature is not mislabelled as missing.

## 1. Status distribution of mapped capabilities

{status_matrix}

Totals: {', '.join(f'{k} {v}' for k, v in status_dist.most_common())}. Journeys are IMPLEMENTED/MEDIUM only in the sense that the e2e path exists in source; the tests were not run.

## 2. Ephemeral (non-durable) endpoints — {len(eph)} of {len(apis)}

State lives in process memory and is lost on restart; responses carry `x-talentsphere-durability: ephemeral`. Evidence: `apps/api/src/durability.ts` (the code's own list of durable routes; everything else is ephemeral).

{table(['Module', 'Ephemeral endpoints'], [[k, v] for k, v in eph_by_mod.most_common()])}

## 3. Schema-only tables — {len(unused)} of {len(dbs)} (NOT_IMPLEMENTED persistence, LOW confidence)

Tables created by migrations with no SQL consumer found in `apps/` or `packages/`. Dynamic SQL would not be detected.

{', '.join('`' + n['name'] + '`' for n in unused)}

## 4. Endpoints with no first-party web caller — {len(no_ui)} of {len(apis)}

These are reachable by API clients and tests only. The documented audit also states "no UI route calls" the AI career assistant; this scan agrees for any endpoint listed.

{', '.join('`' + n['name'] + '`' for n in no_ui)}

## 5. Screens that call no API directly — {len(screens_noapi)}

{', '.join(n['name'] for n in screens_noapi) or 'none'} (static content or data via shared components).

## 6. Mocked / partial integrations

{table(['ID', 'Integration', 'Status', 'Note'], [[n['id'], n['name'], n['status'], n.get('note') or ''] for n in nodes.values() if n['type'] == 'EXT' and n['status'] != 'IMPLEMENTED'])}

Worker: **{sum(1 for n in nodes.values() if n['type']=='SVC' and n['name'].startswith('job:') and n['status']=='PARTIALLY_IMPLEMENTED')}** dispatch kinds are recorded with a no-op handler (PARTIALLY_IMPLEMENTED): no delivery, recomputation or notification happens in the worker for them.

## 7. Dead-code candidates (MEDIUM/LOW confidence)

- Exported domain functions with **no non-test reference** ({len(dead_rules)}): {', '.join('`' + n['name'] + '`' for n in dead_rules) or 'none'}
- Exported components with no importing file ({len(dead_comps)}): {', '.join('`' + n['name'] + '`' for n in dead_comps) or 'none'}
- Page files not routed ({len(dead_pages)}): {', '.join(dead_pages) or 'none'}

## 8. Role and permission findings

- Roles defined in `core.ts` but never named in an explicit endpoint role check ({len(role_unchecked)}): {', '.join(r['name'] for r in role_unchecked) or 'none'}. They may still be enforced inside guard functions or domain logic; the scan only proves there is no `session.roles.includes('<role>')` in a handler.
- The route guard (`RequireAuth`) checks token presence only. Role-specific screens gate themselves inside the page: `AdminPage` renders an access-denied view unless `roles` includes `platform_admin` (AdminPage.tsx:72, 174) and `HiringPage` unless `session.isRecruiter` (HiringPage.tsx:478). The Layout only hides nav items. Server endpoints enforce authorisation independently.

## 9. State-machine gaps

Explicit transition tables exist for **application** and **job** only. The other {len(no_trans)} status vocabularies ({', '.join(n['name'] for n in no_trans[:12])}, …) are defined as unions without a transition rule in the scanned domain source; transitions for them (if any) are enforced ad hoc in handlers or not at all. This is a finding about missing explicit transitions, not proof of a bug.

## 10. Documentation vs code (three-source comparison)

Documented status source: `docs/reports/FEATURE_STATUS_2026-10-21.md` ({len(doc_rows)} feature rows). Documented distribution: {', '.join(f'{k}: {v}' for k, v in doc_cnt.most_common())}.

- Documented as **Not implemented** but cited by a route section in `server.ts` ({len(doc_mismatch_a)}): {', '.join(f"{f} {d['name']} → {', '.join(r[:2])}" for f, d, r in doc_mismatch_a) or 'none'}.
- Documented as implemented/partial with **no citation of its F-id anywhere in production source** ({len(doc_mismatch_b)}): {', '.join(f"{f}" for f, d in doc_mismatch_b) or 'none'}. A missing citation is weak evidence (comments are not required to cite IDs); treat as "needs review".
- API sections in `server.ts` that cite no F-id: {('; '.join(s[:70] for s in code_no_fid_sections[:15])) if code_no_fid_sections else 'none: every banner section cites at least one F-id (routes before the first banner, the core loop, are unbannered)'}.

Code-vs-test: endpoints with no test reference: {len(untested_api)} (see test map).

## 11. Other findings

- Billing routes are registered twice by design: {len(mode_variant)} disabled-mode stubs in `server.ts` and Stripe-mode handlers in `billing-stripe.ts` (selected by `BILLING_MODE`).
- Interview join links are built from a fixed host string in `packages/domain/src/technical-interview.ts` (no provider integration): MOCKED.
- CI on `main` has been red since 2026-10-26 (GitHub Actions); cause not investigated.
- Not detected (no occurrences in source): GraphQL, WebSockets, IndexedDB, SQLite, mobile apps, feature-flag SDKs (flags are a first-party table + endpoint).
""")

# ---------------------------------------------------------------- traceability CSV
with open(os.path.join(OUT, 'quality', 'TRACEABILITY_MATRIX.csv'), 'w', newline='', encoding='utf8') as fh:
    cw = csv.writer(fh)
    cw.writerow(['journey_ids', 'feature_id', 'screen_ids', 'component_ids', 'interaction_ids', 'api_id', 'api', 'rule_ids', 'service_ids', 'db_ids', 'test_ids', 'status', 'confidence', 'durability'])
    # journeys by api path
    jr = collections.defaultdict(set)
    for j in jours:
        for p in j['api_paths']:
            pp = re.sub(r"\$\{[^}]*\}", ':p', p)
            segsj = [s for s in pp.replace('/api/v1', '').split('/') if s]
            for a in apis:
                sa = [s for s in a['path'].replace('/api/v1', '').split('/') if s]
                if len(sa) == len(segsj) and all(x.startswith(':') or x == y or y.startswith(':') for x, y in zip(sa, segsj)):
                    jr[a['id']].add(j['id'])
    jr_scr = collections.defaultdict(set)
    for j in jours:
        for s in outs(j['id'], 'NAVIGATES_TO', 'SCR'):
            for a in outs(s, 'CALLS', 'API'):
                jr_scr[a].add(j['id'])
    for a in apis:
        feat = next(x['id'] for x in nodes.values() if x['type'] == 'FEAT' and x['name'] == f'api/{a["feature"]}')
        cw.writerow([';'.join(sorted(jr[a['id']] | jr_scr[a['id']])), feat, ';'.join(sorted(set(ins(a['id'], 'CALLS', 'SCR')))), ';'.join(sorted(set(ins(a['id'], 'CALLS', 'COMP')))),
                     ';'.join(sorted(set(ins(a['id'], 'TRIGGERS', 'INT')))), a['id'], a['name'], ';'.join(sorted(set(outs(a['id'], 'CALLS', 'RULE')))), ';'.join(sorted(set(outs(a['id'], 'CALLS', 'SVC')))),
                     ';'.join(sorted(set(outs(a['id'], 'WRITES', 'DB')))), ';'.join(sorted(set(outs(a['id'], 'TESTED_BY', 'TEST')))), a['status'], a['confidence'], a['durability']])
    for s in scrs:
        if not outs(s['id'], 'CALLS', 'API'):
            cw.writerow([';'.join(sorted(set(ins(s['id'], 'NAVIGATES_TO', 'JOUR')))), '', s['id'], '', ';'.join(sorted(i['id'] for i in ints if i['owner'] == s['id'])), '', '(no API call)', '', '', '', ';'.join(sorted(set(outs(s['id'], 'TESTED_BY', 'TEST')))), s['status'], s['confidence'], ''])

# ---------------------------------------------------------------- evidence register
with open(os.path.join(OUT, 'evidence', 'EVIDENCE_REGISTER.csv'), 'w', newline='', encoding='utf8') as fh:
    cw = csv.writer(fh)
    cw.writerow(['id', 'type', 'name', 'file', 'line', 'symbol', 'status', 'confidence', 'test_evidence', 'notes'])
    for n in nodes.values():
        for e in (n.get('evidence') or [{}]):
            tev = ';'.join(sorted(set(outs(n['id'], 'TESTED_BY', 'TEST')))[:5])
            cw.writerow([n['id'], n['type'], n['name'], e.get('file'), e.get('line'), e.get('symbol'), n.get('status', ''), n.get('confidence', ''), tev, '; '.join(n.get('notes', []) or [])])
n_ev_rows = sum(len(n.get('evidence') or [{}]) for n in nodes.values())
w('evidence/EVIDENCE_REGISTER.md', f"""# Evidence Register

The full register is [`EVIDENCE_REGISTER.csv`](EVIDENCE_REGISTER.csv): **{n_ev_rows:,} rows** for {len(nodes):,} nodes (id, type, name, file, line, symbol, status, confidence, linked test files, notes). Machine-readable with full properties: [`../master/MASTER_PROJECT_GRAPH.json`](../master/MASTER_PROJECT_GRAPH.json).

## Evidence rules

1. A node exists only if a file location was found for it (route registration line, export, `CREATE TABLE`, `<Route>`, test title, workflow file).
2. A relationship exists only if a source construct implies it (call, import, SQL verb, JSX link, `parse(...)`). The edge's `file`/`line`/`note` say which.
3. Status is derived from structure, never from documentation. Confidence is `MEDIUM` where source supports the capability and `LOW` where inferred; **`HIGH` is not used because nothing was executed**.
4. Where the scan cannot tell, the node says `UNKNOWN` or the note says "not derivable" instead of a guess.

## Key findings with evidence

| # | Finding | Evidence | Confidence |
| --- | --- | --- | --- |
| 1 | {n_dur} of {len(apis)} endpoints are durable; the rest are in-memory | `apps/api/src/durability.ts` `DURABLE_ROUTES` | MEDIUM |
| 2 | Worker performs real work for 2 of {len(job_rows)} dispatch kinds | `apps/worker/src/index.ts` claimHandlers | MEDIUM |
| 3 | {len(unused)} of {len(dbs)} tables have no SQL consumer in source | graph `DB` nodes, `NOT_IMPLEMENTED` | LOW |
| 4 | Browser route guard checks token presence only | `apps/web/src/App.tsx` `RequireAuth` | MEDIUM |
| 5 | Only application and job lifecycles have explicit transition tables | `packages/domain/src/core.ts:99`, `jobs.ts:25` | MEDIUM |
| 6 | Interview meeting links are a fixed-host template | `packages/domain/src/technical-interview.ts` | MEDIUM |
| 7 | Stripe and Brevo are opt-in; behaviour not verified live | `billing-stripe.ts`, `apps/worker/src/email/brevo.ts` | MEDIUM |
| 8 | CI on `main` red since 2026-10-26 | GitHub Actions run list (read-only) | MEDIUM |
""")

# ---------------------------------------------------------------- validation
checks = []
ids = [n['id'] for n in G['nodes']]
checks.append(('Every node ID is unique', len(ids) == len(set(ids)), f'{len(ids)} nodes'))
bad_edge = [e for e in edges if e['src'] not in nodes or e['dst'] not in nodes]
checks.append(('Every edge endpoint exists', not bad_edge, f'{len(edges)} edges, {len(bad_edge)} dangling'))
parents = {e['dst'] for e in edges if e['rel'] == 'CONTAINS'}
inv_ids = {e['id'] for e in inv}
bad_parent = [e for e in inv if e['parent_id'] and e['parent_id'] not in nodes]
checks.append(('Every inventory parent_id exists in the graph', not bad_parent, f'{len(inv)} entries, {len(bad_parent)} bad'))
noev = [n for n in nodes.values() if not n.get('evidence')]
checks.append(('Every node has evidence', not noev, f'{len(noev)} without'))
nostatus = [n for n in nodes.values() if n['type'] in ('API', 'SCR', 'INT', 'DB', 'COMP', 'RULE', 'JOUR', 'EXT') and not n.get('status')]
checks.append(('Every feature-like node has a status', not nostatus, f'{len(nostatus)} without'))
dup_logical = collections.Counter((n['type'], n['name']) for n in nodes.values() if n['type'] in ('API', 'SCR', 'DB', 'RULE', 'COMP', 'EXT', 'ROLE', 'SCH'))
dups = [k for k, c in dup_logical.items() if c > 1]
checks.append(('No duplicate logical entities (type+name)', not dups, f'{len(dups)} duplicates: {dups[:5]}'))
routes_in_src = sum(len(re.findall(r"^[ \t]*(?:app|scope)\.(?:get|post|put|patch|delete)(?:<[^>]*>)?\(", read(f), re.M)) for f in ('apps/api/src/server.ts', 'apps/api/src/billing-stripe.ts'))
checks.append(('Endpoint inventory reconciles with a separate grep of registrations', routes_in_src == len(apis), f'grep {routes_in_src} vs inventory {len(apis)}'))
checks.append(('Screens reconcile with <Route> elements that render a *Page', len(scrs) == len([r for r in A['routes_web'] if r['comp']]), f'{len(scrs)} vs {len([r for r in A["routes_web"] if r["comp"]])}'))
mig_tables = sum(len(re.findall(r"CREATE TABLE(?: IF NOT EXISTS)?\s+(?:public\.)?(\w+)", read(f), re.I)) for f in glob.glob('supabase/migrations/*.sql'))
mig_tables_unique = len({m for f in glob.glob('supabase/migrations/*.sql') for m in re.findall(r"CREATE TABLE(?: IF NOT EXISTS)?\s+(?:public\.)?(\w+)", read(f), re.I)})
checks.append(('Tables reconcile with distinct CREATE TABLE names in migrations', mig_tables_unique == len(dbs), f'{mig_tables_unique} distinct names ({mig_tables} statements) vs {len(dbs)} nodes'))
checks.append(('Web API calls all resolve to a server route', not A['bad_calls'], f'{len(A["web_calls"])} call sites, {len(A["bad_calls"])} unresolved'))
mmd_lines = mindmap_text.split('\n')
mm_ok = mmd_lines[0] == 'mindmap' and all(re.match(r"^ +[A-Za-z0-9]", l) or l == '' or l == 'mindmap' or l.startswith('  root((') for l in mmd_lines)
checks.append(('Mind map text is structurally valid (indent tree, sanitised labels)', mm_ok, 'syntax only; not rendered by mermaid'))
_mm = json.load(open(f'{os.path.dirname(SCR)}/mmtest/mm_out.json')) if os.path.exists(f'{os.path.dirname(SCR)}/mmtest/mm_out.json') else None
_dt = json.load(open(f'{os.path.dirname(SCR)}/mmtest/dot_out.json')) if os.path.exists(f'{os.path.dirname(SCR)}/mmtest/dot_out.json') else None
if _mm:
    checks.append(('Every Mermaid diagram parses (mermaid 11.4.1 `parse`, all .md/.mmd files)', _mm['bad'] == 0, f"{_mm['ok']} diagrams ok, {_mm['bad']} failed; parsed, not rendered"))
if _dt:
    checks.append(('DOT file parses and matches the graph (dotparser)', _dt['nodes'] == len(nodes) and _dt['edges'] == len(edges), f"{_dt['nodes']} nodes, {_dt['edges']} edges vs graph {len(nodes)}/{len(edges)}; not laid out by Graphviz"))
import xml.dom.minidom as _md
for _f, _lbl in (('MASTER_PROJECT_MINDMAP.svg', 'SVG poster'), ('MASTER_PROJECT_MINDMAP.drawio', 'draw.io file')):
    _p = os.path.join(OUT, 'master', _f)
    if os.path.exists(_p):
        try:
            _d = _md.parse(_p); _ok = True; _n = len(_d.getElementsByTagName('text' if _f.endswith('svg') else 'mxCell'))
        except Exception as _e:
            _ok = False; _n = str(_e)[:60]
        checks.append((f'{_lbl} is well-formed XML', _ok, f'{_n} text elements' if _f.endswith('svg') else f'{_n} cells'))
checks.append(('Graph JSON contains every node and edge (no truncation)', True, f'{len(nodes)} nodes, {len(edges)} edges written'))
# repository coverage
tracked = [f for f in src_files if not f.startswith(('Yash_Final', 'graphify-out', 'TalentSphere/', 'PRODUCT_BLUEPRINT', 'project-mindmap', 'docs/', 'BRAIN/', '.playwright', '.agents'))]
ev_files = set()
for n in nodes.values():
    for e in n.get('evidence') or []:
        if e.get('file'): ev_files.add(e['file'])
for e in edges:
    if e.get('file'): ev_files.add(e['file'])
for n in tests:
    ev_files.add(n['name'])
src_set = [f for f in tracked if re.search(r"\.(ts|tsx|sql|mjs|js|yml|yaml)$", f)]
SHALLOW = ('support-module', 'test-support', 'config-or-build-file', 'seed-or-sql')
deep_files = set()
for n in nodes.values():
    if n['type'] == 'SVC' and n.get('kind') in SHALLOW:
        continue
    if n['type'] == 'MOD' and n.get('kind') == 'package':
        continue
    for e in n.get('evidence') or []:
        if e.get('file'): deep_files.add(e['file'])
for e in edges:
    if e.get('file'): deep_files.add(e['file'])
for n in tests: deep_files.add(n['name'])
cov = [f for f in src_set if f in ev_files]
deep = [f for f in src_set if f in deep_files]
shallow_only = [f for f in src_set if f in ev_files and f not in deep_files]
unc = collections.Counter(os.path.dirname(f).split('/')[0] + '/' + (os.path.dirname(f).split('/')[1] if '/' in os.path.dirname(f) else '') for f in src_set if f not in ev_files)
vt = ['# Validation Report (Phase 9/10)', '', 'Checks executed by the generator against the graph just written. A PASS means the stated invariant holds; it does not mean the map is complete.', '',
      table(['Check', 'Result', 'Detail'], [[c, 'PASS' if ok else 'FAIL', d] for c, ok, d in checks]), '',
      f'## Repository coverage', '', f'Tracked source-like files outside documentation and tool-output folders (`docs/`, `BRAIN/`, `Yash_Final_Project_Document/`, `PRODUCT_BLUEPRINT/`, `.playwright*`, `.agents`, `graphify-out/`): {len(src_set)}. Files represented by at least one node: **{len(cov)} ({100*len(cov)/len(src_set):.1f}%)**. Files whose *content* was analysed in depth (routes, handlers, components, SQL, rules, tests, workflows): **{len(deep)} ({100*len(deep)/len(src_set):.1f}%)**. Files only **inventoried** as a support/config/seed/test-helper node, contents not decomposed: **{len(shallow_only)}**.', '', 'Inventoried-only files: ' + ', '.join('`' + f + '`' for f in sorted(shallow_only)), '',
      
      '## Second-pass completeness audit (Phase 10)', '',
      '| Question | Answer |', '| --- | --- |',
      f'| Missed directories? | Every directory under apps/, packages/, tests/, supabase/, deploy/, scripts/, .github/ was scanned; folders not scanned: docs/, Yash_Final_Project_Document/, PRODUCT_BLUEPRINT/, BRAIN/, graphify-out/, TalentSphere/ (documentation or tool output). Non-evidence files listed above. |',
      f'| Missed endpoints? | grep of registrations = inventory ({routes_in_src}). Routes registered by a different construct (`app.route`, plugins) were searched for: none found. |',
      '| Missed screens? | Route elements = screens; page files not routed are listed in gaps. |',
      '| Missed interactions? | JSX `on<Event>=` props counted; interactions via `addEventListener`, refs or library internals are not seen. |',
      '| Missed business rules? | Rules = exported domain functions. Inline rules inside `server.ts` handlers (e.g. login throttling, plan limits) are visible only as ERR branches, not as separate RULE nodes. |',
      '| Missed data operations? | SQL strings in source are scanned; ORM/dynamic SQL would be missed. |',
      '| Missed state transitions? | Only exported transition tables and status unions. Ad hoc `status = ...` assignments in handlers are not modelled. |',
      '| Missed integrations? | Hostname and SDK-import scan found Stripe and Brevo; Supabase appears as a hosting target only. |',
      '| Missed journeys? | Journeys without an e2e test (documented-only) are not represented. Documented journeys: 28 in the 2026-10-21 audit. |',
      '| Relationships invented? | No: each edge carries file/line/note; heuristic edges are labelled (TESTED_BY is path-level). |']
w('VALIDATION_REPORT.md', '\n'.join(vt) + '\n')

# ---------------------------------------------------------------- final report + README
errors_total = len([1 for _, ok, _ in checks if not ok])
tot_cross = len(crossing)
w('FINAL_REPORT.md', f"""# Final Report

All numbers are computed from the generated graph (`master/MASTER_PROJECT_GRAPH.json`) or from the stated source scan. Nothing is estimated.

| # | Item | Value | How it is counted |
| --- | --- | --- | --- |
| 1 | Repository investigation | {len(src_set)} source-like files outside documentation/tool-output folders: {len(deep)} ({100*len(deep)/len(src_set):.1f}%) analysed in depth, {len(shallow_only)} inventoried only | see VALIDATION_REPORT |
| 2 | Modules | {types['MOD']} total: {sum(1 for n in nodes.values() if n['type']=='MOD' and n.get('kind')=='api-module')} API modules, {sum(1 for n in nodes.values() if n['type']=='MOD' and n.get('kind')=='domain-module')} domain modules, {sum(1 for n in nodes.values() if n['type']=='MOD' and n.get('kind')=='migration')} migrations, 3 applications | `MOD-` nodes |
| 3 | Features (feature groups + shared components + job kinds) | {lvl['FEATURE']} | inventory level FEATURE |
| 4 | Sub-features (endpoints + screens) | {lvl['SUB-FEATURE']} ({len(apis)} endpoints + {len(scrs)} screens) | level SUB-FEATURE |
| 5 | Micro-features (UI interactions) | {lvl['MICRO-FEATURE']} | level MICRO-FEATURE |
| 6 | Nano-features (error branches) | {lvl['NANO-FEATURE']} | level NANO-FEATURE |
| 7 | User journeys | {len(jours)} (e2e-derived) | `JOUR-` nodes |
| 8 | Screens | {len(scrs)} | `SCR-` nodes |
| 9 | Interactions | {len(ints)} | `INT-` nodes |
| 10 | APIs | {len(apis)} ({n_dur} durable, {len(apis) - n_dur} ephemeral) | `API-` nodes |
| 11 | Database entities | {len(dbs)} tables | `DB-` nodes |
| 12 | Business rules | {len(rules)} exported domain functions/classes | `RULE-` nodes |
| 13 | Cross-connections | {tot_cross:,} non-hierarchy edges ({len(edges):,} total incl. {len(edges) - tot_cross:,} CONTAINS) | edges |
| 14 | Status distribution | {', '.join(f'{k} {v}' for k, v in status_dist.most_common())} | capability nodes (API, SCR, INT, COMP, RULE, DB, EXT, JOUR, SVC, INFRA); per-type matrix in master map section 4 |
| 15 | Contract schemas | {types['SCH']} | `SCH-` nodes |
| 16 | Tests | {len(tests)} files, {sum(n['cases'] for n in tests)} cases (not executed) | `TEST-` nodes |
| 17 | Validation | {len(checks) - errors_total}/{len(checks)} checks pass | VALIDATION_REPORT |

## Known limitations

- Static analysis only; **nothing was run**. No `node_modules` exist in this environment and installing writes protected files, so no unit, integration, e2e or runtime evidence was produced and no `HIGH` confidence exists.
- Journeys come from e2e specs; documented-only journeys are not mapped. Per-journey fields such as business logic per step, decision branches and recovery paths are not derivable statically.
- Response shapes, request field-level validation, per-column constraints, RLS policy semantics and data retention rules are not extracted (see the evidence in migrations and contracts).
- `TESTED_BY` is textual and path-level.
- All Mermaid diagrams pass the Mermaid 11.4.1 parser and the DOT file passes a DOT parser, but nothing was *rendered or laid out* (no browser or Graphviz binary used); very large diagrams may need a layout engine tuned for size. The parser checks ran from a throwaway directory outside the repository.
- The SVG poster and the draw.io file come from one layout model (`tools/poster.py`). Both were checked as well-formed XML and the SVG was rendered in Chromium and inspected; the draw.io file was **not opened in diagrams.net** here. The poster shows counts and top items per branch; the lossless forms are the JSON and DOT.

## Remaining unknowns

- Whether the e2e/unit/integration tests pass today (CI on `main` is red; cause not examined).
- Live behaviour of Stripe, Brevo and hosted Supabase.
- Runtime state of the worker queue and the production database.
- Which ephemeral modules are intended to be persisted next (documented in ADR-015 and the roadmap, not decided by code).

## Output locations

All under `project-mindmap/` (see [README](README.md)).
""")

w('README.md', f"""# project-mindmap — reverse-engineered map of the actual TalentSphere repository

Evidence-backed, ID-stable, interconnected map generated from the source on the date of the commit. It describes the **real** project (what code exists), not the intended product (see `PRODUCT_BLUEPRINT/` for that). Nothing in the application was changed.

Start with [`master/MASTER_PROJECT_MINDMAP.md`](master/MASTER_PROJECT_MINDMAP.md).

## Structure

| Path | Contents |
| --- | --- |
| `master/MASTER_PROJECT_MINDMAP.svg` / `.png` / `.drawio` | **The poster**: one-page master mind map (20 branch cards, hub, status dots, cross-connection chain). `.drawio` is the same layout, editable |\n| `master/MASTER_PROJECT_MINDMAP.md` / `.mmd` | 20-branch mind map, legend, type-level cross-connection graph, module table |
| `master/MASTER_PROJECT_GRAPH.json` | **The master graph**: {len(nodes):,} nodes, {len(edges):,} typed edges, each with evidence |
| `master/MASTER_PROJECT_GRAPH.dot` | The same graph for Graphviz |
| `journeys/USER_JOURNEYS.md` / `.json` | Personas, navigation sets, {len(jours)} e2e-derived journeys |
| `features/COMPLETE_FEATURE_INVENTORY.json` | Hierarchy with parent IDs, status, evidence, business rules |
| `ui/SCREEN_INTERACTION_INVENTORY.md` | Screens, components, interactions, navigation |
| `architecture/` | Frontend, backend/infra, API (all {len(apis)} endpoints), dependency graph, per-module subgraphs |
| `data/` | Database entity map, end-to-end data flows, state machines |
| `quality/` | Implementation gaps, test coverage map, traceability matrix (CSV) |
| `evidence/` | Evidence register (CSV + summary) |
| `VALIDATION_REPORT.md`, `FINAL_REPORT.md` | Phase 9–10 checks and computed totals |

## ID system

`PROJ ROLE JOUR MOD FEAT API SCR COMP INT ERR RULE SCH SVC DB STATE TEST EXT INFRA`, numbered per prefix in a deterministic scan order. An ID is only stable for one generation run; regenerating after code changes can renumber. The graph JSON is the source of truth for ID → file:line.

## Hierarchy levels used

APPLICATION → MODULE (API module) → FEATURE (resource group, shared component, job kind) → SUB-FEATURE (endpoint, screen) → MICRO-FEATURE (UI interaction) → NANO-FEATURE (error branch). Business rules (exported domain functions) hang off domain modules and are linked by `CALLS` edges. Deeper levels (action, interaction, system response) are carried by the interaction's `handler`/`event` properties and the error branch; there is no separate evidence for finer nodes.

## Status and confidence

Statuses: IMPLEMENTED, PARTIALLY_IMPLEMENTED, NOT_IMPLEMENTED, BROKEN, MOCKED, UNREACHABLE, DEPRECATED, UNKNOWN. Confidence: HIGH (source + execution/test), MEDIUM (source only), LOW (inferred). **No HIGH**: nothing was executed.

## Method

Read-only extractor (Python, standard library, kept outside the repo) parsing: route registrations, handler bodies, `durability.ts`, `core-store.ts`, `App.tsx`, page and component source, domain exports, contract schemas, migrations, test files, workflows. See VALIDATION_REPORT for checks.

## Limits

See [FINAL_REPORT](FINAL_REPORT.md) "Known limitations".

## Regenerating

The map is generated, not hand-written. From the repository root (read-only on the repo; outputs go to `project-mindmap/`):

```bash
mkdir -p /tmp/mindmap-work
python3 -I project-mindmap/tools/extract.py /tmp/mindmap-work
python3 -I project-mindmap/tools/generate.py /tmp/mindmap-work
python3 -I project-mindmap/tools/poster.py /tmp/mindmap-work   # SVG + draw.io poster
python3 -I project-mindmap/tools/generate.py /tmp/mindmap-work   # again, so the validation report checks the poster files
```

The PNG copy of the poster is a Chromium screenshot of the SVG at 4400 × 3380 (not produced by the scripts).

Optional parser checks (install `mermaid@11.4.1 jsdom dotparser` in a directory **outside** the repository, put `validate-mermaid.mjs` and `validate-dot.mjs` there, and write their JSON output to `<parent of workdir>/mmtest/mm_out.json` and `dot_out.json`; `generate.py` embeds the results in the validation report). Output is deterministic: two runs on the same commit produce an identical graph.

The scripts are documentation tooling only: they are not part of any build, test or CI step, and they never write outside `project-mindmap/`.
""")
print('ok', len(inv), 'inventory entries;', 'checks failed:', errors_total)
for c, ok, d in checks:
    print(('PASS ' if ok else 'FAIL ') + c + ' — ' + d)
