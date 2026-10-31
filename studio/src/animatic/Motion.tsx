import React from 'react';
import { AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { FONT } from '../engine/fonts';
import type { Timeline } from './Animatic';

// The animated storyboard: the animatic's frames, voice and sound, with a camera on every cut (a framing that drifts
// in), cross-fades between frames, a dip to black between sections, and picture effects on the sound hits (flashes,
// glows, shakes). Captions only for the characters' lines, never the narrator's.

const W = 1920;
const H = 1080;
const DRIFT = 1.06; // how far each cut zooms in over its length
const XFADE = 0.4; // cross-fade between two storyboard frames, s
const DIP = 0.45; // fade to and from black around a section change, s

// The picture's answer to each sound: a flash of colour, a warm glow from the centre, a shake, a darkening.
type Fx = { flash?: [string, number]; glow?: number; shake?: number; dark?: number; len: number };
const FX: Record<string, Fx> = {
  gold_chime: { flash: ['#f6c94c', 0.45], len: 0.6 },
  gold_chime_deep: { flash: ['#f6c94c', 0.7], shake: 5, len: 1.4 },
  fingertip_glow: { glow: 0.55, len: 1.6 },
  sparkle: { flash: ['#fff1c2', 0.25], len: 0.4 },
  title_boom: { shake: 12, len: 0.7 },
  drone_hit: { shake: 6, dark: 0.35, len: 1.4 },
  gold_thud: { shake: 8, len: 0.35 },
  gold_clank: { shake: 8, len: 0.35 },
  land: { shake: 8, len: 0.4 },
  bike_crash: { shake: 14, len: 0.6 },
  car_crunch: { shake: 14, len: 0.8 },
  vault_door: { shake: 6, len: 0.6 },
  door_knock: { shake: 4, len: 0.9 },
  news_sting: { flash: ['#ffffff', 0.22], len: 0.35 },
  slowmo_whoosh: { dark: 0.45, len: 2 },
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// Where the picture sits for framing [x, y, zoom]: (x, y) at the centre of the screen, never showing past the edge.
function place([x, y, z]: [number, number, number]) {
  const cx = clamp(x, 0.5 / z, 1 - 0.5 / z);
  const cy = clamp(y, 0.5 / z, 1 - 0.5 / z);
  return `translate(${W / 2 - cx * W * z}px, ${H / 2 - cy * H * z}px) scale(${z})`;
}

export const Motion: React.FC<{ timeline: Timeline }> = ({ timeline: T }) => {
  const frame = useCurrentFrame();
  const fps = T.fps;
  const f = (s: number) => Math.round(s * fps);
  const media = (dir: string, file: string) => staticFile(`${T.slug}-animatic/${dir}/${file}`);
  const now = frame / fps;

  // Effects running now, from the sound hits.
  let shakeX = 0;
  let shakeY = 0;
  let dark = 0;
  const flashes: { color: string; o: number }[] = [];
  let glow = 0;
  for (const s of T.sfx) {
    const fx = FX[s.clip];
    if (!fx || now < s.from || now > s.from + fx.len) continue;
    const k = 1 - (now - s.from) / fx.len; // 1 at the hit, 0 at its end
    if (fx.shake) {
      shakeX += Math.sin(now * 61) * fx.shake * k;
      shakeY += Math.cos(now * 47) * fx.shake * 0.7 * k;
    }
    if (fx.flash) flashes.push({ color: fx.flash[0], o: fx.flash[1] * k * k });
    if (fx.glow) glow = Math.max(glow, fx.glow * Math.sin(Math.PI * (1 - k)));
    if (fx.dark) dark = Math.max(dark, fx.dark * Math.sin(Math.PI * (1 - k)));
  }

  // Black: fade in at the start, out at the end, and a dip around every section change.
  let black = interpolate(now, [0, 0.8], [1, 0], { extrapolateRight: 'clamp' });
  black = Math.max(black, interpolate(now, [T.total - 1.2, T.total], [0, 1], { extrapolateLeft: 'clamp' }));
  for (const s of T.sections.slice(1)) {
    black = Math.max(black, interpolate(now, [s.from - DIP, s.from - 0.05, s.from + 0.1, s.from + DIP], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  }
  const line = T.lines.find((l) => now >= l.from && now < l.from + l.dur);
  const sectionStarts = new Set(T.sections.map((s) => s.from));

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <AbsoluteFill style={{ transform: `translate(${shakeX}px, ${shakeY}px) scale(${shakeX || shakeY ? 1.02 : 1})` }}>
        {T.shots.map((shot, i) => {
          // A frame fades in over the one before it, unless a section change (already a dip to black) is between.
          const fade = i > 0 && !sectionStarts.has(shot.from) ? XFADE : 0;
          return shot.cuts.map((c, k) => {
            const start = k === 0 ? c.from - fade : c.from;
            const len = Math.max(1, f(c.until) - f(start) + (k === shot.cuts.length - 1 ? 1 : 0));
            return (
              <Sequence key={`${shot.id}-${k}`} from={f(start)} durationInFrames={len}>
                <Cut src={media('board', `${shot.id}.jpg`)} frame={c.frame} len={len} fadeFrames={k === 0 ? f(fade) : 0} />
              </Sequence>
            );
          });
        })}
      </AbsoluteFill>

      {glow > 0 ? (
        <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 55%, rgba(255,196,92,0.9), rgba(255,170,60,0) 55%)', opacity: glow, mixBlendMode: 'screen' }} />
      ) : null}
      {flashes.map((fl, i) => (
        <AbsoluteFill key={i} style={{ backgroundColor: fl.color, opacity: fl.o, mixBlendMode: 'screen' }} />
      ))}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.38) 100%)' }} />
      {dark > 0 ? <AbsoluteFill style={{ backgroundColor: '#000', opacity: dark }} /> : null}

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

      {line && line.speaker !== 'NARRATOR' ? (
        <div style={{ position: 'absolute', left: 160, right: 160, bottom: 72, textAlign: 'center' }}>
          <span
            style={{
              fontFamily: FONT.title,
              fontSize: 48,
              lineHeight: 1.3,
              color: '#fff',
              background: 'rgba(0,0,0,.6)',
              padding: '8px 20px',
              borderRadius: 10,
              boxDecorationBreak: 'clone',
              WebkitBoxDecorationBreak: 'clone',
            }}
          >
            <b style={{ color: '#f1c75b' }}>{line.speaker === 'SUIT' ? 'THE MAN' : line.speaker}: </b>
            {line.text}
          </span>
        </div>
      ) : null}

      {black > 0 ? <AbsoluteFill style={{ backgroundColor: '#000', opacity: black }} /> : null}
    </AbsoluteFill>
  );
};

// One cut: the storyboard frame at its framing, drifting in over the cut's length, fading in if it starts a frame.
const Cut: React.FC<{ src: string; frame: [number, number, number]; len: number; fadeFrames: number }> = ({ src, frame, len, fadeFrames }) => {
  const t = useCurrentFrame();
  const p = interpolate(t, [0, len], [0, 1], { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.sin) });
  const [x, y, z] = frame;
  const opacity = fadeFrames ? interpolate(t, [0, fadeFrames], [0, 1], { extrapolateRight: 'clamp' }) : 1;
  return (
    <AbsoluteFill style={{ opacity, overflow: 'hidden' }}>
      <Img
        src={src}
        style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: '0 0', transform: place([x, y, z * (1 + (DRIFT - 1) * p)]) }}
      />
    </AbsoluteFill>
  );
};
