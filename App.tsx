import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { isAdminSubdomain } from "@/lib/subdomain-utils";

// Pages
import AuthPage from "@/pages/AuthPage";
import HomePage from "@/pages/HomePage";
import CampaignsPage from "@/pages/CampaignsPage";
import NewCampaignPage from "@/pages/NewCampaignPage";
import TokenCampaignPage from "@/pages/TokenCampaignPage";
import CampaignDetailPage from "@/pages/CampaignDetailPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import AttributionsPage from "@/pages/AttributionsPage";
import BillingPage from "@/pages/BillingPage";
import PricingPage from "@/pages/PricingPage";
import SettingsPage from "@/pages/SettingsPage";
import SocialPage from "@/pages/SocialPage";
import TrackingPage from "@/pages/TrackingPage";
import WalletConnectionPage from "@/pages/WalletConnectionPage";
import { MobileWalletPage } from "@/pages/MobileWalletPage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import AdminPage from "@/pages/AdminPage";
import UserDetailsPage from "@/pages/UserDetailsPage";

// Lazy load Web3 providers only when needed
const Web3Providers = React.lazy(() => 
  import("@/components/Web3Providers").then(module => ({ 
    default: module.Web3Providers 
  }))
);

export default function App() {
  const LANDING_URL = import.meta.env.VITE_LANDING_URL || 'https://sociatrack.com';
  const isAdminDomain = isAdminSubdomain();
  const location = useLocation();
  
  // Routes that require Web3 providers
  const web3Routes = ['/connect-wallet', '/mobile-wallet'];
  const needsWeb3 = web3Routes.includes(location.pathname);
  
  // If on admin subdomain, only show admin routes (without any Web3 providers)
  if (isAdminDomain) {
    return (
      <>
        <Routes>
          <Route path="/" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/users/:userId" element={<UserDetailsPage />} />
          {/* Redirect all other routes to admin login on admin subdomain */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </>
    );
  }
  
  // Regular app routes - only load Web3 when accessing wallet pages
  const appRoutes = (
    <Routes>
      {/* Root route - Home Page */}
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/dashboard" element={<HomePage />} />
      <Route path="/campaigns" element={<CampaignsPage />} />
      <Route path="/campaigns/new" element={<NewCampaignPage />} />
      <Route path="/campaigns/new-nft" element={<NewCampaignPage />} />
      <Route path="/campaigns/new-token" element={<TokenCampaignPage />} />
      <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/attributions" element={<AttributionsPage />} />
      <Route path="/billing" element={<BillingPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/social" element={<SocialPage />} />
      <Route path="/tracking" element={<TrackingPage />} />
      <Route path="/connect-wallet" element={<WalletConnectionPage />} />
      <Route path="/mobile-wallet" element={<MobileWalletPage />} />
      {/* Admin routes available on app.sociatrack.com */}
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/users/:userId" element={<UserDetailsPage />} />
      {/* Redirect unknown routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );

  // Only wrap with Web3Providers if on a wallet page
  if (needsWeb3) {
    return (
      <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading Web3...</div>}>
        <Web3Providers>
          {appRoutes}
          <Toaster />
        </Web3Providers>
      </React.Suspense>
    );
  }

  // Fast load for non-wallet pages
  return (
    <>
      {appRoutes}
      <Toaster />
    </>
  );
}
