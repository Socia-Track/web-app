/**
 * Trend utilities — fetches real data-driven trends from the backend.
 *
 * The backend compares the last 6 days vs the previous 6 days (days 7-12)
 * using actual timestamped Transaction / Attribution records.
 */

export interface TrendInfo {
  value: string
  direction: "up" | "down"
}

export interface TrendsResponse {
  period: string
  attributions: TrendInfo
  value: TrendInfo
  transactions: TrendInfo
  confidence?: TrendInfo
}

const DEFAULT_TREND: TrendInfo = { value: "+0%", direction: "up" }

/**
 * Fetch aggregate trends for all user campaigns (HomePage / DashboardPage).
 */
export async function fetchTrends(token: string): Promise<TrendsResponse> {
  try {
    const res = await fetch("/api/analytics/trends", {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (e) {
    console.error("fetchTrends error:", e)
    return {
      period: "6 days",
      attributions: DEFAULT_TREND,
      value: DEFAULT_TREND,
      transactions: DEFAULT_TREND,
    }
  }
}

/**
 * Fetch per-campaign trends (CampaignDetailPage).
 */
export async function fetchCampaignTrends(
  token: string,
  campaignId: string
): Promise<TrendsResponse> {
  try {
    const res = await fetch(`/api/analytics/trends?campaignId=${campaignId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (e) {
    console.error("fetchCampaignTrends error:", e)
    return {
      period: "6 days",
      attributions: DEFAULT_TREND,
      value: DEFAULT_TREND,
      transactions: DEFAULT_TREND,
      confidence: DEFAULT_TREND,
    }
  }
}
