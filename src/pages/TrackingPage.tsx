"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSession } from "@/lib/auth-client"
import DashboardLayout from "@/components/DashboardLayout"
import { motion } from "framer-motion"
import { Activity, RefreshCw, AlertCircle, Calendar, TrendingUp, Eye } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Attribution {
  id: string
  campaignId: string
  socialPostId: string
  walletAddress: string
  txHash: string
  confidenceScore: number
  valueUsd: string
  attributedAt: Date
  createdAt: Date
}

interface TrackingStats {
  totalAttributions: number
  avgConfidence: number
  totalValue: number
  last24h: number
}

export default function TrackingPage() {
  const navigate = useNavigate()
  const { data: session, isPending } = useSession()
  const [loading, setLoading] = useState(true)
  const [attributions, setAttributions] = useState<Attribution[]>([])
  const [stats, setStats] = useState<TrackingStats>({
    totalAttributions: 0,
    avgConfidence: 0,
    totalValue: 0,
    last24h: 0
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

  const fetchData = async () => {
    if (!session?.user?.uid) return
    
    setLoading(true)
    const token = localStorage.getItem("bearer_token")
    
    try {
      const response = await fetch('/api/attributions?limit=100', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) throw new Error("Failed to fetch attributions")

      const data = await response.json()
      const attributionsList = Array.isArray(data) ? data : []
      setAttributions(attributionsList)

      // Calculate stats
      const totalValue = attributionsList.reduce((sum: number, a: any) => 
        sum + (parseFloat(a.valueUsd) || 0), 0
      )
      const avgConfidence = attributionsList.length > 0
        ? attributionsList.reduce((sum: number, a: any) => sum + (a.confidenceScore || 0), 0) / attributionsList.length
        : 0
      
      const last24h = attributionsList.filter((a: any) => {
        const attrDate = new Date(a.attributedAt || a.createdAt)
        return Date.now() - attrDate.getTime() < 24 * 60 * 60 * 1000
      }).length

      setStats({
        totalAttributions: attributionsList.length,
        avgConfidence,
        totalValue,
        last24h
      })
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error("Failed to load tracking data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchData()
    }
  }, [session])

  if (isPending || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Spinner />
      </div>
    )
  }

  if (!session?.user) return null

  return (
    <DashboardLayout>
      <div className="container mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Live Tracking (COMMING SOON)
              </h1>
              <p className="text-gray-700">Real-time attribution monitoring and analytics</p>
            </div>
            <Button
              variant="outline"
              onClick={fetchData}
              className="border-white/10"
              disabled={loading}
            >
              <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-white/10 p-6"
              style={{
                background: 'linear-gradient(to right, rgba(255, 255, 255, 0.1), rgba(0, 0, 0, 0.8))'
              }}
            >
              <div className="text-sm text-gray-700 mb-1">Total Attributions</div>
              <div className="text-3xl font-bold text-white">{stats.totalAttributions}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-lg border border-white/10 p-6"
              style={{
                background: 'linear-gradient(to right, rgba(255, 255, 255, 0.1), rgba(0, 0, 0, 0.8))'
              }}
            >
              <div className="text-sm text-gray-700 mb-1">Avg. Confidence</div>
              <div className="text-3xl font-bold text-white">{stats.avgConfidence.toFixed(0)}%</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-lg border border-white/10 p-6"
              style={{
                background: 'linear-gradient(to right, rgba(255, 255, 255, 0.1), rgba(0, 0, 0, 0.8))'
              }}
            >
              <div className="text-sm text-gray-700 mb-1">Total Value</div>
              <div className="text-3xl font-bold text-white">${stats.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-lg border border-white/10 p-6"
              style={{
                background: 'linear-gradient(to right, rgba(255, 255, 255, 0.1), rgba(0, 0, 0, 0.8))'
              }}
            >
              <div className="text-sm text-gray-700 mb-1">Last 24 Hours</div>
              <div className="text-3xl font-bold text-white">{stats.last24h}</div>
            </motion.div>
          </div>

          {/* Attributions List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border border-white/10 p-6"
            style={{
              background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.05), rgba(0, 0, 0, 0.9))'
            }}
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Activity className="text-primary" size={24} />
              Recent Attributions
            </h2>

            {attributions.length === 0 ? (
              <div className="text-center py-12">
                <Eye className="mx-auto mb-4 text-gray-500" size={48} />
                <p className="text-gray-600 mb-4">No attributions tracked yet</p>
                <p className="text-sm text-gray-500">
                  Attributions will appear here when your campaigns start tracking transactions
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {attributions.map((attribution, index) => (
                  <motion.div
                    key={attribution.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-lg border border-white/10 hover:border-white/20 transition-all"
                    style={{
                      background: 'linear-gradient(to right, rgba(255, 255, 255, 0.05), rgba(0, 0, 0, 0.7))'
                    }}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Activity className="text-primary" size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-semibold mb-1">
                          Attribution Detected
                        </div>
                        <div className="text-sm text-gray-700 font-mono truncate max-w-md">
                          {attribution.walletAddress}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(attribution.attributedAt).toLocaleString()}
                          </div>
                          <div>TX: {attribution.txHash.slice(0, 10)}...</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-700">Confidence</div>
                        <div className={`text-lg font-bold ${
                          attribution.confidenceScore >= 80 ? 'text-green-400' :
                          attribution.confidenceScore >= 60 ? 'text-yellow-400' :
                          'text-orange-400'
                        }`}>
                          {attribution.confidenceScore.toFixed(0)}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-700">Value</div>
                        <div className="text-lg font-bold text-white">
                          ${parseFloat(attribution.valueUsd).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
      </div>
    </DashboardLayout>
  )
}