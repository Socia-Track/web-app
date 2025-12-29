"use client"

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useSession } from "@/lib/auth-client"
import DashboardLayout from "@/components/DashboardLayout"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowLeft, Edit, Trash2, Play, Pause, TrendingUp, Users, DollarSign, Activity, Calendar, Settings } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"

export default function CampaignDetailPage() {
  const navigate = useNavigate()
  const params = useParams()
  const { data: session, isPending } = useSession()
  const [campaign, setCampaign] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    attributions: 0,
    transactions: 0,
    totalValue: 0,
    avgConfidence: 0
  })

  useEffect(() => {
    if (isPending) return
    if (!session?.user) {
      const token = localStorage.getItem("bearer_token")
      if (!token) {
        navigate("/auth")
      }
    }
  }, [session, isPending, navigate])

  useEffect(() => {
    const fetchCampaignData = async () => {
      if (!params.id || !session?.user) return
      
      const token = localStorage.getItem("bearer_token")
      try {
        // Fetch campaign details
        const campaignRes = await fetch(`/api/campaigns?id=${params.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const campaignData = await campaignRes.json()
        
        if (campaignRes.ok) {
          setCampaign(campaignData)
          
          // Fetch campaign stats
          const [attributionsRes, transactionsRes] = await Promise.all([
            fetch(`/api/attributions?campaignId=${params.id}&limit=1000`, {
              headers: { Authorization: `Bearer ${token}` }
            }),
            fetch(`/api/transactions?campaignId=${params.id}&limit=1000`, {
              headers: { Authorization: `Bearer ${token}` }
            })
          ])
          
          const attributions = await attributionsRes.json()
          const transactions = await transactionsRes.json()
          
          const avgConf = Array.isArray(attributions) && attributions.length > 0
            ? attributions.reduce((sum: number, a: any) => sum + (a.confidenceScore || 0), 0) / attributions.length
            : 0
            
          const totalVal = Array.isArray(attributions)
            ? attributions.reduce((sum: number, a: any) => sum + (parseFloat(a.valueUsd) || 0), 0)
            : 0
          
          setStats({
            attributions: Array.isArray(attributions) ? attributions.length : 0,
            transactions: Array.isArray(transactions) ? transactions.length : 0,
            totalValue: totalVal,
            avgConfidence: avgConf
          })
        } else {
          toast.error('Campaign not found')
          navigate('/campaigns')
        }
      } catch (error) {
        toast.error('Error loading campaign')
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchCampaignData()
    }
  }, [params.id, session, navigate])

  const handleStatusToggle = async () => {
    if (!campaign) return
    
    const newStatus = campaign.status === 'active' ? 'paused' : 'active'
    const token = localStorage.getItem("bearer_token")
    
    try {
      const res = await fetch(`/api/campaigns?id=${campaign.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (res.ok) {
        const updated = await res.json()
        setCampaign(updated)
        toast.success(`Campaign ${newStatus}`)
      }
    } catch (error) {
      toast.error('Error updating campaign')
    }
  }

  const handleDelete = async () => {
    if (!campaign || !confirm('Are you sure you want to delete this campaign?')) return
    
    const token = localStorage.getItem("bearer_token")
    try {
      const res = await fetch(`/api/campaigns?id=${campaign.id}`, {
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
      <div className="flex h-screen items-center justify-center bg-white">
        <Spinner />
      </div>
    )
  }

  if (!session?.user || !campaign) return null

  // Safely parse platforms array
  const platformsArray = Array.isArray(campaign.platforms) ? campaign.platforms : []
  const keywordsArray = Array.isArray(campaign.keywords) ? campaign.keywords : []

  return (
    <DashboardLayout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
            <div className="flex-1">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="mb-4 text-gray-900 hover:text-gray-900 hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft size={18} className="mr-2" />
                Back to Campaigns
              </Button>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 text-gray-900">
                {campaign.name}
              </h1>
              <p className="text-sm sm:text-base text-gray-700">{campaign.description || 'No description'}</p>
            </div>
            
            <div className="flex flex-wrap sm:flex-nowrap gap-3 sm:pt-8">
              <Button
                variant="outline"
                onClick={handleStatusToggle}
                className="border-gray-300 text-gray-900 hover:bg-gray-100 flex-1 sm:flex-none h-11 font-semibold"
              >
                {campaign.status === 'active' ? (
                  <>
                    <Pause size={20} className="mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play size={20} className="mr-2" />
                    Activate
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleDelete}
                className="border-gray-300 text-gray-900 bg-gray-50 hover:bg-gray-100 flex-1 sm:flex-none h-11 font-semibold"
              >
                <Trash2 size={20} className="mr-2" />
                Delete
              </Button>
            </div>
          </div>

          {/* Campaign Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-gray-200 bg-gray-100 p-5 sm:p-6 lg:p-8 mb-8 shadow-sm"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div>
                <div className="text-xs sm:text-sm text-gray-700 mb-1">Status</div>
                <div className={`inline-flex px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                  campaign.status === 'active' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {campaign.status}
                </div>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-gray-700 mb-1">Blockchain</div>
                <div className="text-sm sm:text-base text-[#1F2937] font-semibold">{campaign.blockchain || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-gray-700 mb-1">Time Window</div>
                <div className="text-sm sm:text-base text-[#1F2937] font-semibold">{campaign.timeWindow ? `${campaign.timeWindow}h` : 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-gray-700 mb-1">Min Confidence</div>
                <div className="text-sm sm:text-base text-[#1F2937] font-semibold">{campaign.minConfidenceThreshold || 70}%</div>
              </div>
            </div>
            
            {platformsArray.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm font-bold text-gray-900 mb-2">Platforms</div>
                <div className="flex gap-2">
                  {platformsArray.map((platform: string, i: number) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-gray-100 text-[#1F2937] text-xs">
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* NFT Promotion Info */}
            {(campaign.promotionType || campaign.contractAddress) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm font-bold text-gray-900 mb-3">NFT Promotion Tracking</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-gray-700 mb-1">Promotion Type</div>
                    <div className="text-[#1F2937] font-semibold capitalize">
                      {campaign.promotionType === 'single' ? 'Single NFT' : 'Collection'} Promotion
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-xs text-gray-700 mb-1">Contract Address</div>
                    <div className="text-[#1F2937] font-mono text-sm break-all">
                      {campaign.contractAddress || 'N/A'}
                    </div>
                  </div>
                </div>
                
                {campaign.promotionType === 'single' && campaign.tokenIds && campaign.tokenIds.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs text-gray-700 mb-2">Tracking Token IDs</div>
                    <div className="flex flex-wrap gap-2">
                      {campaign.tokenIds.map((tokenId: string, i: number) => (
                        <span key={i} className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-mono">
                          #{tokenId}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {campaign.promotionType === 'collection' && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-blue-700 text-xs">
                      Tracking purchases of any NFT from this collection
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-lg border border-gray-200 bg-gray-100 p-3 sm:p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm text-gray-700">Attributions</span>
                <Activity size={14} className="text-[#1F2937] sm:w-4 sm:h-4" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-[#1F2937]">{stats.attributions}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-lg border border-gray-200 bg-gray-100 p-3 sm:p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm text-gray-700">Transactions</span>
                <TrendingUp size={14} className="text-[#1F2937] sm:w-4 sm:h-4" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-[#1F2937]">{stats.transactions}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-lg border border-gray-200 bg-gray-100 p-3 sm:p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm text-gray-700">Total Value</span>
                <DollarSign size={14} className="text-[#1F2937] sm:w-4 sm:h-4" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-[#1F2937]">${stats.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-lg border border-gray-200 bg-gray-100 p-3 sm:p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">Avg Confidence</span>
                <TrendingUp size={16} className="text-[#1F2937]" />
              </div>
              <div className="text-2xl font-bold text-[#1F2937]">{stats.avgConfidence.toFixed(0)}%</div>
            </motion.div>
          </div>

          {/* Campaign Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-6 shadow-sm"
          >
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">Campaign Details</h2>
            
            <div className="space-y-6">
              {campaign.objectives && (
                <div className="p-4 rounded-lg bg-white border border-gray-200 hover:border-[#00D9A3]/30 transition-colors">
                  <div className="text-xs font-semibold text-[#00D9A3] uppercase mb-2">Objectives</div>
                  <div className="text-lg font-semibold text-gray-900">{campaign.objectives}</div>
                </div>
              )}
              
              {keywordsArray.length > 0 && (
                <div className="p-4 rounded-lg bg-white border border-gray-200 hover:border-[#00D9A3]/30 transition-colors">
                  <div className="text-xs font-semibold text-[#00D9A3] uppercase mb-3">Keywords</div>
                  <div className="flex flex-wrap gap-2">
                    {keywordsArray.map((keyword: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[#00D9A3]/10 to-[#00D9A3]/5 border border-[#00D9A3]/30 text-gray-800 text-sm font-medium">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="p-4 rounded-lg bg-white border border-gray-200 hover:border-[#00D9A3]/30 transition-colors flex items-center gap-3">
                <Calendar size={18} className="text-[#00D9A3]" />
                <div>
                  <div className="text-xs font-semibold text-[#00D9A3] uppercase mb-1">Created</div>
                  <div className="text-sm font-medium text-gray-900">{new Date(campaign.createdAt).toLocaleDateString()} at {new Date(campaign.createdAt).toLocaleTimeString()}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
    </DashboardLayout>
  )
}