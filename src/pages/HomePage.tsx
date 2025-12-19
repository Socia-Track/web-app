"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import DashboardLayout from "@/components/DashboardLayout"
import { 
  Target, 
  TrendingUp, 
  ArrowRight, 
  Calendar,
  Activity,
  DollarSign,
  Plus,
  BarChart3,
  Zap,
  Award,
  TrendingDown,
  Globe,
  Network,
  Layers
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSession } from "@/lib/auth-client"
import { usePlan } from "@/hooks/usePlan"

// Animated counter component
function AnimatedCounter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, Math.round)
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const animation = animate(count, value, { duration: 1.5 })
    const unsubscribe = rounded.on("change", (latest) => setDisplayValue(latest))
    return () => {
      animation.stop()
      unsubscribe()
    }
  }, [value, count, rounded])

  return <span>{prefix}{displayValue.toLocaleString()}{suffix}</span>
}



// Mini chart visualization
function MiniChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1)
  const normalized = data.map(v => (v / max) * 100)
  
  return (
    <div className="flex items-end gap-1 h-12">
      {normalized.map((height, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${height}%` }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          className="flex-1 bg-primary/20 rounded-t"
        />
      ))}
    </div>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const { data: session, isPending } = useSession()
  const { planName, limits, usage, loading: planLoading } = usePlan()
  const [stats, setStats] = useState({
    campaigns: 0,
    attributions: 0,
    totalValue: 0,
    recentActivity: [] as any[]
  })
  const [loading, setLoading] = useState(true)
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)

  // Get time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  useEffect(() => {
    // Wait a bit before checking auth to allow session to propagate
    const timer = setTimeout(() => {
      setHasCheckedAuth(true)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!hasCheckedAuth) return
    
    if (!isPending && !session?.user) {
      console.log("❌ HomePage: No session found, redirecting to landing page")
      navigate("/")
    } else if (session?.user) {
      console.log("✅ HomePage: User logged in:", session.user.email)
    }
  }, [session, isPending, navigate, hasCheckedAuth])

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user) return
      
      const token = localStorage.getItem("bearer_token")
      try {
        // Fetch campaigns first
        const campaignsRes = await fetch('/api/campaigns?limit=100', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const campaigns = await campaignsRes.json()

        // Fetch real transaction data from each campaign's analytics
        const allRecentActivity = []
        let totalTransactions = 0
        let totalValueTracked = 0

        if (Array.isArray(campaigns) && campaigns.length > 0) {
          console.log('🏠 HomePage: Fetching analytics for', campaigns.length, 'campaigns')
          
          // Get analytics data for each campaign
          for (const campaign of campaigns.slice(0, 5)) { // Limit to 5 campaigns for performance
            try {
              const analyticsRes = await fetch(`/api/analytics/campaign/${campaign.id}`, {
                headers: { Authorization: `Bearer ${token}` }
              })
              const analytics = await analyticsRes.json()
              
              console.log(`📊 Analytics for campaign ${campaign.name}:`, {
                totalTransactions: analytics.totalTransactions,
                totalEth: analytics.totalEth,
                recentTransactions: analytics.recentTransactions?.length || 0
              })

              // Add recent transactions as activities
              if (analytics.recentTransactions && analytics.recentTransactions.length > 0) {
                const campaignActivities = analytics.recentTransactions.slice(0, 2).map((tx: any) => ({
                  id: `tx-${tx.id}`,
                  type: 'nft_purchase',
                  title: 'NFT Purchase Detected',
                  description: `${tx.walletAddress?.slice(0, 8)}...${tx.walletAddress?.slice(-4)} purchased ${tx.tokenId ? `Token #${tx.tokenId}` : 'NFT'}`,
                  valueUsd: (parseFloat(tx.amount || tx.nftValue || 0) * 3400).toFixed(2), // ETH to USD
                  campaignName: campaign.name,
                  attributedAt: tx.createdAt,
                  createdAt: tx.createdAt,
                  confidenceScore: 85 // High confidence for blockchain transactions
                }))
                allRecentActivity.push(...campaignActivities)
              }

              // Add campaign creation as activity if no transactions
              if (!analytics.recentTransactions || analytics.recentTransactions.length === 0) {
                allRecentActivity.push({
                  id: `campaign-${campaign.id}`,
                  type: 'campaign_created',
                  title: 'Campaign Created',
                  description: `${campaign.name} campaign started tracking`,
                  valueUsd: '0',
                  campaignName: campaign.name,
                  attributedAt: campaign.createdAt,
                  createdAt: campaign.createdAt,
                  confidenceScore: 100
                })
              }

              totalTransactions += analytics.totalTransactions || 0
              totalValueTracked += (parseFloat(analytics.totalEth || '0') * 3400) // ETH to USD
            } catch (analyticsError) {
              console.error(`Error fetching analytics for campaign ${campaign.name}:`, analyticsError)
              
              // Fallback: add campaign creation activity
              allRecentActivity.push({
                id: `campaign-fallback-${campaign.id}`,
                type: 'campaign_created',
                title: 'Campaign Active',
                description: `${campaign.name} is ready for tracking`,
                valueUsd: '0',
                campaignName: campaign.name,
                attributedAt: campaign.createdAt,
                createdAt: campaign.createdAt,
                confidenceScore: 100
              })
            }
          }
        }

        // Sort activities by date (newest first) and limit to 3
        const sortedRecentActivity = allRecentActivity
          .sort((a, b) => new Date(b.attributedAt).getTime() - new Date(a.attributedAt).getTime())
          .slice(0, 3)

        console.log('✅ HomePage: Final stats:', {
          campaigns: Array.isArray(campaigns) ? campaigns.length : 0,
          totalTransactions,
          totalValueTracked: totalValueTracked.toFixed(2),
          recentActivities: sortedRecentActivity.length,
          activities: sortedRecentActivity.map(a => ({ type: a.type, title: a.title }))
        })

        setStats({
          campaigns: Array.isArray(campaigns) ? campaigns.length : 0,
          attributions: totalTransactions,
          totalValue: totalValueTracked,
          recentActivity: sortedRecentActivity
        })
      } catch (error) {
        console.error('Error fetching homepage data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchData()
    }
  }, [session])

  const handleNavigation = (path: string) => {
    navigate(path)
  }

  if (isPending || loading || !hasCheckedAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full"
          />
        </div>
      </div>
    )
  }

  if (!session?.user) return null

  const userName = session.user.displayName || session.user.email?.split('@')[0] || 'User'
  const firstName = userName.split(' ')[0]

  return (
    <DashboardLayout>
      <div className="container mx-auto px-8 py-8 max-w-7xl">
            {/* Welcome Header with 3D Effect */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10 relative"
            >
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-foreground">
                  {getGreeting()}, {firstName}
                </h1>
              </div>
              <p className="text-lg text-muted-foreground">
                Track your social media impact and blockchain attributions in one place.
              </p>
              
              {/* Animated Stats Summary with Network Icon */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-4 flex items-center gap-4 text-sm"
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
                  <span>Last updated: {new Date().toLocaleTimeString()}</span>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Quick Stats Cards with 3D Tilt and Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ 
                  y: -8, 
                  rotateX: 5,
                  transition: { duration: 0.2 } 
                }}
                style={{ transformStyle: "preserve-3d" }}
                className="group relative rounded-lg border bg-card p-6 cursor-pointer hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 overflow-hidden"
                onClick={() => handleNavigation('/campaigns')}
              >
                {/* Animated gradient border effect */}
                <motion.div 
                  className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: "linear-gradient(90deg, transparent, var(--primary) 50%, transparent)",
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
                      className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors relative"
                    >
                      <Target className="text-primary" size={22} />
                      <motion.div
                        className="absolute inset-0 rounded-lg bg-primary/20"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </motion.div>
                    <ArrowRight className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" size={18} />
                  </div>
                  <motion.div
                    className="text-3xl font-bold text-foreground mb-1"
                  >
                    <AnimatedCounter value={stats.campaigns} />
                  </motion.div>
                  <div className="text-sm text-muted-foreground mb-3">Active Campaigns</div>
                  {limits && usage && (
                    <div className="text-xs text-muted-foreground/70 mb-2">
                      {usage.campaigns_count || 0} / {limits.maxCampaigns === -1 ? '∞' : limits.maxCampaigns} used
                    </div>
                  )}
                  <MiniChart data={[4, 7, 5, 9, 6, 8, stats.campaigns]} />
                </div>
              </motion.div>



              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ 
                  y: -8, 
                  rotateX: 5,
                  transition: { duration: 0.2 } 
                }}
                style={{ transformStyle: "preserve-3d" }}
                className="group relative rounded-lg border bg-card p-6 cursor-pointer hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 overflow-hidden"
                onClick={() => handleNavigation('/attributions')}
              >
                <motion.div 
                  className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: "linear-gradient(90deg, transparent, var(--primary) 50%, transparent)",
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
                      className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors relative"
                    >
                      <Activity className="text-primary" size={22} />
                      <motion.div
                        className="absolute inset-0 rounded-lg bg-primary/20"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                      />
                    </motion.div>
                    <ArrowRight className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" size={18} />
                  </div>
                  <motion.div
                    className="text-3xl font-bold text-foreground mb-1"
                  >
                    <AnimatedCounter value={stats.attributions} />
                  </motion.div>
                  <div className="text-sm text-muted-foreground mb-3">Total Attributions</div>
                  <div className="text-xs text-primary/70 flex items-center gap-1 mb-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Zap size={12} />
                    </motion.div>
                    Live tracking
                  </div>
                  <MiniChart data={[2, 4, 6, 5, 8, 7, stats.attributions]} />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ 
                  y: -8, 
                  rotateX: 5,
                  transition: { duration: 0.2 } 
                }}
                style={{ transformStyle: "preserve-3d" }}
                className="group relative rounded-lg border bg-card p-6 cursor-pointer hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 overflow-hidden"
                onClick={() => handleNavigation('/analytics')}
              >
                <motion.div 
                  className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: "linear-gradient(90deg, transparent, var(--primary) 50%, transparent)",
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
                      className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors relative"
                    >
                      <DollarSign className="text-primary" size={22} />
                      <motion.div
                        className="absolute inset-0 rounded-lg bg-primary/20"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.9 }}
                      />
                    </motion.div>
                    <ArrowRight className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" size={18} />
                  </div>
                  <motion.div
                    className="text-3xl font-bold text-foreground mb-1"
                  >
                    $<AnimatedCounter value={stats.totalValue} />
                  </motion.div>
                  <div className="text-sm text-muted-foreground mb-3">Total Value Tracked</div>
                  <div className="text-xs text-muted-foreground/70 flex items-center gap-1 mb-2">
                    <TrendingUp size={12} />
                    USD equivalent
                  </div>
                  <MiniChart data={[1000, 2000, 1500, 3000, 2500, 3500, stats.totalValue]} />
                </div>
              </motion.div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="lg:col-span-1 rounded-lg border bg-card p-6 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
                
                <div className="relative">
                  <div className="flex items-center gap-2 mb-6">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center"
                    >
                      <Zap className="text-primary" size={18} />
                    </motion.div>
                    <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
                  </div>
                  
                  <div className="space-y-3">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={() => handleNavigation('/campaigns/new')}
                        className="w-full justify-start text-left h-auto py-4 px-4 group"
                      >
                        <Plus className="mr-3 flex-shrink-0 group-hover:rotate-90 transition-transform duration-300" size={20} />
                        <div>
                          <div className="font-medium">Create Campaign</div>
                          <div className="text-xs opacity-80">Launch new tracking campaign</div>
                        </div>
                      </Button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={() => handleNavigation('/analytics')}
                        className="w-full justify-start text-left h-auto py-4 px-4"
                        variant="outline"
                      >
                        <BarChart3 className="mr-3 flex-shrink-0" size={20} />
                        <div>
                          <div className="font-medium">View Analytics</div>
                          <div className="text-xs opacity-70">Explore detailed insights</div>
                        </div>
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="lg:col-span-2 rounded-lg border bg-card p-6 relative overflow-hidden"
              >
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary/5 rounded-full blur-2xl" />
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                        <Activity className="text-primary" size={18} />
                      </div>
                      <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
                    </div>
                    {stats.recentActivity.length > 0 && (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                      >
                        Live
                      </motion.div>
                    )}
                  </div>
                  
                  {stats.recentActivity.length > 0 ? (
                    <div className="space-y-3">
                      {stats.recentActivity.map((activity, index) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + index * 0.1 }}
                          whileHover={{ x: 4 }}
                          className="flex items-start gap-4 p-4 rounded-md border bg-muted/30 hover:bg-muted/50 hover:border-primary/20 transition-all cursor-pointer"
                          onClick={() => handleNavigation('/attributions')}
                        >
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                            className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0"
                          >
                            <Activity className="text-primary" size={18} />
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <div className="text-foreground font-medium mb-1">
                              Attribution Detected
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Confidence: {activity.confidenceScore?.toFixed(0) || 0}% • 
                              Value: ${parseFloat(activity.valueUsd || 0).toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground/70 mt-1 flex items-center gap-1">
                              <Calendar size={12} />
                              {new Date(activity.attributedAt || activity.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <motion.div
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-xs text-primary bg-primary/10 px-2 py-1 rounded"
                          >
                            New
                          </motion.div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4"
                      >
                        <Activity className="text-muted-foreground" size={32} />
                      </motion.div>
                      <p className="text-foreground font-medium mb-2">No activity yet</p>
                      <p className="text-sm text-muted-foreground mb-6">
                        Create your first campaign to start tracking attributions
                      </p>
                      <Button
                        onClick={() => handleNavigation('/campaigns/new')}
                        size="sm"
                      >
                        <Plus className="mr-2" size={16} />
                        Create Campaign
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Plan Status with Gradient - Commented Out */}
            {/*
            {!planLoading && planName && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-6 rounded-lg border bg-card p-6 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                      className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"
                    >
                      <Award className="text-primary" size={20} />
                    </motion.div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground mb-1 flex items-center gap-2">
                        {planName} Plan
                        {planName === "Pro" && (
                          <motion.span
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded"
                          >
                            Active
                          </motion.span>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {limits && (
                          <>
                            {limits.maxCampaigns === -1 ? 'Unlimited' : limits.maxCampaigns} campaigns • 
                            {limits.attributionWindow} day attribution window
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => handleNavigation('/pricing')}
                      variant="outline"
                      size="sm"
                    >
                      Upgrade Plan
                      <ArrowRight className="ml-2" size={14} />
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
            */}
      </div>
    </DashboardLayout>
  )
}