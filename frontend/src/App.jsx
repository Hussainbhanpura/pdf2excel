import { useState, useEffect } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Download, Sparkles } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { cn } from "@/lib/utils"

function App() {
  const [file, setFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [fileName, setFileName] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [progress, setProgress] = useState(0)

  // Simulate progress when loading
  useEffect(() => {
    let interval
    if (isLoading) {
      setProgress(0)
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev
          return prev + Math.random() * 10
        })
      }, 500)
    } else {
      setProgress(100)
    }
    return () => clearInterval(interval)
  }, [isLoading])

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    validateAndSetFile(selectedFile)
  }

  const validateAndSetFile = (selectedFile) => {
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setError(null)
      setDownloadUrl(null)
    } else {
      setFile(null)
      setError('Please select a valid PDF file.')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    validateAndSetFile(droppedFile)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isDragOver) setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleConvert = async () => {
    if (!file) return

    setIsLoading(true)
    setError(null)
    setDownloadUrl(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://10.10.8.230:5000/api/convert', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Conversion failed')
      }

      // Create a blob from the response and a download link
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      setDownloadUrl(url)

      // Extract filename
      const contentDisposition = response.headers.get('Content-Disposition')
      let outputName = 'converted.xlsx'
      if (contentDisposition && contentDisposition.indexOf('filename=') !== -1) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition)
        if (matches != null && matches[1]) {
          outputName = matches[1].replace(/['"]/g, '')
        }
      } else {
        outputName = file.name.replace('.pdf', '.xlsx')
      }
      setFileName(outputName)

    } catch (err) {
      setError(err.message || 'An error occurred during conversion.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950 bg-[length:400%_400%] animate-gradient-xy">
      <div className="absolute inset-0 bg-grid-zinc-900/[0.02] dark:bg-grid-white/[0.02] bg-[bottom_1px_center] [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none" />

      <Card className="w-full max-w-lg shadow-2xl border-white/50 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl transition-all duration-300 hover:shadow-primary/5">
        <CardHeader className="space-y-1 text-center pb-8 border-b border-zinc-100/50 dark:border-zinc-800/50">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
            <Sparkles className="w-6 h-6" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
            PDF to Excel
          </CardTitle>
          <CardDescription className="text-zinc-500 dark:text-zinc-400">
            Professional document conversion suite.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-8 space-y-6">
          <div
            className={cn(
              "relative group border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 ease-in-out cursor-pointer overflow-hidden",
              isDragOver
                ? "border-primary bg-primary/5 ring-4 ring-primary/10 scale-[1.02]"
                : file
                  ? "border-green-500/30 bg-green-50/50 dark:bg-green-900/10"
                  : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/80 dark:border-zinc-800 dark:hover:border-zinc-700 active:scale-[0.99]"
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => document.getElementById('file-upload').click()}
          >
            <input
              id="file-upload"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
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
                  setFile(null)
                  setDownloadUrl(null)
                  setError(null)
                }}
              >
                <span className="sr-only">Remove</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </Button>
            )}
          </div>

          {/* Progress Bar during loading */}
          {isLoading && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-center text-zinc-500">Processing document...</p>
            </div>
          )}

          {error && (
            <div className="bg-destructive/5 border border-destructive/10 text-destructive text-sm p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium">Conversion Failed</p>
                <p className="text-xs opacity-90">{error}</p>
              </div>
            </div>
          )}

          {downloadUrl && (
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
                onClick={() => {
                  const link = document.createElement('a')
                  link.href = downloadUrl
                  link.download = fileName
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Now
              </Button>
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-2 pb-8">
          {!downloadUrl && (
            <Button
              className={cn(
                "w-full text-base py-6 shadow-lg transition-all duration-300",
                file
                  ? "bg-primary hover:bg-primary/90 shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5"
                  : "bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600 shadow-none hover:bg-zinc-200"
              )}
              size="lg"
              disabled={!file || isLoading}
              onClick={handleConvert}
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
          )}
        </CardFooter>
      </Card>

      <div className="fixed bottom-4 text-center w-full text-xs text-zinc-400 mix-blend-multiply dark:mix-blend-screen pointer-events-none">
        Secure Local Processing • v1.0.0
      </div>
    </div>
  )
}

export default App
