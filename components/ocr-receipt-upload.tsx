"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Loader2, CheckCircle2, AlertCircle, X } from "lucide-react"
import { extractReceiptData, createReceiptUrl } from "@/lib/ocr-service"
import type { OCRData } from "@/lib/types"

interface OCRReceiptUploadProps {
  onDataExtracted: (data: OCRData, receiptUrl: string) => void
}

export function OCRReceiptUpload({ onDataExtracted }: OCRReceiptUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState<OCRData | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [processingStep, setProcessingStep] = useState<string>('')

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, etc.)')
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB')
      return
    }

    setIsProcessing(true)
    setExtractedData(null)
    setError(null)
    setProcessingStep('Preparing image...')

    try {
      // Create receipt URL first for preview
      setProcessingStep('Loading image preview...')
      const receiptUrl = await createReceiptUrl(file)
      setReceiptPreview(receiptUrl)
      
      // Then process OCR
      setProcessingStep('Analyzing receipt text...')
      const ocrData = await extractReceiptData(file)

      setExtractedData(ocrData)
      onDataExtracted(ocrData, receiptUrl)
      setProcessingStep('')
    } catch (error) {
      console.error("OCR processing failed:", error)
      setError(error instanceof Error ? error.message : 'Failed to process receipt. Please try again.')
    } finally {
      setIsProcessing(false)
      setProcessingStep('')
    }
  }

  const clearError = () => {
    setError(null)
  }

  const resetUpload = () => {
    setExtractedData(null)
    setReceiptPreview(null)
    setError(null)
    setProcessingStep('')
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg">Upload Receipt (OCR)</CardTitle>
        <CardDescription>Automatically extract expense details from receipt image</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm flex-1">{error}</span>
            <button onClick={clearError} className="text-red-500 hover:text-red-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-6 hover:border-purple-500/50 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="receipt-upload"
            disabled={isProcessing}
          />
          <label htmlFor="receipt-upload" className="cursor-pointer text-center space-y-2">
            {isProcessing ? (
              <>
                <Loader2 className="h-10 w-10 text-purple-500 animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground">{processingStep || 'Processing receipt...'}</p>
                <p className="text-xs text-muted-foreground">This may take a few moments</p>
              </>
            ) : extractedData ? (
              <>
                <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto" />
                <p className="text-sm text-green-500 font-medium">Receipt processed successfully!</p>
                <button 
                  onClick={resetUpload}
                  className="text-xs text-purple-600 hover:text-purple-800 underline"
                >
                  Upload another receipt
                </button>
              </>
            ) : (
              <>
                <Upload className="h-10 w-10 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">Click to upload receipt image</p>
                <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
              </>
            )}
          </label>
        </div>

        {receiptPreview && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Receipt Preview:</p>
            <div className="relative aspect-[3/4] max-h-[300px] rounded-lg overflow-hidden border border-border">
              <img
                src={receiptPreview || "/placeholder.svg"}
                alt="Receipt"
                className="w-full h-full object-contain bg-muted"
              />
            </div>
          </div>
        )}

        {extractedData && (
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Extracted Data:
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {extractedData.merchantName && (
                <>
                  <span className="text-muted-foreground">Merchant:</span>
                  <span className="font-medium">{extractedData.merchantName}</span>
                </>
              )}
              {extractedData.amount && (
                <>
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium">
                    ${extractedData.amount} {extractedData.currency}
                  </span>
                </>
              )}
              {extractedData.date && (
                <>
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{extractedData.date}</span>
                </>
              )}
              {extractedData.category && (
                <>
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">{extractedData.category}</span>
                </>
              )}
            </div>
            {extractedData.items && extractedData.items.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Items detected:</p>
                <div className="flex flex-wrap gap-1">
                  {extractedData.items.slice(0, 3).map((item, index) => (
                    <span key={index} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      {item}
                    </span>
                  ))}
                  {extractedData.items.length > 3 && (
                    <span className="text-xs text-muted-foreground">+{extractedData.items.length - 3} more</span>
                  )}
                </div>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              💡 Tip: Review and edit the extracted data in the form below if needed
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
