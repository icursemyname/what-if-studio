import React from 'react';
import {
  rnd, makeRoom, RoomShell, BackWindow, Box, FloorPlant, WallFrame, LightVeil, Glow, Dust, FloorShadow,
  DuskSky, Sun, NightSky, Stars, Moon, Skyline, Haze, Room,
} from '../engine';
import { NightStreet } from './props';

// The episode's places, in the Golden Hour style: three times of day (golden, dusk, night), every light from a visible
// source. Each takes the shot clock t for its idle motion (dust, twinkle, sway).

export type Mode = 'dusk' | 'night' | 'morning';

/** The street of houses, at dusk, night or morning; the ground line is y 820. */
export const Street: React.FC<{ t: number; mode: Mode; id: string; ourX?: number; glow?: number }> = ({ t, mode, id, ourX = 960, glow = 0 }) => (
  <g>
    {mode === 'night' ? (
      <g>
        <NightSky id={`${id}sky`} horizonY={760} />
        <Stars seed={11} x0={-200} y0={-100} w={2300} h={600} t={t} n={70} />
        <Moon x={1560} y={190} r={52} />
      </g>
    ) : (
      <g>
        <DuskSky id={`${id}sky`} horizonY={780} />
        <Sun x={mode === 'dusk' ? 1180 : 760} y={mode === 'dusk' ? 700 : 520} r={mode === 'dusk' ? 120 : 90} t={t} />
        {mode === 'morning' ? <rect x={-400} y={-400} width={2720} height={1900} fill="#9FC3E8" opacity={0.25} /> : null}
      </g>
    )}
    <Skyline y={760} seed={4} color={mode === 'night' ? '#1C1730' : '#3A2A55'} h={170} />
    <NightStreet t={t} ourX={ourX} glow={glow} />
    {mode !== 'night' ? <rect x={-400} y={300} width={2720} height={900} fill={mode === 'dusk' ? '#FF9A5A' : '#FFD9A0'} opacity={0.12} style={{ mixBlendMode: 'screen' }} /> : null}
    {mode !== 'night' ? <Haze y={700} o={0.3} /> : null}
  </g>
);

// ---------- the living room: sofa, window, floor lamp, plant, frames, a wall clock (S12, S13, S25, S30) ----------
export const LIVING = makeRoom({ x: 960, y: 500 }, { x0: 440, x1: 1480, y0: 300, y1: 760 }, 3.3);
export const sofaSeat = (u: number) => LIVING.P(u, 0.8, 0.16);
export const LivingRoom: React.FC<{ t: number; id: string; mode?: Mode; clock?: string; veil?: number; sweep?: number }> = ({ t, id, mode = 'dusk', clock, veil = 0.45, sweep = -1 }) => {
  const r = LIVING;
  const { P } = r;
  const night = mode === 'night';
  const lamp = P(0.9, 0.52, 0.08);
  return (
    <g>
      <RoomShell r={r} id={id} wall={night ? '#2E2F4E' : '#4A3E5C'} side={night ? '#25264A' : '#3E3452'} floorC={night ? '#2A2232' : '#3A2C34'} ceiling={night ? '#15182A' : '#241E30'} />
      <BackWindow r={r} id={`${id}w`} t={t} x0={540} x1={860} y0={400} y1={600} sun={night ? undefined : { x: 760, y: 590 }} night={night} />
      <WallFrame x={1000} y={400} w={140} h={110} art={1} />
      <WallFrame x={1170} y={420} w={90} h={80} art={2} />
      {clock ? (
        <g>
          <rect x={1086} y={330} width={110} height={46} rx={6} fill="#1A1218" />
          <text x={1141} y={364} textAnchor="middle" fontFamily="monospace" fontSize={32} fill="#FF5A3A">
            {clock}
          </text>
          <Glow x={1141} y={352} r={120} kind="red" o={0.3} />
        </g>
      ) : null}
      {/* the sofa against the back wall */}
      <FloorShadow r={r} u={[0.4, 0.86]} w={[0.02, 0.22]} />
      <Box r={r} u={[0.42, 0.84]} v={[0.66, 1]} w={[0.02, 0.2]} front="#9AA6B8" top="#B4BECC" side="#7E8A9C" rim />
      <Box r={r} u={[0.42, 0.84]} v={[0.5, 0.68]} w={[0.0, 0.05]} front="#A8B4C4" top="#BCC6D2" />
      {/* the floor lamp in the corner */}
      <path d={`M ${lamp.x} ${lamp.y} L ${lamp.x} ${P(0.9, 1, 0.08).y}`} stroke="#2A2232" strokeWidth={6} />
      <polygon points={`${lamp.x - 34},${lamp.y} ${lamp.x + 34},${lamp.y} ${lamp.x + 22},${lamp.y - 46} ${lamp.x - 22},${lamp.y - 46}`} fill="#FFE7A8" />
      <FloorPlant r={r} u={0.12} w={0.3} />
      <LightVeil id={`${id}veil`} lights={[[lamp.x, lamp.y - 20, 520], [700, 500, 360]]} o={veil} />
      <Glow x={lamp.x} y={lamp.y - 20} r={420} o={0.55} />
      {sweep >= 0 ? (
        // headlights sweeping across the back wall through the curtains
        <polygon points={`${400 + sweep * 1200},300 ${560 + sweep * 1200},300 ${700 + sweep * 1200},780 ${460 + sweep * 1200},780`} fill="#FFF3C4" opacity={0.18 * Math.sin(Math.PI * Math.min(1, Math.max(0, sweep)))} />
      ) : null}
      <Dust t={t} seed={5} x0={lamp.x - 300} y0={lamp.y - 200} w={500} h={400} n={14} o={0.4} />
    </g>
  );
};
/** Hip point and scale for someone standing on the living-room floor at (u, w). */
export const livingStand = (u: number, w: number) => {
  const p = LIVING.P(u, 1, w);
  const scale = (0.6 * (LIVING.back.y1 - LIVING.back.y0) * LIVING.s(w)) / 378;
  return { x: p.x, y: p.y - 140 * scale, scale };
};

// ---------- the porch at dusk: planks, the front door, a lit window (S21) ----------
export const Porch: React.FC<{ t: number; id: string }> = ({ t, id }) => (
  <g>
    <rect x={-400} y={-400} width={2720} height={1300} fill="#5A4560" />
    {Array.from({ length: 30 }).map((_, i) => (
      <rect key={i} x={-400 + i * 96} y={-400} width={4} height={1160} fill="#3E2E46" />
    ))}
    <rect x={300} y={200} width={330} height={560} fill="#2A1E2C" />
    <circle cx={590} cy={480} r={14} fill="#E9C46A" />
    <rect x={1100} y={200} width={400} height={300} fill="#FFE7A8" />
    <rect x={1100} y={200} width={400} height={300} fill="none" stroke="#6A4A3A" strokeWidth={18} />
    <Glow x={1300} y={350} r={600} o={0.55} />
    <Glow x={760} y={160} r={200} o={0.6} />
    <circle cx={760} cy={160} r={18} fill="#FFF0C0" />
    <rect x={-400} y={760} width={2720} height={60} fill="#6A4E44" />
    {[0, 1, 2].map((i) => (
      <rect key={i} x={-400} y={820 + i * 90} width={2720} height={86} fill={['#5A4038', '#4E3832', '#42302C'][i]} />
    ))}
    <LightVeil id={`${id}veil`} lights={[[1300, 350, 700], [760, 160, 400]]} o={0.35} />
    <Dust t={t} seed={8} x0={900} y0={200} w={700} h={500} n={12} o={0.35} />
  </g>
);

// ---------- the junkyard at sunset: hills of scrap, the sun low, mud (S18) ----------
export const Junkyard: React.FC<{ t: number; id: string }> = ({ t, id }) => (
  <g>
    <DuskSky id={`${id}sky`} horizonY={760} red={0.3} />
    <Sun x={1400} y={690} r={130} t={t} />
    {[[-200, 760, 520, 260], [300, 760, 420, 200], [1200, 760, 600, 180], [1700, 760, 500, 240]].map(([x, y, w, h], i) => (
      <polygon key={i} points={`${x},${y} ${x + w * 0.2},${y - h} ${x + w * 0.45},${y - h * 0.7} ${x + w * 0.6},${y - h * 0.95} ${x + w},${y}`} fill="#2A1E30" />
    ))}
    <rect x={-400} y={760} width={2720} height={500} fill="#4A3628" />
    <ellipse cx={1000} cy={860} rx={560} ry={60} fill="#3A2A20" />
    <Haze y={700} o={0.35} />
  </g>
);

// ---------- the desert outside Cairo, 1324: dunes at sunset (S20) ----------
export const Desert: React.FC<{ t: number; id: string }> = ({ t, id }) => (
  <g>
    <DuskSky id={`${id}sky`} horizonY={700} />
    <Sun x={1500} y={600} r={150} t={t} />
    <path d="M -400 700 Q 200 580 700 690 Q 1200 600 2320 680 L 2320 1500 L -400 1500 Z" fill="#B97A50" />
    <path d="M -400 820 Q 400 740 1000 830 Q 1600 760 2320 840 L 2320 1500 L -400 1500 Z" fill="#9A6040" />
    <Haze y={640} o={0.3} />
  </g>
);

// ---------- the front door from inside the hall: the porch light outside (S23, D2) ----------
export const FrontDoor: React.FC<{ t: number; id: string; open: number; night?: boolean }> = ({ t, id, open, night = true }) => (
  <g>
    <rect x={-400} y={-400} width={2720} height={1900} fill={night ? '#2B2840' : '#3E3452'} />
    <rect x={-400} y={880} width={2720} height={700} fill="#231C2A" />
    <rect x={660} y={150} width={600} height={730} fill="#3A2A2A" />
    {/* outside: the porch at night, its lamp */}
    <rect x={680} y={170} width={560} height={710} fill={night ? '#1C1A30' : '#5A4A6A'} />
    <circle cx={960} cy={230} r={16} fill="#FFE7B0" opacity={open > 0.05 ? 1 : 0} />
    <Glow x={960} y={240} r={420} o={0.7 * Math.min(1, open * 2)} />
    {/* the door, hinged on the left, swinging in */}
    <polygon points={`680,170 ${680 + 560 * (1 - open)},${170 - 30 * open} ${680 + 560 * (1 - open)},${880 + 30 * open} 680,880`} fill="#5A3E36" stroke="#3A2620" strokeWidth={6} />
    {open < 0.9 ? <circle cx={680 + 520 * (1 - open)} cy={520} r={12} fill="#C9A44A" /> : null}
    <rect x={-400} y={-400} width={2720} height={1900} fill="#000" opacity={0.15} />
    <Dust t={t} seed={id.length} x0={700} y0={200} w={500} h={600} n={10} o={0.3} />
  </g>
);

/** A dark room around a TV: only the screen lights it. */
export const DarkRoom: React.FC<{ id: string }> = () => (
  <g>
    <rect x={-400} y={-400} width={2720} height={1900} fill="#0E0D16" />
    <rect x={-400} y={820} width={2720} height={700} fill="#16121C" />
  </g>
);

/** Scatter helper for crowds of small things (rings on a table, coins). */
export const scatter = (seed: number, n: number, x0: number, y0: number, w: number, h: number) =>
  Array.from({ length: n }).map((_, i) => ({ x: x0 + rnd(seed, i) * w, y: y0 + rnd(seed + 1, i) * h, r: rnd(seed + 2, i) }));
export type { Room };
