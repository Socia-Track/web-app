# SociaTrack Frontend

**Modern React 19 Application** - Built with Vite, TypeScript, and Tailwind CSS v4 for lightning-fast performance.

## Getting Started

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Build and preview:

```bash
npm run build
npm run preview
```

By default, the app runs on **http://localhost:5173**

## 🚀 Tech Stack
- ✅ **React 19** + TypeScript 5
- ✅ **Vite 7** - Lightning-fast HMR and build tool
- ✅ **Tailwind CSS v4** - Modern CSS-based configuration
- ✅ **shadcn/ui** - Beautiful, accessible UI components
- ✅ **Framer Motion** - Smooth animations
- ✅ **React Router v7** - Client-side routing
- ✅ **React Helmet Async** - Document head management
- ✅ **Lucide React** - Modern icon library
- ✅ **Recharts** - Data visualization
- ✅ **Wagmi + RainbowKit** - Web3 wallet connection
- ✅ **TanStack Query** - Server state management

## Project Structure

```
src/
  main.tsx          # React entry point (BrowserRouter + HelmetProvider + ThemeProvider)
  App.tsx           # Routes configuration
  index.css         # TailwindCSS imports and design tokens
  pages/            # All page components
  components/       # Reusable components (includes shadcn/ui)
  compat/           # Lightweight Next.js shims for compatibility
  hooks/            # Custom React hooks
  lib/              # Utilities and configurations
  visual-edits/     # Visual editing tools (Orchids)
```

Assets are served from `/public` directory.

## Routing (React Router v7)
All routing is handled in `src/App.tsx` via React Router DOM. Routes are mapped as follows:

- `/` → Landing page
- `/dashboard` → Dashboard with sidebar
- `/campaigns` → Campaign list
- `/campaigns/new` → Create new campaign
- `/campaigns/:id` → Campaign details
- `/analytics` → Analytics overview
- `/attributions` → Attribution tracking
- `/billing` → Billing & subscriptions
- `/home` → Home page
- `/pricing` → Pricing plans
- `/settings` → User settings
- `/social` → Social posts
- `/tracking` → Live tracking
- `/wallets` → Wallet management

## TailwindCSS v4
- Configuration in `src/index.css` using `@theme` directive
- Dark mode via class strategy (`.dark`)
- Custom design tokens for colors, spacing, and typography
- No `tailwind.config.js` needed (v4 uses CSS-based config)

## Authentication
- Firebase Authentication client-side integration
- Login/Signup modals with role selection (Individual/Organization)
- Session management via localStorage
- Protected routes with authentication checks

## Features
- ⚡ Lightning-fast development with Vite HMR
- 🎨 Fully responsive design with dark mode
- 🔐 Complete authentication system
- 📊 Dashboard with real-time data
- 🎭 Smooth animations with Framer Motion
- 🎯 Type-safe with TypeScript
- 🧩 Modular component architecture
- 📱 Mobile-first responsive design

## API Integration
All API calls are made to backend services (not included in this frontend). API routes under `src/app/api` are legacy Next.js routes and are not used by the Vite frontend.

For full-stack functionality, implement a separate Node.js/Express backend with:
- `/api/campaigns` - Campaign management
- `/api/attributions` - Attribution tracking
- `/api/social-posts` - Social media posts
- `/api/wallets` - Wallet management
- `/api/transactions` - Transaction tracking
- `/api/integrations` - Third-party integrations

## Scripts
```json
{
  "dev": "vite",           // Start development server
  "build": "vite build",   // Build for production
  "preview": "vite preview" // Preview production build
}
```

## Key Differences from Next.js
- ❌ No server-side rendering (SSR)
- ❌ No API routes (use separate backend)
- ❌ No Next.js middleware
- ❌ No `"use client"` directives needed
- ❌ No Next.js Image optimization
- ✅ Pure client-side React application
- ✅ Faster development with Vite
- ✅ Simpler deployment (static hosting)
- ✅ Standard React patterns throughout

## 🚀 Deployment

### Google Cloud Platform (Cloud Run)

The frontend is production-ready for GCP deployment:

```bash
# Build and deploy
cd frontend
gcloud builds submit --config cloudbuild-simple.yaml .
```

**Deployed URLs:**
- **Production**: https://sociatrack-frontend-802172403809.us-central1.run.app
- **Health Check**: https://sociatrack-frontend-802172403809.us-central1.run.app/health

**Features:**
- ✅ Multi-stage Dockerfile (Node.js build + nginx serve)
- ✅ Cloud Build CI/CD pipeline
- ✅ nginx configuration for SPA routing
- ✅ Auto-scaling 0-10 instances
- ✅ 256Mi memory, 1 CPU
- ✅ Health checks and caching

### Alternative Deployments

Build and deploy the `dist` folder to any static hosting:

```bash
npm run build
# Deploy 'dist' folder to: Vercel, Netlify, AWS S3, GitHub Pages, etc.
```

See root `README.md` for complete deployment guide.

## ⚙️ Environment Variables
Create a `.env` file in the `frontend` directory:

```env
# Backend API URL
VITE_API_URL=http://localhost:4000

# For production:
# VITE_API_URL=https://sociatrack-backend-802172403809.us-central1.run.app
```

**Note:** Vite requires `VITE_` prefix for all environment variables to be accessible via `import.meta.env`.

## License
MIT