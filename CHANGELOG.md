# Changes in this update

- Fixed the original startup crash: `state.js` called `Utils.getLocalDate()` before `utils.js` had loaded.
- Fixed asset paths by placing JavaScript and CSS under the folders referenced by `index.html`.
- Removed the invisible-content trap when GSAP was missing; motion is progressive enhancement, not a rendering requirement.
- Rebuilt the layout as a responsive personal workspace with clearer hierarchy, hover states, micro-interactions, reduced-motion support and SVG icon fallbacks.
- Added local prototype sign-in / account creation, per-account browser storage, a demo workspace and sign-out / sign-in persistence.
- Added habit categories, routine time, reasons, daily check-ins, 7-day history, edit/delete controls, current and best streaks.
- Added task priority, optional due dates, sort/filter controls, completion history and editing.
- Added focus/break presets, pause/resume/reset and completed focus session tracking.
- Added hydration goals, mood check-in, daily reflection, weekly insights, milestones, a personality reflection quiz, theme/grid/motion settings and JSON data import/export.
- Added XAMPP/PHP/MySQL starter documentation, schema, configuration example and PHP session/state API examples for later integration.

## Motion and theme polish
- Added a persistent quick theme switch to the auth screen and workspace topbar, synced with a browser-wide theme preference.
- Added ambient blobs, drifting geometry and orbital accents to the sign-in/create-account background, including mobile.
- Added soft staggered drop-in transitions for each workspace view, with a Web Animations fallback if GSAP cannot load.
- Made GSAP and Lucide load in deterministic deferred order instead of racing via async scripts.
- Added subtle click ripples, tactile button feedback, card hover depth and reduced-motion handling.

## Motion pass v1.2
- Fixed the conflict where the browser/OS `prefers-reduced-motion` media rule silently zeroed all transitions, even with Momentum's Reduce motion setting off. Motion is now governed by the app's explicit setting.
- Added a CSS-generated workspace motion field and ambient particles, pointer-following glow, more noticeable moving sign-in geometry, stronger hover states, button sheen/ripple feedback, and account-mode transition animations.
- Workspace view entrances now use a larger soft drop and longer stagger. No image assets are required.
