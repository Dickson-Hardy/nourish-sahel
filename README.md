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

The forms require Node.js 22.16 or later and a persistent, writable local filesystem. All Node workers on the host must use the same SQLite file at `NOURISH_FORM_LIMIT_DB` (defaults to `.data/form-limits.sqlite`). It allows up to twelve sends per socket peer per rolling ten minutes, plus 30 site-wide per rolling hour. Forwarded client IP headers are ignored. If the Node adapter exposes only the proxy peer, proxied visitors share that peer budget. Deployments on multiple hosts need a shared ingress send budget or a central limiter to enforce one limit across hosts.
