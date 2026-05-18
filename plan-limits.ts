/**
 * Plan Limits - Re-export for backward compatibility
 * Frontend and backend code is now organized in separate folders:
 * - src/backend/ contains business logic, services, validators
 * - src/frontend/ contains UI components, hooks, utilities
 * - src/app/api/ contains thin API route controllers
 * 
 * See ARCHITECTURE.md for detailed documentation
 */

/**
 * Plan Limits Configuration
 */
export const PLAN_LIMITS = {
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
} as const;

export type PlanName = keyof typeof PLAN_LIMITS;

/**
 * Check if user can perform an action based on their plan limits
 */
export async function checkPlanLimit(
  userId: string,
  action: "campaigns",
  token: string
): Promise<{ allowed: boolean; message?: string; currentUsage?: any }> {
  try {
    // Fetch user's current subscription and usage
    const [subResponse, usageResponse] = await Promise.all([
      fetch(`/api/subscriptions?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`/api/plan-usage?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    if (!subResponse.ok || !usageResponse.ok) {
      return { allowed: false, message: "Failed to fetch plan information" };
    }

    const subscriptions = await subResponse.json();
    const usageRecords = await usageResponse.json();

    // Get the most recent active subscription
    const activeSub = Array.isArray(subscriptions)
      ? subscriptions.find((sub: any) => sub.status === "active" || sub.status === "trial")
      : null;

    if (!activeSub) {
      return { allowed: false, message: "No active subscription found" };
    }

    // Get the corresponding usage record
    const usage = Array.isArray(usageRecords)
      ? usageRecords.find((u: any) => u.planName === activeSub.planName)
      : null;

    if (!usage) {
      return { allowed: false, message: "Usage record not found" };
    }

    const planName = activeSub.planName as PlanName;
    const limits = PLAN_LIMITS[planName];

    // Check if action is allowed
    if (action === "campaigns") {
      const currentCount = usage.campaignsCount || 0;
      const allowed = currentCount < limits.campaigns;
      return {
        allowed,
        message: allowed
          ? undefined
          : `You've reached the ${planName} plan limit of ${limits.campaigns} campaigns. Please upgrade to create more.`,
        currentUsage: { current: currentCount, limit: limits.campaigns, planName },
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error("Plan limit check error:", error);
    return { allowed: false, message: "Error checking plan limits" };
  }
}

/**
 * Increment usage counter after an action is performed
 */
export async function incrementUsage(
  userId: string,
  action: "campaigns",
  token: string
): Promise<boolean> {
  try {
    // Get current usage
    const usageResponse = await fetch(`/api/plan-usage?userId=${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!usageResponse.ok) {
      return false;
    }

    const usageRecords = await usageResponse.json();
    const usage = Array.isArray(usageRecords) ? usageRecords[0] : null;

    if (!usage) {
      return false;
    }

    // Increment the counter
    const updates: any = {};
    if (action === "campaigns") {
      updates.campaignsCount = (usage.campaignsCount || 0) + 1;
    }

    const updateResponse = await fetch(`/api/plan-usage?id=${usage.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    return updateResponse.ok;
  } catch (error) {
    console.error("Usage increment error:", error);
    return false;
  }
}

/**
 * Decrement usage counter when an item is deleted
 */
export async function decrementUsage(
  userId: string,
  action: "campaigns",
  token: string
): Promise<boolean> {
  try {
    // Get current usage
    const usageResponse = await fetch(`/api/plan-usage?userId=${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!usageResponse.ok) {
      return false;
    }

    const usageRecords = await usageResponse.json();
    const usage = Array.isArray(usageRecords) ? usageRecords[0] : null;

    if (!usage) {
      return false;
    }

    // Decrement the counter (don't go below 0)
    const updates: any = {};
    if (action === "campaigns") {
      updates.campaignsCount = Math.max(0, (usage.campaignsCount || 0) - 1);
    }

    const updateResponse = await fetch(`/api/plan-usage?id=${usage.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    return updateResponse.ok;
  } catch (error) {
    console.error("Usage decrement error:", error);
    return false;
  }
}

/**
 * Get user's current plan information
 */
export async function getCurrentPlan(userId: string, token: string) {
  try {
    const [subResponse, usageResponse] = await Promise.all([
      fetch(`/api/subscriptions?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`/api/plan-usage?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    if (!subResponse.ok || !usageResponse.ok) {
      return null;
    }

    const subscriptions = await subResponse.json();
    const usageRecords = await usageResponse.json();

    const activeSub = Array.isArray(subscriptions)
      ? subscriptions.find((sub: any) => sub.status === "active" || sub.status === "trial")
      : null;

    const usage = Array.isArray(usageRecords)
      ? usageRecords.find((u: any) => u.planName === activeSub?.planName)
      : null;

    if (!activeSub || !usage) {
      return null;
    }

    const planName = activeSub.planName as PlanName;
    const limits = PLAN_LIMITS[planName];

    return {
      subscription: activeSub,
      usage,
      limits,
      planName,
    };
  } catch (error) {
    console.error("Get current plan error:", error);
    return null;
  }
}