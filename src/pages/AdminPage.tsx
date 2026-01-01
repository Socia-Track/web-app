"use client"

import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useSession, authClient } from "@/lib/auth-client"
import { motion } from "framer-motion"
import { 
  Users, 
  TrendingUp, 
  AlertCircle,
  RefreshCw,
  Check,
  X,
  Crown,
  LogOut,
  Calendar,
  Mail,
  Phone,
  Building,
  User as UserIcon,
  Key,
  UserCog,
  Shield,
  Eye
} from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface AccessRequest {
  id: string
  email: string
  firstName?: string
  lastName?: string
  organizationName?: string
  phoneNumber?: string
  role: string
  accountType: string
  status: string
  rejectionReason?: string
  createdAt: string
  requestData?: any
}

export default function AdminPage() {
  const navigate = useNavigate()
  const { data: session, isPending } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [showRejectionDialog, setShowRejectionDialog] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [activeView, setActiveView] = useState<'requests' | 'users'>('requests')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showLimitsDialog, setShowLimitsDialog] = useState(false)
  const [maxItems, setMaxItems] = useState(3)

  // Check admin access
  useEffect(() => {
    // Add a small delay to ensure localStorage is properly loaded (important for mobile)
    const checkAdminAccess = () => {
      // Check for admin session (from AdminLoginPage)
      const adminSession = localStorage.getItem('admin_session')
      if (adminSession) {
        try {
          const mockSession = JSON.parse(adminSession)
          if (mockSession.user?.email === 'contact@sociatrack.admin') {
            console.log("✅ Admin session verified")
            return true // Allow access
          }
        } catch (e) {
          console.log("❌ Invalid admin session data")
          localStorage.removeItem('admin_session')
        }
      }
      return false
    }

    // Small delay for mobile browsers to finish localStorage operations
    const timer = setTimeout(() => {
      if (checkAdminAccess()) {
        return // Access granted
      }

      // If no valid admin session, redirect to home
      console.log("❌ No admin session found, redirecting to home")
      navigate("/")
    }, 150)

    return () => clearTimeout(timer)
  }, [navigate])

  const fetchAccessRequests = async () => {
    // Check if we have admin access (either through regular session or admin bypass)
    const adminSession = localStorage.getItem('admin_session')
    const hasAdminAccess = (session?.user?.uid) || (adminSession && JSON.parse(adminSession).user?.email === 'contact@sociatrack.admin')
    
    if (!hasAdminAccess) return
    
    setLoading(true)
    setError(null)
    
    const token = localStorage.getItem("bearer_token")
    
    // For admin bypass, we don't need a real token since we're using mock data
    if (!token && !adminSession) {
      setError("Authentication token not found. Please log in again.")
      setLoading(false)
      return
    }

    try {
      // Fetch from actual API
      const response = await fetch('/api/access-requests', {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch access requests')
      }

      const requests = await response.json()
      setAccessRequests(requests)
      console.log('✅ Loaded access requests:', requests)
    } catch (error) {
      console.error('❌ Error fetching access requests:', error)
      toast.error("Failed to load access requests from database")
      setAccessRequests([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Check both regular session and admin bypass session
    const adminSession = localStorage.getItem('admin_session')
    const hasAdminAccess = (session?.user && session.user.email === 'contact@sociatrack.admin') || 
                          (adminSession && JSON.parse(adminSession).user?.email === 'contact@sociatrack.admin')
    
    if (hasAdminAccess) {
      fetchAccessRequests()
    }
  }, [session])

  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  const handleApprove = (request: AccessRequest) => {
    setSelectedRequest(request)
    setGeneratedPassword(generateSecurePassword())
    setShowApprovalDialog(true)
  }

  const handleReject = (request: AccessRequest) => {
    setSelectedRequest(request)
    setRejectionReason("")
    setShowRejectionDialog(true)
  }

  const confirmApproval = async () => {
    if (!selectedRequest) return
    
    try {
      const token = localStorage.getItem("bearer_token")
      
      const response = await fetch(`/api/access-requests/${selectedRequest.id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: generatedPassword })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to approve request')
      }
      
      // Update local state
      setAccessRequests(prev => prev.map(req => 
        req.id === selectedRequest.id 
          ? { ...req, status: 'approved' }
          : req
      ))
      
      toast.success(`Account approved for ${selectedRequest.email}. Login credentials have been sent.`)
      setShowApprovalDialog(false)
      setSelectedRequest(null)
    } catch (error) {
      console.error('Error approving request:', error)
      toast.error(error instanceof Error ? error.message : "Failed to approve account")
    }
  }

  const confirmRejection = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection")
      return
    }
    
    try {
      const token = localStorage.getItem("bearer_token")
      
      const response = await fetch(`/api/access-requests/${selectedRequest.id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectionReason })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to reject request')
      }
      
      // Update local state
      setAccessRequests(prev => prev.map(req => 
        req.id === selectedRequest.id 
          ? { ...req, status: 'rejected', rejectionReason }
          : req
      ))
      
      toast.success(`Access request rejected for ${selectedRequest.email}`)
      setShowRejectionDialog(false)
      setSelectedRequest(null)
    } catch (error) {
      console.error('Error rejecting request:', error)
      toast.error(error instanceof Error ? error.message : "Failed to reject request")
    }
  }

  const handleRefresh = () => {
    fetchAccessRequests()
    toast.success("Access requests refreshed")
  }

  const handleEditLimits = (user: any) => {
    setSelectedUser(user)
    setMaxItems(user.maxItems || 3)
    setShowLimitsDialog(true)
  }

  const handleUpdateLimits = async () => {
    if (!selectedUser) return

    try {
      const token = localStorage.getItem("bearer_token")
      console.log('🔑 Token for limits update:', token ? 'Present' : 'Missing')
      console.log('🌐 API URL:', `/api/users/${selectedUser.id}/limits`)
      
      if (!token) {
        toast.error('You are not logged in. Please refresh the page and log in again.')
        return
      }
      
      const response = await fetch(`/api/users/${selectedUser.id}/limits`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          maxItems: parseInt(maxItems.toString())
        })
      })
      
      console.log('📡 Response status:', response.status)
      console.log('📡 Response headers:', [...response.headers.entries()])
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Error response:', errorData)
        throw new Error(errorData.error || 'Failed to update limits')
      }

      // Update local state
      setAllUsers(prev => prev.map(user => 
        user.id === selectedUser.id 
          ? { ...user, maxItems }
          : user
      ))
      
      toast.success(`Updated limit to ${maxItems} items for ${selectedUser.firstName} ${selectedUser.lastName}`)
      setShowLimitsDialog(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Error updating limits:', error)
      toast.error(error instanceof Error ? error.message : "Failed to update limits")
    }
  }

  const handleLogout = async () => {
    try {
      // Clear admin session from localStorage
      localStorage.removeItem('admin_session')
      localStorage.removeItem('bearer_token')
      
      // If there's a regular session, sign out from that too
      if (session?.user) {
        await authClient.signOut()
      }
      
      toast.success("Logged out successfully")
      
      // Redirect to home page
      navigate("/")
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Error during logout")
    }
  }

  if (isPending || (loading && !error)) {
    return (
      <div className="flex h-screen items-center justify-center" style={{backgroundColor: '#FAF9F6'}}>
        <div className="text-center">
          <Spinner className="mx-auto mb-4" />
          <h2 className="text-lg font-semibold" style={{color: '#1A1A1A'}}>Loading Admin Panel...</h2>
          <p style={{color: '#6B7280'}}>Setting up the dashboard</p>
        </div>
      </div>
    )
  }

  // Check admin access for rendering
  const adminSession = localStorage.getItem('admin_session')
  const hasAdminAccess = (session?.user && session.user.email === 'contact@sociatrack.admin') || 
                        (adminSession && JSON.parse(adminSession).user?.email === 'contact@sociatrack.admin')
  
  if (!hasAdminAccess) return null

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center" style={{backgroundColor: '#FAF9F6'}}>
        <div className="text-center max-w-md">
          <AlertCircle className="mx-auto mb-4 h-12 w-12" style={{color: '#EF4444'}} />
          <h2 className="text-xl font-bold mb-2" style={{color: '#1A1A1A'}}>Error Loading Admin Panel</h2>
          <p className="mb-4" style={{color: '#6B7280'}}>{error}</p>
          <Button 
            onClick={handleRefresh}
            style={{
              backgroundColor: '#1A1A1A',
              color: '#FFFFFF'
            }}
          >
            <RefreshCw size={16} className="mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const pendingRequests = accessRequests.filter(req => req.status === 'pending')
  const approvedRequests = accessRequests.filter(req => req.status === 'approved')
  const rejectedRequests = accessRequests.filter(req => req.status === 'rejected')

  const fetchAllUsers = async () => {
    const token = localStorage.getItem("bearer_token")
    
    setLoadingUsers(true)
    setActiveView('users')
    try {
      const response = await fetch('/api/users/all', {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const users = await response.json()
        setAllUsers(users)
        console.log('✅ Loaded users:', users)
        toast.success(`Loaded ${users.length} users`)
      } else {
        throw new Error('Failed to fetch users')
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error)
      toast.error("Failed to load users from database")
      setAllUsers([])
    } finally {
      setLoadingUsers(false)
    }
  }

  const showAccessRequests = () => {
    setActiveView('requests')
    setAllUsers([])
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: '#FAF9F6'}}>
      {/* Admin Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r z-40 flex flex-col" style={{borderColor: '#E5E7EB'}}>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <Shield className="h-6 w-6" style={{color: '#D4E157'}} />
            <h2 className="text-xl font-bold" style={{color: '#1A1A1A'}}>Admin Panel</h2>
          </div>
          
          <nav className="space-y-2">
            <button
              onClick={() => {
                showAccessRequests()
                setSidebarOpen(false)
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
              style={{
                backgroundColor: activeView === 'requests' ? '#EDF4B3' : 'transparent',
                color: activeView === 'requests' ? '#1A1A1A' : '#6B7280'
              }}
            >
              <UserCog className="h-5 w-5" />
              <span className="font-medium">Access Requests</span>
            </button>
            
            <button
              onClick={() => {
                fetchAllUsers()
                setSidebarOpen(false)
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
              style={{
                backgroundColor: activeView === 'users' ? '#EDF4B3' : 'transparent',
                color: activeView === 'users' ? '#1A1A1A' : '#6B7280'
              }}
            >
              <Users className="h-5 w-5" />
              <span className="font-medium">User Details</span>
            </button>
          </nav>
        </div>

        <div className="mt-auto p-6 border-t" style={{borderColor: '#E5E7EB'}}>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="w-full flex items-center gap-2"
            style={{
              color: '#6B7280',
              borderColor: '#E5E7EB'
            }}
          >
            <LogOut className="h-4 w-4" />
            Logout Admin
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:ml-64 pt-16 lg:pt-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Admin Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 lg:mb-10 relative"
          >
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold" style={{color: '#1A1A1A'}}>
                {activeView === 'requests' ? 'ACCESS REQUEST MANAGEMENT' : 'USER MANAGEMENT'}
              </h1>
            </div>
            <p className="text-lg mb-4" style={{color: '#6B7280'}}>
              {activeView === 'requests' 
                ? 'Review and approve account access requests' 
                : 'View and manage all user accounts'}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2" style={{color: '#6B7280'}}>
                  <div className="w-2 h-2 rounded-full" style={{backgroundColor: '#10B981'}} />
                  <span>System Online</span>
                </div>
                {activeView === 'requests' && (
                  <div style={{color: '#6B7280'}}>
                    {pendingRequests.length} pending requests
                  </div>
                )}
                {activeView === 'users' && (
                  <div style={{color: '#6B7280'}}>
                    {allUsers.length} total users
                  </div>
                )}
              </div>
              
              <Button 
                onClick={activeView === 'requests' ? handleRefresh : fetchAllUsers} 
                variant="outline" 
                size="sm"
                disabled={loadingUsers}
                className="w-full sm:w-auto"
                style={{
                  borderColor: '#E5E7EB',
                  color: '#374151'
                }}
              >
                <RefreshCw size={16} className={`mr-2 ${loadingUsers ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </motion.div>

        {/* Stats Cards - Only show for Access Requests */}
        {activeView === 'requests' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8"
          >
            <Card className="bg-white border" style={{borderColor: '#E5E7EB'}}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2" style={{color: '#1A1A1A'}}>
                  <Users className="h-4 w-4" style={{color: '#D4E157'}} />
                  Pending Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" style={{color: '#1A1A1A'}}>
                  {pendingRequests.length}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border" style={{borderColor: '#E5E7EB'}}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2" style={{color: '#1A1A1A'}}>
                  <Check className="h-4 w-4" style={{color: '#10B981'}} />
                  Approved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" style={{color: '#10B981'}}>
                  {approvedRequests.length}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border" style={{borderColor: '#E5E7EB'}}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2" style={{color: '#1A1A1A'}}>
                  <X className="h-4 w-4" style={{color: '#EF4444'}} />
                  Rejected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" style={{color: '#EF4444'}}>
                  {rejectedRequests.length}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Access Requests Table */}
        {activeView === 'requests' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
          <Card className="bg-white border" style={{borderColor: '#E5E7EB'}}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{color: '#1A1A1A'}}>
                <Users className="h-5 w-5" style={{color: '#D4E157'}} />
                Access Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Mobile Card View */}
              <div className="block lg:hidden divide-y divide-border">
                {accessRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground px-4">
                    No access requests found
                  </div>
                ) : (
                  accessRequests.map((request) => (
                    <div key={request.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {request.accountType === 'organization' ? (
                            <Building className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <UserIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate">
                              {request.accountType === 'organization' 
                                ? request.organizationName 
                                : `${request.firstName} ${request.lastName}`
                              }
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <Mail className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{request.email}</span>
                            </div>
                            {request.phoneNumber && (
                              <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <Phone className="h-3 w-3 flex-shrink-0" />
                                <span>{request.phoneNumber}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge 
                          variant="outline"
                          className={
                            request.status === 'approved' ? 'text-emerald-500 border-emerald-500 bg-emerald-500/10' :
                            request.status === 'rejected' ? 'text-red-500 border-red-500 bg-red-500/10' : 
                            'text-yellow-500 border-yellow-500 bg-yellow-500/10'
                          }
                        >
                          {request.status}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          {request.role.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {request.accountType}
                        </Badge>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(request.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {request.status === 'pending' && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(request)}
                            variant="outline"
                            className="flex-1 border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(request)}
                            className="flex-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                      {request.status !== 'pending' && (
                        <div className="text-sm text-muted-foreground pt-2">
                          {request.status === 'approved' ? 'Account Created' : 'Request Rejected'}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{borderColor: '#E5E7EB'}}>
                      <th className="text-left p-4 font-medium" style={{color: '#1A1A1A'}}>User</th>
                      <th className="text-left p-4 font-medium" style={{color: '#1A1A1A'}}>Role</th>
                      <th className="text-left p-4 font-medium" style={{color: '#1A1A1A'}}>Type</th>
                      <th className="text-left p-4 font-medium" style={{color: '#1A1A1A'}}>Status</th>
                      <th className="text-left p-4 font-medium" style={{color: '#1A1A1A'}}>Requested</th>
                      <th className="text-left p-4 font-medium" style={{color: '#1A1A1A'}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accessRequests.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8" style={{color: '#6B7280'}}>
                          No access requests found
                        </td>
                      </tr>
                    ) : (
                      accessRequests.map((request) => (
                        <tr key={request.id} className="border-b hover:bg-gray-50" style={{borderColor: '#E5E7EB'}}>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {request.accountType === 'organization' ? (
                                <Building className="h-4 w-4" style={{color: '#6B7280'}} />
                              ) : (
                                <UserIcon className="h-4 w-4" style={{color: '#6B7280'}} />
                              )}
                              <div>
                                <div className="font-medium" style={{color: '#1A1A1A'}}>
                                  {request.accountType === 'organization' 
                                    ? request.organizationName 
                                    : `${request.firstName} ${request.lastName}`
                                  }
                                </div>
                                <div className="text-sm flex items-center gap-1" style={{color: '#6B7280'}}>
                                  <Mail className="h-3 w-3" />
                                  {request.email}
                                </div>
                                {request.phoneNumber && (
                                  <div className="text-sm flex items-center gap-1" style={{color: '#6B7280'}}>
                                    <Phone className="h-3 w-3" />
                                    {request.phoneNumber}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" style={{color: '#374151', borderColor: '#E5E7EB'}}>
                              {request.role.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" style={{color: '#374151', borderColor: '#E5E7EB'}}>
                              {request.accountType}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge 
                              variant="outline"
                              className={
                                request.status === 'approved' ? 'text-emerald-500 border-emerald-500 bg-emerald-500/10' :
                                request.status === 'rejected' ? 'text-red-500 border-red-500 bg-red-500/10' : 
                                'text-yellow-500 border-yellow-500 bg-yellow-500/10'
                              }
                              style={{
                                color: request.status === 'approved' ? '#10B981' :
                                       request.status === 'rejected' ? '#EF4444' : 
                                       '#F59E0B',
                                borderColor: request.status === 'approved' ? '#10B981' :
                                            request.status === 'rejected' ? '#EF4444' : 
                                            '#F59E0B'
                              }}
                            >
                              {request.status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="text-sm flex items-center gap-1" style={{color: '#6B7280'}}>
                              <Calendar className="h-3 w-3" />
                              {new Date(request.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="p-4">
                            {request.status === 'pending' ? (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(request)}
                                  variant="outline"
                                  className="border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReject(request)}
                                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                {request.status === 'approved' ? 'Account Created' : 'Request Rejected'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        )}

        {/* User Details Section */}
        {activeView === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Card className="bg-white border" style={{borderColor: '#E5E7EB'}}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{color: '#1A1A1A'}}>
                  <Users className="h-5 w-5" style={{color: '#D4E157'}} />
                  All Users ({allUsers.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b" style={{borderColor: '#E5E7EB'}}>
                        <th className="text-left p-4 font-medium" style={{color: '#1A1A1A'}}>Name</th>
                        <th className="text-left p-4 font-medium" style={{color: '#1A1A1A'}}>Email</th>
                        <th className="text-left p-4 font-medium" style={{color: '#1A1A1A'}}>Role</th>
                        <th className="text-left p-4 font-medium" style={{color: '#1A1A1A'}}>Limits</th>
                        <th className="text-left p-4 font-medium" style={{color: '#1A1A1A'}}>Joined</th>
                        <th className="text-left p-4 font-medium" style={{color: '#1A1A1A'}}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50" style={{borderColor: '#E5E7EB'}}>
                          <td className="p-4">
                            <div className="font-medium" style={{color: '#1A1A1A'}}>{user.firstName} {user.lastName}</div>
                          </td>
                          <td className="p-4 text-sm" style={{color: '#6B7280'}}>{user.email}</td>
                          <td className="p-4">
                            <Badge variant="outline" className="text-xs" style={{color: '#374151', borderColor: '#E5E7EB'}}>{user.role}</Badge>
                          </td>
                          <td className="p-4">
                            <div className="text-sm" style={{color: '#6B7280'}}>
                              <div>Max Items: {user.maxItems || 3}</div>
                              <div className="text-xs" style={{color: '#9CA3AF'}}>Campaigns + Tokens</div>
                            </div>
                          </td>
                          <td className="p-4 text-sm" style={{color: '#6B7280'}}>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/admin/users/${user.id}`)}
                                style={{
                                  borderColor: '#E5E7EB',
                                  color: '#374151'
                                }}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditLimits(user)}
                                style={{
                                  borderColor: '#D4E157',
                                  color: '#1A1A1A',
                                  backgroundColor: 'transparent'
                                }}
                                className="hover:bg-yellow-50"
                              >
                                <UserCog className="h-3 w-3 mr-1" />
                                Limits
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        </div>
      </div>
      
      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="sm:max-w-md bg-white border" style={{borderColor: '#E5E7EB'}}>
          <DialogHeader>
            <DialogTitle style={{color: '#1A1A1A'}}>Approve Account Request</DialogTitle>
            <DialogDescription style={{color: '#6B7280'}}>
              Approve this account request to grant the user access to the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm" style={{color: '#6B7280'}}>
              You are about to approve the account request for:
            </div>
            <div className="font-medium" style={{color: '#1A1A1A'}}>
              {selectedRequest?.accountType === 'organization' 
                ? selectedRequest?.organizationName 
                : `${selectedRequest?.firstName} ${selectedRequest?.lastName}`
              }
            </div>
            <div className="text-sm" style={{color: '#6B7280'}}>
              {selectedRequest?.email}
            </div>
            
            <div className="space-y-2">
              <Label style={{color: '#374151'}}>Generated Password</Label>
              <div className="flex gap-2">
                <Input 
                  value={generatedPassword} 
                  readOnly 
                  className="bg-white border" 
                  style={{
                    borderColor: '#D1D5DB',
                    color: '#1A1A1A'
                  }}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setGeneratedPassword(generateSecurePassword())}
                  style={{
                    borderColor: '#E5E7EB',
                    color: '#374151'
                  }}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
              <div className="text-xs" style={{color: '#9CA3AF'}}>
                This password will be sent to the user's email
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowApprovalDialog(false)}
                style={{
                  borderColor: '#E5E7EB',
                  color: '#374151'
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmApproval} 
                style={{
                  backgroundColor: '#10B981',
                  color: '#FFFFFF',
                  borderColor: '#10B981'
                }}
                className="hover:bg-green-600"
              >
                <Key className="h-3 w-3 mr-1" />
                Approve & Send Credentials
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent className="sm:max-w-md bg-white border" style={{borderColor: '#E5E7EB'}}>
          <DialogHeader>
            <DialogTitle style={{color: '#1A1A1A'}}>Reject Account Request</DialogTitle>
            <DialogDescription style={{color: '#6B7280'}}>
              Provide a reason for rejecting this account request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm" style={{color: '#6B7280'}}>
              You are about to reject the account request for:
            </div>
            <div className="font-medium" style={{color: '#1A1A1A'}}>
              {selectedRequest?.accountType === 'organization' 
                ? selectedRequest?.organizationName 
                : `${selectedRequest?.firstName} ${selectedRequest?.lastName}`
              }
            </div>
            <div className="text-sm" style={{color: '#6B7280'}}>
              {selectedRequest?.email}
            </div>
            
            <div className="space-y-2">
              <Label style={{color: '#374151'}}>Reason for Rejection *</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejecting this request..."
                className="min-h-20 bg-white border"
                style={{
                  borderColor: '#D1D5DB',
                  color: '#1A1A1A'
                }}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowRejectionDialog(false)}
                style={{
                  borderColor: '#E5E7EB',
                  color: '#374151'
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmRejection}
                disabled={!rejectionReason.trim()}
                style={{
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  borderColor: '#EF4444',
                  opacity: !rejectionReason.trim() ? 0.5 : 1
                }}
                className="hover:bg-red-600 disabled:hover:bg-red-400"
              >
                <X className="h-3 w-3 mr-1" />
                Reject Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Limits Dialog */}
      <Dialog open={showLimitsDialog} onOpenChange={setShowLimitsDialog}>
        <DialogContent className="sm:max-w-md bg-white border" style={{borderColor: '#E5E7EB'}}>
          <DialogHeader>
            <DialogTitle style={{color: '#1A1A1A'}}>Update User Limits</DialogTitle>
            <DialogDescription style={{color: '#6B7280'}}>
              Set the maximum number of campaigns and tokens this user can create.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm" style={{color: '#6B7280'}}>
              Update creation limits for:
            </div>
            <div className="font-medium" style={{color: '#1A1A1A'}}>
              {selectedUser?.firstName} {selectedUser?.lastName}
            </div>
            <div className="text-sm" style={{color: '#6B7280'}}>
              {selectedUser?.email}
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label style={{color: '#374151'}}>Max Items (Campaigns + Tokens)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={maxItems}
                  onChange={(e) => setMaxItems(parseInt(e.target.value) || 0)}
                  className="bg-white border"
                  style={{
                    borderColor: '#D1D5DB',
                    color: '#1A1A1A'
                  }}
                />
                <div className="text-xs" style={{color: '#6B7280'}}>
                  Total number of campaigns and tokens the user can create combined
                </div>
              </div>
            </div>
            
            <div className="text-xs" style={{color: '#6B7280'}}>
              Set to 0 for unlimited access. User can create any combination of campaigns and tokens within this limit.
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowLimitsDialog(false)}
                style={{
                  borderColor: '#E5E7EB',
                  color: '#374151'
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateLimits}
                style={{
                  backgroundColor: '#D4E157',
                  color: '#1A1A1A',
                  borderColor: '#D4E157'
                }}
                className="hover:bg-yellow-300"
              >
                <UserCog className="h-3 w-3 mr-1" />
                Update Limits
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}