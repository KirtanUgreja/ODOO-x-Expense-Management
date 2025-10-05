import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const isValidUrl = (url: string | undefined): url is string => {
  if (!url) return false
  return url.startsWith('http://') || url.startsWith('https://')
}

export const supabase = isValidUrl(supabaseUrl) && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          currency: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          currency: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          currency?: string
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: string
          company_id: string
          manager_id: string | null
          password: string
          is_first_login: boolean
          is_email_verified: boolean
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role: string
          company_id: string
          manager_id?: string | null
          password: string
          is_first_login?: boolean
          is_email_verified?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: string
          company_id?: string
          manager_id?: string | null
          password?: string
          is_first_login?: boolean
          is_email_verified?: boolean
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          employee_id: string
          employee_name: string
          amount: number
          currency: string
          category: string
          description: string
          date: string
          status: string
          company_id: string
          current_approval_step: number
          approval_history: any[]
          receipt_url: string | null
          ocr_data: any | null
          converted_amount: number | null
          created_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          employee_name: string
          amount: number
          currency: string
          category: string
          description: string
          date: string
          status?: string
          company_id: string
          current_approval_step?: number
          approval_history?: any[]
          receipt_url?: string | null
          ocr_data?: any | null
          converted_amount?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          employee_name?: string
          amount?: number
          currency?: string
          category?: string
          description?: string
          date?: string
          status?: string
          company_id?: string
          current_approval_step?: number
          approval_history?: any[]
          receipt_url?: string | null
          ocr_data?: any | null
          converted_amount?: number | null
          created_at?: string
        }
      }
      approval_rules: {
        Row: {
          id: string
          company_id: string
          sequence: any[]
          is_manager_approver_required: boolean
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          sequence: any[]
          is_manager_approver_required?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          sequence?: any[]
          is_manager_approver_required?: boolean
          created_at?: string
        }
      }
    }
  }
}