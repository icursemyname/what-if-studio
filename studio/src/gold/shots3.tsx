import React from 'react';
import {
  Hero, poseAt, faceAt, kf, clamp, easeOut, easeInOut, camT, shake, rnd,
  Kitchen, KitchenIsland, KITCHEN, islandTop, stand, Glow, Sparkle, Schematic, SchLabel, DrawOn, Arrow, SCH, CountUp,
  FloatLabel, Tag, Gauge,
} from '../engine';
import { CAST, EXTRAS } from './cast';
import { GOLD } from './props';
import { Spoon, Car, Necklace, Ring, Camel, Vault, PriceChart, TV } from './things';
import { Junkyard, Desert, Porch, DarkRoom } from './places';
import { handL, beat } from './act';
import type { GoldShot } from './shots';

// Why gold is special (3:15) and the cost (4:26): the science on the blueprint, then what Arlo's gold does to the world.

const ARLO = CAST.arlo;
const THEO = CAST.theo;

// ================================ WHY GOLD IS SPECIAL ================================

// ---------- W1: the blueprint: all the gold ever mined, one 22-metre cube beside a 7-storey building ----------
export const W1: GoldShot = ({ t, len, cue }) => {
  const build = Math.min(Math.max(20, cue('_line2')), len - 60); // the cube builds on "Take all the gold…"
  const fill = clamp((t - build - 40) / 50);
  const boom = Math.min(cue('drone_hit'), len - 10);
  const sh = shake(t, boom, 14, 6);
  return (
    <g transform={`translate(${sh.x} ${sh.y}) ${camT(kf(t, [[0, 960], [len, 920]]), 540, kf(t, [[0, 1.0], [len, 1.06]]))}`}>
      <Schematic t={t} id="w1" />
      <SchLabel x={140} y={120} t={t - 2} text={t < build ? 'WHY IS GOLD WORTH SO MUCH?' : 'ALL GOLD EVER MINED'} size={44} color={SCH.dim} anchor="start" />
      {t < build ? (
        <g>
          <rect x={760} y={480} width={400} height={160} rx={14} fill={GOLD.mid} stroke={GOLD.dark} strokeWidth={8} />
          <path d="M 790 500 L 1130 500" stroke={GOLD.light} strokeWidth={8} strokeLinecap="round" />
          <SchLabel x={960} y={780} t={t - 20} text="BECAUSE THERE'S SO LITTLE OF IT" size={48} color={SCH.live} />
        </g>
      ) : (
        <g>
          <DrawOn d="M 1180 900 L 1180 300 L 1540 300 L 1540 900" t={t - build - 4} dur={18} color={SCH.dim} width={4} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <DrawOn key={i} d={`M 1180 ${386 + i * 86} L 1540 ${386 + i * 86}`} t={t - build - 10 - i * 2} dur={8} color={SCH.dim} width={3} />
          ))}
          <DrawOn d="M 420 900 L 420 330 L 990 330 L 990 900 Z M 420 330 L 540 250 L 1110 250 L 990 330 M 1110 250 L 1110 820 L 990 900" t={t - build - 14} dur={24} color={GOLD.light} width={6} />
          <rect x={420} y={900 - 570 * fill} width={570} height={570 * fill} fill={GOLD.mid} opacity={0.9} />
          <polygon points={`990,${900 - 570 * fill} 1110,${820 - 570 * fill} 1110,820 990,900`} fill={GOLD.dark} opacity={0.9 * Math.min(1, fill * 3)} />
          <path d="M 300 900 L 1700 900" stroke={SCH.line} strokeWidth={4} />
          <CountUp x={705} y={640} t={t - build - 40} to={222600} dur={50} size={72} color="#2A1A08" suffix=" t" />
          <SchLabel x={705} y={980} t={t - build - 60} text="22 m" size={48} color={GOLD.light} />
          <Hero look={ARLO} pose={poseAt(t, [{ f: 0, p: { x: 1060, y: 880, scale: 0.13 } }])} rimId="rimR" shadow={0} />
          <SchLabel x={1360} y={980} t={t - build - 24} text="7 FLOORS" size={36} color={SCH.dim} />
        </g>
      )}
    </g>
  );
};

// ---------- W2: two dead stars collide and scatter gold; the gold in Mom's ring is older than the Earth ----------
export const W2: GoldShot = ({ t, len, stops }) => {
  const hit = beat(stops, 1, len * 0.45) - 20;
  const p = clamp(t / Math.max(1, hit));
  const ang = p * p * 14;
  const rad = 280 * (1 - p);
  const after = t - hit;
  const ring = beat(stops, 2, len * 0.8) - 10;
  return (
    <g>
      <Schematic t={t} id="w2" />
      <SchLabel x={140} y={120} t={t - 2} text="NEUTRON STAR COLLISION" size={44} color={SCH.dim} anchor="start" />
      {after < 0 ? (
        [0, 1].map((i) => {
          const a = ang + i * Math.PI;
          return (
            <g key={i}>
              <Glow x={960 + Math.cos(a) * rad} y={540 + Math.sin(a) * rad * 0.6} r={160} kind="cool" o={0.9} />
              <circle cx={960 + Math.cos(a) * rad} cy={540 + Math.sin(a) * rad * 0.6} r={34} fill="#DCEBFF" />
            </g>
          );
        })
      ) : (
        <g opacity={t > ring ? clamp(1 - (t - ring) / 10) : 1}>
          <Glow x={960} y={540} r={300 + after * 6} kind="warm" o={clamp(1 - after / 60) + 0.2} />
          {Array.from({ length: 40 }).map((_, i) => {
            const a = rnd(3, i) * Math.PI * 2;
            const d = after * (6 + rnd(4, i) * 10);
            return <circle key={i} cx={960 + Math.cos(a) * d} cy={540 + Math.sin(a) * d * 0.7} r={5 + rnd(5, i) * 8} fill={GOLD.mid} opacity={clamp(1 - after / 120) + 0.3} />;
          })}
          <SchLabel x={960} y={900} t={after - 10} text="Au" size={80} color={GOLD.mid} />
        </g>
      )}
      {t > ring ? (
        <g>
          <circle cx={760} cy={560} r={220} fill="#2B5A8A" opacity={clamp((t - ring) / 8)} />
          <path d="M 640 470 Q 700 430 760 470 Q 820 520 880 480" stroke="#4E8A5A" strokeWidth={30} fill="none" opacity={clamp((t - ring) / 8)} />
          <Ring x={1300} y={560} r={110} />
          <Sparkle x={1360} y={460} t={t - ring - 6} s={1.5} />
          <SchLabel x={760} y={860} t={t - ring - 4} text="EARTH: 4.5 bn years" size={40} color={SCH.dim} />
          <SchLabel x={1300} y={860} t={t - ring - 12} text="THE GOLD: OLDER" size={40} color={GOLD.mid} />
        </g>
      ) : null}
    </g>
  );
};

// ---------- W3: the Large Hadron Collider: lead atoms fired past each other, 29 trillionths of a gram of gold ----------
export const W3: GoldShot = ({ t, len, stops, cue }) => {
  const made = beat(stops, 3, len * 0.55); // "…and made gold."
  const flash = Math.min(cue('sparkle'), len - 10);
  const life = made + 16;
  return (
    <g>
      <Schematic t={t} id="w3" />
      <SchLabel x={140} y={120} t={t - 2} text={t < beat(stops, 1, 40) ? 'ALCHEMY' : 'LARGE HADRON COLLIDER'} size={44} color={SCH.dim} anchor="start" />
      <DrawOn d="M 960 300 A 480 250 0 1 1 959 300" t={t - 6} dur={24} color="#7FB6FF" width={14} />
      {[0, 1].map((i) => {
        const a = t / 6 + i * Math.PI;
        return (
          <g key={i} opacity={t < made ? 1 : 0}>
            <Glow x={960 + Math.cos(a) * 480} y={550 + Math.sin(a) * 250} r={90} kind="cool" o={0.9} />
            <circle cx={960 + Math.cos(a) * 480} cy={550 + Math.sin(a) * 250} r={18} fill="#DCEBFF" />
            <SchLabel x={960 + Math.cos(a) * 480} y={550 + Math.sin(a) * 250 - 40} t={t - 20} text="Pb" size={30} />
          </g>
        );
      })}
      {t >= made ? (
        <g>
          <Glow x={960} y={550} r={180} o={t < life ? 1 : 0.4} />
          <circle cx={960} cy={550} r={t < life ? 8 : 3} fill={GOLD.light} />
          <Arrow x0={990} y0={530} x1={1250} y1={420} t={t - made - 4} />
          <Tag x={1430} y={400} t={t - made - 8} text="Au 29 pg" w={330} />
          <Tag x={1430} y={540} t={t - made - 16} text="< 0.000001 s" w={420} />
          <Sparkle x={960} y={550} t={t - flash} s={1.2} />
        </g>
      ) : null}
      <Tag x={420} y={900} t={t - beat(stops, 5, len - 30)} text="REAL" mark="check" w={220} />
    </g>
  );
};

// ---------- W4: the kitchen, morning: Arlo touches his spoon before breakfast, smug ----------
const W4_STAND = stand(KITCHEN, 0.45, 0.4);
const W4_BOWL = islandTop(0.58, 0.45);
export const W4: GoldShot = ({ t, len }) => {
  const touch = 16;
  const pose = poseAt(t, [
    { f: 0, p: { x: W4_STAND.x, y: W4_STAND.y, scale: W4_STAND.scale, yaw: 0.45, look: 0.8 } },
    { f: touch - 6, p: { armR: { a: 66, b: -10 }, handR: 'point' } },
    { f: touch + 10, p: { armR: { a: 20, b: -10 }, look: 1 } },
  ]);
  const g = clamp((t - touch) / 8);
  return (
    <g transform={camT(kf(t, [[0, 1000], [len, 1030]]), 600, kf(t, [[0, 1.7], [len, 1.9]]))}>
      <Kitchen t={t + 400} id="w4" />
      <Hero look={ARLO} pose={{ ...pose, ...faceAt(t, [[0, 'tired'], [touch + 12, 'smug']]) }} rimId="rimR" shadow={0} />
      <KitchenIsland />
      <ellipse cx={W4_BOWL.x} cy={W4_BOWL.y - 16} rx={70} ry={26} fill="#E9E3EE" />
      <path d={`M ${W4_BOWL.x - 70} ${W4_BOWL.y - 16} Q ${W4_BOWL.x} ${W4_BOWL.y + 40} ${W4_BOWL.x + 70} ${W4_BOWL.y - 16}`} fill="#C9C2D4" />
      <Spoon x={W4_BOWL.x + 30} y={W4_BOWL.y - 20} len={100} rot={30} gold={g} />
      {g > 0 && g < 1 ? <Glow x={W4_BOWL.x + 30} y={W4_BOWL.y - 60} r={160} o={0.8} /> : null}
      <Sparkle x={W4_BOWL.x + 60} y={W4_BOWL.y - 110} t={t - touch - 2} s={0.9} />
    </g>
  );
};

// ================================ THE COST ================================

// ---------- C1: the junkyard at sunset: Arlo touches an old car; it turns gold and sinks into the mud ----------
export const C1: GoldShot = ({ t, len, cue }) => {
  const crunch = Math.min(Math.max(40, cue('car_crunch')), len - 40);
  const touch = crunch - 10;
  const g = clamp((t - touch) / 8);
  const sink = easeOut(clamp((t - crunch) / 20)) * 0.6;
  const pose = poseAt(t, [
    { f: 0, p: { x: 420, y: 650, scale: 0.8, yaw: 0.5, look: 0.6 } },
    { f: touch - 10, p: { x: 560, armR: { a: 80, b: -6 }, handR: 'point' } },
    { f: touch + 4, p: { armR: { a: 84, b: 0 } } },
    { f: crunch + 4, p: { x: 470, armR: { a: 30, b: -20 }, yaw: 0.3, squash: 0.05 }, ease: easeOut },
    { f: crunch + 14, p: { squash: 0 } },
  ]);
  const face = faceAt(t, [[0, 'neutral'], [crunch + 2, 'shock'], [crunch + 50, 'smug']]);
  const sh = shake(t, crunch, 14, 12);
  return (
    <g transform={`translate(${sh.x} ${sh.y}) ${camT(kf(t, [[0, 900], [len, 960]]), 600, kf(t, [[0, 1.15], [len, 1.0]]))}`}>
      <Junkyard t={t} id="c1" />
      <Car x={1000} y={860} s={1.3} gold={g} sink={sink} />
      {g > 0 && g < 1 ? <Glow x={1000} y={760} r={500} o={0.8 * (1 - g)} /> : null}
      <Hero look={ARLO} pose={{ ...pose, ...face }} rimId="rimR" shadow={0.5} />
      <ellipse cx={1000} cy={870} rx={360} ry={30} fill="#3A2A20" opacity={sink > 0 ? 1 : 0} />
      <FloatLabel x={1100} y={500} t={t - crunch - 40} text="= A SMALL TRUCK" color={GOLD.light} size={56} />
      <Sparkle x={1250} y={640} t={t - crunch - 10} s={1.4} />
    </g>
  );
};

// ---------- C2: the TV news: mystery gold floods local markets; the price of gold starts to fall ----------
export const C2: GoldShot = ({ t, len, cue }) => {
  const drop = Math.min(cue('price_drop'), len - 40);
  const p = clamp((t - Math.min(drop, len * 0.55)) / 50);
  return (
    <g transform={camT(960, 520, kf(t, [[0, 1.0], [len, 1.18]]))}>
      <DarkRoom id="c2" />
      <Glow x={960} y={460} r={900} kind="cool" o={0.5} />
      <TV x={960} y={460} w={1200}>
        <rect x={0} y={0} width={1200} height={672} fill="#1B2440" />
        <circle cx={230} cy={240} r={80} fill="#3E4E78" />
        <rect x={140} y={330} width={180} height={200} rx={40} fill="#3E4E78" />
        <g transform="translate(780 290) scale(0.7)">
          <PriceChart x={0} y={0} p={p} />
        </g>
        <rect x={0} y={540} width={1200} height={90} fill="#C8343F" />
        <text x={40} y={600} fontFamily="Bricolage Grotesque" fontWeight={800} fontSize={52} fill="#FFFFFF">
          MYSTERY GOLD FLOODS LOCAL MARKETS
        </text>
        <rect x={1040} y={30} width={130} height={50} rx={8} fill="#C8343F" opacity={0.5 + 0.5 * Math.sin(t / 4)} />
        <text x={1105} y={66} textAnchor="middle" fontFamily="monospace" fontSize={30} fill="#fff">
          LIVE
        </text>
      </TV>
    </g>
  );
};

// ---------- C3: Cairo, 1324: Mansa Musa's caravan crosses the dunes; the price of gold falls there for years ----------
export const C3: GoldShot = ({ t, len, stops }) => {
  const fall = beat(stops, 2, len * 0.65);
  return (
    <g transform={camT(kf(t, [[0, 900], [len, 1020]]), 520, 1.0)}>
      <Desert t={t} id="c3" />
      {[0, 1, 2, 3, 4].map((i) => (
        <Camel key={i} x={-200 + i * 330 + t * 2.2} y={780 + (i % 2) * 20} s={0.85} phase={t * 0.25 + i} />
      ))}
      <Tag x={330} y={110} t={t - 4} text="CAIRO, 1324" w={420} />
      <Tag x={1500} y={110} t={t - fall} text={`25 → ${t > fall + 20 ? 22 : 25} dirhams`} w={560} />
      <SchLabel x={1500} y={210} t={t - fall - 4} text="1 mithqal of gold" size={34} color="#F6EFE3" />
    </g>
  );
};

// ---------- C4: the blueprint: gold is worth a lot because there isn't much of it. And now there's you. ----------
export const C4: GoldShot = ({ t, len, stops }) => {
  const you = beat(stops, 0, len * 0.5) + 6;
  const bars = t < you ? 3 : 3 + Math.floor((t - you) / 3);
  return (
    <g>
      <Schematic t={t} id="c4" />
      {Array.from({ length: Math.min(bars, 60) }).map((_, i) => (
        <rect key={i} x={360 + (i % 12) * 100} y={760 - Math.floor(i / 12) * 50} width={88} height={40} rx={6} fill={GOLD.mid} stroke={GOLD.dark} strokeWidth={4} />
      ))}
      <Gauge x={1160} y={260} w={500} p={t < you ? 0.85 : clamp(0.85 - (t - you) / 120, 0.15, 1)} label="VALUE" danger={2} />
      <SchLabel x={360} y={300} t={t - 4} text="RARE = VALUABLE" size={52} color={GOLD.mid} anchor="start" />
      {t > you ? <Hero look={ARLO} pose={poseAt(t, [{ f: 0, p: { x: 1600, y: 760, scale: 0.6, yaw: -0.4, look: -0.8, expr: 'oops' } }])} rimId="rimR" shadow={0} /> : null}
    </g>
  );
};

// ---------- C5: the porch at dusk: Theo, quiet, holds his grandma's necklace; Arlo beside him, guilty ----------
export const C5: GoldShot = ({ t, len, cue }) => {
  const speak = Math.min(cue('_line2'), len - 60);
  const sitY = 700;
  const theo = poseAt(t, [
    { f: 0, p: { x: 1080, y: sitY, scale: 0.9, yaw: -0.2, look: -0.4, legL: { a: 80, b: -80 }, legR: { a: 80, b: -80 }, armL: { a: 30, b: -60 }, armR: { a: 30, b: -60 }, headTilt: 10 } },
    { f: speak, p: { armL: { a: 70, b: -50 }, look: -0.8, headTilt: 4 } },
  ]);
  const arlo = poseAt(t, [
    { f: 0, p: { x: 820, y: sitY, scale: 0.9, yaw: 0.2, look: 0.5, legL: { a: 80, b: -80 }, legR: { a: 80, b: -80 }, armL: { a: 20, b: -70 }, armR: { a: 20, b: -70 } } },
    { f: len - 60, p: { look: -0.3, headTilt: -14 } },
  ]);
  const hand = handL(theo);
  return (
    <g transform={camT(kf(t, [[0, 960], [len, 980]]), 600, kf(t, [[0, 1.2], [len, 1.45]]))}>
      <Porch t={t} id="c5" />
      <Hero look={ARLO} pose={{ ...arlo, ...faceAt(t, [[0, 'neutral'], [speak + 30, 'worried']]) }} rimId="rimR" shadow={0.4} />
      <Hero look={THEO} pose={{ ...theo, ...faceAt(t, [[0, 'worried']]) }} rimId="rimL" shadow={0.4} />
      {t >= speak ? <Necklace x={hand.x} y={hand.y} s={0.9} swing={Math.sin(t / 10) * 6} /> : null}
    </g>
  );
};

// ---------- C6: montage: a grandma counting her rings, the price chart sliding, a vault door closing ----------
export const C6: GoldShot = ({ t, len, cue }) => {
  const third = len / 3;
  const close = Math.min(cue('vault_door'), len - 10);
  if (t < third) {
    const g = poseAt(t, [{ f: 0, p: { x: 960, y: 700, scale: 1.2, yaw: 0, look: 0.2, armL: { a: 40, b: -70 }, armR: { a: 40, b: -70 }, headTilt: 6 } }]);
    return (
      <g transform={camT(960, 560, kf(t, [[0, 1.05], [third, 1.15]]))}>
        <rect x={-400} y={-400} width={2720} height={1900} fill="#3E2E46" />
        <Glow x={960} y={360} r={600} o={0.6} />
        <Hero look={EXTRAS.grandma} pose={{ ...g, ...faceAt(t, [[0, 'worried']]) }} rimId="rimR" shadow={0} />
        <rect x={500} y={820} width={920} height={300} fill="#6B4B42" />
        {[0, 1, 2, 3].map((i) => (
          <Ring key={i} x={760 + i * 130} y={860} r={26} />
        ))}
      </g>
    );
  }
  if (t < third * 2) {
    return (
      <g>
        <Schematic t={t} id="c6" />
        <PriceChart x={960} y={560} w={1100} h={520} p={clamp((t - third) / third)} label="GOLD PRICE" />
      </g>
    );
  }
  const tt = t - third * 2;
  return (
    <g transform={camT(960, 540, kf(tt, [[0, 1.0], [third, 1.1]]))}>
      <rect x={-400} y={-400} width={2720} height={1900} fill="#1A1C24" />
      <Vault x={960} y={540} r={330} close={easeInOut(clamp((t - Math.max(third * 2, close - 30)) / 30))} spin={t * 2} />
    </g>
  );
};
