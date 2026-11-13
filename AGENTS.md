# figma-make-app

Next.js App Router + JavaScript/JSX + Tailwind CSS project, with a retained Vite preview inside Figma Make.

## Development Server

A Vite development server is **already running** on `$PORT` (default 8443). You don't need to start it manually.

- Preview URL: The user can access the running app through the preview panel
- Hot reload: Changes to source files are reflected immediately

## Project Structure

This is the canonical project structure. Start with task-relevant files below. Only follow imports or inspect other files when required, when a documented path is missing, or when the repository contradicts this guide.

- `app/layout.jsx` - Next.js root layout, metadata, fonts, and global CSS
- `app/page.jsx` - Next.js home route
- `app/mission/[id]/page.jsx` - Validated mission deep links
- `src/BookApp.jsx` - Shared interactive application; the usual starting point for UI work
- `src/main.jsx` - Vite React entrypoint; imports `src/index.css` and mounts `src/App.jsx` into the `#root` element
- `src/App.jsx` - Vite adapter for the shared application
- `src/index.css` - Global CSS entrypoint and Tailwind CSS v4 import
- `index.html` - Vite HTML shell containing the `#root` element and loading `src/main.jsx`
- `package.json` - Project dependencies and the Vite build, development, preview, and formatting scripts
- `vite.config.ts` - Vite configuration with React, Tailwind CSS v4, and Figma Make plugins plus the `@` alias for `src`
- `.mise.toml` - Toolchain version for Node.js (npm is bundled)
- `package-lock.json` - npm lockfile

## Dependencies

- Runtime: React 19 and React DOM 19
- Styling: Tailwind CSS v4 with the `@tailwindcss/vite` plugin
- Application: Next.js 16 App Router with JavaScript/JSX
- Preview tooling: Vite 8 and `@vitejs/plugin-react`; the managed Vite config remains TypeScript
- Formatting: oxfmt

## Styling

This project uses **Tailwind CSS v4** through the `@tailwindcss/vite` plugin configured in `vite.config.ts`. `src/index.css` imports Tailwind with `@import 'tailwindcss';`. Use Tailwind utility classes directly in JSX and put global CSS or Tailwind v4 theme customization in `src/index.css`. This scaffold does not need a Tailwind config file or PostCSS config.

`src/main.jsx` and `app/layout.jsx` import `src/index.css`. Next.js uses `postcss.config.mjs` for Tailwind v4; Vite retains its Tailwind plugin. Global CSS font wiring belongs in `src/index.css`; existing Next.js font variables are set by the root layout. Keep CSS `@import` statements first, then add any `@font-face` rules and font-family defaults there.

## Verification

- Package manager: npm (`npm ci`; use `npm install <pkg>` to change dependencies)
- Next.js production build: `npm run build:next`
- Retained Vite production build: `npm run build`
- Format selected files: `npm run format -- <paths>`
- Do not start another development server in Make.

## Code quality

- Use double quotes for strings containing apostrophes (`"We're here to help"`), or escape them in single-quoted strings. An unescaped apostrophe in a single-quoted string breaks the build.
- Ensure JSX tags are closed and braces are balanced.
- Export components as default exports.
