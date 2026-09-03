# Beer Adviser 2026

Pick a house, get the pour — then play Perfect Pour, Bubble Rush, Pub Trivia, or Spin the Tap.

Twelve houses (Kingfisher, Bira, Budweiser, Tuborg, Heineken, Corona, Guinness, Carlsberg, Stella Artois, Hoegaarden, Asahi, Haywards) with histories, pairings, mood matching, and a vault.

## Run locally

```bash
npm install
npm run dev
```

## Ads

Copy `.env.example` to `.env` and add your AdSense publisher ID (`ca-pub-…`) plus optional ad unit slot IDs. Rebuild so Vite can inline them. On Netlify, set the same `VITE_ADSENSE_*` variables in Site configuration → Environment variables, then trigger a new deploy.

Until those IDs exist, the site shows labelled ad placeholders.

Drink responsibly. 18+ only.
