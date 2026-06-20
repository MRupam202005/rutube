# Deployment Guide (Option B) — Frontend and Backend separately

This guide shows a minimal, production-ready flow to deploy the backend (Node/Express) and frontend (Vite/React) as separate services.

## Backend — prepare
- Ensure `start` script exists (runs `node src/index.js`).
- Add production environment variables (see `.env.example`).
- Use MongoDB Atlas for production; set `MONGODB_URI` accordingly.
- Use a production SMTP provider and Cloudinary credentials.

### Quick deploy targets
- Render / Railway / Fly.io / Azure App Service / DigitalOcean App Platform — any supports Node apps.

### Render (example)
1. Create a new Web Service, connect repo and branch.
2. Build command: leave empty (we run Node directly).
3. Start command: `npm start`.
4. Environment: set variables from `.env.example` in the Render dashboard.
5. Use MongoDB Atlas connection string for `MONGODB_URI`.

### Railway (example)
1. Create a new Project → Deploy from GitHub.
2. Set `Start Command` to `npm start` and add environment variables.

## Frontend — prepare
- Frontend is in `frontend/`. The production build command is `npm run build` and outputs `dist/`.
- Deploy to Vercel or Netlify (recommended) or serve `dist/` via CDN.

### Vercel (example)
1. Import the `frontend` directory as a new project (set root to `frontend`).
2. Build command: `npm run build`. Output dir: `dist`.
3. Environment: set any public env vars if needed (e.g., API base URL).

### Netlify (example)
1. Connect repo and set base dir to `frontend`.
2. Build command: `npm run build`. Publish directory: `dist`.

## CORS and API base URL
- Set `CORS_ORIGIN` on the backend to the exact frontend URL.
- Configure frontend API base URL (e.g., in `frontend/src/api/axios.js`) to the backend URL.

## Recommended production flow
1. Deploy backend to Render/Railway and set env vars.
2. Deploy frontend to Vercel/Netlify and set API URL to the backend endpoint.
3. Verify HTTPS and correct CORS.

## Simple GitHub Actions ideas
- Frontend: build on push and deploy to Netlify via `netlify/actions/cli` or rely on Vercel integration.
- Backend: build & test on push; either deploy via Render/GitHub integration or build a Docker image and push to registry.

## Health checks & verification
- Backend logs show `MongoDB connected` from startup.
- GET a simple endpoint to confirm: `GET /api/v1/dashboard` (or another public route).

## Next steps I can do for you
- Add example GitHub Actions workflows for frontend and backend.
- Create a `Procfile` or sample `render`/`railway` config.
