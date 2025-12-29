import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import VisualEditsMessenger from "@/visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import { Toaster } from "@/components/ui/sonner";

// Landing pages only
import LandingPage from "@/pages/LandingPage";
import PricingPage from "@/pages/PricingPage";

export default function AppLanding() {
  return (
    <>
      <ErrorReporter />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
      <VisualEditsMessenger />
    </>
  );
}
