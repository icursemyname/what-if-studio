import React from 'react';
import { Pose, joints, toWorld, Glow, Schematic, SchLabel, DrawOn, SCH, clamp, FONT } from '../engine';
import { GOLD } from './props';

// Shared pieces for the episode's shots: where a hand is, the power's glow, a rule card, and a beat helper.

/** The world point of a character's right (or left) hand tip, for glows and props. */
export const handR = (pose: Pose) => toWorld(pose, joints(pose).armR.end);
export const handL = (pose: Pose) => toWorld(pose, joints(pose).armL.end);

/** The power's glow on a fingertip: a warm bloom, a hot core, flickering a little. */
export const FingerGlow: React.FC<{ x: number; y: number; k: number; t: number; r?: number }> = ({ x, y, k, t, r = 60 }) =>
  k <= 0.01 ? null : (
    <g>
      <Glow x={x} y={y} r={r * 3.2 * (0.9 + 0.1 * Math.sin(t / 3))} kind="warm" o={0.9 * k} />
      <circle cx={x} cy={y} r={r * 0.35} fill="#FFF3C4" opacity={0.95 * k} />
      <circle cx={x} cy={y} r={r * 0.7} fill="#FFD36A" opacity={0.35 * k} />
    </g>
  );

/** The i-th sentence end in the shot (frames), or a fallback when the narration has fewer. */
export const beat = (stops: number[], i: number, fallback: number) => (stops[i] !== undefined ? stops[i] : fallback);

/** A rule card on the blueprint: RULE n in gold, the rule drawn on below, an icon on the right. */
export const RuleCard: React.FC<{ t: number; n: number; text: [string, string]; children?: React.ReactNode }> = ({ t, n, text, children }) => (
  <g>
    <Schematic t={t} id={`rule${n}`} />
    <SchLabel x={220} y={330} t={t - 2} text={`RULE ${n}`} size={64} color={GOLD.mid} anchor="start" />
    <DrawOn d="M 220 360 L 760 360" t={t - 6} dur={10} color={GOLD.mid} width={6} />
    <SchLabel x={220} y={500} t={t - 10} text={text[0]} size={60} anchor="start" />
    <SchLabel x={220} y={590} t={t - 22} text={text[1]} size={40} color={SCH.dim} anchor="start" />
    {children}
  </g>
);

/** A five-star rating with `n` stars filled, popping in. */
export const Stars5: React.FC<{ x: number; y: number; t: number; n: number }> = ({ x, y, t, n }) => (
  <g transform={`translate(${x} ${y}) scale(${clamp(t / 6)})`}>
    <rect x={-330} y={-70} width={660} height={140} rx={70} fill="#14111E" opacity={0.75} />
    {[0, 1, 2, 3, 4].map((i) => (
      <path
        key={i}
        transform={`translate(${-240 + i * 120} 0) scale(1.6)`}
        d="M 0 -30 L 9 -9 L 31 -9 L 13 5 L 20 27 L 0 14 L -20 27 L -13 5 L -31 -9 L -9 -9 Z"
        fill={i < n ? GOLD.mid : 'none'}
        stroke="#F6EFE3"
        strokeWidth={3}
      />
    ))}
  </g>
);

/** A big caption-like label for the end card (SUBSCRIBE), in the title face. */
export const BigWord: React.FC<{ x: number; y: number; t: number; text: string; color?: string; size?: number }> = ({ x, y, t, text, color = '#F6EFE3', size = 96 }) =>
  t < 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${Math.min(1, t / 6)})`}>
      <text textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={size} fill={color} stroke="#1A1230" strokeWidth={12} paintOrder="stroke">
        {text}
      </text>
    </g>
  );
