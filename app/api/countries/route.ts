import { NextResponse } from 'next/server'

// Cache for country/currency data
let countriesCache: any[] | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

export async function GET() {
  try {
    const now = Date.now()
    
    // Return cached data if available and not expired
    if (countriesCache && (now - cacheTimestamp) < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        data: countriesCache,
        cached: true
      })
    }

    // Fetch fresh data from REST Countries API
    console.log('[Countries API] Fetching country/currency data...')
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,currencies')
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Process and structure the data
    const currencies: Array<{
      country: string
      code: string
      name: string
      symbol: string
    }> = []
    
    data.forEach((country: any) => {
      if (country.currencies) {
        Object.entries(country.currencies).forEach(([code, info]: [string, any]) => {
          if (!currencies.find(c => c.code === code)) {
            currencies.push({
              country: country.name.common,
              code,
              name: info.name,
              symbol: info.symbol || code,
            })
          }
        })
      }
    })
    
    // Sort by currency code
    currencies.sort((a, b) => a.code.localeCompare(b.code))
    
    // Cache the processed data
    countriesCache = currencies
    cacheTimestamp = now
    
    console.log(`[Countries API] Successfully fetched ${currencies.length} currencies`)
    
    return NextResponse.json({
      success: true,
      data: currencies,
      cached: false,
      count: currencies.length
    })
    
  } catch (error) {
    console.error('[Countries API] Error:', error)
    
    // Return fallback data if API fails
    const fallbackCurrencies = [
      { country: 'United States', code: 'USD', name: 'US Dollar', symbol: '$' },
      { country: 'European Union', code: 'EUR', name: 'Euro', symbol: '€' },
      { country: 'United Kingdom', code: 'GBP', name: 'British Pound', symbol: '£' },
      { country: 'Japan', code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
      { country: 'India', code: 'INR', name: 'Indian Rupee', symbol: '₹' },
      { country: 'Canada', code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
      { country: 'Australia', code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
      { country: 'Switzerland', code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
    ]
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      fallback: true,
      data: fallbackCurrencies
    }, { status: 500 })
  }
}
