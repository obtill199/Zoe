# Zoe Artistry

Website for [Zoe Artistry](https://zoeartistry.glossgenius.com/), skin therapy by Zoe Ellis in Wichita, KS.

A static site with no build step: `index.html`, `styles.css`, `script.js`. Booking, gift cards and the full review list stay on GlossGenius; every "Book" button links to `https://zoeartistry.glossgenius.com/services`. Photos are served from GlossGenius's image CDN.

## Run locally

```bash
python3 -m http.server 8411
```

Then open http://localhost:8411.

## Things to keep up to date

- **Monthly feature:** the "October Exclusive" Glass Skin Ritual appears in two places in `index.html`: the hero card (`.hero-feature`) and the `#featured` section.
- **Hours:** the table in `#visit` and the `HOURS` object in `script.js` (which drives the "Open now" badge).
- **Prices & services:** the `#services` section in `index.html`.
- **About copy:** drafted from Zoe's service descriptions and reviews. Have Zoe review it.

## Hosting

GitHub Pages: repo **Settings → Pages → Deploy from a branch → `main` / root**.
