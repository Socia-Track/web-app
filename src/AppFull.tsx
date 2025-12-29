import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import VisualEditsMessenger from "@/visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import { Toaster } from "@/components/ui/sonner";
import { Web3Providers } from "@/components/Web3Providers";

// Application pages (authenticated routes)
import AuthPage from "@/pages/AuthPage";
import DashboardPage from "@/pages/DashboardPage";
import CampaignsPage from "@/pages/CampaignsPage";
import NewCampaignPage from "@/pages/NewCampaignPage";
import CampaignDetailPage from "@/pages/CampaignDetailPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import AttributionsPage from "@/pages/AttributionsPage";
import BillingPage from "@/pages/BillingPage";
import HomePage from "@/pages/HomePage";
import PricingPage from "@/pages/PricingPage";
import SettingsPage from "@/pages/SettingsPage";
import SocialPage from "@/pages/SocialPage";
import TrackingPage from "@/pages/TrackingPage";
import WalletConnectionPage from "@/pages/WalletConnectionPage";
import { MobileWalletPage } from "@/pages/MobileWalletPage";
import AdminPage from "@/pages/AdminPage";
import UserDetailsPage from "@/pages/UserDetailsPage";

export default function AppFull() {
  return (
    <Web3Providers>
      <ErrorReporter />
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/campaigns/new" element={<NewCampaignPage />} />
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
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/users/:userId" element={<UserDetailsPage />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
      <Toaster />
      <VisualEditsMessenger />
    </Web3Providers>
  );
}
