// The spoken lines of a roteiro-en.md, numbered the way the voice takes are (audio/voice/NNN_SPEAKER.mp3).
// Plain paragraphs are NARRATOR, **NAME:** lines are dialogue, *[...]* and *(...)* are directions and never spoken.
// Each line also carries its section (the "## m:ss — Title" heading it sits under).
export function parseScript(md) {
  const out = [];
  let section = null;
  for (const raw of md.split(/\r?\n/)) {
    const line = raw.trim();
    if (line.startsWith('## ')) section = line.slice(3).trim();
    if (!section || !line || line.startsWith('#') || /^\*\[.*\]\*$/.test(line)) continue;
    const m = line.match(/^\*\*([A-Z][A-Z .]*):\*\*\s*(.*)$/);
    const speaker = m ? m[1].trim() : 'NARRATOR';
    const text = (m ? m[2] : line).replace(/\*\[[^\]]*\]\*|\*\([^)]*\)\*/g, '').replace(/\s+/g, ' ').trim();
    if (text) out.push({ n: out.length + 1, speaker, text, section });
  }
  return out;
}
