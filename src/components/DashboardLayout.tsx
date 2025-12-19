"use client"

import { ReactNode } from "react"
import AppSidebar from "@/components/AppSidebar"
import AnimatedBackground from "@/components/AnimatedBackground"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background min-h-screen">
      <AppSidebar />
      {/* Main content area with proper spacing for mobile header and desktop sidebar */}
      <main className="md:ml-20 min-h-screen overflow-auto bg-background relative pt-14 md:pt-0">
        <AnimatedBackground />
        <div className="relative z-10 w-full">
          {children}
        </div>
      </main>
    </div>
  )
}