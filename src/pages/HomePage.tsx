"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSession } from "@/lib/auth-client"
import DashboardLayout from "@/components/DashboardLayout"
import HeroHeader from "@/components/HeroHeader"
import Section from "@/components/Section"
import MetricCard from "@/components/MetricCard"
import FeatureCard from "@/components/FeatureCard"
import EmptyState from "@/components/EmptyState"
import Highlight from "@/components/Highlight"
import { motion } from "framer-motion"
import {
  Activity,
  TrendingUp,
  DollarSign,
  Target,
  Zap,
  BarChart3,
  MessageSquare,
  Link2,
  Megaphone,
  RefreshCw,
  AlertCircle,
  Plus,
  ArrowRight,
  Image,
  Coins
} from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Campaign {
  id: string
  name: string
  description?: string
  blockchain?: string
  status: string
  campaignType?: string
}

interface KPIs {
  totalAttributions: number
  avgScore: number
  valueUsd: number
  postsCaptured: number
  lastUpdated: Date
}

export default function HomePage() {
  const navigate = useNavigate()
  const { data: session, isPending } = useSession()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [showTypeDialog, setShowTypeDialog] = useState(false)
  const [showLimitDialog, setShowLimitDialog] = useState(false)
  const [userLimits, setUserLimits] = useState<{ currentItems: number; maxItems: number } | null>(null)
  const [kpis, setKpis] = useState<KPIs>({
    totalAttributions: 0,
    avgScore: 0,
    valueUsd: 0,
    postsCaptured: 0,
    lastUpdated: new Date()
  })
  const [attributionsTrend, setAttributionsTrend] = useState<{ value: string; direction: "up" | "down" }>({ value: "+0%", direction: "up" })
  const [valueTrend, setValueTrend] = useState<{ value: string; direction: "up" | "down" }>({ value: "+0%", direction: "up" })

  // Get time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  useEffect(() => {
    if (!isPending && !session?.user) {
      console.log("❌ No session found, redirecting to home")
      navigate("/")
    } else if (session?.user) {
      console.log("✅ User logged in:", session.user.email)
    }
  }, [session, isPending, navigate])

  // Debug effect to watch limit dialog state
  useEffect(() => {
    console.log('🔔 HomePage: showLimitDialog changed to:', showLimitDialog)
    console.log('🔔 HomePage: userLimits:', userLimits)
  }, [showLimitDialog, userLimits])

  const fetchData = async () => {
    if (!session?.user?.uid) return

    setLoading(true)
    setError(null)

    const token = localStorage.getItem("bearer_token")

    if (!token) {
      setError("Authentication token not found. Please log in again.")
      setLoading(false)
      return
    }

    try {
      // Fetch campaigns, tokens, and user limits
      const [campaignsRes, tokensRes, limitsRes] = await Promise.all([
        fetch(`/api/campaigns?limit=100&userId=${session.user.uid}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`/api/tokens?limit=100&userId=${session.user.uid}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`/api/users/${session.user.uid}/limits`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      if (!campaignsRes.ok || !tokensRes.ok) {
        throw new Error("Failed to fetch dashboard data")
      }

      const nftCampaigns = await campaignsRes.json()
      const tokenCampaigns = await tokensRes.json()
      const limitsData = limitsRes.ok ? await limitsRes.json() : null

      console.log('🔍 HomePage: Raw API responses:', {
        nftCampaigns,
        tokenCampaigns,
        limitsData,
        limitsResStatus: limitsRes.status
      })

      // Combine both NFT and token campaigns
      const allCampaigns = [
        ...(Array.isArray(nftCampaigns) ? nftCampaigns.map((c: any) => ({ ...c, campaignType: 'nft' })) : []),
        ...(Array.isArray(tokenCampaigns) ? tokenCampaigns.map((t: any) => ({ ...t, campaignType: 'token' })) : [])
      ]

      setCampaigns(allCampaigns)
      console.log('🔍 HomePage: Total campaigns set:', allCampaigns.length)

      // Check if user has reached their limit and show dialog
      if (limitsData) {
        console.log('📊 HomePage: User Limits Data:', limitsData)
        const currentItems = limitsData.usage?.totalItems || 0
        const maxItems = limitsData.limits?.campaignLimit || 0

        console.log('📊 HomePage: Extracted values - currentItems:', currentItems, 'maxItems:', maxItems)

        setUserLimits({
          currentItems: currentItems,
          maxItems: maxItems
        })

        console.log('🔍 HomePage: Checking limit:', currentItems, '>=', maxItems, '?', currentItems >= maxItems)
        console.log('🔍 HomePage: maxItems > 0?', maxItems > 0)
        console.log('🔍 HomePage: Final condition:', (currentItems >= maxItems && maxItems > 0))

        if (currentItems >= maxItems && maxItems > 0) {
          console.log('⚠️ HomePage: Limit reached! Showing dialog')
          console.log('⚠️ HomePage: About to call setShowLimitDialog(true)')
          setShowLimitDialog(true)
          console.log('⚠️ HomePage: setShowLimitDialog(true) called')
        } else {
          console.log('✅ HomePage: Limit not reached, no dialog')
        }
      } else {
        console.log('❌ HomePage: No limits data received from API')
      }

      // Fetch real transaction data from each campaign's analytics
      let totalTransactions = 0
      let totalValueTracked = 0

      if (Array.isArray(allCampaigns) && allCampaigns.length > 0) {
        console.log('📊 DashboardPage: Fetching analytics for', allCampaigns.length, 'campaigns')

        // OPTIMIZED: Batch fetch all analytics in ONE request instead of looping
        try {
          const campaignIds = allCampaigns.map(c => c.id)
          const batchAnalyticsRes = await fetch('/api/analytics/batch', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ campaignIds })
          })

          if (batchAnalyticsRes.ok) {
            const analyticsData = await batchAnalyticsRes.json()

            // Calculate totals from batch response
            Object.values(analyticsData).forEach((analytics: any) => {
              totalTransactions += analytics.totalAttributions || analytics.totalTransactions || 0
              totalValueTracked += analytics.totalValueUsd || (parseFloat(analytics.totalEth || '0') * 3400) // Use USD value if available, fallback to ETH conversion
            })
          }
        } catch (analyticsError) {
          console.error('Error fetching batch analytics:', analyticsError)
        }
      }

      console.log('✅ DashboardPage: Final metrics:', {
        campaigns: allCampaigns.length,
        totalTransactions,
        totalValueTracked: totalValueTracked.toFixed(2)
      })

      // Calculate trends based on previous week's data
      const lastWeekKey = `kpis_${session.user.uid}_lastweek`
      const lastWeekData = localStorage.getItem(lastWeekKey)

      if (lastWeekData) {
        try {
          const previousKpis = JSON.parse(lastWeekData)
          const weekAgo = new Date(previousKpis.timestamp)
          const daysSince = (Date.now() - weekAgo.getTime()) / (1000 * 60 * 60 * 24)

          // Only use data if it's between 6-8 days old (approximately a week)
          if (daysSince >= 6 && daysSince <= 8) {
            // Calculate attribution trend
            const attrChange = previousKpis.totalAttributions > 0
              ? ((totalTransactions - previousKpis.totalAttributions) / previousKpis.totalAttributions) * 100
              : 0
            setAttributionsTrend({
              value: `${attrChange >= 0 ? '+' : ''}${attrChange.toFixed(1)}%`,
              direction: attrChange >= 0 ? "up" : "down"
            })

            // Calculate value trend
            const valueChange = previousKpis.valueUsd > 0
              ? ((totalValueTracked - previousKpis.valueUsd) / previousKpis.valueUsd) * 100
              : 0
            setValueTrend({
              value: `${valueChange >= 0 ? '+' : ''}${valueChange.toFixed(1)}%`,
              direction: valueChange >= 0 ? "up" : "down"
            })
          }
        } catch (e) {
          console.error('Error parsing previous week data:', e)
        }
      }

      // Store current data for next week's comparison (only if a week has passed)
      const currentDataKey = `kpis_${session.user.uid}_current`
      const currentStoredData = localStorage.getItem(currentDataKey)

      if (currentStoredData) {
        try {
          const storedData = JSON.parse(currentStoredData)
          const daysSinceStore = (Date.now() - new Date(storedData.timestamp).getTime()) / (1000 * 60 * 60 * 24)

          // Move current to lastweek if 7+ days have passed
          if (daysSinceStore >= 7) {
            localStorage.setItem(lastWeekKey, currentStoredData)
            localStorage.setItem(currentDataKey, JSON.stringify({
              totalAttributions: totalTransactions,
              valueUsd: totalValueTracked,
              timestamp: Date.now()
            }))
          }
        } catch (e) {
          console.error('Error updating stored data:', e)
        }
      } else {
        // First time - store current data
        localStorage.setItem(currentDataKey, JSON.stringify({
          totalAttributions: totalTransactions,
          valueUsd: totalValueTracked,
          timestamp: Date.now()
        }))
      }

      setKpis({
        totalAttributions: totalTransactions,
        avgScore: 0,
        valueUsd: totalValueTracked,
        postsCaptured: 0,
        lastUpdated: new Date()
      })

      setLoading(false)
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      setLoading(false)
      toast.error("Failed to load dashboard data")
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchData()
    }
  }, [session])

  const handleRefresh = () => {
    fetchData()
    toast.success("Dashboard refreshed!")
  }

  if (isPending || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Spinner className="mx-auto" />
      </div>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex h-screen items-center justify-center">
          <EmptyState
            icon={<AlertCircle size={64} />}
            title="Error Loading Dashboard"
            description={error}
            action={{
              label: "Try Again",
              onClick: handleRefresh
            }}
          />
        </div>
      </DashboardLayout>
    )
  }

  if (!session?.user) return null

  const activeCampaigns = campaigns.filter(c => c.status === 'active').length
  const totalCampaigns = campaigns.length
  const userName = session.user.displayName || session.user.email?.split('@')[0] || 'User'
  const firstName = userName.split(' ')[0]

  return (
    <DashboardLayout>
      {/* Hero Header with Greeting */}
      <HeroHeader
        title={
          <>
            {getGreeting()}, {firstName} 👋
          </>
        }
        description="Track your social media impact and blockchain attributions in one place. Monitor campaigns with real-time analytics."
        badge="Live Updates"
        icon={
          <div className="p-4 rounded-2xl bg-accent/10">
            <BarChart3 size={48} className="text-accent" />
          </div>
        }
        actions={
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={loading}
              className="border-border hover:bg-muted"
            >
              <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button
              onClick={() => setShowTypeDialog(true)}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Plus size={16} className="mr-2" />
              New Campaign
            </Button>
          </div>
        }
      />

      {/* Key Metrics Section */}
      <Section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold text-foreground mb-3">Key Metrics</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Real-time performance indicators across all your campaigns
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard
            label="Active Campaigns"
            value={activeCampaigns}
            icon={<Target size={24} />}
            trend={{ value: `${totalCampaigns} total`, direction: "up" }}
            subtitle="campaigns running"
            delay={0.1}
          />
          <MetricCard
            label="Total Attributions"
            value={kpis.totalAttributions}
            icon={<Activity size={24} />}
            trend={attributionsTrend}
            subtitle="vs last week"
            delay={0.2}
          />
          <MetricCard
            label="Total Value Tracked"
            value={`$${kpis.valueUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            icon={<DollarSign size={24} />}
            trend={valueTrend}
            subtitle="in transactions"
            delay={0.3}
          />
        </div>
      </Section>

      {/* Campaign Overview Section */}
      <Section background="muted">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-3">Campaign Overview</h2>
              <p className="text-lg text-muted-foreground">
                {totalCampaigns} total campaigns • {activeCampaigns} active
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/campaigns')}
              className="border-border hover:bg-background"
            >
              View All
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </motion.div>

        {campaigns.length === 0 ? (
          <EmptyState
            icon={<Megaphone size={64} />}
            title="No campaigns yet"
            description="Create your first campaign to start tracking attributions and measuring your Web3 marketing ROI"
            action={{
              label: "Create Campaign",
              onClick: () => navigate('/campaigns/new')
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.slice(0, 6).map((campaign, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                onClick={() => navigate(`/campaigns/${campaign.id}`)}
                className="group relative rounded-2xl bg-card p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-border/50 cursor-pointer"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-accent/10">
                      <Megaphone size={24} className="text-accent" />
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${campaign.status === 'active'
                      ? 'bg-green-50/50 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                      }`}>
                      {campaign.status}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
                    {campaign.name}
                  </h3>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {campaign.description || 'No description provided'}
                  </p>

                  {campaign.blockchain && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-accent" />
                      <span className="capitalize">{campaign.blockchain}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Section>

      {/* Quick Actions Section */}
      <Section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-foreground mb-3">Quick Actions</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Jump into the most common tasks and workflows
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<BarChart3 size={32} />}
            title="View Analytics"
            description="Deep dive into campaign performance with detailed analytics and insights"
            action={
              <Button
                variant="outline"
                onClick={() => navigate('/analytics')}
                className="w-full border-border hover:bg-muted"
              >
                Open Analytics
                <ArrowRight size={16} className="ml-2" />
              </Button>
            }
            delay={0.1}
          />

          <FeatureCard
            icon={<Target size={32} />}
            title="View Campaigns"
            description="Manage and monitor all your active and past campaigns"
            action={
              <Button
                variant="outline"
                onClick={() => navigate('/campaigns')}
                className="w-full border-border hover:bg-muted"
              >
                View Campaigns
                <ArrowRight size={16} className="ml-2" />
              </Button>
            }
            delay={0.3}
          />
        </div>
      </Section>

      {/* Campaign Limit Reached Dialog */}
      <Dialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
        <DialogContent className="sm:max-w-md bg-card border">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-full bg-orange-50">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <DialogTitle className="text-foreground text-2xl">Campaign Limit Reached</DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground text-base">
              {userLimits && (
                <span>
                  You've reached your campaign limit ({userLimits.currentItems}/{userLimits.maxItems}).
                  Upgrade your plan to create more campaigns and unlock advanced features.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button
              onClick={() => {
                setShowLimitDialog(false)
                navigate('/pricing')
              }}
              className="bg-accent text-accent-foreground hover:bg-accent/90 w-full"
            >
              Upgrade Plan
            </Button>
            <Button
              onClick={() => setShowLimitDialog(false)}
              variant="outline"
              className="w-full"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Campaign Type Selection Dialog */}
      <Dialog open={showTypeDialog} onOpenChange={setShowTypeDialog}>
        <DialogContent className="sm:max-w-md bg-card border">
          <DialogHeader>
            <DialogTitle className="text-foreground text-2xl">Choose Campaign Type</DialogTitle>
            <DialogDescription className="text-muted-foreground text-base">
              Select the type of campaign you want to create
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {/* NFT Campaign */}
            <button
              onClick={() => {
                setShowTypeDialog(false)
                navigate('/campaigns/new-nft')
              }}
              className="group p-6 rounded-xl border border-border bg-card hover:bg-muted transition-all"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 rounded-full bg-purple-50 group-hover:bg-purple-100 transition-colors">
                  <Image className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-center">
                  <h3 className="text-foreground font-semibold mb-1">NFT Campaign</h3>
                  <p className="text-muted-foreground text-sm">Track NFT collection or single NFT purchases</p>
                </div>
              </div>
            </button>

            {/* Token Campaign */}
            <button
              onClick={() => {
                setShowTypeDialog(false)
                navigate('/campaigns/new-token')
              }}
              className="group p-6 rounded-xl border border-border bg-card hover:bg-muted transition-all"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors">
                  <Coins className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-center">
                  <h3 className="text-foreground font-semibold mb-1">Token Campaign</h3>
                  <p className="text-muted-foreground text-sm">Track ERC20 token purchases on DEX</p>
                </div>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  )
}