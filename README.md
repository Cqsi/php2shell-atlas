# PHP2Shell Atlas

A source-linked incident tracker for the October 2026 PHP vulnerabilities, CVE-2026-109618 and CVE-2026-109619.

## Run locally

```sh
npm run build
vercel dev
```

The site is a static HTML page in `src/index.html` with a Vercel function in `api/news.js`. `npm run build` embeds the country boundaries into `public/index.html`. The function checks 41 official, company, research and news RSS/Atom/RDF feeds and combines them with the latest validated snapshot in `data/live-news.json`. Results are cached for 15 minutes. The page merges these results with its reviewed articles and shows the newest first. Country colors remain curated and source-linked.

The [scheduled GitHub Action](.github/workflows/refresh-news.yml) runs twice an hour. It searches the [GDELT DOC 2.0 article index](https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/) for up to 200 recent matches across its monitored publishers, checks the 41 direct feeds, retains previously validated articles within 14 days, removes duplicate URLs and titles, and commits the snapshot only when its article list changes. Each item must be a recent HTTPS article with the incident name or one of its two CVEs in the title or feed summary. GDELT results must also have the incident name/CVE or PHP and a security term in the title. The Action does not infer country responses or map colors. GDELT may rate limit individual checks; the direct feeds and previous snapshot continue to serve in that case.

Run `npm run refresh-news` to refresh the snapshot locally. The live API can also fetch direct feeds if the scheduled snapshot is unavailable. X posts are not ingested: X API access requires separate developer credentials and usage billing, and social posts would need source verification before appearing as incident evidence.

## Updating the tracker

- Update the `responses` and `stories` collections in `src/index.html` after checking primary sources or direct reporting.
- Update the counts and date in the page header and footer.
- Run `npm run build && npm run check` before deploying.

The world map uses Natural Earth boundary data via [johan/world.geo.json](https://github.com/johan/world.geo.json). Regional views load more detailed [Natural Earth 1:50m country boundaries](https://www.naturalearthdata.com/downloads/50m-cultural-vectors/) from `data/countries-50m.geo.json`. The boundaries are display geometry, not statements of political status. To regenerate both SVG path files, run `python3 scripts/generate-map.py` from the repository root.

The theme toggle uses the [Lucide Sun and Moon icons](https://lucide.dev/icons) under the license in [`licenses/LUCIDE_LICENSE.txt`](licenses/LUCIDE_LICENSE.txt).
