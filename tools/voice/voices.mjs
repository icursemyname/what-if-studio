// Voices for a long episode: one ElevenLabs take per script line, each speaker with its own voice.
//
//   npm run voices -- <slug> --dry                 lines, characters per speaker, estimated credits (no API call)
//   npm run voices -- <slug> --list-voices         the voices on this account (free)
//   npm run voices -- <slug> --lines 1-3,7 --yes   generate those lines
//   npm run voices -- <slug> --speaker NINA --yes  generate one speaker's lines
//   npm run voices -- <slug> --all --yes           generate every line
//
// Reads  episodes/<slug>/roteiro-en.md (plain paragraphs = NARRATOR, **NAME:** lines = dialogue, *[...]* and *(...)*
//        are directions and never spoken) and episodes/<slug>/voices.json (model, settings, a voice per speaker).
// Writes episodes/<slug>/audio/voice/NNN_SPEAKER.mp3, a .json of word timings next to each, and manifest.json.
// A line is only sent again when its text, voice, model or settings change, so re-running is free. Without --yes
// nothing is generated: it prints what would be sent and its cost. The key comes from ELEVENLABS_API_KEY (.env.local).
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { parseScript } from './script.mjs';

const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith('--') && !/^[\d,-]+$/.test(a) && a !== argValue('--speaker'));
if (!slug) throw new Error('usage: npm run voices -- <slug> [--dry | --list-voices | --lines 1-3 | --speaker NAME | --all] [--yes]');
const epDir = join('episodes', slug);
const outDir = join(epDir, 'audio', 'voice');
const cfg = JSON.parse(readFileSync(join(epDir, 'voices.json'), 'utf8'));
const lines = parseScript(readFileSync(join(epDir, 'roteiro-en.md'), 'utf8'));

function argValue(flag) {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
}


// Same speaker's neighbouring lines, so the takes join without tone jumps (ElevenLabs request stitching).
function neighbours(line) {
  const same = lines.filter((l) => l.speaker === line.speaker);
  const i = same.indexOf(line);
  return { previousText: same[i - 1]?.text, nextText: same[i + 1]?.text };
}

function signature(line, voice) {
  const body = [line.text, voice.id, cfg.model, cfg.settings, neighbours(line)];
  return createHash('sha1').update(JSON.stringify(body)).digest('hex').slice(0, 12);
}

const fileBase = (l) => join(outDir, `${String(l.n).padStart(3, '0')}_${l.speaker.replace(/\W+/g, '_')}`);
const manifestPath = join(outDir, 'manifest.json');
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};

function selected() {
  if (args.includes('--all')) return lines;
  const sp = argValue('--speaker');
  if (sp) return lines.filter((l) => l.speaker === sp.toUpperCase());
  const spec = argValue('--lines');
  if (!spec) return [];
  const want = new Set();
  for (const part of spec.split(',')) {
    const [a, b = a] = part.split('-').map(Number);
    for (let n = a; n <= b; n++) want.add(n);
  }
  return lines.filter((l) => want.has(l.n));
}

function summary() {
  const by = {};
  for (const l of lines) by[l.speaker] = (by[l.speaker] || 0) + l.text.length;
  const total = Object.values(by).reduce((a, b) => a + b, 0);
  console.log(`${lines.length} lines, ${total} characters, model ${cfg.model}`);
  for (const [sp, n] of Object.entries(by)) {
    const v = cfg.voices[sp];
    console.log(`  ${sp.padEnd(12)} ${String(n).padStart(5)} chars  voice: ${v?.id ? `${v.name} (${v.id})` : 'not chosen'}`);
  }
  console.log(`Credits at list rate (1 per character): ${total}; plus 10-20% for retakes: ${Math.round(total * 1.1)}-${Math.round(total * 1.2)}`);
}

const client = new ElevenLabsClient();

// Credits spent since unix time t0, from the account's history, which records each take's exact cost (the API
// response carries none, and the subscription counter lags). Waits a little for `expect` takes to show up.
async function spentSince(t0, expect) {
  let items = [];
  for (let tries = 0; tries < 10; tries++) {
    const { history } = await client.history.list({ pageSize: Math.max(expect + 10, 20) });
    items = history.filter((h) => h.dateUnix >= t0);
    if (items.length >= expect) break;
    await new Promise((r) => setTimeout(r, 3000));
  }
  return { credits: items.reduce((a, h) => a + h.characterCountChangeTo - h.characterCountChangeFrom, 0), items };
}

if (args.includes('--list-voices')) {
  const { voices } = await client.voices.getAll();
  for (const v of voices) {
    const l = v.labels || {};
    console.log(`${v.voiceId}  ${v.name.padEnd(28)} ${[l.gender, l.age, l.accent, l.descriptive || l.description, l.use_case || l.useCase].filter(Boolean).join(', ')}`);
  }
} else if (args.includes('--dry') || !selected().length) {
  summary();
  for (const l of lines) console.log(`${String(l.n).padStart(3)} ${l.speaker.padEnd(12)} ${String(l.text.length).padStart(4)}  ${l.text}`);
} else {
  const todo = selected().filter((l) => manifest[l.n]?.sig !== signature(l, cfg.voices[l.speaker] || {}) || !existsSync(`${fileBase(l)}.mp3`));
  const missing = [...new Set(todo.filter((l) => !cfg.voices[l.speaker]?.id).map((l) => l.speaker))];
  if (missing.length) throw new Error(`No voice chosen in voices.json for: ${missing.join(', ')}`);
  const chars = todo.reduce((a, l) => a + l.text.length, 0);
  console.log(`${todo.length} line(s) to generate, ${chars} characters, about ${chars} credits at the list rate (${selected().length - todo.length} unchanged, reused for free).`);
  if (!todo.length) process.exit(0);
  if (!args.includes('--yes')) {
    for (const l of todo) console.log(`  ${l.n} ${l.speaker}: ${l.text}`);
    console.log('Nothing generated: add --yes to spend the credits.');
    process.exit(0);
  }
  mkdirSync(outDir, { recursive: true });
  const t0 = Math.floor(Date.now() / 1000) - 1;
  const requestIds = {};
  for (const l of todo) {
    const voice = cfg.voices[l.speaker];
    const s = cfg.settings;
    const { data, rawResponse } = await client.textToSpeech
      .convertWithTimestamps(voice.id, {
        text: l.text,
        modelId: cfg.model,
        outputFormat: cfg.output_format,
        voiceSettings: { stability: s.stability, similarityBoost: s.similarity_boost, style: s.style, useSpeakerBoost: s.use_speaker_boost },
        ...neighbours(l),
      })
      .withRawResponse();
    requestIds[l.n] = rawResponse.headers.get('request-id');
    writeFileSync(`${fileBase(l)}.mp3`, Buffer.from(data.audioBase64, 'base64'));
    writeFileSync(`${fileBase(l)}.json`, JSON.stringify({ text: l.text, alignment: data.alignment }, null, 1));
    manifest[l.n] = { speaker: l.speaker, sig: signature(l, voice), chars: l.text.length };
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 1));
    console.log(`  ${l.n} ${l.speaker}: ${l.text.length} chars  -> ${fileBase(l)}.mp3`);
  }
  const { credits, items } = await spentSince(t0, todo.length);
  for (const l of todo) {
    const h = items.find((i) => i.requestId && i.requestId === requestIds[l.n]);
    if (h) manifest[l.n].credits = h.characterCountChangeTo - h.characterCountChangeFrom;
  }
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 1));
  const rate = credits / chars;
  console.log(`Done. Credits spent: ${credits} for ${chars} characters (${rate.toFixed(2)} a character)${items.length < todo.length ? '; some takes are not in the history yet, check the usage page' : ''}.`);
}
