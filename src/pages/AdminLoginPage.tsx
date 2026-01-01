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
      // Make API call to login endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        toast.error(errorData.error || "Invalid credentials")
        setLoading(false)
        return
      }

      const data = await response.json()
      
      // Check if user is admin
      if (data.user.email !== 'contact@sociatrack.admin') {
        toast.error("Admin access required")
        setLoading(false)
        return
      }

      console.log("✅ Admin login successful")
      
      // Store the real JWT token
      localStorage.setItem('bearer_token', data.token)
      
      // Store admin session
      const adminSession = {
        user: {
          uid: data.user.id,
          email: data.user.email,
          name: `${data.user.firstName} ${data.user.lastName}`
        },
        token: data.token
      }
      
      localStorage.setItem('admin_session', JSON.stringify(adminSession))
      
      toast.success("Admin access granted!")
      
      // Small delay to ensure localStorage is saved (important for mobile)
      setTimeout(() => {
          setLoading(false)
          // Navigate to /admin on same domain to maintain backend access
          navigate("/admin")
        }, 200)

    } catch (error) {
      console.error("Admin login error:", error)
      toast.error("An error occurred during login")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{backgroundColor: '#FAF9F6'}}>
      <Card className="w-full max-w-md border border-gray-200 bg-white shadow-lg">
        <CardHeader className="space-y-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{backgroundColor: '#D4E157'}}>
              <Shield className="h-6 w-6" style={{color: '#1A1A1A'}} />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold" style={{color: '#1A1A1A'}}>Admin Panel</CardTitle>
              <CardDescription className="text-sm" style={{color: '#6B7280'}}>
                Secure admin access
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm" style={{color: '#374151'}}>Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@sociatrack.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="bg-white border-gray-300 h-11" 
                style={{
                  color: '#1A1A1A',
                  borderColor: '#D1D5DB'
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm" style={{color: '#374151'}}>Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="bg-white border-gray-300 h-11"
                style={{
                  color: '#1A1A1A',
                  borderColor: '#D1D5DB'
                }}
              />
            </div>
            <Button
              type="submit"
              className="w-full font-medium h-11 mt-6"
              style={{
                backgroundColor: '#1A1A1A',
                color: '#FFFFFF'
              }}
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
