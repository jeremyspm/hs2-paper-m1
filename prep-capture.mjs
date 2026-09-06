/* Module 1 capture adapter.
   Module 2 was captured as 28 DOM-serialised Canvas result pages (HS2CAP-<quizid>.html
   with images/ + two manifests) and the whole build reads THAT layout. Module 1 was
   captured earlier as a SingleFile export tree: long Canvas titles, nested folders, raw
   (unquoted-attribute) Canvas markup, and every image embedded as a base64 data-URI.
   This pre-step writes a Module-2-shaped capture dir from the export so build.mjs,
   stem-html.mjs and bind-images.mjs run on it with nothing but their paths changed.

   Nothing here authors content. Per page it does exactly four things:
   1. picks the page the shared parser already chose for each quiz (hs2-test1/audit/
      questions.json `quizzes[].file` — the copy with the most recovered keys);
   2. decodes each raster data-URI <img> inside a display_question block to a file
      images/HS2IMG-<sha1-16>.<ext> (the same 16-hex id the parser gives it in
      question-images.json) and rewrites the src to a stable pseudo-URL that
      images/ext-manifest.json maps back to the file — the M2 resolvers then find it
      through the ext branch unchanged;
   3. drops the src of an image that did NOT survive the capture (SingleFile's
      transparent-SVG placeholder, or Canvas's own `data:,` broken image) so the parser
      marks the stem [[IMG…]] with no file behind it and build.mjs HOLDS the question
      with "image did not survive capture" instead of shipping a blank box;
   4. empties every <iframe>…</iframe>: SingleFile inlined the YouTube player's own DOM
      ("Watch on · 1.15M subscribers") into two embeds, which is not her question. The
      tag and its attributes stay so stem-html can still turn the embed into a link.
   The page is otherwise byte-identical to the export. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const EXPORT = 'C:/Users/USER/Desktop/github/_inbox/Health Science 2 Export Module 1';
const BANK = 'C:/Users/USER/Desktop/github/hs2-test1/audit/questions.json';
const CAP = 'C:/Users/USER/Desktop/github/_inbox/HS2 Module 1 Capture';
const HOST = 'https://m1-export.local/img/';   // never fetched; a key into ext-manifest.json

const bank = JSON.parse(fs.readFileSync(BANK, 'utf8'));
fs.mkdirSync(path.join(CAP, 'images'), { recursive: true });

const EXT = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp' };
const ext = {};                 // pseudo-url -> file name
const seenIds = new Map();      // quiz id -> source file
const report = [];
let nImg = 0, nLost = 0, nIframe = 0, nRewrittenOutside = 0, nComment = 0, nSelect = 0;
const lost = [];
const allComments = {};        // "HS2CAP-<id>.html#<qNo>" -> [file names in images/comments/]

/* Split a page into display_question segments, the way bind-images.mjs does. */
function segments(html) {
  const re = /<div[^>]*class="[^"]*\bdisplay_question\b[^"]*"[^>]*>/g;
  const starts = []; let m;
  while ((m = re.exec(html))) starts.push(m.index);
  return starts.map((s, i) => [s, i + 1 < starts.length ? starts[i + 1] : html.length]);
}

for (const z of bank.quizzes) {
  const src = path.join(EXPORT, z.file);
  let html = fs.readFileSync(src, 'utf8');
  const ids = [...new Set([...html.matchAll(/quizzes\/(\d+)/g)].map(m => m[1]))];
  if (ids.length !== 1) throw new Error(`${z.file}: expected one Canvas quiz id, found [${ids}]`);
  const qid = ids[0];
  if (seenIds.has(qid)) throw new Error(`quiz id ${qid} appears in two chosen pages: ${seenIds.get(qid)} and ${z.file}`);
  seenIds.set(qid, z.file);

  /* 4. iframes: keep the tag, drop the inlined player document */
  html = html.replace(/<iframe\b([^>]*)>[\s\S]*?<\/iframe>/gi, (m, a) => { nIframe++; return `<iframe${a}></iframe>`; });
  /* 5. a dropdown blank captured mid-attempt is a live <select name="question_<id>_<md5>">
     holding "[ Select ]" plus SingleFile's stringified option list; a graded page shows
     the literal text "[ Select ]" where the blank sits (that is what the parser and
     stem-html read, and what every other Module 1 page has). Normalise to the graded form. */
  html = html.replace(/<select\b[^>]*\bname=["']?question_\d+_[0-9a-f]{32}["']?[^>]*>[\s\S]*?<\/select>/gi, () => { nSelect++; return '<span>\n [ Select ]\n </span>'; });

  /* 2 + 3. images — only inside question blocks are files written; a data-URI
     outside them (Canvas chrome, the avatar) is rewritten to a pseudo-URL with no
     manifest entry, which shrinks a 40 MB page and resolves to nothing, as before. */
  const segs = segments(html);
  const inQuestion = (i) => segs.some(([a, b]) => i >= a && i < b);
  /* her per-question feedback comments (answer_comment_html / neutral_comments) carry
     images too — "artery wall.JPG", "corrections 2.JPG": her ANSWERS, not her question.
     bind-images.mjs binds every image in a question block, so these are kept out of the
     manifest (they go to images/comments/ + comments-manifest.json for the model-answer
     work) — shipped as a question figure they would give the answer away. */
  const comments = [];
  const cre = /<div[^>]*class=["']?[^"'>]*\b(?:answer_comment_html|neutral_comments|correct_comments|incorrect_comments|quiz_comment)\b[^>]*>/gi;
  let cm;
  while ((cm = cre.exec(html))) {
    let i = cm.index + cm[0].length, depth = 1; const tag = /<\/?div\b/gi; tag.lastIndex = i; let t;
    while (depth > 0 && (t = tag.exec(html))) { depth += t[0][1] === '/' ? -1 : 1; const gt = html.indexOf('>', tag.lastIndex); i = gt === -1 ? tag.lastIndex : gt + 1; tag.lastIndex = i; }
    comments.push([cm.index, i]);
  }
  const inComment = (i) => comments.some(([a, b]) => i >= a && i < b);
  const commentFiles = {};
  /* an <img> tag whose quoted attribute values may themselves contain ">" — the
     SVG placeholders do — so the tag end is found by a quote-aware scan, not [^>]*
     (a backtracking alternation over a 40 MB page overflows the regex stack) */
  const tagEnd = (s, i) => { let q = null; for (; i < s.length; i++) { const c = s[i]; if (q) { if (c === q) q = null; } else if (c === '"' || c === "'") q = c; else if (c === '>') return i; } return -1; };
  const parts = []; let pos = 0;
  const imgRe = /<img\b/gi; let im;
  while ((im = imgRe.exec(html))) {
    const end = tagEnd(html, im.index); if (end < 0) break;
    const tag = html.slice(im.index, end + 1);
    parts.push(html.slice(pos, im.index), rewriteImg(tag, im.index));
    pos = end + 1; imgRe.lastIndex = pos;
  }
  parts.push(html.slice(pos));
  html = parts.join('');

  function rewriteImg(tag, off) {
    const sm = tag.match(/\ssrc=("([^"]*)"|'([^']*)'|([^\s>]+))/i);
    if (!sm) return tag;
    const val = sm[2] ?? sm[3] ?? sm[4] ?? '';
    if (!/^data:/i.test(val)) return tag;
    const raster = val.match(/^data:(image\/(?:png|jpe?g|gif|webp));base64,([A-Za-z0-9+/=]+)$/i);
    const inside = inQuestion(off);
    if (raster) {
      const id = crypto.createHash('sha1').update(val).digest('hex').slice(0, 16);   // = the parser's IMG id
      const name = `HS2IMG-${id}.${EXT[raster[1].toLowerCase()]}`;
      const url = HOST + name;
      if (inside && inComment(off)) {
        const dir = path.join(CAP, 'images', 'comments'); fs.mkdirSync(dir, { recursive: true });
        const dest = path.join(dir, name);
        if (!fs.existsSync(dest)) fs.writeFileSync(dest, Buffer.from(raster[2], 'base64'));
        const qn = segs.findIndex(([a, b]) => off >= a && off < b) + 1;
        (commentFiles[`HS2CAP-${qid}.html#${qn}`] ??= []).push(name);
        nComment++;
      } else if (inside) {
        const dest = path.join(CAP, 'images', name);
        if (!fs.existsSync(dest)) { fs.writeFileSync(dest, Buffer.from(raster[2], 'base64')); nImg++; }
        ext[url] = name;
      } else nRewrittenOutside++;
      return tag.replace(sm[0], ` src="${url}"`);
    }
    /* not a raster: SingleFile's <svg><rect fill-opacity="0"/></svg> placeholder or
       Canvas's `data:,` broken image — the picture is gone; say so, don't fake it */
    if (inside) {
      nLost++;
      const alt = (tag.match(/\salt=("([^"]*)"|'([^']*)'|([^\s>]+))/i) || [])[2] ?? '';
      const seg = segs.find(([a, b]) => off >= a && off < b);
      const qn = segs.indexOf(seg) + 1;
      lost.push({ quiz: z.title, q: qn, alt: alt.slice(0, 60), kind: /svg/.test(val) ? 'placeholder (image never loaded at capture)' : 'broken on Canvas itself' });
    }
    return tag.replace(sm[0], ' data-lost-src="1"');
  }

  Object.assign(allComments, commentFiles);
  const out = path.join(CAP, `HS2CAP-${qid}.html`);
  fs.writeFileSync(out, html);
  report.push([qid, z.title.slice(0, 58), (fs.statSync(src).size / 1e6).toFixed(1) + '→' + (html.length / 1e6).toFixed(1) + ' MB', segs.length + ' Q']);
}

fs.writeFileSync(path.join(CAP, 'images', 'manifest.json'), JSON.stringify({}, null, 1));        // no canvas-hosted ids in this export
fs.writeFileSync(path.join(CAP, 'images', 'ext-manifest.json'), JSON.stringify(ext, null, 1));
fs.writeFileSync(path.join(CAP, 'lost-images.json'), JSON.stringify(lost, null, 1));
fs.writeFileSync(path.join(CAP, 'images', 'comments-manifest.json'), JSON.stringify(allComments, null, 1));

for (const r of report) console.log(' ', r.join('  |  '));
console.log(`\n${report.length} pages → ${CAP}`);
console.log(`${nImg} question image files written (${Object.keys(ext).length} manifest entries) · ${nComment} images in her feedback comments kept aside in images/comments/ (${Object.keys(allComments).length} questions) · ${nRewrittenOutside} data-URIs outside questions rewritten with no file · ${nIframe} iframes emptied · ${nSelect} live dropdowns normalised to "[ Select ]"`);
console.log(`${nLost} question images did not survive the export (lost-images.json) — their questions will be HELD by the build:`);
for (const l of lost) console.log(`   ${l.quiz.slice(0, 40)} #${l.q} — ${l.kind}${l.alt ? ` — alt "${l.alt}"` : ''}`);
