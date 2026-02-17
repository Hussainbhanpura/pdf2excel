import { Upload, FileText } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * File upload zone component with drag & drop support
 * Single Responsibility: Handle file upload UI only
 */
export function FileUploadZone({
    file,
    isDragOver,
    onDrop,
    onDragOver,
    onDragLeave,
    onFileSelect,
    onRemoveFile
}) {
    return (
        <div
            className={cn(
                "relative group border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 ease-in-out cursor-pointer overflow-hidden",
                isDragOver
                    ? "border-primary bg-primary/5 ring-4 ring-primary/10 scale-[1.02]"
                    : file
                        ? "border-green-500/30 bg-green-50/50 dark:bg-green-900/10"
                        : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/80 dark:border-zinc-800 dark:hover:border-zinc-700 active:scale-[0.99]"
            )}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => document.getElementById('file-upload').click()}
        >
            <input
                id="file-upload"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={onFileSelect}
            />

            <div className="flex flex-col items-center gap-4 transition-transform duration-200 group-hover:-translate-y-1 relative z-10">
                <div className={cn(
                    "p-4 rounded-2xl transition-all duration-300 shadow-sm",
                    file
                        ? "bg-green-100 text-green-600 dark:bg-green-900/30 shadow-green-200/50"
                        : "bg-white text-zinc-500 shadow-zinc-200/50 dark:bg-zinc-900 dark:text-zinc-400 group-hover:bg-primary/10 group-hover:text-primary group-hover:shadow-primary/10"
                )}>
                    {file ? <FileText className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                </div>

                <div className="space-y-1.5">
                    {file ? (
                        <>
                            <p className="font-semibold text-zinc-900 dark:text-zinc-100 break-all">{file.name}</p>
                            <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
                                <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">PDF</span>
                                <span>•</span>
                                <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                                Drop your PDF here
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                or click to browse
                            </p>
                        </>
                    )}
                </div>
            </div>

            {file && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-zinc-400 hover:text-destructive hover:bg-destructive/10 h-8 w-8 rounded-full"
                    onClick={(e) => {
                        e.stopPropagation()
                        onRemoveFile()
                    }}
                >
                    <span className="sr-only">Remove</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </Button>
            )}
        </div>
    )
}
