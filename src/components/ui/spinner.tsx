import React from 'react'
import { cn } from "@/lib/utils"

interface SpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

function Spinner({ className = '', size = 'md' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-[32px] h-[32px]',
    md: 'w-[65px] h-[65px]', 
    lg: 'w-[100px] h-[100px]'
  }

  return (
    <div className={cn("relative aspect-square", sizeClasses[size], className)}>
      <span className="absolute rounded-[50px] animate-loaderAnim shadow-[inset_0_0_0_3px] shadow-[#00D9A3] dark:shadow-[#00D9A3]" />
      <span className="absolute rounded-[50px] animate-loaderAnim animation-delay shadow-[inset_0_0_0_3px] shadow-[#00D9A3] dark:shadow-[#00D9A3]" />
    </div>
  )
}

export { Spinner }
