# PHP2Shell Atlas

A source-linked incident tracker for the October 2026 PHP vulnerabilities, CVE-2026-109618 and CVE-2026-109619.

## Run locally

```sh
npm run build
vercel dev
```

The site is a static HTML page in `src/index.html` with a Vercel function in `api/news.js`. `npm run build` embeds the dotted map data into `public/index.html`. The function checks three official RSS/Atom feeds when the page opens. Its results are listed as live official-feed items; country colors remain curated and source-linked.

## Updating the tracker

- Update the `responses` and `stories` collections in `src/index.html` after checking primary sources or direct reporting.
- Update the counts and date in the page header and footer.
- Run `npm run build && npm run check` before deploying.

The map uses Natural Earth boundary data via [johan/world.geo.json](https://github.com/johan/world.geo.json). The boundaries are display geometry, not statements of political status. To regenerate the dot grid, run `python3 scripts/generate-map.py` from the repository root.
