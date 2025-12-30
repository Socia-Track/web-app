import { motion } from "framer-motion"
import { ReactNode } from "react"

interface FeatureCardProps {
    icon?: ReactNode
    title: string
    description: string
    action?: ReactNode
    delay?: number
    onClick?: () => void
}

export default function FeatureCard({
    icon,
    title,
    description,
    action,
    delay = 0,
    onClick
}: FeatureCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            onClick={onClick}
            className={`group relative rounded-2xl bg-card p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 border border-border/50 ${onClick ? "cursor-pointer" : ""
                }`}
        >
            <div className="relative">
                {/* Icon */}
                {icon && (
                    <div className="mb-6">
                        <div className="inline-flex p-4 rounded-xl bg-accent/10 text-foreground group-hover:scale-110 transition-transform duration-300">
                            {icon}
                        </div>
                    </div>
                )}

                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 group-hover:text-accent transition-colors duration-300">
                    {title}
                </h3>

                {/* Description */}
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6">
                    {description}
                </p>

                {/* Action */}
                {action && (
                    <div className="mt-auto">
                        {action}
                    </div>
                )}
            </div>
        </motion.div>
    )
}
