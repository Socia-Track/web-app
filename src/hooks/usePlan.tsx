"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";

type PlanName = "Free" | "Pro" | "Pro Plus";

export function usePlan() {
  const { data: session, isPending: sessionPending } = useSession();
  const [planName, setPlanName] = useState<PlanName>("Free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      if (sessionPending) return;
      
      if (!session?.user) {
        setPlanName("Free");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("bearer_token");
        const response = await fetch(`/api/subscriptions?userId=${session.user.uid}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const subscriptions = await response.json();
          if (Array.isArray(subscriptions) && subscriptions.length > 0) {
            const activeSubscription = subscriptions.find(
              (sub: any) => sub.status === "active" || sub.status === "trial"
            );
            if (activeSubscription) {
              setPlanName(activeSubscription.planName as PlanName);
            } else {
              setPlanName("Free");
            }
          } else {
            setPlanName("Free");
          }
        } else {
          setPlanName("Free");
        }
      } catch (error) {
        console.error("Error fetching plan:", error);
        setPlanName("Free");
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [session, sessionPending]);

  return { planName, loading };
}

export * from "./usePlan";