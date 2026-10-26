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
- `src/components/space/`: the space scroll engine (Lenis + GSAP ScrollTrigger): starfield canvas, the flying mascot with lightning trail, pinned scenes, device mockups and the demo reel. All motion is off under `prefers-reduced-motion`.
- `src/components/mascot/`: the animated T-rex mascot (SVG + CSS states: idle, thinking, working, approval, done, error). Layer images live in `public/mascot/`.
- `src/lib/docs.ts` and `src/app/docs/`: the /docs section (sidebar, search, light/dark).
- `public/media/`: real product screenshots and the demo reel (mp4 + webm + poster), captured in Ingot test mode on a sample repository.
- `src/app/icon.png`, `apple-icon.png`, `favicon.ico`, `opengraph-image.png`: icons and social card made from the mascot.

## Deploy

Vercel project `zaprex-site` (team forgestacks-projects). Production domain `zaprex.dev`; `www.zaprex.dev` redirects to it.

No secrets live in this repo. Put any future keys in Vercel environment variables or a local `.env` (gitignored).
