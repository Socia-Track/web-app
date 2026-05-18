import { motion } from "framer-motion"
import { ReactNode } from "react"
import { ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react"

interface MetricCardProps {
    label: string
    value: string | number
    icon?: ReactNode
    trend?: {
        value: string
        direction: "up" | "down"
    }
    subtitle?: string
    delay?: number
}

export default function MetricCard({
    label,
    value,
    icon,
    trend,
    subtitle,
    delay = 0
}: MetricCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="group relative rounded-2xl bg-card p-6 sm:p-8 lg:p-10 shadow-sm hover:shadow-md transition-all duration-300 border border-border/50"
        >
            <div className="relative">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    {icon && (
                        <div className="p-3 rounded-xl bg-accent/10 text-foreground">
                            {icon}
                        </div>
                    )}

                    {trend && (
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${trend.direction === "up"
                            ? "bg-green-50 text-green-600"
                            : "bg-red-50 text-red-600"
                            }`}>
                            {trend.direction === "up" ? (
                                <TrendingUp size={14} />
                            ) : (
                                <TrendingDown size={14} />
                            )}
                            <span>{trend.value}</span>
                        </div>
                    )}
                </div>

                {/* Label */}
                <p className="text-sm sm:text-base text-muted-foreground mb-2 font-medium">
                    {label}
                </p>

                {/* Value */}
                <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2">
                    {value}
                </p>

                {/* Subtitle */}
                {subtitle && (
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        {subtitle}
                    </p>
                )}

                {/* Hover indicator */}
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowUpRight size={20} className="text-accent" />
                </div>
            </div>
        </motion.div>
    )
}
