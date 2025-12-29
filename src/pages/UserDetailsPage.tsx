"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { 
  User,
  Mail,
  Phone,
  Calendar,
  Building,
  Crown,
  ArrowLeft,
  TrendingUp,
  Target,
  Link2,
  CreditCard,
  Activity,
  DollarSign,
  MousePointerClick,
  Sparkles
} from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface UserDetails {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    phoneNumber?: string
    role: string
    accountType: string
    createdAt: string
    updatedAt: string
  }
  stats: {
    totalCampaigns: number
    activeCampaigns: number
    totalLinks: number
    totalClicks: number
    totalTransactions: number
    totalRevenue: number
    totalAttributions: number
  }
  campaigns: Array<{
    id: string
    name: string
    description: string
    platforms: string[]
    status: string
    clickCount: number
    conversionCount: number
    totalRevenue: number
    createdAt: string
  }>
  transactions: Array<{
    id: string
    transactionHash: string
    walletAddress: string
    amount: number
    currency: string
    timestamp: string
    campaignId?: string
    campaignName?: string
  }>
  attributions: Array<{
    id: string
    platform?: string
    influencer?: string
    type: string
    campaignName?: string
    clickedAt?: string
    createdAt: string
  }>
  links: Array<{
    id: string
    campaignName: string
    platform: string
    linkName?: string
    shortUrl: string
    clickCount: number
    uniqueClicks: number
    conversionCount: number
    totalRevenue: number
    status: string
    createdAt: string
  }>
  subscription?: {
    id: string
    planName: string
    status: string
    trialEndsAt?: string
    createdAt: string
  }
}

export default function UserDetailsPage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUserDetails()
  }, [userId])

  const fetchUserDetails = async () => {
    if (!userId) {
      setError("User ID is required")
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const token = localStorage.getItem("bearer_token")

    try {
      const response = await fetch(`/api/users/${userId}/details`, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user details')
      }

      const data = await response.json()
      setUserDetails(data)
    } catch (error) {
      console.error('Error fetching user details:', error)
      setError(error instanceof Error ? error.message : 'Failed to load user details')
      toast.error("Failed to load user details")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Spinner />
      </div>
    )
  }

  if (error || !userDetails) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading User Details</h2>
          <p className="text-gray-600 mb-4">{error || 'User not found'}</p>
          <Button onClick={() => navigate('/admin')}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Admin Panel
          </Button>
        </div>
      </div>
    )
  }

  const { user, stats, campaigns, transactions, attributions, links, subscription } = userDetails

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin')}
            className="mb-4"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Admin
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                {user.accountType === 'organization' ? (
                  <Building className="h-10 w-10 text-primary" />
                ) : (
                  <User className="h-10 w-10 text-primary" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <Mail className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-600">{user.email}</span>
                </div>
                {user.phoneNumber && (
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-600">{user.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="mb-2">
                {user.role.replace(/-/g, ' ').toUpperCase()}
              </Badge>
              <div className="text-sm text-gray-600 flex items-center gap-1 justify-end">
                <Calendar className="h-3 w-3" />
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-600">Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalCampaigns}</div>
              <p className="text-xs text-gray-600 mt-1">{stats.activeCampaigns} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-600">Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalLinks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-600">Clicks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalClicks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-600">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                ${stats.totalRevenue.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-600">Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-600">Attributions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalAttributions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-600">Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-gray-900">
                {subscription?.planName || 'Free'}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detailed Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="campaigns" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="links">Links</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="attributions">Attributions</TabsTrigger>
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
            </TabsList>

            {/* Campaigns Tab */}
            <TabsContent value="campaigns">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Campaigns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {campaigns.length === 0 ? (
                    <p className="text-center text-gray-600 py-8">No campaigns found</p>
                  ) : (
                    <div className="space-y-4">
                      {campaigns.map((campaign) => (
                        <div key={campaign.id} className="border border-gray-300 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                              <p className="text-sm text-gray-600">{campaign.description}</p>
                            </div>
                            <Badge variant={campaign.status === 'active' ? 'default' : 'outline'}>
                              {campaign.status}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {campaign.platforms.map((platform) => (
                              <Badge key={platform} variant="outline" className="text-xs">
                                {platform}
                              </Badge>
                            ))}
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Clicks:</span>
                              <span className="ml-2 font-medium">{campaign.clickCount}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Conversions:</span>
                              <span className="ml-2 font-medium">{campaign.conversionCount}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Revenue:</span>
                              <span className="ml-2 font-medium">${campaign.totalRevenue.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Created:</span>
                              <span className="ml-2 font-medium">{new Date(campaign.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Links Tab */}
            <TabsContent value="links">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link2 className="h-5 w-5" />
                    Tracking Links
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {links.length === 0 ? (
                    <p className="text-center text-gray-600 py-8">No links found</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-300">
                            <th className="text-left p-2 font-medium text-sm">Campaign</th>
                            <th className="text-left p-2 font-medium text-sm">Platform</th>
                            <th className="text-left p-2 font-medium text-sm">Short URL</th>
                            <th className="text-left p-2 font-medium text-sm">Clicks</th>
                            <th className="text-left p-2 font-medium text-sm">Unique</th>
                            <th className="text-left p-2 font-medium text-sm">Conversions</th>
                            <th className="text-left p-2 font-medium text-sm">Revenue</th>
                            <th className="text-left p-2 font-medium text-sm">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {links.map((link) => (
                            <tr key={link.id} className="border-b border-gray-300">
                              <td className="p-2 text-sm">
                                <div className="font-medium">{link.campaignName}</div>
                                {link.linkName && (
                                  <div className="text-xs text-gray-600">{link.linkName}</div>
                                )}
                              </td>
                              <td className="p-2">
                                <Badge variant="outline" className="text-xs">{link.platform}</Badge>
                              </td>
                              <td className="p-2 font-mono text-xs">{link.shortUrl}</td>
                              <td className="p-2 text-sm">{link.clickCount}</td>
                              <td className="p-2 text-sm">{link.uniqueClicks}</td>
                              <td className="p-2 text-sm">{link.conversionCount}</td>
                              <td className="p-2 text-sm">${link.totalRevenue.toFixed(2)}</td>
                              <td className="p-2 text-sm">
                                <Badge 
                                  variant={link.status === 'active' ? 'default' : 'outline'}
                                  className="text-xs"
                                >
                                  {link.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Transactions Tab */}
            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {transactions.length === 0 ? (
                    <p className="text-center text-gray-600 py-8">No transactions found</p>
                  ) : (
                    <div className="space-y-3">
                      {transactions.map((tx) => (
                        <div key={tx.id} className="border border-gray-300 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                                <div className="font-mono text-sm text-gray-900">{tx.transactionHash.slice(0, 20)}...</div>
                                <div className="text-xs text-gray-600 mt-1">Wallet: {tx.walletAddress.slice(0, 10)}...{tx.walletAddress.slice(-8)}</div>
                                {tx.campaignName && (
                                  <div className="text-xs text-gray-600 mt-1">Campaign: {tx.campaignName}</div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-gray-900">{tx.amount.toFixed(4)} {tx.currency}</div>
                              <div className="text-xs text-gray-600">{new Date(tx.timestamp).toLocaleString()}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Attributions Tab */}
            <TabsContent value="attributions">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Attributions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {attributions.length === 0 ? (
                    <p className="text-center text-gray-600 py-8">No attributions found</p>
                  ) : (
                    <div className="space-y-3">
                      {attributions.map((attr) => (
                        <div key={attr.id} className="border border-gray-300 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">{attr.type}</Badge>
                                {attr.platform && (
                                  <Badge variant="outline" className="text-xs">{attr.platform}</Badge>
                                )}
                              </div>
                              {attr.campaignName && (
                                <div className="text-sm text-gray-600 mt-1">Campaign: {attr.campaignName}</div>
                              )}
                              {attr.influencer && (
                                <div className="text-sm text-gray-600">Influencer: {attr.influencer}</div>
                              )}
                            </div>
                            <div className="text-xs text-gray-600">
                              {new Date(attr.clickedAt || attr.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Subscription Tab */}
            <TabsContent value="subscription">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5" />
                    Subscription Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {subscription ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Plan:</span>
                        <Badge variant="default" className="text-lg px-4 py-1">
                          {subscription.planName}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Status:</span>
                        <Badge variant={subscription.status === 'active' ? 'default' : 'outline'}>
                          {subscription.status}
                        </Badge>
                      </div>
                      {subscription.trialEndsAt && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Trial Ends:</span>
                          <span className="font-medium">{new Date(subscription.trialEndsAt).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Started:</span>
                        <span className="font-medium">{new Date(subscription.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-2">No active subscription</p>
                      <Badge variant="outline">Free Plan</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
