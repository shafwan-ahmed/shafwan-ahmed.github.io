# Deploying to GitHub Pages

This is a **plain static site** — no npm, no build step, no framework. Everything works by opening `index.html` directly. All local resources use relative paths (`css/style.css`, `js/main.js`, `favicon.svg`), so the site works on any subpath.

## Option A — user site (recommended): `shafwan1999.github.io`

1. Create a new **public** repository named exactly:
   ```
   Shafwan1999.github.io
   ```
2. Push all the files in this folder to the repository root:
   ```bash
   git init
   git add .
   git commit -m "portfolio site"
   git branch -M main
   git remote add origin https://github.com/Shafwan1999/Shafwan1999.github.io.git
   git push -u origin main
   ```
3. Done — GitHub Pages serves user sites automatically. Visit:
   ```
   https://shafwan1999.github.io
   ```
   (It can take a minute or two to go live.)

## Option B — project site (subpath)

If you'd rather keep it in a normal repo (e.g. `portfolio`):

1. Create a public repo, push these files to its root (same commands as above, different repo name/URL).
2. In the repo: **Settings → Pages → Source → Deploy from a branch**, pick `main` / `(root)`, save.
3. The site will be live at `https://shafwan1999.github.io/portfolio/` — the relative paths mean no changes are needed.

## Notes

- No Jekyll config is needed. Optionally add an empty `.nojekyll` file, but nothing here requires it.
- To update the site, just edit files, commit, and push — Pages redeploys automatically.
- Dark/light choice is stored in the visitor's browser (`localStorage`), nothing server-side.
