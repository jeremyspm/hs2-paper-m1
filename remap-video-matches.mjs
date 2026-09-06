/* content/video-matches.json for Module 1 = the caption-verified matches built on
   2026-09-06 (dmdm-videos/video-matches.json, work dir _captions/work/m1), re-keyed to
   THIS build's question ids.

   Why a remap: the caption pipeline's extract_bank.py hashed each question as
   sha1(exportfile[:60] | stem | json.dumps(key)) and Python's json.dumps puts a space
   after every ":" and ",", so not one of its 337 non-essay ids equals the id build.mjs
   derives from the same question (sha1(quizid | stem | JSON.stringify(key))). The
   stems are the same words, so the join is on the stem: normalised text (letters and
   digits only), then quiz title if two questions share a stem, then a token-overlap
   fallback for the two stems whose YouTube-player text the capture adapter removed.
   Every source entry must land on exactly one built question or this script fails —
   a verified match that quietly vanished would be the same lie as a stale one.

   Run AFTER a build (it reads DATA out of index.html), then build again so the
   matches are joined and gated: `node build.mjs && node remap-video-matches.mjs && node build.mjs`. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = process.env.M1_MATCHES || path.join(HERE, '..', 'dmdm-videos', 'video-matches.json');
const Q407 = process.env.M1_Q407 || path.join(HERE, '..', '_captions', 'work', 'm1', 'questions-407.json');
const BUILT = path.join(HERE, 'index.html');
const OUT = path.join(HERE, 'content', 'video-matches.json');

const src = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const rows = new Map(JSON.parse(fs.readFileSync(Q407, 'utf8')).map(r => [r.id, r]));
const built = fs.readFileSync(BUILT, 'utf8');
const s = built.indexOf('const DATA = ');
const DATA = JSON.parse(built.slice(s + 13, built.indexOf('\n', s) - 1));

/* the two stem cleaners differ in what they strip (build.mjs drops bare URLs and Canvas
   furniture; extract_bank.py dropped only "Source <url>" and "Links to an external site"),
   so compare on letters and digits with URLs and image markers gone from both sides */
const norm = (t) => String(t || '').toLowerCase().replace(/\[\[img[^\]]*\]\]/g, ' ').replace(/https?:\/\/\S+/g, ' ')
  .replace(/links to an external site/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();
const keyOf = (q, pairs) => norm(q) || (pairs && pairs.length ? 'PAIRS:' + JSON.stringify(pairs) : '');
const toks = (t) => new Set(norm(t).split(' ').filter(w => w.length > 3));
const jacc = (a, b) => { let n = 0; for (const x of a) if (b.has(x)) n++; return n / (a.size + b.size - n || 1); };

/* the source rows carry the full Canvas quiz title; the build carries the Canvas quiz id.
   The parsed bank has both (title per HS2CAP-<id>.html), so a duplicate stem is settled
   by quiz id, not by guessing from a short name */
const BANK = process.env.M1_BANK || path.join(HERE, '..', 'hs2-anki', 'm1', 'questions.json');
const fidByTitle = new Map(JSON.parse(fs.readFileSync(BANK, 'utf8')).quizzes.map(z => [norm(z.title), (z.file.match(/HS2CAP-(\d+)/) || [])[1]]));

const byStem = new Map();   // norm stem -> [built question]
for (const q of DATA.questions) { const k = keyOf(q.q, q.pairs); if (!byStem.has(k)) byStem.set(k, []); byStem.get(k).push(q); }
/* a source question this build HOLDS (an essay with no model answer yet, a keyless
   question, a lost figure) has no built id on purpose — report it, don't fail on it */
const heldKeys = DATA.held.map(h => [norm(h.q || '').slice(0, 60), h]);
const heldFor = (r) => { const k = norm(r.q).slice(0, 60); return k && heldKeys.find(([hk]) => hk && (hk === k || hk.startsWith(k) || k.startsWith(hk)))?.[1]; };

const matches = {}, fail = [], held = [], how = { exact: 0, byQuiz: 0, fuzzy: 0, merged: 0 };
for (const [oldId, list] of Object.entries(src.matches)) {
  const r = rows.get(oldId);
  if (!r) { fail.push(`${oldId}: not in questions-407.json`); continue; }
  let cands = byStem.get(keyOf(r.q, r.pairs)) || [];
  if (cands.length > 1) {
    const fid = fidByTitle.get(norm(r.quizTitle));
    const same = cands.filter(q => q.quiz === fid);
    if (same.length === 1) { cands = same; how.byQuiz++; }
  } else if (cands.length === 1) how.exact++;
  if (!cands.length) {
    /* fuzzy: same type, best token overlap, and it must be a clear winner */
    const rt = toks(r.q);
    const scored = DATA.questions.filter(q => q.type === r.type).map(q => [jacc(rt, toks(q.q)), q]).sort((a, b) => b[0] - a[0]);
    if (scored.length && scored[0][0] >= 0.6 && (scored.length < 2 || scored[0][0] - scored[1][0] >= 0.2)) { cands = [scored[0][1]]; how.fuzzy++; }
  }
  if (!cands.length) {
    const h = heldFor(r);
    if (h) { held.push(`${oldId} "${r.q.slice(0, 60)}" — held: ${h.why}`); continue; }
    fail.push(`${oldId} "${r.q.slice(0, 70)}" → no built question and not held`); continue;
  }
  if (cands.length !== 1) { fail.push(`${oldId} "${r.q.slice(0, 70)}" → ${cands.length} built questions in quizzes ${cands.map(q => q.quiz).join('/')}`); continue; }
  const q = cands[0];
  if (matches[q.id]) {
    /* two source rows (one stem captured twice with slightly different keys) collapsed
       to one built question: keep both lists' videos, best first, top two */
    const seen = new Set(matches[q.id].map(m => m.id));
    for (const m of list) if (!seen.has(m.id) && matches[q.id].length < 2) { matches[q.id].push(m); seen.add(m.id); }
    how.merged++; continue;
  }
  matches[q.id] = list.slice(0, 2);
}
if (fail.length) { console.error('✗ remap failed:\n  ' + fail.join('\n  ')); process.exit(1); }
if (held.length) console.log(`${held.length} source matches belong to questions this build holds (they return when the question does):\n  ` + held.join('\n  '));

const vids = new Set(); let n = 0;
for (const l of Object.values(matches)) for (const m of l) { vids.add(m.id); n++; }
fs.writeFileSync(OUT, JSON.stringify({
  built: src.built, module: 'm1',
  method: src.method + ` Re-keyed to hs2-paper-m1's question ids by remap-video-matches.mjs (${how.exact} joined on the exact stem, ${how.byQuiz} on stem + quiz, ${how.fuzzy} on token overlap after the capture adapter removed embedded-player text from the stem); the match lists themselves are unchanged.`,
  source: { file: 'dmdm-videos/video-matches.json', built: src.built, stats: src.stats },
  stats: { questions_with_video: Object.keys(matches).length, matches: n, videos_used: vids.size, source_questions_held_in_this_build: held.length },
  matches,
}, null, 1));
console.log(`wrote ${OUT}: ${Object.keys(matches).length} built questions carry ${n} matches from ${Object.keys(src.matches).length} source questions (${how.exact} exact, ${how.byQuiz} by quiz id, ${how.fuzzy} fuzzy, ${how.merged} merged, ${held.length} held), ${vids.size} videos`);
