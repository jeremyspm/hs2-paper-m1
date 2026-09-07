/* Assemble index.html from the parsed Module 1 question bank.
   Nothing here authors questions — stems, options and keys come from the capture
   verbatim; authored content lives in content/ and is joined by gates that fail
   the build in BOTH directions (an unmatched answer file entry is as fatal as an
   unanswered essay). */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { CHAINS } from './content/chains.js';
import { CASES } from './content/cases.js';
import { SAQ_ANSWERS, norm } from './content/saq-answers.js';
import { loadVideos, loadVideoMatches, loadPassages, matchVideo, matchPassage } from './content/explain.mjs';
import { structuredStems, plainText } from './stem-html.mjs';
import { OVERRIDES } from './content/overrides.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const M1 = 'C:/Users/USER/Desktop/github/hs2-anki/m1';           // parse-quizzes.mjs over the capture below
const CAP = 'C:/Users/USER/Desktop/github/_inbox/HS2 Module 1 Capture';  // written by prep-capture.mjs

const bank = JSON.parse(fs.readFileSync(path.join(M1, 'questions.json'), 'utf8'));
const imgBind = JSON.parse(fs.readFileSync(path.join(HERE, 'images.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(CAP, 'images/manifest.json'), 'utf8'));
const extManifest = JSON.parse(fs.readFileSync(path.join(CAP, 'images/ext-manifest.json'), 'utf8'));
/* the same captures, read a second way: structure kept, blanks and images in place.
   `q` (flat, hers verbatim) stays the id + search text; `qh` is what the student sees. */
const STEMS = structuredStems(CAP, manifest, extManifest);

/* quiz id -> name + system (titles in the capture are the noscript banner, so
   names are declared here, matching Canvas titles) */
const QUIZ = {
  /* Module 1.1 — cardiovascular */
  210992:['cvs','CVS1: Blood Vessels'],211057:['cvs','CVS2: The Heart (25 mk)'],
  211076:['cvs','CVS2 Mix & Match: Heart & Valves'],211004:['cvs','CVS3: Cardiac Conduction & ECG'],
  212647:['cvs','CVS4: Blood Pressure'],211141:['cvs','CVS Homeostasis (30 mk)'],
  211143:['cvs','Shock Quiz'],211088:['cvs','CVS: Fill the Blanks'],
  211002:['cvs','Heart Anatomy (40 mk)'],211124:['cvs','Heart Overview (MC)'],
  212709:['cvs','Heart Coverings & Structures (SAQ)'],211012:['cvs','CVS Review: SAQ & MC (35 mk)'],
  211111:['cvs','CVS Lab Review (SAQ, student-marked)'],211021:['cvs','Practice Lab 1: SAQ & MC (20 mk)'],
  /* "1.1 & 3.3" — the physics of flow and pressure; she reuses it in Module 3 */
  211113:['cvs','Biophysical Principles of Blood Flow & Pressure'],
  /* Module 1.2 — respiratory */
  211144:['resp','Resp: Basic Anatomy'],211101:['resp','Resp: Basic Physiology'],
  211039:['resp','Resp: Gas Laws'],211085:['resp','Respiration: Blood Carrying Gases'],
  211003:['resp','Airways, Baro- & Chemoreceptors'],211010:['resp','Respiratory Practice Test (20 mk)'],
  211920:['resp','Respiratory SAQ (20 mk)'],211026:['resp','Respiratory Terminology'],
  211067:['resp','Respiratory Pre-Lab (SAQ & MC)'],211070:['resp','Practice Lab 2: SAQ & MC (10 mk)'],
  211099:['resp','Respiratory Khan'],
  /* Module 1.3 — lymphatic */
  211013:['lymph','Lymphatic: Diseases & Terminology'],211019:['lymph','Fluid, Electrolyte & Fluid Balance (SAQ & MC)'],
  /* whole module */
  211102:['mixed','Module 1 Formative (50 mk)'],
};

/* deal-weight routing for mixed-quiz questions — coarse by design; used for
   stratification only, never for a coverage claim. APPEND rules, never insert. */
const ROUTE = [
  ['lymph', /\b(lymph|oedema|edema|spleen|thymus|tonsil|lacteal|interstitial fluid)/i],
  ['resp', /\b(resp|lung|breath|airway|alveol|trachea|bronch|pleura|diaphragm|chemorecept|ventilat|oxygen|carbon dioxide|pco2|po2|surfactant|inspir|expir)/i],
  ['cvs', /\b(heart|cardiac|blood vessel|blood pressure|ecg|shock|valve|atri|ventric|arter|vein|venous|capillar|barorecept|pulse|circulat|aorta|stroke volume|cardiac output|perfusion)/i],
];
const routeSys = (txt) => (ROUTE.find(([, re]) => re.test(txt)) || ['mixed'])[0];

/* id hashes the CONTENT (stem + key), not the position — Canvas renumbers, and a
   review quiz can carry the same stem twice; identical content dedupes silently. */
const qid = (quiz, stem, content) =>
  'q' + crypto.createHash('sha1').update(quiz + '|' + stem + '|' + JSON.stringify(content ?? '')).digest('hex').slice(0, 10);

const stripImgRefs = (s) => s
  .replace(/\[\[IMG[^\]]*\]\]/g, ' ')
  /* Canvas page furniture that leaks into stems — never part of the question */
  .replace(/https?:\/\/\S+/g, ' ')
  .replace(/\(?\s*Links to an external site\.?\s*\)?/gi, ' ')
  .replace(/This video may display YouTube ads\.?/gi, ' ')
  .replace(/Continue to YouTube content\.?/gi, ' ')
  .replace(/Minimize embedded content\.?/gi, ' ')
  .replace(/\s+/g, ' ').trim();

const questions = [], held = [], quizzes = [];
const saqUsed = new Set();
const structFails = []; let nInline = 0;
const overridesUsed = new Set();

for (const z of bank.quizzes) {
  const fid = (z.file.match(/HS2CAP-(\d+)/) || [])[1];
  const [qsys, qname] = QUIZ[fid] || ['mixed', 'Quiz ' + fid];
  let kept = 0;
  z.questions.forEach((q, idx) => {
    if (q.type === 'text_only_question' || q.type === 'unknown') return;
    const stemRaw = q.q || '';
    let stem = stripImgRefs(stemRaw);
    /* Some of her matching questions have NO stem in Canvas itself — the content
       is entirely in the pairs. A synthesised stem keeps them dealable; it is
       labelled generic on purpose, never invented content. */
    if (!stem && q.key && q.key.kind === 'pairs' && q.key.pairs.length >= 2)
      stem = 'Match each item with its correct partner.';
    if (!stem) { held.push({ quiz: qname, why: 'empty stem' }); return; }
    const imgs = ((imgBind[path.basename(z.file)] || {})[idx] || []);
    const needsImg = /\[\[IMG/.test(stemRaw) || /\b(image|diagram|picture|micrograph|labell?ed|figure) (above|below|shown)\b/i.test(stem);
    if (needsImg && !imgs.length) { held.push({ quiz: qname, why: 'image did not survive capture', q: stem.slice(0, 80) }); return; }
    const sys = qsys === 'mixed' ? routeSys(stem + ' ' + (q.answers || []).map(a => a.text).join(' ')) : qsys;
    const base = { id: qid(fid, stem, q.key), quiz: fid, sys, pts: +q.points || 1, q: stem, imgs };
    /* structured stem: only images this question actually ships may be placed inline;
       blank markers are validated per type below, so a stem can never show a blank
       the key does not have, or hide one it does. */
    const st = (STEMS[path.basename(z.file)] || {})[idx];
    if (st && st.html) {
      base.qh = st.html.replace(/\[\[IMG:([^\]]+)\]\]/g, (m, f) => imgs.includes(f) ? m : '');
      if (!/<(?:p|ul|ol|div)\b/.test(base.qh)) base.qh = '<p>' + base.qh + '</p>';
    } else base.qh = '<p>' + stem.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])) + '</p>'; // synthesised stem
    /* one-line text of the SAME stem for titles and the Ask-AI prompt — the flat
       capture split words at inline tags ("a nta gonist") and carries "[ Select ]" */
    base.qt = plainText(base.qh);
    const blankMarkers = (h) => [...(h || '').matchAll(/\[\[BLANK:(\d+|\?)\]\]/g)].map(m => m[1]);
    const placeBlanks = (n) => {
      const ks = blankMarkers(base.qh);
      const ok = base.qh && ks.length === n && !ks.includes('?') && new Set(ks).size === n && ks.every(k => +k < n);
      if (!ok) { structFails.push(`${qname} #${idx + 1}: ${n} blanks in key, markers [${ks.join(',')}] in stem — "${stem.slice(0, 60)}"`); base.qh = (base.qh || '').replace(/\[\[BLANK:[^\]]*\]\]/g, '____'); return null; }
      nInline++;
      return st.ctx;
    };
    if (base.qh && q.type !== 'multiple_dropdowns_question' && q.type !== 'fill_in_multiple_blanks_question' && blankMarkers(base.qh).length) {
      structFails.push(`${qname} #${idx + 1}: blank markers in a ${q.type}`); base.qh = base.qh.replace(/\[\[BLANK:[^\]]*\]\]/g, '____');
    }

    if (q.type === 'essay_question') {
      const hit = SAQ_ANSWERS.find(a => norm(stem).startsWith(a.k) || norm(stem).includes(a.k));
      if (!hit) { held.push({ quiz: qname, why: 'essay with no authored model answer', q: stem.slice(0, 80) }); return; }
      saqUsed.add(hit.k);
      questions.push({ ...base, type: 'essay', pts: Math.max(base.pts, hit.steps.length ? Math.min(6, hit.steps.length) : base.pts), saq: { steps: hit.steps, src: (hit.hers ? 'Her own answer · ' : 'Model answer is the tool’s · from ') + hit.src } });
      kept++; return;
    }
    if (!q.key) { held.push({ quiz: qname, why: 'no extracted key', q: stem.slice(0, 80) }); return; }
    if (q.key.kind === 'pairs') {
      if (q.key.pairs.length < 2) { held.push({ quiz: qname, why: 'matching with <2 recovered pairs', q: stem.slice(0, 80) }); return; }
      questions.push({ ...base, type: 'match', pairs: q.key.pairs, pts: Math.max(base.pts, q.key.pairs.length) });
      kept++; return;
    }
    if (q.key.kind === 'blanks') {
      if (q.key.blanks.some(b => !b.options.length || !b.correct)) { held.push({ quiz: qname, why: 'blank with no options/correct', q: stem.slice(0, 80) }); return; }
      /* bk: how the blank is answered — 'dd' = her dropdown (options are choices, ONE
         is right), 'fib' = typed (options are the accepted spellings, ALL are right).
         The two must grade differently; the old single path marked any dropdown
         choice correct. */
      const bk = q.type === 'multiple_dropdowns_question' ? 'dd' : 'fib';
      const ctx = placeBlanks(q.key.blanks.length);
      const blanks = q.key.blanks.map((b, k) => ({ ...b, ctx: ctx ? (ctx[k] || '') : '' }));
      /* extra accepted answers, declared in content/overrides.js and matched here by
         id + blank + her correct answer — a stale override fails the build below */
      for (const o of OVERRIDES.filter(o => o.id === base.id)) {
        const b = blanks[o.blank];
        if (!b || b.correct !== o.correct) continue;
        b.also = [...new Set([...(b.also || []), ...o.also])];
        overridesUsed.add(o);
      }
      questions.push({ ...base, type: 'cloze', bk, blanks, pts: Math.max(base.pts, q.key.blanks.length) });
      kept++; return;
    }
    /* options family. Some of her MCQs store options as bare letters (a/b/c/d)
       with the real text only in each answer's title attribute — enrich from the
       title, keys re-derived through the SAME rule so they can never diverge. */
    const cleanTitle = t => (t || '').replace(/\.?\s*This was the correct answer\.?$/i, '').trim();
    const enrich = a => { const t = (a.text || '').trim(), ti = cleanTitle(a.titleAttr);
      return (t.length < 3 && ti.length >= 3) ? ti : t; };
    const ans = (q.answers || []).filter(a => (a.text || '').trim() || cleanTitle(a.titleAttr));
    let opts = [...new Set(ans.map(enrich).filter(Boolean))];
    /* "All/None of the above" only means what it says when it IS below the others —
       the capture holds them in Canvas's per-attempt shuffle order. Display order only. */
    const above = o => /^(?:all|none|both) of (?:the above|these)/i.test(o);
    opts = [...opts.filter(o => !above(o)), ...opts.filter(above)];
    const key = [...new Set(ans.filter(a => a.correctClass || a.weight === '100').map(enrich))];
    const lettered = opts.every(o => o.length < 3) && /\b[a-d]\.\s/.test(stem);
    if (!opts.length || opts.length < 2 || !key.length || !key.every(k => opts.includes(k))) {
      held.push({ quiz: qname, why: 'key text not among options', q: stem.slice(0, 80) }); return;
    }
    if (opts.some(o => o.length < 3) && !lettered && !imgs.length) {
      held.push({ quiz: qname, why: 'letter-only options with no lettered stem or image', q: stem.slice(0, 80) }); return;
    }
    const type = q.type === 'true_false_question' ? 'tf'
      : q.type === 'multiple_answers_question' ? 'multi' : 'mcq';
    /* bare-letter options (a/b/c/d) get their text from the stem's own lettered list,
       so the card reads "b. Fibula" instead of "b" — display only; the key stays hers.
       Only when every option letter is found exactly once in the stem. */
    let ol = null;
    if (lettered) {
      const found = {};
      for (const m of stem.matchAll(/(?:^|\s)([a-d])\.\s*(.+?)(?=\s+[a-d]\.\s*\S|$)/g)) { if (found[m[1]]) { found.__dup = true; } found[m[1]] = m[2].trim(); }
      if (!found.__dup && opts.every(o => found[o.toLowerCase()])) ol = Object.fromEntries(opts.map(o => [o, found[o.toLowerCase()]]));
    }
    questions.push({ ...base, type, opts, key, ...(ol ? { ol } : {}) });
    kept++;
  });
  if (kept) quizzes.push({ id: fid, name: qname, sys: qsys, n: kept });
}

/* ── the explain layer: video + verbatim passage per question ──────── */
const videos = loadVideos(path.join(HERE, 'content'));
const vmatches = loadVideoMatches(path.join(HERE, 'content'), videos);
const passages = loadPassages();
const SLIDESRC = path.join(CAP, 'slides');
let nVid = 0, nRef = 0, nSlide = 0;
const usedSlides = new Set(), vmUsed = new Set();
for (const q of questions) {
  const v = matchVideo(q, videos, vmatches); if (v) { q.vid = v; nVid++; vmUsed.add(q.id); }
  const r = matchPassage(q, passages);
  if (r) {
    /* A question that carries its OWN image is its own authority — a retrieved
       slide with a different letter/label scheme beside it contradicts the
       figure the student just answered on (the label-the-glands bug). Such
       questions get text quotes only, never a second figure. */
    if (r.slug && q.imgs.length) { /* drop the slide ref */ }
    else if (r.slug) {
      const png = path.join(SLIDESRC, r.slug, `slide-${r.n}.png`);
      if (fs.existsSync(png)) {
        const name = `${r.slug}-${r.n}.jpg`;
        usedSlides.add(JSON.stringify([png, name]));
        q.ref = { src: r.src, slide: name }; nSlide++;
      } else if (r.t) q.ref = { t: r.t, src: r.src }; /* Module 1 has no rendered decks: quote
        the slide's own text instead — never point at a picture we can't show */
    } else q.ref = { t: r.t, src: r.src };
    if (q.ref) nRef++;
  }
}
console.log(`explain layer: ${nVid}/${questions.length} questions matched a video (${Math.round(100 * nVid / questions.length)}%), ` +
  `${nRef} matched her material (${nSlide} as real slide images) — from ${videos.length} videos, ${passages.length} passages`);
/* compress + ship only the referenced slides */
const SLIDEOUT = path.join(HERE, 'img', 'slides');
fs.mkdirSync(SLIDEOUT, { recursive: true });
fs.writeFileSync(path.join(HERE, 'slides-todo.json'),
  JSON.stringify([...usedSlides].map(s => JSON.parse(s)), null, 1));

/* ── gates ─────────────────────────────────────────────────────────── */
const fails = [];
for (const a of SAQ_ANSWERS) if (!saqUsed.has(a.k)) fails.push('saq-answers entry matched NO essay: "' + a.k + '"');
/* a verified video match whose question id no longer exists is stale evidence,
   not a harmless extra — same rule as an override that matched nothing */
for (const qid of Object.keys(vmatches)) if (!vmUsed.has(qid)) fails.push('video-matches entry matched NO question: ' + qid);
/* identical content captured twice (review quizzes repeat questions) — keep one */
const dup = new Set(); let dropped = 0;
for (let i = questions.length - 1; i >= 0; i--) {
  if (dup.has(questions[i].id)) { questions.splice(i, 1); dropped++; }
  else dup.add(questions[i].id);
}
if (dropped) console.log('deduped', dropped, 'identical duplicate captures');
for (const q of questions) for (const f of q.imgs) if (!fs.existsSync(path.join(CAP, 'images', f))) fails.push('missing image file ' + f);
for (const c of CHAINS) if (c.beads.filter(b => b.t).length < 4) fails.push('chain too short: ' + c.id);
/* an exam case ships only whole: scenario, and every question with steps and a named source */
for (const c of CASES) {
  if (!c.id || !c.name || !c.sys || !c.scenario || !c.questions?.length) fails.push('case pack incomplete: ' + (c.id || '?'));
  for (const cq of c.questions || []) if (!cq.q || !cq.marks || !cq.steps?.length || !cq.src) fails.push(`case ${c.id}: a question lacks text, marks, steps or source`);
}
/* every blank-type question must carry every one of its blanks inline, once, in the
   stem the student sees — a blank the key has but the stem lacks is the exact bug this
   layer exists to kill, so it fails the build rather than falling back quietly */
for (const s of structFails) fails.push('stem structure: ' + s);
for (const o of OVERRIDES) if (!overridesUsed.has(o)) fails.push(`override matched nothing: ${o.id} blank ${o.blank} "${o.correct}"`);
for (const q of questions) if (!q.qh) fails.push('no structured stem for ' + q.id + ' "' + q.q.slice(0, 60) + '"');
for (const q of questions) if (q.qh && /\[\[(?!IMG:|BLANK:\d+\]\])/.test(q.qh)) fails.push('stray marker in ' + q.id);
if (fails.length) { console.error('BUILD FAILED:\n  ' + fails.join('\n  ')); process.exit(1); }
console.log(`structured stems: ${questions.filter(q => q.qh).length}/${questions.length} · blanks placed inline in ${nInline} cloze questions`);

/* ── emit ──────────────────────────────────────────────────────────── */
/* video reach is a stat, not a sentence: the template reads these so the home
   screen can never quote a count the bank has moved past */
const reached = new Set();
for (const q of questions) if (q.vid) { reached.add(q.vid.id); if (q.vid.alt) reached.add(q.vid.alt.id); }
const DATA = {
  built: new Date().toISOString().slice(0, 10),
  stats: { n: questions.length, held: held.length, videos: videos.length, videosReached: reached.size,
    videosFill: videos.filter(v => v.ch).length,
    withVideo: questions.filter(q => q.vid).length },
  quizzes: quizzes.sort((a, b) => a.sys.localeCompare(b.sys) || a.name.localeCompare(b.name)),
  questions, chains: CHAINS, cases: CASES, held,
};
const tpl = fs.readFileSync(path.join(HERE, 'template.html'), 'utf8');
const marker = '/*@BANK@*/';
if (tpl.split(marker).length !== 2) { console.error('BUILD FAILED: expected exactly one ' + marker); process.exit(1); }
const out = tpl.replace(marker, JSON.stringify(DATA));
fs.writeFileSync(path.join(HERE, 'index.html'), out);

/* images ship beside the page */
const IMGDIR = path.join(HERE, 'img');
fs.mkdirSync(IMGDIR, { recursive: true });
const used = new Set(questions.flatMap(q => q.imgs));
for (const f of used) fs.copyFileSync(path.join(CAP, 'images', f), path.join(IMGDIR, f));

fs.writeFileSync(path.join(HERE, 'held.json'), JSON.stringify(held, null, 1));
const by = {}; for (const q of questions) by[q.sys] = (by[q.sys] || 0) + 1;
const byT = {}; for (const q of questions) byT[q.type] = (byT[q.type] || 0) + 1;
console.log('bank:', questions.length, 'questions ·', quizzes.length, 'quizzes ·', used.size, 'images ·', held.length, 'held');
console.log('by system:', JSON.stringify(by), '\nby type:', JSON.stringify(byT));
console.log('index.html', (fs.statSync(path.join(HERE, 'index.html')).size / 1024 | 0) + ' KB');
