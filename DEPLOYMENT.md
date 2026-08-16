# Deployment

This is a standard Next.js 14 App Router project with no server-side data dependencies
(no database, no API routes) — everything client-side reads from bundled JSON or the
browser's IndexedDB. That makes it deployable anywhere that runs Next.js.

## Option A — Vercel (simplest)

1. Push this project to a GitHub repo.
2. Import it at https://vercel.com/new.
3. Framework preset: Next.js (auto-detected). No environment variables required.
4. Deploy. Vercel serves `public/manifest.json` and `public/sw.js` automatically.

## Option B — Any Node host (Render, Railway, a VPS, etc.)

```bash
npm install
npm run build
npm run start   # serves on port 3000 by default; set PORT to override
```

Put this behind a reverse proxy (nginx/Caddy) with HTTPS — service workers and
`beforeinstallprompt` installability both require a secure context (HTTPS or localhost).

## Option C — Static export (e.g. GitHub Pages, S3 + CloudFront)

This app currently has no server-only features (no route handlers, no server actions),
so a static export should work:

```js
// next.config.mjs
const nextConfig = {
  output: "export",
};
```

Then:

```bash
npm run build
# static site is emitted to ./out
```

Note: `next/image` optimization isn't available under static export; this project
doesn't currently use `next/image`, so this shouldn't require changes.

## Post-deploy checklist

- [ ] Visit the deployed URL over HTTPS and confirm the install prompt appears (Chrome/
      Android) or that "Add to Home Screen" works (iOS Safari).
- [ ] Open dev tools → Application → Service Workers and confirm `sw.js` registered.
- [ ] Go offline (dev tools → Network → Offline) and reload a previously-visited page —
      it should still render.
- [ ] Run the calculator test suite one more time against the deployed commit:
      `npm test`.
- [ ] Read `DATA_VERIFICATION.md` and get a clinician sign-off plan in place before
      anyone relies on this for a real case.
