import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';
const dom = new JSDOM('<!doctype html><html><body></body></html>', { pretendToBeVisual: true });
globalThis.window = dom.window; globalThis.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
for (const k of ['Element','HTMLElement','SVGElement','Node','DocumentFragment','DOMParser','XMLSerializer','NodeFilter','HTMLFormElement','HTMLTemplateElement','Text','Comment','MutationObserver','NamedNodeMap','CharacterData','HTMLCollection','Attr','getComputedStyle']) { if (dom.window[k] && !(k in globalThis)) globalThis[k] = dom.window[k]; }
const mermaid = (await import('mermaid')).default;
mermaid.initialize({ startOnLoad: false });
const root = process.argv[2];
const files = [];
(function walk(d){ for (const f of fs.readdirSync(d)) { const p = path.join(d,f); fs.statSync(p).isDirectory()? walk(p) : (p.endsWith('.md')||p.endsWith('.mmd')) && files.push(p);} })(root);
let ok = 0, bad = 0; const fails = [];
for (const f of files) {
  const t = fs.readFileSync(f,'utf8');
  const blocks = f.endsWith('.mmd') ? [t] : [...t.matchAll(/```mermaid\n([\s\S]*?)```/g)].map(m=>m[1]);
  for (const [i,b] of blocks.entries()) {
    try { await mermaid.parse(b); ok++; } catch (e) { bad++; fails.push(`${f} #${i}: ${String(e.message||e).split('\n').slice(0,3).join(' | ')}`); }
  }
}
console.log(JSON.stringify({ ok, bad, fails: fails.slice(0,15) }, null, 1));
