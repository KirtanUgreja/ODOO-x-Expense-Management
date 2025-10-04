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
