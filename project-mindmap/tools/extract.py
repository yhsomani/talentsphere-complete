#!/usr/bin/env python3
"""Usage: python3 -I project-mindmap/tools/extract.py <workdir>   (then generate.py <workdir>)
Read-only static extractor. Builds graph.json (nodes + edges) from the repo.
Every node carries evidence (file, line, symbol). Nothing is written inside the repo."""
import json, os, re, sys, glob, collections

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
OUT = sys.argv[1]
os.chdir(ROOT)

def read(p):
    with open(p, encoding='utf8', errors='replace') as f:
        return f.read()

def lineno(text, idx):
    return text.count('\n', 0, idx) + 1

nodes = collections.OrderedDict()
edges = []
counters = collections.Counter()

def new_id(prefix):
    counters[prefix] += 1
    return f'{prefix}-{counters[prefix]:03d}' if counters[prefix] < 1000 else f'{prefix}-{counters[prefix]}'

def add_node(prefix, name, **props):
    nid = new_id(prefix)
    nodes[nid] = dict(id=nid, type=prefix, name=name, **props)
    return nid

def add_edge(src, rel, dst, file=None, line=None, note=None):
    edges.append(dict(src=src, rel=rel, dst=dst, file=file, line=line, note=note))

def ev(file, line=None, symbol=None):
    return dict(file=file, line=line, symbol=symbol)

# ------------------------------------------------------------------ project
proj = add_node('PROJ', 'TalentSphere', status='IMPLEMENTED', confidence='MEDIUM',
                evidence=[ev('package.json'), ev('ARCHITECTURE.md')])

apps = {}
for a, desc in [('apps/api', 'Fastify 5 modular-monolith API'),
                ('apps/web', 'React 19 + Vite PWA'),
                ('apps/worker', 'Background-job worker (FOR UPDATE SKIP LOCKED)')]:
    apps[a] = add_node('MOD', a, kind='application', description=desc, evidence=[ev(a)])
    add_edge(proj, 'CONTAINS', apps[a])

# ------------------------------------------------------------------ roles
contracts_txt = read('packages/contracts/src/index.ts')
core_txt = read('packages/domain/src/core.ts')
m = re.search(r"export type Role =(.*?);", core_txt, re.S)
role_names = re.findall(r"'([a-z_]+)'", m.group(1)) if m else []
roles = {}
roles['anonymous'] = add_node('ROLE', 'anonymous', description='No session token', evidence=[ev('apps/web/src/App.tsx')])
for r in role_names:
    roles[r] = add_node('ROLE', r, description='Role in packages/domain core.ts `Role`', evidence=[ev('packages/domain/src/core.ts', lineno(core_txt, m.start()), 'Role')])
roles['worker'] = add_node('ROLE', 'service:worker', description='Background worker process identity (direct DB access, not a session role)', evidence=[ev('apps/worker/src/index.ts')])
for r in roles.values():
    add_edge(proj, 'CONTAINS', r)

# ------------------------------------------------------------------ contract schemas
schemas = {}
for mm in re.finditer(r"^export const (\w+Schema)\b", contracts_txt, re.M):
    schemas[mm.group(1)] = add_node('SCH', mm.group(1), evidence=[ev('packages/contracts/src/index.ts', lineno(contracts_txt, mm.start()), mm.group(1))])
# schema field counts are not parsed: object shapes are nested and would be guessed.

# ------------------------------------------------------------------ domain rules
rules = {}          # symbol -> id
rule_file = {}
dom_files = sorted(glob.glob('packages/domain/src/*.ts'))
domain_mod = {}
for f in dom_files:
    t = read(f)
    base = os.path.basename(f)[:-3]
    if base == 'index':
        continue
    domain_mod[f] = add_node('MOD', f'domain/{base}', kind='domain-module', evidence=[ev(f)])
    add_edge(apps['apps/api'], 'DEPENDS_ON', domain_mod[f], note='package @talentsphere/domain')
    for mm in re.finditer(r"^export (?:async )?function (\w+)|^export const (\w+)\s*(?::[^=]+)?=\s*(?:async\s*)?\(|^export (?:abstract )?class (\w+)", t, re.M):
        sym = mm.group(1) or mm.group(2) or mm.group(3)
        if sym in rules:
            continue
        kind = 'class' if mm.group(3) else 'function'
        rid = add_node('RULE', sym, kind=kind, evidence=[ev(f, lineno(t, mm.start()), sym)])
        rules[sym] = rid
        rule_file[sym] = f
        add_edge(domain_mod[f], 'CONTAINS', rid)
    for mm in re.finditer(r"\bBR-\d{3}\b", t):
        pass

# legacy BR ids cited in domain source (documentation cross-reference only)
br_cites = collections.defaultdict(set)
for f in dom_files:
    t = read(f)
    for mm in re.finditer(r"\bBR-\d{3}\b", t):
        br_cites[os.path.basename(f)].add(mm.group(0))

# ------------------------------------------------------------------ durability
dur_txt = read('apps/api/src/durability.ts')
durable = set(re.findall(r"'((?:GET|POST|PUT|PATCH|DELETE) /[^']+)'", dur_txt))

# ------------------------------------------------------------------ API routes
srv_files = ['apps/api/src/server.ts', 'apps/api/src/billing-stripe.ts']
server_txt = read('apps/api/src/server.ts')
imp_block = re.search(r"import \{(.*?)\} from '@talentsphere/domain';", server_txt, re.S)
domain_imports = set(re.findall(r"\b(\w+)\b", imp_block.group(1))) if imp_block else set()

route_re = re.compile(r"^[ \t]*(?:app|scope)\.(get|post|put|patch|delete)(?:<[^>]*>)?\(\s*(?:\n\s*)?(['\"`])(/[^'\"`]*)\2", re.M)

def banners(t):
    out = []
    lines = t.split('\n')
    i = 0
    while i < len(lines):
        if re.match(r"\s*// ={10,}\s*$", lines[i]):
            j = i + 1
            title = []
            while j < len(lines) and not re.match(r"\s*// ={10,}\s*$", lines[j]) and lines[j].strip().startswith('//'):
                title.append(lines[j].strip()[2:].strip()); j += 1
            if title:
                out.append((i + 1, ' '.join(title)))
            i = j + 1
        else:
            i += 1
    return out

routes = []
route_nodes = {}
route_by_key = {}
for f in srv_files:
    t = read(f)
    bl = banners(t)
    matches = list(route_re.finditer(t))
    for k, mm in enumerate(matches):
        start = mm.start()
        end = matches[k + 1].start() if k + 1 < len(matches) else len(t)
        # cap the final route of a file so trailing helpers are not attributed to it
        body = t[start:end]
        if k + 1 == len(matches):
            cut = re.search(r"\n  // ={10,}|\n  return app;|\n  async function |\n  function ", body[50:])
            if cut:
                body = body[:50 + cut.start()]
        method = mm.group(1).upper()
        path = mm.group(3)
        ln = lineno(t, start)
        sec = ''
        sec_ln = 0
        for bl_ln, title in bl:
            if bl_ln <= ln:
                sec, sec_ln = title, bl_ln
        # preceding comment block
        pre = t[:start].rstrip('\n').split('\n')
        cm = []
        for s in reversed(pre[-8:]):
            if s.strip().startswith('//') and not re.match(r"\s*// ={5,}", s):
                cm.append(s.strip()[2:].strip())
            else:
                break
        desc = ' '.join(reversed(cm))
        full = path if path.startswith('/api/') or path in ('/health', '/ready') else path
        key = f'{method} {full}'
        code_body = re.sub(r"(?m)(^|\s)//.*$", r"\1", body)
        code_body = re.sub(r"/\*.*?\*/", "", code_body, flags=re.S)
        auth = 'public'
        if re.search(r"\bextractUser\(", code_body):
            auth = 'session-required'
        elif re.search(r"\bmaybeExtractUser\(", code_body):
            auth = 'session-optional'
        elif re.search(r"x-talentsphere-signature|stripe-signature|verifyWebhook", code_body):
            auth = 'public-signed-webhook'
        elif re.search(r"\bverifySessionToken\(|\bresolveSession\(", code_body):
            auth = 'session-required'
        role_checks = sorted(set(re.findall(r"roles\.includes\('([a-z_]+)'\)", body)))
        guards = sorted(set(re.findall(r"\b(canViewProfile|requireInterviewParticipant|requireInterviewPanel|canManageJobs|canViewPortfolioProject|canSeeEvidenceInternals|canViewActivity|canTransitionApplication)\(", body)))
        sch = sorted(set(re.findall(r"\b([A-Z]\w+Schema)\.(?:parse|safeParse)\(", body)))
        used_rules = sorted({s for s in re.findall(r"\b([a-zA-Z_]\w*)\(", body) if s in rules})
        persist_kinds = sorted(set(re.findall(r"kind:\s*'([A-Za-z]+)'", body)))
        store_calls = sorted(set(re.findall(r"\bstorage\.(\w+)\.(\w+)\(", body)))
        errs = [(e[0], lineno(t, start + e[1])) for e in [(m2.group(1), m2.start()) for m2 in re.finditer(r"new DomainError\(\s*'([A-Z_]+)'", body)]]
        err_msgs = []
        for m2 in re.finditer(r"new DomainError\(\s*'([A-Z_]+)'\s*,\s*(['\"`])((?:(?!\2).)*)\2", body, re.S):
            err_msgs.append((m2.group(1), m2.group(3)[:140].replace('\n', ' '), lineno(t, start + m2.start())))
        statuses = sorted(set(re.findall(r"\.status\((\d{3})\)", body)))
        rl = re.search(r"config:\s*(\w+)", body[:600])
        has_rl = bool(re.search(r"rateLimit", body[:900]))
        dispatches = sorted(set(re.findall(r"dispatchJob\(\s*\{\s*type:\s*'([^']+)'", body)))
        flags = sorted(set(re.findall(r"featureFlag\w*\(\s*'([^']+)'|isFeatureEnabled\(\s*'([^']+)'", body)))
        idem = bool(re.search(r"[Ii]dempotency", body))
        env_gated = bool(re.search(r"NODE_ENV\s*!==\s*'development'", code_body))
        todo = bool(re.search(r"\b(TODO|FIXME|NOT_IMPLEMENTED|placeholder|mock\b|stub\b)", body, re.I))
        fids = sorted(set(re.findall(r"\bF-\d{2,3}\b", sec + ' ' + desc)))
        r = dict(method=method, path=full, file=f, line=ln, endLine=lineno(t, start) + body.count('\n'),
                 section=sec, section_line=sec_ln, comment=desc, auth=auth, roles=role_checks, guards=guards,
                 schemas=sch, rules=used_rules, persist_kinds=persist_kinds, store_calls=[f'{a}.{b}' for a, b in store_calls],
                 errors=err_msgs, statuses=statuses, rate_limit=has_rl, idempotency=idem, todo=todo, fids=fids,
                 durable=key in durable, lines=body.count('\n') + 1, key=key, dispatches=dispatches, env_gated=env_gated)
        routes.append(r)

_seen = collections.Counter(r['key'] for r in routes)
for r in routes:
    r['variant'] = None
    if _seen[r['key']] > 1 and r['file'] == 'apps/api/src/server.ts':
        r['variant'] = 'billing disabled-mode stub (stripeOff)'
        r['key'] = r['key'] + ' [disabled-mode]'
    elif _seen[r['key']] > 1:
        r['variant'] = 'billing stripe-mode handler'
# canonical /api/v1 prefix handling for billing-stripe (paths may be relative)
segment_re = re.compile(r"^/(?:api/v1/)?([^/:]+)(?:/([^/:]+))?")

mod_nodes = {}
feat_nodes = {}
for r in routes:
    p = r['path']
    q = p[len('/api/v1'):] if p.startswith('/api/v1') else p
    parts = [s for s in q.split('/') if s]
    first = parts[0] if parts else 'root'
    second = None
    for s in parts[1:]:
        if not s.startswith(':'):
            second = s
            break
    r['module'] = first
    r['feature'] = f'{first}/{second}' if second else first
    if first not in mod_nodes:
        mod_nodes[first] = add_node('MOD', f'api/{first}', kind='api-module', evidence=[ev(r['file'], r['line'])])
        add_edge(apps['apps/api'], 'CONTAINS', mod_nodes[first])
    fk = r['feature']
    if fk not in feat_nodes:
        feat_nodes[fk] = add_node('FEAT', f'api/{fk}', module=first, evidence=[ev(r['file'], r['line'])])
        add_edge(mod_nodes[first], 'CONTAINS', feat_nodes[fk])
    sid = add_node('API', r['key'], method=r['method'], path=r['path'], purpose=r['comment'] or None,
                   auth=r['auth'], roles=r['roles'], guards=r['guards'], durability='durable' if r['durable'] else 'ephemeral',
                   rate_limit=r['rate_limit'], idempotency=r['idempotency'], variant=r['variant'], env_gated=r['env_gated'], section=r['section'], module=first, feature=fk,
                   evidence=[ev(r['file'], r['line'], r['key'])])
    r['id'] = sid
    route_nodes[r['key']] = sid
    add_edge(feat_nodes[fk], 'CONTAINS', sid, r['file'], r['line'])
    for rn in r['roles']:
        if rn in roles:
            add_edge(sid, 'REQUIRES', roles[rn], r['file'], r['line'], 'role check in handler')
    if r['auth'].startswith('public'):
        add_edge(roles['anonymous'], 'AUTHORIZES', sid, r['file'], r['line'], 'no session helper in handler')
    for s in r['schemas']:
        if s in schemas:
            add_edge(sid, 'VALIDATES', schemas[s], r['file'], r['line'])
    for s in r['rules']:
        add_edge(sid, 'CALLS', rules[s], r['file'], r['line'])
    for sc in r['store_calls']:
        pass

# route key -> list for matching (normalised pattern segments)
def segs(path):
    p = path
    if p.startswith('/api/v1'):
        p = p[len('/api/v1'):]
    return [s for s in p.split('?')[0].split('/') if s]

route_index = collections.defaultdict(list)
for r in routes:
    route_index[(r['method'], len(segs(r['path'])))].append(r)

def match_route(method, path):
    s = segs(path)
    best = None
    for r in route_index.get((method, len(s)), []):
        rs = segs(r['path'])
        ok = True
        score = 0
        for a, b in zip(rs, s):
            if a.startswith(':'):
                continue
            if b == '*' or b.startswith(':'):
                continue
            if a != b:
                ok = False
                break
            score += 1
        if ok and (best is None or score > best[0] or (score == best[0] and '[disabled-mode]' in best[1]['key'] and '[disabled-mode]' not in r['key'])):
            best = (score, r)
    return best[1] if best else None

# ------------------------------------------------------------------ errors
err_nodes = {}
for r in routes:
    for code, msg, ln in r['errors']:
        k = (code, msg)
        if k not in err_nodes:
            err_nodes[k] = add_node('ERR', f'{code}: {msg[:70]}', code=code, message=msg, sites=[], evidence=[ev(r['file'], ln)])
        nodes[err_nodes[k]]['sites'].append(dict(route=r['key'], line=ln))
        add_edge(r['id'], 'PRODUCES', err_nodes[k], r['file'], ln)

# ------------------------------------------------------------------ web
web_files = sorted(glob.glob('apps/web/src/**/*.ts*', recursive=True))
app_txt = read('apps/web/src/App.tsx')
routes_web = []
for mm in re.finditer(r"<Route\s+(index|path=\"([^\"]*)\")\s+element=\{(.*?)\}\s*/>", app_txt):
    path = '/' if mm.group(1) == 'index' else '/' + mm.group(2).lstrip('/')
    el = mm.group(3)
    comp = re.search(r"<(\w+Page)\s*/>", el)
    routes_web.append(dict(path=path, comp=comp.group(1) if comp else None, guarded='guarded(' in el, line=lineno(app_txt, mm.start())))

screens = {}
comp_nodes = {}
page_files = {os.path.basename(f)[:-4]: f for f in glob.glob('apps/web/src/pages/*.tsx')}
for rw in routes_web:
    comp = rw['comp']
    if not comp:
        continue
    f = page_files.get(comp)
    sid = add_node('SCR', rw['path'], component=comp, guarded=rw['guarded'], file=f,
                   evidence=[ev('apps/web/src/App.tsx', rw['line'], comp), ev(f, 1, comp)])
    screens[comp] = dict(id=sid, route=rw['path'], file=f, guarded=rw['guarded'])
    add_edge(apps['apps/web'], 'CONTAINS', sid)
    if rw['guarded']:
        add_edge(roles['anonymous'], 'BLOCKED_BY', sid, 'apps/web/src/App.tsx', rw['line'], 'RequireAuth redirects to /login')
        for rn in roles:
            if rn not in ('anonymous',):
                add_edge(roles[rn], 'AUTHORIZES', sid, 'apps/web/src/App.tsx', rw['line'], 'session token present (client-side gate only)')
    else:
        add_edge(roles['anonymous'], 'AUTHORIZES', sid, 'apps/web/src/App.tsx', rw['line'])

# shared components (named exports of component files)
comp_files = sorted(glob.glob('apps/web/src/components/**/*.tsx', recursive=True))
for f in comp_files:
    t = read(f)
    for mm in re.finditer(r"^export (?:const|function) ([A-Z]\w+)", t, re.M):
        nm = mm.group(1)
        if nm in comp_nodes: continue
        comp_nodes[nm] = add_node('COMP', nm, file=f, evidence=[ev(f, lineno(t, mm.start()), nm)])
        add_edge(apps['apps/web'], 'CONTAINS', comp_nodes[nm])

EVENT_KIND = {'onClick': 'click', 'onSubmit': 'submit', 'onChange': 'change', 'onKeyDown': 'keyboard', 'onKeyUp': 'keyboard',
              'onBlur': 'blur', 'onFocus': 'focus', 'onInput': 'input', 'onToggle': 'toggle', 'onClose': 'close',
              'onSelect': 'select', 'onDrop': 'drop', 'onDragOver': 'drag', 'onMouseEnter': 'hover', 'onMouseDown': 'press',
              'onPaste': 'paste', 'onTouchStart': 'touch', 'onTouchEnd': 'touch', 'onContextMenu': 'context-menu', 'onWheel': 'wheel', 'onDragStart': 'drag', 'onDragEnd': 'drag', 'onScroll': 'scroll', 'onCancel': 'cancel', 'onConfirm': 'confirm', 'onRetry': 'retry'}

FN_SPANS = {}
web_calls = []   # (file, line, method, path, enclosing)
web_nav = []
interactions = []
actions = {}
screen_detail = {}


def match_close(t, i):
    """Index of the bracket matching t[i] ({ ( [), skipping strings/comments/template literals. -1 if none."""
    pairs = {'{': '}', '(': ')', '[': ']'}
    stack = [pairs[t[i]]]
    j = i + 1
    n = len(t)
    while j < n and stack:
        ch = t[j]
        if ch in '\'"':
            q = ch; j += 1
            while j < n and t[j] != q:
                if t[j] == '\\': j += 1
                j += 1
        elif ch == '`':
            j += 1
            while j < n and t[j] != '`':
                if t[j] == '\\': j += 2; continue
                if t[j] == '$' and t[j + 1:j + 2] == '{':
                    k = match_close(t, j + 1)
                    j = k if k > 0 else j + 1
                j += 1
        elif t[j:j + 2] == '//':
            j = t.find('\n', j)
            if j < 0: return -1
        elif t[j:j + 2] == '/*':
            j = t.find('*/', j)
            if j < 0: return -1
            j += 1
        elif ch in pairs:
            stack.append(pairs[ch])
        elif ch == stack[-1]:
            stack.pop()
            if not stack: return j
        j += 1
    return -1

FN_DEF = re.compile(r"^[ \t]*(?:export\s+)?(?:(?:async\s+)?function\s+(\w+)\s*(?:<[^>]*>)?\(|(?:const|let)\s+(\w+)\s*(?::[^=\n]+)?=\s*(?:useCallback\(\s*|React\.memo\(\s*)?(?:async\s*)?(?:function\b[^(\n]*\(|\(|\w+\s*=>))", re.M)

def fn_spans_of(t):
    spans = []
    for m in FN_DEF.finditer(t):
        name = m.group(1) or m.group(2)
        # find the body: first '{' or '=>' expression after the parameter list
        k = m.end() - 1
        if t[k] == '(':
            close = match_close(t, k)
            if close < 0: continue
            k = close + 1
        # skip return type annotation
        arrow = re.compile(r"\s*(?::[^={]+)?(?:=>)?\s*").match(t, k)
        k = arrow.end() if arrow else k
        if k < len(t) and t[k] == '{':
            e = match_close(t, k)
            if e < 0: continue
        else:
            e = min(len(t), k + 500)
        spans.append((name, lineno(t, m.start()), lineno(t, e), m.start(), e))
    return spans

def innermost(spans, line):
    best = None
    for sp in spans:
        if sp[1] <= line <= sp[2]:
            if best is None or (sp[2] - sp[1]) < (best[2] - best[1]):
                best = sp
    return best

def enclosing(lines, idx):
    ind = len(lines[idx]) - len(lines[idx].lstrip())
    for j in range(idx, -1, -1):
        l = lines[j]
        m2 = re.match(r"^(\s*)(?:export\s+)?(?:const|let|async function|function)\s+(\w+)", l)
        if m2 and len(m2.group(1)) < ind:
            return m2.group(2), j + 1
    return None, None

for f in web_files:
    t = read(f)
    lines = t.split('\n')
    # API literals (template literals may nest ${...} containing backticks)
    for mm in re.finditer(r"(['\"`])(/api/v1/)", t):
        q = mm.group(1)
        i = mm.start() + 1
        depth = 0
        out = []
        while i < len(t):
            ch = t[i]
            if depth == 0:
                if ch == q: break
                if q == '`' and ch == '$' and t[i + 1:i + 2] == '{':
                    depth = 1; out.append(':p'); i += 2; continue
                out.append(ch)
            else:
                if ch == '{': depth += 1
                elif ch == '}': depth -= 1
            i += 1
        raw = ''.join(out)
        ln = lineno(t, mm.start())
        rest = t[i: i + 300]
        nxt = re.search(r"apiJson|apiFetch|/api/v1/", rest[1:])
        rest = rest[: nxt.start() + 1] if nxt else rest
        mth = re.search(r"method:\s*['\"](GET|POST|PUT|PATCH|DELETE)['\"]", rest)
        method = mth.group(1) if mth else 'GET'
        p_ = raw.split('?')[0]
        p_ = re.sub(r"(?<=[a-z0-9-]):p$", '', p_)
        _sp = innermost(FN_SPANS.setdefault(f, fn_spans_of(t)), ln)
        enc, enc_ln = (_sp[0], _sp[1]) if _sp else (None, None)
        web_calls.append(dict(file=f, line=ln, method=method, explicit_method=bool(mth), path=p_, enclosing=enc, enc_line=enc_ln))
    for mm in re.finditer(r"(?:<Link\b[^>]*\bto=|<NavLink\b[^>]*\bto=|<Navigate\b[^>]*\bto=|navigate\()\s*[\{\"'`]\s*[\"'`]?(/[a-zA-Z0-9/_:\-\.]*)", t):
        web_nav.append(dict(file=f, line=lineno(t, mm.start()), to=mm.group(1)))
    if f.startswith(('apps/web/src/pages/', 'apps/web/src/components/', 'apps/web/src/lib/', 'apps/web/src/pwa')):
        for mm in re.finditer(r"\b(window|document|navigator\.serviceWorker)\.addEventListener\(\s*['\"]?(\w+)", t):
            interactions.append(dict(file=f, line=lineno(t, mm.start()), attr='addEventListener', kind=f'listener:{mm.group(2)}', handler=None, listener=True))
        for mm in re.finditer(r"\b(on[A-Z]\w+)=\{", t):
            attr = mm.group(1)
            if attr not in EVENT_KIND:
                continue
            b = mm.end() - 1
            e = match_close(t, b)
            expr = t[b + 1: e].strip() if e > 0 else ''
            nm = expr if re.fullmatch(r"\w+", expr) else None
            interactions.append(dict(file=f, line=lineno(t, mm.start()), attr=attr, kind=EVENT_KIND[attr], handler=nm,
                                     expr_span=(lineno(t, b), lineno(t, e if e > 0 else b)), expr=expr[:200]))

# screen detail
for comp, sc in screens.items():
    f = sc['file']
    t = read(f)
    d = {}
    d['buttons'] = len(re.findall(r"<(?:Button|button)\b", t))
    d['forms'] = len(re.findall(r"<form\b", t))
    d['inputs'] = len(re.findall(r"<(?:Input|input|select|textarea|Field)\b", t))
    d['modals'] = len(re.findall(r"<Modal\b", t))
    d['loading_state'] = bool(re.search(r"\b(loading|isLoading|pending)\b", t))
    d['empty_state'] = 'EmptyState' in t
    d['error_state'] = bool(re.search(r"LoadError|<Notice|setError|errorMessage", t))
    d['uses_components'] = sorted(set(n for n in comp_nodes if re.search(rf"<{n}\b", t)))
    sc['detail'] = d
    for n in d['uses_components']:
        add_edge(sc['id'], 'DEPENDS_ON', comp_nodes[n], f, None, 'JSX usage')
    nodes[sc['id']].update(d)

# components dependency from component files calling API
file_to_screen = {sc['file']: sc['id'] for sc in screens.values()}
file_to_comp = {}
for nm, cid in comp_nodes.items():
    file_to_comp.setdefault(nodes[cid]['file'], []).append(cid)

# API call edges
bad_calls = []
call_nodes = {}
for c in web_calls:
    r = match_route(c['method'], c['path'])
    c['method_inferred'] = False
    if not r and not c.get('explicit_method'):
        for alt in ('POST', 'PATCH', 'PUT', 'DELETE'):
            r = match_route(alt, c['path'])
            if r:
                c['method'] = alt; c['method_inferred'] = True
                break
    c['route'] = r['key'] if r else None
    src = file_to_screen.get(c['file'])
    if not src and c['file'] in file_to_comp:
        src = file_to_comp[c['file']][0]
    c['src'] = src
    if r:
        if src:
            add_edge(src, 'CALLS', r['id'], c['file'], c['line'], f"{c['method']} {c['path']}")
    else:
        bad_calls.append(c)

# Interactions -> INT nodes with handler->api link (direct span, or one hop through a local function)
for f in {c['file'] for c in web_calls}:
    FN_SPANS.setdefault(f, fn_spans_of(read(f)))
calls_by_file = collections.defaultdict(list)
for c in web_calls:
    if c['route']:
        calls_by_file[c['file']].append(c)
def calls_in_span(f, a, b):
    return [c for c in calls_by_file.get(f, []) if a <= c['line'] <= b]
for it in interactions:
    owner = file_to_screen.get(it['file']) or (file_to_comp.get(it['file']) or [None])[0]
    if not owner and it.get('listener'):
        owner = apps['apps/web']
    if not owner:
        continue
    f = it['file']
    spans = FN_SPANS.setdefault(f, fn_spans_of(read(f)))
    api_calls = []
    via = 'none'
    if not it.get('listener'):
        if it['handler']:
            defs = [sp for sp in spans if sp[0] == it['handler']]
            rng = [(d[1], d[2]) for d in defs]
        else:
            rng = [it['expr_span']]
        text_lines = read(f).split('\n')
        for a, b in rng:
            direct = calls_in_span(f, a, b)
            if direct:
                api_calls += direct; via = 'direct'
            body = '\n'.join(text_lines[a - 1:b])
            for sp in spans:
                if sp[0] in (it['handler'],) or (sp[1] >= a and sp[2] <= b):
                    continue
                if re.search(rf"\b{re.escape(sp[0])}\s*\(", body):
                    hop = calls_in_span(f, sp[1], sp[2])
                    if hop:
                        api_calls += hop
                        if via == 'none': via = 'one-hop'
    seen_k = set(); uniq = []
    for c in api_calls:
        if c['route'] not in seen_k:
            seen_k.add(c['route']); uniq.append(c)
    api_calls = uniq
    nm = f"{it['kind']}:{it['handler'] or 'inline'}"
    iid = add_node('INT', nm, kind=it['kind'], handler=it['handler'], owner=owner, link=via,
                   persists_via_api=[x['route'] for x in api_calls], evidence=[ev(it['file'], it['line'], it['attr'])])
    it['id'] = iid
    add_edge(owner, 'CONTAINS', iid, it['file'], it['line'])
    for x in api_calls:
        add_edge(iid, 'CALLS', route_nodes[x['route']], x['file'], x['line'])
        add_edge(iid, 'TRIGGERS', route_nodes[x['route']], x['file'], x['line'], f'handler performs this request ({via})')

# navigation edges
def resolve_screen(path):
    for rw in routes_web:
        rp = rw['path']
        if rp == '*': continue
        a = [s for s in rp.split('/') if s]; b = [s for s in path.split('/') if s]
        if len(a) == len(b) and all(x.startswith(':') or x == y or y.startswith(':') for x, y in zip(a, b)):
            return screens.get(rw['comp'])
    return None

nav_seen = set()
unresolved_nav = []
for n in web_nav:
    src = file_to_screen.get(n['file']) or (file_to_comp.get(n['file']) or [None])[0]
    dst = resolve_screen(n['to'])
    if src and dst:
        k = (src, dst['id'])
        if k not in nav_seen:
            nav_seen.add(k)
            add_edge(src, 'NAVIGATES_TO', dst['id'], n['file'], n['line'])
    elif src and n['to'] not in ('/',):
        unresolved_nav.append(n)

# ------------------------------------------------------------------ worker / jobs
worker_files = sorted(glob.glob('apps/worker/src/**/*.ts', recursive=True))
bg_txt = read('packages/domain/src/background-jobs.ts')
dk = re.search(r"DISPATCH_EVENT_KINDS\s*=\s*\[(.*?)\]", bg_txt, re.S)
dispatch_kinds = re.findall(r"'([^']+)'", dk.group(1)) if dk else []
worker_mod = apps['apps/worker']
job_kinds = {}
worker_txt = read('apps/worker/src/index.ts')
email_kinds = set(re.findall(r"claimHandlers\.set\(\s*'([^']+)'", worker_txt))
for k in dispatch_kinds:
    is_email = k in email_kinds
    job_kinds[k] = add_node('SVC', f'job:{k}', kind='background-job',
                            handler='email delivery' if is_email else 'recordEvent (no-op: marks the event recorded)',
                            status='IMPLEMENTED' if is_email else 'PARTIALLY_IMPLEMENTED', confidence='MEDIUM',
                            note=None if is_email else 'Completing the job means "recorded", not "delivered" (apps/worker/src/index.ts header comment).',
                            evidence=[ev('packages/domain/src/background-jobs.ts', lineno(bg_txt, dk.start()), 'DISPATCH_EVENT_KINDS'), ev('apps/worker/src/index.ts', 100 if is_email else 42, 'claimHandlers')])
    add_edge(worker_mod, 'CONTAINS', job_kinds[k])
email_tpl_txt = read('apps/worker/src/email/templates.ts')
email_templates = sorted(set(re.findall(r"^\s*['\"]?([a-z][a-z_\-\.]+)['\"]?\s*:\s*\{", email_tpl_txt, re.M)))

# ------------------------------------------------------------------ migrations / DB
tables = {}
table_cols = {}
fk_edges = []
policies = collections.Counter(); indexes = collections.Counter(); triggers = []; functions = []; views = []; enums = []
rls_tables = set()
mig_nodes = {}
for f in sorted(glob.glob('supabase/migrations/*.sql')):
    t = read(f)
    base = os.path.basename(f)
    mid = add_node('MOD', f'migration/{base[:-4]}', kind='migration', evidence=[ev(f)])
    mig_nodes[base] = mid
    add_edge(proj, 'CONTAINS', mid)
    for mm in re.finditer(r"CREATE TABLE(?: IF NOT EXISTS)?\s+(?:public\.)?(\w+)\s*\((.*?)\n\);", t, re.S | re.I):
        name = mm.group(1)
        body = mm.group(2)
        cols = []
        for l in body.split('\n'):
            l = l.strip().rstrip(',')
            cm = re.match(r"^(\w+)\s+([A-Za-z_\[\]\(\), 0-9]+?)(?:\s+(?:NOT NULL|NULL|DEFAULT|PRIMARY|REFERENCES|UNIQUE|CHECK|GENERATED)\b.*)?$", l)
            if cm and cm.group(1).upper() not in ('PRIMARY', 'CONSTRAINT', 'UNIQUE', 'CHECK', 'FOREIGN', 'EXCLUDE'):
                cols.append((cm.group(1), cm.group(2).strip().split(' ')[0]))
        if name in tables:
            continue
        refs = re.findall(r"REFERENCES\s+(?:public\.|auth\.)?(\w+)", body)
        tid = add_node('DB', name, kind='table', columns=len(cols), column_names=[c[0] for c in cols], references=sorted(set(refs)),
                       created_in=base, evidence=[ev(f, lineno(t, mm.start()), name)])
        tables[name] = tid
        table_cols[name] = cols
        add_edge(mig_nodes[base], 'CREATES', tid, f, lineno(t, mm.start()))
        for rname in set(refs):
            fk_edges.append((name, rname, f, lineno(t, mm.start())))
    for mm in re.finditer(r"ALTER TABLE\s+(?:IF EXISTS\s+)?(?:public\.)?(\w+)\s+ENABLE ROW LEVEL SECURITY", t, re.I):
        rls_tables.add(mm.group(1))
    for mm in re.finditer(r"CREATE POLICY\s+\"?([^\"\s]+)\"?\s+ON\s+(?:public\.)?(\w+)", t, re.I):
        policies[mm.group(2)] += 1
    for mm in re.finditer(r"CREATE (?:UNIQUE )?INDEX(?: IF NOT EXISTS)?\s+(\w+)\s+ON\s+(?:public\.)?(\w+)", t, re.I):
        indexes[mm.group(2)] += 1
    for mm in re.finditer(r"CREATE (?:OR REPLACE )?TRIGGER\s+(\w+)|CREATE TRIGGER\s+(\w+)", t, re.I):
        triggers.append((mm.group(1) or mm.group(2), base))
    for mm in re.finditer(r"CREATE (?:OR REPLACE )?FUNCTION\s+(?:public\.)?(\w+)", t, re.I):
        functions.append((mm.group(1), base))
    for mm in re.finditer(r"CREATE (?:OR REPLACE )?VIEW\s+(?:public\.)?(\w+)", t, re.I):
        views.append((mm.group(1), base))
    for mm in re.finditer(r"CREATE TYPE\s+(\w+)\s+AS ENUM\s*\((.*?)\)", t, re.S | re.I):
        enums.append((mm.group(1), re.findall(r"'([^']+)'", mm.group(2)), base))
    # added columns
    for mm in re.finditer(r"ALTER TABLE\s+(?:IF EXISTS\s+)?(?:public\.)?(\w+)\s+ADD COLUMN(?: IF NOT EXISTS)?\s+(\w+)", t, re.I):
        if mm.group(1) in table_cols:
            table_cols[mm.group(1)].append((mm.group(2), '?'))
            nodes[tables[mm.group(1)]]['columns'] += 1
for (a, b, f, ln) in fk_edges:
    if a in tables and b in tables:
        add_edge(tables[a], 'DEPENDS_ON', tables[b], f, ln, 'foreign key REFERENCES')
for name, tid in tables.items():
    nodes[tid]['rls'] = name in rls_tables
    nodes[tid]['policies'] = policies.get(name, 0)
    nodes[tid]['indexes'] = indexes.get(name, 0)

# store source files -> tables (CRUD by SQL verb)
store_files = sorted(set(glob.glob('apps/api/src/storage/*.ts') + glob.glob('packages/domain/src/*.ts') + glob.glob('apps/worker/src/**/*.ts', recursive=True) + glob.glob('apps/api/src/*.ts')))
store_nodes = {}
table_use = collections.defaultdict(lambda: collections.defaultdict(set))   # table -> verb -> files
for f in store_files:
    t = read(f)
    if not re.search(r"\b(?:SELECT|INSERT|UPDATE|DELETE)\b", t):
        continue
    found = False
    for mm in re.finditer(r"\bINSERT\s+INTO\s+(?:public\.)?(\w+)|\bUPDATE\s+(?:public\.)?(\w+)\s+SET|\bDELETE\s+FROM\s+(?:public\.)?(\w+)|\b(?:FROM|JOIN)\s+(?:public\.)?(\w+)", t, re.I | re.S):
        if mm.group(1): verb, tb = 'WRITES', mm.group(1)
        elif mm.group(2): verb, tb = 'UPDATES', mm.group(2)
        elif mm.group(3): verb, tb = 'WRITES', mm.group(3)
        else: verb, tb = 'READS', mm.group(4)
        if tb in tables:
            table_use[tb][verb].add(f)
            found = True
    if found and f not in store_nodes:
        store_nodes[f] = add_node('SVC', os.path.relpath(f, '.'), kind='data-access', evidence=[ev(f)])
        add_edge(mod_nodes.get('x', apps['apps/api']) if f.startswith('apps/api') else (worker_mod if f.startswith('apps/worker') else domain_mod.get(f, proj)), 'CONTAINS', store_nodes[f])
for tb, verbs in table_use.items():
    for verb, fs in verbs.items():
        for f in fs:
            add_edge(store_nodes[f], verb, tables[tb], f, None, 'SQL verb found in source')
# route -> store (storage.<x>) edges
storage_prop_file = {'core': 'apps/api/src/storage/core-store.ts', 'accountMetadata': 'apps/api/src/storage/account-store.ts',
                     'erasureRequests': 'apps/api/src/storage/erasure-store.ts', 'savedSearches': 'apps/api/src/storage/saved-search-store.ts',
                     'savedJobs': 'apps/api/src/storage/saved-job-store.ts', 'adminAudit': 'apps/api/src/storage/admin-audit-store.ts',
                     'featureFlags': 'apps/api/src/storage/feature-flag-store.ts', 'billing': 'apps/api/src/storage/billing-store.ts',
                     'jobs': 'packages/domain/src/background-jobs.ts'}
for r in routes:
    targets = set()
    for sc in r['store_calls']:
        prop = sc.split('.')[0]
        f = storage_prop_file.get(prop)
        if f in store_nodes:
            targets.add(f)
    if r['persist_kinds'] or 'persist(' in read(r['file']).split('\n')[r['line'] - 1: r['endLine']].__str__():
        if 'apps/api/src/storage/core-store.ts' in store_nodes:
            targets.add('apps/api/src/storage/core-store.ts')
    for f in targets:
        add_edge(r['id'], 'CALLS', store_nodes[f], r['file'], r['line'], 'persistence boundary')


# ---- core-store: persist kind -> tables and SQL verbs
cs_txt = read('apps/api/src/storage/core-store.ts')
kind_tables = {}
cs_cases = list(re.finditer(r"^\s{4}case '([A-Za-z]+)':", cs_txt, re.M))
for i, cm in enumerate(cs_cases):
    blk = cs_txt[cm.start(): cs_cases[i + 1].start() if i + 1 < len(cs_cases) else len(cs_txt)]
    # cap last block at next top-level function
    cut = re.search(r"\n\}\n", blk)
    if cut: blk = blk[:cut.start()]
    d = collections.defaultdict(set)
    for m2 in re.finditer(r"INSERT INTO\s+(?:public\.)?(\w+)", blk): d[m2.group(1)].add('C')
    for m2 in re.finditer(r"UPDATE\s+(?:public\.)?(\w+)\s+SET", blk): d[m2.group(1)].add('U')
    for m2 in re.finditer(r"ON CONFLICT[^)]*\)\s*DO UPDATE", blk): pass
    for m2 in re.finditer(r"DELETE FROM\s+(?:public\.)?(\w+)", blk): d[m2.group(1)].add('D')
    if d:
        kind_tables.setdefault(cm.group(1), {})
        for tb, vs in d.items():
            kind_tables[cm.group(1)].setdefault(tb, set()).update(vs)
known_kinds = set(re.findall(r"\{ kind: '([A-Za-z]+)'", cs_txt))
for r in routes:
    r['persist_kinds'] = [k for k in r['persist_kinds'] if k in known_kinds]
for r in routes:
    seen_t = set()
    for k in r['persist_kinds']:
        for tb, vs in kind_tables.get(k, {}).items():
            if tb in tables and (k, tb) not in seen_t:
                seen_t.add((k, tb))
                add_edge(r['id'], 'WRITES', tables[tb], r['file'], r['line'], f"via persist kind '{k}' ({''.join(sorted(vs))}) in core-store.ts")
    r['tables_written'] = sorted({tb for (k, tb) in seen_t})

# ------------------------------------------------------------------ state machines
states = {}
state_edges = []
for f in sorted(glob.glob('packages/domain/src/*.ts')) + ['packages/contracts/src/index.ts']:
    t = read(f)
    for mm in re.finditer(r"^export type (\w*(?:State|Status|Stage|Phase)\w*)\s*=\s*((?:\s*\|?\s*'[^']+')+)\s*;", t, re.M):
        nm = mm.group(1)
        vals = re.findall(r"'([^']+)'", mm.group(2))
        if nm in states: continue
        states[nm] = add_node('STATE', nm, values=vals, kind='union-type', evidence=[ev(f, lineno(t, mm.start()), nm)])
    for mm in re.finditer(r"^export const (\w*TRANSITIONS\w*)[^=]*=\s*\{(.*?)\n\};", t, re.M | re.S):
        nm = mm.group(1)
        trans = {}
        for lm in re.finditer(r"^\s*(\w+):\s*\[(.*?)\]", mm.group(2), re.M):
            trans[lm.group(1)] = re.findall(r"'([^']+)'", lm.group(2))
        sid = add_node('STATE', nm, values=sorted(trans), kind='transition-table', transitions=trans, evidence=[ev(f, lineno(t, mm.start()), nm)])
        states[nm] = sid
        for a, bs in trans.items():
            for b in bs:
                state_edges.append((nm, a, b))
    cur_schema = None
    for mm in re.finditer(r"^export const (\w+Schema)\b|\b(\w*(?:status|state|stage)\w*):\s*z\.enum\(\[(.*?)\]", t, re.M | re.S | re.I):
        if mm.group(1):
            cur_schema = mm.group(1); continue
        field = mm.group(2); vals = re.findall(r"'([^']+)'", mm.group(3))
        nm = f'{cur_schema}.{field}'
        if nm in states or not vals: continue
        states[nm] = add_node('STATE', nm, values=vals, kind='contract-enum', evidence=[ev(f, lineno(t, mm.start()), nm)])
pg_enums = {}
for nm, vals, base in enums:
    pg_enums[nm] = add_node('STATE', f'pg:{nm}', values=vals, kind='postgres-enum', evidence=[ev(f'supabase/migrations/{base}', None, nm)])

# ------------------------------------------------------------------ tests
test_nodes = {}
test_info = {}
test_dirs = ['tests/unit', 'tests/integration', 'tests/security', 'tests/pg', 'tests/e2e', 'scripts/tests']
for d in test_dirs:
    for f in sorted(glob.glob(f'{d}/**/*.*', recursive=True)):
        if not re.search(r"\.(test|spec)\.(ts|mjs)$", f):
            continue
        t = read(f)
        cases = re.findall(r"^\s*(?:it|test)(?:\.\w+)?\(\s*(['\"`])((?:(?!\1).)*)\1", t, re.M)
        n_desc = len(re.findall(r"^\s*describe(?:\.\w+)?\(", t, re.M))
        tid = add_node('TEST', f, category=d, cases=len(cases), suites=n_desc,
                       evidence=[ev(f, 1)])
        test_nodes[f] = tid
        test_info[f] = dict(text=t, cases=[c[1] for c in cases])

path_lits = {}
for f, info in test_info.items():
    path_lits[f] = info['text']

def route_regex(path):
    p = path[len('/api/v1'):] if path.startswith('/api/v1') else path
    parts = [s for s in p.split('/') if s]
    if not parts: return None
    rx = ''
    for s in parts:
        if s.startswith(':'):
            rx += r"/(?:[^/\s'\"`?]+|\$\{[^}]*\})"
        else:
            rx += '/' + re.escape(s)
    return re.compile(rx + r"(?=['\"`?\s/)]|$)" if False else rx + r"(?:['\"`?\s)]|$)")

method_markers = {
    'GET': [r"\.get\(", r"method:\s*['\"]GET['\"]", r"\bGET\b"],
    'POST': [r"\.post\(", r"method:\s*['\"]POST['\"]", r"\bPOST\b"],
    'PUT': [r"\.put\(", r"method:\s*['\"]PUT['\"]", r"\bPUT\b"],
    'PATCH': [r"\.patch\(", r"method:\s*['\"]PATCH['\"]", r"\bPATCH\b"],
    'DELETE': [r"\.delete\(", r"method:\s*['\"]DELETE['\"]", r"\bDELETE\b"],
}
route_tests = collections.defaultdict(set)
mm_re = {m_: re.compile('|'.join(v)) for m_, v in {
    'GET': [r"\.get\(", r"method:\s*['\"]GET['\"]", r"\bGET\b"],
    'POST': [r"\.post\(", r"method:\s*['\"]POST['\"]", r"\bPOST\b"],
    'PUT': [r"\.put\(", r"method:\s*['\"]PUT['\"]", r"\bPUT\b"],
    'PATCH': [r"\.patch\(", r"method:\s*['\"]PATCH['\"]", r"\bPATCH\b"],
    'DELETE': [r"\.delete\(", r"method:\s*['\"]DELETE['\"]", r"\bDELETE\b"]}.items()}
for r in routes:
    rx = route_regex(r['path'])
    if not rx: continue
    base_key = r['key'].replace(' [disabled-mode]', '')
    for f, t in path_lits.items():
        for hit in rx.finditer(t):
            win = t[max(0, hit.start() - 140): hit.start() + 40]
            win2 = t[hit.start(): hit.end() + 220]
            if mm_re[r['method']].search(win) or (r['method'] == 'GET' and not re.search(r"method:\s*['\"](?:POST|PUT|PATCH|DELETE)|\.(?:post|put|patch|delete)\(", win + win2[:120])):
                route_tests[r['key']].add(f)
                break
for k, fs in route_tests.items():
    for f in fs:
        add_edge(route_nodes[k], 'TESTED_BY', test_nodes[f], f, None, 'path literal + method marker found (path-level, not assertion-level)')
rule_tests = collections.defaultdict(set)
for f, info in test_info.items():
    t = info['text']
    for sym in rules:
        if len(sym) > 5 and re.search(rf"\b{re.escape(sym)}\b", t):
            rule_tests[sym].add(f)
for sym, fs in rule_tests.items():
    for f in fs:
        add_edge(rules[sym], 'TESTED_BY', test_nodes[f], f, None, 'symbol referenced in test source')
screen_tests = collections.defaultdict(set)
for comp, sc in screens.items():
    p = sc['route']
    for f, info in test_info.items():
        if not f.startswith('tests/e2e'): continue
        t = info['text']
        pat = re.escape(p) if ':' not in p else re.sub(r":\w+", r"[^/'\"`]+", re.escape(p).replace(r'\:', ':'))
        if re.search(rf"goto\(\s*[`'\"]{pat}(?:[?'\"`/]|\$)|path:\s*'{pat}'", t):
            screen_tests[comp].add(f)
for comp, fs in screen_tests.items():
    for f in fs:
        add_edge(screens[comp]['id'], 'TESTED_BY', test_nodes[f], f, None, 'e2e page.goto to this route')

# ------------------------------------------------------------------ journeys (from e2e tests)
journeys = []
for f in sorted(test_info):
    if not f.startswith('tests/e2e') or not f.endswith('.spec.ts'): continue
    t = test_info[f]['text']
    # test(...) and its modifiers only; test.describe(...) is a group, not a journey
    ms = list(re.finditer(r"^\s*test(?:\.(?:only|skip|fixme|slow|fail))?\(\s*(['\"`])((?:(?!\1).)*)\1", t, re.M))
    for i, mm in enumerate(ms):
        body = t[mm.end(): ms[i + 1].start() if i + 1 < len(ms) else len(t)]
        gotos = re.findall(r"goto\(\s*[`'\"]([^`'\"]+)", body)
        steps = []
        for sm in re.finditer(r"(goto\(\s*[`'\"][^`'\"]+[`'\"]|\.click\(|\.fill\([^)]*\)|getByRole\(\s*'(\w+)'[^)]*\)|expect\([^\n]*|request\.(?:get|post|patch|put|delete)\([^\n]*)", body):
            s = sm.group(1).strip()
            steps.append(s[:150])
        if not gotos and not re.search(r"\.click\(|\.fill\(", body):
            continue
        apis = sorted(set(re.findall(r"/api/v1/[A-Za-z0-9/_:\-\.]+", body) + ['/api/v1/' + x for x in re.findall(r"\$\{API_BASE\}/([A-Za-z0-9/_\-]+)", body)]))
        role_hints = sorted(set(re.findall(r"['\"](candidate|recruiter|hiring_manager|platform_admin|instructor|course_author|institution_admin|moderator|verification_staff)['\"]", body)))
        if re.search(r"signUpRecruiter", body) and 'recruiter' not in role_hints: role_hints.append('recruiter')
        if re.search(r"\bsignUp\(|registerAccount\(", body) and not role_hints: role_hints.append('candidate')
        jid = add_node('JOUR', f'{os.path.basename(f)[:-8]}: {mm.group(2)[:90]}', title=mm.group(2), spec=f, gotos=gotos, steps=steps[:25],
                       api_paths=apis[:20], role_hints=role_hints, derived_from='e2e test',
                       evidence=[ev(f, lineno(t, mm.start()), mm.group(2)[:60])])
        journeys.append(jid)
        add_edge(jid, 'TESTED_BY', test_nodes[f], f, lineno(t, mm.start()), 'journey is defined by this test')
        for g in gotos:
            gp = re.sub(r"\$\{[^}]*\}", ':p', g).split('?')[0]
            dst = resolve_screen(gp)
            if dst:
                add_edge(jid, 'NAVIGATES_TO', dst['id'], f, lineno(t, mm.start()))
        for rn in role_hints:
            if rn in roles:
                add_edge(roles[rn], 'TRIGGERS', jid, f, lineno(t, mm.start()))

# ------------------------------------------------------------------ external integrations
exts = {}
def ext(name, desc, files, status, conf='MEDIUM', note=None):
    exts[name] = add_node('EXT', name, description=desc, status=status, confidence=conf, note=note, evidence=[ev(x) for x in files])
ext('PostgreSQL (pg)', 'Primary store; migrations in supabase/migrations', ['apps/api/src/storage/index.ts', 'scripts/migrate.mjs'], 'IMPLEMENTED')
ext('Stripe', 'Checkout, Customer Portal, signed webhook (BILLING_MODE=stripe only)', ['apps/api/src/stripe-gateway.ts', 'apps/api/src/billing-stripe.ts'], 'PARTIALLY_IMPLEMENTED', note='Active only with BILLING_MODE=stripe; default disabled. Live behaviour not verified here.')
ext('Brevo (email)', 'Transactional email behind provider-independent service', ['apps/worker/src/email/brevo.ts', 'apps/worker/src/email/service.ts'], 'PARTIALLY_IMPLEMENTED', note='Opt-in; dev uses labelled outbox. Live delivery not established by source.')
ext('Service worker / PWA', 'Offline shell and install support', ['apps/web/src/pwa.ts'], 'IMPLEMENTED')
ext('Supabase (hosted Postgres tenancy)', 'Schema/RLS conventions and hosted-migration audit scripts; Supabase Auth is NOT used', ['scripts/hosted-supabase-preflight.mjs', 'supabase/hosted'], 'PARTIALLY_IMPLEMENTED', note='Used as a hosting target for Postgres only.')
ext('Meeting links (technical interview)', 'Interview join URL is constructed from a fixed host string, not a provider API call', ['packages/domain/src/technical-interview.ts'], 'MOCKED', note='URL template only; no provider SDK or API call found.')
for k, v in exts.items():
    add_edge(proj, 'DEPENDS_ON', v)
add_edge(apps['apps/api'], 'DEPENDS_ON', exts['PostgreSQL (pg)']); add_edge(apps['apps/worker'], 'DEPENDS_ON', exts['PostgreSQL (pg)'])
add_edge(apps['apps/api'], 'DEPENDS_ON', exts['Stripe']); add_edge(apps['apps/worker'], 'DEPENDS_ON', exts['Brevo (email)'])
add_edge(apps['apps/web'], 'DEPENDS_ON', exts['Service worker / PWA'])
for k in ('Stripe', 'Brevo (email)'):
    add_edge(exts[k], 'FALLBACK_TO', proj, None, None, 'disabled mode / dev outbox when not configured')

# ------------------------------------------------------------------ infra
infra = {}
for f in sorted(glob.glob('.github/workflows/*.yml')):
    t = read(f)
    jobs = re.findall(r"^  (\w[\w-]*):\s*$", t[t.find('jobs:'):], re.M) if 'jobs:' in t else []
    steps_ = re.findall(r"^\s+- name:\s*(.+)$", t, re.M)
    infra[f] = add_node('INFRA', f, kind='ci-workflow', jobs=jobs, steps=steps_, evidence=[ev(f)])
    add_edge(proj, 'CONTAINS', infra[f])
for d in sorted(glob.glob('deploy/*')):
    infra[d] = add_node('INFRA', d, kind='deployment', files=sorted(os.listdir(d)), evidence=[ev(d)])
    add_edge(proj, 'CONTAINS', infra[d])
for f in sorted(glob.glob('scripts/*.*')):
    infra[f] = add_node('INFRA', f, kind='script', evidence=[ev(f)])
    add_edge(proj, 'CONTAINS', infra[f])
env_txt = read('packages/config/src/env.ts')
env_vars = sorted(set(re.findall(r"^\s{2}([A-Z][A-Z0-9_]+):\s*(?:z\.|optional\(|envBoolean)", env_txt, re.M)))

for r in routes:
    for k in r['dispatches']:
        if k in job_kinds:
            add_edge(r['id'], 'TRIGGERS', job_kinds[k], r['file'], r['line'], 'dispatchJob -> background_jobs')
undeclared_dispatch = sorted({k for r in routes for k in r['dispatches'] if k not in job_kinds})
# ---- navigation sets from Layout.tsx
lay_txt = read('apps/web/src/components/Layout.tsx')
nav_sets = {}
for mm in re.finditer(r"const (\w+_NAV): NavItem\[\] = \[(.*?)\];", lay_txt, re.S):
    nav_sets[mm.group(1)] = [dict(label=a, path=b) for a, b in re.findall(r"label: '([^']+)', path: '([^']+)'", mm.group(2))]
nav_sets['ADMIN (appended for platform_admin)'] = [dict(label='Admin', path='/admin')]
layout_id = comp_nodes.get('Layout')
for nm, items in nav_sets.items():
    for it in items:
        dst = resolve_screen(it['path'])
        if dst and layout_id:
            add_edge(layout_id, 'NAVIGATES_TO', dst['id'], 'apps/web/src/components/Layout.tsx', None, f'{nm}: {it["label"]}')
for fp in ('/jobs', '/checkout', '/privacy', '/terms', '/signup', '/login', '/profile', '/settings', '/notifications'):
    dst = resolve_screen(fp)
    if dst and layout_id:
        add_edge(layout_id, 'NAVIGATES_TO', dst['id'], 'apps/web/src/components/Layout.tsx', None, 'header/footer/account menu link')

# ------------------------------------------------------------------ support modules (files not otherwise evidenced)
pkg_mods = {}
for pk in ('packages/config', 'packages/contracts', 'packages/domain', 'packages/observability', 'packages/testing', 'packages/ui'):
    pkg_mods[pk] = add_node('MOD', pk, kind='package', evidence=[ev(pk)])
    add_edge(proj, 'CONTAINS', pkg_mods[pk])
for a_, b_ in (('apps/api', 'packages/config'), ('apps/api', 'packages/contracts'), ('apps/api', 'packages/domain'), ('apps/web', 'packages/ui'), ('apps/worker', 'packages/domain'), ('apps/worker', 'packages/observability')):
    add_edge(apps[a_], 'DEPENDS_ON', pkg_mods[b_], None, None, 'workspace import found in src')
_ev_files = set()
for n_ in nodes.values():
    for e_ in n_.get('evidence') or []:
        if e_.get('file'): _ev_files.add(e_['file'])
for e_ in edges:
    if e_.get('file'): _ev_files.add(e_['file'])
_tracked = [x for x in os.popen('git ls-files').read().split('\n') if x]
support = {}
for f in _tracked:
    if f in _ev_files or f in test_nodes: continue
    if not re.search(r"\.(ts|tsx|mjs|js|ya?ml|sql)$", f): continue
    if f.startswith(('.playwright', '.agents', 'docs/', 'Yash_', 'PRODUCT_BLUEPRINT', 'project-mindmap', 'graphify-out', 'TalentSphere/', 'BRAIN/')): continue
    if f.startswith('tests/') and re.search(r"\.(test|spec)\.", f): continue
    owner = None
    for pfx, nid in list(apps.items()) + list(pkg_mods.items()):
        if f.startswith(pfx + '/'): owner = nid
    if owner is None: owner = proj
    kind = 'test-support' if f.startswith('tests/') else 'seed-or-sql' if f.endswith('.sql') else 'config-or-build-file' if re.search(r"(vite|vitest|playwright|tsconfig)", f) or f.endswith(('.yaml', '.yml')) else 'support-module'
    support[f] = add_node('SVC', f, kind=kind, evidence=[ev(f)], status='IMPLEMENTED', confidence='MEDIUM', notes=[])
    add_edge(owner, 'CONTAINS', support[f])

# ------------------------------------------------------------------ status classification
def route_status(r):
    notes = []
    status = 'IMPLEMENTED'
    conf = 'MEDIUM'
    has_logic = bool(r['rules'] or r['store_calls'] or r['persist_kinds'] or r['schemas'] or r['errors'] or r['lines'] > 8)
    if r['todo']:
        notes.append('contains TODO/placeholder/mock marker in handler')
    if not has_logic:
        status = 'UNKNOWN'; conf = 'LOW'; notes.append('handler has no detectable logic, schema, store or rule call')
    if not r['durable'] and not r['path'].startswith('/health') and r['path'] not in ('/ready',) and 'health' not in r['path']:
        notes.append('ephemeral: state held in process memory')
    return status, conf, notes

for r in routes:
    st, cf, notes = route_status(r)
    tests = sorted(route_tests.get(r['key'], []))
    n = nodes[r['id']]
    n['status'] = st; n['confidence'] = cf; n['notes'] = notes
    n['tests'] = tests
    n['web_callers'] = sorted({c['file'] for c in web_calls if c['route'] == r['key']})
    n['rules'] = r['rules']; n['schemas'] = r['schemas']; n['persist_kinds'] = r['persist_kinds']; n['store_calls'] = r['store_calls']
    n['statuses'] = r['statuses']; n['fids'] = r['fids']; n['lines'] = r['lines']

edges.sort(key=lambda e: (e['src'], e['rel'], e['dst'], str(e['file']), e['line'] or 0, str(e['note'])))
json.dump(dict(nodes=list(nodes.values()), edges=edges), open(os.path.join(OUT, 'graph_raw.json'), 'w'))
aux = dict(nav_sets=nav_sets, undeclared_dispatch=undeclared_dispatch, kind_tables={k:{t:sorted(v) for t,v in d.items()} for k,d in kind_tables.items()}, state_edges=state_edges, routes=routes, routes_web=routes_web, web_calls=web_calls, bad_calls=bad_calls, unresolved_nav=unresolved_nav,
           interactions=interactions, screen_detail={k: v['detail'] for k, v in screens.items()},
           tables={k: dict(cols=table_cols[k]) for k in table_cols}, rls=sorted(rls_tables), triggers=triggers, functions=functions, views=views,
           enums=enums, env_vars=env_vars, dispatch_kinds=dispatch_kinds, email_templates=email_templates, durable=sorted(durable),
           br_cites={k: sorted(v) for k, v in br_cites.items()}, test_cases={f: v['cases'] for f, v in test_info.items()},
           table_use={k: {v: sorted(fs) for v, fs in d.items()} for k, d in table_use.items()},
           screens={k: dict(id=v['id'], route=v['route'], file=v['file'], guarded=v['guarded']) for k, v in screens.items()},
           policies=dict(policies), indexes=dict(indexes), roles=list(roles.keys()))
json.dump(aux, open(os.path.join(OUT, 'aux.json'), 'w'), default=list)
print('nodes', len(nodes), 'edges', len(edges), 'routes', len(routes), 'screens', len(screens), 'rules', len(rules), 'tables', len(tables), 'tests', len(test_nodes), 'journeys', len(journeys), 'interactions', len(interactions), 'bad_calls', len(bad_calls))
