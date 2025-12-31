"use client"

import { ReactNode } from "react"
import AppSidebar from "@/components/AppSidebar"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background min-h-screen">
      <AppSidebar />
      {/* Main content area with beautiful curved border */}
      <main className="md:ml-20 min-h-screen overflow-auto bg-background relative pt-14 md:pt-0">
        <div className="relative z-10 w-full h-full md:p-4">
          {/* Curved border container */}
          <div className="h-full md:rounded-3xl md:border md:border-border/50 md:bg-card md:shadow-sm overflow-hidden">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}