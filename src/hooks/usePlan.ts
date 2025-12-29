"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";

export type PlanName = "Free" | "Pro" | "Enterprise";

type Limits = {
  maxCampaigns: number; // -1 for unlimited
  attributionWindow: number; // days
  hasAdvancedAi: boolean;
  hasRealtimeMonitoring: boolean;
  hasApiAccess: boolean;
};

type Usage = {
  campaigns_count: number;
};

type UsePlanReturn = {
  planName: PlanName;
  limits: Limits | null;
  usage: Usage | null;
  loading: boolean;
};

const RAW_LIMITS: Record<PlanName, {
  campaigns: number | typeof Infinity;
  attributionWindow: number;
  hasAdvancedAi: boolean;
  hasRealtimeMonitoring: boolean;
  hasApiAccess: boolean;
}> = {
  Free: {
    campaigns: 2,
    attributionWindow: 7,
    hasAdvancedAi: false,
    hasRealtimeMonitoring: false,
    hasApiAccess: false,
  },
  Pro: {
    campaigns: Infinity,
    attributionWindow: 30,
    hasAdvancedAi: true,
    hasRealtimeMonitoring: true,
    hasApiAccess: false,
  },
  Enterprise: {
    campaigns: Infinity,
    attributionWindow: 90,
    hasAdvancedAi: true,
    hasRealtimeMonitoring: true,
    hasApiAccess: true,
  },
};

function mapLimits(plan: PlanName): Limits {
  const src = RAW_LIMITS[plan];
  return {
    maxCampaigns: src.campaigns === Infinity ? -1 : (src.campaigns as number),
    attributionWindow: src.attributionWindow,
    hasAdvancedAi: src.hasAdvancedAi,
    hasRealtimeMonitoring: src.hasRealtimeMonitoring,
    hasApiAccess: src.hasApiAccess,
  };
}

export function usePlan(): UsePlanReturn {
  const { data: session, isPending } = useSession();
  const [planName, setPlanName] = useState<PlanName>("Free");
  const [limits, setLimits] = useState<Limits | null>(mapLimits("Free"));
  const [usage, setUsage] = useState<Usage | null>({ campaigns_count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      if (!session?.user?.uid) {
        setPlanName("Free");
        setLimits(mapLimits("Free"));
        setUsage({ campaigns_count: 0 });
        setLoading(false);
        return;
      }

      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
        const uid = session.user.uid as string;

        const [subRes, usageRes] = await Promise.all([
          fetch(`/api/subscriptions?userId=${uid}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          }),
          fetch(`/api/plan-usage?userId=${uid}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          }),
        ]);

        if (!subRes.ok || !usageRes.ok) {
          setPlanName("Free");
          setLimits(mapLimits("Free"));
          setUsage({ campaigns_count: 0 });
          setLoading(false);
          return;
        }

        const subscriptions = await subRes.json();
        const usageRecords = await usageRes.json();

        const activeSub = Array.isArray(subscriptions)
          ? subscriptions.find((s: any) => s.status === "active" || s.status === "trial")
          : null;

        const effectivePlan: PlanName = activeSub?.planName ?? "Free";
        setPlanName(effectivePlan);
        setLimits(mapLimits(effectivePlan));

        let usageRecord: any = Array.isArray(usageRecords) ? usageRecords[0] : null;
        if (Array.isArray(usageRecords) && activeSub?.planName) {
          usageRecord = usageRecords.find((u: any) => u.planName === activeSub.planName) ?? usageRecord;
        }

        const normalized: Usage = {
          campaigns_count: Math.max(0, Number(usageRecord?.campaignsCount || 0)),
        };
        setUsage(normalized);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error fetching plan:", error);
        setPlanName("Free");
        setLimits(mapLimits("Free"));
        setUsage({ campaigns_count: 0 });
      } finally {
        setLoading(false);
      }
    };

    if (!isPending) {
      fetchPlan();
    }
  }, [session, isPending]);

  return { planName, limits, usage, loading };
}