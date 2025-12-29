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
          className={`flex-1 rounded-t hover:opacity-80 transition-opacity ${
            i % 2 === 0 ? 'bg-[#00D9A3]' : 'bg-[#E8F442]'
          }`}
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

  // Get time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  useEffect(() => {
    // Only redirect if no token exists
    if (isPending) return
    
    if (!session?.user) {
      const token = localStorage.getItem("bearer_token")
      if (!token) {
        // No token at all = definitely not logged in
        console.log("❌ HomePage: No session and no token, redirecting to auth")
        navigate("/auth")
      } else {
        // Token exists, session is still loading - don't redirect
        console.log("⚠️ HomePage: Token exists but session loading, waiting...")
      }
    } else {
      console.log("✅ HomePage: User logged in:", session.user.email)
    }
  }, [session?.user, isPending, navigate])

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

  // Show loading state while checking auth or fetching data
  if (isPending || (loading && session?.user)) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Spinner />
      </div>
    )
  }

  // If not pending and no session, let the useEffect handle redirect
  if (!session?.user) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Spinner />
      </div>
    )
  }

  const userName = session.user.displayName || session.user.email?.split('@')[0] || 'User'
  const firstName = userName.split(' ')[0]

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-8 py-8 max-w-7xl">
            {/* Welcome Header with 3D Effect */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10 relative"
            >
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-gray-800">
                  {getGreeting()}, {firstName}
                </h1>
              </div>
              <p className="text-lg text-gray-600">
                Track your social media impact and blockchain attributions in one place.
              </p>
              
              {/* Animated Stats Summary with Network Icon */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-4 flex items-center gap-4 text-sm"
              >
                <div className="flex items-center gap-2 text-gray-600">
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
                <div className="text-gray-400">•</div>
                <motion.div 
                  className="text-gray-500 flex items-center gap-1"
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
                  y: -12,
                  transition: { duration: 0.3 }
                }}
                className="relative rounded-xl bg-gray-100 border border-gray-200 p-6 cursor-pointer hover:shadow-lg hover:border-[#00D9A3] hover:bg-gray-100 transition-all duration-300"
                onClick={() => handleNavigation('/campaigns')}
              >
                <div className="mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00D9A3]/10 to-[#00D9A3]/5 flex items-center justify-center mb-4">
                    <Target className="text-[#00D9A3]" size={24} />
                  </div>
                  <motion.div className="inline-block px-4 py-3 rounded-lg bg-white border border-gray-300 mb-6">
                    <div className="text-4xl font-bold text-gray-900">
                      <AnimatedCounter value={stats.campaigns} />
                    </div>
                  </motion.div>
                  <div className="text-sm font-medium text-gray-700 mb-3">Active Campaigns</div>
                  {limits && usage && (
                    <div className="text-xs text-gray-500 mb-4">
                      {usage.campaigns_count || 0} / {limits.maxCampaigns === -1 ? '∞' : limits.maxCampaigns} used
                    </div>
                  )}
                </div>
              </motion.div>



              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ 
                  y: -12,
                  transition: { duration: 0.3 }
                }}
                className="relative rounded-xl bg-gray-100 border border-gray-200 p-6 cursor-pointer hover:shadow-lg hover:border-[#00D9A3] hover:bg-gray-100 transition-all duration-300"
                onClick={() => handleNavigation('/attributions')}
              >
                <div className="mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E8F442]/20 to-[#E8F442]/10 flex items-center justify-center mb-4">
                    <Activity className="text-[#E8B900]" size={24} />
                  </div>
                  <motion.div className="inline-block px-4 py-3 rounded-lg bg-white border border-gray-300 mb-6">
                    <div className="text-4xl font-bold text-gray-900">
                      <AnimatedCounter value={stats.attributions} />
                    </div>
                  </motion.div>
                  <div className="text-sm font-medium text-gray-700 mb-3">Total Attributions</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mb-4">
                    <Zap size={12} />
                    Live tracking
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ 
                  y: -12,
                  transition: { duration: 0.3 }
                }}
                className="relative rounded-xl bg-gray-100 border border-gray-200 p-6 cursor-pointer hover:shadow-lg hover:border-[#00D9A3] hover:bg-gray-100 transition-all duration-300"
                onClick={() => handleNavigation('/analytics')}
              >
                <div className="mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mb-4">
                    <DollarSign className="text-blue-600" size={24} />
                  </div>
                  <motion.div className="inline-block px-4 py-3 rounded-lg bg-white border border-gray-300 mb-6">
                    <div className="text-4xl font-bold text-gray-900">
                      $<AnimatedCounter value={stats.totalValue} />
                    </div>
                  </motion.div>
                  <div className="text-sm font-medium text-gray-700 mb-3">Total Value Tracked</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mb-4">
                    <TrendingUp size={12} />
                    USD equivalent
                  </div>
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
                className="lg:col-span-1 rounded-lg border border-gray-200 bg-gray-100 p-6 relative overflow-hidden"
              >
                
                <div className="relative">
                  <div className="flex items-center gap-2 mb-6">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="w-8 h-8 rounded-md bg-[#00D9A3]/10 flex items-center justify-center"
                    >
                      <Zap className="text-[#00D9A3]" size={18} />
                    </motion.div>
                    <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
                  </div>
                  
                  <div className="space-y-3">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={() => handleNavigation('/campaigns/new')}
                        className="w-full justify-start text-left h-auto py-4 px-4 rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-900"
                      >
                        <Plus className="mr-3 flex-shrink-0 text-[#00D9A3]" size={20} />
                        <div>
                          <div className="font-medium text-gray-900">Create Campaign</div>
                          <div className="text-xs text-gray-600">Launch new tracking campaign</div>
                        </div>
                      </Button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={() => handleNavigation('/analytics')}
                        className="w-full justify-start text-left h-auto py-4 px-4 rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-900"
                      >
                        <BarChart3 className="mr-3 flex-shrink-0 text-[#00D9A3]" size={20} />
                        <div>
                          <div className="font-medium text-gray-900">View Analytics</div>
                          <div className="text-xs text-gray-600">Explore detailed insights</div>
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
                className="lg:col-span-2 rounded-lg border border-gray-200 bg-white p-6 relative overflow-hidden"
              >
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-md bg-[#00D9A3]/20 flex items-center justify-center">
                        <Activity className="text-[#00D9A3]" size={18} />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                    </div>
                    {stats.recentActivity.length > 0 && (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-xs bg-[#00D9A3] text-white px-3 py-1.5 rounded-full font-medium"
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
                          className="flex items-start gap-4 p-4 rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-[#00D9A3]/40 transition-all cursor-pointer"
                          onClick={() => handleNavigation('/attributions')}
                        >
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                            className="w-9 h-9 rounded-md bg-[#00D9A3]/10 flex items-center justify-center flex-shrink-0"
                          >
                            <Activity className="text-[#00D9A3]" size={18} />
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <div className="text-gray-900 font-medium mb-1">
                              Attribution Detected
                            </div>
                            <div className="text-sm text-gray-600">
                              Confidence: {activity.confidenceScore?.toFixed(0) || 0}% • 
                              Value: ${parseFloat(activity.valueUsd || 0).toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <Calendar size={12} />
                              {new Date(activity.attributedAt || activity.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <motion.div
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-xs text-white bg-[#00D9A3] px-2 py-1 rounded font-medium"
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
                        className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4"
                      >
                        <Activity className="text-gray-400" size={32} />
                      </motion.div>
                      <p className="text-gray-900 font-medium mb-2">No activity yet</p>
                      <p className="text-sm text-gray-600 mb-6">
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
                className="mt-6 rounded-lg border bg-gray-100 p-6 relative overflow-hidden group"
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
                      <h3 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
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
                      <p className="text-sm text-gray-600">
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
      </div>
    </DashboardLayout>
  )
}