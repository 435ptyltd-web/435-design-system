# 435 Group Design System

Design-system primitives for **435 Group** and its arms (43 Studio, Three Five
Apparel, 45 Investments, One Six Consultants) — built to the brand locked in
`BRAND.md` / `tokens.css` of [`435-social`](https://github.com/435ptyltd-web/435-social).

## What's here

- `src/tokens/tokens.css` — the brand tokens (colours, type, spacing), mirrored
  from `435-social`. This is the single source of truth for the palette
  (Ink, Bone, Stone, Sand, Sage, Blush) and type families (Cormorant Garamond,
  Archivo, DM Mono).
- `src/styles.css` — component styles, `@import`s the tokens.
- `src/components/` — React + TypeScript primitives: `Button`, `Input`,
  `Card`, `Badge`, `Typography` (`Display`/`Heading1-3`/`Body`/`LabelText`/`Mono`),
  `ColorSwatch`, `Divider`.
- `src/examples/` — usage examples for each primitive (used to generate
  previews when syncing to Claude Design).

## Build

```sh
npm install
npm run build
```

Outputs `dist/index.js` (ESM, React peer dep), `dist/styles.css`, and
`dist/index.d.ts`.

## Syncing to Claude Design

This repo is kept in sync with a Claude Design project via `/design-sync`.
`.design-sync/config.json` pins the target project and records shape config.
