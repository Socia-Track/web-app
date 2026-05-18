"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient, useSession } from "@/lib/auth-client"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface LoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSwitchToSignup?: () => void
}

export default function LoginModal({ open, onOpenChange, onSwitchToSignup }: LoginModalProps) {
  const navigate = useNavigate()
  const { refetch } = useSession()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error("Please enter both email and password")
      return
    }

    setLoading(true)

    try {
      // Check for admin credentials
      if (email.trim() === "contact@sociatrack.admin" && password === "admin@747") {
        // Admin login - bypass auth system and redirect to admin page
        console.log("✅ Admin login detected")
        
        // Store mock admin session data
        const adminToken = 'admin-token-' + Date.now()
        localStorage.setItem('bearer_token', adminToken)
        
        // Create mock session data that the AdminPage can read
        const mockAdminSession = {
          user: {
            uid: 'admin-uid',
            email: 'contact@sociatrack.admin',
            name: 'Admin User'
          },
          token: adminToken
        }
        
        // Store in localStorage for AdminPage to access
        localStorage.setItem('admin_session', JSON.stringify(mockAdminSession))
        
        // Trigger a session refetch to update state
        await refetch()
        
        // Show success message
        toast.success("Admin access granted!")
        
        setLoading(false)
        onOpenChange(false)
        
        // Navigate to admin page
        setTimeout(() => {
          console.log(" Navigating to admin page...")
          navigate("/admin")
        }, 500)
        
        return
      }

      const { data, error } = await authClient.signIn.email({
        email: email.trim(),
        password,
        callbackURL: "/dashboard"
      })

      if (error?.code) {
        console.error("❌ Login error:", error)
        toast.error("Invalid email or password. Please make sure you have already registered an account and try again.")
        setLoading(false)
        return
      }

      if (!data) {
        console.error("❌ No user data returned")
        toast.error("Login failed - no user data")
        setLoading(false)
        return
      }

      console.log("✅ Login successful, user:", data.email)
      console.log("✅ Token stored in localStorage")
      console.log("✅ Token value:", localStorage.getItem('bearer_token')?.substring(0, 20) + "...")
      
      // Refetch session to update user data
      console.log("🔄 Refetching session...")
      await refetch()
      console.log("✅ Session refetched, waiting for state update...")
      
      // Show success message
      toast.success("Welcome back!")
      
      setLoading(false)
      onOpenChange(false)
      
      // Wait longer to ensure session state propagates
      console.log("⏳ Waiting 500ms before navigation...")
      setTimeout(() => {
        console.log("🚀 About to navigate to /home...")
        console.log("🚀 Current location:", window.location.href)
        navigate("/home")
        console.log("🚀 Navigate called, new location should be /home")
        
        // Fallback: if navigate doesn't work, force navigation
        setTimeout(() => {
          if (window.location.pathname !== "/home") {
            console.log("⚠️ Navigate didn't work, forcing with window.location")
            window.location.href = "/home"
          }
        }, 100)
      }, 500)
    } catch (error) {
      console.error("Login error:", error)
      toast.error("An error occurred during login")
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Login to SociaTrack</DialogTitle>
          <DialogDescription>
            Enter your credentials to access your account
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">Email Address</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </div>
          
          <div className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => {
                onOpenChange(false)
                onSwitchToSignup?.()
              }}
              className="text-primary hover:underline"
            >
              Sign up here
            </button>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}