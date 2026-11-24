# International Music Scales Atlas

**Development preview.** Features and examples may change. Corrections and feedback are welcome.

Explore five mathematical tuning examples, change the tonic and reference, and compare interval sizes. Each example is generated from an explicit formula or step sequence. The public edition includes a navigable world map. Geographic research entries are in preparation.

[Open the Atlas](https://persianmusicscales.github.io/international-music-scales-atlas/) · [Read the wiki](https://github.com/PersianMusicScales/international-music-scales-atlas/wiki) · [Report a problem](https://github.com/PersianMusicScales/international-music-scales-atlas/issues)

## Run locally

Run `python3 -m http.server 8000` from the project directory and visit http://localhost:8000. The application runs in the browser. Run `node --test atlas.test.mjs` with Node 22 or later to check the examples and diagrams.

## Credits and reuse

Created by Pouya Hosseini. The [license](LICENSE) covers original project material. The basemap uses [Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/) public-domain relief and country outlines. Each example's construction is documented in examples.js.
