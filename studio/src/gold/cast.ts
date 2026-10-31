import type { Look } from '../engine';

// The What If Studio cast (CLAUDE.md): black stickmen with a light outline and white features, told apart by their
// clothes, and the girls also by their hair. Same rig as the skill's cast, new costumes.

const INK = '#141218'; // heads, hands, limbs
const INK_SHADE = '#0C0B10';
const OUTLINE = '#E9E3EE';
const FEATURES = '#F4EFE6';

const body = { skin: INK, skinShade: INK_SHADE, hand: INK, limb: INK, line: OUTLINE, face: FEATURES, hair: INK };

export const CAST: Record<'arlo' | 'nina' | 'theo' | 'mom' | 'suit', Look> = {
  // the hero: a wine-red hoodie with mustard drawstrings (his signature detail)
  arlo: { ...body, jacket: '#7A1F2B', jacketShade: '#5C1620', accent: '#D9A43A', shoe: '#D9A43A', extra: 'hood' },
  // the little sister, 7 (draw her at about 0.7 of Arlo's scale): bunches with coral bands, peach pyjamas
  nina: { ...body, jacket: '#F2A98A', jacketShade: '#D98E70', accent: '#F07C6A', shoe: '#F07C6A', extra: 'bunches' },
  // the best friend: an olive jacket, coral headphones round the neck
  theo: { ...body, jacket: '#6B7A3A', jacketShade: '#56632E', accent: '#F07C6A', shoe: '#C9C2B4', extra: 'headphones' },
  // Mom: a bob, a rose cardigan
  mom: { ...body, jacket: '#C77B8A', jacketShade: '#A9636F', accent: '#F2D9C4', shoe: '#5A4A6A', extra: 'bob' },
  // the man in the suit: a grey suit, a white shirt, a red tie
  suit: { ...body, jacket: '#6E7480', jacketShade: '#5A5F69', accent: '#B8343F', shoe: '#1A1B20', extra: 'suit' },
};

/** Walk-ons: Theo's grandma (a silver bob, a plum cardigan) and the gold shop's clerk (a green apron). */
export const EXTRAS: Record<'grandma' | 'clerk', Look> = {
  grandma: { ...body, hair: '#C9C2B4', jacket: '#7A4E7A', jacketShade: '#603C60', accent: '#F2D9C4', shoe: '#5A4A6A', extra: 'bob' },
  clerk: { ...body, jacket: '#3E7A5A', jacketShade: '#2E5E44', accent: '#F2D9C4', shoe: '#2A2A30', extra: 'suit' },
};
