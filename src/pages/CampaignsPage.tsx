"use client"

import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useSession } from "@/lib/auth-client"
import DashboardLayout from "@/components/DashboardLayout"
import HeroHeader from "@/components/HeroHeader"
import Section from "@/components/Section"
import EmptyState from "@/components/EmptyState"
import Highlight from "@/components/Highlight"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { Plus, Search, Filter, Megaphone, Calendar, Image, Coins, ArrowRight } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import NetworkInfoDisplay from "@/components/NetworkInfoDisplay"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function CampaignsPage() {
  const navigate = useNavigate()
  const { data: session, isPending } = useSession()
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showTypeDialog, setShowTypeDialog] = useState(false)

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
        // Fetch both NFT campaigns and Token campaigns
        const [campaignsRes, tokensRes] = await Promise.all([
          fetch(`/api/campaigns?limit=100&userId=${session.user.uid}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`/api/tokens?limit=100&userId=${session.user.uid}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ])

        const campaignsData = await campaignsRes.json()
        const tokensData = await tokensRes.json()

        // Combine both arrays, marking each with its type
        const nftCampaigns = Array.isArray(campaignsData)
          ? campaignsData.map(c => ({ ...c, campaignType: 'nft', links: c.links || [] }))
          : []
        const tokenCampaigns = Array.isArray(tokensData)
          ? tokensData.map(t => ({ ...t, campaignType: 'token', links: t.tokenLinks || [] }))
          : []

        // Combine and sort by creation date
        const allCampaigns = [...nftCampaigns, ...tokenCampaigns].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )

        setCampaigns(allCampaigns)
      } catch (error) {
        console.error('Error fetching campaigns:', error)
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

  const activeCampaigns = campaigns.filter(c => c.status === 'active').length
  const totalCampaigns = campaigns.length

  return (
    <DashboardLayout>
      {/* Hero Header */}
      <HeroHeader
        title={
          <>
            Your <Highlight>Web3 Marketing</Highlight> Campaigns
          </>
        }
        description="Create, manage, and track your blockchain marketing campaigns across NFTs and tokens"
        badge={`${totalCampaigns} Total • ${activeCampaigns} Active`}
        icon={
          <div className="p-4 rounded-2xl bg-accent/10">
            <Megaphone size={48} className="text-accent" />
          </div>
        }
        actions={
          <Button
            onClick={() => setShowTypeDialog(true)}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            size="lg"
          >
            <Plus size={20} className="mr-2" />
            New Campaign
          </Button>
        }
      />

      {/* Search and Filter Section */}
      <Section className="!py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Search campaigns by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-base border-border bg-card"
              />
            </div>
            <Button
              variant="outline"
              className="border-border hover:bg-muted h-12 px-6"
            >
              <Filter size={18} className="mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </Section>

      {/* Campaigns Grid Section */}
      <Section background="muted">
        {filteredCampaigns.length === 0 ? (
          <EmptyState
            icon={<Megaphone size={64} />}
            title={searchTerm ? "No campaigns found" : "No campaigns yet"}
            description={
              searchTerm
                ? "Try adjusting your search terms to find what you're looking for"
                : "Create your first campaign to start tracking attributions and measuring your Web3 marketing ROI"
            }
            action={
              !searchTerm ? {
                label: "Create Campaign",
                onClick: () => setShowTypeDialog(true)
              } : undefined
            }
          />
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h2 className="text-3xl font-bold text-foreground mb-3">
                {searchTerm ? "Search Results" : "All Campaigns"}
              </h2>
              <p className="text-lg text-muted-foreground">
                {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''} found
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCampaigns.map((campaign, index) => (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/campaigns/${campaign.id}`)}
                  className="group relative rounded-2xl bg-card p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-border/50 cursor-pointer"
                >
                  <div className="relative">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-accent/10 group-hover:scale-110 transition-transform duration-300">
                        {campaign.campaignType === 'token' ? (
                          <Coins size={24} className="text-accent" />
                        ) : (
                          <Image size={24} className="text-accent" />
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${campaign.status === 'active'
                          ? 'bg-green-50/50 text-green-700'
                          : campaign.status === 'paused'
                            ? 'bg-yellow-50 text-yellow-600'
                            : 'bg-gray-100 text-gray-600'
                          }`}>
                          {campaign.status}
                        </div>
                        {campaign.campaignType === 'token' && (
                          <div className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-600">
                            Token
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-accent transition-colors duration-300">
                      {campaign.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                      {campaign.description || 'No description provided'}
                    </p>

                    {/* Meta Info */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar size={14} />
                        Created {new Date(campaign.createdAt).toLocaleDateString()}
                      </div>
                      {campaign.blockchain && (
                        <div className="flex items-center gap-2">
                          <NetworkInfoDisplay
                            networkKey={campaign.blockchain}
                            showCurrency={true}
                            showChainId={false}
                            size="sm"
                            variant="outline"
                          />
                        </div>
                      )}
                      {campaign.campaignType === 'token' && campaign.tokenSymbol && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Coins size={14} className="text-accent" />
                          <span className="font-medium text-foreground">{campaign.tokenSymbol}</span>
                          {campaign.tokenName && (
                            <span className="text-xs">({campaign.tokenName})</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Confidence: {campaign.minConfidenceThreshold || 70}%
                      </span>
                      <ArrowRight size={16} className="text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </Section>

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