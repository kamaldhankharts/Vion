# Vion – MovieBox Pure API

Streaming app powered by the **MovieBox Pure API** (`https://web-production-31785.up.railway.app`).

## Features

- Home feed with Banner, Popular Series, Popular Movies, Nollywood, Animation, etc.
- Real search via `/search`
- Full detail pages (seasons, episodes, cast, trailer)
- Direct MP4 streaming (360p → 1080p) via `/api/stream`
- Multi-language subtitles ready
- Firebase Auth + My List + Downloads
- Capacitor Android build + automatic GitHub Releases

## Quick start (local / Termux)

```bash
# 1. Clone / unzip the project
cd Vion-main   # or wherever you extracted it

# 2. Install dependencies
npm install

# 3. Create env (already has a sensible default)
cp .env.example .env
# Edit if you want a different API base:
# VITE_MOVIEBOX_API=https://web-production-31785.up.railway.app

# 4. Run web dev server
npm run dev
# → open http://localhost:3000
```

## Build Android APK (Termux / Linux)

```bash
# Install Node if needed (Termux)
pkg install nodejs-lts git openjdk-17 wget unzip

# From project root
npm install
npm run build

# Capacitor Android project
npx cap add android          # only first time
npx cap sync android

# Build debug APK
cd android && ./gradlew assembleDebug
# APK → android/app/build/outputs/apk/debug/app-debug.apk
```

## Automatic release on GitHub

The workflow `.github/workflows/build-android.yml` already exists.

### One-time setup

1. Push this repo to GitHub.
2. (Optional) Add secrets for signed release:
   - `KEYSTORE_B64` – base64 of your `.jks`
   - `KEYSTORE_PASSWORD`
   - `KEY_ALIAS`
   - `KEY_PASSWORD`

### Create a release (from Termux or any terminal)

```bash
# Bump version in package.json if you want, then:
git add -A
git commit -m "v1.1.0 – MovieBox API integration"
git tag v1.1.0
git push origin main --tags
```

GitHub Actions will:
1. Build the web app
2. Sync Capacitor
3. Produce debug (+ signed release if secrets exist) APKs
4. Attach them to the **GitHub Release** for that tag

You can also trigger the workflow manually from the Actions tab (`workflow_dispatch`).

## API flow used by the app

```
/home                    → Home sections + banners
/search?q=...            → Search results
/detail/{slug}           → Full metadata + seasons
/api/stream/{id}?detail_path=...&se=&ep=  → MP4 links
/api/stream/{id}/captions → SRT subtitles
/movies | /tv-series     → Paginated catalogs
```

## Project structure (relevant)

```
src/
  api/moviebox.ts          ← Full API client + mappers
  context/ContentContext.tsx ← Loads home + catalogs, detail, stream
  components/
    Home.tsx               ← Banner + section rows from API
    Search.tsx             ← Live search
    ContentDetails.tsx     ← Detail + play stream
    VideoPlayer.tsx        ← MP4 / HLS player
```

## License

Apache-2.0 (same as original template)
