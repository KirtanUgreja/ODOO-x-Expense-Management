export type UserRole = "admin" | "manager" | "employee"

export type ExpenseStatus = "pending" | "approved" | "rejected"

export type Currency = string // Changed to string to support all currencies from API

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  companyId: string
  managerId?: string
  createdAt: string
  password?: string // Added password field for email credentials
  isFirstLogin?: boolean // Flag for first-time login
  isEmailVerified?: boolean // Flag for email verification status
}

export interface Company {
  id: string
  name: string
  currency: Currency
  createdAt: string
}

export interface Expense {
  id: string
  employeeId: string
  employeeName: string
  amount: number
  currency: Currency
  category: string
  description: string
  date: string
  status: ExpenseStatus
  companyId: string
  currentApprovalStep: number
  approvalHistory: ApprovalRecord[]
  createdAt: string
  receiptUrl?: string // Added for OCR receipt storage
  ocrData?: OCRData // Added for OCR extracted data
  convertedAmount?: number // Amount in company currency
}

export interface ApprovalRecord {
  approverId: string
  approverName: string
  action: "approved" | "rejected"
  comment?: string
  timestamp: string
  step: number
}

export interface ApprovalRule {
  id: string
  companyId: string
  sequence: ApprovalStep[]
  isManagerApproverRequired: boolean
  conditionalRules?: ConditionalRule[] // Added conditional approval rules
  createdAt: string
}

export interface ApprovalStep {
  step: number
  role?: UserRole
  userId?: string
  threshold?: number // Added threshold for amount-based routing
}

export interface ConditionalRule {
  id: string
  type: "percentage" | "specific_approver" | "hybrid"
  percentageRequired?: number // e.g., 60 means 60% of approvers must approve
  specificApproverId?: string // e.g., CFO user ID
  specificApproverRole?: UserRole // e.g., "admin" for any admin
  description: string
}

export interface OCRData {
  merchantName?: string
  amount?: number
  currency?: Currency
  date?: string
  category?: string
  items?: string[]
}

export interface EmailNotification {
  id: string
  to: string
  subject: string
  body: string
  timestamp: string
  type: "credentials" | "expense_submitted" | "expense_approved" | "expense_rejected"
}

export interface Country {
  name: string
  currencies: Record<string, { name: string; symbol: string }>
}
