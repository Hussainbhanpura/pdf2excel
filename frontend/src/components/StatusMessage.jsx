import { AlertCircle, CheckCircle, Download } from 'lucide-react'
import { Button } from "@/components/ui/button"

/**
 * Status message component for errors and success
 * Open/Closed Principle: Extendable for different message types
 */
export function StatusMessage({ type, message, downloadUrl, fileName, onDownload }) {
    if (type === 'error') {
        return (
            <div className="bg-destructive/5 border border-destructive/10 text-destructive text-sm p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="font-medium">Conversion Failed</p>
                    <p className="text-xs opacity-90">{message}</p>
                </div>
            </div>
        )
    }

    if (type === 'success' && downloadUrl) {
        return (
            <div className="bg-emerald-500/5 border border-emerald-500/10 text-emerald-700 dark:text-emerald-400 p-5 rounded-xl flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="p-2 bg-emerald-100/50 dark:bg-emerald-900/20 rounded-full">
                        <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
                    </div>
                    <div>
                        <h4 className="font-medium text-emerald-900 dark:text-emerald-100">Ready for Download</h4>
                        <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">Your Excel file has been generated successfully.</p>
                    </div>
                </div>
                <Button
                    variant="default"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
                    onClick={onDownload}
                >
                    <Download className="w-4 h-4 mr-2" />
                    Download Now
                </Button>
            </div>
        )
    }

    return null
}
