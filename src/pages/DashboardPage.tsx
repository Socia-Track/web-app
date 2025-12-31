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
  ArrowRight
} from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

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

export default function DashboardPage() {
  const navigate = useNavigate()
  const { data: session, isPending } = useSession()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [kpis, setKpis] = useState<KPIs>({
    totalAttributions: 0,
    avgScore: 0,
    valueUsd: 0,
    postsCaptured: 0,
    lastUpdated: new Date()
  })

  useEffect(() => {
    if (!isPending && !session?.user) {
      console.log("❌ No session found, redirecting to home")
      navigate("/")
    } else if (session?.user) {
      console.log("✅ User logged in:", session.user.email)
    }
  }, [session, isPending, navigate])

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
      const [campaignsRes, tokensRes, attributionsRes, postsRes] = await Promise.all([
        fetch(`/api/campaigns?limit=100&userId=${session.user.uid}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`/api/tokens?limit=100&userId=${session.user.uid}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/attributions?limit=1000', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/social-posts?limit=1000', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      if (!campaignsRes.ok || !tokensRes.ok || !attributionsRes.ok || !postsRes.ok) {
        throw new Error("Failed to fetch dashboard data")
      }

      const nftCampaigns = await campaignsRes.json()
      const tokenCampaigns = await tokensRes.json()
      const attributions = await attributionsRes.json()
      const posts = await postsRes.json()

      // Combine both NFT and token campaigns
      const allCampaigns = [
        ...(Array.isArray(nftCampaigns) ? nftCampaigns.map((c: any) => ({ ...c, campaignType: 'nft' })) : []),
        ...(Array.isArray(tokenCampaigns) ? tokenCampaigns.map((t: any) => ({ ...t, campaignType: 'token' })) : [])
      ]

      setCampaigns(allCampaigns)

      const avgScore = Array.isArray(attributions) && attributions.length > 0
        ? attributions.reduce((sum: number, a: any) => sum + (a.confidenceScore || 0), 0) / attributions.length
        : 0

      const totalValue = Array.isArray(attributions)
        ? attributions.reduce((sum: number, a: any) => {
          const valueStr = a.transaction?.value || a.valueUsd || "0"
          const value = parseFloat(valueStr.toString().split(" ")[0])
          return sum + (isNaN(value) ? 0 : value)
        }, 0)
        : 0

      setKpis({
        totalAttributions: Array.isArray(attributions) ? attributions.length : 0,
        avgScore: Math.round(avgScore),
        valueUsd: totalValue,
        postsCaptured: Array.isArray(posts) ? posts.length : 0,
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

  return (
    <DashboardLayout>
      {/* Hero Header */}
      <HeroHeader
        title={
          <>
            Your <Highlight>Campaign Performance</Highlight>
          </>
        }
        description="Track, analyze, and optimize your Web3 marketing campaigns with real-time blockchain attribution analytics"
        badge="Live Dashboard"
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
              onClick={() => navigate('/campaigns/new')}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            label="Total Attributions"
            value={kpis.totalAttributions}
            icon={<Target size={24} />}
            trend={{ value: "+12.5%", direction: "up" }}
            subtitle="vs last week"
            delay={0.1}
          />
          <MetricCard
            label="Avg Confidence Score"
            value={`${kpis.avgScore}%`}
            icon={<TrendingUp size={24} />}
            trend={{ value: "+5.2%", direction: "up" }}
            subtitle="attribution accuracy"
            delay={0.2}
          />
          <MetricCard
            label="Total Value Tracked"
            value={`$${kpis.valueUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            icon={<DollarSign size={24} />}
            trend={{ value: "+23.1%", direction: "up" }}
            subtitle="in transactions"
            delay={0.3}
          />
          <MetricCard
            label="Social Posts Captured"
            value={kpis.postsCaptured}
            icon={<MessageSquare size={24} />}
            trend={{ value: "+8.7%", direction: "up" }}
            subtitle="across platforms"
            delay={0.4}
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
            icon={<Link2 size={32} />}
            title="Manage Links"
            description="Create and track attribution links across all your social platforms"
            action={
              <Button
                variant="outline"
                onClick={() => navigate('/tracking')}
                className="w-full border-border hover:bg-muted"
              >
                Manage Links
                <ArrowRight size={16} className="ml-2" />
              </Button>
            }
            delay={0.2}
          />

          <FeatureCard
            icon={<Activity size={32} />}
            title="Social Attribution"
            description="Monitor social media posts and their impact on blockchain transactions"
            action={
              <Button
                variant="outline"
                onClick={() => navigate('/social')}
                className="w-full border-border hover:bg-muted"
              >
                View Social
                <ArrowRight size={16} className="ml-2" />
              </Button>
            }
            delay={0.3}
          />
        </div>
      </Section>

    </DashboardLayout>
  )
}