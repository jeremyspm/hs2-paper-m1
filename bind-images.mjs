/* Walk each HS2CAP capture; for the i-th display_question block emit the image
   FILE NAMES it should carry — canvas-hosted files via images/manifest.json,
   external images via images/ext-manifest.json. Module 1: the capture is written by
   prep-capture.mjs from the Canvas export, so every question image arrives through
   the ext branch under a pseudo-URL, and the images inside her feedback comments are
   deliberately NOT in the manifest (they are her answers, not her question). */
import fs from 'node:fs';
import path from 'node:path';
const CAP = 'C:/Users/USER/Desktop/github/_inbox/HS2 Module 1 Capture';
const manifest = JSON.parse(fs.readFileSync(path.join(CAP, 'images/manifest.json'), 'utf8'));
const ext = JSON.parse(fs.readFileSync(path.join(CAP, 'images/ext-manifest.json'), 'utf8'));
const out = {};
for (const f of fs.readdirSync(CAP).filter(x => /^HS2CAP-.*\.html$/.test(x))) {
  const html = fs.readFileSync(path.join(CAP, f), 'utf8');
  const re = /<div[^>]*class="[^"]*\bdisplay_question\b[^"]*"[^>]*>/g;
  const starts = []; let m;
  while ((m = re.exec(html))) starts.push(m.index);
  const per = {};
  starts.forEach((s, i) => {
    const seg = html.slice(s, i + 1 < starts.length ? starts[i + 1] : html.length);
    const names = new Set();
    for (const im of seg.matchAll(/<img[^>]*\ssrc="(https?:\/\/[^"]+)"/g)) {
      const u = im[1];
      if (/canvas\.manukau/.test(u)) {
        const id = (u.match(/files\/(\d+)/) || [])[1];
        if (id && manifest[id]) names.add(manifest[id]);
      } else if (ext[u]) names.add(ext[u]);
    }
    if (names.size) per[i] = [...names];
  });
  if (Object.keys(per).length) out[f] = per;
}
fs.writeFileSync('images.json', JSON.stringify(out, null, 1));
const n = Object.values(out).reduce((s, p) => s + Object.keys(p).length, 0);
console.log('files:', Object.keys(out).length, 'questions with images:', n);
