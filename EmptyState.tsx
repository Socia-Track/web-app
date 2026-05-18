import { motion } from "framer-motion"
import { ReactNode } from "react"
import { Button } from "./ui/button"

interface EmptyStateProps {
    icon?: ReactNode
    title: string
    description: string
    action?: {
        label: string
        onClick: () => void
    }
}

export default function EmptyState({
    icon,
    title,
    description,
    action
}: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-16 sm:py-20 lg:py-24 px-4"
        >
            {/* Icon */}
            {icon && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6 p-6 rounded-2xl bg-muted/50 text-muted-foreground"
                >
                    {icon}
                </motion.div>
            )}

            {/* Title */}
            <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl sm:text-3xl font-bold text-foreground mb-3 text-center"
            >
                {title}
            </motion.h3>

            {/* Description */}
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-base sm:text-lg text-muted-foreground text-center max-w-md mb-8 leading-relaxed"
            >
                {description}
            </motion.p>

            {/* Action */}
            {action && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Button
                        size="lg"
                        onClick={action.onClick}
                        className="bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                        {action.label}
                    </Button>
                </motion.div>
            )}
        </motion.div>
    )
}
