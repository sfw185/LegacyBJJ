# LegacyBJJ

Class schedules for every [Legacy Brazilian Jiu Jitsu](https://www.legacybjj.com.au/find-an-academy/) academy, pulled from each academy's Clubworx calendar.

On first visit you pick your academy; the choice is remembered in `localStorage` so you go straight to your schedule after that. Use **Change academy** to switch, or link directly to one with `?gym=<id>` (e.g. `?gym=parramatta`).

## How it works

The site is served at **https://legacy.australian.software/** by a Cloudflare Worker (`src/worker.js`). On each request it fetches 14 days of classes for each academy in `src/gyms.js` from Clubworx and renders:

- `/`: the app (selector plus a one-week schedule per academy)
- `/embed/<id>.html`: a two-week schedule fragment per academy (see [embed.md](embed.md))

Clubworx responses and rendered pages are cached at the edge for 60 seconds, so schedules are at most about a minute old. If Clubworx is down, the Worker serves the last good copy of each academy's schedule (kept for up to 7 days). CSS, images and the manifest are served from `public/`.

The Pug templates are precompiled to `src/templates.generated.js` (`npm run templates`) because Workers can't compile them at runtime.

- `npm run worker:dev`: run the Worker locally
- `npm run worker:deploy`: deploy by hand (normally done by GitHub Actions on every push to `main`; needs the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repo secrets)

### Static fallback

`npm run build` renders the same pages as static HTML into `public/`. GitHub Actions deploys that to GitHub Pages (https://sfw185.github.io/LegacyBJJ/) on every push to `main` and roughly every 4 hours, as a backup.

## Academies

| ID | Academy | Clubworx site |
| --- | --- | --- |
| `sydneyhq` | Sydney HQ (Chippendale) | `legacy-jiu-jitsu` |
| `brookvale` | Brookvale | `warrior-training-academy` |
| `chatswood` | Chatswood | `legacy-bjj-willoughby-pty-ltd` |
| `parramatta` | Parramatta (Rydalmere) | `legacy-bjj-parramatta` |
| `corrimal` | Corrimal | `legacy-bjj-wollongong` |
| `dapto` | Dapto | `legacy-bjj-dapto` |
| `sunshinecoast` | Sunshine Coast | `legacy-bjj-sunshine-coast` |
| `peregian` | Peregian Beach | `legacy-bjj-peregian` |
| `hobart` | Hobart | `legacy-bjj-hobart` |
| `hornsby` | Hornsby | `carioti-mma` |

To add an academy, add an entry to `src/gyms.js`. Its Clubworx slug is the part after `/websites/` in any of its Clubworx links (sign-up waivers, booking pages, etc.).
