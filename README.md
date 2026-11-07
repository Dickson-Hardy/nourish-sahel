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

Set the server environment variable `NOURISH_SITE_URL` to the public HTTPS origin at launch. The app uses it for canonical URLs and absolute social preview images and the XML sitemap. The public robots.txt advertises the sitemap when the origin is configured. Preview pages carry a noindex directive when the public origin is unset.

## Forms

Set the variables from `.env.example` in the server environment. For a local production build, run `node --env-file=.env .output/server/index.mjs`.

The site uses the Hostinger Mail API. Set `NOURISH_HOSTINGER_API_TOKEN` and the `NOURISH_HOSTINGER_MAILBOX_ID` for the authorised sending mailbox in the server environment. The recipient defaults to `info@nourishsahel.com`. The visitor’s address is included in the message body.

The newsletter form emails each signup request to the inbox for follow-up. Keep the subscriber list separately. Forms report that they are unavailable when their mail settings are incomplete.
