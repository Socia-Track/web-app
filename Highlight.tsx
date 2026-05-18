import { ReactNode } from "react"

interface HighlightProps {
    children: ReactNode
}

export default function Highlight({ children }: HighlightProps) {
    return (
        <span className="bg-accent text-accent-foreground px-2 py-1 rounded">
            {children}
        </span>
    )
}
