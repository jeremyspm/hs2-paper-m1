/* content/dmdm-all.json for Module 1 = the Module 1 shelf exactly as the hub declares
   it. hs2-module1/index.html OWNS that shelf (`const VIDEOS = {topic: [{id,t,d,role,…}]}`;
   the anatomy-video-index page fails its build on any mismatch with it), so this file
   is a flatten, not a list of its own: {id, d, t, sys} per video, `sys` from the topic
   key (cvs1–4 + shock → cvs, resp1–4 → resp, lymph → lymph). Four videos sit under two
   topics on the hub; they appear once here, under the first. Re-run after the hub shelf
   changes; the build then re-gates video-matches.json against the new list. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const HUB = process.env.HS2_MODULE1 || path.join(HERE, '..', 'hs2-module1', 'index.html');
const OUT = path.join(HERE, 'content', 'dmdm-all.json');

const html = fs.readFileSync(HUB, 'utf8');
const i = html.indexOf('const VIDEOS=');
const j = html.indexOf('\n};', i);
if (i < 0 || j < 0) { console.error('✗ no `const VIDEOS=` block in ' + HUB); process.exit(1); }
const VIDEOS = new Function('return ' + html.slice(i + 'const VIDEOS='.length, j + 2))();

const SYS = { cvs1: 'cvs', cvs2: 'cvs', cvs3: 'cvs', cvs4: 'cvs', shock: 'cvs', resp1: 'resp', resp2: 'resp', resp3: 'resp', resp4: 'resp', lymph: 'lymph' };
const out = [], seen = new Map(), dups = [];
for (const [topic, list] of Object.entries(VIDEOS)) {
  if (!SYS[topic]) { console.error(`✗ hub topic "${topic}" has no system mapping here — add it`); process.exit(1); }
  for (const v of list) {
    if (!v.id || !v.t || !v.d) { console.error(`✗ ${topic}: a video is missing id/t/d: ${JSON.stringify(v)}`); process.exit(1); }
    if (seen.has(v.id)) { dups.push(`${v.id} (${seen.get(v.id)} → ${topic})`); continue; }
    seen.set(v.id, topic);
    out.push({ id: v.id, d: v.d, t: v.t, sys: SYS[topic] });
  }
}
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
const by = {}; for (const v of out) by[v.sys] = (by[v.sys] || 0) + 1;
console.log(`wrote ${OUT}: ${out.length} videos ${JSON.stringify(by)} from ${Object.keys(VIDEOS).length} hub topics` + (dups.length ? `; ${dups.length} listed under two topics, kept once: ${dups.join(', ')}` : ''));
