import React from 'react';
import { lerp, rnd } from '../engine';

// Props for "One Thing Into Gold", drawn like the kit's: flat fills, a darker shade away from the light, a warm rim
// line on the lit edge, a contact shadow.

/** Steel to gold: 0 is a grey steel colour, 1 the episode's gold. */
export const goldMix = (g: number, steel: string, gold: string) => {
  const h = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const a = h(steel);
  const b = h(gold);
  return `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], g))).join(',')})`;
};
export const GOLD = { light: '#FFE08A', mid: '#F2B93B', dark: '#B9821C' };

/** A paperclip from above, `w` long, turning to gold with `gold` (0..1). */
export const Paperclip: React.FC<{ x: number; y: number; w?: number; rot?: number; gold?: number; shine?: number }> = ({ x, y, w = 200, rot = 0, gold = 0, shine = 0 }) => {
  const s = w / 200;
  const stroke = goldMix(gold, '#A9B1BC', GOLD.mid);
  const edge = goldMix(gold, '#6E7682', GOLD.dark);
  const d = 'M -70 12 L 70 12 A 22 22 0 0 0 70 -32 L -78 -32 A 30 30 0 0 0 -78 28 L 50 28';
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d={d} transform="translate(4 6)" stroke="#000" strokeOpacity={0.3} strokeWidth={13} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke={edge} strokeWidth={13} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke={stroke} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M -60 -32 L 40 -32" stroke={goldMix(gold, '#E4E8EE', GOLD.light)} strokeWidth={3} strokeLinecap="round" opacity={0.9} />
      {shine > 0 ? (
        // a gleam travelling along the wire
        <circle cx={lerp(-90, 90, shine)} cy={-32} r={10} fill="#FFF6D0" opacity={Math.sin(Math.PI * shine)} />
      ) : null}
    </g>
  );
};

/** A small plush rabbit hugged against a chest: ears, a round head and body, in faded lilac. */
export const Rabbit: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <ellipse cx={-12} cy={-62} rx={9} ry={26} fill="#B7A9C9" stroke="#E9E3EE" strokeWidth={3} transform="rotate(-12 -12 -62)" />
    <ellipse cx={12} cy={-64} rx={9} ry={26} fill="#B7A9C9" stroke="#E9E3EE" strokeWidth={3} transform="rotate(10 12 -64)" />
    <ellipse cx={0} cy={6} rx={30} ry={34} fill="#A898BB" stroke="#E9E3EE" strokeWidth={3} />
    <circle cx={0} cy={-30} r={24} fill="#B7A9C9" stroke="#E9E3EE" strokeWidth={3} />
    <circle cx={-8} cy={-33} r={3} fill="#2A2233" />
    <circle cx={8} cy={-33} r={3} fill="#2A2233" />
    <ellipse cx={0} cy={-24} rx={4} ry={3} fill="#E58FA0" />
  </g>
);

/** A row of suburban houses at night, the middle one ours (`ourX`), its upstairs window lit gold by `glow`. */
export const NightStreet: React.FC<{ t: number; ourX?: number; glow?: number }> = ({ t, ourX = 960, glow = 0 }) => {
  const houses = [-180, 200, 580, ourX, 1340, 1720, 2100];
  return (
    <g>
      {houses.map((hx, i) => {
        const ours = hx === ourX;
        const w = ours ? 360 : 300 + rnd(7, i) * 60;
        const h = ours ? 300 : 240 + rnd(8, i) * 60;
        const top = 820 - h;
        const lit = (k: number) => rnd(9, i * 3 + k) > 0.45;
        return (
          <g key={i}>
            <polygon points={`${hx - w / 2 - 20},${top} ${hx},${top - 130} ${hx + w / 2 + 20},${top}`} fill={ours ? '#2B2440' : '#241F36'} />
            <rect x={hx - w / 2} y={top} width={w} height={h} fill={ours ? '#3A3352' : '#302A45'} />
            <rect x={hx + w / 2 - 50} y={top} width={50} height={h} fill="#000" opacity={0.15} />
            {[0, 1].map((k) => (
              <rect key={k} x={hx - w / 2 + 40 + k * (w - 140)} y={top + 50} width={60} height={70} fill={ours && k === 1 ? '#FFD98A' : lit(k) ? '#E8C27A' : '#1E1A2C'} opacity={ours && k === 1 ? 0.6 + 0.4 * glow : lit(k) ? 0.75 : 1} />
            ))}
            <rect x={hx - 30} y={820 - 110} width={60} height={110} fill="#1A1626" />
            {lit(2) || ours ? <rect x={hx - 80} y={820 - 95} width={34} height={44} fill="#E8C27A" opacity={0.55} /> : null}
          </g>
        );
      })}
      {/* the pavement, the kerb, the road with its dashes */}
      <rect x={-400} y={820} width={2720} height={40} fill="#3A3448" />
      <rect x={-400} y={860} width={2720} height={260} fill="#221E2E" />
      {Array.from({ length: 16 }).map((_, i) => (
        <rect key={i} x={-300 + i * 170 - ((t * 0) % 170)} y={960} width={90} height={10} rx={5} fill="#C9B27A" opacity={0.6} />
      ))}
      {/* street lamps */}
      {[390, 1530].map((lx, i) => (
        <g key={i}>
          <rect x={lx - 4} y={560} width={8} height={262} fill="#15121E" />
          <circle cx={lx} cy={556} r={11} fill="#FFE7B0" />
        </g>
      ))}
    </g>
  );
};
