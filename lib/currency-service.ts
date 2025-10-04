export interface CurrencyRate {
  [key: string]: number
}

export interface CountryCurrency {
  country: string
  code: string
  name: string
  symbol: string
}

let currencyCache: CurrencyRate | null = null
let countriesCache: CountryCurrency[] | null = null

export async function fetchCountriesAndCurrencies(): Promise<CountryCurrency[]> {
  if (countriesCache) return countriesCache

  try {
    const response = await fetch("https://restcountries.com/v3.1/all?fields=name,currencies")
    const data = await response.json()

    const currencies: CountryCurrency[] = []
    data.forEach((country: any) => {
      if (country.currencies) {
        Object.entries(country.currencies).forEach(([code, info]: [string, any]) => {
          if (!currencies.find((c) => c.code === code)) {
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

    countriesCache = currencies.sort((a, b) => a.code.localeCompare(b.code))
    return countriesCache
  } catch (error) {
    console.error("Failed to fetch currencies:", error)
    return getDefaultCurrencies()
  }
}

export async function getExchangeRates(baseCurrency: string): Promise<CurrencyRate> {
  try {
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`)
    const data = await response.json()
    return data.rates || {}
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error)
    return {}
  }
}

export async function convertCurrency(amount: number, from: string, to: string): Promise<number> {
  if (from === to) return amount

  try {
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`)
    const data = await response.json()
    currencyCache = data.rates

    const rate = data.rates[to]
    if (!rate) throw new Error(`No rate found for ${to}`)

    return amount * rate
  } catch (error) {
    console.error("Currency conversion failed:", error)
    return amount
  }
}

export function detectCurrencyFromText(text: string): string | null {
  // Currency symbol detection patterns
  const currencyPatterns = [
    { pattern: /\$\d+/, currency: 'USD' },
    { pattern: /€\d+/, currency: 'EUR' },
    { pattern: /£\d+/, currency: 'GBP' },
    { pattern: /¥\d+/, currency: 'JPY' },
    { pattern: /₹\d+/, currency: 'INR' },
    { pattern: /A\$\d+/, currency: 'AUD' },
    { pattern: /C\$\d+/, currency: 'CAD' },
    { pattern: /CHF\s*\d+/i, currency: 'CHF' },
    { pattern: /kr\s*\d+/i, currency: 'SEK' },
    { pattern: /R\$\d+/, currency: 'BRL' },
    { pattern: /₽\d+/, currency: 'RUB' },
    { pattern: /₩\d+/, currency: 'KRW' },
  ]

  for (const { pattern, currency } of currencyPatterns) {
    if (pattern.test(text)) {
      return currency
    }
  }

  // Check for currency codes
  const currencyCodeMatch = text.match(/\b(USD|EUR|GBP|JPY|INR|AUD|CAD|CHF|SEK|NOK|DKK|PLN|CZK|HUF|RON|BGN|HRK|RUB|TRY|UAH|BRL|MXN|ARS|CLP|COP|PEN|UYU|BOB|PYG|VES|CNY|KRW|THB|VND|IDR|MYR|SGD|PHP|HKD|TWD|NZD|ZAR|EGP|MAD|NGN|KES|GHS|UGX|TZS|ETB|MWK|ZMW|BWP|SZL|LSL|MZN|AOA|XAF|XOF|DJF|ERN|ETB|MGA|MRU|MUR|MWK|MZN|RWF|SCR|SOS|SSP|STN|SZL|TZS|UGX|ZMW)\b/i)
  
  if (currencyCodeMatch) {
    return currencyCodeMatch[1].toUpperCase()
  }

  return null
}

export async function getCurrencyByCountry(countryName: string): Promise<string> {
  try {
    const countries = await fetchCountriesAndCurrencies()
    const country = countries.find(c => 
      c.country.toLowerCase().includes(countryName.toLowerCase())
    )
    return country?.code || 'USD'
  } catch (error) {
    console.error('Failed to get currency by country:', error)
    return 'USD'
  }
}

export function detectCountryFromText(text: string): string | null {
  // Common country indicators in receipts
  const countryPatterns = [
    { pattern: /united states|usa|america/i, country: 'United States' },
    { pattern: /united kingdom|england|britain|uk/i, country: 'United Kingdom' },
    { pattern: /canada/i, country: 'Canada' },
    { pattern: /australia/i, country: 'Australia' },
    { pattern: /germany|deutschland/i, country: 'Germany' },
    { pattern: /france|français/i, country: 'France' },
    { pattern: /italy|italia/i, country: 'Italy' },
    { pattern: /spain|españa/i, country: 'Spain' },
    { pattern: /japan|nihon/i, country: 'Japan' },
    { pattern: /india|bharat/i, country: 'India' },
    { pattern: /china|中国/i, country: 'China' },
    { pattern: /brazil|brasil/i, country: 'Brazil' },
    { pattern: /mexico|méxico/i, country: 'Mexico' },
    { pattern: /netherlands|holland/i, country: 'Netherlands' },
    { pattern: /sweden|sverige/i, country: 'Sweden' },
    { pattern: /norway|norge/i, country: 'Norway' },
    { pattern: /denmark|danmark/i, country: 'Denmark' },
    { pattern: /switzerland|schweiz|suisse/i, country: 'Switzerland' },
  ]

  for (const { pattern, country } of countryPatterns) {
    if (pattern.test(text)) {
      return country
    }
  }

  return null
}

function getDefaultCurrencies(): CountryCurrency[] {
  return [
    { country: "United States", code: "USD", name: "US Dollar", symbol: "$" },
    { country: "European Union", code: "EUR", name: "Euro", symbol: "€" },
    { country: "United Kingdom", code: "GBP", name: "British Pound", symbol: "£" },
    { country: "India", code: "INR", name: "Indian Rupee", symbol: "₹" },
    { country: "Japan", code: "JPY", name: "Japanese Yen", symbol: "¥" },
    { country: "Australia", code: "AUD", name: "Australian Dollar", symbol: "A$" },
    { country: "Canada", code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  ]
}
