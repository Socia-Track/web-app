"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSession } from "@/lib/auth-client"
import DashboardLayout from "@/components/DashboardLayout"
import HeroHeader from "@/components/HeroHeader"
import Section from "@/components/Section"
import Highlight from "@/components/Highlight"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { motion } from "framer-motion"
import { ArrowLeft, Loader2, Link, Copy, RefreshCw, Coins } from "lucide-react"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"

export default function TokenCampaignPage() {
  const navigate = useNavigate()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [fetchingToken, setFetchingToken] = useState(false)
  const [tokenNetwork, setTokenNetwork] = useState<string>("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    objectives: "",
    platforms: [] as string[],
    originalLink: "",
    generatedLinks: {} as Record<string, string>,
    // Token fields
    tokenContractAddress: "",
    tokenName: "",
    tokenSymbol: "",
    tokenDecimals: 0,
    tokenTotalSupply: ""
  })
  const [generatingLinks, setGeneratingLinks] = useState(false)

  // Link generation states
  const [linkCounts, setLinkCounts] = useState<Record<string, number>>({
    Discord: 0,
    Twitter: 0
  })

  const [personNames, setPersonNames] = useState<Record<string, string[]>>({
    Discord: [],
    Twitter: []
  })
  const [showNameInputs, setShowNameInputs] = useState<Record<string, boolean>>({
    Discord: false,
    Twitter: false
  })

  // Fetch token metadata from Alchemy
  const fetchTokenMetadata = async () => {
    if (!formData.tokenContractAddress.trim()) {
      toast.error("Please enter a token contract address")
      return
    }

    setFetchingToken(true)
    try {
      const token = localStorage.getItem("bearer_token")
      const res = await fetch('/api/tokens/metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          contractAddress: formData.tokenContractAddress
        })
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to fetch token metadata')
        return
      }

      // Set token network
      setTokenNetwork(data.network || "Unknown")

      setFormData(prev => ({
        ...prev,
        tokenName: data.name || "",
        tokenSymbol: data.symbol || "",
        tokenDecimals: data.decimals || 0,
        tokenTotalSupply: data.totalSupply || ""
      }))

      toast.success(`Token found on ${data.network || "Unknown network"}!`)
    } catch (error) {
      console.error('Error fetching token metadata:', error)
      toast.error('Failed to fetch token metadata')
    } finally {
      setFetchingToken(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user?.uid) {
      toast.error("You must be logged in to create a campaign")
      navigate("/")
      return
    }

    if (!formData.tokenContractAddress.trim()) {
      toast.error("Token contract address is required")
      return
    }

    if (!formData.tokenSymbol) {
      toast.error("Please fetch token metadata first")
      return
    }

    setLoading(true)

    const token = localStorage.getItem("bearer_token")
    try {
      const totalLinksPlanned = Object.values(linkCounts).reduce((sum, count) => sum + count, 0)

      const plannedLinksData = {
        platforms: formData.platforms,
        linkCounts: linkCounts,
        personNames: personNames,
        totalCount: totalLinksPlanned
      }

      // POST to /api/tokens endpoint for token campaigns
      const res = await fetch('/api/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          objectives: formData.objectives,
          platforms: formData.platforms,
          blockchain: tokenNetwork.toLowerCase() || 'ethereum',
          originalLink: formData.originalLink,
          generatedLinks: formData.generatedLinks,
          contractAddress: formData.tokenContractAddress,
          promotionType: 'token',
          plannedLinks: plannedLinksData,
          totalLinksPlanned: totalLinksPlanned,
          userId: session.user.uid
        })
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to create token campaign')
        return
      }

      toast.success('Token campaign created successfully!')
      navigate(`/campaigns/${data.id}`)
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const togglePlatform = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }))
  }

  const handleLinkCountChange = (platform: string, count: string) => {
    const numCount = parseInt(count) || 0
    setLinkCounts(prev => ({
      ...prev,
      [platform]: numCount
    }))

    if (numCount > 0) {
      setPersonNames(prev => ({
        ...prev,
        [platform]: Array(numCount).fill('')
      }))
      setShowNameInputs(prev => ({
        ...prev,
        [platform]: true
      }))
    } else {
      setShowNameInputs(prev => ({
        ...prev,
        [platform]: false
      }))
    }
  }

  const handlePersonNameChange = (platform: string, index: number, name: string) => {
    setPersonNames(prev => ({
      ...prev,
      [platform]: prev[platform].map((n, i) => i === index ? name : n)
    }))
  }

  const generateTrackingLinks = async () => {
    if (!formData.originalLink || formData.platforms.length === 0) {
      toast.error("Please enter an original link and select at least one platform")
      return
    }

    if (!session?.user?.uid) {
      toast.error("You must be logged in to generate links")
      return
    }

    for (const platform of formData.platforms) {
      const count = linkCounts[platform]
      if (count > 0) {
        const names = personNames[platform] || []
        if (names.some(name => !name.trim())) {
          toast.error(`Please enter all names for ${platform}`)
          return
        }
      }
    }

    setGeneratingLinks(true)

    try {
      const token = localStorage.getItem("bearer_token")
      const allGeneratedLinks: Record<string, string> = {}

      for (const platform of formData.platforms) {
        const count = linkCounts[platform]
        const names = personNames[platform] || []

        if (count > 0 && names.length > 0) {
          for (let i = 0; i < names.length; i++) {
            const personName = names[i]
            const response = await fetch('/api/tokens/generate-links', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                originalLink: formData.originalLink,
                platforms: [platform],
                campaignName: formData.name || 'Untitled Token Campaign',
                personName: personName
              })
            })

            const data = await response.json()

            if (!response.ok) {
              toast.error(data.error || `Failed to generate tracking link for ${personName}`)
              continue
            }

            allGeneratedLinks[`${platform.toLowerCase()}_${personName}`] = data.generatedLinks[platform.toLowerCase()]
          }
        } else {
          const response = await fetch('/api/tokens/generate-links', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              originalLink: formData.originalLink,
              platforms: [platform],
              campaignName: formData.name || 'Untitled Token Campaign',
              userId: session.user.uid
            })
          })

          const data = await response.json()

          if (!response.ok) {
            toast.error(data.error || `Failed to generate tracking link for ${platform}`)
            continue
          }

          allGeneratedLinks[platform.toLowerCase()] = data.generatedLinks[platform.toLowerCase()]
        }
      }

      setFormData(prev => ({
        ...prev,
        generatedLinks: allGeneratedLinks
      }))

      toast.success('Tracking links generated successfully!')
    } catch (error) {
      console.error('Error generating links:', error)
      toast.error('Failed to generate tracking links')
    } finally {
      setGeneratingLinks(false)
    }
  }

  const copyToClipboard = (text: string, platform: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${platform} link copied to clipboard!`)
  }

  return (
    <DashboardLayout>
      {/* Hero Header */}
      <HeroHeader
        title={
          <>
            Create <Highlight>Token Campaign</Highlight>
          </>
        }
        description="Set up a new ERC20 token tracking campaign to monitor token purchases and holder growth"
        badge="Token Campaign"
        icon={
          <div className="p-4 rounded-2xl bg-accent/10">
            <Coins size={48} className="text-accent" />
          </div>
        }
        actions={
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="border-border"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
        }
      />

      {/* Form Section */}
      <Section>
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-gray-300">Campaign Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Token Launch Campaign"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="mt-2 bg-white border-border text-black"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-300">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your campaign objectives and target audience"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-2 bg-white border-border text-black min-h-24"
                />
              </div>

              <div>
                <Label htmlFor="objectives" className="text-gray-300">Campaign Objectives</Label>
                <Textarea
                  id="objectives"
                  placeholder="e.g., Drive token purchases, increase holders"
                  value={formData.objectives}
                  onChange={(e) => setFormData(prev => ({ ...prev, objectives: e.target.value }))}
                  className="mt-2 bg-white border-border text-black min-h-20"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Platform Configuration</h2>

            <div className="space-y-4">
              <div>
                <Label className="text-gray-300 mb-3 block">Social Platforms *</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div
                    className={`p-4 rounded-lg border transition-all ${formData.platforms.includes('Discord')
                      ? 'border-accent bg-accent/10'
                      : 'border-border bg-muted'
                      }`}
                  >
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={formData.platforms.includes('Discord')}
                        onCheckedChange={() => togglePlatform('Discord')}
                      />
                      <span className="text-foreground font-medium">Discord</span>
                    </label>
                  </div>

                  <div
                    className={`p-4 rounded-lg border transition-all ${formData.platforms.includes('Twitter')
                      ? 'border-accent bg-accent/10'
                      : 'border-border bg-muted'
                      }`}
                  >
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={formData.platforms.includes('Twitter')}
                        onCheckedChange={() => togglePlatform('Twitter')}
                      />
                      <span className="text-foreground font-medium">Twitter</span>
                    </label>
                  </div>
                </div>
              </div>

              {formData.platforms.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {formData.platforms.includes('Discord') && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="Discord-count" className="text-foreground">
                          How many links for Discord? *
                        </Label>
                        <Input
                          id="Discord-count"
                          type="number"
                          min="1"
                          max="50"
                          placeholder="Enter number"
                          value={linkCounts['Discord'] || ''}
                          onChange={(e) => handleLinkCountChange('Discord', e.target.value)}
                          className="mt-2 bg-white border-border text-black"
                        />
                      </div>

                      {showNameInputs['Discord'] && linkCounts['Discord'] > 0 && (
                        <div className="space-y-3 pl-4 border-l-2 border-border">
                          <Label className="text-foreground text-sm">
                            Enter names ({linkCounts['Discord']} {linkCounts['Discord'] === 1 ? 'link' : 'links'})
                          </Label>
                          {Array.from({ length: linkCounts['Discord'] }).map((_, index) => (
                            <div key={index}>
                              <Input
                                placeholder={`Person ${index + 1} name`}
                                value={personNames['Discord']?.[index] || ''}
                                onChange={(e) => handlePersonNameChange('Discord', index, e.target.value)}
                                className="bg-white border-border text-black"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {formData.platforms.includes('Twitter') && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="Twitter-count" className="text-foreground">
                          How many links for Twitter? *
                        </Label>
                        <Input
                          id="Twitter-count"
                          type="number"
                          min="1"
                          max="50"
                          placeholder="Enter number"
                          value={linkCounts['Twitter'] || ''}
                          onChange={(e) => handleLinkCountChange('Twitter', e.target.value)}
                          className="mt-2 bg-white border-border text-black"
                        />
                      </div>

                      {showNameInputs['Twitter'] && linkCounts['Twitter'] > 0 && (
                        <div className="space-y-3 pl-4 border-l-2 border-border">
                          <Label className="text-foreground text-sm">
                            Enter names ({linkCounts['Twitter']} {linkCounts['Twitter'] === 1 ? 'link' : 'links'})
                          </Label>
                          {Array.from({ length: linkCounts['Twitter'] }).map((_, index) => (
                            <div key={index}>
                              <Input
                                placeholder={`Person ${index + 1} name`}
                                value={personNames['Twitter']?.[index] || ''}
                                onChange={(e) => handlePersonNameChange('Twitter', index, e.target.value)}
                                className="bg-white border-border text-black"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Token Tracking</h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="tokenContractAddress" className="text-foreground">
                  Token Contract Address *
                </Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="tokenContractAddress"
                    placeholder="e.g., 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
                    value={formData.tokenContractAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, tokenContractAddress: e.target.value }))}
                    className="bg-white border-border text-black"
                  />
                  <Button
                    type="button"
                    onClick={fetchTokenMetadata}
                    disabled={fetchingToken || !formData.tokenContractAddress.trim()}
                    className={`px-6 whitespace-nowrap ${formData.tokenContractAddress.trim()
                      ? ''
                      : 'opacity-50 cursor-not-allowed'
                      }`}
                  >
                    {fetchingToken ? <Spinner size="sm" className="w-4 h-4" /> : <><RefreshCw size={16} className="mr-2" />Fetch</>}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  The ERC20 token contract address (click Fetch to load token details)
                </p>
              </div>

              {formData.tokenSymbol && (
                <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg space-y-3">
                  <h4 className="text-foreground font-semibold flex items-center gap-2">
                    Token Metadata
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">Verified</span>
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="text-foreground font-medium">{formData.tokenName}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Symbol:</span>
                      <span className="text-foreground font-medium">{formData.tokenSymbol}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Network:</span>
                      <span className="text-green-600 font-bold">{tokenNetwork}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Decimals:</span>
                      <span className="text-foreground font-medium">{formData.tokenDecimals}</span>
                    </div>
                    {formData.tokenTotalSupply && (
                      <div className="flex justify-between items-center py-2 border-b border-border/50">
                        <span className="text-muted-foreground">Total Supply:</span>
                        <span className="text-foreground font-medium">{formData.tokenTotalSupply} {formData.tokenSymbol}</span>
                      </div>
                    )}
                    <div className="pt-2">
                      <span className="text-gray-400 text-xs">Contract Address:</span>
                      <div className="flex items-center gap-2 mt-1 bg-black/30 p-2 rounded font-mono text-xs">
                        <span className="text-gray-300 truncate flex-1">{formData.tokenContractAddress}</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(formData.tokenContractAddress);
                            toast.success('Contract address copied!');
                          }}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 bg-muted/50 border border-border/50 rounded-lg">
                <p className="text-muted-foreground text-sm">
                  <strong>Token Campaign:</strong> We'll track when users purchase this token on DEX platforms (Uniswap, SushiSwap, etc.)
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Link className="w-5 h-5 text-foreground" />
              <h2 className="text-xl font-bold text-foreground">Link Generation</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="originalLink" className="text-foreground">Original Link</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="originalLink"
                    type="url"
                    placeholder="Enter your original link to track"
                    value={formData.originalLink}
                    onChange={(e) => setFormData(prev => ({ ...prev, originalLink: e.target.value }))}
                    className="mt-2 bg-white border-border text-black"
                  />
                  <Button
                    type="button"
                    onClick={generateTrackingLinks}
                    disabled={generatingLinks || !formData.originalLink || formData.platforms.length === 0}
                    className={`px-6 whitespace-nowrap ${formData.originalLink && formData.platforms.length > 0
                        ? ''
                        : 'opacity-50 cursor-not-allowed'
                      }`}
                  >
                    {generatingLinks ? <Spinner size="sm" className="w-4 h-4" /> : "Generate"}
                  </Button>
                </div>
                {formData.platforms.length === 0 && (
                  <p className="text-xs text-yellow-400 mt-1">
                    ⚠️ Please select at least one platform above (Discord or Twitter) to enable link generation
                  </p>
                )}
              </div>

              {Object.keys(formData.generatedLinks).length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-foreground mb-3">Generated Tracking Links</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      {Object.entries(formData.generatedLinks)
                        .filter(([key]) => key.toLowerCase().startsWith('discord'))
                        .map(([key, link]) => {
                          const parts = key.split('_')
                          const personName = parts.slice(1).join('_') || ''

                          return (
                            <div key={key} className="flex flex-col gap-2 p-3 bg-muted rounded-lg border border-border">
                              <span className="font-medium text-sm text-foreground">
                                Discord{personName && ` - ${personName}`}
                              </span>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 text-xs text-muted-foreground font-mono break-all">
                                  {link}
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(link, personName ? `Discord (${personName})` : 'Discord')}
                                  className="px-2 shrink-0"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                    </div>

                    <div className="space-y-2">
                      {Object.entries(formData.generatedLinks)
                        .filter(([key]) => key.toLowerCase().startsWith('twitter'))
                        .map(([key, link]) => {
                          const parts = key.split('_')
                          const personName = parts.slice(1).join('_') || ''

                          return (
                            <div key={key} className="flex flex-col gap-2 p-3 bg-muted rounded-lg border border-border">
                              <span className="font-medium text-sm text-foreground">
                                Twitter{personName && ` - ${personName}`}
                              </span>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 text-xs text-muted-foreground font-mono break-all">
                                  {link}
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(link, personName ? `Twitter (${personName})` : 'Twitter')}
                                  className="px-2 shrink-0"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex-1 border-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Token Campaign'
              )}
            </Button>
          </div>
        </motion.form>
      </Section>
    </DashboardLayout>
  )
}
