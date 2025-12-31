# Frontend App - SociaTrack Application (app.sociatrack.com)

This is the main web application for SociaTrack, deployed at `app.sociatrack.com`.

## Features
- User authentication (email + wallet)
- Dashboard with analytics
- Campaign management
- Attribution tracking
- Billing and subscriptions

## Development


```bash
# Install dependencies
npm install

# Run development server (connects to local backend)
npm run dev

# Build for production
npm run build
```

## Environment Variables

Create `.env.development` for local development:
```
VITE_API_URL=http://localhost:4000
VITE_LANDING_URL=http://localhost:5173
```

Create `.env.production` for production:
```
VITE_API_URL=https://sociatrack-backend-802172403809.us-central1.run.app
VITE_LANDING_URL=https://sociatrack.com
```

## Deployment

This app is deployed to GCP Cloud Run via Cloud Build.

```bash
# Deploy to Cloud Run
gcloud builds submit --config cloudbuild.yaml
```
