// Sound effects for a long episode: ElevenLabs sound generation, cached in the shared library.
//
//   npm run sfx -- <slug> --dry                    clips, seconds, what's already in the library (no API call)
//   npm run sfx -- <slug> --clips gold_chime --yes generate those clips
//   npm run sfx -- <slug> --all --yes              generate every missing clip
//
// Reads  episodes/<slug>/sound.json ("clips": {name: [prompt, seconds, {loop}]}, "library": reused files, "events").
// Writes studio/library/sfx/<name>-<hash>.mp3, named like the skill's sfx.py (sha1 of "prompt|seconds"), so a clip is
// paid for once and every later episode reuses it. Without --yes nothing is generated. Sound clips are not in the
// account history, so the cost is read from the usage stats before and after (they can lag: we wait for them).
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const args = process.argv.slice(2);
const argValue = (flag) => (args.includes(flag) ? args[args.indexOf(flag) + 1] : undefined);
const slug = args.find((a) => !a.startsWith('--') && a !== argValue('--clips'));
if (!slug) throw new Error('usage: npm run sfx -- <slug> [--dry | --clips a,b | --all] [--yes]');
const S = JSON.parse(readFileSync(join('episodes', slug, 'sound.json'), 'utf8'));
const LIB = join('studio', 'library', 'sfx');

// Python's str(float) for the hash, so the names match sfx.py: 1.0 -> "1.0", 1.5 -> "1.5".
const pyNum = (n) => (Number.isInteger(n) ? `${n}.0` : String(n));
const clipPath = (name, prompt, secs) =>
  join(LIB, `${name}-${createHash('sha1').update(`${prompt}|${pyNum(secs)}`).digest('hex').slice(0, 8)}.mp3`);

const clips = Object.entries(S.clips).map(([name, [prompt, secs, opts = {}]]) => ({ name, prompt, secs, loop: !!opts.loop, path: clipPath(name, prompt, secs) }));
const missing = clips.filter((c) => !existsSync(c.path));
const used = new Set(S.events.map((e) => e.clip));

console.log(`${clips.length} new clips (${missing.length} not generated yet), ${Object.keys(S.library).length} reused from the library, ${S.events.length} events.`);
for (const c of clips) console.log(`  ${existsSync(c.path) ? 'have' : 'NEED'}  ${c.name.padEnd(16)} ${c.secs.toFixed(1).padStart(4)} s${c.loop ? ' loop' : ''}  ${c.prompt}`);
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
console.log(`Done. Credits spent: ${spent} for ${secs.toFixed(1)} s (${(spent / secs).toFixed(1)} a second)${spent === 0 ? '; the counter has not moved yet, check the usage page' : ''}.`);
