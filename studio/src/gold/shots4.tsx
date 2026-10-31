import React from 'react';
import {
  Hero, Pose, poseAt, faceAt, walkPose, kf, clamp, easeOut, easeIn, easeInOut, camT, shake, LEG_LEN,
  Stairwell, Banister, hipGround, Tabletop, Glow, Sparkle, SchLabel, AlarmClock, Foreground, LightVeil, Tag,
} from '../engine';
import { CAST } from './cast';
import { GOLD } from './props';
import { Car, Folder, Photo, Backpack, TV } from './things';
import { Street, LivingRoom, livingStand, FrontDoor, DarkRoom } from './places';
import { handR, handL, FingerGlow, beat, BigWord } from './act';
import type { GoldShot } from './shots';

// Someone notices (5:52), day 30 (6:35) and the ending (8:32).

const ARLO = CAST.arlo;
const NINA = CAST.nina;
const THEO = CAST.theo;
const MOM = CAST.mom;
const SUIT = CAST.suit;

/** Arlo's right hand turned gold (fingertips and all): drawn over the rig's hand. */
const GoldHand: React.FC<{ pose: Pose; side?: 'R' | 'L'; k?: number }> = ({ pose, side = 'R', k = 1 }) => {
  const h = side === 'R' ? handR(pose) : handL(pose);
  return k <= 0 ? null : (
    <g opacity={k}>
      <circle cx={h.x} cy={h.y + 6 * pose.scale} r={17 * pose.scale} fill={GOLD.mid} stroke={GOLD.dark} strokeWidth={4 * pose.scale} />
      <circle cx={h.x - 5 * pose.scale} cy={h.y} r={5 * pose.scale} fill={GOLD.light} />
    </g>
  );
};

// ================================ SOMEONE NOTICES ================================

// ---------- N1: from above, night: a grey car rolls up across the street and stops, headlights on ----------
export const N1: GoldShot = ({ t, len }) => {
  const x = kf(t, [[0, 2300], [70, 1300]], easeOut);
  return (
    <g transform={camT(kf(t, [[0, 1000], [len, 1150]]), 640, kf(t, [[0, 1.05], [len, 1.25]]))}>
      <Street t={t} mode="night" id="n1" />
      <Car x={x} y={930} s={0.95} body="#7A808C" lights={1} flip />
      <SchLabel x={240} y={130} t={t - 6} text="DAY 26" size={44} color={GOLD.mid} />
    </g>
  );
};

// ---------- N2: the hall, the front door: three polite knocks ----------
export const N2: GoldShot = ({ t, len, cue }) => {
  const k = cue('door_knock');
  const knocks = [0, 9, 18].map((d) => shake(t, k + d, 5, 5));
  const sx = knocks.reduce((a, s) => a + s.x, 0);
  return (
    <g transform={`translate(${sx} 0) ${camT(960, 520, kf(t, [[0, 1.0], [len, 1.2]]))}`}>
      <FrontDoor t={t} id="n2" open={0} />
      <SchLabel x={240} y={130} t={t - 6} text="DAY 27" size={44} color={GOLD.mid} />
    </g>
  );
};

// ---------- N3: the door open: the man in the grey suit with his folder, Mom worried at the side ----------
export const N3: GoldShot = ({ t, len }) => {
  const suit = poseAt(t, [
    { f: 0, p: { x: 960, y: 560, scale: 1.05, yaw: 0, look: 0, armL: { a: 30, b: -100 } } },
    { f: len * 0.5, p: { headTilt: 4, armR: { a: 40, b: -30 } } },
  ]);
  const mom = poseAt(t, [{ f: 0, p: { x: 1560, y: 620, scale: 1.0, yaw: -0.5, look: -0.8, armL: { a: 20, b: -100 }, armR: { a: 20, b: -100 } } }]);
  const folder = handL(suit);
  return (
    <g transform={camT(kf(t, [[0, 1060], [len, 1000]]), 540, kf(t, [[0, 1.0], [len, 1.1]]))}>
      <FrontDoor t={t} id="n3" open={1} />
      <Hero look={SUIT} pose={{ ...suit, ...faceAt(t, [[0, 'smug']]) }} rimId="rimL" shadow={0.4} />
      <rect x={folder.x - 50} y={folder.y - 70} width={100} height={130} fill="#C9AB78" stroke="#8A7048" strokeWidth={4} />
      <Hero look={MOM} pose={{ ...mom, ...faceAt(t, [[0, 'worried']]) }} rimId="rimR" shadow={0.4} />
      <Foreground blur={16}>
        <ellipse cx={120} cy={900} rx={360} ry={360} fill="#0B0910" />
      </Foreground>
    </g>
  );
};

// ---------- N4: Mom, close: "And if he says no?" ----------
export const N4: GoldShot = ({ t, len }) => (
  <g transform={camT(960, 520, kf(t, [[0, 1.0], [len, 1.06]]))}>
    <g filter="url(#blur10)">
      <FrontDoor t={t} id="n4" open={1} />
    </g>
    <Hero look={MOM} pose={{ ...poseAt(t, [{ f: 0, p: { x: 960, y: 920, scale: 1.7, yaw: -0.25, look: -0.6, armL: { a: 30, b: -110 }, armR: { a: 30, b: -110 } } }]), ...faceAt(t, [[0, 'worried']]) }} rimId="rimR" shadow={0} />
  </g>
);

// ---------- N5: the man, close, smiling: "Then someone else will find him. Someone less polite." ----------
export const N5: GoldShot = ({ t, len }) => (
  <g transform={camT(960, 520, kf(t, [[0, 1.0], [len, 1.12]]))}>
    <g filter="url(#blur10)">
      <FrontDoor t={t} id="n5" open={1} />
    </g>
    <Glow x={960} y={220} r={500} o={0.5} />
    <Hero look={SUIT} pose={{ ...poseAt(t, [{ f: 0, p: { x: 960, y: 920, scale: 1.75, yaw: 0.1, look: 0.2, headTilt: 4 } }, { f: len, p: { headTilt: 8 } }]), ...faceAt(t, [[0, 'smug']]) }} rimId="rimL" shadow={0} />
  </g>
);

// ---------- N6: from above, the table: the folder drops and opens: a photo of the house, a photo of Nina's school ----------
export const N6: GoldShot = ({ t, len, stops }) => {
  const open = easeOut(clamp((t - 10) / 14));
  const s1 = beat(stops, 1, len * 0.5);
  return (
    <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.12]]))}>
      <Tabletop edge={1400} />
      <LightVeil id="n6veil" lights={[[960, 520, 700]]} o={0.5} />
      <g transform={`translate(0 ${kf(t, [[0, -300], [8, 0]], easeIn)})`}>
        <Folder x={1000} y={540} w={420} open={open} rot={-3}>
          <Photo x={-210} y={-10} w={330} kind="house" rot={-4} />
          {t > s1 ? <Photo x={210} y={kf(t, [[s1, 300], [s1 + 12, 0]], easeOut)} w={330} kind="school" rot={5} /> : null}
        </Folder>
      </g>
    </g>
  );
};

// ---------- N7: the man at the door, turning to go: "We'll pick you up on day thirty. Just before midnight." ----------
export const N7: GoldShot = ({ t, len }) => {
  const go = len - 50;
  const x = kf(t, [[go, 960], [len, 1500]]);
  const pose = t < go ? poseAt(t, [{ f: 0, p: { x: 960, y: 600, scale: 1.0, yaw: -0.1, look: -0.3, armL: { a: 20, b: -20 } } }]) : walkPose(x, t * 0.4, 600 + LEG_LEN, 1.0, {}, 1);
  return (
    <g transform={camT(960, 540, kf(t, [[0, 1.05], [len, 1.0]]))}>
      <FrontDoor t={t} id="n7" open={1} />
      <Hero look={SUIT} pose={{ ...pose, ...faceAt(t, [[0, 'smug']]) }} rimId="rimL" shadow={0.4} />
      <Tag x={420} y={180} t={t - 20} text="DAY 30" w={300} />
    </g>
  );
};

// ================================ DAY 30 ================================

// ---------- D1: the living room, 23:50: headlights sweep the curtains; Mom paces, Theo at the back door ----------
export const D1: GoldShot = ({ t, len, cue }) => {
  const pass = cue('cars_pass');
  const sweep = pass < len ? clamp((t - pass) / 60) : -1;
  const ms = livingStand(0.45, 0.5);
  const mx = kf((t % 160) / 160, [[0, ms.x - 160], [0.5, ms.x + 160], [1, ms.x - 160]], (x) => x);
  const dir: 1 | -1 = (t % 160) < 80 ? 1 : -1;
  const ts = livingStand(0.9, 0.4);
  const as = livingStand(0.2, 0.6);
  return (
    <g transform={camT(kf(t, [[0, 960], [len, 940]]), 560, kf(t, [[0, 1.0], [len, 1.1]]))}>
      <LivingRoom t={t} id="d1" mode="night" clock="23:50" sweep={sweep} />
      <Hero look={THEO} pose={{ ...poseAt(t, [{ f: 0, p: { x: ts.x, y: ts.y, scale: ts.scale, yaw: -0.4, look: -0.6 } }]), ...faceAt(t, [[0, 'worried']]) }} rimId="rimL" shadow={0.5} />
      <Hero look={MOM} pose={{ ...walkPose(mx, t * 0.35, ms.y + LEG_LEN * ms.scale, ms.scale, { expr: 'worried' }, dir) }} rimId="rimR" shadow={0.5} />
      <Hero look={ARLO} pose={{ ...poseAt(t, [{ f: 0, p: { x: as.x, y: as.y, scale: as.scale, yaw: 0.3, look: 0.4 } }]), ...faceAt(t, [[0, 'worried']]) }} rimId="rimR" shadow={0.5} />
      <SchLabel x={240} y={130} t={t - 6} text="DAY 30" size={44} color={GOLD.mid} />
    </g>
  );
};

// ---------- D2: Arlo, close, thinking it through: every road ends the same way ----------
export const D2: GoldShot = ({ t, len, stops }) => {
  const last = beat(stops, stops.length - 1, len - 30);
  const pose = poseAt(t, [
    { f: 0, p: { x: 960, y: 940, scale: 1.8, yaw: 0.2, look: 0.5, headTilt: -4 } },
    { f: beat(stops, 0, 30), p: { look: -0.5 } },
    { f: beat(stops, 1, 60), p: { look: 0.6 } },
    { f: beat(stops, 2, 90), p: { look: 0, headTilt: 6 } },
    { f: last, p: { look: 0, headTilt: 0, yaw: 0 } },
  ]);
  return (
    <g transform={camT(960, 520, kf(t, [[0, 1.0], [len, 1.18]]))}>
      <g filter="url(#blur10)">
        <LivingRoom t={t + 200} id="d2" mode="night" clock="23:57" />
      </g>
      <Glow x={1500} y={420} r={700} kind="red" o={0.3} />
      <Hero look={ARLO} pose={{ ...pose, ...faceAt(t, [[0, 'worried'], [last + 4, 'neutral']]) }} rimId="rimRed" shadow={0} />
    </g>
  );
};

// ---------- D3: the door: 11:58, footsteps on the porch (a light under the door); 11:59, it opens: the suit ----------
export const D3: GoldShot = ({ t, len, cue }) => {
  const creak = Math.min(cue('door_creak'), len - 20);
  const open = easeOut(clamp((t - creak) / 22));
  const steps = cue('step');
  const pose = poseAt(t, [{ f: 0, p: { x: 960, y: 560, scale: 1.05, yaw: 0, look: 0, armL: { a: 30, b: -100 } } }]);
  return (
    <g transform={camT(960, 520, kf(t, [[0, 1.15], [len, 1.0]]))}>
      <FrontDoor t={t} id="d3" open={open} />
      {t > steps ? <rect x={700} y={872} width={520} height={10} fill="#FFE7B0" opacity={0.6 + 0.4 * Math.sin(t / 2)} /> : null}
      {open > 0.3 ? (
        <g opacity={open}>
          <Hero look={SUIT} pose={{ ...pose, ...faceAt(t, [[0, 'neutral']]) }} rimId="rimL" shadow={0.4} />
        </g>
      ) : null}
      <SchLabel x={240} y={130} t={t - 2} text={t < creak - 30 ? '11:58' : '11:59'} size={56} color="#FF5A3A" />
    </g>
  );
};

// ---------- D4: midnight: the clock reads 00:00, Arlo's fingertips light up ----------
export const D4: GoldShot = ({ t, len }) => {
  const k = clamp(t / 14);
  return (
    <g transform={camT(960, 560, kf(t, [[0, 1.0], [len, 1.15]]))}>
      <rect x={-400} y={-400} width={2720} height={1900} fill="#14121E" />
      <g filter="url(#blur6)">
        <AlarmClock x={1400} y={420} s={1.2} text="00:00" />
      </g>
      <g transform="translate(860 640) rotate(-20)">
        <rect x={-60} y={0} width={120} height={600} rx={50} fill={ARLO.jacket} stroke={ARLO.line} strokeWidth={8} />
        <ellipse cx={0} cy={-30} rx={90} ry={110} fill={ARLO.hand} stroke={ARLO.line} strokeWidth={8} />
        {[-60, -20, 20, 60].map((fx, i) => (
          <rect key={i} x={fx - 16} y={-230 + Math.abs(fx) * 0.4} width={32} height={130} rx={16} fill={ARLO.hand} stroke={ARLO.line} strokeWidth={6} />
        ))}
      </g>
      {[-60, -20, 20, 60].map((fx, i) => {
        const a = (-20 * Math.PI) / 180;
        const lx = fx;
        const ly = -220 + Math.abs(fx) * 0.4;
        return <FingerGlow key={i} x={860 + lx * Math.cos(a) - ly * Math.sin(a)} y={640 + lx * Math.sin(a) + ly * Math.cos(a)} k={k} t={t + i * 7} r={30} />;
      })}
    </g>
  );
};

// ---------- D5: the stairs: Nina runs down, arms wide: "Don't go!" ----------
export const D5: GoldShot = ({ t, len }) => {
  const x = kf(t, [[0, 300], [len, 1500]], (v) => v);
  const pose = walkPose(x, t * 0.9, hipGround, 0.62, { expr: 'shock', armL: { a: 120, b: 10 }, armR: { a: 120, b: 10 }, tilt: 12 }, 1);
  return (
    <g transform={camT(kf(t, [[0, 700], [len, 1200]]), 560, 1.05)}>
      <Stairwell t={t} id="d5" />
      <Hero look={NINA} pose={pose} rimId="rimR" shadow={0} />
      <Banister />
    </g>
  );
};

// ---------- D6: slow motion: Nina mid-run toward you, the man in the doorway; two seconds ----------
export const D6: GoldShot = ({ t, len, cue }) => {
  const slow = cue('slowmo_whoosh');
  const rate = t < slow ? 0.12 : 0.04;
  const run = t * rate;
  const ns = livingStand(0.5, 0.75);
  const pose = walkPose(ns.x - 40 + run * 30, run * 6 + 1, ns.y + LEG_LEN * ns.scale * 0.68, ns.scale * 0.68, { expr: 'shock', armL: { a: 120, b: 10 }, armR: { a: 120, b: 10 } }, 1);
  const ss = livingStand(0.95, 0.15);
  return (
    <g transform={camT(kf(t, [[0, 960], [len, 1000]]), 560, kf(t, [[0, 1.05], [len, 1.3]]))}>
      <LivingRoom t={t * 0.2} id="d6" mode="night" clock="00:00" />
      <Hero look={SUIT} pose={{ ...poseAt(t, [{ f: 0, p: { x: ss.x, y: ss.y, scale: ss.scale, yaw: -0.4, look: -0.6 } }]), ...faceAt(t, [[0, 'neutral']]) }} rimId="rimL" shadow={0.4} />
      <Hero look={NINA} pose={{ ...pose, yaw: 0.2 }} rimId="rimR" shadow={0.5} />
      <rect x={-400} y={-400} width={2720} height={1900} fill="#0A1030" opacity={t > slow ? 0.25 : 0} />
      <Tag x={1600} y={150} t={t - Math.min(slow, len - 20)} text="2 s" w={200} />
    </g>
  );
};

// ---------- D7: Arlo, close, red rim light: the decision. "You." ----------
export const D7: GoldShot = ({ t, len, stops }) => {
  const realize = beat(stops, stops.length - 1, len - 40);
  const pose = poseAt(t, [
    { f: 0, p: { x: 960, y: 940, scale: 1.85, yaw: -0.2, look: -0.4, headTilt: 4 } },
    { f: realize, p: { look: 0, yaw: 0, headTilt: -2 } },
  ]);
  return (
    <g transform={camT(960, 520, kf(t, [[0, 1.0], [len, 1.25]]))}>
      <rect x={-400} y={-400} width={2720} height={1900} fill="#1E0E16" />
      <Glow x={1500} y={300} r={900} kind="red" o={0.6} />
      <Hero look={ARLO} pose={{ ...pose, ...faceAt(t, [[0, 'worried'], [realize + 6, 'cool']]) }} rimId="rimRed" shadow={0} />
    </g>
  );
};

// ---------- D8: macro: the glowing fingertips press into his own palm; gold spreads across the hand, stops at the wrist ----------
export const D8: GoldShot = ({ t, len, cue }) => {
  const press = Math.min(Math.max(20, cue('gold_chime_deep') - 2), len - 40);
  const spread = clamp((t - press) / 40);
  const fy = kf(t, [[0, 240], [press, 540], [press + 16, 200]], easeInOut);
  const glow = t < press ? 1 : clamp(1 - (t - press) / 10);
  return (
    <g transform={camT(960, 560, kf(t, [[0, 1.0], [len, 1.12]]))}>
      <rect x={-400} y={-400} width={2720} height={1900} fill="#1A1220" />
      <Glow x={960} y={560} r={700} kind="warm" o={0.35 + 0.4 * spread} />
      {/* the left hand, palm up, the gold climbing from the palm to the wrist */}
      <defs>
        <clipPath id="d8clip">
          <circle cx={1000} cy={540} r={20 + 640 * spread} />
          <rect x={300} y={700} width={1400} height={600 * clamp(spread * 1.6 - 0.6)} />
        </clipPath>
      </defs>
      {/* the left hand, palm up from the wrist (bottom), fingers spread toward the top; gold climbs it from the palm */}
      {[0, 1].map((layer) => {
        const fill = layer ? GOLD.mid : ARLO.hand;
        const line = layer ? GOLD.dark : ARLO.line;
        const body = (
          <g>
            <rect x={880} y={700} width={160} height={500} rx={70} fill={fill} stroke={line} strokeWidth={8} />
            {[-90, -30, 30, 90].map((fx, i) => (
              <rect key={i} x={960 + fx - 30} y={300 + Math.abs(fx) * 0.6} width={60} height={240} rx={30} fill={fill} stroke={line} strokeWidth={8} />
            ))}
            <rect x={1080} y={520} width={60} height={200} rx={30} fill={fill} stroke={line} strokeWidth={8} transform="rotate(-35 1110 620)" />
            <ellipse cx={960} cy={600} rx={170} ry={160} fill={fill} stroke={line} strokeWidth={8} />
          </g>
        );
        return layer ? (
          <g key={layer} clipPath="url(#d8clip)" opacity={spread > 0 ? 1 : 0}>
            {body}
          </g>
        ) : (
          <g key={layer}>{body}</g>
        );
      })}
      <rect x={860} y={1000} width={200} height={200} rx={40} fill={ARLO.jacket} stroke={ARLO.line} strokeWidth={8} />
      <ellipse cx={920} cy={560} rx={70} ry={40} fill={GOLD.light} opacity={spread * 0.6} />
      {/* the right hand coming down from above: its sleeve, and the index finger pointing into the palm */}
      <g transform={`translate(1000 ${fy})`}>
        <rect x={-34} y={-260} width={68} height={260} rx={34} fill={ARLO.hand} stroke={ARLO.line} strokeWidth={8} />
        <ellipse cx={0} cy={-300} rx={120} ry={90} fill={ARLO.hand} stroke={ARLO.line} strokeWidth={8} />
        <rect x={-130} y={-700} width={260} height={360} rx={90} fill={ARLO.jacket} stroke={ARLO.line} strokeWidth={8} />
        <path d="M -110 -390 L 110 -390" stroke={ARLO.accent} strokeWidth={10} strokeLinecap="round" />
      </g>
      <FingerGlow x={1000} y={fy} k={glow} t={t} r={60} />
      {t > press ? <circle cx={960} cy={560} r={60 + (t - press) * 18} fill="none" stroke={GOLD.light} strokeWidth={Math.max(0, 12 - (t - press) * 0.6)} opacity={clamp(1 - (t - press) / 20)} /> : null}
      <Sparkle x={1150} y={460} t={t - press - 6} s={1.6} />
      <Sparkle x={800} y={640} t={t - press - 14} s={1.2} />
    </g>
  );
};

// ---------- D9: the living room: Nina crashes into Arlo's arms, laughing; his gold hand on her back; the man watches ----------
export const D9: GoldShot = ({ t, len, cue }) => {
  const hit = Math.max(0, Math.min(cue('land'), 20));
  const as = livingStand(0.45, 0.65);
  const arlo = poseAt(t, [
    { f: 0, p: { x: as.x, y: as.y, scale: as.scale, yaw: 0.1, look: 0.2, armL: { a: 60, b: 60 }, armR: { a: 60, b: 70 } } },
    { f: hit + 4, p: { tilt: -8, squash: 0.05 } },
    { f: hit + 14, p: { tilt: -2, squash: 0, armL: { a: 50, b: 80 }, armR: { a: 55, b: 80 } } },
  ]);
  const nina = poseAt(t, [
    { f: 0, p: { x: as.x + 150, y: as.y + LEG_LEN * as.scale * 0.32, scale: as.scale * 0.68, yaw: -0.4, look: -0.5, armL: { a: 110, b: 20 }, armR: { a: 110, b: 20 } } },
    { f: hit, p: { x: as.x + 40 } },
    { f: hit + 10, p: { headTilt: -14 } },
    { f: hit + 24, p: { headTilt: 8 } },
  ]);
  const ss = livingStand(0.95, 0.15);
  const look = len - 60;
  const suit = poseAt(t, [
    { f: 0, p: { x: ss.x, y: ss.y, scale: ss.scale, yaw: -0.4, look: -0.6, armL: { a: 30, b: -100 } } },
    { f: look, p: { look: -1, headTilt: 6 } },
  ]);
  return (
    <g transform={camT(kf(t, [[0, as.x + 100], [len, as.x + 200]]), 560, kf(t, [[0, 1.45], [len, 1.2]]))}>
      <LivingRoom t={t} id="d9" mode="night" clock="00:00" />
      <Hero look={SUIT} pose={{ ...suit, ...faceAt(t, [[0, 'neutral'], [look + 10, 'worried']]) }} rimId="rimL" shadow={0.4} />
      <Hero look={NINA} pose={{ ...nina, ...faceAt(t, [[0, 'shock'], [hit + 6, 'happy']]) }} rimId="rimR" shadow={0.4} />
      <Hero look={ARLO} pose={{ ...arlo, ...faceAt(t, [[0, 'worried'], [hit + 20, 'happy']]) }} rimId="rimR" shadow={0.5} />
      <GoldHand pose={arlo} />
      <Sparkle x={handR(arlo).x + 30} y={handR(arlo).y - 40} t={(t % 60) - 4} s={0.8} />
    </g>
  );
};

// ---------- D10: the man closes his folder: "…Well. That's that." He walks out; the grey cars leave ----------
export const D10: GoldShot = ({ t, len, cue }) => {
  const leave = Math.min(cue('cars_pass'), len - 60);
  const close = easeOut(clamp((t - 10) / 12));
  const out = t > leave - 50;
  const x = kf(t, [[leave - 50, 960], [leave, 1600]]);
  const pose = out ? walkPose(x, t * 0.4, 600 + LEG_LEN, 1.0, { expr: 'neutral' }, 1) : poseAt(t, [{ f: 0, p: { x: 960, y: 600, scale: 1.0, yaw: 0.1, look: -0.4, armL: { a: 40, b: -90 }, armR: { a: 40, b: -90 } } }]);
  const folder = handL(pose);
  return (
    <g transform={camT(960, 540, kf(t, [[0, 1.1], [len, 1.0]]))}>
      <FrontDoor t={t} id="d10" open={1} />
      {t > leave ? <Glow x={kf(t, [[leave, 700], [leave + 80, 1300]])} y={400} r={300} o={0.5} /> : null}
      <Hero look={SUIT} pose={{ ...pose, ...faceAt(t, [[0, 'neutral']]) }} rimId="rimL" shadow={0.4} />
      {!out ? <rect x={folder.x - 50} y={folder.y - 70} width={100 - 60 * close} height={130} fill="#C9AB78" stroke="#8A7048" strokeWidth={4} /> : null}
    </g>
  );
};

// ================================ ENDING ================================

// ---------- E1: morning, the walk to school: Nina holds Arlo's gold hand like it's the coolest thing in the world ----------
export const E1: GoldShot = ({ t, len }) => {
  const x = kf(t, [[0, 500], [len, 1300]], (v) => v);
  const ph = t * 0.32;
  const arlo = walkPose(x, ph, 820, 0.9, { expr: 'happy', armR: { a: 30, b: 0 } }, 1);
  const nina = walkPose(x + 150, ph + 1.5, 820, 0.62, { expr: 'happy', armL: { a: 40, b: 0 } }, 1);
  return (
    <g transform={camT(x + 60, 620, kf(t, [[0, 1.3], [len, 1.4]]))}>
      <Street t={t} mode="morning" id="e1" />
      <Hero look={ARLO} pose={{ ...arlo, yaw: 0.3, look: 0.5 }} rimId="rimR" shadow={0.5} />
      <GoldHand pose={{ ...arlo, yaw: 0.3 }} />
      <Hero look={NINA} pose={{ ...nina, yaw: 0.3, look: -0.5 }} rimId="rimR" shadow={0.5} />
      <Sparkle x={handR({ ...arlo, yaw: 0.3 }).x + 20} y={handR({ ...arlo, yaw: 0.3 }).y - 30} t={(t % 45) - 2} s={0.7} />
    </g>
  );
};

// ---------- E2: macro: the little gold paperclip swinging from Nina's backpack zipper ----------
export const E2: GoldShot = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 1060], [len, 1110]]), kf(t, [[0, 640], [len, 720]]), kf(t, [[0, 1.5], [len, 2.1]]))}>
    <Street t={t + 300} mode="morning" id="e2" />
    <rect x={-400} y={-400} width={2720} height={1900} fill="#000" opacity={0.15} />
    <Backpack x={960} y={600} s={1.2} swing={Math.sin(t / 8) * 14} />
    <Sparkle x={1110} y={760} t={(t % 50) - 2} s={1.2} />
  </g>
);

// ---------- E3: Arlo to camera: "So what would YOU touch first? Tell us in the comments." ----------
export const E3: GoldShot = ({ t, len }) => {
  const pose = poseAt(t, [
    { f: 0, p: { x: 960, y: 900, scale: 1.65, yaw: 0, look: 0 } },
    { f: 12, p: { armR: { a: 95, b: -5 }, handR: 'point' }, ease: easeOut },
  ]);
  return (
    <g transform={camT(960, 520, kf(t, [[0, 1.0], [len, 1.05]]))}>
      <g filter="url(#blur10)">
        <Street t={t + 400} mode="morning" id="e3" />
      </g>
      <Hero look={ARLO} pose={{ ...pose, ...faceAt(t, [[0, 'smug']]), handR: t >= 12 ? 'point' : 'open' }} rimId="rimR" shadow={0} />
      <GoldHand pose={pose} />
      <BigWord x={1500} y={300} t={t - 30} text="YOU?" color={GOLD.light} size={120} />
      <Tag x={1500} y={880} t={t - Math.max(40, len - 70)} text="COMMENT ↓" w={420} />
    </g>
  );
};

// ---------- E4: a TV in an empty room at midnight: somewhere far away, another kid's fingertips start to glow ----------
export const E4: GoldShot = ({ t, len }) => {
  const k = clamp((t - 20) / 30);
  return (
    <g transform={camT(960, 520, kf(t, [[0, 1.25], [len, 1.0]]))}>
      <DarkRoom id="e4" />
      <Glow x={960} y={460} r={800} kind="cool" o={0.45} />
      <TV x={960} y={440} w={1000}>
        <rect x={0} y={0} width={1000} height={560} fill="#1B2440" />
        <circle cx={420} cy={220} r={70} fill="#3E4E78" />
        <rect x={340} y={300} width={160} height={200} rx={40} fill="#3E4E78" />
        <path d="M 480 330 L 560 240" stroke="#3E4E78" strokeWidth={30} strokeLinecap="round" />
        <circle cx={570} cy={228} r={18 + 10 * k} fill="#FFF3C4" opacity={k} />
        <circle cx={570} cy={228} r={90 * k} fill="#FFD36A" opacity={0.3 * k} />
        <rect x={30} y={470} width={260} height={60} rx={12} fill="#14111E" stroke="#F2C27A" strokeWidth={3} />
        <text x={160} y={512} textAnchor="middle" fontFamily="monospace" fontSize={34} fill="#F6EFE3">
          LIVE 00:00
        </text>
      </TV>
      <BigWord x={960} y={980} t={t - (len - 80)} text="PART 2 · SUBSCRIBE" color={GOLD.light} size={84} />
    </g>
  );
};
