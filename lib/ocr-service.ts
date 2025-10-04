import type { OCRData } from "./types"

export async function extractReceiptData(
  file: File, 
  progressCallback?: (progress: number) => void
): Promise<OCRData> {
  // Simulate OCR processing with progress
  if (progressCallback) {
    progressCallback(10)
    await new Promise((resolve) => setTimeout(resolve, 500))
    progressCallback(30)
    await new Promise((resolve) => setTimeout(resolve, 500))
    progressCallback(60)
    await new Promise((resolve) => setTimeout(resolve, 500))
    progressCallback(90)
    await new Promise((resolve) => setTimeout(resolve, 500))
    progressCallback(100)
  } else {
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }

  // Mock OCR data - in production, this would use Tesseract.js or a cloud OCR service
  const mockData: OCRData = {
    merchantName: "Sample Restaurant",
    amount: Math.floor(Math.random() * 500) + 20,
    currency: "USD",
    date: new Date().toISOString().split("T")[0],
    category: "Food & Dining",
    items: ["Lunch Special", "Beverage", "Tax", "Tip"],
    confidence: Math.floor(Math.random() * 40) + 60, // Random confidence between 60-100
  }

  return mockData
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
