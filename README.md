# Nourish Sahel

Prelaunch website for Nourish Sahel, built with TanStack Start, React, TypeScript, Nitro and pnpm.

## Run locally

    pnpm install --frozen-lockfile
    pnpm dev

Open http://127.0.0.1:3000/.

    pnpm typecheck
    pnpm build
    pnpm start

## Content and deployment

- `src/data/pages.json` holds the 24 pages and their search descriptions.
- `public/nourish` contains the optimised website images.
- `public/precision.css` applies the brand palette and responsive layouts.

Set the server environment variable `NOURISH_SITE_URL` to the public HTTPS origin at launch. The app uses it for canonical URLs and absolute social preview images. Preview pages carry a noindex directive when the public origin is unset.

Contact and newsletter forms validate locally and show a preview confirmation. Connect live destinations and publish verified service terms and privacy copy before launch.
