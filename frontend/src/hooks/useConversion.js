import { useState, useEffect } from 'react'

/**
 * Custom hook for PDF to Excel conversion logic
 * Handles API calls, progress simulation, and download state
 */
export function useConversion() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [downloadUrl, setDownloadUrl] = useState(null)
    const [fileName, setFileName] = useState('')
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

    const convert = async (file) => {
        if (!file) return

        setIsLoading(true)
        setError(null)
        setDownloadUrl(null)

        const formData = new FormData()
        formData.append('file', file)

        const apiUrl = import.meta.env.VITE_API_URL
        try {
            const response = await fetch(`${apiUrl}/api/convert`, {
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
                const matches = /filename[^;=\n]*=((['\"]).*?\2|[^;\n]*)/.exec(contentDisposition)
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

    const reset = () => {
        setDownloadUrl(null)
        setError(null)
    }

    return {
        convert,
        isLoading,
        error,
        downloadUrl,
        fileName,
        progress,
        reset,
    }
}
