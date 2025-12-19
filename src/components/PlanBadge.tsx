"use client";

import { usePlan } from "@/hooks/usePlan";
import { Badge } from "@/components/ui/badge";
import { Crown, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function PlanBadge() {
  const { planName, loading } = usePlan();

  if (loading || !planName) {
    return null;
  }

  const planIcons: Record<string, JSX.Element | null> = {
    Free: null,
    Pro: <Zap className="w-3 h-3" />,
    Enterprise: <Crown className="w-3 h-3" />,
  };

  const planColors: Record<string, string> = {
    Free: "bg-gray-600/20 text-gray-300 border-gray-600/30",
    Pro: "bg-blue-600/20 text-blue-300 border-blue-600/30",
    Enterprise: "bg-purple-600/20 text-purple-300 border-purple-600/30",
  };

  return (
    <Link to="/pricing">
      <Badge
        variant="outline"
        className={`flex items-center gap-1.5 ${planColors[planName]} hover:opacity-80 transition-opacity cursor-pointer`}
      >
        {planIcons[planName]}
        <span className="text-xs font-semibold">{planName}</span>
      </Badge>
    </Link>
  );
}