"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, Loader2, CheckCircle2, AlertCircle, FileImage, Brain, Zap } from "lucide-react"
import { extractReceiptData, createReceiptUrl } from "@/lib/ocr-service"
import type { OCRData } from "@/lib/types"

interface OCRReceiptUploadProps {
  onDataExtracted: (data: OCRData, receiptUrl: string) => void
}

export function OCRReceiptUpload({ onDataExtracted }: OCRReceiptUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [extractedData, setExtractedData] = useState<OCRData | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>("")

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    setProgress(0)
    setExtractedData(null)
    setFileName(file.name)

    try {
      console.log('[OCR Upload] Starting processing for:', file.name)
      
      // Create receipt URL first for preview
      const receiptUrl = await createReceiptUrl(file)
      setReceiptPreview(receiptUrl)
      setProgress(20)

      // Extract OCR data with progress callback
      const ocrData = await extractReceiptData(file, (progressPercent) => {
        setProgress(20 + (progressPercent * 0.8)) // 20% to 100%
      })

      console.log('[OCR Upload] Extraction complete:', ocrData)
      setExtractedData(ocrData)
      onDataExtracted(ocrData, receiptUrl)
      
    } catch (error) {
      console.error("OCR processing failed:", error)
      // Still show the image even if OCR fails
      const receiptUrl = await createReceiptUrl(file)
      setReceiptPreview(receiptUrl)
      
      const fallbackData: OCRData = {
        merchantName: "OCR Processing Failed",
        amount: 0,
        currency: "USD",
        date: new Date().toISOString().split('T')[0],
        category: "Other",
        items: ["Please enter details manually"],
        confidence: 0
      }
      setExtractedData(fallbackData)
      onDataExtracted(fallbackData, receiptUrl)
    } finally {
      setIsProcessing(false)
      setProgress(100)
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-500" />
          AI Receipt Scanner
        </CardTitle>
        <CardDescription>
          Upload a receipt and our AI will automatically extract all expense details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-6 hover:border-purple-500/50 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isProcessing}
            className="hidden"
            id="receipt-upload"
          />
          <label htmlFor="receipt-upload" className="cursor-pointer flex flex-col items-center">
            {isProcessing ? (
              <Brain className="w-8 h-8 animate-pulse text-purple-500" />
            ) : receiptPreview ? (
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            ) : (
              <Upload className="w-8 h-8 text-muted-foreground" />
            )}
            <span className="mt-2 text-sm text-muted-foreground">
              {isProcessing 
                ? "AI is reading your receipt..." 
                : receiptPreview 
                ? "Receipt processed! Upload another?" 
                : "Click to upload receipt"
              }
            </span>
            <span className="mt-1 text-xs text-muted-foreground">
              PNG, JPG, GIF up to 10MB • Supports multi-language receipts
            </span>
          </label>
        </div>

        {/* Progress Bar */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Processing {fileName}...</span>
              <span className="text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Zap className="w-3 h-3" />
              AI extracting text, amounts, dates, merchant details, and categorizing expense type
            </div>
          </div>
        )}

        {/* Extracted Data Display */}
        {extractedData && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">Receipt processed by AI</span>
              </div>
              {extractedData.confidence !== undefined && (
                <Badge variant={extractedData.confidence > 70 ? "default" : extractedData.confidence > 40 ? "secondary" : "destructive"}>
                  {extractedData.confidence}% confidence
                </Badge>
              )}
            </div>
            
            <div className="grid gap-3">
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <FileImage className="w-3 h-3" />
                  Merchant Name
                </div>
                <div className="font-medium">{extractedData.merchantName}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Amount</div>
                  <div className="font-medium text-lg">
                    {extractedData.currency} {extractedData.amount?.toFixed(2) || '0.00'}
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Date</div>
                  <div className="font-medium">{extractedData.date}</div>
                </div>
              </div>
              
              {extractedData.category && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Auto-detected Category</div>
                  <Badge variant="outline" className="mt-1">
                    {extractedData.category}
                  </Badge>
                </div>
              )}
              
              {extractedData.items && extractedData.items.length > 0 && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Line Items ({extractedData.items.length})</div>
                  <div className="mt-2 space-y-1">
                    {extractedData.items.slice(0, 4).map((item, index) => (
                      <div key={index} className="text-sm bg-background px-2 py-1 rounded border">
                        • {item}
                      </div>
                    ))}
                    {extractedData.items.length > 4 && (
                      <div className="text-xs text-muted-foreground mt-2">
                        +{extractedData.items.length - 4} more items detected
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {extractedData.confidence !== undefined && extractedData.confidence < 60 && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium text-yellow-800 dark:text-yellow-200">Low confidence detection</div>
                  <div className="text-yellow-700 dark:text-yellow-300">
                    Please review and edit the extracted information before submitting.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Receipt Preview */}
        {receiptPreview && (
          <div className="mt-4">
            <div className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
              <FileImage className="w-3 h-3" />
              Receipt Preview:
            </div>
            <div className="border rounded-lg overflow-hidden bg-muted/50">
              <img 
                src={receiptPreview} 
                alt="Receipt" 
                className="w-full max-w-xs mx-auto rounded-lg" 
                style={{ maxHeight: '300px', objectFit: 'contain' }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
