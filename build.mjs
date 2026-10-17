// Concatena los módulos de src/ en js/goran.js (sin dependencias): node build.mjs
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
const files = readdirSync('src').filter(f => f.endsWith('.js')).sort();
writeFileSync('js/goran.js', files.map(f => readFileSync(`src/${f}`, 'utf8')).join(''));
console.log(`js/goran.js ← ${files.join(', ')}`);
