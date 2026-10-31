import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { ShotFrame, Grade } from '../engine';
import type { Timeline } from '../animatic/Animatic';
import { G0, G1, G2, G3, G4, G5, G6, GoldShot } from './shots';
import { R1, R2, R3, R4, R5, R6, R7, F1, F2, F3, F4, F5, F6, F7, F8, F9, F10, F11, F12 } from './shots2';
import { W1, W2, W3, W4, C1, C2, C3, C4, C5, C6 } from './shots3';
import { N1, N2, N3, N4, N5, N6, N7, D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, E1, E2, E3, E4 } from './shots4';

// The fully animated episode. Shots are cut on the voice: each starts at a voice line, a sentence end or a sound cue
// from the animatic's timeline, so the picture always lands on the words. The voice and sound are the animatic's own
// takes and clips (public/<slug>-animatic/). No captions for the narrator. Two compositions: Gold-cold-open (the
// first section, the pilot) and Gold-episode (all of it).

type Cut = { id: string; Shot: GoldShot; from: number }; // from: seconds

export const cutList = (T: Timeline): Cut[] => {
  const line = (n: number) => T.lines.find((l) => l.n === n)!;
  const L = (n: number) => line(n).from;
  const sfx = (clip: string, after = 0) => T.sfx.find((s) => s.clip === clip && s.from >= after)!.from;
  const c = (id: string, Shot: GoldShot, from: number): Cut => ({ id, Shot, from });
  return [
    // cold open
    c('G0', G0, 0), c('G1', G1, L(1)), c('G2', G2, L(2)), c('G3', G3, L(3)), c('G4', G4, sfx('door_creak')), c('G5', G5, L(5)), c('G6', G6, L(6)),
    // the rules
    c('R1', R1, L(7)), c('R2', R2, L(8)), c('R3', R3, L(9)), c('R4', R4, L(11)), c('R5', R5, sfx('gold_clank') - 0.3), c('R6', R6, L(13)), c('R7', R7, L(14)),
    // the fun part
    c('F1', F1, L(15)), c('F2', F2, L(16)), c('F3', F3, L(17)), c('F4', F4, L(18)), c('F5', F5, L(19)), c('F6', F6, L(23)), c('F7', F7, L(24)),
    c('F8', F8, L(25)), c('F9', F9, L(26)), c('F10', F10, line(26).stops[1] ?? L(27)), c('F11', F11, L(28)), c('F12', F12, L(31)),
    // why gold is special
    c('W1', W1, L(32)), c('W2', W2, L(34)), c('W3', W3, L(35)), c('W4', W4, L(37)),
    // the cost
    c('C1', C1, L(38)), c('C2', C2, L(40)), c('C3', C3, L(43)), c('C4', C4, L(44)), c('C5', C5, L(45)), c('C6', C6, L(48)),
    // someone notices
    c('N1', N1, L(49)), c('N2', N2, L(50)), c('N3', N3, L(51)), c('N4', N4, L(52)), c('N5', N5, L(53)), c('N6', N6, L(54)), c('N7', N7, L(55)),
    // day 30
    c('D1', D1, L(56)), c('D2', D2, L(58)), c('D3', D3, L(59)), c('D4', D4, sfx('fingertip_glow', L(60))), c('D5', D5, L(61)), c('D6', D6, L(63)),
    c('D7', D7, L(65)), c('D8', D8, L(67)), c('D9', D9, sfx('land', L(67)) - 0.2), c('D10', D10, L(70)),
    // ending
    c('E1', E1, L(73)), c('E2', E2, L(76)), c('E3', E3, L(77)), c('E4', E4, L(78)),
  ];
};

export const GoldFilm: React.FC<{ timeline: Timeline; sections?: number }> = ({ timeline: T, sections }) => {
  const frame = useCurrentFrame();
  const fps = T.fps;
  const fr = (s: number) => Math.round(s * fps);
  const end = sections && sections < T.sections.length ? T.sections[sections].from : T.total;
  const cuts = cutList(T).filter((c) => c.from < end);
  const i = Math.max(0, cuts.findIndex((c, k) => frame >= fr(c.from) && (k === cuts.length - 1 || frame < fr(cuts[k + 1].from))));
  const cut = cuts[i];
  const a = fr(cut.from);
  const b = i + 1 < cuts.length ? fr(cuts[i + 1].from) : fr(end);
  const rel = (s: number) => fr(s) - a;
  const inShot = T.lines.filter((x) => fr(x.from) >= a && fr(x.from) < b);
  const cue = (name: string) => {
    const m = name.match(/^_line(\d*)$/);
    if (m) {
      const l = inShot[(m[1] ? Number(m[1]) : 1) - 1];
      return l ? rel(l.from) : 1e9;
    }
    const s = T.sfx.find((x) => x.clip === name && fr(x.from) >= a - 2 && fr(x.from) < b);
    return s ? rel(s.from) : 1e9;
  };
  const stops = T.lines.filter((l) => l.from + l.dur > cut.from - 0.01 && fr(l.from) < b).flatMap((l) => l.stops.map(rel)).filter((s) => s >= 0);
  const media = (dir: string, file: string) => staticFile(`${T.slug}-animatic/${dir}/${file}`);
  // black: in at the start, out at the end, and a short dip at every section change
  let black = Math.max(interpolate(frame, [0, 12], [1, 0], { extrapolateRight: 'clamp' }), interpolate(frame, [fr(end) - 24, fr(end)], [0, 1], { extrapolateLeft: 'clamp' }));
  for (const s of T.sections.slice(1)) {
    const f0 = fr(s.from);
    if (f0 >= fr(end)) continue;
    black = Math.max(black, interpolate(frame, [f0 - 10, f0 - 1, f0 + 1, f0 + 12], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  }
  return (
    <AbsoluteFill style={{ backgroundColor: '#0E0C1E' }}>
      <ShotFrame>
        <cut.Shot t={frame - a} len={b - a} f={frame} cue={cue} stops={stops} />
      </ShotFrame>
      <Grade f={frame} grain vignette />
      {T.lines
        .filter((l) => l.from < end)
        .map((l) => (
          <Sequence key={l.n} from={fr(l.from)} durationInFrames={Math.max(1, fr(l.dur) + 6)}>
            <Audio src={media('voice', l.take)} />
          </Sequence>
        ))}
      {T.sfx
        .filter((s) => s.from < end)
        .map((s, k) => (
          <Sequence key={k} from={fr(s.from)} durationInFrames={s.until ? Math.max(1, fr(Math.min(s.until, end)) - fr(s.from)) : undefined}>
            <Audio src={media('sfx', s.file)} volume={s.gain} loop={s.loop} />
          </Sequence>
        ))}
      {black > 0 ? <AbsoluteFill style={{ backgroundColor: '#000', opacity: black }} /> : null}
    </AbsoluteFill>
  );
};

export const GoldPilot: React.FC<{ timeline: Timeline }> = ({ timeline }) => <GoldFilm timeline={timeline} sections={1} />;
export const pilotLength = (T: Timeline) => Math.ceil(T.sections[1].from * T.fps);
export const filmLength = (T: Timeline) => Math.ceil(T.total * T.fps);
