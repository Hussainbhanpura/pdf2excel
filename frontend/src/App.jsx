import { Sparkles } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { useFileUpload } from './hooks/useFileUpload'
import { useConversion } from './hooks/useConversion'
import { FileUploadZone } from './components/FileUploadZone'
import { ConversionProgress } from './components/ConversionProgress'
import { StatusMessage } from './components/StatusMessage'
import { ConversionButton } from './components/ConversionButton'

/**
 * Main App component - Composition Root
 * Orchestrates all components following SOLID principles
 */
function App() {
  // Custom hooks for business logic (Dependency Inversion)
  const {
    file,
    isDragOver,
    handleFileChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    removeFile,
  } = useFileUpload()

  const {
    convert,
    isLoading,
    error,
    downloadUrl,
    fileName,
    progress,
    reset,
  } = useConversion()

  // Event handlers
  const handleConvert = () => {
    convert(file)
  }

  const handleRemoveFile = () => {
    removeFile()
    reset()
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
            PDF Table data to Excel file
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-8 space-y-6">
          {/* File Upload Zone */}
          <FileUploadZone
            file={file}
            isDragOver={isDragOver}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onFileSelect={handleFileChange}
            onRemoveFile={handleRemoveFile}
          />

          {/* Conversion Progress */}
          <ConversionProgress progress={progress} isLoading={isLoading} />

          {/* Error Message */}
          {error && (
            <StatusMessage type="error" message={error} />
          )}

          {/* Success Message with Download */}
          {downloadUrl && (
            <StatusMessage
              type="success"
              downloadUrl={downloadUrl}
              fileName={fileName}
              onDownload={handleDownload}
            />
          )}
        </CardContent>

        <CardFooter className="pt-2 pb-8">
          {!downloadUrl && (
            <ConversionButton
              onClick={handleConvert}
              disabled={!file || isLoading}
              isLoading={isLoading}
              hasFile={!!file}
            />
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
