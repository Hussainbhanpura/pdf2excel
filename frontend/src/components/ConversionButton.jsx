import { Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Convert button component
 * Single Responsibility: Button presentation only
 */
export function ConversionButton({ onClick, disabled, isLoading, hasFile }) {
    return (
        <Button
            className={cn(
                "w-full text-base py-6 shadow-lg transition-all duration-300",
                hasFile
                    ? "bg-primary hover:bg-primary/90 shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5"
                    : "bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600 shadow-none hover:bg-zinc-200"
            )}
            size="lg"
            disabled={disabled}
            onClick={onClick}
        >
            {isLoading ? (
                <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Converting...
                </>
            ) : (
                'Convert to Excel'
            )}
        </Button>
    )
}
