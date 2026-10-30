// Sound effects for a long episode: ElevenLabs sound generation, cached in the shared library.
//
//   npm run sfx -- <slug> --dry                    clips, seconds, what's already in the library (no API call)
//   npm run sfx -- <slug> --clips gold_chime --yes generate those clips
//   npm run sfx -- <slug> --all --yes              generate every missing clip
//   npm run sfx -- --library [words]               search the library catalog (free): what can be reused
//   npm run sfx -- --rebuild-catalog               rebuild the catalog from every episode's clip list
//
// Reads  episodes/<slug>/sound.json ("clips": {name: [prompt, seconds, {loop}]}, "library": reused files, "events").
// Writes studio/library/sfx/<name>-<hash>.mp3, named like the skill's sfx.py (sha1 of "prompt|seconds"), so a clip is
// paid for once and every later episode reuses it. Without --yes nothing is generated. Sound clips are not in the
// account history, so the cost is read from the usage stats before and after (they can lag: we wait for them).
// Every clip is listed in studio/library/sfx/catalog.json (file, prompt, length, episode, credits), the place to look
// before paying for a new one; --dry points out library clips that sound like each clip still to generate.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const args = process.argv.slice(2);
const argValue = (flag) => (args.includes(flag) ? args[args.indexOf(flag) + 1] : undefined);
const LIB = join('studio', 'library', 'sfx');
const CATALOG = join(LIB, 'catalog.json');

// Python's str(float) for the hash, so the names match sfx.py: 1.0 -> "1.0", 1.5 -> "1.5".
const pyNum = (n) => (Number.isInteger(n) ? `${n}.0` : String(n));
const clipFile = (name, prompt, secs) => `${name}-${createHash('sha1').update(`${prompt}|${pyNum(secs)}`).digest('hex').slice(0, 8)}.mp3`;
const clipPath = (name, prompt, secs) => join(LIB, clipFile(name, prompt, secs));

const catalog = existsSync(CATALOG) ? JSON.parse(readFileSync(CATALOG, 'utf8')) : {};
const saveCatalog = () =>
  writeFileSync(CATALOG, JSON.stringify(Object.fromEntries(Object.entries(catalog).sort(([a], [b]) => a.localeCompare(b))), null, 1) + '\n');
function addToCatalog(name, prompt, secs, extra) {
  const file = clipFile(name, prompt, secs);
  if (!existsSync(join(LIB, file))) return;
  catalog[file] = { name, prompt, seconds: secs, ...catalog[file], ...extra };
}

const STOP = new Set('a an the and of in on at to with into as by from its it is short long no voices cartoon close very soft small'.split(' '));
const words = (t) => t.toLowerCase().match(/[a-z]+/g).filter((w) => w.length > 2 && !STOP.has(w));
function search(query, skip) {
  const q = new Set(words(query));
  return Object.entries(catalog)
    .filter(([file]) => file !== skip)
    .map(([file, c]) => ({ file, ...c, score: words(`${c.name.replace(/_/g, ' ')} ${c.prompt}`).filter((w) => q.has(w)).length }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score);
}

if (args.includes('--rebuild-catalog')) {
  const sources = [];
  for (const ep of readdirSync(join('studio', 'src', 'episodes'))) {
    const f = join('studio', 'src', 'episodes', ep, 'episode.json');
    if (existsSync(f)) sources.push([ep, JSON.parse(readFileSync(f, 'utf8')).sound?.clips || {}]);
  }
  for (const ep of readdirSync('episodes')) {
    const f = join('episodes', ep, 'sound.json');
    if (existsSync(f)) sources.push([ep, JSON.parse(readFileSync(f, 'utf8')).clips]);
  }
  for (const [ep, list] of sources) {
    for (const [name, [prompt, secs, opts = {}]] of Object.entries(list)) addToCatalog(name, prompt, secs, { loop: !!opts.loop, episode: catalog[clipFile(name, prompt, secs)]?.episode || ep });
  }
  saveCatalog();
  const orphans = readdirSync(LIB).filter((f) => f.endsWith('.mp3') && !catalog[f]);
  console.log(`Catalog: ${Object.keys(catalog).length} clips${orphans.length ? `; not in any clip list: ${orphans.join(', ')}` : ''}.`);
  process.exit(0);
}
if (args.includes('--library')) {
  const query = args.filter((a) => !a.startsWith('--')).join(' ');
  const rows = query ? search(query) : Object.entries(catalog).map(([file, c]) => ({ file, ...c }));
  for (const c of rows) console.log(`  ${c.file.padEnd(32)} ${c.seconds.toFixed(1).padStart(4)} s  ${c.episode.padEnd(15)} ${c.prompt}`);
  console.log(`${rows.length} of ${Object.keys(catalog).length} clips.`);
  process.exit(0);
}

const slug = args.find((a) => !a.startsWith('--') && a !== argValue('--clips'));
if (!slug) throw new Error('usage: npm run sfx -- <slug> [--dry | --clips a,b | --all] [--yes]   or   npm run sfx -- --library [words]');
const S = JSON.parse(readFileSync(join('episodes', slug, 'sound.json'), 'utf8'));

const clips = Object.entries(S.clips).map(([name, [prompt, secs, opts = {}]]) => ({ name, prompt, secs, loop: !!opts.loop, path: clipPath(name, prompt, secs) }));
const missing = clips.filter((c) => !existsSync(c.path));
const used = new Set(S.events.map((e) => e.clip));

console.log(`${clips.length} new clips (${missing.length} not generated yet), ${Object.keys(S.library).length} reused from the library, ${S.events.length} events.`);
for (const c of clips) {
  console.log(`  ${existsSync(c.path) ? 'have' : 'NEED'}  ${c.name.padEnd(16)} ${c.secs.toFixed(1).padStart(4)} s${c.loop ? ' loop' : ''}  ${c.prompt}`);
  if (!existsSync(c.path)) for (const m of search(`${c.name.replace(/_/g, ' ')} ${c.prompt}`).slice(0, 3)) console.log(`          maybe reuse ${m.file} (${m.seconds} s): ${m.prompt}`);
}
for (const [name, file] of Object.entries(S.library)) {
  if (!existsSync(join(LIB, file))) console.log(`  MISSING library file for ${name}: ${file}`);
}
const unknown = [...used].filter((n) => !S.clips[n] && !S.library[n]);
if (unknown.length) throw new Error(`events use clips that are neither new nor in the library: ${unknown.join(', ')}`);

const pick = args.includes('--all') ? missing : missing.filter((c) => (argValue('--clips') || '').split(',').includes(c.name));
if (args.includes('--dry') || !pick.length) process.exit(0);

const secs = pick.reduce((a, c) => a + c.secs, 0);
console.log(`${pick.length} clip(s) to generate, ${secs.toFixed(1)} s in all.`);
if (!args.includes('--yes')) {
  console.log('Nothing generated: add --yes to spend the credits.');
  process.exit(0);
}

const client = new ElevenLabsClient();
// Sound-effect credits of the last two days, from the usage stats (the subscription counter lags much longer).
async function counter() {
  const now = Date.now();
  const { usage } = await client.usage.get({ startUnix: now - 2 * 86400000, endUnix: now, breakdownType: 'product_type' });
  return (usage['Sound Effects'] || []).reduce((a, b) => a + b, 0);
}
const before = await counter();
mkdirSync(LIB, { recursive: true });
for (const c of pick) {
  const audio = await client.textToSoundEffects.convert({
    text: c.prompt,
    durationSeconds: c.secs,
    promptInfluence: S.prompt_influence,
    loop: c.loop || undefined,
    outputFormat: 'mp3_44100_128',
  });
  writeFileSync(c.path, Buffer.from(await new Response(audio).arrayBuffer()));
  console.log(`  generated ${c.name} -> ${c.path}`);
}
// The stats fill in over a minute or two, clip by clip: wait until they stop moving (three equal reads in a row).
let after = before;
for (let tries = 0, still = 0; tries < 40 && still < 3; tries++) {
  await new Promise((r) => setTimeout(r, 10000));
  const now = await counter();
  still = now === after && now !== before ? still + 1 : 0;
  after = now;
}
const spent = after - before;
const log = join('episodes', slug, 'audio', 'sfx_costs.json');
const rows = existsSync(log) ? JSON.parse(readFileSync(log, 'utf8')) : [];
rows.push({ date: new Date().toISOString(), clips: pick.map((c) => c.name), seconds: Math.round(secs * 10) / 10, credits: spent });
mkdirSync(join('episodes', slug, 'audio'), { recursive: true });
writeFileSync(log, JSON.stringify(rows, null, 1));
const added = new Date().toISOString().slice(0, 10);
for (const c of pick) addToCatalog(c.name, c.prompt, c.secs, { loop: c.loop, episode: slug, credits: Math.round((spent * c.secs) / secs), added });
saveCatalog();
console.log(`Done. Credits spent: ${spent} for ${secs.toFixed(1)} s (${(spent / secs).toFixed(1)} a second)${spent === 0 ? '; the counter has not moved yet, check the usage page' : ''}.`);
