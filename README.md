# Stall Plus

Static StallPlus site for privacy guards, personal item protectors, and refreshed news data.

## Local development

```sh
python3 -m http.server 5173
```

Open <http://localhost:5173/>.

## Refresh news

```sh
node scripts/update-news.mjs
```

The script rewrites `data/why-stallplus-news.json`.

## Vercel

This project is configured for Vercel as a static site. The Vercel project is connected to the GitHub repository and deploys from `main`.
