import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { Web3Providers } from "@/components/Web3Providers";
import { isAdminSubdomain } from "@/lib/subdomain-utils";

// Pages
import AuthPage from "@/pages/AuthPage";
import HomePage from "@/pages/HomePage";
import DashboardPage from "@/pages/DashboardPage";
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

export default function App() {
  const LANDING_URL = import.meta.env.VITE_LANDING_URL || 'https://sociatrack.com';
  const isAdminDomain = isAdminSubdomain();
  
  // If on admin subdomain, only show admin routes
  if (isAdminDomain) {
    return (
      <Web3Providers>
        <Routes>
          <Route path="/" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/users/:userId" element={<UserDetailsPage />} />
          {/* Redirect all other routes to admin login on admin subdomain */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </Web3Providers>
    );
  }
  
  // Regular app routes for main domain
  return (
    <Web3Providers>
      <Routes>
        {/* Redirect root to dashboard or landing based on auth */}
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/campaigns/new" element={<NewCampaignPage />} />
        <Route path="/campaigns/new-nft" element={<NewCampaignPage />} />
        <Route path="/campaigns/new-token" element={<TokenCampaignPage />} />
        <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/attributions" element={<AttributionsPage />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/home" element={<HomePage />} />
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
      <Toaster />
    </Web3Providers>
  );
}
