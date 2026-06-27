# Annual Plan

A small, private web app for two partners to run a yearly planning meeting. It moves
through four screens: setup, private prep, a guided meeting, and a review you can
download. Everything stays on your device.

## The flow

1. **Setup** — name both partners and pick the meeting date and year.
2. **Prep** — each partner privately answers four reflection questions. Saves as you
   type, editable until the meeting, with an "I'm ready" marker for each person. Your
   answers stay hidden from each other until you sit down together.
3. **Meeting** — a step-by-step walk through six parts. It opens by revealing both
   prep sets side by side, then collects shared answers section by section, and ends
   with a signed commitment.
4. **Review** — a clean summary of everything, plus a one-click PDF download named
   `Annual-Plan-<year>.pdf`.

A returning visitor lands back where they left off. Starting a new year archives the
current plan as a signed record and opens a fresh one, carrying the names forward.

## Privacy

Local-first. Everything is stored in this browser via `localStorage`. No accounts, no
backend, no tracking. Clearing browser data clears the plans, so download a copy of
each finished plan to keep it.

## Run it

```bash
npm install
npm run dev      # local dev server
npm run build    # static build into dist/
npm run preview  # serve the build
```

Deploys as a static site (the `dist/` folder) to any host.

## Stack

Vite, React, TypeScript, Tailwind CSS v4. PDF export uses `html2pdf.js`, lazy-loaded
on first download. The data model lives in `src/types.ts`, persistence in
`src/storage.ts`, and all meeting copy in `src/content.ts`.

## Theming

Design tokens are CSS variables at the top of `src/index.css` (light and dark). Swap
those values to restyle the whole app. Dark mode follows the system setting and can be
toggled in the header.
