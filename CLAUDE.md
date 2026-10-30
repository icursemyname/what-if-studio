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
- **Voice: done (2026-10-30).** Model chosen by the owner: **Multilingual v2 (`eleven_multilingual_v2`)**. 78 lines, 5,570 characters, about 7 min 48 s of speech, in `episodes/one-touch-gold/audio/voice/` (one mp3 per line, a `.json` of character timings beside each, `manifest.json` with each line's real cost). Made with `npm run voices -- one-touch-gold` (`tools/voice/voices.mjs`; cast and settings in `episodes/one-touch-gold/voices.json`): `--dry` counts characters, `--lines 4` or `--speaker NINA` picks lines, nothing is sent without `--yes`, and unchanged lines are reused for free.
  - Cast: narrator Harrison Gale, Nina Jessica, Theo Will, Mom Bella, suit Eric, news anchor Daniel (all on the account). Jessica is a young adult voice; if Nina doesn't sound 7, look for a child voice in the Voice Library and re-run `--speaker NINA`.
  - Real cost: 2,229 credits (narrator 1,980, suit 125, Theo 75, Nina 26, anchor 16, Mom 7), a steady 0.40 credits a character on this account. Use 0.40 to quote retakes.
  - The owner approved as many voices and sound effects as make the video richer, on condition that every call is announced with its credit cost first and gets a yes.
- **Sound effects: clips done (2026-10-30).** The plan is `episodes/one-touch-gold/sound.json`: 35 events, each tied to the voice line it follows (`after`), using 11 library clips and 19 new ones (39.1 s, now in `studio/library/sfx/`). `gold_chime` is the power's signature (every touch), `gold_chime_deep` the climax, `fingertip_glow` every midnight. Made with `npm run sfx -- one-touch-gold` (`tools/sound/sfx.mjs`: `--dry`, `--clips a,b`, `--all`, nothing sent without `--yes`; files named like the skill's `sfx.py`, so later episodes reuse them for free).
  - Real cost: 391 credits, a steady **10 credits a second** on this account. Sound clips are not in the generation history and the subscription counter lags; the usage stats (`/v1/usage/character-stats`, "Sound Effects") are exact once they settle, a minute or two after the run.
  - Still to do: placing each event on its frame and levelling it against the voice (needs the animation, and the skill's `sfx.py` needs Python and ffmpeg), and a music bed if wanted.

## ElevenLabs access

- **On the owner's Windows PC:** the key lives in `.env.local` (git-ignored), written by `npx -y @elevenlabs/cli@latest onboard init`; never open or print it. `npm run voices` loads it with `node --env-file=.env.local`; check it with `npx -y @elevenlabs/cli@latest onboard check --env-path .env.local`. This PC has Node but no Python or ffmpeg, so the skill's Python scripts don't run here.
- **On the cloud environment:** the key is a network secret (host `api.elevenlabs.io`, header `xi-api-key`), so it never appears in the session. The skill's `scripts/voice.py` reads `ELEVENLABS_API_KEY`; when the network secret is set, pass any placeholder value (the proxy replaces the header).
- Never commit a key: `.env` and `.env.local` are in `.gitignore`.

## Tools in this repo

- `.claude/skills/what-if-animation/`: the What If animation skill (MIT, FreshStack). Its pipeline makes 15–25 s episodes; the 6–12 min format needs it run per scene or adapted.
- `studio/`: the skill's Remotion studio (run `npm install` inside it first).
