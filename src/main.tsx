import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import "./index.css";

// Conditionally load the appropriate App based on build type
const buildType = import.meta.env.VITE_BUILD_TYPE || 'app';
const AppComponent = buildType === 'landing' 
  ? React.lazy(() => import("./AppLanding"))
  : React.lazy(() => import("./AppFull"));

// Force dark mode on app load
document.documentElement.classList.add("dark");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
        <BrowserRouter>
          <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <AppComponent />
          </React.Suspense>
        </BrowserRouter>
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>
);