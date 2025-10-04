import { NextRequest, NextResponse } from 'next/server'

// Cache for exchange rates
let ratesCache: Record<string, any> = {}
let cacheTimestamps: Record<string, number> = {}
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')?.toUpperCase()
    const to = searchParams.get('to')?.toUpperCase()
    const amount = searchParams.get('amount')
    
    if (!from || !to) {
      return NextResponse.json({
        success: false,
        error: 'Both "from" and "to" currency parameters are required'
      }, { status: 400 })
    }
    
    if (from === to) {
      return NextResponse.json({
        success: true,
        from,
        to,
        rate: 1,
        amount: amount ? parseFloat(amount) : null,
        convertedAmount: amount ? parseFloat(amount) : null,
        cached: false
      })
    }
    
    const now = Date.now()
    const cacheKey = from
    
    // Check if we have cached rates for this base currency
    if (ratesCache[cacheKey] && (now - (cacheTimestamps[cacheKey] || 0)) < CACHE_DURATION) {
      const rates = ratesCache[cacheKey]
      const rate = rates[to]
      
      if (rate) {
        const convertedAmount = amount ? parseFloat(amount) * rate : null
        return NextResponse.json({
          success: true,
          from,
          to,
          rate,
          amount: amount ? parseFloat(amount) : null,
          convertedAmount,
          cached: true
        })
      }
    }
    
    // Fetch fresh exchange rates
    console.log(`[Currency API] Fetching exchange rates for ${from}`)
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`)
    
    if (!response.ok) {
      throw new Error(`Exchange rate API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.rates || typeof data.rates !== 'object') {
      throw new Error('Invalid response format from exchange rate API')
    }
    
    // Cache the rates
    ratesCache[cacheKey] = data.rates
    cacheTimestamps[cacheKey] = now
    
    const rate = data.rates[to]
    
    if (!rate) {
      return NextResponse.json({
        success: false,
        error: `Exchange rate not available for ${from} to ${to}`
      }, { status:404 })
    }
    
    const convertedAmount = amount ? parseFloat(amount) * rate : null
    
    console.log(`[Currency API] Successfully converted ${from} to ${to}, rate: ${rate}`)
    
    return NextResponse.json({
      success: true,
      from,
      to,
      rate,
      amount: amount ? parseFloat(amount) : null,
      convertedAmount,
      cached: false,
      timestamp: data.date || new Date().toISOString().split('T')[0]
    })
    
  } catch (error) {
    console.error('[Currency API] Error:', error)
    
    // Return fallback rates for common currency pairs
    const fallbackRates: Record<string, Record<string, number>> = {
      'USD': { 'EUR': 0.85, 'GBP': 0.73, 'JPY': 110, 'INR': 75, 'CAD': 1.25, 'AUD': 1.35 },
      'EUR': { 'USD': 1.18, 'GBP': 0.86, 'JPY': 130, 'INR': 88 },
      'GBP': { 'USD': 1.37, 'EUR': 1.16, 'JPY': 151 },
    }
    
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')?.toUpperCase()
    const to = searchParams.get('to')?.toUpperCase()
    const amount = searchParams.get('amount')
    
    const fallbackRate = fallbackRates[from || '']?.[to || ''] || 1
    const convertedAmount = amount ? parseFloat(amount) * fallbackRate : null
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Currency conversion failed',
      fallback: true,
      from,
      to,
      rate: fallbackRate,
      amount: amount ? parseFloat(amount) : null,
      convertedAmount
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversions } = body
    
    if (!Array.isArray(conversions)) {
      return NextResponse.json({
        success: false,
        error: 'Body must contain a "conversions" array'
      }, { status: 400 })
    }
    
    const results = []
    
    for (const conversion of conversions) {
      const { from, to, amount } = conversion
      
      if (!from || !to || amount === undefined) {
        results.push({
          success: false,
          error: 'Each conversion must have from, to, and amount',
          ...conversion
        })
        continue
      }
      
      try {
        const response = await fetch(
          `${request.nextUrl.origin}/api/currency?from=${from}&to=${to}&amount=${amount}`
        )
        const data = await response.json()
        results.push(data)
      } catch (error) {
        results.push({
          success: false,
          error: 'Conversion failed',
          from,
          to,
          amount
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      conversions: results
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Invalid request body'
    }, { status: 400 })
  }
}
