"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { authClient, useSession } from "@/lib/auth-client"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface SignupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSwitchToLogin?: () => void
}

const individualRoles = [
  "Founder",
  "Marketing Manager",
  "Community Manager",
  "Social Media Manager",
  "Creator",
  "Agency Owner"
]

const organizationRoles = [
  "Web3 Marketing Agency",
  "Web3 Gaming Studio",
  "Crypto Startup / dApp",
  "NFT Marketplace",
  "Launchpad / Minting Platform",
  "DAO / Community"
]

export default function SignupModal({ open, onOpenChange, onSwitchToLogin }: SignupModalProps) {
  const navigate = useNavigate()
  const { refetch } = useSession()
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState("")

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleIndividualSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    const email = (formData.get("email") as string)?.trim()
    const firstName = (formData.get("firstName") as string)?.trim()
    const lastName = (formData.get("lastName") as string)?.trim()
    const phone = (formData.get("phone") as string)?.trim()

    // Validation
    if (!firstName || !lastName) {
      toast.error("Please enter your first and last name")
      setLoading(false)
      return
    }

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address")
      setLoading(false)
      return
    }

    if (!phone) {
      toast.error("Please enter your phone number")
      setLoading(false)
      return
    }

    if (!selectedRole) {
      toast.error("Please select a role")
      setLoading(false)
      return
    }

    if (!agreed) {
      toast.error("Please agree to the Terms of Service and Privacy Policy")
      setLoading(false)
      return
    }

    try {
      // Submit access request instead of creating account
      const response = await fetch('/api/access-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          phoneNumber: phone,
          role: selectedRole,
          accountType: "individual"
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 409) {
          toast.error("An access request with this email already exists or the email is already registered.")
        } else {
          toast.error(errorData.error || "Failed to submit access request. Please try again.")
        }
        setLoading(false)
        return
      }

      toast.success("Account created successfully! Please check your email for the credentials.")
      
      setLoading(false)
      onOpenChange(false)
      
      // Reset form
      setSelectedRole("")
      setAgreed(false)
    } catch (error) {
      console.error("Access request error:", error)
      toast.error("An error occurred while submitting your request")
      setLoading(false)
    }
  }

  const handleOrganizationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    const email = (formData.get("email") as string)?.trim()
    const organizationName = (formData.get("organizationName") as string)?.trim()
    const phone = (formData.get("phone") as string)?.trim()

    // Validation
    if (!organizationName) {
      toast.error("Please enter your organization name")
      setLoading(false)
      return
    }

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address")
      setLoading(false)
      return
    }

    if (!phone) {
      toast.error("Please enter your phone number")
      setLoading(false)
      return
    }

    if (!selectedRole) {
      toast.error("Please select a role")
      setLoading(false)
      return
    }

    if (!agreed) {
      toast.error("Please agree to the Terms of Service and Privacy Policy")
      setLoading(false)
      return
    }

    try {
      // Submit access request instead of creating account
      const response = await fetch('/api/access-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          organizationName,
          phoneNumber: phone,
          role: selectedRole,
          accountType: "organization"
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 409) {
          toast.error("An access request with this email already exists or the email is already registered.")
        } else {
          toast.error(errorData.error || "Failed to submit access request. Please try again.")
        }
        setLoading(false)
        return
      }

      toast.success("Account created successfully! Please check your email for the credentials.")
      
      setLoading(false)
      onOpenChange(false)
      
      // Reset form
      setSelectedRole("")
      setAgreed(false)
    } catch (error) {
      console.error("Access request error:", error)
      toast.error("An error occurred while submitting your request")
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Account Access</DialogTitle>
          <DialogDescription>
            Submit your details for account approval. You'll receive login credentials once approved by an administrator.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="individual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individual">Individual</TabsTrigger>
            <TabsTrigger value="organization">Organization</TabsTrigger>
          </TabsList>

          {/* Individual Signup */}
          <TabsContent value="individual">
            <form onSubmit={handleIndividualSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ind-role">Select Role *</Label>
                <Select name="role" required value={selectedRole} onValueChange={setSelectedRole} disabled={loading}>
                  <SelectTrigger id="ind-role">
                    <SelectValue placeholder="Choose your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {individualRoles.map((role) => (
                      <SelectItem key={role} value={role.toLowerCase().replace(/\s+/g, '-') }>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="John"
                    required
                    disabled={loading}
                    autoComplete="given-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    required
                    disabled={loading}
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="indEmail">Email Address *</Label>
                <Input
                  id="indEmail"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="indPhone">Phone Number *</Label>
                <Input
                  id="indPhone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  required
                  disabled={loading}
                  autoComplete="tel"
                />
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="indAgreement"
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(checked as boolean)}
                  disabled={loading}
                />
                <label
                  htmlFor="indAgreement"
                  className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the Terms of Service and Privacy Policy *
                </label>
              </div>

              <div className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    onOpenChange(false)
                    onSwitchToLogin?.()
                  }}
                  className="text-primary hover:underline"
                >
                  Login here
                </button>
              </div>

              <Button type="submit" className="w-full" disabled={!agreed || loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting Request...
                  </>
                ) : (
                  "Request Access"
                )}
              </Button>
            </form>
          </TabsContent>

          {/* Organization Signup */}
          <TabsContent value="organization">
            <form onSubmit={handleOrganizationSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="org-role">Select Role *</Label>
                <Select name="role" required value={selectedRole} onValueChange={setSelectedRole} disabled={loading}>
                  <SelectTrigger id="org-role">
                    <SelectValue placeholder="Choose your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizationRoles.map((role) => (
                      <SelectItem key={role} value={role.toLowerCase().replace(/\s+/g, '-') }>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizationName">Organization Name *</Label>
                <Input
                  id="organizationName"
                  name="organizationName"
                  type="text"
                  placeholder="Acme Inc."
                  required
                  disabled={loading}
                  autoComplete="organization"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgEmail">Email Address *</Label>
                <Input
                  id="orgEmail"
                  name="email"
                  type="email"
                  placeholder="your@company.com"
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgPhone">Phone Number *</Label>
                <Input
                  id="orgPhone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  required
                  disabled={loading}
                  autoComplete="tel"
                />
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="orgAgreement"
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(checked as boolean)}
                  disabled={loading}
                />
                <label
                  htmlFor="orgAgreement"
                  className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the Terms of Service and Privacy Policy *
                </label>
              </div>

              <div className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    onOpenChange(false)
                    onSwitchToLogin?.()
                  }}
                  className="text-primary hover:underline"
                >
                  Login here
                </button>
              </div>

              <Button type="submit" className="w-full" disabled={!agreed || loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting Request...
                  </>
                ) : (
                  "Request Access"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}