"use client"

import { ReactNode, useState, useEffect } from "react"
import AppSidebar from "@/components/AppSidebar"
import AnimatedBackground from "@/components/AnimatedBackground"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  return (
    <div className="bg-white min-h-screen">
      <AppSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      {/* Main content area with proper spacing for mobile header and desktop sidebar */}
      <main 
        className="min-h-screen overflow-auto bg-white relative pt-14 md:pt-0 transition-all duration-300 ease-in-out"
        style={{ 
          marginLeft: !isMobile ? (sidebarOpen ? '350px' : '80px') : '0px'
        }}
      >
        <AnimatedBackground />
        <div className="relative z-10 w-full">
          {children}
        </div>
      </main>
    </div>
  )
}