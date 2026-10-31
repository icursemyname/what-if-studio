import React from 'react';
import { AbsoluteFill } from 'remotion';
import { KitDefs, SetDefs, FONT } from '../engine';
import type { Timeline } from '../animatic/Animatic';
import { cutList } from './Pilot';

// A contact sheet of the whole episode: every shot at `at` (0..1) of its length, in a grid, with its id, to check the
// drawing of all the shots in one still:
//   npx remotion still src/index.ts Gold-contact out/gold-contact.png --props='{"at":0.6}'

export const GoldContact: React.FC<{ timeline: Timeline; at?: number; from?: number; count?: number }> = ({ timeline: T, at = 0.6, from = 0, count = 30 }) => {
  const fps = T.fps;
  const fr = (s: number) => Math.round(s * fps);
  const all = cutList(T);
  const cuts = all.slice(from, from + count);
  const cols = 6;
  const w = 1920 / cols;
  const h = w * 0.5625;
  return (
    <AbsoluteFill style={{ backgroundColor: '#0B0A12' }}>
      {cuts.map((c, k) => {
        const idx = from + k;
        const a = fr(c.from);
        const b = idx + 1 < all.length ? fr(all[idx + 1].from) : fr(T.total);
        const t = Math.round((b - a) * at);
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
        const stops = T.lines.filter((l) => l.from + l.dur > c.from - 0.01 && fr(l.from) < b).flatMap((l) => l.stops.map(rel)).filter((s) => s >= 0);
        return (
          <div key={c.id} style={{ position: 'absolute', left: (k % cols) * w, top: Math.floor(k / cols) * (h + 34), width: w, height: h + 34 }}>
            <svg width={w - 6} height={h} viewBox="0 0 1920 1080" style={{ background: '#0E0C1E' }}>
              <KitDefs />
              <SetDefs />
              <c.Shot t={t} len={b - a} f={a + t} cue={cue} stops={stops} />
            </svg>
            <div style={{ fontFamily: FONT.ui, fontSize: 20, color: '#F6EFE3', paddingLeft: 4 }}>
              {c.id} · {(b - a) / fps < 10 ? ((b - a) / fps).toFixed(1) : Math.round((b - a) / fps)}s
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
