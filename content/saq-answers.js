/* Model answers for the essay questions in her Module 1 quizzes. Canvas publishes no
   key for essays — the answers here are the TOOL'S unless `src` says the words are hers
   (her feedback comment on the quiz, her answers deck). Keyed on the normalised opening
   of the question text ONLY; build.mjs fails if an entry matches no essay, and HOLDS any
   essay with no entry. Empty until authored. */
export const norm = s => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export const SAQ_ANSWERS = [];
