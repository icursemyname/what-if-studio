import React from 'react';
import { lerp, clamp, rnd, FONT } from '../engine';
import { GOLD, goldMix } from './props';

// The episode's objects: everything Arlo touches, plus what the story needs around it. Flat fills, a darker shade
// away from the light, a light outline where the cast has one, a contact shadow. `gold` (0..1) turns things gold.

const OUT = '#E9E3EE';
const shadow = (w: number, y = 0) => <ellipse cx={0} cy={y} rx={w * 0.55} ry={w * 0.07} fill="#000" opacity={0.3} />;

/** A pillow from the side, gold with `gold`. */
export const Pillow: React.FC<{ x: number; y: number; w?: number; rot?: number; gold?: number }> = ({ x, y, w = 220, rot = 0, gold = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <path d={`M ${-w / 2} 0 Q ${-w / 2 - 14} ${-w * 0.28} ${-w / 2 + 10} ${-w * 0.36} Q 0 ${-w * 0.46} ${w / 2 - 10} ${-w * 0.36} Q ${w / 2 + 14} ${-w * 0.28} ${w / 2} 0 Q 0 ${w * 0.08} ${-w / 2} 0 Z`} fill={goldMix(gold, '#E4DDCC', GOLD.mid)} stroke={goldMix(gold, '#B9B1A2', GOLD.dark)} strokeWidth={5} />
    <path d={`M ${-w / 2 + 20} ${-w * 0.3} Q 0 ${-w * 0.4} ${w / 2 - 30} ${-w * 0.3}`} stroke={goldMix(gold, '#FFFFFF', GOLD.light)} strokeWidth={6} fill="none" opacity={0.8} strokeLinecap="round" />
  </g>
);

/** A work glove lying flat (from above or the side), gold with `gold`. */
export const Glove: React.FC<{ x: number; y: number; s?: number; rot?: number; gold?: number }> = ({ x, y, s = 1, rot = 0, gold = 1 }) => {
  const f = goldMix(gold, '#8A7A6A', GOLD.mid);
  const e = goldMix(gold, '#5A4E44', GOLD.dark);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <ellipse cx={10} cy={70} rx={130} ry={18} fill="#000" opacity={0.3} />
      <rect x={-140} y={-30} width={70} height={80} rx={12} fill={e} />
      <rect x={-80} y={-40} width={170} height={100} rx={36} fill={f} stroke={e} strokeWidth={6} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={70} y={-36 + i * 24} width={70} height={22} rx={11} fill={f} stroke={e} strokeWidth={5} />
      ))}
      <rect x={-20} y={-90} width={34} height={70} rx={17} fill={f} stroke={e} strokeWidth={5} />
      <path d="M -60 -26 L 60 -26" stroke={GOLD.light} strokeWidth={5} opacity={0.8 * gold} strokeLinecap="round" />
    </g>
  );
};

/** A teaspoon, `len` long, in a mug or on its own, gold with `gold`. */
export const Spoon: React.FC<{ x: number; y: number; len?: number; rot?: number; gold?: number }> = ({ x, y, len = 120, rot = 0, gold = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-4} y={-len} width={8} height={len * 0.75} rx={4} fill={goldMix(gold, '#B8BEC6', GOLD.mid)} stroke={goldMix(gold, '#7A828C', GOLD.dark)} strokeWidth={2} />
    <ellipse cx={0} cy={-len * 0.18} rx={12} ry={20} fill={goldMix(gold, '#B8BEC6', GOLD.mid)} stroke={goldMix(gold, '#7A828C', GOLD.dark)} strokeWidth={2} />
  </g>
);

/** A bicycle from the side, `fold` (0..1) bending its gold frame like a noodle. x, y: between the wheels on the ground. */
export const Bike: React.FC<{ x: number; y: number; s?: number; fold?: number; gold?: number }> = ({ x, y, s = 1, fold = 0, gold = 1 }) => {
  const c = goldMix(gold, '#3A6FA0', GOLD.mid);
  const r = 70;
  const sag = fold * 90;
  const lean = fold * 18;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {shadow(300, 4)}
      <g transform={`rotate(${-lean} -110 ${-r}) translate(0 ${fold * 10})`}>
        <circle cx={-110} cy={-r} r={r} fill="none" stroke={c} strokeWidth={12} />
        <circle cx={-110} cy={-r} r={8} fill={c} />
      </g>
      <g transform={`rotate(${lean} 110 ${-r})`}>
        <circle cx={110} cy={-r} r={r} fill="none" stroke={c} strokeWidth={12} />
        <circle cx={110} cy={-r} r={8} fill={c} />
      </g>
      <path d={`M -110 ${-r} L ${-20} ${-r - 70 + sag} L 60 ${-r - 70 + sag * 0.4} L 110 ${-r} M -20 ${-r - 70 + sag} L 10 ${-r + sag * 0.6} L -110 ${-r} M 10 ${-r + sag * 0.6} L 60 ${-r - 70 + sag * 0.4} M 60 ${-r - 70 + sag * 0.4} L 70 ${-r - 120 + sag * 0.6} L 40 ${-r - 130 + sag * 0.6} M -30 ${-r - 82 + sag} L -2 ${-r - 82 + sag}`} stroke={c} strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M -20 ${-r - 70 + sag} L 60 ${-r - 70 + sag * 0.4}`} stroke={GOLD.light} strokeWidth={4} opacity={0.7 * gold} />
    </g>
  );
};

/** An old hatchback from the side; `gold` (0..1) turns it gold, `sink` pushes it into the mud. x, y: centre on the ground. */
export const Car: React.FC<{ x: number; y: number; s?: number; gold?: number; sink?: number; body?: string; lights?: number; flip?: boolean }> = ({ x, y, s = 1, gold = 0, sink = 0, body = '#6B6F7A', lights = 0, flip = false }) => {
  const b = goldMix(gold, body, GOLD.mid);
  const d = goldMix(gold, '#3A3D46', GOLD.dark);
  const win = goldMix(gold, '#8FA8C0', GOLD.light);
  return (
    <g transform={`translate(${x} ${y + sink * 70}) scale(${flip ? -s : s} ${s})`}>
      {sink === 0 ? shadow(440, 4) : null}
      <path d="M -220 -40 L -210 -100 L -120 -110 L -70 -175 L 90 -175 L 150 -110 L 215 -100 L 225 -40 Z" fill={b} stroke={d} strokeWidth={6} strokeLinejoin="round" />
      <path d="M -105 -112 L -62 -164 L 0 -164 L 0 -112 Z M 14 -112 L 14 -164 L 84 -164 L 132 -112 Z" fill={win} opacity={0.85} />
      <path d="M -200 -88 L 205 -88" stroke={GOLD.light} strokeWidth={6} opacity={0.6 * gold} strokeLinecap="round" />
      {[-130, 130].map((wx) => (
        <g key={wx}>
          <circle cx={wx} cy={-30} r={44} fill="#1A1A20" />
          <circle cx={wx} cy={-30} r={20} fill={goldMix(gold, '#9A9EA8', GOLD.light)} />
        </g>
      ))}
      <rect x={205} y={-96} width={22} height={18} rx={6} fill="#FFE7A0" opacity={0.4 + 0.6 * lights} />
      {lights > 0 ? <path d="M 225 -88 L 760 -160 L 760 0 Z" fill="#FFE7A0" opacity={0.18 * lights} /> : null}
    </g>
  );
};

/** A gold coin face-on, with a bite out of its rim after `bite` > 0. */
export const Coin: React.FC<{ x: number; y: number; r?: number; bite?: number }> = ({ x, y, r = 120, bite = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    <defs>
      <mask id={`coinbite${Math.round(x)}`}>
        <rect x={-r - 10} y={-r - 10} width={r * 2 + 20} height={r * 2 + 20} fill="#fff" />
        {bite > 0 ? [0, 1, 2].map((i) => <circle key={i} cx={r * 0.62 + i * 0} cy={-r * 0.62 + (i - 1) * r * 0.22} r={r * 0.2 * bite} fill="#000" />) : null}
      </mask>
    </defs>
    <g mask={`url(#coinbite${Math.round(x)})`}>
      <circle r={r} fill={GOLD.mid} stroke={GOLD.dark} strokeWidth={10} />
      <circle r={r * 0.78} fill="none" stroke={GOLD.dark} strokeWidth={5} opacity={0.6} />
      <text y={r * 0.22} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={r * 0.7} fill={GOLD.dark}>
        Au
      </text>
      <path d={`M ${-r * 0.6} ${-r * 0.5} A ${r * 0.8} ${r * 0.8} 0 0 1 ${r * 0.2} ${-r * 0.75}`} stroke={GOLD.light} strokeWidth={10} fill="none" strokeLinecap="round" />
    </g>
  </g>
);

/** A phone face-on that turns into a solid gold slab: the screen and buttons melt into gold with `gold`. */
export const GoldPhone: React.FC<{ x: number; y: number; w?: number; rot?: number; gold?: number }> = ({ x, y, w = 200, rot = 0, gold = 0 }) => {
  const h = w * 2;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-w / 2 + 10} y={-h / 2 + 14} width={w} height={h} rx={w * 0.16} fill="#000" opacity={0.3} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={w * 0.16} fill={goldMix(gold, '#1E1D26', GOLD.mid)} stroke={goldMix(gold, '#0E0D14', GOLD.dark)} strokeWidth={6} />
      <rect x={-w / 2 + 12} y={-h / 2 + 26} width={w - 24} height={h - 60} rx={w * 0.08} fill="#3E6FA8" opacity={1 - gold} />
      {gold < 1 ? [0, 1, 2, 3].map((i) => <rect key={i} x={-w / 2 + 26 + (i % 2) * (w / 2 - 20)} y={-h / 2 + 50 + Math.floor(i / 2) * 60} width={40} height={40} rx={10} fill="#F2C94C" opacity={(1 - gold) * 0.9} />) : null}
      <path d={`M ${-w / 2 + 20} ${-h / 2 + 30} L ${-w / 2 + 20} ${h / 2 - 40}`} stroke={GOLD.light} strokeWidth={8} opacity={0.8 * gold} strokeLinecap="round" />
    </g>
  );
};

/** A bill from above, with a PAID stamp landing on it at `stamp` (frames since; < 0 for none). */
export const Bill: React.FC<{ x: number; y: number; w?: number; rot?: number; title: string; amount: string; stamp?: number }> = ({ x, y, w = 330, rot = 0, title, amount, stamp = -1 }) => {
  const h = w * 1.3;
  const k = stamp < 0 ? 0 : clamp(stamp / 5);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-w / 2 + 10} y={-h / 2 + 12} width={w} height={h} fill="#000" opacity={0.3} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#F4EEE2" />
      <text x={-w / 2 + 26} y={-h / 2 + 60} fontFamily={FONT.ui} fontSize={34} fill="#2A2433">
        {title}
      </text>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={-w / 2 + 26} y={-h / 2 + 100 + i * 34} width={w * (0.4 + rnd(3, i) * 0.4)} height={10} rx={5} fill="#C9C0B0" />
      ))}
      <text x={w / 2 - 26} y={h / 2 - 34} textAnchor="end" fontFamily={FONT.ui} fontSize={42} fill="#2A2433">
        {amount}
      </text>
      {stamp >= 0 ? (
        <g transform={`rotate(-14) scale(${lerp(1.8, 1, k)})`} opacity={k}>
          <rect x={-120} y={-44} width={240} height={88} rx={10} fill="none" stroke="#C8343F" strokeWidth={8} />
          <text y={22} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={64} fill="#C8343F">
            PAID
          </text>
        </g>
      ) : null}
    </g>
  );
};

/** A plain cardboard folder, open or shut (`open` 0..1), from above. */
export const Folder: React.FC<{ x: number; y: number; w?: number; open?: number; rot?: number; children?: React.ReactNode }> = ({ x, y, w = 420, open = 1, rot = 0, children }) => {
  const h = w * 1.25;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-w * open - 10} y={-h / 2 + 14} width={w * (1 + open) + 20} height={h} fill="#000" opacity={0.3} />
      {open > 0.05 ? <rect x={-w * open} y={-h / 2} width={w * open} height={h} fill="#B89A6A" stroke="#8A7048" strokeWidth={4} /> : null}
      <rect x={0} y={-h / 2} width={w} height={h} fill="#C9AB78" stroke="#8A7048" strokeWidth={4} />
      {open > 0.6 ? children : null}
    </g>
  );
};

/** A photo print (a house or a school), front-on with a white border. */
export const Photo: React.FC<{ x: number; y: number; w?: number; rot?: number; kind: 'house' | 'school' }> = ({ x, y, w = 300, rot = 0, kind }) => {
  const h = w * 0.78;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#F6F2EA" />
      <rect x={-w / 2 + 14} y={-h / 2 + 14} width={w - 28} height={h - 54} fill={kind === 'house' ? '#3E4A6E' : '#8FB4D8'} />
      {kind === 'house' ? (
        <g>
          <polygon points={`${-60},${-10} 0,${-60} 60,${-10}`} fill="#2A2440" />
          <rect x={-50} y={-10} width={100} height={70} fill="#5A5072" />
          <rect x={-30} y={4} width={22} height={22} fill="#FFD98A" />
          <rect x={10} y={24} width={20} height={36} fill="#2A2440" />
        </g>
      ) : (
        <g>
          <rect x={-100} y={-30} width={200} height={90} fill="#C46A4A" />
          <polygon points={`-30,-30 0,-56 30,-30`} fill="#A4523A" />
          {[-80, -40, 20, 60].map((wx) => <rect key={wx} x={wx} y={-10} width={22} height={22} fill="#F4EEE2" />)}
          <circle cx={130} cy={-60} r={16} fill="#F6D06A" />
        </g>
      )}
      <circle cx={w / 2 - 34} cy={-h / 2 + 34} r={22} fill="none" stroke="#C8343F" strokeWidth={6} />
    </g>
  );
};

/** A gold necklace with a pendant, hanging from a hand point (x, y). */
export const Necklace: React.FC<{ x: number; y: number; s?: number; swing?: number }> = ({ x, y, s = 1, swing = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${swing}) scale(${s})`}>
    <path d="M -30 0 Q -40 70 0 90 Q 40 70 30 0" stroke={GOLD.mid} strokeWidth={6} fill="none" />
    <circle cx={0} cy={96} r={12} fill={GOLD.mid} stroke={GOLD.dark} strokeWidth={4} />
  </g>
);

/** A ring, from the side. */
export const Ring: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 22 }) => (
  <g>
    <ellipse cx={x} cy={y} rx={r} ry={r * 0.45} fill="none" stroke={GOLD.mid} strokeWidth={r * 0.32} />
    <circle cx={x} cy={y - r * 0.45} r={r * 0.25} fill="#BFE6FF" />
  </g>
);

/** A camel walking in profile (to the right), carrying a gold load; `phase` swings its legs. x, y: feet. */
export const Camel: React.FC<{ x: number; y: number; s?: number; phase?: number; color?: string }> = ({ x, y, s = 1, phase = 0, color = '#1E1622' }) => {
  const leg = (lx: number, k: number) => {
    const a = Math.sin(phase + k) * 16;
    return <path key={lx} d={`M ${lx} -150 L ${lx + Math.sin((a * Math.PI) / 180) * 120} 0`} stroke={color} strokeWidth={16} strokeLinecap="round" />;
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[leg(-70, 0), leg(-40, Math.PI), leg(60, Math.PI), leg(90, 0)]}
      <ellipse cx={10} cy={-190} rx={120} ry={60} fill={color} />
      <ellipse cx={-10} cy={-246} rx={60} ry={40} fill={color} />
      <path d={`M 110 -200 Q 150 -${250 + Math.sin(phase * 2) * 6} 170 -300`} stroke={color} strokeWidth={30} strokeLinecap="round" fill="none" />
      <ellipse cx={190} cy={-306} rx={36} ry={20} fill={color} />
      <rect x={-60} y={-300} width={90} height={44} rx={6} fill={GOLD.dark} />
      <rect x={-60} y={-300} width={90} height={10} rx={4} fill={GOLD.light} opacity={0.7} />
    </g>
  );
};

/** A round bank-vault door, face-on; `close` (0..1) swings it shut from open. */
export const Vault: React.FC<{ x: number; y: number; r?: number; close?: number; spin?: number }> = ({ x, y, r = 300, close = 1, spin = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r + 40} fill="#2A2D36" />
    <circle r={r} fill="#14151A" />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={20 + i * 70 - r} y={-60} width={50} height={120} fill={GOLD.mid} opacity={0.85} transform={`translate(${r * 0.2} 30)`} />
    ))}
    <g transform={`scale(${lerp(0.08, 1, close)} 1) translate(${(1 - close) * -r} 0)`}>
      <circle r={r} fill="#7A808C" stroke="#4A4E58" strokeWidth={14} />
      <circle r={r * 0.75} fill="none" stroke="#5E636E" strokeWidth={8} />
      <g transform={`rotate(${spin})`}>
        {[0, 60, 120].map((a) => (
          <rect key={a} x={-r * 0.45} y={-9} width={r * 0.9} height={18} rx={9} fill="#C9CED6" transform={`rotate(${a})`} />
        ))}
        <circle r={r * 0.12} fill="#C9CED6" />
      </g>
    </g>
  </g>
);

/** A price chart on a dark panel, the line falling as `p` goes 0 to 1, with a red arrow at its head. */
export const PriceChart: React.FC<{ x: number; y: number; w?: number; h?: number; p: number; label?: string }> = ({ x, y, w = 700, h = 380, p, label = 'GOLD PRICE' }) => {
  const pts = [0.15, 0.22, 0.18, 0.36, 0.33, 0.52, 0.6, 0.78, 0.88].map((v, i, a) => ({ x: (i / (a.length - 1)) * w, y: v * h }));
  const n = Math.max(1, Math.floor(p * (pts.length - 1)) + 1);
  const shown = pts.slice(0, n + 1);
  const f = p * (pts.length - 1) - (n - 1);
  const last = shown.length > n ? { x: lerp(pts[n - 1].x, pts[Math.min(n, pts.length - 1)].x, clamp(f)), y: lerp(pts[n - 1].y, pts[Math.min(n, pts.length - 1)].y, clamp(f)) } : pts[n - 1];
  const line = [...pts.slice(0, n), last];
  return (
    <g transform={`translate(${x - w / 2} ${y - h / 2})`}>
      <rect x={-40} y={-80} width={w + 80} height={h + 120} rx={20} fill="#151826" opacity={0.92} />
      <text x={0} y={-30} fontFamily={FONT.ui} fontSize={30} fill="#F6EFE3" letterSpacing={4}>
        {label}
      </text>
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M 0 ${(i / 3) * h} L ${w} ${(i / 3) * h}`} stroke="#2A3048" strokeWidth={2} />
      ))}
      <polyline points={line.map((q) => `${q.x},${q.y}`).join(' ')} fill="none" stroke="#E5484D" strokeWidth={9} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last.x} cy={last.y} r={12} fill="#E5484D" />
    </g>
  );
};

/** A school backpack from behind, with a gold paperclip hanging from its zipper (swinging with `swing`). */
export const Backpack: React.FC<{ x: number; y: number; s?: number; swing?: number }> = ({ x, y, s = 1, swing = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-260} y={-300} width={520} height={600} rx={120} fill="#3E8C86" stroke={OUT} strokeWidth={8} />
    <rect x={-200} y={20} width={400} height={230} rx={60} fill="#347570" stroke={OUT} strokeWidth={6} />
    <path d="M -170 40 L 170 40" stroke="#C9C2B4" strokeWidth={10} strokeLinecap="round" />
    <g transform={`translate(120 40) rotate(${swing})`}>
      <rect x={-8} y={0} width={16} height={34} rx={6} fill="#C9C2B4" />
      <g transform="translate(0 90) rotate(90) scale(0.55)">
        <path d="M -70 12 L 70 12 A 22 22 0 0 0 70 -32 L -78 -32 A 30 30 0 0 0 -78 28 L 50 28" stroke={GOLD.dark} strokeWidth={13} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M -70 12 L 70 12 A 22 22 0 0 0 70 -32 L -78 -32 A 30 30 0 0 0 -78 28 L 50 28" stroke={GOLD.mid} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  </g>
);

/** A cake slice with a sheet of gold leaf on top, on a plate, from the side. */
export const CakeSlice: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={10} rx={200} ry={40} fill="#E9E3EE" />
    <ellipse cx={0} cy={4} rx={170} ry={30} fill="#F6F2EA" />
    <polygon points="-130,0 110,0 60,-150 -60,-150" fill="#7A4A3A" />
    <polygon points="-120,-60 100,-60 85,-95 -100,-95" fill="#F2DCC4" />
    <polygon points="-60,-150 60,-150 70,-162 -66,-162" fill="#F6EFE3" />
    <polygon points="-40,-162 30,-162 22,-176 -30,-174" fill={GOLD.mid} />
  </g>
);

/** A small piece of gold leaf drifting down (a flake). */
export const Flake: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <rect x={x - 12 * s} y={y - 8 * s} width={24 * s} height={16 * s} fill={GOLD.mid} transform={`rotate(${rot} ${x} ${y})`} />
);

/** A shop scale with a pan, a gold lump on it, the needle swinging to `p`. */
export const ShopScale: React.FC<{ x: number; y: number; p: number }> = ({ x, y, p }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-120} y={-20} width={240} height={60} rx={12} fill="#4A4E58" />
    <rect x={-160} y={-40} width={320} height={22} rx={10} fill="#C9CED6" />
    <rect x={-70} y={0} width={140} height={34} rx={6} fill="#14151A" />
    <text x={0} y={27} textAnchor="middle" fontFamily={FONT.ui} fontSize={28} fill="#7CFFB0">
      {(p * 312).toFixed(1)}g
    </text>
  </g>
);

/** A stack of banknotes. */
export const Cash: React.FC<{ x: number; y: number; n?: number; s?: number }> = ({ x, y, n = 4, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {Array.from({ length: n }).map((_, i) => (
      <g key={i} transform={`translate(${(i % 2) * 6} ${-i * 14})`}>
        <rect x={-90} y={-20} width={180} height={40} rx={4} fill="#5E9A6A" stroke="#3E6A48" strokeWidth={3} />
        <circle cx={0} cy={0} r={12} fill="#3E6A48" opacity={0.6} />
      </g>
    ))}
  </g>
);

/** A TV seen from the front in a dark room, its screen's content passed in as children (drawn in screen space). */
export const TV: React.FC<{ x: number; y: number; w?: number; glow?: number; children?: React.ReactNode }> = ({ x, y, w = 900, glow = 1, children }) => {
  const h = w * 0.56;
  return (
    <g transform={`translate(${x - w / 2} ${y - h / 2})`}>
      <rect x={-24} y={-24} width={w + 48} height={h + 48} rx={18} fill="#0E0D14" />
      <svg x={0} y={0} width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <rect width={w} height={h} fill="#1B2440" />
        {children}
      </svg>
      <rect x={w / 2 - 14} y={h + 24} width={28} height={70} fill="#0E0D14" />
      <rect x={w / 2 - 120} y={h + 90} width={240} height={16} rx={8} fill="#0E0D14" />
      <rect x={-24} y={-24} width={w + 48} height={h + 48} rx={18} fill="none" stroke="#5A6A9A" strokeWidth={3} opacity={0.4 * glow} />
    </g>
  );
};
