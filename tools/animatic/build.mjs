// The animatic's timeline: storyboard frames held over the voice takes, with the sound effects in the pauses.
//
//   npm run animatic -- <slug>      build the timeline and copy the media the studio needs (no API call, no credits)
//   then, in studio/:  npx remotion render src/index.ts Animatic-<slug> out/<slug>-animatic.mp4 --scale=0.5
//   (when the repo sits in a deep folder, Windows can't start Remotion's own browser, its path being over 260
//   characters: add --browser-executable="C:\Program Files\Google\Chrome\Application\chrome.exe")
//
// Reads  episodes/<slug>/roteiro-en.md, audio/voice/NNN_*.json (each take's character timings, for its length),
//        shots.json (the voice line each storyboard frame starts on), sound.json (events after voice lines) and
//        studio/library/sfx/catalog.json (clip lengths).
// Writes studio/src/animatic/<slug>.json (the timeline, in seconds) and copies the takes, frames and clips into
//        studio/public/<slug>-animatic/ (a git-ignored copy: the studio only reads files from public/).
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseScript } from '../voice/script.mjs';

// Pauses, in seconds. Hits land in the pause after their line, so a line followed by sound gets a longer pause.
const LEAD = 1.6; // before the first line, for the events "after": 0
const GAP = 0.35; // between two lines of the same section
const SECTION_GAP = 1.4; // between sections
const HIT_DELAY = 0.12; // from the end of a line to its first hit
const STAGGER = 1.0; // at most this long between hits that follow the same line
const TAIL = 2.5; // after the last line
const VOL = { voice: 1, hit: 0.45, ambience: 0.12 };

const slug = process.argv[2];
if (!slug) throw new Error('usage: npm run animatic -- <slug>');
const ep = join('episodes', slug);
const LIB = join('studio', 'library', 'sfx');
const pub = join('studio', 'public', `${slug}-animatic`);
const json = (f) => JSON.parse(readFileSync(f, 'utf8'));

const lines = parseScript(readFileSync(join(ep, 'roteiro-en.md'), 'utf8'));
const shots = json(join(ep, 'shots.json')).shots;
const sound = json(join(ep, 'sound.json'));
const catalog = json(join(LIB, 'catalog.json'));
const voiceDir = join(ep, 'audio', 'voice');
const takes = readdirSync(voiceDir);

// Every clip name the events use -> its library file and length.
const clipFile = {};
for (const [file, c] of Object.entries(catalog)) {
  if (sound.clips[c.name] && sound.clips[c.name][0] === c.prompt && sound.clips[c.name][1] === c.seconds) clipFile[c.name] = file;
}
Object.assign(clipFile, sound.library);
const clipSecs = (name) => catalog[clipFile[name]]?.seconds ?? 1;
const isAmbience = (name) => !!catalog[clipFile[name]]?.loop || clipSecs(name) >= 7;
for (const e of sound.events) if (!clipFile[e.clip]) throw new Error(`no library file for clip ${e.clip}`);

// Hits after each line, staggered, and the pause they need.
function hitsAfter(n) {
  const hits = [];
  let at = HIT_DELAY;
  for (const e of sound.events.filter((x) => x.after === n && !isAmbience(x.clip))) {
    hits.push({ clip: e.clip, offset: at, what: e.what });
    at += Math.min(clipSecs(e.clip), STAGGER);
  }
  const last = hits.at(-1);
  return { hits, need: last ? last.offset + Math.min(clipSecs(last.clip), 2.5) + 0.2 : 0 };
}

const timeline = { slug, fps: 30, lines: [], shots: [], sfx: [], sections: [] };
let t = LEAD;
for (const h of hitsAfter(0).hits) timeline.sfx.push({ clip: h.clip, from: h.offset + 0.2, gain: VOL.hit, what: h.what });
for (const [i, l] of lines.entries()) {
  const take = takes.find((f) => f.startsWith(`${String(l.n).padStart(3, '0')}_`) && f.endsWith('.mp3'));
  if (!take) throw new Error(`no voice take for line ${l.n}`);
  const al = json(join(voiceDir, take.replace(/\.mp3$/, '.json'))).alignment;
  const dur = al.characterEndTimesSeconds.at(-1) + 0.05;
  const next = lines[i + 1];
  if (!timeline.sections.length || timeline.sections.at(-1).title !== l.section) timeline.sections.push({ title: l.section, from: i ? t : 0 });
  timeline.lines.push({ n: l.n, speaker: l.speaker, text: l.text, take, from: t, dur });
  const { hits, need } = hitsAfter(l.n);
  for (const h of hits) timeline.sfx.push({ clip: h.clip, from: t + dur + h.offset, gain: VOL.hit, what: h.what });
  const gap = !next ? TAIL : next.section !== l.section ? SECTION_GAP : GAP;
  t += dur + Math.max(gap, need);
}
timeline.total = t;

// Ambiences run from their line to the end of its section, looped.
const lineStart = (n) => (n === 0 ? 0 : timeline.lines[n - 1].from);
for (const e of sound.events.filter((x) => isAmbience(x.clip))) {
  const from = lineStart(e.after);
  const end = timeline.sections.find((s) => s.from > from)?.from ?? timeline.total;
  timeline.sfx.push({ clip: e.clip, from, until: end, loop: true, gain: VOL.ambience, what: e.what });
}
timeline.sfx.sort((a, b) => a.from - b.from);

// Frames: each starts with its line and holds until the next.
const ids = Object.keys(shots).sort();
ids.forEach((id, i) => {
  const from = i === 0 ? 0 : lineStart(shots[id]);
  const until = i + 1 < ids.length ? lineStart(shots[ids[i + 1]]) : timeline.total;
  timeline.shots.push({ id, from, until, line: shots[id] });
});

// The media, copied where the studio can read it.
for (const d of ['voice', 'sfx', 'board']) mkdirSync(join(pub, d), { recursive: true });
for (const l of timeline.lines) copyFileSync(join(voiceDir, l.take), join(pub, 'voice', l.take));
for (const s of timeline.shots) copyFileSync(join(ep, 'storyboard', `${s.id}.jpg`), join(pub, 'board', `${s.id}.jpg`));
for (const s of timeline.sfx) {
  s.file = clipFile[s.clip];
  if (!existsSync(join(pub, 'sfx', s.file))) copyFileSync(join(LIB, s.file), join(pub, 'sfx', s.file));
}

mkdirSync(join('studio', 'src', 'animatic'), { recursive: true });
writeFileSync(join('studio', 'src', 'animatic', `${slug}.json`), JSON.stringify(timeline, null, 1) + '\n');
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
console.log(`${timeline.lines.length} lines, ${timeline.shots.length} frames, ${timeline.sfx.length} sounds; ${mmss(timeline.total)} in all.`);
for (const s of timeline.sections) console.log(`  ${mmss(s.from).padStart(5)}  ${s.title}`);
const long = timeline.shots.filter((s) => s.until - s.from > 30);
if (long.length) console.log(`Frames held over 30 s (the animation will need extra cuts there): ${long.map((s) => `${s.id} ${Math.round(s.until - s.from)} s`).join(', ')}`);
