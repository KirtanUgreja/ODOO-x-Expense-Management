"use client"

import type React from "react"

import { useState } from "react"
import { useData } from "@/lib/data-context-supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Currency } from "@/lib/types"
import { extractReceiptData, createReceiptUrl } from "@/lib/ocr-service"
import { Loader2, FileText } from "lucide-react"

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
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="receipt">Receipt Upload (Optional)</Label>
        <div className="flex items-center gap-3">
          <Input
            id="receipt"
            type="file"
            accept="image/*"
            onChange={handleReceiptUpload}
            disabled={isProcessingOCR}
            className="flex-1"
          />
          {isProcessingOCR && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </div>
          )}
          {receiptFile && !isProcessingOCR && (
            <div className="flex items-center gap-2 text-sm text-primary">
              <FileText className="w-4 h-4" />
              {receiptFile.name}
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Upload a receipt image and we'll automatically extract the details using OCR
        </p>
        {receiptUrl && (
          <div className="mt-2">
            <img src={receiptUrl} alt="Receipt preview" className="max-w-32 h-auto rounded border" />
          </div>
        )}
      </div>

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
  )
}
