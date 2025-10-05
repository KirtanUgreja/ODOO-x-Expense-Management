"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SupabaseTest() {
  const [status, setStatus] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    setStatus("Testing connection...")

    try {
      if (!supabase) {
        setStatus("❌ Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local")
        return
      }

      // Test basic connection
      const { error } = await supabase.from('companies').select('id').limit(1)

      if (error) {
        // Check if it's RLS error (expected for empty table)
        if (error.code === 'PGRST116' || error.message.includes('0 rows')) {
          setStatus("✅ Connection successful! (No data yet)")
        } else {
          setStatus(`❌ Error: ${error.message}`)
        }
      } else {
        setStatus("✅ Connection successful!")
      }
    } catch (err) {
      setStatus(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Supabase Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testConnection} disabled={loading} className="w-full">
          {loading ? "Testing..." : "Test Connection"}
        </Button>
        {status && (
          <div className="p-3 rounded bg-muted text-sm">
            {status}
          </div>
        )}
      </CardContent>
    </Card>
  )
}