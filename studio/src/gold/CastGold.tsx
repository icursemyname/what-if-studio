import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Hero, basePose, Pose, KitDefs, SetDefs, Bedroom, FONT } from '../engine';
import { CAST } from './cast';

// The What If Studio cast sheet: each costume front and three-quarter on the night bedroom, plus Arlo acting.
//   npx remotion still src/index.ts GoldCast out/gold-cast.png

const P = (o: Partial<Pose>): Pose => ({ ...basePose, ...o });
const NAMES = { arlo: 'ARLO', nina: 'NINA', theo: 'THEO', mom: 'MOM', suit: 'THE MAN IN THE SUIT' } as const;

export const CastGold: React.FC = () => {
  const names = Object.keys(CAST) as (keyof typeof CAST)[];
  const poses: Partial<Pose>[] = [
    { armR: { a: 95, b: -5 }, yaw: 0.35, look: 1, expr: 'smug', handR: 'point' },
    { armL: { a: 135, b: 20 }, armR: { a: 135, b: 20 }, expr: 'happy' },
    { armL: { a: 60, b: 40 }, armR: { a: 60, b: 40 }, expr: 'shock', yaw: -0.3 },
    { armR: { a: 120, b: 110 }, headTilt: 8, expr: 'worried', yaw: 0.2 },
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: '#14101C' }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <KitDefs />
        <SetDefs />
        <g filter="url(#blur10)">
          <Bedroom t={0} id="castbed" clock="23:59" />
        </g>
        <rect width={1920} height={1080} fill="#0B0816" opacity={0.3} />
        {names.map((c, i) => {
          const x = 200 + i * 380;
          const s = c === 'nina' ? 0.6 : 0.85;
          return (
            <g key={c}>
              <Hero look={CAST[c]} pose={P({ x, y: 420 + (0.85 - s) * 330, scale: s, yaw: i % 2 ? -0.35 : 0.35, look: i % 2 ? -0.5 : 0.5, expr: 'happy' })} shadow={0.6} />
              <text x={x} y={600} textAnchor="middle" fontFamily={FONT.ui} fontSize={24} fill="#F6EFE3" letterSpacing={2}>
                {NAMES[c]}
              </text>
            </g>
          );
        })}
        {poses.map((p, i) => (
          <Hero key={i} look={CAST.arlo} pose={P({ x: 330 + i * 420, y: 850, scale: 0.7, ...p })} shadow={0.6} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
