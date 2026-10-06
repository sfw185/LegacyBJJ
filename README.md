# LegacyBJJ

Class schedules for every [Legacy Brazilian Jiu Jitsu](https://www.legacybjj.com.au/find-an-academy/) academy, pulled from each academy's Clubworx calendar.

On first visit you pick your academy; the choice is remembered in `localStorage` so you go straight to your schedule after that. Use **Change academy** to switch, or link directly to one with `?gym=<id>` (e.g. `?gym=parramatta`).

## How it works

`npm run build` fetches 14 days of classes for each academy in `src/gyms.js` and renders static HTML into `public/`:

- `index.html`: the app (selector plus a one-week schedule per academy)
- `embed/<id>.html`: a two-week schedule fragment per academy (see [embed.md](embed.md))

GitHub Actions rebuilds and deploys to GitHub Pages on every push to `main` and daily at 4 AM AEST.

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
| `hornsby` | Hornsby | none (links to its timetable page) |
| `midcoast` | Midcoast (Diamond Beach) | none (links to its timetable page) |

To add an academy, add an entry to `src/gyms.js`. Its Clubworx slug is the part after `/websites/` in any of its Clubworx links (sign-up waivers, booking pages, etc.).
