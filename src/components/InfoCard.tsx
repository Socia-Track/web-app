import { motion } from "framer-motion"
import { ReactNode } from "react"
import Highlight from "@/components/Highlight"

interface InfoItem {
    label: string
    value: string | number | ReactNode
    fullWidth?: boolean
}

interface InfoCardProps {
    title: string | ReactNode
    icon?: ReactNode
    items: InfoItem[]
    delay?: number
    className?: string
}

export default function InfoCard({
    title,
    icon,
    items,
    delay = 0,
    className = ""
}: InfoCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className={`rounded-2xl bg-card p-6 shadow-sm border border-border/50 ${className}`}
        >
            <div className="flex items-center gap-3 mb-6">
                {icon && (
                    <div className="p-2 rounded-lg bg-accent/10 text-foreground">
                        {icon}
                    </div>
                )}
                <h3 className="text-xl font-bold text-foreground">{title}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className={`space-y-1 ${item.fullWidth ? 'col-span-1 md:col-span-2 lg:col-span-3' : ''}`}
                    >
                        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                            {item.label}
                        </div>
                        <div className="text-foreground font-semibold text-base break-all">
                            {item.value || 'N/A'}
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    )
}
