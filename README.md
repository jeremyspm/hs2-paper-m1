# HS2 Paper Sim — Module 1

Every practice quiz posted for HS2 Module 1 (Cardiovascular / Respiratory / Lymphatic),
unlocked and re-sittable, plus dealt mock papers with a score history. Test 1 is behind
us; this is prep for the final exam (5 Nov 2026, 50%), where Module 1 comes back with its
three starred case studies — lymph node removal, asthma, panic attacks — which are in here.
Live: <https://jeremyspm.github.io/hs2-paper-m1/>. Same format as
[hs2-test2](https://github.com/jeremyspm/hs2-test2) (Module 2); the differences are listed
at the end, and every one is a consequence of the Module 1 capture, not a redesign.

- `prep-capture.mjs` — the one step Module 2 did not need. Module 1 was captured as a
  SingleFile export tree (long Canvas titles in nested folders, raw Canvas markup, every
  image a base64 data-URI). This writes a Module-2-shaped capture dir from it —
  `_inbox/HS2 Module 1 Capture/HS2CAP-<canvas quiz id>.html`, `images/` +
  `ext-manifest.json` — so the rest of the build runs on it with only its paths changed.
  It decodes each question image to a file named by the parser's own hash, keeps the
  images inside her feedback comments APART (`images/comments/` — they are her answers,
  and bound as figures they would give the answer away), leaves no `src` on the 20
  images the export never had (a SingleFile placeholder or a Canvas broken image) so the
  build holds those questions with a reason, empties the two YouTube players SingleFile
  inlined into embeds, and rewrites the two dropdowns captured mid-attempt to the graded
  page's literal `[ Select ]`. `lost-images.json` lists what was lost, per question.
- `build.mjs` — assembles `index.html` from `../hs2-anki/m1/questions.json` (the capture
  above run through hs2-test1's `parse-quizzes.mjs`), `images.json` (from
  `bind-images.mjs`) and `content/` (authored: chains, cases, SAQ model answers — gated
  both directions).
- `stem-html.mjs` — reads the SAME captures a second way and gives every question a
  structured stem (`qh`): her paragraphs, lists and table rows kept, each image and each
  blank as a `[[IMG:…]]` / `[[BLANK:k]]` marker at its true position. The build fails if
  any blank-type question does not carry every blank inline exactly once. One line differs
  from Module 2's: the raw export has no `<span class="blank_id">`, so the blank id is
  read from the `answer_for_<id>` class instead (md5-verified against the input names).
- Stems/options/keys are hers, verbatim. **Model answers for written questions are mostly
  hers too**: on Module 1's graded pages she left a feedback comment under most essays,
  her CVS 2 learning page carries marked SAQ answers for the valve and chamber questions,
  her heart-coverings board explains the muscles of the atria and ventricles, and four
  questions carry her own labelled diagrams. 44 of the 47 essays in `content/saq-answers.js`
  are her wording split one marking point per line (`hers: true`, shown as "Her own
  answer"); 3 are the tool's and name her page. `content/cases.js` holds exam cases 2, 3
  and 4: scenario and questions verbatim from her board, 18 of 19 answers from her 2024
  model-answers deck slide by slide, the baroreflex one the tool's from her CVS 4 page.
  `content/chains.js` is generated from the estate's Module 1 guide (`port-chains.mjs`) —
  scaffolds built from her material, not her material, and the warm-up says so.
- Grading: her dropdowns mark only her keyed option right; her typed blanks accept any
  of her listed spellings (case-insensitive, curly apostrophes normalised).
  `content/overrides.js` is empty for now.
- `held.json` — every excluded question with its reason (43 of 407). 21 are the whole
  "MODULE 1.1 & 3.3: Biophysical Principles" quiz, captured before submission and so
  carrying no key (re-capture after submitting and they join); 17 are figures the export
  never had (five heart/ECG questions, three lung-anatomy labels, five lymph-node figures,
  two heart-structure labels, two pericardium/lymph links); 3 are letter-only options with
  no lettered stem; 1 is the Khan "record your score" item; 1 an empty stem.
- `index.html` is exactly `template.html` with `/*@BANK@*/` replaced by the bank JSON —
  so a chrome-only change can be re-spliced onto the bank already in `index.html` without
  the Canvas export on hand. Anything that touches a QUESTION needs the real `node build.mjs`.
- Videos: `content/video-matches.json` is the ONLY source of the video shown after a wrong
  answer. It was built 2026-09-06 from the videos' own YouTube caption tracks — the whole
  Dr Matt & Dr Mike channel (691 tracks), every question's key + stem terms BM25-scored
  against 90-second caption windows, the top candidates judged from the caption text
  (Gemini Flash), every accepted match carrying a verbatim quote that was then located
  mechanically in the track (its position is `at`, so the link opens where the point is
  taught), then a review slice of the doubtful cases read again by hand. It is re-keyed to
  this build's question ids by `remap-video-matches.mjs` (the caption pipeline hashed keys
  with Python's JSON spacing, so the join is on the stem and the quiz id; 126 of the 137
  source questions land, the other 11 are on held questions and return with them).
  Result: 126 of 363 questions have a caption-verified video (up to two each), 85 of the
  158 videos on the Module 1 shelf are reachable. Forty of those 158 joined the shelf the
  same day because their captions answered a Module 1 question — a dozen of them are about
  other systems and the playlist files them under "answered in passing" rather than as
  CVS lectures. Questions with no entry get no video on purpose: no video beats a wrong
  video. A stale entry fails the build. Captions are not shipped. The whole shelf, by
  topic, is at <https://jeremyspm.github.io/hs2-m1-videos.html>, generated from this
  repo's built `index.html` by `hs2-m1-videos.build.mjs` in `jeremyspm.github.io`; the ▶
  in the header and the "Watch first" door point there. `content/dmdm-all.json` is the
  shelf as `hs2-module1/index.html` declares it, flattened by `port-shelf.mjs`.
- Passages: the explain row quotes her CVS 1–4, RESP 1–4 and Lymphatic learning pages,
  her shock page, and the 2026 Module 1 decks. No Module 1 deck is rendered to slide
  images (Module 2's were), so a deck hit is quoted as its text.
- Rebuild: `node prep-capture.mjs` (only when the export changes) → the parser
  (`HS2_EXPORT="…/HS2 Module 1 Capture" HS2_OUT="…/hs2-anki/m1" node ../hs2-test1/audit/parse-quizzes.mjs`)
  → `node bind-images.mjs` → `node port-shelf.mjs && node port-chains.mjs` (when the hub
  shelf or the guide changes) → `node build.mjs && node remap-video-matches.mjs && node build.mjs`.
  Serve: any static server; state is per-browser localStorage (`hs2m1.*`).

## Differences from hs2-test2, all declared

| where | what | why |
|---|---|---|
| `prep-capture.mjs` | exists | the capture is an export tree, not saved result pages |
| `stem-html.mjs` | `answer_for_<id>` fallback for the blank id | the raw export has no `blank_id` span |
| `build.mjs` | paths, QUIZ map, cvs/resp/lymph routing, `cases` for `case7`, deck text when no slide, "Her own answer" label | Module 1 inputs; three exam cases instead of one; no rendered decks; most answers are hers |
| `content/explain.mjs` | her Module 1 pages/decks; deck text kept; fill-in exercises never quoted | same |
| `template.html` | chrome only: titles, her learning checklist card, systems, Test 1's 34-question shape, exam-case rotation, `hs2m1.` keys, exam countdown | Module 1 has no upcoming test; the exam is the target |
