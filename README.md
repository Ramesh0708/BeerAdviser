# Beer Adviser 2026

A fun, motion-heavy web rebuild of the original **Beer Adviser** Android app (`com.hfad.beeradviser`).

Pick a house — Kingfisher, Bira, Budweiser, or Tuborg — hit **Find Beer!**, and get the same expert picks as the APK, plus mood matching, a taste DNA quiz, a cellar search, and a personal vault.

## Run locally

```bash
npm install
npm run dev
```

Then open the printed local URL (default `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

The original APK is available in the site as a download (`public/beeradviser.apk`).

## Deploy (Netlify)

```bash
npm run build
npx netlify-cli deploy --dir dist --no-build --prod
```

Or click [Deploy to Netlify](https://app.netlify.com/start/deploy?repository=https://github.com/Ramesh0708/BeerAdviser).

Drink responsibly. 18+ only.
