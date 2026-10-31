import React from 'react';
import {
  Hero, poseAt, faceAt, walkPose, kf, clamp, easeOut, easeIn, settle, camT, toWorld, shake, LEG_LEN,
  Bedroom, BedDuvet, bedSit, BEDROOM, Kitchen, KitchenIsland, KITCHEN, islandTop, stand, Tabletop, Mug, Glow, Sparkle,
  LightVeil, Schematic, SchLabel, DrawOn, Arrow, SCH, FloatLabel, DizzyStars, AlarmClock,
} from '../engine';
import { CAST, EXTRAS } from './cast';
import { Paperclip, GOLD } from './props';
import { Pillow, Glove, Spoon, Bike, Coin, GoldPhone, Bill, ShopScale, Cash, CakeSlice, Flake } from './things';
import { Street, LivingRoom, livingStand, sofaSeat } from './places';
import { handL, beat, RuleCard, Stars5 } from './act';
import type { GoldShot } from './shots';

// The rules (0:44) and the fun part (1:34): learning the power the hard way, then using it.

const ARLO = CAST.arlo;
const NINA = CAST.nina;
const THEO = CAST.theo;
const MOM = CAST.mom;

// ================================ THE RULES ================================

// ---------- R1: the bedroom, a week of tries: the calendar fills with crosses, Arlo paces ----------
export const R1: GoldShot = ({ t, len }) => {
  const x = kf(t, [[0, 700], [len * 0.5, 1260], [len, 760]]);
  const dir: 1 | -1 = t < len * 0.5 ? 1 : -1;
  const ws = stand(BEDROOM, 0.6, 0.5);
  const pose = walkPose(x, t * 0.42, ws.y + LEG_LEN * ws.scale, ws.scale, { expr: 'worried', armR: { a: 150, b: 120 } }, dir);
  return (
    <g transform={camT(kf(t, [[0, 960], [len, 980]]), 540, kf(t, [[0, 1.0], [len, 1.08]]))}>
      <Bedroom t={t + 600} id="r1" clock="12:00" crossed={Math.min(7, Math.floor(t / (len / 8)))} />
      <Hero look={ARLO} pose={pose} rimId="rimL" shadow={0.6} />
    </g>
  );
};

// ---------- R2: rule one on the blueprint: the first thing you touch after midnight ----------
export const R2: GoldShot = ({ t }) => (
  <RuleCard t={t} n={1} text={['THE FIRST THING YOU TOUCH', 'after midnight. Not the thing you want.']}>
    <AlarmClock x={1560} y={460} s={1.0} text="00:00" />
    <Arrow x0={1560} y0={500} x1={1560} y1={720} t={t - 30} />
    <SchLabel x={1560} y={800} t={t - 38} text="1st TOUCH" size={48} color={GOLD.mid} />
  </RuleCard>
);

// ---------- R3: night two, in bed: asleep hugging the pillow, it turns gold, he wakes with a stiff neck ----------
export const R3: GoldShot = ({ t, len, cue, stops }) => {
  const turn = beat(stops, 0, 40) + 8; // after "waiting."
  const thud = Math.min(cue('gold_thud'), len - 30);
  const sit = bedSit(0.2);
  const pose = poseAt(t, [
    { f: 0, p: { x: sit.x, y: sit.y, scale: sit.scale, tilt: -30, headTilt: -24, armL: { a: 70, b: -100 }, armR: { a: 70, b: -100 }, yaw: 0.3 } },
    { f: thud, p: { tilt: -30, headTilt: -24 } },
    { f: thud + 6, p: { tilt: -6, headTilt: 20, armR: { a: 150, b: 120 } }, ease: easeOut }, // jolts up, hand to the neck
    { f: len, p: { headTilt: 26 } },
  ]);
  const face = faceAt(t, [[0, 'tired'], [thud + 4, 'shock'], [thud + 30, 'tired']]);
  const asleep = t < thud + 4;
  const g = clamp((t - turn) / 10);
  const pil = toWorld(pose, { x: 40, y: -60 });
  const sh = shake(t, thud, 10, 10);
  return (
    <g transform={`translate(${sh.x} ${sh.y}) ${camT(kf(t, [[0, sit.x + 120], [len, sit.x + 80]]), sit.y - 40, kf(t, [[0, 2.0], [len, 2.25]]))}`}>
      <Bedroom t={t + 900} id="r3" duvet={false} clock="03:12" />
      <Hero look={ARLO} pose={{ ...pose, ...face, blink: asleep ? 1 : face.blink }} rimId="rimR" shadow={0} />
      <BedDuvet knees={0.6} />
      <Pillow x={pil.x + 30} y={pil.y + 40} w={150} rot={-18} gold={g} />
      {g > 0 && g < 1 ? <Glow x={pil.x + 30} y={pil.y + 10} r={260} o={0.7 * (1 - g)} /> : null}
      <Sparkle x={pil.x + 90} y={pil.y - 30} t={t - turn - 4} s={0.9} />
      {asleep && t < turn ? <SchLabel x={sit.x + 150} y={sit.y - 220} t={(t % 40) - 2} text="z" size={64} color="#C9D4FF" /> : null}
    </g>
  );
};

// ---------- R4: rule two: gloves don't help ----------
export const R4: GoldShot = ({ t }) => (
  <RuleCard t={t} n={2} text={["GLOVES DON'T HELP", 'The glove is the first thing you touch.']}>
    <Glove x={1450} y={560} s={1.1} rot={-10} gold={clamp((t - 30) / 10)} />
    <Sparkle x={1530} y={470} t={t - 38} s={1.3} />
  </RuleCard>
);

// ---------- R5: insert, the floor: a gold glove clanks down; very expensive gloves ----------
export const R5: GoldShot = ({ t, len, cue }) => {
  const land = Math.max(6, cue('gold_clank'));
  const y = kf(t, [[0, -200], [land, 560]], easeIn);
  const sh = shake(t, land, 8, 8);
  return (
    <g transform={`translate(${sh.x} ${sh.y}) ${camT(960, 560, kf(t, [[0, 1.0], [len, 1.12]]))}`}>
      <Tabletop edge={1400} wood="#4A3A44" grain="#3E3038" lip="#5A4650" />
      <LightVeil id="r5veil" lights={[[960, 560, 620]]} o={0.55} />
      <Glow x={960} y={560} r={520} o={0.3} />
      <Glove x={960} y={y + settle(t - land, 10, 1.6, 5)} s={1.5} rot={kf(t, [[0, -40], [land, -8]])} gold={1} />
      <Sparkle x={1150} y={480} t={t - land - 4} s={1.4} />
      <Sparkle x={780} y={620} t={t - land - 10} s={1.0} />
      <FloatLabel x={1250} y={420} t={t - land - 12} text="$$$" color={GOLD.mid} size={90} />
    </g>
  );
};

// ---------- R6: rule three: forever ----------
export const R6: GoldShot = ({ t }) => (
  <RuleCard t={t} n={3} text={["IT'S FOREVER", "You can't turn anything back."]}>
    <Paperclip x={1450} y={540} w={260} gold={1} rot={-10} />
    <Arrow x0={1300} y0={700} x1={1600} y1={700} t={t - 26} color={SCH.dim} />
    <SchLabel x={1450} y={790} t={t - 34} text="UNDO" size={48} color={SCH.dim} />
    <DrawOn d="M 1340 740 L 1560 830 M 1560 740 L 1340 830" t={t - 44} dur={8} color="#E5484D" width={12} />
  </RuleCard>
);

// ---------- R7: 11:59, Arlo sits on the edge of the bed, very, very still, and chooses ----------
export const R7: GoldShot = ({ t, len }) => {
  const sit = bedSit(0.32, 0.4);
  const pose = poseAt(t, [
    { f: 0, p: { x: sit.x, y: sit.y, scale: sit.scale, yaw: 0.15, armL: { a: 20, b: -70 }, armR: { a: 20, b: -70 }, legL: { a: 80, b: -80 }, legR: { a: 80, b: -80 }, look: 0.3 } },
    { f: len * 0.7, p: { look: 0.9, headTilt: -6 } },
  ]);
  const face = faceAt(t, [[0, 'neutral'], [Math.round(len * 0.72), 'smug']]);
  return (
    <g transform={camT(kf(t, [[0, 960], [len, sit.x + 60]]), kf(t, [[0, 540], [len, sit.y - 30]]), kf(t, [[0, 1.0], [len, 1.9]]))}>
      <Bedroom t={t + 1200} id="r7" clock="23:59" />
      <Hero look={ARLO} pose={{ ...pose, ...face }} rimId="rimR" shadow={0.4} />
    </g>
  );
};

// ================================ THE FUN PART ================================

// ---------- F1: the kitchen at dusk: Mom stirs her coffee with a gold spoon, a week before she notices ----------
const F1_STAND = stand(KITCHEN, 0.45, 0.4);
const F1_MUG = islandTop(0.58, 0.45);
export const F1: GoldShot = ({ t, len, stops }) => {
  const notice = beat(stops, 0, len - 40) + 6;
  const pose = poseAt(t, [
    { f: 0, p: { x: F1_STAND.x, y: F1_STAND.y, scale: F1_STAND.scale, yaw: 0.45, look: 0.8, armR: { a: 50, b: -40 } } },
    { f: notice, p: { headTilt: 10, look: 1 } },
  ]);
  const face = faceAt(t, [[0, 'tired'], [notice + 6, 'shock']]);
  const stir = Math.sin(t / 4) * 12;
  return (
    <g transform={camT(kf(t, [[0, 990], [len, 1040]]), 600, kf(t, [[0, 1.6], [len, 1.85]]))}>
      <Kitchen t={t + 40} id="f1" />
      <Hero look={MOM} pose={{ ...pose, ...face }} rimId="rimR" shadow={0} />
      <KitchenIsland />
      <Mug x={F1_MUG.x} y={F1_MUG.y} rot={0} f={t} />
      <Spoon x={F1_MUG.x + stir * 0.6} y={F1_MUG.y - 70} len={110} rot={14 + stir} gold={1} />
      {t > notice + 6 ? <Sparkle x={F1_MUG.x + 20} y={F1_MUG.y - 170} t={t - notice - 6} s={1.2} /> : null}
    </g>
  );
};

// ---------- F2: the street at sunset: Arlo touches his old bike, hops on, the gold frame folds, he hits the road ----------
export const F2: GoldShot = ({ t, len, cue }) => {
  const crash = Math.min(Math.max(30, cue('bike_crash')), len - 12);
  const touch = Math.max(8, crash - 40);
  const g = clamp((t - touch) / 8);
  const fold = clamp((t - crash) / 8);
  const pose = poseAt(t, [
    { f: 0, p: { x: 1040, y: 650, scale: 0.85, yaw: -0.4, look: -0.5, armR: { a: 60, b: -20 } } },
    { f: touch, p: { armR: { a: 75, b: 0 }, handR: 'point' } },
    { f: crash - 14, p: { x: 900, y: 610, legL: { a: 70, b: -60 }, legR: { a: 50, b: -40 }, armR: { a: 70, b: 0 }, armL: { a: 70, b: 0 }, yaw: 0.6 } }, // on the saddle
    { f: crash, p: { y: 620 } },
    { f: crash + 8, p: { x: 1000, y: 720, spin: 80, tilt: 20, legL: { a: 30, b: 0 }, legR: { a: -20, b: 0 } }, ease: easeOut },
    { f: crash + 14, p: { spin: 90, y: 740 } },
  ]);
  const face = faceAt(t, [[0, 'happy'], [crash - 2, 'shock'], [crash + 14, 'dizzy']]);
  const sh = shake(t, crash, 10, 14);
  return (
    <g transform={`translate(${sh.x} ${sh.y}) ${camT(kf(t, [[0, 960], [len, 940]]), 640, kf(t, [[0, 1.25], [len, 1.4]]))}`}>
      <Street t={t} mode="dusk" id="f2" />
      <Bike x={860} y={830} s={1.1} fold={fold} gold={g} />
      {g > 0 && g < 1 ? <Glow x={860} y={720} r={360} o={0.7 * (1 - g)} /> : null}
      <Hero look={ARLO} pose={{ ...pose, ...face }} rimId="rimR" shadow={0.5} />
      {t > crash + 14 ? <DizzyStars x={pose.x + 130} y={pose.y - 40} t={t - crash} /> : null}
    </g>
  );
};

// ---------- F3: the blueprint: gold is 2.5x heavier than steel, and soft enough to bite ----------
export const F3: GoldShot = ({ t, len, cue, stops }) => {
  const soft = beat(stops, 2, len * 0.55);
  const bite = cue('cookie_crunch');
  const biteAt = bite < len ? bite : len - 20;
  return (
    <g>
      <Schematic t={t} id="f3" />
      <g opacity={t < soft ? 1 : clamp(1 - (t - soft) / 8)}>
        <rect x={420} y={540} width={160} height={160} fill="#8A929E" opacity={clamp(t / 8)} />
        <SchLabel x={500} y={770} t={t - 6} text="STEEL" size={44} />
        <rect x={1180} y={420} width={280} height={280} fill={GOLD.mid} opacity={clamp((t - 14) / 8)} />
        <SchLabel x={1320} y={770} t={t - 18} text="GOLD" size={44} color={GOLD.mid} />
        <Arrow x0={640} y0={600} x1={1120} y1={560} t={t - 26} />
        <SchLabel x={880} y={500} t={t - 34} text="x 2.5 heavier" size={56} color={SCH.live} />
      </g>
      {t >= soft ? (
        <g>
          <Coin x={960} y={540} r={220} bite={clamp((t - biteAt) / 4)} />
          <SchLabel x={960} y={880} t={t - soft - 4} text="SO SOFT YOU CAN DENT IT" size={52} color={SCH.live} />
        </g>
      ) : null}
    </g>
  );
};

// ---------- F4: the street: the bent bike, Arlo on the ground: zero stars ----------
export const F4: GoldShot = ({ t, len }) => {
  const pose = poseAt(t, [{ f: 0, p: { x: 1120, y: 740, scale: 0.85, yaw: -0.3, look: -0.8, legL: { a: 85, b: -10 }, legR: { a: 70, b: 0 }, armL: { a: 40, b: -20 }, armR: { a: 40, b: -20 }, tilt: -8 } }]);
  return (
    <g transform={camT(980, 650, kf(t, [[0, 1.3], [len, 1.4]]))}>
      <Street t={t + 200} mode="dusk" id="f4" />
      <Bike x={840} y={830} s={1.1} fold={1} gold={1} />
      <Hero look={ARLO} pose={{ ...pose, ...faceAt(t, [[0, 'tired']]) }} rimId="rimR" shadow={0.5} />
      <Stars5 x={960} y={300} t={t - 6} n={0} />
    </g>
  );
};

// ---------- F5: Theo's living room: "Touch my phone." Arlo does; the phone is a gold lump ----------
const F5_T = livingStand(0.62, 0.55);
const F5_A = livingStand(0.38, 0.55);
export const F5: GoldShot = ({ t, len, cue, stops }) => {
  const chime = Math.min(cue('gold_chime'), len - 30);
  const touch = chime - 2;
  const theoPose = poseAt(t, [
    { f: 0, p: { x: F5_T.x, y: F5_T.y, scale: F5_T.scale, yaw: -0.4, look: -0.7, armL: { a: 70, b: -40 } } },
    { f: touch, p: { armL: { a: 75, b: -40 } } },
    { f: chime + 20, p: { armL: { a: 60, b: -70 }, look: -0.2, headTilt: 10 } }, // pulls it in to look
    { f: chime + 40, p: { armL: { a: 64, b: -64 } } },
    { f: chime + 46, p: { armL: { a: 58, b: -72 } } },
  ]);
  const arloPose = poseAt(t, [
    { f: 0, p: { x: F5_A.x, y: F5_A.y, scale: F5_A.scale, yaw: 0.4, look: 0.7 } },
    { f: touch - 8, p: { armR: { a: 80, b: -6 }, handR: 'point' } },
    { f: touch, p: { armR: { a: 84, b: 0 }, handR: 'point' } },
    { f: touch + 12, p: { armR: { a: 20, b: -10 } } },
  ]);
  const ph = handL(theoPose);
  const g = clamp((t - chime) / 6);
  const tf = faceAt(t, [[0, 'happy'], [chime + 6, 'shock']]);
  const af = faceAt(t, [[0, 'neutral'], [chime + 10, 'oops']]);
  return (
    <g transform={camT(960, 560, kf(t, [[0, 1.05], [len, 1.25]]))}>
      <LivingRoom t={t} id="f5" mode="dusk" />
      <Hero look={ARLO} pose={{ ...arloPose, ...af }} rimId="rimR" shadow={0.5} />
      <Hero look={THEO} pose={{ ...theoPose, ...tf }} rimId="rimL" shadow={0.5} />
      <GoldPhone x={ph.x} y={ph.y - 10} w={40} rot={-10} gold={g} />
      {g > 0 && g < 1 ? <Glow x={ph.x} y={ph.y} r={200} o={0.8} /> : null}
      <Sparkle x={ph.x + 30} y={ph.y - 40} t={t - chime - 3} s={0.8} />
    </g>
  );
};

// ---------- F6: insert, the gold phone: glass, battery, chips, all gold: a phone-shaped paperweight ----------
export const F6: GoldShot = ({ t, len, stops }) => {
  const s1 = beat(stops, 0, 30);
  const s2 = beat(stops, 1, 70);
  return (
    <g>
      <Schematic t={t} id="f6" />
      <g transform={`translate(960 560) rotate(${kf(t, [[0, -8], [len, 6]])}) translate(-960 -560)`}>
        <GoldPhone x={960} y={560} w={260} gold={1} />
      </g>
      <Glow x={960} y={560} r={500} o={0.3} />
      <SchLabel x={560} y={320} t={t - 10} text="GLASS → Au" size={44} color={GOLD.mid} anchor="end" />
      <SchLabel x={560} y={560} t={t - 18} text="BATTERY → Au" size={44} color={GOLD.mid} anchor="end" />
      <SchLabel x={560} y={800} t={t - 26} text="CHIPS → Au" size={44} color={GOLD.mid} anchor="end" />
      {t > s1 ? <DrawOn d="M 1180 360 L 1700 360 L 1700 520 L 1180 520 Z" t={t - s1} dur={10} color={SCH.dim} width={4} /> : null}
      <SchLabel x={1440} y={460} t={t - s1 - 6} text="NO SCREEN" size={44} />
      <SchLabel x={1440} y={760} t={t - s2} text="PAPERWEIGHT" size={60} color={SCH.live} />
    </g>
  );
};

// ---------- F7: Theo, close: "My mom's gonna kill me." ----------
export const F7: GoldShot = ({ t, len }) => {
  const pose = poseAt(t, [
    { f: 0, p: { x: 960, y: 920, scale: 1.7, yaw: -0.1, look: -0.2, armL: { a: 60, b: -70 } } },
    { f: 10, p: { armR: { a: 160, b: 130 }, headTilt: 8 } }, // hand to the forehead
  ]);
  const ph = handL(pose);
  return (
    <g transform={camT(960, 520, kf(t, [[0, 1.0], [len, 1.08]]))}>
      <g filter="url(#blur6)">
        <LivingRoom t={t + 300} id="f7" mode="dusk" />
      </g>
      <Hero look={THEO} pose={{ ...pose, ...faceAt(t, [[0, 'worried']]) }} rimId="rimL" shadow={0} />
      <GoldPhone x={ph.x} y={ph.y - 20} w={90} rot={-10} gold={1} />
    </g>
  );
};

// ---------- F8: the gold shop downtown: WE BUY GOLD, the scale, the cash ----------
export const F8: GoldShot = ({ t, len, stops }) => {
  const q = beat(stops, 2, len * 0.6);
  const clerk = poseAt(t, [
    { f: 0, p: { x: 1240, y: 600, scale: 0.95, yaw: -0.3, look: -0.6, armL: { a: 30, b: -40 } } },
    { f: q, p: { headTilt: 10, expr: 'smug' } },
    { f: q + 20, p: { headTilt: 0 } },
  ]);
  const arlo = poseAt(t, [{ f: 0, p: { x: 640, y: 620, scale: 0.95, yaw: 0.35, look: 0.6, armR: { a: 70, b: -20 } } }]);
  return (
    <g transform={camT(960, 560, kf(t, [[0, 1.0], [len, 1.1]]))}>
      <rect x={-400} y={-400} width={2720} height={1900} fill="#3A2E3E" />
      <rect x={300} y={140} width={1320} height={240} rx={20} fill="#1A1420" />
      <text x={960} y={300} textAnchor="middle" fontFamily="Bricolage Grotesque" fontWeight={800} fontSize={120} fill={GOLD.light} style={{ filter: `drop-shadow(0 0 18px ${GOLD.mid})` }} opacity={0.85 + 0.15 * Math.sin(t / 3)}>
        WE BUY GOLD
      </text>
      <Hero look={EXTRAS.clerk} pose={{ ...clerk, ...faceAt(t, [[0, 'neutral'], [q, 'smug']]) }} rimId="rimL" shadow={0} />
      <Hero look={ARLO} pose={{ ...arlo, ...faceAt(t, [[0, 'neutral']]) }} rimId="rimR" shadow={0} />
      <rect x={-400} y={720} width={2720} height={60} fill="#6B4B42" />
      <rect x={-400} y={780} width={2720} height={600} fill="#4A3430" />
      <ShopScale x={960} y={700} p={clamp(t / 20)} />
      <Paperclip x={960} y={650} w={90} gold={1} />
      <Cash x={1260} y={700} n={Math.min(6, Math.floor(clamp((t - 30) / 40) * 6))} />
      <LightVeil id="f8veil" lights={[[960, 260, 700], [960, 700, 400]]} o={0.35} />
    </g>
  );
};

// ---------- F9: the bills on the table: rent PAID, the hospital bill PAID ----------
export const F9: GoldShot = ({ t, len, stops }) => {
  const s0 = beat(stops, 0, 30);
  const s1 = beat(stops, 1, 70);
  return (
    <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.06]]))}>
      <Tabletop edge={1400} />
      <Glow x={960} y={500} r={700} o={0.25} />
      <Bill x={640} y={560} rot={-6} title="RENT" amount="$1,450" stamp={t - s0 + 8} />
      <Bill x={1260} y={560} rot={5} title="HOSPITAL" amount="$3,820" stamp={t - s1 + 8} />
      <SchLabel x={640} y={150} t={t - 4} text="DAY 8" size={44} color={GOLD.mid} />
      <SchLabel x={1260} y={150} t={t - s0 - 4} text="DAY 10" size={44} color={GOLD.mid} />
    </g>
  );
};

// ---------- F10: day 12, 8 p.m.: Mom asleep on the sofa, smiling; Nina pads in ----------
export const F10: GoldShot = ({ t, len, cue }) => {
  const seat = sofaSeat(0.6);
  const ninaIn = Math.min(cue('_line'), len - 40);
  const mom = poseAt(t, [{ f: 0, p: { x: seat.x - 80, y: seat.y - 70, scale: 0.85, spin: -84, yaw: 0, armL: { a: 20, b: -40 }, armR: { a: 20, b: -40 }, legL: { a: 10, b: 0 }, legR: { a: 10, b: 0 } } }]);
  const ns = livingStand(0.3, 0.5);
  const nx = kf(t, [[ninaIn, ns.x - 300], [ninaIn + 40, ns.x]]);
  const nina = t < ninaIn + 40 ? walkPose(nx, t * 0.6, ns.y + LEG_LEN * ns.scale * 0.68, ns.scale * 0.68, { expr: 'happy' }, 1) : poseAt(t, [{ f: 0, p: { x: ns.x, y: ns.y + LEG_LEN * ns.scale * 0.32, scale: ns.scale * 0.68, yaw: 0.3, look: 0.8, expr: 'happy' } }]);
  return (
    <g transform={camT(kf(t, [[0, 960], [len, 900]]), 560, kf(t, [[0, 1.0], [len, 1.12]]))}>
      <LivingRoom t={t + 500} id="f10" mode="night" />
      <Hero look={MOM} pose={{ ...mom, expr: 'happy', blink: 1 }} rimId="rimR" shadow={0} />
      <SchLabel x={seat.x + 80} y={seat.y - 260} t={(t % 50) - 2} text="z" size={56} color="#C9D4FF" />
      <SchLabel x={260} y={140} t={t - 4} text="DAY 12 · 8 PM" size={44} color={GOLD.mid} />
      {t >= ninaIn ? <Hero look={NINA} pose={nina} rimId="rimL" shadow={0.5} /> : null}
    </g>
  );
};

// ---------- F11: Nina, close, with a slice of cake topped with gold leaf: "Can I eat gold?" ... "Gold poop." ----------
export const F11: GoldShot = ({ t, len, cue, stops }) => {
  const giggle = Math.min(cue('kid_giggle'), len - 10);
  const goes = beat(stops, 3, len * 0.5); // "It goes in…"
  const pose = poseAt(t, [
    { f: 0, p: { x: 760, y: 960, scale: 1.55, yaw: 0.3, look: 0.8, armR: { a: 60, b: -30 } } },
    { f: goes, p: { armR: { a: 130, b: 60 }, look: 0.3 } }, // a forkful up to the mouth
    { f: goes + 20, p: { armR: { a: 40, b: -20 } } },
    { f: giggle, p: { headTilt: -12, squash: 0.04 } },
    { f: giggle + 8, p: { headTilt: 10, squash: -0.03 } },
    { f: giggle + 16, p: { headTilt: -6, squash: 0 } },
  ]);
  const face = faceAt(t, [[0, 'happy'], [Math.round(len * 0.2), 'neutral'], [goes + 4, 'smug'], [giggle - 4, 'happy']]);
  return (
    <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.1]]))}>
      <g filter="url(#blur10)">
        <Kitchen t={t} id="f11" />
      </g>
      <Glow x={960} y={300} r={900} o={0.35} />
      <Hero look={NINA} pose={{ ...pose, ...face }} rimId="rimR" shadow={0} />
      <CakeSlice x={1340} y={900} s={1.6} />
      {[0, 1, 2].map((i) => (
        <Flake key={i} x={1300 + i * 60} y={540 + ((t * 2 + i * 70) % 260)} s={1.3} rot={t * 3 + i * 40} />
      ))}
      <Sparkle x={1360} y={600} t={(t % 40) - 2} s={1.1} />
    </g>
  );
};

// ---------- F12: Arlo, deadpan: "Gold poop." ----------
export const F12: GoldShot = ({ t, len }) => (
  <g transform={camT(960, 520, kf(t, [[0, 1.0], [len, 1.05]]))}>
    <g filter="url(#blur10)">
      <Kitchen t={t + 80} id="f12" />
    </g>
    <Hero look={ARLO} pose={{ ...poseAt(t, [{ f: 0, p: { x: 960, y: 920, scale: 1.7, yaw: -0.05, look: 0 } }]), ...faceAt(t, [[0, 'tired']]) }} rimId="rimR" shadow={0} />
  </g>
);
