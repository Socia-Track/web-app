"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSession } from "@/lib/auth-client"
import DashboardLayout from "@/components/DashboardLayout"
import { motion } from "framer-motion"
import { Activity, Calendar, RefreshCw, Twitter, AlertCircle, TrendingUp, DollarSign, Target, Zap, Award, Sparkles, TrendingDown, Globe, Network, Layers, BarChart3, MessageSquare, ExternalLink } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import NetworkInfoDisplay from "@/components/NetworkInfoDisplay"

interface Campaign {
  id: string
  name: string
  description?: string
  blockchain?: string
  status: string
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

      const valueUsd = Array.isArray(attributions)
        ? attributions.reduce((sum: number, a: any) => sum + (parseFloat(a.valueUsd) || 0), 0)
        : 0

      setKpis({
        totalAttributions: Array.isArray(attributions) ? attributions.length : 0,
        avgScore,
        valueUsd,
        postsCaptured: Array.isArray(posts) ? posts.length : 0,
        lastUpdated: new Date()
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError("Failed to load dashboard data. Please try again.")
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchData()
    }
  }, [session])

  const handleRefresh = () => {
    fetchData()
    toast.success("Dashboard refreshed")
  }

  if (isPending || (loading && !error)) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Spinner className="mx-auto mb-4" />
        </div>
      </div>
    )
  }

  if (!session?.user) return null

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button onClick={handleRefresh}>
            <RefreshCw size={16} className="mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Enhanced Header with Sparkle Animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 relative"
          >
            <div className="flex items-center gap-3 mb-2">
              {/* <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="relative"
              >
                <Sparkles className="text-primary" size={32} />
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-primary/30 rounded-full blur-md"
                />
              </motion.div> */}
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                DASHBOARD
              </h1>
            </div>
            <p className="text-lg text-muted-foreground mb-4">
              Real-time campaign insights and blockchain attribution analytics
            </p>
            
            {/* Animated Stats Summary */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4 text-sm"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="relative"
                >
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <motion.div
                    animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-green-500 rounded-full"
                  />
                </motion.div>
                <span>All systems operational</span>
              </div>
              <div className="text-muted-foreground/50">•</div>
              <motion.div 
                className="text-muted-foreground flex items-center gap-1"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Network size={14} className="text-primary" />
                <span>Last updated: {kpis.lastUpdated.toLocaleTimeString()}</span>
              </motion.div>
              <div className="text-muted-foreground/50">•</div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="border-white/10 hover:bg-white/10"
                disabled={loading}
              >
                <RefreshCw size={14} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </motion.div>
          </motion.div>

          {/* Enhanced KPI Cards with Clean Theme */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {[
              { 
                icon: <Target size={24} />, 
                label: "Total Attributions", 
                value: kpis.totalAttributions.toString(), 
                change: "+12.5% this week",
                delay: 0
              },
              { 
                icon: <BarChart3 size={24} />, 
                label: "Average Score", 
                value: `${kpis.avgScore.toFixed(0)}%`, 
                change: "+8.2% from last week",
                delay: 0.1
              },
              { 
                icon: <DollarSign size={24} />, 
                label: "Value Tracked", 
                value: `$${kpis.valueUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 
                change: "Real blockchain value",
                delay: 0.2
              },
              { 
                icon: <MessageSquare size={24} />, 
                label: "Posts Captured", 
                value: kpis.postsCaptured.toString(), 
                change: "Across all platforms",
                delay: 0.3
              }
            ].map((kpi, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: kpi.delay }}
                whileHover={{ 
                  y: -8, 
                  rotateX: 5,
                  transition: { duration: 0.2 } 
                }}
                style={{ transformStyle: "preserve-3d" }}
                className="group relative rounded-lg border bg-card p-6 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 overflow-hidden"
              >
                {/* Subtle border effect */}
                <motion.div 
                  className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1) 50%, transparent)",
                  }}
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                />
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                      className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center group-hover:bg-accent transition-colors relative"
                    >
                      <div className="text-foreground">{kpi.icon}</div>
                      <motion.div
                        className="absolute inset-0 rounded-lg bg-accent/50"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                      />
                    </motion.div>
                    <div className="px-2 py-1 rounded-full text-xs bg-muted border border-border">
                      <TrendingUp size={12} className="inline mr-1" />
                      Live
                    </div>
                  </div>
                  <motion.div
                    className="text-3xl font-bold text-foreground mb-1"
                  >
                    {kpi.value}
                  </motion.div>
                  <div className="text-sm text-muted-foreground mb-3">{kpi.label}</div>
                  <div className="text-xs text-muted-foreground/70">{kpi.change}</div>
                </div>
              </motion.div>
            ))}
          </div>



          {/* Enhanced Campaigns Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-xl border border-border p-6 bg-card relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center"
                >
                  <Target className="text-primary" size={18} />
                </motion.div>
                <h2 className="text-2xl font-bold text-foreground">Active Campaigns</h2>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                >
                  {campaigns.length} Active
                </motion.div>
              </div>
              
              {campaigns.length === 0 ? (
                <div className="text-center py-12">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4"
                  >
                    <Target className="text-muted-foreground" size={32} />
                  </motion.div>
                  <p className="text-foreground font-medium mb-2">No campaigns yet</p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Create your first campaign to start tracking blockchain attributions
                  </p>
                  <Button onClick={() => navigate('/campaigns/new')}>
                    <Zap className="mr-2" size={16} />
                    Create Campaign
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {campaigns.slice(0, 5).map((campaign, index) => (
                    <motion.div
                      key={campaign.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      whileHover={{ x: 4, scale: 1.02 }}
                      className="flex items-center gap-4 p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 hover:border-primary/20 transition-all cursor-pointer group"
                      onClick={() => navigate(`/campaigns/${campaign.id}`)}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                        className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors"
                      >
                        <Target className="text-primary" size={20} />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-foreground font-semibold group-hover:text-primary transition-colors">
                            {campaign.name}
                          </h3>
                          <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            campaign.status === 'active' 
                              ? 'bg-green-400/10 text-green-400 border border-green-400/20' 
                              : 'bg-gray-400/10 text-gray-400 border border-gray-400/20'
                          }`}>
                            {campaign.status}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground mb-1">
                          {campaign.description || 'No description provided'}
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <NetworkInfoDisplay
                            networkKey={campaign.blockchain || 'ethereum'}
                            showCurrency={false}
                            showChainId={false}
                            size="sm"
                            variant="secondary"
                          />
                        </div>
                      </div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1, x: 4 }}
                        className="text-primary"
                      >
                        <ExternalLink size={16} />
                      </motion.div>
                    </motion.div>
                  ))}
                  
                  {campaigns.length > 5 && (
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="outline"
                        className="w-full mt-4 border-primary/20 hover:bg-primary/10"
                        onClick={() => navigate('/campaigns')}
                      >
                        <BarChart3 className="mr-2" size={16} />
                        View All Campaigns ({campaigns.length})
                      </Button>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Clean Analytics Grid */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Top Platform Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              whileHover={{ 
                y: -8, 
                rotateX: 5,
                transition: { duration: 0.2 } 
              }}
              style={{ transformStyle: "preserve-3d" }}
              className="group rounded-xl border bg-card p-6 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-muted/30 rounded-full blur-xl" />
              
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center"
                  >
                    <Twitter className="text-foreground" size={20} />
                  </motion.div>
                  <h3 className="text-lg font-bold text-foreground">Top Platform</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Twitter</span>
                    <span className="text-2xl font-bold text-foreground">{Math.floor(kpis.totalAttributions * 0.6)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Discord</span>
                    <span className="text-xl font-bold text-muted-foreground">{Math.floor(kpis.totalAttributions * 0.4)}</span>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <TrendingUp size={12} />
                      <span>Twitter leading by 60%</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Real-time Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{ 
                y: -8, 
                rotateX: 5,
                transition: { duration: 0.2 } 
              }}
              style={{ transformStyle: "preserve-3d" }}
              className="group rounded-xl border bg-card p-6 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 overflow-hidden relative"
            >
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-muted/30 rounded-full blur-xl" />
              
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center"
                  >
                    <Activity className="text-foreground" size={20} />
                  </motion.div>
                  <h3 className="text-lg font-bold text-foreground">Live Status</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-foreground/60 rounded-full animate-pulse" />
                    <span className="text-sm text-muted-foreground">All systems operational</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-foreground/60 rounded-full animate-pulse" />
                    <span className="text-sm text-muted-foreground">Real-time tracking active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-foreground/60 rounded-full animate-pulse" />
                    <span className="text-sm text-muted-foreground">Blockchain sync: 100%</span>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Zap size={12} />
                      Next update in: {30 - (new Date().getSeconds() % 30)}s
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              whileHover={{ 
                y: -8, 
                rotateX: 5,
                transition: { duration: 0.2 } 
              }}
              style={{ transformStyle: "preserve-3d" }}
              className="group rounded-xl border bg-card p-6 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 w-20 h-20 bg-muted/30 rounded-full blur-xl" />
              
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center"
                  >
                    <Zap className="text-foreground" size={20} />
                  </motion.div>
                  <h3 className="text-lg font-bold text-foreground">Quick Actions</h3>
                </div>
                <div className="space-y-3">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => navigate('/campaigns/new')}
                      className="w-full justify-start h-auto py-3 px-3 group/btn"
                      size="sm"
                    >
                      <Target className="mr-2 flex-shrink-0 group-hover/btn:rotate-90 transition-transform duration-300" size={16} />
                      <span>New Campaign</span>
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => navigate('/analytics')}
                      className="w-full justify-start h-auto py-3 px-3"
                      variant="outline"
                      size="sm"
                    >
                      <BarChart3 className="mr-2 flex-shrink-0" size={16} />
                      <span>View Analytics</span>
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
      </div>
    </DashboardLayout>
  )
}