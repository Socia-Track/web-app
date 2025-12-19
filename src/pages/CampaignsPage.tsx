"use client"

import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useSession } from "@/lib/auth-client"
import DashboardLayout from "@/components/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { Plus, Search, Filter, Megaphone, Calendar, TrendingUp } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"

export default function CampaignsPage() {
  const navigate = useNavigate()
  const { data: session, isPending } = useSession()
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (!isPending && !session?.user) {
      console.log("❌ CampaignsPage: No session, redirecting to home")
      navigate("/")
    }
  }, [session, isPending, navigate])

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!session?.user?.uid) return
      
      const token = localStorage.getItem("bearer_token")
      try {
        const res = await fetch(`/api/campaigns?limit=100&userId=${session.user.uid}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        setCampaigns(Array.isArray(data) ? data : [])
      } catch (error) {
        toast.error('Error fetching campaigns')
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchCampaigns()
    }
  }, [session])

  const filteredCampaigns = campaigns.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isPending || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Spinner className="mx-auto" />
      </div>
    )
  }

  if (!session?.user) return null

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Campaigns
                  </h1>
                  <p className="text-sm sm:text-base text-gray-400">Manage your Web3 marketing campaigns</p>
                </div>
                <Link to="/campaigns/new" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto" style={{
                    background: 'linear-gradient(to right, rgba(255, 255, 255, 0.9), rgba(100, 100, 100, 0.8))'
                  }}>
                    <Plus size={16} className="mr-2" />
                    New Campaign
                  </Button>
                </Link>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    placeholder="Search campaigns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-black/50 border-white/10 text-white"
                  />
                </div>
                <Button variant="outline" className="border-white/10 w-full sm:w-auto">
                  <Filter size={16} className="mr-2" />
                  Filter
                </Button>
              </div>

              {/* Campaigns Grid */}
              {filteredCampaigns.length === 0 ? (
                <div className="text-center py-20">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Megaphone className="mx-auto mb-4 text-gray-500" size={64} />
                    <h2 className="text-2xl font-bold text-white mb-2">No campaigns yet</h2>
                    <p className="text-gray-400 mb-6">Create your first campaign to start tracking attributions</p>
                    <Link to="/campaigns/new">
                      <Button style={{
                        background: 'linear-gradient(to right, rgba(255, 255, 255, 0.9), rgba(100, 100, 100, 0.8))'
                      }}>
                        <Plus size={16} className="mr-2" />
                        Create Campaign
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCampaigns.map((campaign, index) => (
                    <motion.div
                      key={campaign.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => navigate(`/campaigns/${campaign.id}`)}
                      className="rounded-xl border border-white/10 p-4 sm:p-6 hover:border-white/20 transition-all cursor-pointer"
                      style={{
                        background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.05), rgba(0, 0, 0, 0.9))'
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{
                            background: 'linear-gradient(to right, rgba(255, 255, 255, 0.2), rgba(0, 0, 0, 0.8))'
                          }}
                        >
                          <Megaphone className="text-white" size={24} />
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          campaign.status === 'active' 
                            ? 'bg-green-400/10 text-green-400' 
                            : campaign.status === 'paused'
                            ? 'bg-yellow-400/10 text-yellow-400'
                            : 'bg-gray-400/10 text-gray-400'
                        }`}>
                          {campaign.status}
                        </div>
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{campaign.name}</h3>
                      <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                        {campaign.description || 'No description provided'}
                      </p>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Calendar size={14} />
                          Created {new Date(campaign.createdAt).toLocaleDateString()}
                        </div>
                        {campaign.blockchain && (
                          <div className="flex items-center gap-2 text-gray-400">
                            <TrendingUp size={14} />
                            {campaign.blockchain}
                          </div>
                        )}
                        {campaign.promotionType && (
                          <div className="flex items-center gap-2 text-gray-400">
                            <span className="w-3.5 h-3.5 rounded-full bg-purple-500" />
                            {campaign.promotionType === 'single' ? 'Single NFT' : 'Collection'} Promotion
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Confidence</span>
                          <span className="text-white font-semibold">{campaign.minConfidenceThreshold || 70}%</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
      </div>
    </DashboardLayout>
  )
}