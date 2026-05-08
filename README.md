# Toolie

Africa's everyday tools, in one place.

## What this is

Toolie is a regional utility hub built in South Africa for the Southern African economy. The site brings together calculators, planners, and decision-helpers that solve real, recurring problems for everyday life across the SADC region.

## Domains

- `gettoolie.com` — primary, global trust
- `toolie.africa` — regional brand anchor

Both domains point at the same Netlify deployment.

## Project structure

```
toolie-site/
├── index.html      — homepage shell
├── style.css       — design system (colours, typography, layout)
├── README.md       — this file
├── SETUP.md        — step-by-step deployment guide
└── tools/          — individual tool pages (added as we build)
```

## Brand identity

Modern, professional, warm, and playful. Holds Gen X executives, Millennials, Gen Z, and cross-border SADC users on one site without locking to any single national identity.

| Element | Value |
| --- | --- |
| Primary | `#0F4C5C` (deep teal) |
| Accent | `#E36F3D` (warm coral) |
| Background | `#FAF7F2` (soft cream) |
| Footer | `#F2EDE5` |
| Body text | `#1F2937` |
| Muted | `#6B7280` |
| Headings font | DM Sans (500, 600, 700) |
| Body font | Inter (400, 500) |

## Local preview

This is a plain static site. To preview locally, either:

1. Open `index.html` directly in your browser, or
2. Run `python3 -m http.server 8000` from this folder and visit `http://localhost:8000`

## Deployment

Hosted on Netlify, auto-deployed from the `main` branch of this repo. Every commit triggers a new deploy within ~90 seconds.

See `SETUP.md` for the one-time setup walkthrough.

## License

All rights reserved.

---

*Powered by Elroi*
