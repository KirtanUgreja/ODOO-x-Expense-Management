import type { OCRData } from "./types"

export async function extractReceiptData(file: File): Promise<OCRData> {
  // Simulate OCR processing
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Mock OCR data - in production, this would use Tesseract.js or a cloud OCR service
  const mockData: OCRData = {
    merchantName: "Sample Restaurant",
    amount: Math.floor(Math.random() * 500) + 20,
    currency: "USD",
    date: new Date().toISOString().split("T")[0],
    category: "Food & Dining",
    items: ["Lunch Special", "Beverage", "Tax", "Tip"],
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
