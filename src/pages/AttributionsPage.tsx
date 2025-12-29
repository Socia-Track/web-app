"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useSession } from "@/lib/auth-client"
import DashboardLayout from "@/components/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
    SelectContent,
    SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Download, Search, Filter, TrendingUp, ExternalLink, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"

interface Attribution {
  id: string
  socialPost: {
    platform: string
    content: string
    author: string
    timestamp: string
  }
  transaction: {
    hash: string
    wallet: string
    value: string
    type: string
  }
  confidenceScore: number
  keywords: string[]
  timeGap: string
}

export default function AttributionsPage() {
  const { data: session, isPending } = useSession()
  const [searchQuery, setSearchQuery] = useState("")
  const [platformFilter, setPlatformFilter] = useState("all")
  const [confidenceFilter, setConfidenceFilter] = useState("all")
  const [dateRange, setDateRange] = useState("7d")
  const [attributions, setAttributions] = useState<Attribution[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch real attributions from backend
  useEffect(() => {
    if (!session?.user?.uid) return

    const fetchAttributions = async () => {
      try {
        const token = localStorage.getItem("bearer_token")
        const response = await fetch(`/api/attributions?limit=1000&userId=${session.user!.uid}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const data = await response.json()
        setAttributions(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error fetching attributions:', error)
        toast.error('Failed to load attributions')
      } finally {
        setLoading(false)
      }
    }

    fetchAttributions()
  }, [session])

  const filteredAttributions = attributions.filter(attr => {
    const matchesSearch = 
      attr.socialPost?.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attr.socialPost?.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attr.transaction?.hash?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesPlatform = platformFilter === "all" || 
      attr.socialPost?.platform?.toLowerCase() === platformFilter.toLowerCase()
    
    const matchesConfidence = 
      confidenceFilter === "all" ||
      (confidenceFilter === "high" && (attr.confidenceScore || 0) >= 85) ||
      (confidenceFilter === "medium" && (attr.confidenceScore || 0) >= 70 && (attr.confidenceScore || 0) < 85) ||
      (confidenceFilter === "low" && (attr.confidenceScore || 0) < 70)
    
    return matchesSearch && matchesPlatform && matchesConfidence
  })

  const handleExportCSV = () => {
    try {
      const headers = ["ID", "Platform", "Author", "Content", "Transaction Hash", "Wallet", "Value", "Type", "Confidence", "Time Gap"]
      const rows = filteredAttributions.map(attr => [
        attr.id,
        attr.socialPost.platform,
        attr.socialPost.author,
        `"${attr.socialPost.content}"`,
        attr.transaction.hash,
        attr.transaction.wallet,
        attr.transaction.value,
        attr.transaction.type,
        attr.confidenceScore,
        attr.timeGap
      ])
      
      const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n")
      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `attributions_${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success("CSV exported successfully!")
    } catch (error) {
      toast.error("Failed to export CSV")
    }
  }

  const handleExportJSON = () => {
    try {
      const jsonContent = JSON.stringify(filteredAttributions, null, 2)
      const blob = new Blob([jsonContent], { type: "application/json" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `attributions_${new Date().toISOString().split("T")[0]}.json`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success("JSON exported successfully!")
    } catch (error) {
      toast.error("Failed to export JSON")
    }
  }

  const handleRefresh = async () => {
    if (!session?.user?.uid) return
    
    setLoading(true)
    try {
      const token = localStorage.getItem("bearer_token")
      const response = await fetch(`/api/attributions?limit=1000&userId=${session.user!.uid}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setAttributions(Array.isArray(data) ? data : [])
      toast.success("Data refreshed!")
    } catch (error) {
      console.error('Error fetching attributions:', error)
      toast.error('Failed to refresh data')
    } finally {
      setLoading(false)
    }
  }

  const handleViewTransaction = (hash: string) => {
    window.open(`https://etherscan.io/tx/${hash}`, "_blank", "noopener,noreferrer")
  }

  const getConfidenceBadgeVariant = (score: number) => {
    if (score >= 85) return "default"
    if (score >= 70) return "secondary"
    return "outline"
  }

  const totalValue = filteredAttributions.reduce((sum, attr) => {
    try {
      const valueStr = attr.transaction?.value || "0"
      const value = parseFloat(valueStr.split(" ")[0])
      return sum + (isNaN(value) ? 0 : value)
    } catch {
      return sum
    }
  }, 0)

  // Calculate unique platforms from attributions
  const uniquePlatforms = [...new Set(attributions.map(attr => attr.socialPost?.platform).filter(Boolean))]
  const platformNames = uniquePlatforms.join(", ") || "None"

  // Show loading spinner while fetching data
  if (isPending || loading) {
    return (
      <DashboardLayout>
        <div className="flex h-screen items-center justify-center bg-white">
          <Spinner />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">
                Attribution Dashboard (COMING SOON)
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                Track social posts linked to blockchain transactions with AI-powered confidence scoring
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="border-gray-300 text-gray-900 hover:bg-gray-100"
            >
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </Button>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
            <Card className="bg-gray-100 border-gray-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-900">Total Attributions</CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-3xl font-bold text-gray-900">{filteredAttributions.length}</p>
                <p className="text-xs text-gray-600 mt-1">of {attributions.length} total</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-100 border-gray-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-900">Avg Confidence</CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-3xl font-bold text-gray-900">
                  {Math.round(filteredAttributions.reduce((sum, a) => sum + a.confidenceScore, 0) / filteredAttributions.length || 0)}%
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp size={12} className="text-[#00D9A3]" />
                  <p className="text-xs text-[#00D9A3]">+5% vs last week</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-100 border-gray-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-900">Total Value</CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-3xl font-bold text-gray-900">{totalValue.toFixed(2)} ETH</p>
                <p className="text-xs text-gray-600 mt-1">≈ ${(totalValue * 2500).toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-100 border-gray-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-900">Active Platforms</CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-3xl font-bold text-gray-900">{uniquePlatforms.length}</p>
                <p className="text-xs text-gray-600 mt-1">{platformNames}</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters & Search */}
          <Card className="bg-gray-100 border-gray-300 mb-6">
            <CardContent className="p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                  <Input
                    placeholder="Search posts, authors, or transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                  />
                </div>

                <Select value={platformFilter} onValueChange={setPlatformFilter}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="discord">Discord</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="Confidence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Confidence</SelectItem>
                    <SelectItem value="high">High (≥85%)</SelectItem>
                    <SelectItem value="medium">Medium (70-84%)</SelectItem>
                    <SelectItem value="low">Low (&lt;70%)</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  className="bg-[#00D9A3] text-white hover:bg-[#00D9A3]/90 border-[#00D9A3]"
                >
                  <Download size={16} className="mr-2" />
                  Export CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportJSON}
                  className="bg-[#00D9A3] text-white hover:bg-[#00D9A3]/90 border-[#00D9A3]"
                >
                  <Download size={16} className="mr-2" />
                  Export JSON
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Attributions Table */}
          <Card className="bg-gray-100 border-gray-300">
            <CardContent className="p-4 md:p-6">
              <div className="overflow-x-auto rounded-lg border border-gray-300">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-300 hover:bg-gray-200">
                      <TableHead className="text-gray-900 px-4 py-3 whitespace-nowrap">Social Post</TableHead>
                      <TableHead className="text-gray-900 px-4 py-3 whitespace-nowrap">Transaction</TableHead>
                      <TableHead className="text-gray-900 px-4 py-3 whitespace-nowrap">Value</TableHead>
                      <TableHead className="text-gray-900 px-4 py-3 whitespace-nowrap">Confidence</TableHead>
                      <TableHead className="text-gray-900 px-4 py-3 whitespace-nowrap">Time Gap</TableHead>
                      <TableHead className="text-gray-900 px-4 py-3 whitespace-nowrap">Keywords</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAttributions.map((attribution) => (
                      <TableRow 
                        key={attribution.id} 
                        className="border-gray-300 hover:bg-gray-200 cursor-pointer transition-colors"
                      >
                        <TableCell className="px-4 py-4">
                          <div>
                            <Badge variant="outline" className="mb-2 text-gray-900 border-gray-300">
                              {attribution.socialPost.platform}
                            </Badge>
                            <p className="text-sm text-gray-900 mb-1 line-clamp-2 max-w-xs">
                              {attribution.socialPost.content}
                            </p>
                            <p className="text-xs text-gray-600">
                              by {attribution.socialPost.author}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <div>
                            <div 
                              className="flex items-center gap-1 mb-1 cursor-pointer hover:text-[#00D9A3] transition-colors"
                              onClick={() => handleViewTransaction(attribution.transaction.hash)}
                            >
                              <code className="text-xs text-gray-900">{attribution.transaction.hash}</code>
                              <ExternalLink size={12} className="text-gray-600" />
                            </div>
                            <p className="text-xs text-gray-600">
                              Wallet: {attribution.transaction.wallet}
                            </p>
                            <Badge variant="secondary" className="mt-1 text-xs text-gray-900">
                              {attribution.transaction.type}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <p className="text-gray-900 font-semibold">{attribution.transaction.value}</p>
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <Badge variant={getConfidenceBadgeVariant(attribution.confidenceScore)}>
                            {attribution.confidenceScore}%
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <p className="text-sm text-gray-900">{attribution.timeGap}</p>
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <div className="flex flex-wrap gap-1">
                            {attribution.keywords.map((keyword, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs text-gray-900 border-gray-300">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredAttributions.length === 0 && (
                <div className="text-center py-16">
                  <Filter size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-900 mb-2">No attributions found</p>
                  <p className="text-sm text-gray-600">Try adjusting your filters</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}