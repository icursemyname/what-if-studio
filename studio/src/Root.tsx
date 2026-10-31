import React from 'react';
import { Composition } from 'remotion';
import './engine/fonts';
import { STUDIO } from './studio.config';
import { EPISODES } from './episodes';
import { CastSheet } from './CastSheet';
import { Animatic, Timeline } from './animatic/Animatic';
import { Motion } from './animatic/Motion';
import { CastGold } from './gold/CastGold';
import { GoldPilot, GoldFilm, pilotLength, filmLength } from './gold/Pilot';
import { GoldContact } from './gold/Contact';
import oneTouchGold from './animatic/one-touch-gold.json';

// Animatics of the long episodes (storyboard frames over the voice): Animatic-<slug>. Built by `npm run animatic`.
const ANIMATICS: Timeline[] = [oneTouchGold as Timeline];

// Every episode gets two compositions: <Id> (the film) and <Id>Board (one frame per shot, at its key frame, for the
// storyboard). Cast renders the cast sheet.
//   npx remotion studio src/index.ts --port 3430

export const Root: React.FC = () => {
  const common = { width: STUDIO.width, height: STUDIO.height, fps: STUDIO.fps };
  return (
    <>
      {EPISODES.map((e) => (
        <React.Fragment key={e.id}>
          <Composition id={e.id} component={e.Main} durationInFrames={Math.max(1, e.total)} {...common} />
          <Composition id={`${e.id}Board`} component={e.Board} durationInFrames={Math.max(1, e.shotCount)} {...common} />
        </React.Fragment>
      ))}
      {ANIMATICS.map((t) => (
        <Composition
          key={t.slug}
          id={`Animatic-${t.slug}`}
          component={Animatic}
          durationInFrames={Math.ceil(t.total * t.fps)}
          defaultProps={{ timeline: t }}
          {...common}
        />
      ))}
      {ANIMATICS.map((t) => (
        <Composition
          key={`motion-${t.slug}`}
          id={`Episode-${t.slug}`}
          component={Motion}
          durationInFrames={Math.ceil(t.total * t.fps)}
          defaultProps={{ timeline: t }}
          {...common}
        />
      ))}
      <Composition id="Cast" component={CastSheet} durationInFrames={1} {...common} />
      <Composition id="GoldCast" component={CastGold} durationInFrames={1} {...common} />
      <Composition id="Gold-cold-open" component={GoldPilot} durationInFrames={pilotLength(oneTouchGold as Timeline)} defaultProps={{ timeline: oneTouchGold as Timeline }} {...common} />
      <Composition id="Gold-episode" component={GoldFilm} durationInFrames={filmLength(oneTouchGold as Timeline)} defaultProps={{ timeline: oneTouchGold as Timeline }} {...common} />
      <Composition id="Gold-contact" component={GoldContact} durationInFrames={1} defaultProps={{ timeline: oneTouchGold as Timeline, at: 0.6, from: 0, count: 30 }} {...common} />
    </>
  );
};
