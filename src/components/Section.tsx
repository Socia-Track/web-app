import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface SectionProps {
    children: ReactNode
    className?: string
    id?: string
    background?: "default" | "muted"
}

export default function Section({
    children,
    className,
    id,
    background = "default"
}: SectionProps) {
    return (
        <section
            id={id}
            className={cn(
                "py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8",
                background === "muted" && "bg-muted/30",
                className
            )}
        >
            <div className="container mx-auto max-w-7xl">
                {children}
            </div>
        </section>
    )
}
