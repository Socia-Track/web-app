"use client"

import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authClient, useSession } from "@/lib/auth-client"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

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

export default function AuthPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { data: session, isPending } = useSession()
  const [activeTab, setActiveTab] = useState<string>("login")
  const [signupType, setSignupType] = useState<string>("individual")

  // Login states
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)

  // Signup states
  const [agreed, setAgreed] = useState(false)
  const [signupLoading, setSignupLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState("")

  // Check if user is already logged in
  useEffect(() => {
    if (!isPending && session?.user) {
      navigate("/home")
    }
  }, [session, isPending, navigate])

  // Check URL parameter for mode
  useEffect(() => {
    const mode = searchParams.get("mode")
    if (mode === "signup") {
      setActiveTab("signup")
    }
  }, [searchParams])

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!loginEmail || !loginPassword) {
      toast.error("Please enter both email and password")
      return
    }

    setLoginLoading(true)

    try {
      // Check for admin credentials
      // if (loginEmail.trim() === "contact@sociatrack.admin" && loginPassword === "admin@747") {
      //   console.log("✅ Admin login detected")

      //   const adminToken = 'admin-token-' + Date.now()
      //   localStorage.setItem('bearer_token', adminToken)

      //   const mockAdminSession = {
      //     user: {
      //       uid: 'admin-uid',
      //       email: 'contact@sociatrack.admin',
      //       name: 'Admin User'
      //     },
      //     token: adminToken
      //   }

      //   localStorage.setItem('admin_session', JSON.stringify(mockAdminSession))

      //   toast.success("Admin access granted!")
      //   setLoginLoading(false)

      //   setTimeout(() => {
      //     navigate("/admin")
      //   }, 500)

      //   return
      // }

      const { data, error } = await authClient.signIn.email({
        email: loginEmail.trim(),
        password: loginPassword,
        callbackURL: "/dashboard"
      })

      if (error?.code) {
        console.error("❌ Login error:", error)
        toast.error("Invalid email or password. Please make sure you have already registered an account and try again.")
        setLoginLoading(false)
        return
      }

      if (!data) {
        console.error("❌ No user data returned")
        toast.error("Login failed - no user data")
        setLoginLoading(false)
        return
      }

      console.log("✅ Login successful, user:", data.email)
      toast.success("Welcome back!")

      setLoginLoading(false)

      setTimeout(() => {
        navigate("/home")
      }, 500)
    } catch (error) {
      console.error("Login error:", error)
      toast.error("An error occurred during login")
      setLoginLoading(false)
    }
  }

  const handleIndividualSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSignupLoading(true)
    const formData = new FormData(e.currentTarget)

    const email = (formData.get("email") as string)?.trim()
    const firstName = (formData.get("firstName") as string)?.trim()
    const lastName = (formData.get("lastName") as string)?.trim()
    const phone = (formData.get("phone") as string)?.trim()

    if (!firstName || !lastName) {
      toast.error("Please enter your first and last name")
      setSignupLoading(false)
      return
    }

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address")
      setSignupLoading(false)
      return
    }

    if (!phone) {
      toast.error("Please enter your phone number")
      setSignupLoading(false)
      return
    }

    if (!selectedRole) {
      toast.error("Please select a role")
      setSignupLoading(false)
      return
    }

    if (!agreed) {
      toast.error("Please agree to the Terms of Service and Privacy Policy")
      setSignupLoading(false)
      return
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
      const response = await fetch(`${API_URL}/api/access-requests`, {
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
        setSignupLoading(false)
        return
      }

      toast.success("Account created successfully! Please check your email for the credentials.")

      setSignupLoading(false)
      setSelectedRole("")
      setAgreed(false)
      setActiveTab("login")
    } catch (error) {
      console.error("Access request error:", error)
      toast.error("An error occurred while submitting your request")
      setSignupLoading(false)
    }
  }

  const handleOrganizationSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSignupLoading(true)
    const formData = new FormData(e.currentTarget)

    const email = (formData.get("email") as string)?.trim()
    const organizationName = (formData.get("organizationName") as string)?.trim()
    const phone = (formData.get("phone") as string)?.trim()

    if (!organizationName) {
      toast.error("Please enter your organization name")
      setSignupLoading(false)
      return
    }

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address")
      setSignupLoading(false)
      return
    }

    if (!phone) {
      toast.error("Please enter your phone number")
      setSignupLoading(false)
      return
    }

    if (!selectedRole) {
      toast.error("Please select an organization type")
      setSignupLoading(false)
      return
    }

    if (!agreed) {
      toast.error("Please agree to the Terms of Service and Privacy Policy")
      setSignupLoading(false)
      return
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
      const response = await fetch(`${API_URL}/api/access-requests`, {
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
        setSignupLoading(false)
        return
      }

      toast.success("Account created successfully! Please check your email for the credentials.")

      setSignupLoading(false)
      setSelectedRole("")
      setAgreed(false)
      setActiveTab("login")
    } catch (error) {
      console.error("Access request error:", error)
      toast.error("An error occurred while submitting your request")
      setSignupLoading(false)
    }
  }

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img
              src="/logo-48.png"
              alt="SociaTrack Logo"
              className="w-12 h-12"
            />
            <h1 className="text-3xl font-bold text-foreground">SociaTrack</h1>
          </div>
          <h2 className="text-4xl font-bold text-foreground mb-3">Welcome to SociaTrack</h2>
          <p className="text-lg text-muted-foreground">
            Log in to your account or create an account to get started
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-lg border-border/50 overflow-visible">
          <CardContent className="pt-6 overflow-visible">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 h-auto">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email Address</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loginLoading}>
                    {loginLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Signup Tab */}
              <TabsContent value="signup" className="mt-0">
                <Tabs value={signupType} onValueChange={setSignupType} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 h-auto">
                    <TabsTrigger value="individual">Individual</TabsTrigger>
                    <TabsTrigger value="organization">Organization</TabsTrigger>
                  </TabsList>

                  {/* Individual Signup */}
                  <TabsContent value="individual" className="mt-0 space-y-0">
                    <form onSubmit={handleIndividualSignup} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            placeholder="John"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            placeholder="Doe"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={selectedRole} onValueChange={setSelectedRole} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                          <SelectContent>
                            {individualRoles.map((role) => (
                              <SelectItem key={role} value={role}>
                                {role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="terms"
                          checked={agreed}
                          onCheckedChange={(checked) => setAgreed(checked as boolean)}
                        />
                        <label
                          htmlFor="terms"
                          className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          I agree to the Terms of Service and Privacy Policy
                        </label>
                      </div>
                      <Button type="submit" className="w-full" disabled={signupLoading}>
                        {signupLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* Organization Signup */}
                  <TabsContent value="organization" className="mt-0 space-y-0">
                    <form onSubmit={handleOrganizationSignup} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="organizationName">Organization Name</Label>
                        <Input
                          id="organizationName"
                          name="organizationName"
                          placeholder="Your Company"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="org-email">Email</Label>
                        <Input
                          id="org-email"
                          name="email"
                          type="email"
                          placeholder="contact@company.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="org-phone">Phone Number</Label>
                        <Input
                          id="org-phone"
                          name="phone"
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="org-type">Organization Type</Label>
                        <Select value={selectedRole} onValueChange={setSelectedRole} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select organization type" />
                          </SelectTrigger>
                          <SelectContent>
                            {organizationRoles.map((role) => (
                              <SelectItem key={role} value={role}>
                                {role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="org-terms"
                          checked={agreed}
                          onCheckedChange={(checked) => setAgreed(checked as boolean)}
                        />
                        <label
                          htmlFor="org-terms"
                          className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          I agree to the Terms of Service and Privacy Policy
                        </label>
                      </div>
                      <Button type="submit" className="w-full" disabled={signupLoading}>
                        {signupLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Request Access"
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
