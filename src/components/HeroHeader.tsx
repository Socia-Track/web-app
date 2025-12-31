import { motion } from "framer-motion"
import { ReactNode } from "react"

interface HeroHeaderProps {
    title: string | ReactNode
    description: string
    icon?: ReactNode
    actions?: ReactNode
    badge?: string
}

export default function HeroHeader({
    title,
    description,
    icon,
    actions,
    badge
}: HeroHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="pt-12 pb-16 px-4 sm:px-6 lg:px-8"
        >
            <div className="container mx-auto max-w-7xl">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex-1">
                        {badge && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-4"
                            >
                                <span className="text-sm font-semibold text-foreground">{badge}</span>
                            </motion.div>
                        )}

                        <div className="flex items-start gap-4 mb-4">
                            {icon && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="flex-shrink-0"
                                >
                                    {icon}
                                </motion.div>
                            )}

                            <div className="flex-1">
                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 leading-tight"
                                >
                                    {title}
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-lg sm:text-xl text-muted-foreground max-w-3xl leading-relaxed"
                                >
                                    {description}
                                </motion.p>
                            </div>
                        </div>
                    </div>

                    {actions && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex-shrink-0"
                        >
                            {actions}
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
