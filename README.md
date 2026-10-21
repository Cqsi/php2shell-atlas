# PHP2Shell Atlas

[View the live tracker](https://php2shell-atlas.vercel.app/) · [Report a security issue privately](https://github.com/Cqsi/php2shell-atlas/security/advisories/new)

A simple map and source-linked news feed for the October 2026 PHP2Shell incident (CVE-2026-109618 and CVE-2026-109619).

## What the map means

Country colors represent documented public responses, such as a government shutdown or security advisory. They are curated from linked sources in `src/index.html`. A colored country does **not** mean that its systems were compromised, and an uncolored country does **not** mean that it is safe.

The map supports regional views, country details, light and dark themes, and touch zoom in mobile full-screen mode.

## How articles update

- The Vercel API checks 41 official, company, research, and news RSS/Atom/RDF feeds. Results are cached for 15 minutes.
- A GitHub Action is configured to refresh `data/live-news.json` twice an hour. It also searches [GDELT's article index](https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/) for broader coverage. GitHub schedules can be delayed, and GDELT may be unavailable; the direct feeds and previous snapshot remain usable.
- Articles must have a recent HTTPS URL and mention PHP2Shell or one of the two CVEs. Results are deduplicated and displayed newest first. The list is a discovery aid, so check the linked source before treating a claim as confirmed.
- Map colors and country descriptions are **not** inferred from the article feed. They require a source review and a code change.

X posts are not collected. X API access requires developer credentials and usage billing; social discussion should be shown separately from verified incident responses.

## Run locally

Use Node.js 22 or newer. The project has no npm package dependencies.

```sh
npm run build
npm run check
vercel dev
```

`vercel dev` runs both the page and `/api/news` and requires the [Vercel CLI](https://vercel.com/docs/cli) to be installed and linked to your own project. For a static preview without the live API, serve the generated `public/` directory with a local HTTP server. Opening `src/index.html` directly skips the build step and will not show the live tracker.

To refresh the committed article snapshot manually:

```sh
npm run refresh-news
```

## Project layout

| Path | Purpose |
| --- | --- |
| `src/index.html` | Page, styles, map interactions, curated responses, and reviewed articles |
| `lib/news.js` and `api/news.js` | Feed validation and the Vercel news endpoint |
| `scripts/refresh-news.mjs` | Broader article search and snapshot refresh |
| `data/live-news.json` | Latest committed article snapshot |
| `data/map-data.json` and `data/map-detail.json` | Generated map paths served by the build |
| `scripts/generate-map.py` | Regenerates the map paths from source geometry |

Before publishing changes, run `npm run build && npm run check`. The Vercel project uses `public/` as its output directory; `public/` is generated and is not committed.

## Security and privacy

There are no user accounts, analytics, or credentials in this repository. The browser stores only the theme choice in local storage. Article images and Google Fonts load from third-party hosts, so visitors may make requests to those services. Do not commit API keys or tokens; use deployment secrets if a future integration needs them.

Please [report vulnerabilities privately](https://github.com/Cqsi/php2shell-atlas/security/advisories/new) rather than posting exploit details in a public issue. See [SECURITY.md](SECURITY.md).

## Data and icon credits

The world map uses [Natural Earth boundaries](https://www.naturalearthdata.com/downloads/) via [johan/world.geo.json](https://github.com/johan/world.geo.json), with more detailed Natural Earth 1:50m borders for regional views. The boundaries are display geometry, not statements of political status. Regenerate the map paths with `python3 scripts/generate-map.py`.

The theme and GitHub star icons are from [Lucide](https://lucide.dev/icons); the license is in [`licenses/LUCIDE_LICENSE.txt`](licenses/LUCIDE_LICENSE.txt).
