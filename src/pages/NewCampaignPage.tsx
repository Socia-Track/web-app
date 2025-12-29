"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSession } from "@/lib/auth-client"
import DashboardLayout from "@/components/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { motion } from "framer-motion"
import { ArrowLeft, Loader2, Link, Copy, Plus } from "lucide-react"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"

export default function NewCampaignPage() {
  const navigate = useNavigate()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    objectives: "",
    platforms: [] as string[],
    blockchain: "Ethereum",
    originalLink: "",
    generatedLinks: {} as Record<string, string>,
    // NFT Promotion fields
    promotionType: "collection" as "single" | "collection",
    contractAddress: "",
    tokenIds: [] as string[]
  })
  const [generatingLinks, setGeneratingLinks] = useState(false)
  
  // New state for dynamic link generation
  const [linkCounts, setLinkCounts] = useState<Record<string, number>>({
    Discord: 0,
    Twitter: 0
  })
  
  // State for managing tokenId inputs
  const [tokenIdInput, setTokenIdInput] = useState("")
  const [personNames, setPersonNames] = useState<Record<string, string[]>>({
    Discord: [],
    Twitter: []
  })
  const [showNameInputs, setShowNameInputs] = useState<Record<string, boolean>>({
    Discord: false,
    Twitter: false
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
    const numCount = parseInt(count) || 0
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-4xl">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="mb-4 text-sm sm:text-base"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back
              </Button>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-[#1F2937]">
                Create New Campaign
              </h1>
              <p className="text-sm sm:text-base text-[#6B7280]">Set up a new Web3 marketing attribution campaign</p>
            </div>

            {/* Form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="rounded-xl border border-gray-200 bg-gray-100 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-900">Campaign Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., NFT Launch Campaign"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      className="mt-2 bg-white border-gray-200 text-gray-900"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-gray-900">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your campaign objectives and target audience"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="mt-2 bg-white border-gray-200 text-gray-900 min-h-24"
                    />
                  </div>

                  <div>
                    <Label htmlFor="objectives" className="text-gray-900">Campaign Objectives</Label>
                    <Textarea
                      id="objectives"
                      placeholder="e.g., Drive NFT mints, increase token holders"
                      value={formData.objectives}
                      onChange={(e) => setFormData(prev => ({ ...prev, objectives: e.target.value }))}
                      className="mt-2 bg-gray-50 border-gray-200 text-gray-900 min-h-20"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-100 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Configuration</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-900 mb-3 block">Social Platforms *</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {/* Discord - Left Side */}
                      <div
                        className={`p-4 rounded-lg border transition-all ${
                          formData.platforms.includes('Discord')
                            ? 'border-green-600 bg-green-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={formData.platforms.includes('Discord')}
                            onCheckedChange={() => togglePlatform('Discord')}
                          />
                          <span className="text-[#1F2937] font-medium">Discord</span>
                        </label>
                      </div>

                      {/* Twitter - Right Side */}
                      <div
                        className={`p-4 rounded-lg border transition-all ${
                          formData.platforms.includes('Twitter')
                            ? 'border-green-600 bg-green-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={formData.platforms.includes('Twitter')}
                            onCheckedChange={() => togglePlatform('Twitter')}
                          />
                          <span className="text-[#1F2937] font-medium">Twitter</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Show link count inputs for selected platforms in grid layout */}
                  {formData.platforms.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      {/* Discord Column - Left */}
                      {formData.platforms.includes('Discord') && (
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="Discord-count" className="text-[#1F2937]">
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
                              className="mt-2 bg-white border-gray-200 text-[#1F2937]"
                            />
                          </div>

                          {/* Show person name inputs after count is entered */}
                          {showNameInputs['Discord'] && linkCounts['Discord'] > 0 && (
                            <div className="space-y-3 pl-4 border-l-2 border-green-500">
                              <Label className="text-[#1F2937] text-sm">
                                Enter names ({linkCounts['Discord']} {linkCounts['Discord'] === 1 ? 'link' : 'links'})
                              </Label>
                              {Array.from({ length: linkCounts['Discord'] }).map((_, index) => (
                                <div key={index}>
                                  <Input
                                    placeholder={`Person ${index + 1} name`}
                                    value={personNames['Discord']?.[index] || ''}
                                    onChange={(e) => handlePersonNameChange('Discord', index, e.target.value)}
                                    className="bg-white border-gray-200 text-[#1F2937]"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Twitter Column - Right */}
                      {formData.platforms.includes('Twitter') && (
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="Twitter-count" className="text-[#1F2937]">
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
                              className="mt-2 bg-white border-gray-200 text-[#1F2937]"
                            />
                          </div>

                          {/* Show person name inputs after count is entered */}
                          {showNameInputs['Twitter'] && linkCounts['Twitter'] > 0 && (
                            <div className="space-y-3 pl-4 border-l-2 border-green-500">
                              <Label className="text-[#1F2937] text-sm">
                                Enter names ({linkCounts['Twitter']} {linkCounts['Twitter'] === 1 ? 'link' : 'links'})
                              </Label>
                              {Array.from({ length: linkCounts['Twitter'] }).map((_, index) => (
                                <div key={index}>
                                  <Input
                                    placeholder={`Person ${index + 1} name`}
                                    value={personNames['Twitter']?.[index] || ''}
                                    onChange={(e) => handlePersonNameChange('Twitter', index, e.target.value)}
                                    className="bg-white border-gray-200 text-[#1F2937]"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <Label htmlFor="blockchain" className="text-[#1F2937]">Blockchain *</Label>
                    <Select 
                      value={formData.blockchain}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, blockchain: value }))}
                    >
                      <SelectTrigger className="mt-2 bg-gray-50 border-gray-200 text-gray-900">
                        <SelectValue placeholder="Select blockchain" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ethereum">Ethereum</SelectItem>
                        {/*<SelectItem value="Polygon">Polygon</SelectItem>
                        <SelectItem value="Solana">Solana</SelectItem>
                        <SelectItem value="Base">Base</SelectItem>
                        <SelectItem value="Arbitrum">Arbitrum</SelectItem>
                        <SelectItem value="Optimism">Optimism</SelectItem>*/}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-100 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">NFT Promotion Tracking</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-900 mb-3 block">Promotion Type *</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div
                        className={`p-4 rounded-lg border transition-all cursor-pointer ${
                          formData.promotionType === 'collection'
                            ? 'border-green-600 bg-green-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, promotionType: 'collection', tokenIds: [] }))}
                      >
                        <div className="text-[#1F2937] font-medium mb-2">Collection Promotion</div>
                        <div className="text-[#6B7280] text-sm">Track purchases of any NFT from a collection</div>
                      </div>
                      
                      <div
                        className={`p-4 rounded-lg border transition-all cursor-pointer ${
                          formData.promotionType === 'single'
                            ? 'border-green-600 bg-green-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, promotionType: 'single' }))}
                      >
                        <div className="text-[#1F2937] font-medium mb-2">Single NFT Promotion</div>
                        <div className="text-[#6B7280] text-sm">Track purchases of specific NFT(s) by token ID</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="contractAddress" className="text-[#1F2937]">
                      Contract Address *
                    </Label>
                    <Input
                      id="contractAddress"
                      placeholder="e.g., 0x1234567890abcdef..."
                      value={formData.contractAddress}
                      onChange={(e) => setFormData(prev => ({ ...prev, contractAddress: e.target.value }))}
                      className="mt-2 bg-white border-gray-200 text-[#1F2937]"
                    />
                    <p className="text-xs text-[#6B7280] mt-1">
                      The smart contract address of the NFT collection
                    </p>
                  </div>

                  {formData.promotionType === 'single' && (
                    <div>
                      <Label className="text-[#1F2937] mb-2 block">Token IDs *</Label>
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
                            className="bg-white border-gray-200 text-[#1F2937]"
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
                            className="px-4 bg-green-600 hover:bg-green-700 text-white"
                          >
                            Add
                          </Button>
                        </div>
                        
                        {formData.tokenIds.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm text-[#6B7280]">Added Token IDs:</p>
                            <div className="flex flex-wrap gap-2">
                              {formData.tokenIds.map((tokenId, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full text-sm text-green-700"
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
                                    className="text-green-600 hover:text-green-800 ml-1"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <p className="text-xs text-[#6B7280]">
                          For single NFT promotion, specify which exact tokens to track. Press Enter or click Add to add each token ID.
                        </p>
                      </div>
                    </div>
                  )}

                  {formData.promotionType === 'collection' && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-700 text-sm">
                        <strong>Collection Promotion:</strong> We'll track when users purchase any NFT from this collection using the contract address. No specific token IDs needed.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Link className="w-5 h-5 text-gray-900" />
                  <h2 className="text-xl font-bold text-gray-900">Link Generation</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="originalLink" className="text-gray-900">Original Link</Label>
                    <div className="flex gap-2 mt-2">
                      <Input 
                        id="originalLink"
                        type="url"
                        placeholder="Enter your original link to track"
                        value={formData.originalLink}
                        onChange={(e) => setFormData(prev => ({ ...prev, originalLink: e.target.value }))}
                        className="bg-white border-gray-200 text-gray-900"
                      />
                      <Button 
                        type="button" 
                        onClick={generateTrackingLinks}
                        disabled={generatingLinks || !formData.originalLink || formData.platforms.length === 0}
                        className={`px-6 whitespace-nowrap ${
                          formData.originalLink && formData.platforms.length > 0
                            ? 'bg-green-600 hover:bg-green-700 text-white font-semibold'
                            : 'bg-gray-300 text-gray-500'
                        }`}
                      >
                        {generatingLinks ? <Spinner size="sm" className="w-4 h-4" /> : "Generate"}
                      </Button>
                    </div>
                  </div>

                  {Object.keys(formData.generatedLinks).length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-[#1F2937] mb-3">Generated Tracking Links</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {/* Discord Links - Left Column */}
                        <div className="space-y-2">
                          {Object.entries(formData.generatedLinks)
                            .filter(([key]) => key.toLowerCase().startsWith('discord'))
                            .map(([key, link]) => {
                              const parts = key.split('_')
                              const personName = parts.slice(1).join('_') || ''
                              
                              return (
                                <div key={key} className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                  <span className="font-medium text-sm text-[#1F2937]">
                                    Discord{personName && ` - ${personName}`}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 text-xs text-[#6B7280] font-mono break-all">
                                      {link}
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => copyToClipboard(link, personName ? `Discord (${personName})` : 'Discord')}
                                      className="px-2 text-[#6B7280] hover:text-[#1F2937] shrink-0"
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
                                <div key={key} className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                  <span className="font-medium text-sm text-[#1F2937]">
                                    Twitter{personName && ` - ${personName}`}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 text-xs text-[#6B7280] font-mono break-all">
                                      {link}
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => copyToClipboard(link, personName ? `Twitter (${personName})` : 'Twitter')}
                                      className="px-2 text-[#6B7280] hover:text-[#1F2937] shrink-0"
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
                  className="flex-1 border-gray-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
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
      </div>
    </DashboardLayout>
  )
}