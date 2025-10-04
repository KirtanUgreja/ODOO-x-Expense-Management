import { createWorker } from 'tesseract.js'
import type { OCRData } from "./types"

export async function extractReceiptData(file: File): Promise<OCRData> {
  try {
    const worker = await createWorker('eng')
    
    try {
      const { data: { text } } = await worker.recognize(file)
      
      // Parse the OCR text to extract structured data
      const ocrData = parseReceiptText(text)
      
      // If no meaningful data was extracted, provide a fallback
      if (!ocrData.merchantName && !ocrData.amount && !ocrData.date) {
        return getFallbackData()
      }
      
      return ocrData
    } finally {
      await worker.terminate()
    }
  } catch (error) {
    console.error('OCR processing failed:', error)
    // Return fallback data instead of throwing error
    return getFallbackData()
  }
}

function getFallbackData(): OCRData {
  return {
    merchantName: undefined,
    amount: undefined,
    currency: 'USD',
    date: new Date().toISOString().split('T')[0],
    category: 'Other',
    items: []
  }
}

function parseReceiptText(text: string): OCRData {
  if (!text || text.trim().length === 0) {
    return getFallbackData()
  }
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  
  const ocrData: OCRData = {
    currency: 'USD' // default currency
  }
  
  // Extract merchant name (usually first few lines, prioritize longer meaningful text)
  const merchantCandidates = lines.filter(line => 
    line.length > 3 && 
    line.length < 50 && // reasonable length for business name
    !line.match(/\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}/) && // not a date
    !line.match(/\$?\d+\.\d{2}/) && // not an amount
    !line.toLowerCase().includes('total') &&
    !line.toLowerCase().includes('subtotal') &&
    !line.toLowerCase().includes('tax') &&
    !line.toLowerCase().includes('receipt') &&
    !line.toLowerCase().includes('thank') &&
    !/^\d+$/.test(line) && // not just numbers
    !/^[\W]+$/.test(line) // not just special characters
  )
  
  if (merchantCandidates.length > 0) {
    // Pick the first meaningful candidate, or the longest one if multiple
    ocrData.merchantName = merchantCandidates.reduce((prev, current) => 
      current.length > prev.length ? current : prev
    )
  }
  
  // Extract total amount with multiple patterns
  const amountPatterns = [
    /(?:total|amount|sum)[:\s]*\$?([\d,]+\.\d{2})/i,
    /total[:\s]*([\d,]+\.\d{2})/i,
    /\$([\d,]+\.\d{2})\s*(?:total|ttl)/i,
    /([\d,]+\.\d{2})\s*(?:total|ttl)/i
  ]
  
  let foundAmount = false
  for (const pattern of amountPatterns) {
    const match = text.match(pattern)
    if (match) {
      const amount = parseFloat(match[1].replace(',', ''))
      if (amount > 0 && amount < 10000) { // reasonable range
        ocrData.amount = amount
        foundAmount = true
        break
      }
    }
  }
  
  if (!foundAmount) {
    // Fallback: find all dollar amounts and pick the largest reasonable one
    const amounts = text.match(/\$?([\d,]+\.\d{2})/g)
    if (amounts && amounts.length > 0) {
      const validAmounts = amounts
        .map(a => parseFloat(a.replace('$', '').replace(',', '')))
        .filter(a => a > 0 && a < 10000) // filter reasonable amounts
      
      if (validAmounts.length > 0) {
        ocrData.amount = Math.max(...validAmounts)
      }
    }
  }
  
  // Extract date with multiple formats
  const datePatterns = [
    /(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/,
    /(\d{4}[\/-]\d{1,2}[\/-]\d{1,2})/,
    /(\d{1,2}\.\d{1,2}\.\d{2,4})/,
    /(?:date|on)[:\s]*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i
  ]
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern)
    if (match) {
      try {
        const dateParts = match[1].split(/[\/\-\.]/)
        if (dateParts.length === 3) {
          let [first, second, third] = dateParts
          
          // Handle different date formats
          let year, month, day
          if (first.length === 4) {
            // YYYY-MM-DD format
            [year, month, day] = [first, second, third]
          } else {
            // MM-DD-YYYY or DD-MM-YYYY format (assume MM-DD-YYYY for US)
            [month, day, year] = [first, second, third]
          }
          
          if (year.length === 2) year = '20' + year
          
          // Validate date components
          const monthNum = parseInt(month)
          const dayNum = parseInt(day)
          const yearNum = parseInt(year)
          
          if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31 && yearNum >= 2020 && yearNum <= 2030) {
            ocrData.date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
            break
          }
        }
      } catch (e) {
        // Continue to next pattern if parsing fails
        continue
      }
    }
  }
  
  // If no date found, use today's date
  if (!ocrData.date) {
    ocrData.date = new Date().toISOString().split('T')[0]
  }
  
  // Determine category based on merchant name or keywords
  if (ocrData.merchantName) {
    ocrData.category = categorizeExpense(ocrData.merchantName, text)
  }
  
  // Extract items (lines that look like menu items or products)
  const excludeWords = ['total', 'subtotal', 'tax', 'change', 'receipt', 'thank', 'visit', 'server', 'cashier']
  const items = lines.filter(line => {
    const lowerLine = line.toLowerCase()
    return line.length > 2 && 
           line.length < 50 && // reasonable item name length
           !line.match(/\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}/) && // not a date
           !line.match(/^\$?[\d,]+\.\d{2}$/) && // not just an amount
           !excludeWords.some(word => lowerLine.includes(word)) &&
           line !== ocrData.merchantName &&
           !/^\d+$/.test(line) && // not just numbers
           !/^[\W]+$/.test(line) // not just special characters
  }).slice(0, 5) // limit to first 5 items
  
  if (items.length > 0) {
    ocrData.items = items
  }
  
  return ocrData
}

function categorizeExpense(merchantName: string, fullText: string): string {
  const merchant = merchantName.toLowerCase()
  const text = fullText.toLowerCase()
  
  // Food & Dining
  const foodKeywords = ['restaurant', 'cafe', 'pizza', 'burger', 'food', 'diner', 'kitchen', 'grill', 'bistro', 'bar', 'pub']
  const foodTextKeywords = ['menu', 'server', 'tip', 'meal', 'lunch', 'dinner', 'breakfast']
  if (foodKeywords.some(word => merchant.includes(word)) || foodTextKeywords.some(word => text.includes(word))) {
    return 'Food & Dining'
  }
  
  // Transportation
  const transportKeywords = ['uber', 'lyft', 'taxi', 'gas', 'fuel', 'parking', 'metro', 'bus', 'train']
  if (transportKeywords.some(word => merchant.includes(word))) {
    return 'Transportation'
  }
  
  // Office Supplies
  const officeKeywords = ['office', 'staples', 'depot', 'supplies', 'paper', 'pen', 'printer', 'ink']
  if (officeKeywords.some(word => merchant.includes(word)) || officeKeywords.some(word => text.includes(word))) {
    return 'Office Supplies'
  }
  
  // Travel
  const travelKeywords = ['hotel', 'airline', 'airport', 'travel', 'flight', 'booking', 'motel', 'inn']
  if (travelKeywords.some(word => merchant.includes(word)) || travelKeywords.some(word => text.includes(word))) {
    return 'Travel'
  }
  
  // Entertainment
  const entertainmentKeywords = ['movie', 'theater', 'cinema', 'concert', 'show', 'entertainment']
  if (entertainmentKeywords.some(word => merchant.includes(word)) || entertainmentKeywords.some(word => text.includes(word))) {
    return 'Entertainment'
  }
  
  // Default
  return 'Other'
}

export function createReceiptUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      resolve(reader.result as string)
    }
    reader.readAsDataURL(file)
  })
}
