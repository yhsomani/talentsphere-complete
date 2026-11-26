#!/usr/bin/env python3
"""Usage: python3 -I docs/mindmap/tools/catalog.py <workdir>

Last step of the pipeline (after the second generate.py). Builds the feature-hierarchy layer on top of
the generated master graph and writes it back into master/MASTER_PROJECT_GRAPH.json, so the graph stays
the one canonical dataset. Then writes every view under docs/mindmap/catalog/ from that dataset.

Levels (the deepest level the source supports is used; a level with nothing behind it is skipped,
never padded):
  PROJECT     PROJ-001
  APPLICATION apps/api, apps/web, apps/worker (existing MOD- nodes), APP- for documented-only scope
  MODULE      API module (existing MOD-), web route group, worker job family, documented category (new MOD-)
  MAJOR       API resource group (existing FEAT-), screen or shared component, job kind (new FEAT-),
              documented registry feature (existing F-)
  MINOR       API endpoint capability (MIN-), screen concern (states, data, navigation, one per event kind)
  SUB         endpoint stage: access control, request validation, business rules, persistence,
              background work, responses (SUB-)
  SMALL       one schema, one domain call, one table written, one job dispatched, success / failure set (SML-)
  TINY        one schema field, one screen state, one UI event binding (TNY-)
  NANO        one constraint, one role or guard, one error branch, one status code, one state setter,
              one API request, one navigation target (NANO-)

Every new node carries: id, type, level, name, description, parent_id, status, verification, evidence,
related. `verification`:
  VERIFIED     an executed, passing test file contains the behaviour's own marker (error message text,
               validation message text) or, for a whole endpoint/screen, a passing linked test exists
  PATH_LEVEL   only the parent endpoint or screen is linked to a passing test; the branch itself is not
               asserted by any marker we could find
  NOT_RUN      a test file mentions the marker but has no execution result
  UNKNOWN      no test evidence found

New IDs are kept in master/ID_LEDGER.json under keys starting with `catalog:`; numbers never collide
with enrich.py because both read every value in the ledger.
Read-only on the repository except docs/mindmap/.
"""
import json, os, re, sys, collections, subprocess

SCR = sys.argv[1]
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..'))
OUT = os.path.join(ROOT, 'docs', 'mindmap')
os.chdir(ROOT)
GP = os.path.join(OUT, 'master', 'MASTER_PROJECT_GRAPH.json')
G = json.load(open(GP))
A = json.load(open(f'{SCR}/aux.json'))
LEDGER = os.path.join(OUT, 'master', 'ID_LEDGER.json')
ledger = json.load(open(LEDGER))

# drop a previous catalog layer so the step is idempotent
G['nodes'] = [n for n in G['nodes'] if n.get('layer') != 'feature-hierarchy']
G['edges'] = [e for e in G['edges'] if e.get('layer') != 'feature-hierarchy']
for n in G['nodes']:  # existing nodes adopted by an earlier run
    n.pop('level', None)
    n.pop('parent_id', None)
nodes = {n['id']: n for n in G['nodes']}
base_edges = list(G['edges'])


def read(p):
    return open(p, encoding='utf8', errors='replace').read()


out_e = collections.defaultdict(list)
in_e = collections.defaultdict(list)
for e in base_edges:
    out_e[e['src']].append(e)
    in_e[e['dst']].append(e)


def outs(nid, rel=None, typ=None):
    return [e['dst'] for e in out_e[nid] if (rel is None or e['rel'] == rel) and (typ is None or nodes.get(e['dst'], {}).get('type') == typ)]


def ins(nid, rel=None, typ=None):
    return [e['src'] for e in in_e[nid] if (rel is None or e['rel'] == rel) and (typ is None or nodes.get(e['src'], {}).get('type') == typ)]


def uniq(xs):
    seen, r = set(), []
    for x in xs:
        if x not in seen:
            seen.add(x)
            r.append(x)
    return r


# ------------------------------------------------------------------ ID allocation (shared ledger)
used = collections.defaultdict(set)
for v in ledger['ids'].values():
    p, num = v.rsplit('-', 1)
    used[p].add(int(num))
seen_keys = set()


def nid_for(prefix, key):
    k = f'catalog:{prefix}|{key}'
    if k in seen_keys:
        raise SystemExit(f'duplicate catalog key {k}')
    seen_keys.add(k)
    if k in ledger['ids']:
        return ledger['ids'][k]
    num = max(used[prefix] | {0}) + 1
    used[prefix].add(num)
    i = f'{prefix}-{num:03d}'
    ledger['ids'][k] = i
    return i


new_nodes = []
new_edges = []
LEVELS = ['PROJECT', 'APPLICATION', 'MODULE', 'MAJOR', 'MINOR', 'SUB', 'SMALL', 'TINY', 'NANO']
LEVEL_RANK = {l: i for i, l in enumerate(LEVELS)}
level_of = {}
parent_of = {}
children = collections.defaultdict(list)


def edge(src, rel, dst, note=None):
    new_edges.append(dict(src=src, rel=rel, dst=dst, file=None, line=None, note=note, layer='feature-hierarchy'))


def place(i, level, parent):
    level_of[i] = level
    parent_of[i] = parent
    if parent:
        children[parent].append(i)
        edge(parent, 'CONTAINS', i)


def mk(prefix, key, level, parent, name, description, status, verification, evidence, related=(), **kw):
    i = nid_for(prefix, key)
    n = dict(id=i, type=prefix, level=level, name=name, description=description, parent_id=parent, status=status,
             verification=verification, evidence=evidence, related=uniq(related), layer='feature-hierarchy', notes=[])
    n.update(kw)
    new_nodes.append(n)
    nodes[i] = n
    place(i, level, parent)
    for r in n['related']:
        if r in nodes and r != i:
            edge(i, 'IMPLEMENTED_BY' if nodes[r].get('layer') != 'feature-hierarchy' else 'RELATES_TO', r)
    return i


def adopt(i, level, parent):
    """Existing node joins the hierarchy (no new ID)."""
    n = nodes[i]
    n['level'] = level
    n['parent_id'] = parent
    place(i, level, parent)


def ev(file, line=None, symbol=None):
    return [dict(file=file, line=line, symbol=symbol)]


# ------------------------------------------------------------------ test evidence
test_nodes = {n['name']: n for n in nodes.values() if n['type'] == 'TEST'}
test_text = {}
for f in subprocess.run(['git', 'ls-files', 'tests', 'scripts/tests'], capture_output=True, text=True).stdout.split('\n'):
    if re.search(r'\.(ts|tsx|mjs|js)$', f) and os.path.exists(f):
        test_text[f] = read(f)


def test_state(f):
    t = test_nodes.get(f)
    ex = (t or {}).get('execution')
    if not ex:
        return 'NOT_RUN'
    return 'PASS' if not ex.get('failed') and ex.get('passed') else 'FAIL'


def marker_verification(marker):
    """Return (verification, test ids, files) for a literal marker searched in test files."""
    if not marker or len(marker) < 12:
        return None
    files = sorted(f for f, t in test_text.items() if marker in t)
    if not files:
        return None
    states = [test_state(f) for f in files]
    tids = [test_nodes[f]['id'] for f in files if f in test_nodes]
    if 'PASS' in states:
        return 'VERIFIED', tids, files
    if 'FAIL' in states:
        return 'FAILING', tids, files
    return 'NOT_RUN', tids, files


def node_verification(tech_id):
    t = nodes.get(tech_id, {})
    tids = outs(tech_id, 'TESTED_BY', 'TEST')
    if not tids:
        return 'UNKNOWN', []
    st = [test_state(nodes[x]['name']) for x in tids]
    if 'PASS' in st:
        return 'VERIFIED', tids
    if 'FAIL' in st:
        return 'FAILING', tids
    return 'NOT_RUN', tids


def static_part(msg):
    """Longest literal run of a template string, used as a test marker."""
    parts = re.split(r'\$\{[^}]*\}', msg or '')
    return max(parts, key=len).strip() if parts else ''


# ------------------------------------------------------------------ contracts: schema fields + constraints
CON = 'packages/contracts/src/index.ts'
con = read(CON)


def balanced(text, start, open_ch='(', close_ch=')'):
    depth, i, q = 0, start, None
    while i < len(text):
        c = text[i]
        if q:
            if c == '\\':
                i += 2
                continue
            if c == q:
                q = None
        elif c in '\'"`':
            q = c
        elif c == open_ch:
            depth += 1
        elif c == close_ch:
            depth -= 1
            if depth == 0:
                return i
        i += 1
    return len(text) - 1


def split_top(s):
    parts, depth, q, cur = [], 0, None, ''
    i = 0
    while i < len(s):
        c = s[i]
        if q:
            cur += c
            if c == '\\' and i + 1 < len(s):
                cur += s[i + 1]
                i += 2
                continue
            if c == q:
                q = None
        elif c in '\'"`':
            q = c
            cur += c
        elif c in '([{':
            depth += 1
            cur += c
        elif c in ')]}':
            depth -= 1
            cur += c
        elif c == ',' and depth == 0:
            parts.append(cur)
            cur = ''
        else:
            cur += c
        i += 1
    if cur.strip():
        parts.append(cur)
    return parts


CONSTRAINT_WORDS = {
    'min': 'minimum', 'max': 'maximum', 'length': 'exact length', 'email': 'must be an email address', 'url': 'must be a URL',
    'uuid': 'must be a UUID', 'int': 'must be an integer', 'positive': 'must be positive', 'nonnegative': 'must be zero or more',
    'negative': 'must be negative', 'nonempty': 'must not be empty', 'regex': 'must match pattern', 'trim': 'whitespace trimmed',
    'optional': 'optional', 'nullable': 'may be null', 'default': 'default', 'datetime': 'must be an ISO date-time', 'toLowerCase': 'lower-cased',
    'startsWith': 'must start with', 'endsWith': 'must end with', 'refine': 'custom check', 'superRefine': 'custom checks', 'gte': 'minimum', 'lte': 'maximum',
    'finite': 'must be finite', 'multipleOf': 'must be a multiple of', 'date': 'must be a date', 'strict': 'unknown keys rejected', 'transform': 'value transformed',
}


def parse_chain(expr):
    """Base type and the list of (method, args) in a zod chain, top level only."""
    expr = expr.strip()
    m = re.match(r'z\s*\.\s*(?:coerce\s*\.\s*)?(\w+)\s*\(', expr)
    base, pos = None, 0
    if m:
        base = m.group(1)
        end = balanced(expr, m.end() - 1)
        base_args = expr[m.end():end]
        pos = end + 1
    else:
        m2 = re.match(r'([A-Za-z_]\w*)\s*\(', expr)
        m3 = re.match(r'([A-Za-z_]\w*)', expr)
        if m2:
            base = m2.group(1) + '()'
            end = balanced(expr, m2.end() - 1)
            base_args = expr[m2.end():end]
            pos = end + 1
        elif m3:
            base = m3.group(1)
            base_args = ''
            pos = m3.end()
        else:
            return None, '', []
    chain = []
    rest = expr[pos:]
    i = 0
    while True:
        mm_ = re.match(r'\s*\.\s*(\w+)\s*\(', rest[i:])
        if not mm_:
            break
        s = i + mm_.end() - 1
        e = balanced(rest, s)
        chain.append((mm_.group(1), rest[s + 1:e].strip()))
        i = e + 1
    return base, base_args, chain


schemas = {}
for m in re.finditer(r'export const (\w+Schema)\s*=\s*', con):
    name = m.group(1)
    line = con.count('\n', 0, m.start()) + 1
    s = m.end()
    mo = re.match(r'z\s*\.\s*object\s*\(\s*\{', con[s:])
    if not mo:
        expr_end = con.find(';\n', s)
        schemas[name] = dict(line=line, fields=None, shape=con[s:expr_end][:120].replace('\n', ' '), refinements=[])
        continue
    brace = s + mo.end() - 1
    close = balanced(con, brace, '{', '}')
    body = con[brace + 1:close]
    tail_end = con.find(';\n', close)
    tail = con[close + 1:tail_end]
    fields = []
    for part in split_top(body):
        part_s = part.strip()
        fm = re.match(r'(?:\/\/[^\n]*\n\s*|\/\*[\s\S]*?\*\/\s*)*([A-Za-z_]\w*|\'[^\']+\')\s*:\s*([\s\S]+)$', part_s)
        if not fm:
            continue
        fname = fm.group(1).strip("'")
        fexpr = fm.group(2)
        off = body.find(part)
        fline = con.count('\n', 0, brace + 1 + max(off, 0)) + 1 + (len(part) - len(part.lstrip('\n')) and part[:len(part) - len(part.lstrip())].count('\n'))
        base, base_args, chain = parse_chain(fexpr)
        cons = []
        if base == 'enum':
            vals = re.findall(r"'([^']+)'", base_args)
            cons.append(('enum', 'one of: ' + ', '.join(vals), None))
        elif base == 'array':
            cons.append(('array', 'list of ' + (parse_chain(base_args)[0] or 'values'), None))
        elif base == 'object':
            cons.append(('object', 'nested object', None))
        elif base == 'literal':
            cons.append(('literal', 'must equal ' + base_args, None))
        for meth, args in chain:
            msg = None
            am = re.search(r"['\"`]([^'\"`]{3,})['\"`]\s*\)?\s*$", args) or re.search(r"message\s*:\s*['\"`]([^'\"`]+)", args)
            if am:
                msg = am.group(1)
            first = split_top(args)[0].strip() if args else ''
            word = CONSTRAINT_WORDS.get(meth, meth)
            if meth in ('min', 'max', 'length', 'gte', 'lte', 'multipleOf', 'startsWith', 'endsWith'):
                desc = f'{word} {first}' + (' characters' if base == 'string' and meth in ('min', 'max', 'length') else (' items' if base == 'array' and meth in ('min', 'max') else ''))
            elif meth == 'default':
                desc = f'default {first}'[:80]
            elif meth == 'regex':
                desc = 'must match pattern ' + first[:60]
            elif meth in ('describe', 'openapi', 'brand'):
                continue
            else:
                desc = word
            cons.append((meth, desc, msg))
        fields.append(dict(name=fname, base=base, line=fline, constraints=cons))
    refinements = []
    for rm in re.finditer(r'\.\s*(refine|superRefine)\s*\(', tail):
        e = balanced(tail, rm.end() - 1)
        args = tail[rm.end():e]
        mm2 = re.search(r"message\s*:\s*['\"`]([^'\"`]+)", args) or re.search(r"['\"`]([^'\"`]{8,})['\"`]", args)
        refinements.append(dict(kind=rm.group(1), message=mm2.group(1) if mm2 else None))
    schemas[name] = dict(line=line, fields=fields, shape='object', refinements=refinements, strict='.strict()' in tail)

# fix field lines precisely: search the field name after the schema line
con_lines = con.split('\n')
for name, s in schemas.items():
    if not s['fields']:
        continue
    ln = s['line']
    for f in s['fields']:
        for k in range(ln - 1, min(ln + 400, len(con_lines))):
            if re.match(rf"\s*'?{re.escape(f['name'])}'?\s*:", con_lines[k]):
                f['line'] = k + 1
                ln = k + 1
                break

# ------------------------------------------------------------------ hierarchy: project + applications
proj = next(n['id'] for n in nodes.values() if n['type'] == 'PROJ')
adopt(proj, 'PROJECT', None)
apps = {n['name']: n['id'] for n in nodes.values() if n['type'] == 'MOD' and n.get('kind') == 'application'}
for nm, i in apps.items():
    adopt(i, 'APPLICATION', proj)

ROLE_ID = {n['name']: n['id'] for n in nodes.values() if n['type'] == 'ROLE'}
routes = {r['key']: r for r in A['routes']}
STATUS_OF_CODE = {'UNAUTHENTICATED': 401, 'UNAUTHORIZED': 403, 'FORBIDDEN': 403, 'NOT_FOUND': 404, 'CONFLICT': 409, 'VALIDATION_FAILED': 422,
                  'INVALID_STATE_TRANSITION': 422, 'ASSESSMENT_AI_PROHIBITED': 403, 'FREE_USER_AI_QUOTA_EXCEEDED': 402, 'PAYMENT_REQUIRED': 402,
                  'POLICY_VIOLATION': 422, 'RATE_LIMIT_EXCEEDED': 429, 'TENANT_ISOLATION_VIOLATION': 403, 'SERVICE_UNAVAILABLE': 503}
err_by_cm = {(n['code'], n['message']): n['id'] for n in nodes.values() if n['type'] == 'ERR'}
schema_node = {n['name']: n['id'] for n in nodes.values() if n['type'] == 'SCH'}
api_min = {}  # API id -> MIN id
VERB = {'GET': 'Read', 'POST': 'Submit', 'PUT': 'Replace', 'PATCH': 'Update', 'DELETE': 'Delete'}


def as_list(v):
    if isinstance(v, list):
        return v
    if isinstance(v, str) and v.startswith('['):
        try:
            return json.loads(v.replace("'", '"').replace('None', 'null').replace('True', 'true').replace('False', 'false'))
        except Exception:
            return []
    return []


schema_used_by = collections.defaultdict(list)

for m in sorted((n for n in nodes.values() if n['type'] == 'MOD' and n.get('kind') == 'api-module'), key=lambda n: n['name']):
    adopt(m['id'], 'MODULE', apps['apps/api'])
for f in sorted((n for n in nodes.values() if n['type'] == 'FEAT'), key=lambda n: n['name']):
    mod = next(x['id'] for x in nodes.values() if x['type'] == 'MOD' and x['name'] == f'api/{f["module"]}')
    adopt(f['id'], 'MAJOR', mod)

for a in sorted((n for n in nodes.values() if n['type'] == 'API'), key=lambda n: n['name']):
    feat = next(x['id'] for x in nodes.values() if x['type'] == 'FEAT' and x['name'] == f'api/{a["feature"]}')
    r = routes.get(a['name'], {})
    loc = a['evidence'][0]
    av, atests = node_verification(a['id'])
    rules = [x for x in outs(a['id'], 'CALLS', 'RULE') if nodes[x]['name'] != 'DomainError']
    tables = uniq(outs(a['id'], 'WRITES', 'DB'))
    jobs = uniq(outs(a['id'], 'TRIGGERS', 'SVC'))
    errs = as_list(r.get('errors'))
    webc = uniq(ins(a['id'], 'CALLS', 'SCR') + ins(a['id'], 'CALLS', 'COMP'))
    gaps = []
    if a['durability'] != 'durable':
        gaps.append('ephemeral: state held in process memory, lost on restart')
    if not webc and not ins(a['id'], 'TRIGGERS', 'INT'):
        gaps.append('no first-party web caller found')
    if not atests:
        gaps.append('no linked test')
    who = 'anyone (public)' if a['auth'].startswith('public') else ('roles ' + ', '.join(a['roles']) if a['roles'] else 'any signed-in session')
    desc = (a.get('purpose') or '').strip()
    facts = (f"{a['method']} {a['path']} for {who}"
             + (f"; validates {', '.join(a['schemas'])}" if a['schemas'] else '')
             + (f"; calls {', '.join(nodes[x]['name'] for x in rules[:4])}" + (' ...' if len(rules) > 4 else '') if rules else '')
             + f"; {'durable (PostgreSQL)' if a['durability'] == 'durable' else 'ephemeral (process memory)'}"
             + (f"; writes {', '.join(nodes[x]['name'] for x in tables)}" if tables else '')
             + f"; responds {', '.join(a['statuses']) or '200'}"
             + (f"; {len(errs)} failure branch(es)" if errs else ''))
    desc = (desc + ' ' if desc else '') + facts + '.'
    seg = a['path'].replace('/api/v1/', '').strip('/')
    name = f"{VERB.get(a['method'], a['method'])} {seg}"
    mi = mk('MIN', a['name'], 'MINOR', feat, name, desc, a['status'], av, a['evidence'], [a['id']] + atests,
            route=a['name'], durability=a['durability'], tests=atests, known_gaps=gaps, roles=a['roles'] or (['anonymous'] if a['auth'].startswith('public') else ['authenticated']))
    api_min[a['id']] = mi
    for t in atests:
        edge(mi, 'TESTED_BY', t)
    pv = 'PATH_LEVEL' if av == 'VERIFIED' else av
    # --- access control
    acc_items = []
    if not a['auth'].startswith('public'):
        acc_items.append(('auth', 'Requires a signed-in session', 'Requests without a valid session token are rejected with 401 UNAUTHENTICATED.', [ROLE_ID.get('anonymous')]))
    else:
        acc_items.append(('auth', 'Open to anonymous callers', f"auth: {a['auth']}.", [ROLE_ID.get('anonymous')]))
    for role in a['roles']:
        acc_items.append((f'role:{role}', f'Allowed role: {role}', f"{role} is one of the roles allowed here ({', '.join(a['roles'])}); a caller holding none of them is rejected with 403.", [ROLE_ID.get(role)]))
    for gd in a['guards']:
        acc_items.append((f'guard:{gd}', f'Guard: {gd}', f'Guard {gd} must pass before the handler runs.', []))
    if a.get('rate_limit'):
        acc_items.append(('rate', 'Route-specific rate limit', 'This route sets its own rate-limit configuration (429 when exceeded).', []))
    if a.get('idempotency'):
        acc_items.append(('idem', 'Idempotency key honoured', 'A repeated request with the same Idempotency-Key returns the stored result instead of acting twice.', []))
    sub = mk('SUB', f'{a["name"]}|access', 'SUB', mi, 'Access control', f"Who may call {a['name']}: {who}.", 'IMPLEMENTED', pv, a['evidence'])
    for k, nm, d, rel in acc_items:
        mk('NANO', f'{a["name"]}|access|{k}', 'NANO', sub, nm, d, 'IMPLEMENTED', pv, a['evidence'], [x for x in rel if x])
    # --- validation
    if a['schemas']:
        vs = mk('SUB', f'{a["name"]}|validation', 'SUB', mi, 'Request validation',
                f"The request is parsed with {', '.join(a['schemas'])}; a failure returns 400 with field details before any business logic runs.", 'IMPLEMENTED', pv, a['evidence'])
        for sname in a['schemas']:
            schema_used_by[sname].append(mi)
            sc = schemas.get(sname)
            sid = schema_node.get(sname)
            if not sc:
                mk('SML', f'{a["name"]}|schema|{sname}', 'SMALL', vs, sname, f'{sname} is not defined in {CON} (imported from elsewhere or composed).', 'UNKNOWN', 'UNKNOWN', ev(CON), [sid] if sid else [])
                continue
            nf = len(sc['fields'] or [])
            sd = f"{sname}: {nf} field(s)" + (', unknown keys rejected' if sc.get('strict') else '') + (f", {len(sc['refinements'])} cross-field check(s)" if sc.get('refinements') else '') if sc['fields'] is not None else f"{sname} = {sc['shape']} (not a plain object; fields not decomposed)"
            sm = mk('SML', f'{a["name"]}|schema|{sname}', 'SMALL', vs, sname, sd, 'IMPLEMENTED', pv, ev(CON, sc['line'], sname), [sid] if sid else [])
            for fdef in sc['fields'] or []:
                cons = fdef['constraints']
                req = not any(c[0] in ('optional', 'default', 'nullable') for c in cons)
                fdesc = f"{fdef['name']} ({fdef['base']}, {'required' if req else 'optional'})" + (': ' + '; '.join(c[1] for c in cons) if cons else '')
                tf = mk('TNY', f'{a["name"]}|schema|{sname}|{fdef["name"]}', 'TINY', sm, f"Field {fdef['name']}", fdesc, 'IMPLEMENTED', pv, ev(CON, fdef['line'], f"{sname}.{fdef['name']}"))
                for ci, (meth, cd, msg) in enumerate(cons):
                    mv = marker_verification(msg) if msg else None
                    v, tids = (mv[0], mv[1]) if mv else (pv if pv != 'VERIFIED' else 'PATH_LEVEL', [])
                    nn = mk('NANO', f'{a["name"]}|schema|{sname}|{fdef["name"]}|{meth}|{ci}', 'NANO', tf, f"{fdef['name']}: {cd}",
                            f"{fdef['name']} {cd}" + (f'; message "{msg}"' if msg else '') + '.', 'IMPLEMENTED', v, ev(CON, fdef['line'], f"{sname}.{fdef['name']}"), tids)
                    for t in tids:
                        edge(nn, 'TESTED_BY', t)
            for ri, rf in enumerate(sc.get('refinements') or []):
                mv = marker_verification(rf['message']) if rf['message'] else None
                v, tids = (mv[0], mv[1]) if mv else ('UNKNOWN', [])
                mk('NANO', f'{a["name"]}|schema|{sname}|refine|{ri}', 'NANO', sm, f"Cross-field check {ri + 1}",
                   f"{rf['kind']} on {sname}" + (f': "{rf["message"]}"' if rf['message'] else '') + '.', 'IMPLEMENTED', v, ev(CON, sc['line'], sname), tids)
    # --- business rules
    rr = [x for x in rules if nodes[x]['name'] != 'DomainError']
    if rr:
        bs = mk('SUB', f'{a["name"]}|rules', 'SUB', mi, 'Business rules', f"Domain functions from packages/domain called by the handler ({len(rr)}).", 'IMPLEMENTED', pv, a['evidence'])
        for x in rr:
            rv, rtests = node_verification(x)
            mk('SML', f'{a["name"]}|rule|{nodes[x]["name"]}', 'SMALL', bs, f"Rule {nodes[x]['name']}", f"Calls {nodes[x]['name']} ({nodes[x]['evidence'][0]['file']}). Rule status {nodes[x].get('status')}; its own tests: {rv}.",
               nodes[x].get('status') or 'UNKNOWN', rv, nodes[x]['evidence'], [x])
    # --- persistence
    sc_calls = as_list(r.get('store_calls')) if r else []
    ps = mk('SUB', f'{a["name"]}|persistence', 'SUB', mi, 'Persistence',
            ('Durable: writes go through the PostgreSQL store' if a['durability'] == 'durable' else 'Ephemeral: state lives in API process memory and is lost on restart')
            + (f"; store calls {', '.join(sc_calls[:6])}" if sc_calls else '') + '.',
            'IMPLEMENTED' if a['durability'] == 'durable' else 'PARTIALLY_IMPLEMENTED', pv, a['evidence'])
    for t in tables:
        mk('SML', f'{a["name"]}|writes|{nodes[t]["name"]}', 'SMALL', ps, f"Writes {nodes[t]['name']}", f"Writes table {nodes[t]['name']} ({nodes[t].get('created_in')}).", 'IMPLEMENTED', pv, nodes[t]['evidence'], [t])
    # --- background work
    if jobs:
        bw = mk('SUB', f'{a["name"]}|jobs', 'SUB', mi, 'Background work', f"Enqueues {len(jobs)} background job kind(s) in background_jobs for apps/worker.", 'IMPLEMENTED', pv, a['evidence'])
        for j in jobs:
            mk('SML', f'{a["name"]}|job|{nodes[j]["name"]}', 'SMALL', bw, f"Enqueue {nodes[j]['name'].replace('job:', '')}", f"Dispatches {nodes[j]['name']}; worker handler: {nodes[j].get('handler')}.",
               nodes[j].get('status') or 'UNKNOWN', 'UNKNOWN', nodes[j]['evidence'], [j])
    # --- responses
    rs = mk('SUB', f'{a["name"]}|responses', 'SUB', mi, 'Responses', f"Success {', '.join(a['statuses']) or '200'}; {len(errs)} explicit failure branch(es) besides validation and access errors.", 'IMPLEMENTED', pv, a['evidence'])
    ok = mk('SML', f'{a["name"]}|responses|success', 'SMALL', rs, 'Success responses', f"HTTP {', '.join(a['statuses']) or '200 (implicit)'}.", 'IMPLEMENTED', pv, a['evidence'])
    for s in (a['statuses'] or ['200']):
        mk('NANO', f'{a["name"]}|status|{s}', 'NANO', ok, f'HTTP {s}', f"Replies {s} when the operation succeeds" + (' (implicit default)' if not a['statuses'] else '') + '.', 'IMPLEMENTED', pv, a['evidence'])
    if errs:
        fl = mk('SML', f'{a["name"]}|responses|failure', 'SMALL', rs, 'Failure branches', f"{len(errs)} DomainError branch(es) in the handler, mapped to HTTP by the global error handler.", 'IMPLEMENTED', pv, a['evidence'])
        seenb = collections.Counter()
        for code, msg, line in errs:
            seenb[(code, msg)] += 1
            mv = marker_verification(static_part(msg))
            v, tids = (mv[0], mv[1]) if mv else ('PATH_LEVEL' if av == 'VERIFIED' else 'UNKNOWN', [])
            eid = err_by_cm.get((code, msg))
            nn = mk('NANO', f'{a["name"]}|err|{code}|{msg}|{seenb[(code, msg)]}', 'NANO', fl, f"{code} {STATUS_OF_CODE.get(code, 400)}: {msg[:70]}",
                    f'Throws DomainError({code}) "{msg}" -> HTTP {STATUS_OF_CODE.get(code, 400)}.', 'IMPLEMENTED', v, ev(loc['file'], int(line)), [x for x in [eid] if x] + tids,
                    http=STATUS_OF_CODE.get(code, 400), code=code)
            for t in tids:
                edge(nn, 'TESTED_BY', t)

# ------------------------------------------------------------------ web
scr_nodes = sorted((n for n in nodes.values() if n['type'] == 'SCR'), key=lambda n: n['name'])
comp_nodes = {n['id']: n for n in nodes.values() if n['type'] == 'COMP'}
ints = A['interactions']
int_by_owner = collections.defaultdict(list)
skipped_ints = [it for it in ints if 'id' not in it]  # extract.py found the binding but made no INT node for it
for it in ints:
    gn = nodes.get(it.get('id'))
    if gn:
        int_by_owner[gn.get('owner')].append(it)
web_calls_by_src = collections.defaultdict(list)
for c in A['web_calls']:
    web_calls_by_src[c.get('src')].append(c)
api_by_name = {n['name']: n['id'] for n in nodes.values() if n['type'] == 'API'}
file_text = {}


def ftext(f):
    if f not in file_text:
        file_text[f] = read(f) if os.path.exists(f) else ''
    return file_text[f]


def fn_body(f, name):
    t = ftext(f)
    m = re.search(rf'(?:function\s+{re.escape(name)}\s*\(|(?:const|let)\s+{re.escape(name)}\s*=\s*(?:async\s*)?(?:\([^)]*\)|\w+)\s*(?::[^=]+)?=>)', t)
    if not m:
        return '', None
    b = t.find('{', m.end() - 1 if t[m.end() - 1] == '(' else m.end())
    if b < 0 or b - m.end() > 300:
        return '', None
    e = balanced(t, b, '{', '}')
    return t[b:e + 1], t.count('\n', 0, m.start()) + 1


EVENT_GROUP = {'submit': 'Form submission', 'change': 'Field input', 'click': 'Buttons and links', 'press': 'Buttons and links', 'retry': 'Retry after an error',
               'close': 'Dialog close', 'keyboard': 'Keyboard shortcuts', 'hover': 'Pointer hover', 'focus': 'Focus handling', 'blur': 'Focus handling'}


def group_of(kind):
    return 'Global listeners' if kind.startswith('listener') else EVENT_GROUP.get(kind, kind)


def build_interactions(owner_id, owner_file, parent_major, pv):
    groups = collections.defaultdict(list)
    for it in int_by_owner.get(owner_id, []):
        groups[group_of(it['kind'])].append(it)
    for gname in sorted(groups):
        its = sorted(groups[gname], key=lambda x: x['line'])
        gm = mk('MIN', f'{owner_id}|events|{gname}', 'MINOR', parent_major, gname, f"{len(its)} '{gname.lower()}' binding(s) in {owner_file}.", 'IMPLEMENTED', pv, ev(owner_file, its[0]['line']))
        for it in its:
            g = nodes[it['id']]
            expr = it.get('expr') or ''
            handler = it.get('handler')
            body, bline = (fn_body(it['file'], handler) if handler else ('', None))
            text = expr + '\n' + body
            called = set(re.findall(r'\b([a-z]\w*)\s*\(', text)) - {'if', 'for', 'while', 'switch', 'return', 'catch', 'void', 'await', 'function'}
            setters = uniq(re.findall(r'\b(set[A-Z]\w*)\s*\(', text))
            navs = uniq(re.findall(r'\bnavigate\s*\(\s*[\'"`]([^\'"`]+)', text))
            calls = [c for c in web_calls_by_src.get(owner_id, []) if c['file'] == it['file'] and (c.get('enclosing') == handler or c.get('enclosing') in called)]
            apis = uniq([api_by_name[c['route']] for c in calls if c.get('route') in api_by_name] + [api_by_name[x] for x in g.get('persists_via_api', []) if x in api_by_name])
            prevent = 'preventDefault' in text
            label = f"on{it['kind'].capitalize()}" if not it['kind'].startswith('listener') else it['kind']
            hname = handler or ('inline: ' + re.sub(r'\s+', ' ', expr)[:50])
            iv, itests = node_verification(it['id'])
            td = (f"{it['attr']} at {it['file']}:{it['line']} runs {hname}"
                  + (f"; changes state {', '.join(setters)}" if setters else '')
                  + (f"; calls {', '.join(nodes[x]['name'] for x in apis)}" if apis else '')
                  + (f"; navigates to {', '.join(navs)}" if navs else '') + '.')
            tn = mk('TNY', f'{owner_id}|int|{it["id"]}', 'TINY', gm, f"{it['attr']} {handler or 'inline'}", td, g.get('status') or 'IMPLEMENTED', iv if iv != 'UNKNOWN' else pv,
                    ev(it['file'], it['line'], it['attr']), [it['id']], event=it['kind'], interaction_class=g.get('interaction_class'))
            if prevent:
                mk('NANO', f'{owner_id}|int|{it["id"]}|prevent', 'NANO', tn, 'Stops the native form submit', 'Calls event.preventDefault() so the page does not reload.', 'IMPLEMENTED', 'UNKNOWN', ev(it['file'], bline or it['line']))
            for s in setters:
                mk('NANO', f'{owner_id}|int|{it["id"]}|set|{s}', 'NANO', tn, f'State: {s}', f'Updates component state through {s}.', 'IMPLEMENTED', 'UNKNOWN', ev(it['file'], bline or it['line'], s))
            for x in apis:
                nn = mk('NANO', f'{owner_id}|int|{it["id"]}|api|{nodes[x]["name"]}', 'NANO', tn, f"Request {nodes[x]['name']}", f"Sends {nodes[x]['name']} through apiFetch/apiJson (apps/web/src/lib/api.ts).",
                        'IMPLEMENTED', 'UNKNOWN', ev(it['file'], bline or it['line']), [x])
                if x in api_min:
                    edge(nn, 'TRIGGERS', api_min[x])
            for nv in navs:
                mk('NANO', f'{owner_id}|int|{it["id"]}|nav|{nv}', 'NANO', tn, f'Navigate to {nv}', f'Calls navigate({nv}).', 'IMPLEMENTED', 'UNKNOWN', ev(it['file'], bline or it['line']))


def seg_of(route):
    s = route.strip('/').split('/')[0]
    return s or 'landing'


web_mods = {}
for s in scr_nodes:
    seg = seg_of(s['name'])
    if seg not in web_mods:
        web_mods[seg] = mk('MOD', f'web|{seg}', 'MODULE', apps['apps/web'], f'web/{seg}', f"Routed screens under /{seg if seg != 'landing' else ''} in apps/web/src/App.tsx.", 'IMPLEMENTED', 'UNKNOWN', ev('apps/web/src/App.tsx'))
screen_major = {}
for s in scr_nodes:
    sv, stests = node_verification(s['id'])
    calls = web_calls_by_src.get(s['id'], [])
    apis = uniq([api_by_name[c['route']] for c in calls if c.get('route') in api_by_name])
    d = (f"{s['component']} at route {s['name']}" + (' (signed-in only)' if s['guarded'] else ' (public)')
         + f"; {s.get('buttons', 0)} buttons, {s.get('forms', 0)} forms, {s.get('inputs', 0)} inputs; calls {len(apis)} endpoint(s).")
    gaps = [] if apis else ['no API call found in this screen file']
    major = mk('FEAT', f'web|screen|{s["name"]}', 'MAJOR', web_mods[seg_of(s['name'])], f"Screen {s['name']}", d, s.get('status') or 'UNKNOWN', sv, s['evidence'], [s['id']] + stests,
               tests=stests, known_gaps=gaps)
    screen_major[s['id']] = major
    for t in stests:
        edge(major, 'TESTED_BY', t)
    pv = 'PATH_LEVEL' if sv == 'VERIFIED' else sv
    states = [(k, lbl) for k, lbl in (('loading_state', 'Loading indicator'), ('empty_state', 'Empty state'), ('error_state', 'Error state')) if s.get(k)]
    missing = [lbl for k, lbl in (('loading_state', 'Loading indicator'), ('empty_state', 'Empty state'), ('error_state', 'Error state')) if not s.get(k)]
    if states or apis:
        st = mk('MIN', f'{s["id"]}|states', 'MINOR', major, 'Screen states', 'Loading, empty and error presentation found in the screen source'
                + (f"; not found: {', '.join(missing)}" if missing else '') + '.', 'IMPLEMENTED' if states else 'NOT_IMPLEMENTED', pv, ev(s['file']))
        for k, lbl in states:
            mk('TNY', f'{s["id"]}|state|{k}', 'TINY', st, lbl, f'{lbl} rendered by {s["component"]} (detected in source).', 'IMPLEMENTED', pv, ev(s['file']))
        if apis:
            for lbl in missing:
                mk('TNY', f'{s["id"]}|state-missing|{lbl}', 'TINY', st, f'{lbl} (not found)', f'No {lbl.lower()} pattern was detected in {s["file"]} although the screen calls the API. May be handled by a shared component; confirm before treating as a gap.',
                   'UNKNOWN', 'UNKNOWN', ev(s['file']))
    if apis:
        dl = mk('MIN', f'{s["id"]}|data', 'MINOR', major, 'Data and requests', f"API endpoints this screen calls ({len(apis)}).", 'IMPLEMENTED', pv, ev(s['file']))
        for c in sorted(calls, key=lambda c: c['line']):
            x = api_by_name.get(c.get('route'))
            if not x:
                continue
            k = f'{s["id"]}|call|{c["route"]}|{c.get("enclosing")}'
            if 'catalog:NANO|' + k in seen_keys:
                continue
            nn = mk('NANO', k, 'NANO', dl, f"{c.get('enclosing') or 'module'} -> {c['route']}", f"{c.get('enclosing') or 'top level'}() at {c['file']}:{c['line']} sends {c['route']}.", 'IMPLEMENTED', 'UNKNOWN', ev(c['file'], c['line']), [x])
            if x in api_min:
                edge(nn, 'TRIGGERS', api_min[x])
    navt = uniq(outs(s['id'], 'NAVIGATES_TO', 'SCR'))
    if navt:
        nv = mk('MIN', f'{s["id"]}|nav', 'MINOR', major, 'Navigation', f"Links from this screen to {len(navt)} other screen(s).", 'IMPLEMENTED', pv, ev(s['file']))
        for t in navt:
            mk('NANO', f'{s["id"]}|nav|{nodes[t]["name"]}', 'NANO', nv, f"Link to {nodes[t]['name']}", f"Navigates to {nodes[t]['name']} ({nodes[t]['component']}).", 'IMPLEMENTED', 'UNKNOWN', ev(s['file']), [t])
    build_interactions(s['id'], s['file'], major, pv)

shared_owner = [o for o in int_by_owner if o in comp_nodes or o == apps['apps/web']]
if shared_owner:
    wsh = mk('MOD', 'web|shared', 'MODULE', apps['apps/web'], 'web/shared-components', 'Shared components and app-level listeners that carry their own interactions.', 'IMPLEMENTED', 'UNKNOWN', ev('apps/web/src/components'))
    for o in sorted(shared_owner, key=lambda o: nodes[o]['name']):
        on = nodes[o]
        f = on.get('file') or (on['evidence'][0]['file'] if on.get('evidence') else 'apps/web/src')
        cv, ctests = node_verification(o)
        cm = mk('FEAT', f'web|component|{on["name"]}', 'MAJOR', wsh, f"Component {on['name']}" if o != apps['apps/web'] else 'App-level listeners',
                f"{len(int_by_owner[o])} interaction(s) defined in {f}" + ('; no importing file found (possible dead code)' if on.get('status') == 'UNKNOWN' else '') + '.', on.get('status') or 'IMPLEMENTED', cv, on['evidence'], [o] + ctests)
        build_interactions(o, f, cm, 'PATH_LEVEL' if cv == 'VERIFIED' else cv)

# ------------------------------------------------------------------ worker
jobs_all = sorted((n for n in nodes.values() if n['type'] == 'SVC' and n['name'].startswith('job:')), key=lambda n: n['name'])
wfam = {}
for j in jobs_all:
    fam = j['name'][4:].split('.')[0]
    if fam not in wfam:
        wfam[fam] = mk('MOD', f'worker|{fam}', 'MODULE', apps['apps/worker'], f'worker/{fam}', f"Background job kinds starting with '{fam}.' claimed by apps/worker.", 'IMPLEMENTED', 'UNKNOWN', ev('apps/worker/src/index.ts'))
    jv, jt = node_verification(j['id'])
    disp = uniq(ins(j['id'], 'TRIGGERS', 'API'))
    jm = mk('FEAT', f'worker|job|{j["name"]}', 'MAJOR', wfam[fam], j['name'][4:], f"Handler: {j.get('handler')}. Enqueued by {len(disp)} endpoint(s)." + (f" {j['note']}" if j.get('note') else ''),
            j.get('status') or 'UNKNOWN', jv, j['evidence'], [j['id']] + jt)
    mk('NANO', f'worker|job|{j["name"]}|handler', 'NANO', jm, 'Handler outcome', f"{j.get('handler')}.", j.get('status') or 'UNKNOWN', jv, j['evidence'])
    for d in disp:
        if d in api_min:
            edge(api_min[d], 'TRIGGERS', jm)

# ------------------------------------------------------------------ documented registry features (F-) placed in the hierarchy
api_mod_ids = {n['id'] for n in nodes.values() if n['type'] == 'MOD' and n.get('kind') == 'api-module'}
docf = sorted((n for n in nodes.values() if n['type'] == 'DOCF'), key=lambda n: n['id'])
doc_app = mk('APP', 'documented-scope', 'APPLICATION', proj, 'Documented scope (registry features)',
             'Features in docs/registries/FEATURE_REGISTRY.md. Those with code traces also link to their code; those without stay here as NOT_IMPLEMENTED or PARTIALLY_IMPLEMENTED scope so nothing documented is silently dropped.',
             'PARTIALLY_IMPLEMENTED', 'UNKNOWN', ev('docs/registries/FEATURE_REGISTRY.md'))
cat_mod = {}
for f in docf:
    cat = f.get('category') or 'Uncategorised'
    if cat not in cat_mod:
        cat_mod[cat] = mk('MOD', f'doc|{cat}', 'MODULE', doc_app, f'documented/{cat}', f"Registry features in category '{cat}'.", 'UNKNOWN', 'UNKNOWN', ev('docs/registries/FEATURE_REGISTRY.md'))
    adopt(f['id'], 'MAJOR', cat_mod[cat])
    if not f.get('code_links') and not f.get('test_links'):
        f.setdefault('notes', [])
        if 'catalog: no code or test cites this ID; documented scope not found in code' not in f['notes']:
            f['notes'].append('catalog: no code or test cites this ID; documented scope not found in code')

# ------------------------------------------------------------------ journeys + data flows (relationship nodes, not hierarchy)
jour = sorted((n for n in nodes.values() if n['type'] == 'JOUR'), key=lambda n: n['id'])
scr_by_route = {n['name']: n['id'] for n in scr_nodes}


def route_match(path):
    for r, i in scr_by_route.items():
        rx = '^' + re.sub(r':\w+', '[^/]+', r) + '$'
        if re.match(rx, path.split('?')[0]):
            return i
    return None


def api_match(p):
    p = p.split('?')[0]
    for nm, i in api_by_name.items():
        meth, path = nm.split(' ', 1)
        if re.match('^' + re.sub(r':\w+', '[^/]+', path) + '$', p):
            return i
    return None


for j in jour:
    for g in as_list(j.get('gotos')):
        s = route_match(g) if isinstance(g, str) else None
        if s and s in screen_major:
            edge(j['id'], 'EXERCISES', screen_major[s])
    for p in as_list(j.get('api_paths')):
        x = api_match(p) if isinstance(p, str) else None
        if x and x in api_min:
            edge(j['id'], 'EXERCISES', api_min[x])

flows = []
for c in sorted(A['web_calls'], key=lambda c: (c['file'], c['line'])):
    x = api_by_name.get(c.get('route'))
    if not x:
        continue
    src = c.get('src')
    start = screen_major.get(src) or next((n['id'] for n in new_nodes if n['type'] == 'FEAT' and src in n['related']), None)
    k = f"{c['file']}|{c.get('enclosing')}|{c['route']}"
    if 'catalog:FLOW|' + k in seen_keys:
        continue
    a = nodes[x]
    chain = (['UI ' + (nodes[src]['name'] if src in nodes else c['file'])] + [f"{c.get('enclosing') or 'module'}()", 'apiFetch', a['name']]
             + (['validate ' + ', '.join(a['schemas'])] if a['schemas'] else []) + [nodes[r]['name'] for r in outs(x, 'CALLS', 'RULE') if nodes[r]['name'] != 'DomainError'][:3]
             + [('DB ' + ', '.join(nodes[t]['name'] for t in uniq(outs(x, 'WRITES', 'DB')))) if outs(x, 'WRITES', 'DB') else ('memory' if a['durability'] != 'durable' else 'DB (store)')]
             + (['jobs ' + ', '.join(nodes[t]['name'][4:] for t in uniq(outs(x, 'TRIGGERS', 'SVC')))] if outs(x, 'TRIGGERS', 'SVC') else [])
             + ['HTTP ' + (', '.join(a['statuses']) or '200'), 'state update + UI'])
    fid = nid_for('FLOW', k)
    fn = dict(id=fid, type='FLOW', name=f"{c.get('enclosing') or 'load'} -> {a['name']}", description=' -> '.join(chain), status=a['status'], verification=node_verification(x)[0],
              evidence=ev(c['file'], c['line']), related=uniq([y for y in [start, api_min.get(x), x] if y]), layer='feature-hierarchy', notes=[], chain=chain, module=a['module'])
    new_nodes.append(fn)
    nodes[fid] = fn
    flows.append(fn)
    if start:
        edge(fid, 'STARTS_AT', start)
    edge(fid, 'CALLS', api_min.get(x, x))

# ------------------------------------------------------------------ write graph + ledger
for n in nodes.values():
    if n.get('layer') != 'feature-hierarchy' and n['id'] in level_of:
        pass
G['nodes'] = [n for n in G['nodes'] if n.get('layer') != 'feature-hierarchy'] + new_nodes
G['edges'] = base_edges + new_edges
all_nodes = {n['id']: n for n in G['nodes']}

# ------------------------------------------------------------------ validation
problems = []
ids = [n['id'] for n in G['nodes']]
dup = [i for i, c in collections.Counter(ids).items() if c > 1]
if dup:
    problems.append(f'duplicate node IDs: {dup[:10]}')
dangling = [e for e in G['edges'] if e['src'] not in all_nodes or e['dst'] not in all_nodes]
if dangling:
    problems.append(f'{len(dangling)} edges point to a missing node, e.g. {dangling[:3]}')
untyped = [e for e in G['edges'] if not e.get('rel')]
if untyped:
    problems.append(f'{len(untyped)} edges without a relationship type')
bad_parent, bad_rank = [], []
for i, p in parent_of.items():
    if p is None:
        if level_of[i] != 'PROJECT':
            bad_parent.append(i)
        continue
    if p not in all_nodes:
        bad_parent.append(i)
    elif LEVEL_RANK[level_of[p]] >= LEVEL_RANK[level_of[i]]:
        bad_rank.append((i, level_of[i], p, level_of[p]))
if bad_parent:
    problems.append(f'{len(bad_parent)} hierarchy nodes with a missing parent: {bad_parent[:5]}')
if bad_rank:
    problems.append(f'{len(bad_rank)} hierarchy nodes whose parent is not a shallower level: {bad_rank[:5]}')
# reachability from the project
reach, stack = set(), [proj]
while stack:
    x = stack.pop()
    if x in reach:
        continue
    reach.add(x)
    stack.extend(children[x])
orphans = [i for i in level_of if i not in reach]
if orphans:
    problems.append(f'{len(orphans)} hierarchy nodes not reachable from {proj}: {orphans[:5]}')
no_desc = [n['id'] for n in new_nodes if not (n.get('description') or '').strip()]
if no_desc:
    problems.append(f'{len(no_desc)} new nodes without a description')
no_ev = [n['id'] for n in new_nodes if not n.get('evidence') or not n['evidence'][0].get('file')]
if no_ev:
    problems.append(f'{len(no_ev)} new nodes without source evidence')
bad_ev_files = sorted({e['file'] for n in new_nodes for e in n['evidence'] if e.get('file') and not os.path.exists(e['file'])})
if bad_ev_files:
    problems.append(f'evidence files that do not exist: {bad_ev_files[:5]}')
# every API endpoint, screen, job kind and registry feature must be in the hierarchy
must = [n['id'] for n in all_nodes.values() if n['type'] in ('FEAT', 'DOCF') and n.get('layer') != 'feature-hierarchy']
missing_h = [i for i in must if i not in level_of]
if missing_h:
    problems.append(f'{len(missing_h)} features not placed in the hierarchy: {missing_h[:5]}')
missing_api = [n['id'] for n in all_nodes.values() if n['type'] == 'API' and n['id'] not in api_min]
missing_scr = [n['id'] for n in scr_nodes if n['id'] not in screen_major]
if missing_api or missing_scr:
    problems.append(f'endpoints without a MINOR node: {missing_api[:5]}; screens without a MAJOR node: {missing_scr[:5]}')
int_wrapped = {r for n in new_nodes if n['type'] == 'TNY' for r in n['related'] if r.startswith('INT-')}
missing_int = [n['id'] for n in all_nodes.values() if n['type'] == 'INT' and n['id'] not in int_wrapped]
if missing_int:
    problems.append(f'{len(missing_int)} interactions without a TINY node: {missing_int[:5]}')
if problems:
    print('VALIDATION FAILED:\n  ' + '\n  '.join(problems))
    sys.exit(1)

json.dump(G, open(GP, 'w', encoding='utf8'), indent=1)
open(GP, 'a').write('\n')
ledger['ids'] = dict(sorted(ledger['ids'].items()))
with open(LEDGER, 'w', encoding='utf8') as fh:
    json.dump(ledger, fh, indent=1)
    fh.write('\n')

# ------------------------------------------------------------------ views
CAT = os.path.join(OUT, 'catalog')
os.makedirs(os.path.join(CAT, 'modules'), exist_ok=True)
for f in os.listdir(os.path.join(CAT, 'modules')):
    os.remove(os.path.join(CAT, 'modules', f))


def w(path, text):
    full = os.path.join(CAT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w', encoding='utf8') as fh:
        fh.write(text.rstrip('\n') + '\n')


def esc(s):
    return str(s if s is not None else '').replace('|', '\\|').replace('\n', ' ')


def table(headers, rows):
    out = ['| ' + ' | '.join(headers) + ' |', '| ' + ' | '.join('---' for _ in headers) + ' |']
    for r in rows:
        out.append('| ' + ' | '.join(esc(c) for c in r) + ' |')
    return '\n'.join(out)


def clean(s, n=60):
    s = str(s).replace('->', ' to ').replace('&', ' and ').replace('>', ' to ').replace('|', ' or ')
    s = re.sub(r"[^A-Za-z0-9 /._\-+%:,=]", ' ', s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s if len(s) <= n else s[:n - 3].rstrip() + '...'


def loc(n):
    e = (n.get('evidence') or [{}])[0]
    return f"{e.get('file')}:{e['line']}" if e.get('line') else (e.get('file') or '')


STATUS_ICON = {'IMPLEMENTED': 'OK', 'PARTIALLY_IMPLEMENTED': 'PARTIAL', 'NOT_IMPLEMENTED': 'MISSING', 'BROKEN': 'BROKEN', 'DEPRECATED': 'DEPRECATED', 'UNKNOWN': 'UNKNOWN', 'MOCKED': 'MOCKED', 'UNREACHABLE': 'UNREACHABLE'}
level_count = collections.Counter(level_of.values())
ver_count = collections.Counter(all_nodes[i].get('verification', '-') for i in level_of if all_nodes[i].get('layer') == 'feature-hierarchy')
commit = subprocess.run(['git', 'rev-parse', '--short', 'HEAD'], capture_output=True, text=True).stdout.strip()
exec_commit = (json.load(open(os.path.join(OUT, 'quality', 'EXECUTION_RESULTS.json'))).get('commit') or '')[:7] if os.path.exists(os.path.join(OUT, 'quality', 'EXECUTION_RESULTS.json')) else 'none'


def subtree(i):
    r, st = [], [i]
    while st:
        x = st.pop()
        r.append(x)
        st.extend(reversed(children[x]))
    return r


def mindmap(root, max_rank, label_root=None, cap=None):
    lines = ['mindmap', f'  root(({clean(label_root or all_nodes[root]["name"], 50)}))']
    count = 0

    def rec(x, depth):
        nonlocal count
        for c in children[x]:
            if LEVEL_RANK[level_of[c]] > max_rank:
                continue
            n = all_nodes[c]
            st = STATUS_ICON.get(n.get('status'), '')
            lines.append('  ' * (depth + 1) + f'{c.replace("-", "_")}[{clean(c + " " + n["name"], 64)}{(" - " + st) if st and st != "OK" else ""}]')
            count += 1
            rec(c, depth + 1)
    rec(root, 1)
    return '\n'.join(lines), count


def slug(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')


ROW_H = ['ID', 'Level', 'Parent', 'Name', 'Description', 'Status', 'Verification', 'Evidence', 'Related']
# Modules are grouped into one file per application, split into numbered parts so that no
# file grows past PART_BUDGET characters of Markdown (GitHub stops rendering very large files).
PART_BUDGET = 300_000


def gh_anchor(heading):
    a = re.sub(r'[^\w\- ]', '', heading.strip().lower())
    return a.replace(' ', '-')


module_list = []
for app in [apps['apps/api'], apps['apps/web'], apps['apps/worker'], doc_app]:
    for m in children[app]:
        module_list.append((app, m, subtree(m)))

module_text = {}
for app, m, st in module_list:
    mn = all_nodes[m]
    lc = collections.Counter(level_of[x] for x in st)
    vc = collections.Counter(all_nodes[x].get('verification') for x in st if all_nodes[x].get('verification'))
    sc_ = collections.Counter(all_nodes[x].get('status') for x in st)
    md = [f"## {mn['name']} ({m})", '',
          f"**Application:** {all_nodes[app]['name']} ({app}). **Purpose:** {mn.get('description') or 'API module: routes under /api/v1/' + mn['name'].split('/', 1)[-1] + ' in apps/api/src/server.ts.'}", '',
          '**Nodes by level:** ' + ', '.join(f'{l} {lc[l]}' for l in LEVELS if lc[l]) + '. **Status:** ' + ', '.join(f'{k} {v}' for k, v in sorted(sc_.items(), key=lambda kv: str(kv[0])) if k) + '. **Verification:** ' + (', '.join(f'{k} {v}' for k, v in sorted(vc.items())) or 'n/a') + '.', '']
    roles_ = sorted({r for x in st for r in all_nodes[x].get('roles', [])})
    if roles_:
        md += [f"**User roles that reach it:** {', '.join(roles_)}.", '']
    gaps = [(x, g) for x in st for g in all_nodes[x].get('known_gaps', [])]
    if gaps:
        md += ['**Known gaps:** ' + '; '.join(f'{x} {g}' for x, g in gaps[:40]) + (f' ... and {len(gaps) - 40} more (see the table).' if len(gaps) > 40 else '.'), '']
    def major_of(x):
        while x and level_of.get(x) not in ('MAJOR', None):
            x = parent_of.get(x)
        return x
    used_by = sorted({major_of(e['src']) for e in new_edges if e['rel'] == 'TRIGGERS' and e['dst'] in st and e['src'] in level_of} - set(st) - {None})
    if used_by:
        md += ['**Called from (web screens and components):** ' + ', '.join(f"{u} {all_nodes[u]['name']}" for u in used_by), '']
    rank_major = LEVEL_RANK['MINOR']
    mmd, cnt = mindmap(m, rank_major)
    md += ['### Module map (to minor features)', '', '```mermaid', mmd, '```', '']
    for maj in children[m]:
        mj = all_nodes[maj]
        sub_ = subtree(maj)
        md += [f"### {maj} {mj['name']}", '', mj.get('description') or mj.get('name'), '']
        if len(sub_) > 1:
            if len(sub_) <= 250:
                mmd, cnt = mindmap(maj, LEVEL_RANK['NANO'])
                md += ['```mermaid', mmd, '```', '']
            else:
                for mi_ in children[maj]:
                    mmd, cnt = mindmap(mi_, LEVEL_RANK['NANO'])
                    md += ['```mermaid', mmd, '```', '']
        rows = []
        for x in sub_:
            n = all_nodes[x]
            rows.append([x, level_of[x], n.get('parent_id') or '', n['name'], (n.get('description') or '')[:400] + ('' if not n.get('known_gaps') else ' Gaps: ' + '; '.join(n['known_gaps'])),
                         n.get('status') or '', n.get('verification') or '', loc(n), ', '.join(n.get('related', [])[:6]) + (' ...' if len(n.get('related', [])) > 6 else '')])
        md += [table(ROW_H, rows), '']
    module_text[m] = '\n'.join(md)

# pack modules into files: <app>.md, or <app>-1.md, <app>-2.md ... when one file would be too large
module_files = []
for app in [apps['apps/api'], apps['apps/web'], apps['apps/worker'], doc_app]:
    base = slug(all_nodes[app]['name'].split('/')[-1] if app != doc_app else 'documented')
    parts, cur, size = [], [], 0
    for a_, m, st in module_list:
        if a_ != app:
            continue
        t = module_text[m]
        if cur and size + len(t) > PART_BUDGET:
            parts.append(cur)
            cur, size = [], 0
        cur.append((m, st))
        size += len(t)
    if cur:
        parts.append(cur)
    for i, part in enumerate(parts, 1):
        fname = f"modules/{base}.md" if len(parts) == 1 else f"modules/{base}-{i}.md"
        title = all_nodes[app]['name'] + (f' modules, part {i} of {len(parts)}' if len(parts) > 1 else ' modules')
        others = [f"modules/{base}-{j}.md" for j in range(1, len(parts) + 1) if j != i] if len(parts) > 1 else []
        head = [f"# {title}", '',
                f"Generated by `docs/mindmap/tools/catalog.py` from `master/MASTER_PROJECT_GRAPH.json` at commit `{commit}`. Do not edit by hand. Back to the [feature catalog](../FEATURE_CATALOG.md)."
                + (' Other parts: ' + ', '.join(f"[part {o.rsplit('-', 1)[1][:-3]}]({o.split('/', 1)[1]})" for o in others) + '.' if others else ''), '',
                '| Module | ID |', '| --- | --- |']
        for m, st in part:
            head.append(f"| [{all_nodes[m]['name']}](#{gh_anchor(all_nodes[m]['name'] + ' (' + m + ')')}) | {m} |")
        body = [module_text[m] for m, st in part]
        w(fname, '\n'.join(head) + '\n\n' + '\n\n'.join(body))
        for m, st in part:
            module_files.append((app, m, fname + '#' + gh_anchor(all_nodes[m]['name'] + ' (' + m + ')'), st))

# ---- catalog index
rows = []
for app, m, fname, st in module_files:
    lc = collections.Counter(level_of[x] for x in st)
    vc = collections.Counter(all_nodes[x].get('verification') for x in st)
    rows.append([all_nodes[app]['name'], f"[{all_nodes[m]['name']}]({fname})", m, all_nodes[m].get('status') or '', lc['MAJOR'], lc['MINOR'], lc['SUB'], lc['SMALL'], lc['TINY'], lc['NANO'], vc['VERIFIED'], vc['UNKNOWN']])
top_mm, _ = mindmap(proj, LEVEL_RANK['MODULE'], 'TalentSphere')
missing_docf = [f for f in docf if not f.get('code_links') and not f.get('test_links')]
idx = ['# Feature Catalog', '',
       f"The complete feature hierarchy of TalentSphere, generated from source by `docs/mindmap/tools/catalog.py` at commit `{commit}` (test results measured at `{exec_commit}`). Every row below is a node in the one canonical dataset, [`master/MASTER_PROJECT_GRAPH.json`](../master/MASTER_PROJECT_GRAPH.json); every view in this folder is generated from it. Do not edit by hand: change the code or the docs and regenerate.", '',
       '## Levels', '',
       table(['Level', 'What it is in this codebase', 'ID prefix', 'Count'], [
           ['PROJECT', 'The whole repository', 'PROJ-', level_count['PROJECT']],
           ['APPLICATION', 'apps/api, apps/web, apps/worker; documented-only scope', 'MOD-, APP-', level_count['APPLICATION']],
           ['MODULE', 'API module (first path segment under /api/v1), web route group, worker job family, registry category', 'MOD-', level_count['MODULE']],
           ['MAJOR', 'API resource group, screen, shared component with interactions, job kind, registry feature', 'FEAT-, F-', level_count['MAJOR']],
           ['MINOR', 'One endpoint capability; one screen concern (states, data, navigation, an event kind)', 'MIN-', level_count['MINOR']],
           ['SUB', 'Endpoint stage: access control, request validation, business rules, persistence, background work, responses', 'SUB-', level_count['SUB']],
           ['SMALL', 'One schema, domain call, table written, job dispatched, success or failure set', 'SML-', level_count['SMALL']],
           ['TINY', 'One schema field, one screen state, one UI event binding', 'TNY-', level_count['TINY']],
           ['NANO', 'One constraint, role, guard, error branch, status code, state setter, API request or navigation target', 'NANO-', level_count['NANO']]]), '',
       'A level is used only where the source shows something at that level, so some branches go from SUB straight to NANO (an access rule has no small or tiny parts). Actions, screens, components, rules, APIs, tables, tests and journeys stay technical nodes; feature nodes point to them with `IMPLEMENTED_BY`, `TRIGGERS`, `TESTED_BY` and `EXERCISES` edges.', '',
       '## Verification', '',
       table(['Value', 'Meaning', 'Nodes'], [
           ['VERIFIED', 'A passing executed test contains this behaviour\'s own marker (error or validation message), or for an endpoint/screen, a linked test passed', ver_count['VERIFIED']],
           ['PATH_LEVEL', 'Only the parent endpoint or screen has a passing linked test; the branch itself was not matched to an assertion', ver_count['PATH_LEVEL']],
           ['NOT_RUN', 'A test mentions it but no execution result exists for that file', ver_count['NOT_RUN']],
           ['FAILING', 'The matching test file has failures', ver_count['FAILING']],
           ['UNKNOWN', 'No test evidence found', ver_count['UNKNOWN']]]), '',
       f"Statuses are implementation statuses from source (IMPLEMENTED, PARTIALLY_IMPLEMENTED, NOT_IMPLEMENTED, BROKEN, DEPRECATED, UNKNOWN). Test results come from `quality/EXECUTION_RESULTS.json` (commit `{exec_commit}`); a test added after that commit counts as NOT_RUN or UNKNOWN.", '',
       '## Map (to module level)', '', '```mermaid', top_mm, '```', '',
       '## Modules', '', table(['Application', 'Module', 'ID', 'Status', 'Major', 'Minor', 'Sub', 'Small', 'Tiny', 'Nano', 'Verified', 'Unknown'], rows), '',
       f"## Documented features not found in code ({len(missing_docf)})", '',
       'These registry features are kept in the hierarchy under "Documented scope" so they are not lost. No code or test file cites their ID. Some may exist under another name; [`quality/DOC_CODE_RECONCILIATION.md`](../quality/DOC_CODE_RECONCILIATION.md) compares them.', '',
       table(['ID', 'Name', 'Category', 'Documented status', 'Status'], [[f['id'], f['name'], f.get('category'), f.get('doc_status') or '', f['status']] for f in missing_docf]), '',
       '## Other views', '',
       '- [Journey graphs](JOURNEY_GRAPHS.md): every e2e journey with the screens and endpoints it exercises.',
       '- [Data-flow graphs](DATA_FLOW_GRAPHS.md): every web request from UI to table and back.',
       '- [API and dependency graph](API_DEPENDENCY_GRAPH.md): module to domain to table, plus cross-module triggers.',
       '- [Database relationship graph](DATABASE_GRAPH.md): tables, foreign keys and which endpoints write them.',
       '- [State transition graphs](STATE_GRAPHS.md): transition tables and status types.',
       '- [Test traceability and gaps](TEST_TRACEABILITY.md): verification per module and the untested or ephemeral features.',
       '- [Graph validation](GRAPH_VALIDATION.md): the integrity checks this run passed.',
       '- Existing generated views: [master mind map](../master/MASTER_PROJECT_MINDMAP.md), [module graphs](../architecture/MODULE_GRAPHS.md), [API inventory](../architecture/API_ARCHITECTURE.md), [screens](../ui/SCREEN_INTERACTION_INVENTORY.md).', '',
       '## Regenerating', '', 'Run the pipeline in `docs/mindmap/README.md`, then `python3 -I docs/mindmap/tools/catalog.py "$W"` as the last step, then Prettier on `docs/mindmap/**/*.{md,json}`.']
w('FEATURE_CATALOG.md', '\n'.join(idx))

# ---- journeys
by_spec = collections.defaultdict(list)
for j in jour:
    by_spec[j['spec']].append(j)
ex_out = collections.defaultdict(list)
for e in new_edges:
    if e['rel'] == 'EXERCISES':
        ex_out[e['src']].append(e['dst'])
jm = ['# Journey Graphs', '', f"Generated from the graph at `{commit}`. One flowchart per e2e spec: each journey (JOUR-) points to the screens (FEAT-) and endpoint capabilities (MIN-) it exercises, found from its `goto` targets and request paths. Documented target journeys (J-) are in [`journeys/USER_JOURNEYS.md`](../journeys/USER_JOURNEYS.md). Back to the [feature catalog](FEATURE_CATALOG.md).", '']
for spec in sorted(by_spec):
    js = by_spec[spec]
    lines = ['flowchart LR']
    seen = set()
    for j in js:
        oc = (j.get('execution') or {}).get('outcome') if isinstance(j.get('execution'), dict) else None
        lines.append(f'  {j["id"].replace("-", "_")}["{clean(j["id"] + " " + j.get("title", j["name"]), 70)}{" - " + oc if oc else ""}"]')
        for t in ex_out[j['id']]:
            if t not in seen:
                seen.add(t)
                lines.append(f'  {t.replace("-", "_")}("{clean(t + " " + all_nodes[t]["name"], 60)}")')
            lines.append(f'  {j["id"].replace("-", "_")} --> {t.replace("-", "_")}')
    jm += [f'## {spec}', '', f'{len(js)} journeys.', '', '```mermaid', '\n'.join(lines), '```', '',
           table(['Journey', 'Title', 'Outcome', 'Exercises'], [[j['id'], j.get('title', j['name']), ((j.get('execution') or {}).get('outcome') if isinstance(j.get('execution'), dict) else '') or 'not run', ', '.join(ex_out[j['id']]) or 'no screen or endpoint matched'] for j in js]), '']
w('JOURNEY_GRAPHS.md', '\n'.join(jm))

# ---- data flows
fm = ['# Data-Flow Graphs', '', f"Generated from the graph at `{commit}`. Each FLOW- node is one request the web app sends: UI, enclosing function, `apiFetch`, endpoint, validation, domain rules, persistence, background jobs, HTTP reply, state update. Grouped by API module. Back to the [feature catalog](FEATURE_CATALOG.md).", '',
      f'{len(flows)} flows; {sum(1 for f in flows if "memory" in f["chain"])} end in process memory (ephemeral).', '']
fl_by_mod = collections.defaultdict(list)
for f in flows:
    fl_by_mod[f['module']].append(f)
for mod in sorted(fl_by_mod):
    fs = fl_by_mod[mod]
    lines = ['flowchart LR']
    for f in fs:
        prev = None
        for k, step in enumerate(f['chain']):
            nid = f"{f['id'].replace('-', '_')}_{k}"
            lines.append(f'  {nid}["{clean(step, 50)}"]')
            if prev:
                lines.append(f'  {prev} --> {nid}')
            prev = nid
    fm += [f'## {mod}', '', '```mermaid', '\n'.join(lines), '```', '', table(['Flow', 'From', 'Chain', 'Status', 'Verification'], [[f['id'], loc(f), f['description'], f['status'], f['verification']] for f in fs]), '']
w('DATA_FLOW_GRAPHS.md', '\n'.join(fm))

# ---- API dependency graph (module level)
mods_api = sorted((n for n in all_nodes.values() if n['type'] == 'MOD' and n.get('kind') == 'api-module'), key=lambda n: n['name'])
dep = collections.defaultdict(lambda: collections.Counter())
tab = collections.defaultdict(lambda: collections.Counter())
for a in (n for n in all_nodes.values() if n['type'] == 'API'):
    for r in outs(a['id'], 'CALLS', 'RULE'):
        dm = next((all_nodes[e]['name'] for e in ins(r, 'CONTAINS', 'MOD')), None)
        if dm:
            dep[a['module']][dm] += 1
    for t in outs(a['id'], 'WRITES', 'DB'):
        tab[a['module']][all_nodes[t]['name']] += 1
cross = collections.Counter()
for e in new_edges:
    if e['rel'] == 'TRIGGERS' and e['src'] in all_nodes and e['dst'] in all_nodes:
        s = all_nodes[e['src']]
        d = all_nodes[e['dst']]
        if d['type'] == 'MIN' and s['type'] == 'NANO':
            sm_ = s
            while sm_.get('parent_id') and level_of.get(sm_['id']) != 'MODULE':
                sm_ = all_nodes[sm_['parent_id']]
            dmod = all_nodes[api_by_name[d['route']]]['module']
            cross[(sm_['name'], 'api/' + dmod)] += 1
lines = ['flowchart LR']
for m in mods_api:
    mid = m['name'].replace('/', '_').replace('-', '_')
    lines.append(f'  {mid}["{m["name"]}"]')
    for dm, c in sorted(dep[m['name'].split('/', 1)[1]].items()):
        lines.append(f'  {mid} -->|{c}| {dm.replace("/", "_").replace("-", "_")}["{dm}"]')
ad = ['# API and Dependency Graph', '', f"Generated from the graph at `{commit}`. Back to the [feature catalog](FEATURE_CATALOG.md). Per-endpoint detail is in each module file and in [`architecture/API_ARCHITECTURE.md`](../architecture/API_ARCHITECTURE.md).", '',
      '## API module to domain module (edge label = calls from endpoints)', '', '```mermaid', '\n'.join(lines), '```', '',
      '## Web module to API module (requests sent from UI interactions and screens)', '']
l2 = ['flowchart LR']
for (s, d), c in sorted(cross.items()):
    l2.append(f'  {s.replace("/", "_").replace("-", "_")}["{s}"] -->|{c}| {d.replace("/", "_").replace("-", "_")}["{d}"]')
ad += ['```mermaid', '\n'.join(l2), '```', '', '## API module to tables written', '',
       table(['Module', 'Tables (writing endpoints)'], [[m['name'], ', '.join(f'{t} ({c})' for t, c in sorted(tab[m['name'].split('/', 1)[1]].items())) or 'none (ephemeral or read-only)'] for m in mods_api]), '']
w('API_DEPENDENCY_GRAPH.md', '\n'.join(ad))

# ---- database graph
dbs = sorted((n for n in all_nodes.values() if n['type'] == 'DB'), key=lambda n: n['name'])
fk = sorted({(e['src'], e['dst']) for e in base_edges if e['rel'] == 'DEPENDS_ON' and all_nodes.get(e['src'], {}).get('type') == 'DB' and all_nodes.get(e['dst'], {}).get('type') == 'DB'})
er = ['erDiagram']
for s, d in fk:
    er.append(f'  {all_nodes[d]["name"]} ||--o{{ {all_nodes[s]["name"]} : references')
writers = collections.defaultdict(list)
for a in (n for n in all_nodes.values() if n['type'] == 'API'):
    for t in uniq(outs(a['id'], 'WRITES', 'DB')):
        writers[t].append(api_min.get(a['id'], a['id']))
dbm = ['# Database Relationship Graph', '', f"Generated from the graph at `{commit}` ({len(dbs)} tables, {len(fk)} foreign-key relationships, from `supabase/migrations`). Back to the [feature catalog](FEATURE_CATALOG.md). Columns, RLS and indexes are in [`data/DATABASE_ENTITY_MAP.md`](../data/DATABASE_ENTITY_MAP.md).", '',
       '```mermaid', '\n'.join(er), '```', '', '## Tables and the features that write them', '',
       table(['ID', 'Table', 'Created in', 'RLS', 'Status', 'Written by (MIN-)'], [[t['id'], t['name'], t.get('created_in') or '', 'yes' if t.get('rls') else 'no', t.get('status') or '', ', '.join(writers.get(t['id'], [])) or 'no endpoint writes it'] for t in dbs]), '']
w('DATABASE_GRAPH.md', '\n'.join(dbm))

# ---- state graphs
sts = sorted((n for n in all_nodes.values() if n['type'] == 'STATE'), key=lambda n: n['id'])
tr = collections.defaultdict(list)
for t, a_, b_ in A['state_edges']:
    tr[t].append((a_, b_))
sm = ['# State Transition Graphs', '', f"Generated from the graph at `{commit}`. Back to the [feature catalog](FEATURE_CATALOG.md).", '', '## Transition tables in packages/domain', '']
for n in sts:
    if n['kind'] != 'transition-table':
        continue
    lines = ['stateDiagram-v2']
    for a_, b_ in tr.get(n['name'], []):
        lines.append(f'  {a_} --> {b_}')
    users = sorted({api_min[x] for x in api_min for r in outs(x, 'CALLS', 'RULE') if n['name'] in json.dumps(all_nodes[r].get('evidence', [])) or False})
    sm += [f"### {n['id']} {n['name']} ({loc(n)})", '', '```mermaid', '\n'.join(lines), '```', '']
sm += ['## Status types without a transition table', '', 'These union types, contract enums and Postgres enums define states, but no allowed-transition table was found for them, so any change between values is decided in the handler code.', '',
       table(['ID', 'Name', 'Kind', 'Values', 'Location'], [[n['id'], n['name'], n['kind'], ', '.join(n.get('values', [])), loc(n)] for n in sts if n['kind'] != 'transition-table']), '']
w('STATE_GRAPHS.md', '\n'.join(sm))

# ---- test traceability
tt = ['# Test Traceability and Gaps', '', f"Generated from the graph at `{commit}`; test results from `{exec_commit}`. Back to the [feature catalog](FEATURE_CATALOG.md). Path-level test links are described in [`quality/TEST_COVERAGE_MAP.md`](../quality/TEST_COVERAGE_MAP.md).", '',
      '## Verification by module', '']
rows = []
for app, m, fname, st in module_files:
    vc = collections.Counter(all_nodes[x].get('verification') for x in st if all_nodes[x].get('layer') == 'feature-hierarchy')
    tot = sum(vc.values())
    rows.append([all_nodes[m]['name'], tot, vc['VERIFIED'], vc['PATH_LEVEL'], vc['NOT_RUN'], vc['FAILING'], vc['UNKNOWN'], f"{(100 * vc['VERIFIED'] / tot):.0f}%" if tot else '-'])
tt += [table(['Module', 'Feature nodes', 'Verified', 'Path-level', 'Not run', 'Failing', 'Unknown', 'Verified %'], rows), '']
untested = [all_nodes[x] for x in api_min.values() if all_nodes[x]['verification'] == 'UNKNOWN']
tt += [f'## Endpoint capabilities with no linked test ({len(untested)})', '', table(['ID', 'Capability', 'Route', 'Status'], [[n['id'], n['name'], n['route'], n['status']] for n in sorted(untested, key=lambda n: n['route'])]), '']
errn = [n for n in new_nodes if n['type'] == 'NANO' and n.get('code')]
ev_ = collections.Counter(n['verification'] for n in errn)
tt += [f'## Failure branches ({len(errn)})', '', f"Asserted by message text in a passing test: {ev_['VERIFIED']}. Only the endpoint is tested: {ev_['PATH_LEVEL']}. No evidence: {ev_['UNKNOWN']}. Not run: {ev_['NOT_RUN']}.", '']
eph = [all_nodes[x] for x in api_min.values() if all_nodes[x]['durability'] != 'durable']
tt += [f'## Ephemeral endpoint capabilities ({len(eph)} of {len(api_min)})', '', 'Their state lives in API process memory and is lost on restart. Grouped by module.', '',
       table(['Module', 'Count', 'Capabilities'], [[k, len(v), ', '.join(v)] for k, v in sorted(collections.defaultdict(list, {m_: [n['id'] for n in eph if all_nodes[api_by_name[n['route']]]['module'] == m_] for m_ in sorted({all_nodes[api_by_name[n['route']]]['module'] for n in eph})}).items())]), '']
gapg = ['flowchart LR', '  gaps(("Implementation gaps"))']
gcount = collections.Counter()
for n in new_nodes:
    for g in n.get('known_gaps', []):
        gcount[g.split(':')[0]] += 1
for k, (g, c) in enumerate(sorted(gcount.items())):
    gapg.append(f'  gaps --> g{k}["{clean(g, 60)}: {c}"]')
gapg.append(f'  gaps --> gdoc["registry features with no code or test: {len(missing_docf)}"]')
tt += ['## Gap graph', '', '```mermaid', '\n'.join(gapg), '```', '']
w('TEST_TRACEABILITY.md', '\n'.join(tt))

# ---- validation report
vr = ['# Graph Validation', '', f"Checks run by `docs/mindmap/tools/catalog.py` on the merged graph at `{commit}`. The script exits with an error and writes nothing if any check fails, so this file only exists for a passing graph. Back to the [feature catalog](FEATURE_CATALOG.md).", '',
      table(['Check', 'Result'], [
          ['Node IDs unique', f'pass ({len(ids)} nodes)'],
          ['Every edge has a relationship type', f"pass ({len(G['edges'])} edges, {len(set(e['rel'] for e in G['edges']))} types)"],
          ['No dangling edges (both ends exist)', 'pass'],
          ['Every hierarchy node has an existing parent of a shallower level', f'pass ({len(level_of)} hierarchy nodes)'],
          ['Every hierarchy node is reachable from PROJ-001', 'pass'],
          ['Every new node has a description and source evidence; every evidence file exists', f'pass ({len(new_nodes)} new nodes)'],
          ['Every API resource group (FEAT-) and registry feature (F-) is placed in the hierarchy', 'pass'],
          ['Every endpoint has a MINOR node; every screen a MAJOR node; every interaction a TINY node', f"pass ({len(api_min)} endpoints, {len(screen_major)} screens, {len(int_wrapped)} interactions)"],
          ['IDs stable: new IDs recorded in master/ID_LEDGER.json under catalog: keys, never reused', f"pass ({sum(1 for k in ledger['ids'] if k.startswith('catalog:'))} catalog keys)"]]), '',
      '## Counts (computed from the data)', '',
      table(['Level', 'Nodes'], [[l, level_count[l]] for l in LEVELS]), '',
      table(['Node type', 'Nodes'], [[t, c] for t, c in sorted(collections.Counter(n['type'] for n in G['nodes']).items())]), '',
      table(['Relationship', 'Edges'], [[t, c] for t, c in sorted(collections.Counter(e['rel'] for e in G['edges']).items())]), '',
      '## Not checked here', '', '- Whether each nano behaviour is correct at runtime: only tests can say that, and the verification column shows which ones a test asserts.',
      '- Mermaid syntax: checked by `tools/validate-mermaid.mjs` (see README); its result for this run is in the PR description.', '- Inline handlers that call helpers in other files: their state changes and requests are followed one hop inside the same file only.']
w('GRAPH_VALIDATION.md', '\n'.join(vr))
print('catalog:', len(new_nodes), 'new nodes,', len(new_edges), 'new edges; levels', dict(level_count), '; verification', dict(ver_count))
