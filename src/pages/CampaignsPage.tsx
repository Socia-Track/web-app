"use client"

import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useSession } from "@/lib/auth-client"
import DashboardLayout from "@/components/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { Plus, Search, Filter, Rocket, Calendar, TrendingUp, Zap } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"

export default function CampaignsPage() {
  const navigate = useNavigate()
  const { data: session, isPending } = useSession()
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    // Don't redirect while session is loading
    if (isPending) return
    
    // Only redirect if definitely no session AND no token
    if (!session?.user) {
      const token = localStorage.getItem("bearer_token")
      if (!token) {
        console.log("❌ CampaignsPage: No session or token, redirecting to auth")
        navigate("/auth")
      } else {
        console.log("⚠️ CampaignsPage: Token exists, waiting for session to load")
      }
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
      <div className="flex h-screen items-center justify-center bg-white">
        <Spinner />
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
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-[#1F2937]">
                    Campaigns
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600">Manage your Web3 marketing campaigns</p>
                </div>
                <Link to="/campaigns/new" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white">
                    <Plus size={16} className="mr-2" />
                    New Campaign
                  </Button>
                </Link>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
                  <Input
                    placeholder="Search campaigns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-100 border-gray-200 text-gray-900"
                  />
                </div>
                <Button variant="outline" className="border-gray-200 w-full sm:w-auto">
                  <Filter size={16} className="mr-2" />
                  Filter
                </Button>
              </div>

              {/* Campaigns Grid */}
              {filteredCampaigns.length === 0 ? (
                <div className="text-center py-20 bg-gray-100 rounded-xl border border-gray-200">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Rocket className="mx-auto mb-4 text-gray-500" size={64} />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No campaigns yet</h2>
                    <p className="text-gray-600 mb-6">Create your first campaign to start tracking attributions</p>
                    <Link to="/campaigns/new">
                      <Button className="bg-green-600 hover:bg-green-700 text-white">
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
                      whileHover={{ 
                        y: -12,
                        transition: { duration: 0.3 }
                      }}
                      onClick={() => navigate(`/campaigns/${campaign.id}`)}
                      className="rounded-xl border border-gray-200 p-4 sm:p-6 bg-gray-100 hover:border-green-300 hover:shadow-xl hover:bg-gray-100 transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900" style={{width: '24px', height: '24px'}}>
                          <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>
                          <path d="M10 10l-3 4m6-8l4 5m-2-7l2 3m-7 6l5-6m8-3l-3 2"/>
                        </svg>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          campaign.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : campaign.status === 'paused'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {campaign.status}
                        </div>
                      </div>

                      <div className="mb-4 inline-block px-3 py-2 rounded-md bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                        <h3 className="text-sm font-semibold text-green-800">{campaign.name}</h3>
                      </div>
                      <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                        {campaign.description || 'No description provided'}
                      </p>

                      <div className="pt-3 border-t border-gray-200">
                        <div className="p-3 rounded-lg bg-white border border-gray-100 hover:border-[#00D9A3]/30 transition-colors">
                          <div className="flex items-center gap-3 mb-2">
                            <Calendar size={16} className="text-[#00D9A3] flex-shrink-0" />
                            <span className="text-sm text-gray-700">Created {new Date(campaign.createdAt).toLocaleDateString()}</span>
                          </div>
                          {campaign.blockchain && (
                            <div className="flex items-center gap-3">
                              <TrendingUp size={16} className="text-[#E8F442] flex-shrink-0" />
                              <span className="text-sm text-gray-700">{campaign.blockchain}</span>
                            </div>
                          )}
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