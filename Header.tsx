"use client"

import { useState, useEffect } from "react"
import { useNavigate as rrUseNavigate, useSearchParams as rrUseSearchParams, Link as RouterLink, useInRouterContext } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Menu, X, LogOut, User } from "lucide-react"
import { useSession, authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import PlanBadge from "./PlanBadge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Header() {
  const inRouter = useInRouterContext()
  const navigate = inRouter
    ? rrUseNavigate()
    : ((to: string) => {
        if (to === "-1") {
          window.history.back()
        } else {
          window.location.href = to
        }
      })

  const [routerSearchParams] = inRouter ? (rrUseSearchParams() as any) : [new URLSearchParams(typeof window !== "undefined" ? window.location.search : "")]
  const searchParams: URLSearchParams = routerSearchParams

  const { data: session, isPending, refetch } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Handle session expiration error
  useEffect(() => {
    const error = searchParams.get("error")
    if (error === "session_expired") {
      toast.error("Your session has expired. Please log in again.")
      // Clean up the URL
      const url = new URL(window.location.href)
      url.searchParams.delete("error")
      window.history.replaceState({}, "", url.toString())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()])

  const handleSignOut = async () => {
    try {
      const { error } = await authClient.signOut()
      if (error?.code) {
        toast.error("Error signing out")
      } else {
        localStorage.removeItem("bearer_token")
        await refetch()
        toast.success("Signed out successfully")
        typeof navigate === "function" ? (navigate as any)("/auth") : (window.location.href = "/auth")
      }
    } catch (error) {
      console.error("Sign out error:", error)
      toast.error("An error occurred while signing out")
    }
  }

  const NavLink = ({ to, className, onClick, children }: { to: string; className?: string; onClick?: () => void; children: React.ReactNode }) =>
    inRouter ? (
      <RouterLink to={to} className={className} onClick={onClick}>
        {children}
      </RouterLink>
    ) : (
      <a href={to} className={className} onClick={onClick}>
        {children}
      </a>
    )

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <nav className="w-full px-6 sm:px-8 lg:px-12 py-3">
          <div className="flex items-center justify-between w-full max-w-none">
            <div className="flex items-center gap-6">
              <NavLink to="/" className="flex items-center gap-2">
                <img 
                  src="/logo-48.png" 
                  alt="SociaTrack Logo" 
                  className="w-8 h-8"
                />
                <span className="text-2xl font-bold text-primary">
                  SociaTrack
                </span>
              </NavLink>
            </div>

            {/* Desktop User Actions - pushed to far right */}
            <div className="hidden md:flex items-center gap-4 ml-auto">
              {!isPending && session?.user ? (
                <>
                  <PlanBadge />
                  <NavLink to="/dashboard">
                    <Button variant="ghost" size="default">
                      Dashboard
                    </Button>
                  </NavLink>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <User size={16} />
                        {session.user.displayName || session.user.email}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => (inRouter ? (navigate as any)("/settings") : (window.location.href = "/settings"))}>
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => (inRouter ? (navigate as any)("/billing") : (window.location.href = "/billing"))}>
                        Billing
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut} className="text-red-500">
                        <LogOut size={16} className="mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="default" onClick={() => {
                    const APP_URL = import.meta.env.VITE_APP_URL || 'https://app.sociatrack.com'
                    window.location.href = `${APP_URL}/auth`
                  }}>
                    Log In
                  </Button>
                  <Button
                    size="default"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => {
                      const APP_URL = import.meta.env.VITE_APP_URL || 'https://app.sociatrack.com'
                      window.location.href = `${APP_URL}/auth?mode=signup`
                    }}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-foreground p-2 hover:bg-accent rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-4">
              {!isPending && session?.user ? (
                <>
                  <div className="pl-3">
                    <PlanBadge />
                  </div>
                  <NavLink to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      Dashboard
                    </Button>
                  </NavLink>
                  <NavLink to="/settings" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      Settings
                    </Button>
                  </NavLink>
                  <NavLink to="/billing" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      Billing
                    </Button>
                  </NavLink>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-500"
                    onClick={() => {
                      handleSignOut()
                      setMobileMenuOpen(false)
                    }}
                  >
                    <LogOut size={16} className="mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      const APP_URL = import.meta.env.VITE_APP_URL || 'https://app.sociatrack.com'
                      window.location.href = `${APP_URL}/auth`
                      setMobileMenuOpen(false)
                    }}
                  >
                    Log In
                  </Button>
                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => {
                      const APP_URL = import.meta.env.VITE_APP_URL || 'https://app.sociatrack.com'
                      window.location.href = `${APP_URL}/auth?mode=signup`
                      setMobileMenuOpen(false)
                    }}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          )}
        </nav>
      </header>
    </>
  )
}