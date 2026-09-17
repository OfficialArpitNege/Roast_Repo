# RoastMyRepo — Cinematic GitHub Roast Landing Page

A scroll-driven, cinematic landing page built with React + Vite + Three.js
(via React Three Fiber) + GSAP ScrollTrigger + Tailwind CSS, in a soft,
light, premium palette (no dark theme).

A stylized developer walks in holding a laptop, his GitHub profile card
materializes from the screen, his repos appear and get scanned one by one,
an analysis reveal lands a roast line, then a CTA appears — all as one
continuous scroll-scrubbed shot.

## Getting started

```bash
npm install
npm run dev
```

```bash
npm run build      # production build to dist/
npm run preview    # preview the production build locally
```

## Project structure

```
index.html
src/
  main.jsx
  App.jsx                       Page shell: loader, canvas, HUD, scroll track
  index.css                     Tailwind + soft cinematic styles
  components/
    Loader.jsx
    HUD.jsx                     Captions + final CTA (has ANALYZER_URL — see below)
  three/
    CanvasStage.jsx              Fixed full-screen <Canvas>
    Experience.jsx                Scene assembly + render loop
    buildCharacter.js             Developer character (glasses, shirt, laptop w/ glowing "portal" screen)
    cardFactory.js                Shared canvas-texture card builder
    buildCards.js                 Profile card, repo cards, scan readout, roast card
    buildScrollTimeline.js        The one GSAP/ScrollTrigger timeline driving the whole sequence
```

## ⚠️ Point the CTA at your real analyzer page

`src/components/HUD.jsx` exports `ANALYZER_URL`, currently set to a
placeholder (`https://github.com/`). Change it to your actual GitHub
analyzer route before shipping:

```js
export const ANALYZER_URL = 'https://your-app.com/analyze'
```

## Customizing

- **Copy / captions**: `src/components/HUD.jsx`.
- **Profile stats, repo list, roast line**: `src/three/buildCards.js`
  (`REPO_DATA`, `ROAST_LINES`, and the profile card's name/handle/stats are
  drawn directly in `buildProfileCard`). These are placeholder/sample data —
  wire them up to a real GitHub API response if you want the 3D scene itself
  to reflect the visitor's actual profile.
- **Phase timing**: the fractional start times (0–1) in
  `buildScrollTimeline.js`.
- **Total scroll length**: `height: 650vh` on `#scroll-space` in
  `src/index.css`.
- **Palette**: CSS variables in `src/index.css` + `tailwind.config.js`, and
  the matching hex colors used for Three.js materials/lights in
  `Experience.jsx` / `buildCharacter.js` / `buildCards.js`.

## Notes & honest limitations

- The character is a **procedural, low-poly stylized humanoid** (cylinders
  + spheres), not a rigged/skinned 3D asset — there's no external file to
  load. For a fully custom character matching your brand more precisely,
  swap in a rigged `.glb` via `@react-three/drei`'s `useGLTF`.
- The GitHub profile/repo data shown in the 3D cards is **static sample
  data** baked into `buildCards.js`, not a live GitHub API call. Wiring it
  to real data means re-running each card's `redraw()` with fetched values
  before its reveal tween fires in the timeline.
- No post-processing (bloom, DOF) is used, to keep the scene light and fast
  on mobile — the "glow" you see is emissive/additive materials only.
