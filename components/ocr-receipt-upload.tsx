"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Loader2, CheckCircle2 } from "lucide-react"
import { extractReceiptData, createReceiptUrl } from "@/lib/ocr-service"
import type { OCRData } from "@/lib/types"

interface OCRReceiptUploadProps {
  onDataExtracted: (data: OCRData, receiptUrl: string) => void
}

export function OCRReceiptUpload({ onDataExtracted }: OCRReceiptUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState<OCRData | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    setExtractedData(null)

    try {
      const [ocrData, receiptUrl] = await Promise.all([extractReceiptData(file), createReceiptUrl(file)])

      setExtractedData(ocrData)
      setReceiptPreview(receiptUrl)
      onDataExtracted(ocrData, receiptUrl)
    } catch (error) {
      console.error("OCR processing failed:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg">Upload Receipt (OCR)</CardTitle>
        <CardDescription>Automatically extract expense details from receipt image</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
                <p className="text-sm text-muted-foreground">Processing receipt...</p>
              </>
            ) : extractedData ? (
              <>
                <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto" />
                <p className="text-sm text-green-500 font-medium">Receipt processed successfully!</p>
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
                    {extractedData.amount} {extractedData.currency}
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
          </div>
        )}
      </CardContent>
    </Card>
  )
}
