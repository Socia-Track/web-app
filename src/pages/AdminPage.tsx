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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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

  // Check admin access
  useEffect(() => {
    // Add a small delay to ensure localStorage is properly loaded (important for mobile)
    const checkAdminAccess = () => {
      // Check for admin session (from AdminLoginPage)
      const adminSession = localStorage.getItem('admin_session')
      if (adminSession) {
        try {
          const mockSession = JSON.parse(adminSession)
          if (mockSession.user?.email === 'admin7337@gmail.com') {
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
    const hasAdminAccess = (session?.user?.uid) || (adminSession && JSON.parse(adminSession).user?.email === 'admin7337@gmail.com')
    
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
    const hasAdminAccess = (session?.user && session.user.email === 'admin7337@gmail.com') || 
                          (adminSession && JSON.parse(adminSession).user?.email === 'admin7337@gmail.com')
    
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
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Spinner className="mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white">Loading Admin Panel...</h2>
          <p className="text-muted-foreground">Setting up the dashboard</p>
        </div>
      </div>
    )
  }

  // Check admin access for rendering
  const adminSession = localStorage.getItem('admin_session')
  const hasAdminAccess = (session?.user && session.user.email === 'admin7337@gmail.com') || 
                        (adminSession && JSON.parse(adminSession).user?.email === 'admin7337@gmail.com')
  
  if (!hasAdminAccess) return null

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Admin Panel</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button onClick={handleRefresh}>
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
    <div className="min-h-screen bg-background">
      {/* Admin Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border z-40 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <Shield className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Admin Panel</h2>
          </div>
          
          <nav className="space-y-2">
            <button
              onClick={showAccessRequests}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeView === 'requests' 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:bg-muted/50'
              }`}
            >
              <UserCog className="h-5 w-5" />
              <span className="font-medium">Access Requests</span>
            </button>
            
            <button
              onClick={fetchAllUsers}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeView === 'users' 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:bg-muted/50'
              }`}
            >
              <Users className="h-5 w-5" />
              <span className="font-medium">User Details</span>
            </button>
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-sidebar-border">
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Logout Admin
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="ml-64">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Admin Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 relative"
          >
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-foreground">
                {activeView === 'requests' ? 'ACCESS REQUEST MANAGEMENT' : 'USER MANAGEMENT'}
              </h1>
            </div>
            <p className="text-lg text-muted-foreground mb-4">
              {activeView === 'requests' 
                ? 'Review and approve account access requests' 
                : 'View and manage all user accounts'}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-foreground" />
                  <span>System Online</span>
                </div>
                {activeView === 'requests' && (
                  <div className="text-muted-foreground">
                    {pendingRequests.length} pending requests
                  </div>
                )}
                {activeView === 'users' && (
                  <div className="text-muted-foreground">
                    {allUsers.length} total users
                  </div>
                )}
              </div>
              
              <Button 
                onClick={activeView === 'requests' ? handleRefresh : fetchAllUsers} 
                variant="outline" 
                size="sm"
                disabled={loadingUsers}
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
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-foreground" />
                  Pending Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {pendingRequests.length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Check className="h-4 w-4 text-muted-foreground" />
                  Approved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-muted-foreground">
                  {approvedRequests.length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <X className="h-4 w-4 text-muted-foreground" />
                  Rejected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-muted-foreground">
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Access Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium">User</th>
                      <th className="text-left p-4 font-medium">Role</th>
                      <th className="text-left p-4 font-medium">Type</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Requested</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accessRequests.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-muted-foreground">
                          No access requests found
                        </td>
                      </tr>
                    ) : (
                      accessRequests.map((request) => (
                        <tr key={request.id} className="border-b border-border hover:bg-muted/50">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {request.accountType === 'organization' ? (
                                <Building className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <UserIcon className="h-4 w-4 text-muted-foreground" />
                              )}
                              <div>
                                <div className="font-medium">
                                  {request.accountType === 'organization' 
                                    ? request.organizationName 
                                    : `${request.firstName} ${request.lastName}`
                                  }
                                </div>
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {request.email}
                                </div>
                                {request.phoneNumber && (
                                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {request.phoneNumber}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className="text-muted-foreground border-muted">
                              {request.role.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className="text-muted-foreground border-muted">
                              {request.accountType}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge 
                              variant="outline"
                              className={
                                request.status === 'approved' ? 'text-foreground border-foreground' :
                                request.status === 'rejected' ? 'text-muted-foreground border-muted' : 
                                'text-foreground border-border'
                              }
                            >
                              {request.status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
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
                                  className="border-foreground text-foreground hover:bg-foreground hover:text-background"
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReject(request)}
                                  className="border-muted-foreground text-muted-foreground hover:bg-muted hover:text-foreground"
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  All Users ({allUsers.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-4 font-medium">Name</th>
                        <th className="text-left p-4 font-medium">Email</th>
                        <th className="text-left p-4 font-medium">Role</th>
                        <th className="text-left p-4 font-medium">Joined</th>
                        <th className="text-left p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.map((user) => (
                        <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                          <td className="p-4">
                            <div className="font-medium">{user.firstName} {user.lastName}</div>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">{user.email}</td>
                          <td className="p-4">
                            <Badge variant="outline" className="text-xs">{user.role}</Badge>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/admin/users/${user.id}`)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View Details
                            </Button>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Account Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              You are about to approve the account request for:
            </div>
            <div className="font-medium">
              {selectedRequest?.accountType === 'organization' 
                ? selectedRequest?.organizationName 
                : `${selectedRequest?.firstName} ${selectedRequest?.lastName}`
              }
            </div>
            <div className="text-sm text-muted-foreground">
              {selectedRequest?.email}
            </div>
            
            <div className="space-y-2">
              <Label>Generated Password</Label>
              <div className="flex gap-2">
                <Input value={generatedPassword} readOnly />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setGeneratedPassword(generateSecurePassword())}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                This password will be sent to the user's email
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
                Cancel
              </Button>
              <Button onClick={confirmApproval} variant="outline" className="border-foreground text-foreground hover:bg-foreground hover:text-background">
                <Key className="h-3 w-3 mr-1" />
                Approve & Send Credentials
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Account Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              You are about to reject the account request for:
            </div>
            <div className="font-medium">
              {selectedRequest?.accountType === 'organization' 
                ? selectedRequest?.organizationName 
                : `${selectedRequest?.firstName} ${selectedRequest?.lastName}`
              }
            </div>
            <div className="text-sm text-muted-foreground">
              {selectedRequest?.email}
            </div>
            
            <div className="space-y-2">
              <Label>Reason for Rejection *</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejecting this request..."
                className="min-h-20"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRejectionDialog(false)}>
                Cancel
              </Button>
              <Button 
                variant="outline" 
                onClick={confirmRejection}
                disabled={!rejectionReason.trim()}
                className="border-muted-foreground text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                <X className="h-3 w-3 mr-1" />
                Reject Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}