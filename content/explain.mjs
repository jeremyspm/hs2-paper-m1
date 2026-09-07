/* The explain layer, computed at BUILD time — retrieval, not generation.
   For each question: (1) the best-matching Dr Matt & Dr Mike video, ranked
   concept-first and duration-aware; (2) the best verbatim passage from HER
   Module 1 material (learning pages preferred over deck fragments — a choppy
   slide table does not retrieve or read). Module 1's decks are not rendered to
   images, so a deck hit is quoted as text (build.mjs decides which). Below threshold -> nothing: no video
   beats a wrong video, and absence is the information. Nothing here writes
   prose; passages are quoted verbatim with their source named. */
import fs from 'node:fs';
import path from 'node:path';

const TXT = 'C:/Users/USER/Desktop/github/canvas-harvest/CanvasArchive/2026/Health Science 2 (722.541-26-MC-21) - Health Science 2 (61986)/text';

const STOP = new Set(('the and for with which following are was were this that from into onto your their been have has ' +
  'correct answer true false statement statements system systems body called known example examples describe explain ' +
  'identify select choose match mix nervous muscular skeletal endocrine musculoskeletal anatomy physiology overview ' +
  'cardiovascular respiratory lymphatic circulatory ' +
  'cardiovascular respiratory lymphatic circulatory ' +
  'these those there where when what while would could should more most much many some also then than each other ' +
  'made make making used uses using type types kind kinds part parts main within between because during').split(' '));
const KEEP = new Set('atp csf pth tsh adh ach ecg cns pns ans dna gh fsh lh t3 t4 apc bbb'.split(' '));

export const terms = (s) => {
  const out = new Set();
  for (const w of String(s).toLowerCase().replace(/[^a-z0-9+]+/g, ' ').split(' ')) {
    if (KEEP.has(w) || (w.length >= 4 && !STOP.has(w))) out.add(w);
  }
  return out;
};

const mins = (d) => { const p = String(d).split(':').map(Number); return p.length === 3 ? p[0] * 60 + p[1] : (p[0] || 0); };

export function loadVideos(dir) {
  return JSON.parse(fs.readFileSync(path.join(dir, 'dmdm-all.json'), 'utf8'))
    .map(v => ({ ...v, m: mins(v.d), terms: terms(v.t.replace(/\|.*$/, '')) }));
}

export function loadPassages() {
  const passages = [];
  const pageDir = path.join(TXT, 'pages'), fileDir = path.join(TXT, 'files');
  for (const f of fs.readdirSync(pageDir)) {
    if (!/^LEARNING PAGE (CVS|RESP)\b|^LEARNING PAGE- Lymphatic|^MODULE 1\.1- Circulatory Shock/i.test(f)) continue;
    const src = /Circulatory Shock/.test(f) ? 'Circulatory Shock page'
      : f.replace(/^LEARNING PAGE[- ]+/, '').replace(/\.txt$/, '').replace(/-.*$/, '').trim() + ' learning page';
    const text = fs.readFileSync(path.join(pageDir, f), 'utf8');
    let buf = [];
    for (const para of text.split(/\n\s*\n/)) {
      const p = para.replace(/\s+/g, ' ').trim();
      if (!p) continue;
      buf.push(p);
      const joined = buf.join(' ');
      if (joined.split(' ').length >= 30) {
        /* question blocks, reading lists and link cruft ask/point rather than teach */
        const cruft = /(links to an external site|chapter \d+|check your understanding|scroll through|patton (and|&) thibodeau|\bquiz\b|questions? can you|_{3,}|\[ select \]|wordlist)/i;
        if (joined.length > 40 && (joined.match(/\?/g) || []).length < 3 && !/\[image:/i.test(joined) && !cruft.test(joined))
          passages.push({ t: joined.replace(/https?:\/\/\S+/g, ' ').slice(0, 420), src, page: true });
        buf = [];
      }
    }
  }
  for (const f of fs.readdirSync(fileDir)) {
    /* the 2026 Module 1 teaching decks plus the older decks she still links
       (2024 revision + lymphatic, 2019 Resp 4, the acid-base tutorial deck) —
       named by their own file names, no invented year */
    if (!/^(2026 (CIRCULATION|CVS|Cardiovascular|Lymphatic|RESP|Resp|Respiration)|2024 Revision mod 1|2024 Lymphatic|2019 S2 Resp|Respiratory Regulation and AcidBase)/i.test(f)) continue;
    const base = f.replace(/\.pptx\.txt$/, '');
    const deck = base.replace(/^2026 /, '');
    const text = fs.readFileSync(path.join(fileDir, f), 'utf8');
    for (const m of text.split(/--- slide (\d+) ---/).slice(1).reduce((a, v, i, arr) => (i % 2 === 0 && a.push([v, arr[i + 1] || '']), a), [])) {
      const [n, body] = m;
      const clean = body.replace(/\[speaker notes[^\]]*\][^\n]*/g, '').replace(/\s+/g, ' ').trim();
      if (clean.split(' ').length < 15) continue;
      /* objective-list and question slides ASK, they don't TEACH — never quote them */
      if ((clean.match(/\b(Describe|Explain|Identify|Differentiate)\b/g) || []).length >= 2) continue;
      if ((clean.match(/\?/g) || []).length >= 3) continue;
      if (/_{3,}|\[ Select \]|\bWORDLIST\b/.test(clean)) continue;   // a blank-filling exercise, not teaching
      if (/(links to an external site|chapter \d+|check your understanding|patton box)/i.test(clean)) continue;
      const slug = base.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '');
      passages.push({ t: clean.replace(/https?:\/\/\S+/g, ' ').slice(0, 420), src: `${base} deck · slide ${n}`, page: false, slug, n: +n });
    }
  }
  for (const p of passages) p.terms = terms(p.t);
  return passages;
}

/* score a candidate's term-set against a question: key terms weigh double.
   A candidate term also hits when it is a stem of a question term (recept ⊂
   receptors, nocicept ⊂ nociceptors) — light stemming beats none. */
const stemOf = (t) => t.replace(/s$/, '');
function inSet(set, t) {
  if (set.has(t) || set.has(stemOf(t))) return true;
  /* substring credit needs BOTH sides >=8 chars — 'adrenal' must not buy 'adrenaline' */
  const ts = stemOf(t);
  if (ts.length >= 8) for (const q of set) { const qs = stemOf(q);
    if (qs.length >= 8 && (qs.includes(ts) || ts.includes(qs))) return true; }
  return false;
}
function score(cand, keyT, stemT) {
  let s = 0, hits = 0, big = 0;
  for (const t of cand) {
    if (inSet(keyT, t)) { s += 2; hits++; if (t.length >= 8) big++; }
    else if (inSet(stemT, t)) { s += 1; hits++; if (t.length >= 8) big++; }
  }
  return { s, hits, big };
}
/* The video per question is a LOOKUP into content/video-matches.json, not a
   title match. Until 2026-09-06 this function scored each video's TITLE against
   the question's key + stem terms; it attached 163 videos and roughly a third
   were wrong ("serratus ANTERIOR" bought the Anterior Pituitary video, every
   bone-growth question got the pituitary too). video-matches.json is built
   outside this repo from the videos' own caption tracks: every question's terms
   BM25-scored against 90-second caption windows, the top candidates judged by a
   model reading the caption text, every accepted match's quote located verbatim
   in the captions (that position is `at`), then a second, adversarial pass
   trying to refute each survivor. The captions themselves are not shipped.
   A question with no entry gets no video — absence is the information, and no
   video beats a wrong video. */
const secs = (d) => { const p = String(d).split(':').map(Number); return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : (p[0] || 0) * 60 + (p[1] || 0); };

export function loadVideoMatches(dir, videos) {
  const j = JSON.parse(fs.readFileSync(path.join(dir, 'video-matches.json'), 'utf8'));
  const byId = new Map(videos.map(v => [v.id, v]));
  const fail = [];
  for (const [qid, list] of Object.entries(j.matches || {})) {
    if (!Array.isArray(list) || !list.length) { fail.push(`${qid}: empty match list`); continue; }
    for (const m of list) {
      const v = byId.get(m.id);
      if (!v) { fail.push(`${qid}: video ${m.id} is not in dmdm-all.json`); continue; }
      if (!Number.isInteger(m.at) || m.at < 0 || m.at >= secs(v.d)) fail.push(`${qid}: ${m.id} at=${m.at}s is outside a ${v.d} video`);
      if (!m.quote || String(m.quote).split(/\s+/).length < 4) fail.push(`${qid}: ${m.id} has no provenance quote`);
    }
  }
  if (fail.length) throw new Error('video-matches.json does not agree with the video list:\n  ' + fail.join('\n  '));
  return j.matches;
}

export function matchVideo(q, videos, matches) {
  const list = matches[q.id];
  if (!list) return null;
  const byId = new Map(videos.map(v => [v.id, v]));
  const shape = (m) => { const v = byId.get(m.id); return { id: v.id, t: v.t.slice(0, 70), d: v.d, at: m.at, ...(Number.isInteger(m.end) ? { end: m.end } : {}), ...(v.ch ? { ch: v.ch } : {}) }; };
  return { ...shape(list[0]), ...(list[1] ? { alt: shape(list[1]) } : {}) };
}

export function matchPassage(q, passages) {
  const keyT = terms((q.key || []).concat(q.pairs ? q.pairs.map(p => p.left + ' ' + p.right) : [],
    q.blanks ? q.blanks.map(b => b.correct) : [], q.saq ? q.saq.steps : []).join(' '));
  const stemT = terms(q.q);
  let best = null;
  for (const p of passages) {
    const { s, hits } = score(p.terms, keyT, stemT);
    if (hits < 3) continue;                       // a quote must really be about it
    const rank = s * (p.page ? 1.15 : 1);         // clean prose beats slide fragments
    if (!best || rank > best.rank) best = p.page
      ? { rank, t: p.t, src: p.src }
      : { rank, t: p.t, src: p.src, slug: p.slug, n: p.n };  // deck ref -> the SLIDE when one is rendered, else its text
  }
  return best && (best.slug ? { t: best.t, src: best.src, slug: best.slug, n: best.n } : { t: best.t, src: best.src });
}
