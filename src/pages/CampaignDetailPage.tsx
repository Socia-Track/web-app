"use client"

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useSession } from "@/lib/auth-client"
import DashboardLayout from "@/components/DashboardLayout"
import HeroHeader from "@/components/HeroHeader"
import Section from "@/components/Section"
import MetricCard from "@/components/MetricCard"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowLeft, Edit, Trash2, Play, Pause, TrendingUp, Users, DollarSign, Activity, Calendar, Settings, Target, Zap, Megaphone, MessageSquare, Link2, Copy } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { fetchCampaignTrends, type TrendInfo } from "@/lib/trend-utils"

export default function CampaignDetailPage() {
  const navigate = useNavigate()
  const params = useParams()
  const { data: session, isPending } = useSession()
  const [campaign, setCampaign] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [links, setLinks] = useState<any[]>([])
  const [stats, setStats] = useState({
    attributions: 0,
    transactions: 0,
    totalValue: 0,
    avgConfidence: 0,
    totalClicks: 0,
    uniqueWallets: 0
  })
  const [attributionsTrend, setAttributionsTrend] = useState<TrendInfo>({ value: "+0%", direction: "up" })
  const [transactionsTrend, setTransactionsTrend] = useState<TrendInfo>({ value: "+0%", direction: "up" })
  const [valueTrend, setValueTrend] = useState<TrendInfo>({ value: "+0%", direction: "up" })
  const [confidenceTrend, setConfidenceTrend] = useState<TrendInfo>({ value: "+0%", direction: "up" })

  useEffect(() => {
    if (!isPending && !session?.user) {
      navigate("/")
    }
  }, [session, isPending, navigate])

  useEffect(() => {
    const fetchCampaignData = async () => {
      if (!params.id || !session?.user) return

      const token = localStorage.getItem("bearer_token")
      try {
        // Try fetching as NFT campaign first
        let campaignRes = await fetch(`/api/campaigns?id=${params.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        let campaignData = await campaignRes.json()
        let campaignType = 'nft'

        // If not found, try fetching as Token campaign
        if (!campaignRes.ok) {
          campaignRes = await fetch(`/api/tokens?id=${params.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          campaignData = await campaignRes.json()
          campaignType = 'token'
        }

        if (campaignRes.ok) {
          setCampaign({ ...campaignData, campaignType })

          // Extract links from campaign data (they're already included)
          if (campaignData.links && Array.isArray(campaignData.links)) {
            setLinks(campaignData.links)
          }

          // Fetch campaign stats based on type
          if (campaignType === 'token') {
            // Fetch token transactions and clicks
            const [transactionsRes, clicksRes] = await Promise.all([
              fetch(`/api/token-transactions?tokenId=${params.id}&limit=1000`, {
                headers: { Authorization: `Bearer ${token}` }
              }),
              fetch(`/api/token-clicks?tokenId=${params.id}&limit=1000`, {
                headers: { Authorization: `Bearer ${token}` }
              })
            ])

            const transactions = transactionsRes.ok ? await transactionsRes.json() : []
            const clicks = clicksRes.ok ? await clicksRes.json() : []

            const totalVal = Array.isArray(transactions)
              ? transactions.reduce((sum: number, t: any) => sum + (t.usdValue || 0), 0)
              : 0

            const uniqueWallets = Array.isArray(clicks)
              ? new Set(clicks.filter((c: any) => c.walletAddress).map((c: any) => c.walletAddress)).size
              : 0

            setStats({
              attributions: 0,
              transactions: Array.isArray(transactions) ? transactions.length : 0,
              totalValue: totalVal,
              avgConfidence: 0,
              totalClicks: Array.isArray(clicks) ? clicks.length : 0,
              uniqueWallets: uniqueWallets
            })
          } else {
            // Fetch NFT campaign stats - use analytics endpoint for accurate counts
            const [attributionsRes, transactionsRes, analyticsRes] = await Promise.all([
              fetch(`/api/attributions?campaignId=${params.id}&limit=1000`, {
                headers: { Authorization: `Bearer ${token}` }
              }),
              fetch(`/api/transactions?campaignId=${params.id}&limit=1000`, {
                headers: { Authorization: `Bearer ${token}` }
              }),
              fetch(`/api/analytics/campaign/${params.id}`, {
                headers: { Authorization: `Bearer ${token}` }
              })
            ])

            const attributions = await attributionsRes.json()
            const transactions = await transactionsRes.json()
            const analytics = analyticsRes.ok ? await analyticsRes.json() : null

            // Use analytics endpoint for accurate counts (not limited by API limit)
            const totalAttributions = analytics?.totalAttributions || (Array.isArray(attributions) ? attributions.length : 0)
            const totalTransactions = analytics?.totalTransactions || (Array.isArray(transactions) ? transactions.length : 0)
            const totalVal = analytics?.totalValueUsd || (Array.isArray(transactions)
              ? transactions.reduce((sum: number, t: any) => sum + (parseFloat(t.usdValue) || 0), 0)
              : 0)

            // Calculate avg confidence from fetched attributions (sample)
            const avgConf = Array.isArray(attributions) && attributions.length > 0
              ? attributions.reduce((sum: number, a: any) => sum + (a.confidenceScore || 0), 0) / attributions.length
              : 0

            setStats({
              attributions: totalAttributions,
              transactions: totalTransactions,
              totalValue: totalVal,
              avgConfidence: avgConf,
              totalClicks: 0,
              uniqueWallets: 0
            })
          }
        } else {
          toast.error('Campaign not found')
          navigate('/campaigns')
        }
      } catch (error) {
        console.error('Error loading campaign:', error)
        toast.error('Error loading campaign')
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchCampaignData()

      // Fetch real data-driven trends from backend (last 6 days vs previous 6 days)
      const token = localStorage.getItem("bearer_token")
      if (token && params.id) {
        fetchCampaignTrends(token, params.id).then(trends => {
          setAttributionsTrend(trends.attributions)
          setTransactionsTrend(trends.transactions)
          setValueTrend(trends.value)
          if (trends.confidence) setConfidenceTrend(trends.confidence)
        })
      }
    }
  }, [params.id, session, navigate])

  const handleStatusToggle = async () => {
    if (!campaign) return

    const newStatus = campaign.status === 'active' ? 'paused' : 'active'
    const token = localStorage.getItem("bearer_token")
    const endpoint = campaign.campaignType === 'token' ? '/api/tokens' : '/api/campaigns'

    try {
      const res = await fetch(`${endpoint}?id=${campaign.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (res.ok) {
        const updated = await res.json()
        setCampaign({ ...updated, campaignType: campaign.campaignType })
        toast.success(`Campaign ${newStatus}`)
      } else {
        toast.error('Failed to update campaign status')
      }
    } catch (error) {
      toast.error('Error updating campaign')
    }
  }

  const handleDelete = async () => {
    if (!campaign || !confirm('Are you sure you want to delete this campaign?')) return

    const token = localStorage.getItem("bearer_token")
    const endpoint = campaign.campaignType === 'token' ? '/api/tokens' : '/api/campaigns'

    try {
      // NFT campaigns use query param (?id=), token campaigns use path param (/:id)
      const deleteUrl = campaign.campaignType === 'token'
        ? `${endpoint}/${campaign.id}`
        : `${endpoint}?id=${campaign.id}`
      const res = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        toast.success('Campaign deleted')
        navigate('/campaigns')
      }
    } catch (error) {
      toast.error('Error deleting campaign')
    }
  }

  if (isPending || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Spinner className="mx-auto" />
      </div>
    )
  }

  if (!session?.user || !campaign) return null

  // Safely parse platforms array
  const platformsArray = Array.isArray(campaign.platforms) ? campaign.platforms : []
  const keywordsArray = Array.isArray(campaign.keywords) ? campaign.keywords : []

  return (
    <DashboardLayout>
      <div className="min-h-screen">
        {/* Back Button */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 text-sm sm:text-base hover:bg-muted -ml-2"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Campaigns
          </Button>
        </div>

        {/* Hero Header */}
        <HeroHeader
          title={campaign.name}
          description={campaign.description || 'No description provided'}
          badge={campaign.status === 'active' ? 'Active Campaign' : 'Paused Campaign'}
          icon={
            campaign.campaignType === 'token' && campaign.tokenLogo ? (
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-border">
                <img
                  src={campaign.tokenLogo}
                  alt={campaign.tokenSymbol || 'Token'}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-accent/10">
                <Megaphone size={48} className="text-accent" />
              </div>
            )
          }
          actions={
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={handleStatusToggle}
                className="border-border hover:bg-muted"
              >
                {campaign.status === 'active' ? (
                  <>
                    <Pause size={18} className="mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play size={18} className="mr-2" />
                    Activate
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleDelete}
                className="border-red-500/50 text-red-500 hover:bg-red-500/10"
              >
                <Trash2 size={18} className="mr-2" />
                Delete
              </Button>
            </div>
          }
        />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">



          {/* Stats Grid - Only for NFT campaigns */}
          {campaign.campaignType !== 'token' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <h2 className="text-3xl font-bold text-foreground mb-8">Campaign Performance</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                <MetricCard
                  label="Attributions"
                  value={stats.attributions}
                  icon={<Activity size={24} />}
                  trend={attributionsTrend}
                  subtitle="social posts tracked"
                  delay={0.1}
                />
                <MetricCard
                  label="Transactions"
                  value={stats.transactions}
                  icon={<TrendingUp size={24} />}
                  trend={transactionsTrend}
                  subtitle="blockchain transactions"
                  delay={0.2}
                />
                <MetricCard
                  label="Total Value"
                  value={`$${stats.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                  icon={<DollarSign size={24} />}
                  trend={valueTrend}
                  subtitle="in tracked value"
                  delay={0.3}
                />
                <MetricCard
                  label="Avg Confidence"
                  value={`${stats.avgConfidence.toFixed(0)}%`}
                  icon={<Target size={24} />}
                  trend={confidenceTrend}
                  subtitle="attribution accuracy"
                  delay={0.4}
                />
              </div>
            </motion.div>
          )}

          {/* Campaign Details */}
          {campaign.campaignType === 'token' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-xl border border-border bg-card p-6 shadow-sm mb-8"
            >
              <h2 className="text-2xl font-bold text-foreground mb-8">Token Campaign Information</h2>

              <div className="space-y-8">
                {/* Token Metadata */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
                    <DollarSign size={20} /> Token Metadata
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Token Name</div>
                      <div className="text-foreground font-semibold">{campaign.tokenName || 'N/A'}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Token Symbol</div>
                      <div className="text-foreground font-semibold">{campaign.tokenSymbol || 'N/A'}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Decimals</div>
                      <div className="text-foreground font-semibold">{campaign.tokenDecimals || 18}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Supply</div>
                      <div className="text-foreground font-semibold">{campaign.tokenTotalSupply || 'N/A'}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Network</div>
                      <div className="text-foreground font-semibold capitalize">{campaign.tokenNetwork || campaign.blockchain || 'N/A'}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Blockchain</div>
                      <div className="text-foreground font-semibold capitalize">{campaign.blockchain || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                {/* Contract Info */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
                    <Zap size={20} /> Contract Information
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Contract Address</div>
                      <div className="text-foreground font-mono text-sm break-all bg-muted/50 p-3 rounded border border-border/50">
                        {campaign.contractAddress || 'N/A'}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Original Link</div>
                      <div className="text-foreground text-sm break-all bg-muted/50 p-3 rounded border border-border/50">
                        {campaign.originalLink || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Config */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
                    <Settings size={20} /> Campaign Configuration
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Status</div>
                      <div className="text-foreground font-semibold capitalize">{campaign.status || 'N/A'}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Time Window</div>
                      <div className="text-foreground font-semibold">{campaign.timeWindow ? `${campaign.timeWindow} hours` : 'N/A'}</div>
                    </div>
                  </div>
                </div>

                {/* Generated Links */}
                {links.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
                      <Link2 size={20} /> Tracking Links
                    </h3>
                    <div className="space-y-4">
                      {links.map((link: any, index: number) => (
                        <motion.div
                          key={link.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="rounded-xl border border-border p-6 hover:shadow-md transition-all duration-300 bg-card group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-base font-bold">
                                    {link.platform.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <h4 className="text-foreground font-semibold text-lg mb-1">
                                      {link.linkName || `${link.platform.charAt(0).toUpperCase() + link.platform.slice(1)} Link`}
                                    </h4>
                                    <p className="text-sm text-muted-foreground capitalize">{link.platform} • Created {new Date(link.createdAt).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${campaign.status === 'paused'
                                  ? 'bg-muted text-muted-foreground border border-border'
                                  : link.status === 'active'
                                    ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                    : 'bg-muted text-muted-foreground border border-border'
                                  }`}>
                                  {campaign.status === 'paused' ? 'paused' : link.status}
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div className="rounded-lg bg-muted/50 border border-border p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm font-medium text-muted-foreground">Tracking URL:</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 min-w-0">
                                      <code className="text-sm bg-background px-3 py-2 rounded-md text-foreground font-mono border border-border block w-full break-all">
                                        {link.longUrl || link.shortUrl}
                                      </code>
                                    </div>
                                    <div className="flex gap-1 flex-shrink-0">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          navigator.clipboard.writeText(link.longUrl || link.shortUrl);
                                          toast.success('Tracking URL copied to clipboard!');
                                        }}
                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                        title="Copy tracking URL"
                                      >
                                        <Copy size={14} />
                                      </Button>
                                    </div>
                                  </div>
                                </div>

                                <div className="rounded-lg bg-muted/50 border border-border p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm font-medium text-muted-foreground">Destination URL:</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 min-w-0">
                                      <code className="text-sm bg-background px-3 py-2 rounded-md text-foreground font-mono border border-border block w-full break-all">
                                        {link.originalUrl}
                                      </code>
                                    </div>
                                    <div className="flex-shrink-0">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          navigator.clipboard.writeText(link.originalUrl);
                                          toast.success('Destination URL copied to clipboard!');
                                        }}
                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                        title="Copy destination URL"
                                      >
                                        <Copy size={14} />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>

                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-xl border border-border bg-card p-6 shadow-sm mb-8"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">Campaign Details</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
                    <MessageSquare size={20} /> Objectives
                  </h3>
                  <div className="text-foreground bg-muted/30 p-4 rounded-lg border border-border/50">
                    {campaign.objectives || "No objectives set"}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
                    <Target size={20} /> Keywords
                  </h3>
                  {keywordsArray.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {keywordsArray.map((keyword: string, i: number) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-muted text-foreground text-sm border border-border font-medium">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground">No keywords tracked</div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t border-border">
                  <Calendar size={14} />
                  Created {new Date(campaign.createdAt).toLocaleDateString()} at {new Date(campaign.createdAt).toLocaleTimeString()}
                </div>

                {/* Generated Links for NFT Campaigns */}
                {links.length > 0 && (
                  <div className="pt-4 border-t border-border">
                    <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
                      <Link2 size={20} /> Tracking Links
                    </h3>
                    <div className="space-y-4">
                      {links.map((link: any, index: number) => (
                        <motion.div
                          key={link.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="rounded-xl border border-border p-6 hover:shadow-md transition-all duration-300 bg-card group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-base font-bold">
                                    {link.platform.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <h4 className="text-foreground font-semibold text-lg mb-1">
                                      {link.linkName || `${link.platform.charAt(0).toUpperCase() + link.platform.slice(1)} Link`}
                                    </h4>
                                    <p className="text-sm text-muted-foreground capitalize">{link.platform} • Created {new Date(link.createdAt).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${campaign.status === 'paused'
                                  ? 'bg-muted text-muted-foreground border border-border'
                                  : link.status === 'active'
                                    ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                    : 'bg-muted text-muted-foreground border border-border'
                                  }`}>
                                  {campaign.status === 'paused' ? 'paused' : link.status}
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div className="rounded-lg bg-muted/50 border border-border p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm font-medium text-muted-foreground">Tracking URL:</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 min-w-0">
                                      <code className="text-sm bg-background px-3 py-2 rounded-md text-foreground font-mono border border-border block w-full break-all">
                                        {link.longUrl || link.shortUrl}
                                      </code>
                                    </div>
                                    <div className="flex gap-1 flex-shrink-0">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          navigator.clipboard.writeText(link.longUrl || link.shortUrl);
                                          toast.success('Tracking URL copied to clipboard!');
                                        }}
                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                        title="Copy tracking URL"
                                      >
                                        <Copy size={14} />
                                      </Button>
                                    </div>
                                  </div>
                                </div>

                                <div className="rounded-lg bg-muted/50 border border-border p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm font-medium text-muted-foreground">Destination URL:</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 min-w-0">
                                      <code className="text-sm bg-background px-3 py-2 rounded-md text-foreground font-mono border border-border block w-full break-all">
                                        {link.originalUrl}
                                      </code>
                                    </div>
                                    <div className="flex-shrink-0">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          navigator.clipboard.writeText(link.originalUrl);
                                          toast.success('Destination URL copied to clipboard!');
                                        }}
                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                        title="Copy destination URL"
                                      >
                                        <Copy size={14} />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>

                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )
          }
        </div >
      </div >
    </DashboardLayout >
  )
}
