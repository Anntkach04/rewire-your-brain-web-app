# Rewire Your Brain

A mobile-first emotional reflection ritual inspired by Nir Eyal's "Beyond Belief" — the idea that the brain reinforces what it repeatedly experiences. This app helps you trace your goals back to the feelings beneath them and rehearse those feelings today, in tiny, believable ways.

Not therapy. Not coaching. Not productivity software. A soft, science-inspired ritual.

## What it does

A 5-step guided flow:

1. **Write your goals** — anything you want or dream about.
2. **See the feelings behind them** — the app suggests emotional directions (freedom, calm, belonging, confidence…) and lets you tap to (de)select or add your own.
3. **A grounding reflection** — one warm, neuroscience-flavored reminder, slowly fading in.
4. **4 small actions for today** — tiny rehearsals of the feeling, not productivity tasks. Check them off; each one glows softly.
5. **Your brain notes** — an aesthetic journal page with your goals, feelings, reflection, and actions. Copy as text or download as an image.

## Tech stack

- React + TypeScript
- Vite
- Tailwind CSS (custom warm pastel palette)
- Framer Motion (transitions, floating gradients, soft animations)
- `html-to-image` for downloading the journal card

## Getting started

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

```bash
npm run build     # production build
npm run preview   # preview production build
npm run lint      # TypeScript type-check
```

## Project structure

```
src/
  App.tsx                        # Step orchestrator + soft "thinking" overlay
  index.css                      # Tailwind + component classes (glass card, buttons, grain)
  types.ts                       # Shared types (RewireResponse, SessionState)
  lib/
    generateRewireResponse.ts    # Mock "AI" — easy to swap for OpenAI / n8n / Cursor AI
  components/
    Atmosphere.tsx               # Full-screen `public/background.mp4` (loop) + poster PNG + grain / glow
    BrainOrb.tsx                 # The glowing, breathing centerpiece
    PhoneShell.tsx               # Centered mobile-first container
    StepProgress.tsx             # Soft stepper pills
    Sparkles.tsx                 # Tiny twinkling dots
    Doodles.tsx                  # Hand-drawn squiggle / heart / star / sun / arrow
  steps/
    Step1Goals.tsx               # Write your goals + activate brain
    Step2Feelings.tsx            # Floating feeling tags
    Step3Reflection.tsx          # Word-by-word neuroscience reminder
    Step4Actions.tsx             # Glowing checkable cards
    Step5Notes.tsx               # Journal page + copy / download / restart
```

## Wiring real AI later

`src/lib/generateRewireResponse.ts` exports:

```ts
async function generateRewireResponse(input: string): Promise<{
  feelings: string[];
  reflection: string;
  actions: string[];
}>;
```

Swap the function body for a `fetch` to OpenAI, an n8n webhook, or a Cursor AI integration. The rest of the app only depends on the returned shape, so the UI will continue to work unchanged.

## Design notes

Color palette:

- cream `#FBF1E2`, warm beige `#F2E2C9 / #EAD3B2`
- soft peach `#FBD2B7 / #FFE3CE`, dusty pink `#E8B4B8`
- pastel yellow `#FCEAB0`, light lavender `#D8C9EE / #E8DEF7`
- warm brown text `#5C4632 / #3F2E20`

Typography:

- **Instrument Serif** — self-hosted under `public/fonts/` with `@font-face` in `src/instrument-serif.css` (imported first in `main.tsx`). No Google Fonts or npm font package is required at runtime.

Motion philosophy: nothing snaps; everything breathes. The app background uses **two mathematically seamless loops**: (1) a slow scale + drift with `animation-direction: alternate` so each full cycle ends in the same visual state as it began; (2) a conic “light wash” that rotates exactly 360° on a long linear period. Spring physics on UI interactions; word-by-word fade for the reflection moment.

Background art: **`public/background.mp4`** (looped video). Optional poster **`public/app-background.png`** while the video loads, and for users with `prefers-reduced-motion` (static image only).
