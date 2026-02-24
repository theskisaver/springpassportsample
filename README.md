# SkiMath Spring Passport Sample

This is a static web app prototype based on your current SkiMath calculator logic.

## Local preview

From this folder, run:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy with GitHub + Vercel

1. Create a new GitHub repository.
2. Push this folder:

```bash
cd "/Users/jpetraiuolo/Library/CloudStorage/GoogleDrive-jpetraiuolo@gmail.com/My Drive/skimath-spring-sample"
git init
git add .
git commit -m "Initial SkiMath Spring sample app"
git branch -M main
git remote add origin https://github.com/<your-user>/<your-repo>.git
git push -u origin main
```

3. In Vercel:
- Add New Project
- Import the GitHub repo
- Framework Preset: Other
- Deploy

No build step is required.

## Files

- `index.html` UI
- `styles.css` styles
- `data.js` all pricing/options data
- `app.js` calculator + rules logic
- `Spring Passport 2026 (7).pdf` sample PDF for reference
