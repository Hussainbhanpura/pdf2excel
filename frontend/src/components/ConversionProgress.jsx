/**
 * Progress bar component for conversion status
 * Single Responsibility: Display progress only
 */
export function ConversionProgress({ progress, isLoading }) {
    if (!isLoading) return null

    return (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
            <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <p className="text-xs text-center text-zinc-500">Processing document...</p>
        </div>
    )
}
