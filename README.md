# Zaprex website

Marketing site for **Zaprex**, the background AI coding bot from [Ingot](https://ingot-portal.vercel.app). Live at **https://zaprex.dev**.

Built with Next.js (App Router) and Tailwind CSS. Light, Dark and System themes (System is the default).

## Develop

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build
```

## Structure

- `src/app/page.tsx`: the landing page (hero, how it works, features, routines, security, pricing teaser, FAQ, early access).
- `src/lib/site.ts`: copy, links and the canonical URL (`NEXT_PUBLIC_SITE_URL`, defaults to `https://zaprex.dev`).
- `src/app/api/waitlist/route.ts`: early-access sign-ups. For now they are written to the function log only (see the TODO there).
- `src/app/icon.png`, `apple-icon.png`, `favicon.ico`, `opengraph-image.png`: icons and social card made from the mascot.

## Deploy

Vercel project `zaprex-site` (team forgestacks-projects). Production domain `zaprex.dev`; `www.zaprex.dev` redirects to it.

No secrets live in this repo. Put any future keys in Vercel environment variables or a local `.env` (gitignored).
