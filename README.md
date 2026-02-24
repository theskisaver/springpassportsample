# SkiMath Spring Passport Web App (Sample)

This is a standalone SkiMath web app prototype.

## What this version includes

- Interactive trip planner with selectable resort options
- Embedded SkiMath Top Choice restricted options in the same selectors
- Live season cost summary that updates on every selection change
- Savings comparison against benchmark unlimited pass cost

## Local preview

```bash
cd "/Users/jpetraiuolo/Library/CloudStorage/GoogleDrive-jpetraiuolo@gmail.com/My Drive/skimath-spring-sample"
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Deploy with GitHub + Vercel

```bash
cd "/Users/jpetraiuolo/Library/CloudStorage/GoogleDrive-jpetraiuolo@gmail.com/My Drive/skimath-spring-sample"
git init
git add .
git commit -m "Initial SkiMath web app sample"
git branch -M main
git remote add origin https://github.com/<your-user>/<your-repo>.git
git push -u origin main
```

Then import the repo in Vercel and deploy.
