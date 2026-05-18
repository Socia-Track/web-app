"use client"

import { useState, useEffect } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { motion } from "framer-motion"
import { ArrowLeft, Loader2, Link, Copy, Plus, Rocket } from "lucide-react"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { useNetworks } from "@/hooks/useNetworks"
import NetworkSelector from "@/components/NetworkSelector"

export default function NewCampaignPage() {
  const navigate = useNavigate()
  const { data: session } = useSession()
  const { networks, loading: networksLoading, error: networksError } = useNetworks()
  const [loading, setLoading] = useState(false)
  const [maxLinksPerCampaign, setMaxLinksPerCampaign] = useState(50)

  // Custom platforms management
  const [customPlatforms, setCustomPlatforms] = useState<string[]>(() => {
    const saved = localStorage.getItem('customPlatforms')
    return saved ? JSON.parse(saved) : []
  })
  const [newPlatformName, setNewPlatformName] = useState('')
  const [showAddPlatform, setShowAddPlatform] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    objectives: "",
    platforms: [] as string[],
    blockchain: "",
    originalLink: "",
    generatedLinks: {} as Record<string, string>,
    // NFT Promotion fields
    promotionType: "collection" as "single" | "collection",
    contractAddress: "",
    tokenIds: [] as string[]
  })
  const [generatingLinks, setGeneratingLinks] = useState(false)

  // Set default blockchain when networks are loaded
  useEffect(() => {
    if (networks.length > 0 && !formData.blockchain) {
      setFormData(prev => ({ ...prev, blockchain: networks[0].key }))
    }
  }, [networks, formData.blockchain])

  // Fetch user's linksPerCampaign limit
  useEffect(() => {
    const fetchLinkLimit = async () => {
      if (!session?.user?.uid) return
      const token = localStorage.getItem('bearer_token')
      try {
        const res = await fetch(`/api/users/${session.user.uid}/limits`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          if (data.limits?.linksPerCampaign) {
            setMaxLinksPerCampaign(data.limits.linksPerCampaign)
          }
        }
      } catch (err) {
        console.error('Failed to fetch link limits:', err)
      }
    }
    fetchLinkLimit()
  }, [session?.user?.uid])

  // Get all available platforms (default + custom)
  const allPlatforms = ['Discord', 'Twitter', ...customPlatforms]

  // New state for dynamic link generation - initialize with all platforms
  const [linkCounts, setLinkCounts] = useState<Record<string, number>>(() => {
    const counts: Record<string, number> = { Discord: 0, Twitter: 0 }
    customPlatforms.forEach(p => counts[p] = 0)
    return counts
  })

  // State for managing tokenId inputs
  const [tokenIdInput, setTokenIdInput] = useState("")
  const [personNames, setPersonNames] = useState<Record<string, string[]>>(() => {
    const names: Record<string, string[]> = { Discord: [], Twitter: [] }
    customPlatforms.forEach(p => names[p] = [])
    return names
  })
  const [showNameInputs, setShowNameInputs] = useState<Record<string, boolean>>(() => {
    const inputs: Record<string, boolean> = { Discord: false, Twitter: false }
    customPlatforms.forEach(p => inputs[p] = false)
    return inputs
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user?.uid) {
      toast.error("You must be logged in to create a campaign")
      navigate("/")
      return
    }

    // Validate NFT promotion fields
    if (!formData.contractAddress.trim()) {
      toast.error("Contract address is required")
      return
    }

    if (formData.promotionType === 'single' && formData.tokenIds.length === 0) {
      toast.error("At least one token ID is required for single NFT promotion")
      return
    }

    setLoading(true)

    const token = localStorage.getItem("bearer_token")
    try {
      // Calculate total planned links
      const totalLinksPlanned = Object.values(linkCounts).reduce((sum, count) => sum + count, 0)

      // Prepare planned links data
      const plannedLinksData = {
        platforms: formData.platforms,
        linkCounts: linkCounts,
        personNames: personNames,
        totalCount: totalLinksPlanned
      }

      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          userId: session.user.uid,
          platforms: JSON.stringify(formData.platforms),
          tokenIds: JSON.stringify(formData.tokenIds),
          plannedLinks: plannedLinksData,
          totalLinksPlanned: totalLinksPlanned
        })
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to create campaign')
        return
      }

      toast.success('Campaign created successfully!')
      navigate(`/campaigns/${data.id}`)
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const addCustomPlatform = () => {
    const platformName = newPlatformName.trim()
    if (!platformName) {
      toast.error('Platform name cannot be empty')
      return
    }

    if (allPlatforms.includes(platformName)) {
      toast.error('Platform already exists')
      return
    }

    const updatedCustomPlatforms = [...customPlatforms, platformName]
    setCustomPlatforms(updatedCustomPlatforms)
    localStorage.setItem('customPlatforms', JSON.stringify(updatedCustomPlatforms))

    // Initialize states for new platform
    setLinkCounts(prev => ({ ...prev, [platformName]: 0 }))
    setPersonNames(prev => ({ ...prev, [platformName]: [] }))
    setShowNameInputs(prev => ({ ...prev, [platformName]: false }))

    setNewPlatformName('')
    setShowAddPlatform(false)
    toast.success(`${platformName} added successfully!`)
  }

  const togglePlatform = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }))
  }

  // Handle link count change
  const handleLinkCountChange = (platform: string, count: string) => {
    let numCount = parseInt(count) || 0

    // Enforce linksPerCampaign limit across all platforms
    const otherPlatformLinks = Object.entries(linkCounts)
      .filter(([p]) => p !== platform)
      .reduce((sum, [, c]) => sum + c, 0)
    const maxForThisPlatform = Math.max(0, maxLinksPerCampaign - otherPlatformLinks)
    if (numCount > maxForThisPlatform) {
      numCount = maxForThisPlatform
      toast.error(`Total links across all platforms cannot exceed ${maxLinksPerCampaign} (your plan limit)`)
    }

    setLinkCounts(prev => ({
      ...prev,
      [platform]: numCount
    }))

    // Initialize person names array
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

  // Handle person name change
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

    // Check if all person names are filled for selected platforms
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

      // Generate links for each person on each platform
      const allGeneratedLinks: Record<string, string> = {}

      for (const platform of formData.platforms) {
        const count = linkCounts[platform]
        const names = personNames[platform] || []

        if (count > 0 && names.length > 0) {
          // Generate multiple links for this platform
          for (let i = 0; i < names.length; i++) {
            const personName = names[i]
            const response = await fetch('/api/campaigns/generate-links', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                originalLink: formData.originalLink,
                platforms: [platform],
                campaignName: formData.name || 'Untitled Campaign',
                personName: personName
              })
            })

            const data = await response.json()

            if (!response.ok) {
              toast.error(data.error || `Failed to generate tracking link for ${personName}`)
              continue
            }

            // Store with person name as key
            allGeneratedLinks[`${platform.toLowerCase()}_${personName}`] = data.generatedLinks[platform.toLowerCase()]
          }
        } else {
          // Generate single link for this platform
          const response = await fetch('/api/campaigns/generate-links', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              originalLink: formData.originalLink,
              platforms: [platform],
              campaignName: formData.name || 'Untitled Campaign',
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
            Create <Highlight>New Campaign</Highlight>
          </>
        }
        description="Set up a new Web3 marketing attribution campaign to track your NFT or token promotions"
        badge="Campaign Setup"
        icon={
          <div className="p-4 rounded-2xl bg-accent/10">
            <Rocket size={48} className="text-accent" />
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
                <Label htmlFor="name" className="text-foreground">Campaign Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., NFT Launch Campaign"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-foreground">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your campaign objectives and target audience"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-2 min-h-24"
                />
              </div>

              <div>
                <Label htmlFor="objectives" className="text-foreground">Campaign Objectives</Label>
                <Textarea
                  id="objectives"
                  placeholder="e.g., Drive NFT mints, increase token holders"
                  value={formData.objectives}
                  onChange={(e) => setFormData(prev => ({ ...prev, objectives: e.target.value }))}
                  className="mt-2 min-h-20"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Platform Configuration</h2>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-foreground">Social Platforms *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddPlatform(!showAddPlatform)}
                    className="text-xs"
                  >
                    {showAddPlatform ? 'Cancel' : '+ Add Platform'}
                  </Button>
                </div>

                {showAddPlatform && (
                  <div className="flex gap-2 mb-3 p-3 bg-muted rounded-lg border border-border">
                    <Input
                      placeholder="Enter platform name (e.g., LinkedIn, Instagram)"
                      value={newPlatformName}
                      onChange={(e) => setNewPlatformName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addCustomPlatform()}
                      className=""
                    />
                    <Button
                      type="button"
                      onClick={addCustomPlatform}
                      size="sm"
                    >
                      Add
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {allPlatforms.map(platform => (
                    <div
                      key={platform}
                      className={`p-4 rounded-lg border transition-all ${formData.platforms.includes(platform)
                          ? 'border-accent bg-accent/10'
                          : 'border-border bg-muted'
                        }`}
                    >
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={formData.platforms.includes(platform)}
                          onCheckedChange={() => togglePlatform(platform)}
                        />
                        <span className="text-foreground font-medium">{platform}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Show link count inputs for selected platforms in grid layout */}
              {formData.platforms.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {formData.platforms.map(platform => (
                    <div key={platform} className="space-y-3">
                      <div>
                        <Label htmlFor={`${platform}-count`} className="text-foreground">
                          How many links for {platform}? *
                        </Label>
                        <Input
                          id={`${platform}-count`}
                          type="number"
                          min="1"
                          max={maxLinksPerCampaign}
                          placeholder={`Enter number (max ${maxLinksPerCampaign})`}
                          value={linkCounts[platform] || ''}
                          onChange={(e) => handleLinkCountChange(platform, e.target.value)}
                          className="mt-2"
                        />
                      </div>

                      {/* Show person name inputs after count is entered */}
                      {showNameInputs[platform] && linkCounts[platform] > 0 && (
                        <div className="space-y-3 pl-4 border-l-2 border-border">
                          <Label className="text-foreground text-sm">
                            Enter names ({linkCounts[platform]} {linkCounts[platform] === 1 ? 'link' : 'links'})
                          </Label>
                          {Array.from({ length: linkCounts[platform] }).map((_, index) => (
                            <div key={index}>
                              <Input
                                placeholder={`Person ${index + 1} name`}
                                value={personNames[platform]?.[index] || ''}
                                onChange={(e) => handlePersonNameChange(platform, index, e.target.value)}
                                className=""
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <NetworkSelector
                value={formData.blockchain}
                onValueChange={(value) => setFormData(prev => ({ ...prev, blockchain: value }))}
                label="Blockchain"
                required={true}
                showCurrency={true}
                showChainId={false}
                className=""
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">NFT Promotion Tracking</h2>

            <div className="space-y-4">
              <div>
                <Label className="text-foreground mb-3 block">Promotion Type *</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${formData.promotionType === 'collection'
                      ? 'border-accent bg-accent/10'
                      : 'border-border bg-muted'
                      }`}
                    onClick={() => setFormData(prev => ({ ...prev, promotionType: 'collection', tokenIds: [] }))}
                  >
                    <div className="text-foreground font-medium mb-2">Collection Promotion</div>
                    <div className="text-muted-foreground text-sm">Track purchases of any NFT from a collection</div>
                  </div>

                  <div
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${formData.promotionType === 'single'
                      ? 'border-accent bg-accent/10'
                      : 'border-border bg-muted'
                      }`}
                    onClick={() => setFormData(prev => ({ ...prev, promotionType: 'single' }))}
                  >
                    <div className="text-foreground font-medium mb-2">Single NFT Promotion</div>
                    <div className="text-muted-foreground text-sm">Track purchases of specific NFT(s) by token ID</div>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="contractAddress" className="text-foreground">
                  Contract Address *
                </Label>
                <Input
                  id="contractAddress"
                  placeholder="e.g., 0x1234567890abcdef..."
                  value={formData.contractAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, contractAddress: e.target.value }))}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  The smart contract address of the NFT collection
                </p>
              </div>

              {formData.promotionType === 'single' && (
                <div>
                  <Label className="text-foreground mb-2 block">Token IDs *</Label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter token ID (e.g., 1234)"
                        value={tokenIdInput}
                        onChange={(e) => setTokenIdInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            if (tokenIdInput.trim() && !formData.tokenIds.includes(tokenIdInput.trim())) {
                              setFormData(prev => ({
                                ...prev,
                                tokenIds: [...prev.tokenIds, tokenIdInput.trim()]
                              }))
                              setTokenIdInput("")
                            }
                          }
                        }}
                        className=""
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          if (tokenIdInput.trim() && !formData.tokenIds.includes(tokenIdInput.trim())) {
                            setFormData(prev => ({
                              ...prev,
                              tokenIds: [...prev.tokenIds, tokenIdInput.trim()]
                            }))
                            setTokenIdInput("")
                          }
                        }}
                        className="px-4 bg-white/10 hover:bg-white/20 text-white border border-white/10"
                      >
                        Add
                      </Button>
                    </div>

                    {formData.tokenIds.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Added Token IDs:</p>
                        <div className="flex flex-wrap gap-2">
                          {formData.tokenIds.map((tokenId, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-sm text-white"
                            >
                              <span>{tokenId}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    tokenIds: prev.tokenIds.filter((_, i) => i !== index)
                                  }))
                                }}
                                className="text-gray-400 hover:text-white ml-1"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                      For single NFT promotion, specify which exact tokens to track. Press Enter or click Add to add each token ID.
                    </p>
                  </div>
                </div>
              )}

              {formData.promotionType === 'collection' && (
                <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <p className="text-blue-300 text-sm">
                    <strong>Collection Promotion:</strong> We'll track when users purchase any NFT from this collection using the contract address. No specific token IDs needed.
                  </p>
                </div>
              )}
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
                    className="bg-black/50 border-white/10 text-white"
                  />
                  <Button
                    type="button"
                    onClick={generateTrackingLinks}
                    disabled={generatingLinks || !formData.originalLink || formData.platforms.length === 0}
                    className={`px-6 whitespace-nowrap ${formData.originalLink && formData.platforms.length > 0
                      ? 'bg-linear-to-r from-white to-gray-200 text-black hover:from-gray-100 hover:to-gray-300 font-semibold'
                      : 'bg-gray-700 text-gray-400'
                      }`}
                  >
                    {generatingLinks ? <Spinner size="sm" className="w-4 h-4" /> : "Generate"}
                  </Button>
                </div>
              </div>

              {Object.keys(formData.generatedLinks).length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-foreground mb-3">Generated Tracking Links</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Discord Links - Left Column */}
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
                                  className="px-2 text-gray-300 hover:text-white shrink-0"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                    </div>

                    {/* Twitter Links - Right Column */}
                    <div className="space-y-2">
                      {Object.entries(formData.generatedLinks)
                        .filter(([key]) => key.toLowerCase().startsWith('twitter'))
                        .map(([key, link]) => {
                          const parts = key.split('_')
                          const personName = parts.slice(1).join('_') || ''

                          return (
                            <div key={key} className="flex flex-col gap-2 p-3 bg-black/30 rounded-lg border border-white/10">
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
                                  className="px-2 text-gray-300 hover:text-white shrink-0"
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
              className="flex-1 border-white/10"
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
                'Create Campaign'
              )}
            </Button>
          </div>
        </motion.form>
      </Section>
    </DashboardLayout>
  )
}