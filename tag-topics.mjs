/* Reads bank-dump.json (written by build.mjs), applies content/topics.js and prints each row for READING: node tag-topics.mjs [row|--none|--counts] */
import fs from 'node:fs';
import { rowOf, RULES } from './content/topics.js';
const bank = JSON.parse(fs.readFileSync('bank-dump.json', 'utf8')), arg = process.argv[2] || '--counts';
const by = {}; for (const q of bank) (by[rowOf(q) || '(none)'] = by[rowOf(q) || '(none)'] || []).push(q);
const short = q => `${q.id} [${q.quiz} ${q.type} ${q.pts}] ` + q.t.replace(/ ## (## )*/g, ' ¦ ').replace(/^\d+\.\s*/, '').slice(0, +process.argv[3] || 120);
if (arg === '--counts') { for (const r of [...RULES.map(x => x[0]), '(none)']) if (by[r]) console.log(String(by[r].length).padStart(4), r, '· pts', by[r].reduce((a, q) => a + (q.pts || 0), 0), '· quizzes', new Set(by[r].map(q => q.quiz)).size, '· written', by[r].filter(q => q.type === 'essay' || q.type === 'cloze').length); console.log('total', bank.length); }
else for (const q of by[arg === '--none' ? '(none)' : arg] || []) console.log(short(q));
