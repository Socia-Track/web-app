"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import DashboardLayout from "@/components/DashboardLayout"
import HeroHeader from "@/components/HeroHeader"
import Section from "@/components/Section"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useSession } from "@/lib/auth-client"
import { toast } from "sonner"
import { User, Bell, Shield, LogOut, Save, Settings as SettingsIcon, ChevronRight } from "lucide-react"

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
        <div className="flex items-center justify-center h-screen">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </DashboardLayout>
    )
  }

  const navItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
  ]

  return (
    <DashboardLayout>
      {/* Hero Header */}
      <HeroHeader
        title="Settings"
        description="Manage your account settings and preferences"
        badge="Account Management"
        icon={
          <div className="p-4 rounded-2xl bg-accent/10">
            <SettingsIcon size={48} className="text-accent" />
          </div>
        }
      />

      {/* Main Content */}
      <Section>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-1">
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-200 group ${isActive
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={20} className={isActive ? "text-accent-foreground" : ""} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight size={16} />}
                    </button>
                  )
                })}

                {/* Logout Button */}
                <Separator className="my-4" />
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200"
                >
                  <LogOut size={20} />
                  <span className="font-medium">Log Out</span>
                </button>
              </nav>
            </aside>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Profile Tab */}
                {activeTab === "profile" && (
                  <div className="space-y-6">
                    {/* Account Overview */}
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-2">Account Overview</h2>
                      <p className="text-muted-foreground mb-6">View your account statistics and activity</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="rounded-xl bg-card border border-border p-4">
                          <div className="text-2xl font-bold text-foreground">{userStats.totalCampaigns}</div>
                          <div className="text-sm text-muted-foreground mt-1">Campaigns</div>
                        </div>
                        <div className="rounded-xl bg-card border border-border p-4">
                          <div className="text-2xl font-bold text-foreground">{userStats.totalTransactions}</div>
                          <div className="text-sm text-muted-foreground mt-1">Transactions</div>
                        </div>
                        <div className="rounded-xl bg-card border border-border p-4">
                          <div className="text-2xl font-bold text-foreground">${userStats.totalRevenue.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground mt-1">Revenue</div>
                        </div>
                        <div className="rounded-xl bg-card border border-border p-4">
                          <div className="text-2xl font-bold text-foreground">{userStats.memberSince ? new Date(userStats.memberSince).getFullYear() : '2024'}</div>
                          <div className="text-sm text-muted-foreground mt-1">Member Since</div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Personal Information */}
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-2">Personal Information</h2>
                      <p className="text-muted-foreground mb-6">Update your personal details and contact information</p>

                      <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-sm font-medium text-foreground">First Name</Label>
                            <Input
                              id="firstName"
                              value={userProfile.firstName}
                              onChange={(e) => setUserProfile(prev => ({ ...prev, firstName: e.target.value }))}
                              className="h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-sm font-medium text-foreground">Last Name</Label>
                            <Input
                              id="lastName"
                              value={userProfile.lastName}
                              onChange={(e) => setUserProfile(prev => ({ ...prev, lastName: e.target.value }))}
                              className="h-11"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium text-foreground">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={userProfile.email}
                            onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
                            className="h-11"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-sm font-medium text-foreground">Phone Number</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={userProfile.phoneNumber}
                            onChange={(e) => setUserProfile(prev => ({ ...prev, phoneNumber: e.target.value }))}
                            placeholder="+1 (555) 000-0000"
                            className="h-11"
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="role" className="text-sm font-medium text-foreground">Role</Label>
                            <Input
                              id="role"
                              value={userProfile.role}
                              onChange={(e) => setUserProfile(prev => ({ ...prev, role: e.target.value }))}
                              className="h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="accountType" className="text-sm font-medium text-foreground">Account Type</Label>
                            <Input
                              id="accountType"
                              value={userProfile.accountType}
                              onChange={(e) => setUserProfile(prev => ({ ...prev, accountType: e.target.value }))}
                              className="h-11"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pt-4">
                          <Button
                            onClick={handleUpdateProfile}
                            disabled={loading}
                            className="h-11"
                          >
                            <Save size={16} className="mr-2" />
                            {loading ? 'Saving...' : 'Save Changes'}
                          </Button>
                          <Button variant="ghost" className="h-11">Cancel</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === "notifications" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-2">Notification Preferences</h2>
                      <p className="text-muted-foreground mb-6">Manage how you receive notifications and updates</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-6 rounded-xl border border-border bg-card transition-all">
                        <div className="flex-1">
                          <p className="font-medium text-foreground text-base">Email Notifications</p>
                          <p className="text-sm text-muted-foreground mt-1">Receive email alerts for new attributions and updates</p>
                        </div>
                        <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                      </div>

                      <div className="flex items-center justify-between p-6 rounded-xl border border-border bg-card transition-all">
                        <div className="flex-1">
                          <p className="font-medium text-foreground text-base">Weekly Reports</p>
                          <p className="text-sm text-muted-foreground mt-1">Receive weekly attribution summary reports via email</p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between p-6 rounded-xl border border-border bg-card transition-all">
                        <div className="flex-1">
                          <p className="font-medium text-foreground text-base">Campaign Updates</p>
                          <p className="text-sm text-muted-foreground mt-1">Get notified about campaign milestones and achievements</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button className="h-11">
                        <Save size={16} className="mr-2" />
                        Save Preferences
                      </Button>
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === "security" && (
                  <div className="space-y-8">
                    {/* Change Password */}
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-2">Change Password</h2>
                      <p className="text-muted-foreground mb-6">Update your password to keep your account secure</p>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword" className="text-sm font-medium text-foreground">Current Password</Label>
                          <Input
                            id="currentPassword"
                            type="password"
                            placeholder="Enter current password"
                            className="h-11"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="newPassword" className="text-sm font-medium text-foreground">New Password</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            placeholder="Enter new password"
                            className="h-11"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">Confirm New Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm new password"
                            className="h-11"
                          />
                        </div>

                        <div className="pt-2">
                          <Button className="h-11">Update Password</Button>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Two-Factor Authentication */}
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-2">Two-Factor Authentication</h2>
                      <p className="text-muted-foreground mb-6">Add an extra layer of security to your account</p>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-6 rounded-xl border border-border bg-card transition-all">
                          <div className="flex-1">
                            <p className="font-medium text-foreground text-base">Enable 2FA</p>
                            <p className="text-sm text-muted-foreground mt-1">Protect your account with two-factor authentication</p>
                          </div>
                          <Switch checked={twoFactorAuth} onCheckedChange={setTwoFactorAuth} />
                        </div>

                        {twoFactorAuth && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="p-6 rounded-xl border border-border bg-muted"
                          >
                            <p className="text-sm text-muted-foreground mb-4">Scan this QR code with your authenticator app:</p>
                            <div className="w-48 h-48 bg-background rounded-xl border border-border flex items-center justify-center">
                              <p className="text-muted-foreground text-xs">QR Code Placeholder</p>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </Section>
    </DashboardLayout>
  )
}