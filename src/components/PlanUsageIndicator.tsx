"use client";

import { usePlan } from "@/hooks/usePlan";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpCircle, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

export default function PlanUsageIndicator() {
  const { usage, limits, planName, loading } = usePlan();

  if (loading || !usage || !limits) {
    return null;
  }

  const campaignsPercentage = limits.maxCampaigns === -1 
    ? 0 
    : (usage.campaigns_count / limits.maxCampaigns) * 100;
  
  const isNearLimit = campaignsPercentage >= 80;

  return (
    <Card className="p-6 border-white/10 bg-gradient-to-b from-white/5 to-black/50">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Plan Usage</h3>
          <p className="text-sm text-gray-400">
            Current Plan: <span className="font-semibold text-white">{planName}</span>
          </p>
        </div>
        {isNearLimit && (
          <Link to="/pricing">
            <Button size="sm" variant="outline">
              <ArrowUpCircle className="w-4 h-4 mr-2" />
              Upgrade
            </Button>
          </Link>
        )}
      </div>

      <div className="space-y-4">
        {/* Campaigns Usage */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Campaigns</span>
            <span className="text-sm font-semibold">
              {usage.campaigns_count} / {limits.maxCampaigns === -1 ? "∞" : limits.maxCampaigns}
            </span>
          </div>
          {limits.maxCampaigns !== -1 && (
            <Progress 
              value={campaignsPercentage} 
              className="h-2"
            />
          )}
        </div>

        {/* Feature Access */}
        <div className="pt-2 border-t border-white/10">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${limits.hasAdvancedAi ? "bg-green-400" : "bg-gray-600"}`} />
              <span className={limits.hasAdvancedAi ? "text-gray-300" : "text-gray-600"}>
                Advanced AI
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${limits.hasRealtimeMonitoring ? "bg-green-400" : "bg-gray-600"}`} />
              <span className={limits.hasRealtimeMonitoring ? "text-gray-300" : "text-gray-600"}>
                Real-time Monitoring
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${limits.hasApiAccess ? "bg-green-400" : "bg-gray-600"}`} />
              <span className={limits.hasApiAccess ? "text-gray-300" : "text-gray-600"}>
                API Access
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-gray-300">
                {limits.attributionWindow}-day window
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}