import React from 'react';
import { AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { FONT } from '../engine/fonts';

// An animatic: storyboard frames held over the voice takes, sound effects in the pauses, the spoken line as a caption
// and the shot id in the corner. The timeline (in seconds) comes from `npm run animatic -- <slug>` at the repo root,
// which also copies the media into public/<slug>-animatic/.

export type Timeline = {
  slug: string;
  fps: number;
  total: number;
  lines: { n: number; speaker: string; text: string; take: string; from: number; dur: number; stops: number[] }[];
  shots: {
    id: string;
    from: number;
    until: number;
    line: number;
    cuts: { from: number; until: number; frame: [number, number, number] }[];
  }[];
  sfx: { clip: string; file: string; from: number; until?: number; loop?: boolean; gain: number; what: string }[];
  sections: { title: string; from: number }[];
};

export const Animatic: React.FC<{ timeline: Timeline }> = ({ timeline: T }) => {
  const frame = useCurrentFrame();
  const f = (s: number) => Math.round(s * T.fps);
  const media = (dir: string, file: string) => staticFile(`${T.slug}-animatic/${dir}/${file}`);
  const now = frame / T.fps;
  const shot = T.shots.find((s) => now >= s.from && now < s.until) ?? T.shots[T.shots.length - 1];
  const line = T.lines.find((l) => now >= l.from && now < l.from + l.dur);
  const section = [...T.sections].reverse().find((s) => now >= s.from);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {T.shots.map((s) => (
        <Sequence key={s.id} from={f(s.from)} durationInFrames={Math.max(1, f(s.until) - f(s.from))}>
          <Img src={media('board', `${s.id}.jpg`)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </Sequence>
      ))}
      {T.lines.map((l) => (
        <Sequence key={l.n} from={f(l.from)} durationInFrames={Math.max(1, f(l.dur) + 6)}>
          <Audio src={media('voice', l.take)} />
        </Sequence>
      ))}
      {T.sfx.map((s, i) => (
        <Sequence key={i} from={f(s.from)} durationInFrames={s.until ? Math.max(1, f(s.until) - f(s.from)) : undefined}>
          <Audio src={media('sfx', s.file)} volume={s.gain} loop={s.loop} />
        </Sequence>
      ))}
      <div style={{ position: 'absolute', top: 28, left: 32, display: 'flex', gap: 14, fontFamily: 'monospace', fontSize: 26, color: '#fff' }}>
        <span style={{ background: 'rgba(0,0,0,.6)', padding: '4px 12px', borderRadius: 6 }}>{shot.id}</span>
        {section ? <span style={{ background: 'rgba(0,0,0,.45)', padding: '4px 12px', borderRadius: 6 }}>{section.title}</span> : null}
      </div>
      {line ? (
        <div style={{ position: 'absolute', left: 120, right: 120, bottom: 56, textAlign: 'center' }}>
          <span
            style={{
              fontFamily: FONT.title,
              fontSize: 44,
              lineHeight: 1.3,
              color: '#fff',
              background: 'rgba(0,0,0,.62)',
              padding: '8px 18px',
              borderRadius: 8,
              boxDecorationBreak: 'clone',
              WebkitBoxDecorationBreak: 'clone',
            }}
          >
            {line.speaker !== 'NARRATOR' ? <b style={{ color: '#f1c75b' }}>{line.speaker}: </b> : null}
            {line.text}
          </span>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
