"use client"

import type React from "react"

import { useState } from "react"
import { useData } from "@/lib/data-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Currency } from "@/lib/types"
import { extractReceiptData, createReceiptUrl } from "@/lib/ocr-service"
import { OCRReceiptUpload } from "@/components/ocr-receipt-upload-enhanced"
import { Loader2, FileText, Zap, CheckCircle2 } from "lucide-react"
import type { OCRData } from "@/lib/types"

interface ExpenseSubmissionFormProps {
  onSuccess?: () => void
}

export function ExpenseSubmissionForm({ onSuccess }: ExpenseSubmissionFormProps) {
  const { company, createExpense } = useData()
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState<Currency>(company?.currency || "USD")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [isProcessingOCR, setIsProcessingOCR] = useState(false)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptUrl, setReceiptUrl] = useState<string>("")
  const [ocrData, setOcrData] = useState<OCRData | null>(null)
  const [isAutoFilled, setIsAutoFilled] = useState(false)

  const categories = [
    "Travel",
    "Meals & Entertainment",
    "Office Supplies",
    "Software & Subscriptions",
    "Training & Education",
    "Marketing",
    "Client Meetings",
    "Transportation",
    "Accommodation",
    "Other",
  ]

  const handleOCRDataExtracted = (data: OCRData, url: string) => {
    console.log('[Expense Form] OCR data received:', data)
    setOcrData(data)
    setReceiptUrl(url)
    
    // Auto-populate form fields
    if (data.amount && data.amount > 0) {
      setAmount(data.amount.toString())
    }
    if (data.currency) {
      setCurrency(data.currency)
    }
    if (data.category) {
      setCategory(data.category)
    }
    if (data.date) {
      setDate(data.date)
    }
    if (data.merchantName && data.merchantName !== "OCR Processing Failed") {
      const descriptionParts = [data.merchantName]
      if (data.items && data.items.length > 0) {
        descriptionParts.push(`Items: ${data.items.slice(0, 3).join(', ')}${data.items.length > 3 ? '...' : ''}`)
      }
      setDescription(descriptionParts.join(' - '))
    }
    
    setIsAutoFilled(true)
  }

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setReceiptFile(file)
    setIsProcessingOCR(true)

    try {
      const url = await createReceiptUrl(file)
      setReceiptUrl(url)

      const ocrData = await extractReceiptData(file)

      if (ocrData.amount) setAmount(ocrData.amount.toString())
      if (ocrData.currency) setCurrency(ocrData.currency)
      if (ocrData.category) setCategory(ocrData.category)
      if (ocrData.date) setDate(ocrData.date)
      if (ocrData.merchantName) {
        setDescription(`${ocrData.merchantName}${ocrData.items ? ` - ${ocrData.items.join(", ")}` : ""}`)
      }
    } catch (error) {
      console.error("OCR processing failed:", error)
    } finally {
      setIsProcessingOCR(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || !category || !description || !date) {
      alert("Please fill in all required fields")
      return
    }

    createExpense(Number.parseFloat(amount), currency, category, description, date, receiptUrl || undefined)

    setAmount("")
    setCurrency(company?.currency || "USD")
    setCategory("")
    setDescription("")
    setDate(new Date().toISOString().split("T")[0])
    setReceiptFile(null)
    setReceiptUrl("")

    onSuccess?.()
  }

  return (
    <div className="space-y-6">
      {/* Enhanced OCR Receipt Upload */}
      <OCRReceiptUpload onDataExtracted={handleOCRDataExtracted} />

      <form onSubmit={handleSubmit} className="space-y-4">{isAutoFilled && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-800 dark:text-green-200">
            Form auto-filled from receipt! Review the details and submit when ready.
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">
            Amount <span className="text-destructive">*</span>
          </Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">
            Currency <span className="text-destructive">*</span>
          </Label>
          <Select value={currency} onValueChange={(value) => setCurrency(value as Currency)}>
            <SelectTrigger id="currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD - US Dollar</SelectItem>
              <SelectItem value="EUR">EUR - Euro</SelectItem>
              <SelectItem value="GBP">GBP - British Pound</SelectItem>
              <SelectItem value="INR">INR - Indian Rupee</SelectItem>
              <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
              <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
              <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">
          Category <span className="text-destructive">*</span>
        </Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger id="category">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">
          Expense Date <span className="text-destructive">*</span>
        </Label>
        <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Provide details about this expense..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          required
        />
      </div>

      <div className="pt-4">
        <Button type="submit" className="w-full">
          Submit Expense
        </Button>
      </div>
    </form>
    </div>
  )
}
