"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import DashboardLayout from "@/components/DashboardLayout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useSession } from "@/lib/auth-client"
import { toast } from "sonner"

import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock"
import { User, Bell, Shield, LogOut, Save } from "lucide-react"

export default function SettingsPage() {
  const { data: session, isPending } = useSession()
  const [activeTab, setActiveTab] = useState("profile")
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [twoFactorAuth, setTwoFactorAuth] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userProfile, setUserProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: '',
    accountType: ''
  })
  
  const [userStats, setUserStats] = useState({
    totalCampaigns: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    memberSince: null
  })

  // Load user profile data and stats
  useEffect(() => {
    if (session?.user) {
      setUserProfile({
        firstName: session.user.firstName || '',
        lastName: session.user.lastName || '',
        email: session.user.email || '',
        phoneNumber: session.user.phoneNumber || '',
        role: session.user.role || 'user',
        accountType: session.user.accountType || 'individual'
      })
      
      // Load user statistics
      fetchUserStats()
    }
  }, [session])

  const loadUserStats = async () => {
    try {
      const token = localStorage.getItem("bearer_token")
      const response = await fetch('/api/users/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const stats = await response.json()
        setUserStats(stats)
      }
    } catch (error) {
      console.error('Error loading user stats:', error)
    }
  }

  // Handle profile update
  const handleUpdateProfile = async () => {
    if (!session?.user?.uid) return
    
    setLoading(true)
    try {
      const token = localStorage.getItem("bearer_token")
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          email: userProfile.email,
          phoneNumber: userProfile.phoneNumber,
          role: userProfile.role,
          accountType: userProfile.accountType
        })
      })
      
      if (response.ok) {
        toast.success('Profile updated successfully!')
      } else {
        toast.error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem("bearer_token")
      const response = await fetch('/api/users/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const stats = await response.json()
        setUserStats(stats)
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }

  if (isPending) {
    return (
      <DashboardLayout>
              <div className="container mx-auto px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-900">Loading...</div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Settings
              </h1>
              <p className="text-base text-gray-600">Manage your account settings and preferences</p>
            </div>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar Navigation */}
              <aside className="lg:col-span-1">
                <nav className="space-y-2 sticky top-8">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      activeTab === "profile" 
                        ? "bg-primary/20 text-gray-900 border border-primary/30" 
                        : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                    }`}
                  >
                    <User size={20} />
                    <span className="font-medium">Profile</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab("notifications")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      activeTab === "notifications" 
                        ? "bg-primary/20 text-gray-900 border border-primary/30" 
                        : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                    }`}
                  >
                    <Bell size={20} />
                    <span className="font-medium">Notifications</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab("security")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      activeTab === "security" 
                        ? "bg-primary/20 text-gray-900 border border-primary/30" 
                        : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                    }`}
                  >
                    <Shield size={20} />
                    <span className="font-medium">Security</span>
                  </button>

                  {/* Logout Button */}
                  <div className="pt-4 mt-4 border-t border-white/10">
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-red-400 hover:bg-red-500/10 transition-all duration-200"
                    >
                      <LogOut size={20} />
                      <span className="font-medium">Log Out</span>
                    </button>
                  </div>
                </nav>
              </aside>

              {/* Main Content Area */}
              <div className="lg:col-span-3">
                {/* Profile Tab */}
                {activeTab === "profile" && (
                  <div className="space-y-6">
                    {/* Stats Overview */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="rounded-lg bg-gray-100 p-4 border border-gray-200">
                        <div className="text-2xl font-bold text-gray-900">{userStats.totalCampaigns}</div>
                        <div className="text-xs text-gray-600 mt-1">Campaigns</div>
                      </div>
                      <div className="rounded-lg bg-gray-100 p-4 border border-gray-200">
                        <div className="text-2xl font-bold text-gray-900">{userStats.totalTransactions}</div>
                        <div className="text-xs text-gray-600 mt-1">Transactions</div>
                      </div>
                      <div className="rounded-lg bg-gray-100 p-4 border border-gray-200">
                        <div className="text-2xl font-bold text-gray-900">${userStats.totalRevenue.toFixed(2)}</div>
                        <div className="text-xs text-gray-600 mt-1">Revenue</div>
                      </div>
                      <div className="rounded-lg bg-gray-100 p-4 border border-gray-200">
                        <div className="text-2xl font-bold text-gray-900">{userStats.memberSince ? new Date(userStats.memberSince).getFullYear() : '2024'}</div>
                        <div className="text-xs text-gray-600 mt-1">Member Since</div>
                      </div>
                    </div>

                    {/* Profile Form */}
                    <div className="rounded-xl bg-gray-100 p-6 border border-gray-200">
                      <h3 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h3>
                      
                      <div className="space-y-5">
                        <div className="grid md:grid-cols-2 gap-5">
                          <div>
                            <Label htmlFor="firstName" className="text-gray-900 text-sm font-medium">First Name</Label>
                            <Input 
                              id="firstName" 
                              value={userProfile.firstName}
                              onChange={(e) => setUserProfile(prev => ({ ...prev, firstName: e.target.value }))}
                              className="mt-2 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200" 
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName" className="text-gray-900 text-sm font-medium">Last Name</Label>
                            <Input 
                              id="lastName" 
                              value={userProfile.lastName}
                              onChange={(e) => setUserProfile(prev => ({ ...prev, lastName: e.target.value }))}
                              className="mt-2 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200" 
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="email" className="text-gray-900 text-sm font-medium">Email Address</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            value={userProfile.email}
                            onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
                            className="mt-2 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200" 
                          />
                        </div>

                        <div>
                          <Label htmlFor="phone" className="text-gray-900 text-sm font-medium">Phone Number</Label>
                          <Input 
                            id="phone" 
                            type="tel" 
                            value={userProfile.phoneNumber}
                            onChange={(e) => setUserProfile(prev => ({ ...prev, phoneNumber: e.target.value }))}
                            placeholder="+1 (555) 000-0000"
                            className="mt-2 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200" 
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-5">
                          <div>
                            <Label htmlFor="role" className="text-gray-900 text-sm font-medium">Role</Label>
                            <Input 
                              id="role" 
                              value={userProfile.role}
                              onChange={(e) => setUserProfile(prev => ({ ...prev, role: e.target.value }))}
                              className="mt-2 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200" 
                            />
                          </div>
                          <div>
                            <Label htmlFor="accountType" className="text-gray-900 text-sm font-medium">Account Type</Label>
                            <Input 
                              id="accountType" 
                              value={userProfile.accountType}
                              onChange={(e) => setUserProfile(prev => ({ ...prev, accountType: e.target.value }))}
                              className="mt-2 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200" 
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pt-4">
                          <Button 
                            onClick={handleUpdateProfile}
                            disabled={loading}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            <Save size={16} className="mr-2" />
                            {loading ? 'Saving...' : 'Save Changes'}
                          </Button>
                          <Button variant="ghost" className="text-gray-900 hover:bg-gray-200">Cancel</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div className="rounded-xl bg-gray-100 p-6 border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-5 rounded-lg bg-white border border-gray-200 hover:border-gray-300 transition-all">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-base">Email Notifications</p>
                        <p className="text-sm text-gray-600 mt-1">Receive email alerts for new attributions</p>
                      </div>
                      <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                    </div>
                    <div className="flex items-center justify-between p-5 rounded-lg bg-white border border-gray-200 hover:border-gray-300 transition-all">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-base">Weekly Reports</p>
                        <p className="text-sm text-gray-600 mt-1">Receive weekly attribution summary reports</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-5 rounded-lg bg-white border border-gray-200 hover:border-gray-300 transition-all">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-base">Campaign Updates</p>
                        <p className="text-sm text-gray-600 mt-1">Get notified about campaign milestones</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="pt-4 flex items-center gap-3">
                      <Button className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200">
                        <Save size={16} className="mr-2" />
                        Save Preferences
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  {/* Change Password Section */}
                  <div className="rounded-xl bg-gray-100 p-6 border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Change Password</h3>
                    <div className="space-y-5">
                      <div>
                        <Label htmlFor="currentPassword" className="text-gray-900 text-sm font-medium">Current Password</Label>
                        <Input 
                          id="currentPassword" 
                          type="password" 
                          placeholder="Enter current password"
                          className="mt-2 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200" 
                        />
                      </div>
                      <div>
                        <Label htmlFor="newPassword" className="text-gray-900 text-sm font-medium">New Password</Label>
                        <Input 
                          id="newPassword" 
                          type="password"
                          placeholder="Enter new password" 
                          className="mt-2 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200" 
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword" className="text-gray-900 text-sm font-medium">Confirm New Password</Label>
                        <Input 
                          id="confirmPassword" 
                          type="password"
                          placeholder="Confirm new password" 
                          className="mt-2 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200" 
                        />
                      </div>
                      <div className="pt-2">
                        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200">
                          Update Password
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Two-Factor Authentication Section */}
                  <div className="rounded-xl bg-gray-100 p-6 border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Two-Factor Authentication</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-5 rounded-lg bg-white border border-gray-200 hover:border-gray-300 transition-all">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-base">Enable 2FA</p>
                          <p className="text-sm text-gray-600 mt-1">Add an extra layer of security to your account</p>
                        </div>
                        <Switch checked={twoFactorAuth} onCheckedChange={setTwoFactorAuth} />
                      </div>
                      {twoFactorAuth && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="p-5 rounded-lg bg-white border border-gray-200"
                        >
                          <p className="text-sm text-gray-600 mb-4">Scan this QR code with your authenticator app:</p>
                          <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center">
                            <p className="text-black text-xs">QR Code Placeholder</p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          </motion.div>
      </div>
    </DashboardLayout>
  )
}