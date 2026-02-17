import { useState } from 'react'

/**
 * Custom hook for file upload logic
 * Handles file selection, validation, drag & drop state
 */
export function useFileUpload() {
    const [file, setFile] = useState(null)
    const [isDragOver, setIsDragOver] = useState(false)

    const validateAndSetFile = (selectedFile) => {
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile)
            return { success: true, error: null }
        } else {
            setFile(null)
            return { success: false, error: 'Please select a valid PDF file.' }
        }
    }

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        return validateAndSetFile(selectedFile)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragOver(false)
        const droppedFile = e.dataTransfer.files[0]
        return validateAndSetFile(droppedFile)
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

    const removeFile = () => {
        setFile(null)
    }

    return {
        file,
        isDragOver,
        handleFileChange,
        handleDrop,
        handleDragOver,
        handleDragLeave,
        removeFile,
    }
}
