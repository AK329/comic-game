# Abandoned but Not Forgotten

A gentle, bilingual space-exploration book for ages 8–12, built with **Next.js
App Router and JavaScript/JSX**, React, Three.js, Framer Motion, and react-pageflip.

## Requirements

Node.js 22 with its bundled npm. Install dependencies with `npm ci`
(or `npm install` when changing dependencies).

## Next.js application

```sh
npm run dev:next
```

For production:

```sh
npm run build:next
npm run start:next
```

On Vercel, select the Next.js preset and set the build command to
`npm run build:next`. Use the default Next.js output, not `dist`.

## Retained Figma Make / Vite preview

The Make preview remains Vite-based and hot-reloads automatically.
Outside Make, `npm run dev` starts that preview. `npm run build` builds
the Vite version to `dist`, and `npm run preview` serves that build.
Both runtimes use the same JSX game components and styles.

## Structure

- `app/layout.jsx`: document shell, fonts, global styles, and metadata.
- `app/page.jsx`: home route (Server Component).
- `app/mission/[id]/page.jsx`: validated mission route; `/mission/rover`
  starts at the closed hardcover, like the home route. Locked/unknown mission IDs return 404.
- `src/BookApp.jsx`: interactive client-side book with 10 inside pages. Opening
  the hardcover reveals the Moon/Mars maps; the former inner cover and character
  selection pages are no longer included. Mission navigation stays inside the book.
- `src/components/`: activities, illustrations, maps, and memory book.
- `src/data/`: local JSON missions and map data.
- `src/locales/`: live English/Bangla copy.
- `src/hooks/useProgress.js`: browser-local progress (no server/database).
- `src/main.jsx` and `src/App.jsx`: Vite-only entrypoints.

All application code is JavaScript/JSX. `vite.config.ts` is retained as
platform-managed preview tooling, not Next.js application code.

## Notes

Progress is saved in localStorage for the current browser and origin; it does
not sync between devices or between the Vite and Next.js origins.
Google Fonts and the optional confetti effect require internet access.
Images and local fonts remain bundled from `src/assets`.

Before publishing, review NASA/image/font attribution and licenses, add your
team details, and check the challenge's submission requirements. Never commit
credentials or `.env` files.
