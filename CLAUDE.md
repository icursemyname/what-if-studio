# What If Studio

Animated "What If…?" videos for a new English-language YouTube channel. The owner is Brazilian and works in Portuguese; the videos are in English.

## Working rules (from the owner)

- Videos run 6 to 12 minutes; slightly over 12 is fine now and then.
- Before writing any script, send a one-paragraph summary and a title for approval.
- Every script is delivered in English and in Portuguese.
- Before spending ElevenLabs credits (voice or sound effects), state how many credits the call will use and wait for an explicit yes. Report the real usage afterwards.
- Talk to the owner in Portuguese.

## Look

- **Backgrounds:** the Golden Hour style in `style/golden-hour.md` (palette in `style/tokens.json`, a style frame in `style/style-frame-dusk-street.jpg`): lo-fi anime-like painted backgrounds, three times of day (golden, dusk, night), every light from a visible source. The same guide lives as the "Golden Hour What If" design system on claude.ai.
- **Characters (overrides the cast section of `style/golden-hour.md`):** every character is a black stickman: round black head, thin black limbs, a light outline, white line features. Characters are told apart by clothes, and the women and girls also by hair.

| Character | Role | Clothes / hair |
| --- | --- | --- |
| Arlo | the hero, "you" in the narration | wine-red hoodie (#7a1f2b). Still to add: one signature detail of his own (e.g. mustard drawstrings or a small sun on the chest), because a black stickman in a red/orange hoodie is close to the heroes of Ifverse and Iflord |
| Nina | little sister, 7 | pigtails with coral bands, peach pyjamas |
| Theo | best friend | olive jacket, coral headphones round the neck |
| Mom | | bob haircut, rose cardigan |
| The man in the suit | the power that notices | grey suit, white shirt, red tie |

All characters and stories must be original: never a channel's own hero, never a remake of another channel's title.

## Episode 1: One Thing Into Gold

- Title: "What If You Could Turn ONE Thing Into Gold Every Day?" / "E se você pudesse transformar UMA coisa em ouro por dia?"
- Script (EN): `episodes/one-touch-gold/roteiro-en.md`. The PT version and the sourced science table are in the Claude Doc linked at the top of that file.
- Storyboard: 33 key frames in `episodes/one-touch-gold/storyboard/` (open `index.html`), drawn with `tools/storyboard-kit/` (`python3 shots.py [S07 …]` re-renders frames, `build_page.py` rebuilds the page; output paths inside the scripts point to the old workspace and need adjusting).
- **Next step: the voice.** About 7,500 spoken characters in English. **Model chosen by the owner: Flash v2.5 (`eleven_flash_v2_5`)**, about 3,750 credits plus 10–20% for retakes (the skill's `voice.py` defaults to Multilingual v2: set `"voice": {"model": "eleven_flash_v2_5"}` in the episode's `episode.json`). The owner approved as many voices and sound effects as make the video richer, on condition that every call is announced with its credit cost first and gets a yes.
  - Spoken characters counted from `roteiro-en.md`: narrator 4,949 (64 lines), suit 311, Theo 189, Nina 63, news anchor 40, Mom 18; total 5,570, so about 2,800 credits on Flash v2.5 at its list rate. The skill's notes show this account's real rate drifting (0.22 to 0.44 a character on Multilingual v2), so re-check the rate on a short take before the full run.
  - Sound: reuse `studio/library/sfx/` first (chimes, pops, cracks, steps, room tone, wind). New short clips run about 5–6 credits a second; long ambiences are the expensive part.

## ElevenLabs access

The key is stored as a network secret on the cloud environment (host `api.elevenlabs.io`, header `xi-api-key`), so it never appears in the session. The skill's `scripts/voice.py` reads `ELEVENLABS_API_KEY`; when the network secret is set, pass any placeholder value (the proxy replaces the header). Never commit a key: `.env` is in `.gitignore`.

## Tools in this repo

- `.claude/skills/what-if-animation/`: the What If animation skill (MIT, FreshStack). Its pipeline makes 15–25 s episodes; the 6–12 min format needs it run per scene or adapted.
- `studio/`: the skill's Remotion studio (run `npm install` inside it first).
