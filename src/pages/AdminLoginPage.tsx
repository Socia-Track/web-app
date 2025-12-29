"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, Shield } from "lucide-react"

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error("Please enter both email and password")
      return
    }

    setLoading(true)

    try {
      // Check for admin credentials
      if (email.trim() === "admin7337@gmail.com" && password === "admin") {
        console.log("✅ Admin login successful")
        
        const adminToken = 'admin-token-' + Date.now()
        localStorage.setItem('bearer_token', adminToken)
        
        const mockAdminSession = {
          user: {
            uid: 'admin-uid',
            email: 'admin7337@gmail.com',
            name: 'Admin User'
          },
          token: adminToken
        }
        
        localStorage.setItem('admin_session', JSON.stringify(mockAdminSession))
        
        toast.success("Admin access granted!")
        setLoading(false)
        
        setTimeout(() => {
          // Redirect to app.sociatrack.com/admin
          window.location.href = "https://app.sociatrack.com/admin"
        }, 500)
        
        return
      }

      // Invalid credentials
      toast.error("Invalid admin credentials")
      setLoading(false)
    } catch (error) {
      console.error("Admin login error:", error)
      toast.error("An error occurred during login")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-950/50 backdrop-blur-sm">
        <CardHeader className="space-y-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center">
              <Shield className="h-6 w-6 text-black" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white">Admin Panel</CardTitle>
              <CardDescription className="text-zinc-500 text-sm">
                Secure admin access
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-400 text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@sociatrack.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="bg-black border-zinc-800 text-white placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-emerald-500/20 h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-400 text-sm">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="bg-black border-zinc-800 text-white placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-emerald-500/20 h-11"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-white hover:bg-zinc-200 text-black font-medium h-11 mt-6"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
