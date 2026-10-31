import React from 'react';
import {
  Hero, Pose, basePose, poseAt, faceAt, kf, clamp, easeOut, easeIn, settle, camT, joints, toWorld,
  Bedroom, BEDROOM, Desk, Tabletop, AlarmClock, Glow, Sparkle, FocusRings, Foreground, LightVeil, TitleCard,
  NightSky, Stars, Moon, Skyline, ShotProps,
} from '../engine';
import { CAST } from './cast';
import { Paperclip, Rabbit, NightStreet, GOLD } from './props';

// "What If You Could Turn ONE Thing Into Gold Every Day?" Each shot is a pure function of its own clock t (frames).
// `cue(name)` is when a sound effect starts, in frames from the shot's start (the picture answers it); `stops` are the
// sentence ends of the narration over the shot, same units, for acting beats.

export type GoldShotProps = ShotProps & { cue: (name: string) => number; stops: number[] };
export type GoldShot = React.FC<GoldShotProps>;

const ARLO = CAST.arlo;
const NINA = CAST.nina;

/** The world point of a character's right hand tip, for glows and props. */
const handR = (pose: Pose) => toWorld(pose, joints(pose).armR.end);

/** The power's glow on a fingertip: a warm bloom, a hot core, flickering a little. */
const FingerGlow: React.FC<{ x: number; y: number; k: number; t: number; r?: number }> = ({ x, y, k, t, r = 60 }) =>
  k <= 0.01 ? null : (
    <g>
      <Glow x={x} y={y} r={r * 3.2 * (0.9 + 0.1 * Math.sin(t / 3))} kind="warm" o={0.9 * k} />
      <circle cx={x} cy={y} r={r * 0.35} fill="#FFF3C4" opacity={0.95 * k} />
      <circle cx={x} cy={y} r={r * 0.7} fill="#FFD36A" opacity={0.35 * k} />
    </g>
  );

// ---------- G0: insert, the bedside clock flips from 23:59 to 00:00 ----------
export const G0: GoldShot = ({ t, len, cue }) => {
  const flip = cue('clock_flip') + 2;
  return (
    <g transform={camT(960, 560, kf(t, [[0, 2.2], [len, 2.45]]))}>
      <rect x={-200} y={-200} width={2400} height={1500} fill="#14121E" />
      <rect x={600} y={590} width={720} height={300} fill="#2A2232" />
      <rect x={600} y={590} width={720} height={6} fill="#4A3A48" />
      <AlarmClock x={960} y={600} s={1.1} text={t < flip ? '23:59' : '00:00'} on={t >= flip && t < flip + 2 ? 0.4 : 1} />
      <Glow x={960} y={540} r={300} kind="red" o={0.35} />
    </g>
  );
};

// ---------- G1: wide, the bedroom at midnight: Arlo at his desk, his fingertips start to glow ----------
const G1_DESK = { x0: 1060, x1: 1500, y: 700 };
const G1_BASE: Partial<Pose> = { x: 1290, y: 642, scale: 0.74, yaw: -0.35, look: -0.4, armL: { a: 30, b: -60 }, armR: { a: 40, b: -70 } };
export const G1: GoldShot = ({ t, len, stops }) => {
  const lift = stops[0] ?? 60; // "Not a lot." lifts the hand to look at it
  const pose = poseAt(t, [
    { f: 0, p: { ...G1_BASE, headTilt: 6, expr: 'tired' } },
    { f: 24, p: { headTilt: 0, look: -0.2 } },
    { f: lift, p: { armR: { a: 118, b: 30 }, look: 0.7, yaw: -0.15, headTilt: -6 }, ease: easeOut },
    { f: lift + 10, p: { armR: { a: 112, b: 34 } } },
  ]);
  const face = faceAt(t, [[0, 'tired'], [lift - 6, 'shock'], [lift + 40, 'happy']]);
  const hand = handR(pose);
  const glow = clamp(t / 30);
  const cam = { x: kf(t, [[0, 960], [len, 1150]]), y: kf(t, [[0, 540], [len, 560]]), z: kf(t, [[0, 1], [len, 1.45]]) };
  return (
    <g transform={camT(cam.x, cam.y, cam.z)}>
      <Bedroom t={t + 30} id="g1" clock="00:00" lamp={0.85} />
      <Hero look={ARLO} pose={{ ...pose, ...face, handR: 'point', glint: glow * 0.6, glintColor: '#FFD36A' }} rimId="rimL" shadow={0} />
      <Desk x0={G1_DESK.x0} x1={G1_DESK.x1} y={G1_DESK.y} laptop={false} lamp vp={BEDROOM.vp} />
      <Paperclip x={1180} y={696} w={34} rot={-6} />
      <FingerGlow x={hand.x} y={hand.y} k={glow} t={t} r={22} />
      <Foreground blur={10}>
        <path d="M -40 1100 Q 20 860 200 820 Q 160 960 220 1100 Z" fill="#0D0B14" />
      </Foreground>
    </g>
  );
};

// ---------- G2: macro from above, the desk: the glowing finger comes down and pokes the paperclip ----------
const CLIP = { x: 880, y: 600 };
export const G2: GoldShot = ({ t, len, cue }) => {
  const poke = Math.max(14, cue('gold_chime'));
  // the hand (a pointing mitten at HS times the rig's size): in from the top right, its fingertip touches the clip's
  // top wire at `poke`, then recoils a little
  const HS = 7;
  const tipOff = { x: -34 * Math.sin((40 * Math.PI) / 180) * HS, y: 34 * Math.cos((40 * Math.PI) / 180) * HS };
  const touch = { x: CLIP.x + 40, y: CLIP.y - 40 };
  const hx = kf(t, [[0, 1700], [poke - 2, touch.x - tipOff.x + 8], [poke, touch.x - tipOff.x], [poke + 8, touch.x - tipOff.x + 40]]);
  const hy = kf(t, [[0, -300], [poke - 2, touch.y - tipOff.y - 12], [poke, touch.y - tipOff.y], [poke + 8, touch.y - tipOff.y - 50]]);
  const g = clamp((t - poke) / 8, 0, 1);
  const glow = t < poke ? 1 : clamp(1 - (t - poke) / 10);
  const ring = t - poke;
  const tip = { x: hx + tipOff.x, y: hy + tipOff.y };
  return (
    <g transform={camT(960, kf(t, [[0, 520], [len, 545]]), kf(t, [[0, 1.0], [len, 1.08]]))}>
      <Tabletop edge={1400} />
      <LightVeil id="g2veil" lights={[[900, 560, 700]]} o={0.5} />
      <Glow x={900} y={560} r={600} o={0.25} />
      <Paperclip x={CLIP.x} y={CLIP.y} w={520} rot={-8} gold={g} />
      {ring > 0 && ring < 16 ? <circle cx={CLIP.x} cy={CLIP.y} r={60 + ring * 22} fill="none" stroke={GOLD.light} strokeWidth={10 * (1 - ring / 16)} opacity={1 - ring / 16} /> : null}
      <Glow x={CLIP.x} y={CLIP.y} r={420} o={0.6 * clamp(1 - Math.abs(ring - 4) / 12)} />
      <Sparkle x={CLIP.x - 190} y={CLIP.y - 70} t={ring - 2} s={1.6} />
      <Sparkle x={CLIP.x + 210} y={CLIP.y + 50} t={ring - 5} s={1.2} />
      <Sparkle x={CLIP.x + 40} y={CLIP.y - 120} t={ring - 8} s={1.0} />
      {/* Arlo's arm: the wine sleeve off frame, the black arm with its light outline, the pointing hand */}
      <g filter="url(#rimR)">
        <path d={`M ${hx + 30} ${hy - 30} Q ${hx + 160} ${hy - 220} ${hx + 380} -420`} stroke={ARLO.line} strokeWidth={70} fill="none" strokeLinecap="round" />
        <path d={`M ${hx + 30} ${hy - 30} Q ${hx + 160} ${hy - 220} ${hx + 380} -420`} stroke={ARLO.limb} strokeWidth={58} fill="none" strokeLinecap="round" />
        <path d={`M ${hx + 230} ${hy - 330} Q ${hx + 300} ${hy - 400} ${hx + 380} -420`} stroke={ARLO.jacket} strokeWidth={150} fill="none" strokeLinecap="round" />
        <g transform={`translate(${hx} ${hy}) rotate(40) scale(${HS})`}>
          <rect x={-4} y={10} width={8} height={24} rx={4} fill={ARLO.hand} stroke={ARLO.line} strokeWidth={2.4} />
          <path d="M -11 -2 Q -14 14 -6 18 L 7 18 Q 14 14 11 -2 Z" fill={ARLO.hand} stroke={ARLO.line} strokeWidth={2.6} strokeLinejoin="round" />
          <ellipse cx={-10} cy={6} rx={4.5} ry={7} fill={ARLO.hand} stroke={ARLO.line} strokeWidth={2.4} />
        </g>
      </g>
      <FingerGlow x={tip.x} y={tip.y} k={glow} t={t} r={70} />
    </g>
  );
};

// ---------- G3: macro, the gold paperclip: heavy, cold, real ----------
export const G3: GoldShot = ({ t, len, stops }) => {
  const beats = stops.length ? stops : [len * 0.4];
  // a small settle at each sentence end ("Heavy." "Cold." "Real."), a gleam running along the wire now and then
  const bump = beats.reduce((a, s) => a + settle(t - s, 4, 1.2, 6), 0);
  const shine = ((t % 50) / 50);
  return (
    <g transform={camT(kf(t, [[0, 940], [len, 900]]), 560, kf(t, [[0, 1.25], [len, 1.6]]))}>
      <Tabletop edge={1400} />
      <LightVeil id="g3veil" lights={[[900, 560, 620]]} o={0.55} />
      <Glow x={900} y={560} r={560} o={0.35} />
      <g transform={`translate(0 ${bump})`}>
        <Paperclip x={900} y={560} w={700} rot={kf(t, [[0, -8], [len, -2]])} gold={1} shine={shine} />
      </g>
      {[0, 1, 2, 3].map((i) => (
        <Sparkle key={i} x={[640, 1180, 1030, 760][i]} y={[470, 640, 470, 660][i]} t={(t + i * 13) % 52} s={1.1} />
      ))}
    </g>
  );
};

// ---------- G4: low angle on the door: it creaks open, Nina in the hall light, hugging her rabbit ----------
export const G4: GoldShot = ({ t, len, cue }) => {
  const open = easeOut(clamp(t / 22));
  const speak = Math.max(20, cue('_line'));
  const pose = poseAt(t, [
    { f: 0, p: { x: 960, y: 700, scale: 0.78, yaw: 0, look: 0.3, armL: { a: 40, b: -110 }, armR: { a: 40, b: -110 }, headTilt: 0 } },
    { f: speak, p: { headTilt: 10, look: 0.5 } },
    { f: speak + 30, p: { headTilt: 6 } },
  ]);
  const face = faceAt(t, [[0, 'neutral'], [speak + 4, 'worried']]);
  const chest = toWorld(pose, { x: 0, y: -70 });
  return (
    <g transform={camT(960, kf(t, [[0, 600], [len, 580]]), kf(t, [[0, 1.05], [len, 1.18]]))}>
      <rect x={-400} y={-400} width={2720} height={1900} fill="#2B2D48" />
      <rect x={-400} y={850} width={2720} height={700} fill="#231C2A" />
      {/* the doorway onto the lit hall, the light spilling across the floor */}
      <defs>
        <linearGradient id="g4hall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE9A8" />
          <stop offset="100%" stopColor="#F2B65E" />
        </linearGradient>
      </defs>
      <rect x={700} y={170} width={520} height={690} fill="#3A2A2A" />
      <rect x={720} y={190} width={480} height={670} fill="url(#g4hall)" opacity={0.25 + 0.75 * open} />
      <polygon points={`720,860 1200,860 ${1200 + 500 * open},1300 ${720 - 500 * open},1300`} fill="#F2C27A" opacity={0.28 * open} />
      <Glow x={960} y={460} r={700} o={0.6 * open} />
      <Hero look={NINA} pose={{ ...pose, ...face }} rimId="rimR" shadow={0.5} />
      <Rabbit x={chest.x} y={chest.y + 20} s={0.95} rot={-6} />
      {/* the door swinging open on its right hinge */}
      <polygon points={`1200,190 ${1200 - 480 * (1 - open)},${190 + 20 * open} ${1200 - 480 * (1 - open)},${860 - 20 * open} 1200,860`} fill="#5A3E36" stroke="#3A2620" strokeWidth={6} />
      <Foreground blur={16}>
        <ellipse cx={180} cy={980} rx={330} ry={300} fill="#0B0910" />
      </Foreground>
    </g>
  );
};

// ---------- G5: medium close, Arlo looks at his hand: the glow is gone. One touch a day. ----------
export const G5: GoldShot = ({ t, len, stops }) => {
  const [s1 = 60, s2 = 110, s3 = 150, s4 = 200] = stops;
  const pose = poseAt(t, [
    { f: 0, p: { x: 900, y: 920, scale: 1.75, yaw: 0.25, look: 0.8, armR: { a: 128, b: 38 }, armL: { a: 12, b: -10 }, headTilt: -4 } },
    { f: s1, p: { armR: { a: 122, b: 44 }, headTilt: 4 } }, // the glow is gone
    { f: s2 + 10, p: { armR: { a: 60, b: 30 }, look: 0, yaw: 0.05, headTilt: -2 } }, // "One touch." lowers it
    { f: s4 + 6, p: { look: -0.6, yaw: -0.2, headTilt: -8 }, ease: easeOut }, // "tomorrow at midnight" glances at the clock
  ]);
  const face = faceAt(t, [[0, 'shock'], [s1 + 4, 'worried'], [s3 + 4, 'neutral'], [s4 + 10, 'smug']]);
  const hand = handR(pose);
  const glow = clamp(1 - t / 26);
  const glint = clamp((t - s4 - 10) / 12) * 0.7;
  return (
    <g transform={camT(kf(t, [[0, 960], [len, 930]]), 520, kf(t, [[0, 1.0], [len, 1.1]]))}>
      <g filter="url(#blur6)">
        <Bedroom t={t + 300} id="g5" clock="00:01" lamp={0.85} />
      </g>
      <rect x={-400} y={-400} width={2720} height={1900} fill="#0E0C1E" opacity={0.25} />
      <Glow x={1300} y={420} r={600} kind="warm" o={0.35} />
      <Hero look={ARLO} pose={{ ...pose, ...face, handR: 'open', glint, glintColor: '#FFD36A' }} rimId="rimR" shadow={0} />
      <FingerGlow x={hand.x} y={hand.y} k={glow} t={t} r={40} />
      {glow > 0 && glow < 0.9 ? <FocusRings x={hand.x} y={hand.y} t={t - 4} r0={50} color={GOLD.light} /> : null}
    </g>
  );
};

// ---------- G6: the house at night, pulling back off Arlo's lit window: the title ----------
export const G6: GoldShot = ({ t, len, cue }) => {
  const boom = Math.min(cue('title_boom'), len - 20);
  // the title builds while the narrator asks the question, and its gold word swells on the boom
  const title = Math.min(cue('_line') + 18, boom);
  const pull = easeOut(clamp(t / Math.max(1, Math.min(len, boom + 30))));
  const z = 2.4 - 1.35 * pull;
  const cy = 600 - 40 * pull;
  const glow = 0.5 + 0.5 * Math.sin(t / 9);
  return (
    <g>
      <g transform={camT(kf(pull, [[0, 1065], [1, 960]], (x) => x), cy, z)}>
        <NightSky id="g6sky" horizonY={760} />
        <Stars seed={11} x0={-200} y0={-100} w={2300} h={600} t={t} n={70} />
        <Moon x={1560} y={190} r={52} />
        <Skyline y={760} seed={4} color="#1C1730" h={170} />
        <NightStreet t={t} ourX={960} glow={glow} />
        <Glow x={1065} y={570} r={260} kind="warm" o={0.45 + 0.35 * glow} />
      </g>
      {t >= title ? (
        <g transform={`translate(0 ${kf(t - title, [[0, -30], [10, 0]])})`}>
          <TitleCard t={t - title} lines={['WHAT IF YOU COULD', 'TURN ONE THING INTO GOLD?']} accent="GOLD" accentT={boom - title} y={230} size={120} />
        </g>
      ) : null}
    </g>
  );
};
