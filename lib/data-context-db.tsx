"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import type { User, Company, Expense, ApprovalRecord, ApprovalRule, UserRole, Currency } from "@/lib/types"
import { sendCredentialsEmail, sendExpenseNotification } from "@/lib/email-service"
import { convertCurrency } from "@/lib/currency-service"

// Database services (will be imported dynamically for client-side compatibility)
import { CompanyService, UserService, ExpenseService, EmailNotificationService } from "@/lib/database-services"

interface DataContextType {
  // State
  currentUser: User | null
  company: Company | null
  users: User[]
  expenses: Expense[]
  approvalRule: ApprovalRule | null
  isLoading: boolean
  databaseMode: boolean

  // Database toggle
  toggleDatabaseMode: () => void
  initializeDatabase: () => Promise<boolean>

  // Auth
  login: (email: string, password?: string) => Promise<User | null>
  logout: () => void

  // Company
  createCompany: (name: string, currency: string) => void
  updateCompanyCurrency: (currency: string) => void

  // Users
  createUser: (email: string, name: string, role: User["role"], managerId?: string) => void
  updateUserRole: (userId: string, role: User["role"]) => void
  updateUserManager: (userId: string, managerId: string) => void

  // Expenses
  createExpense: (
    amount: number,
    currency: string,
    category: string,
    description: string,
    date: string,
    receiptUrl?: string,
    ocrData?: any
  ) => Promise<Expense>
  updateExpenseStatus: (
    expenseId: string,
    status: "approved" | "rejected",
    approverId: string,
    comment?: string
  ) => void

  // Approval Rules
  updateApprovalRule: (rule: Partial<ApprovalRule>) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined'

export function DataProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [approvalRule, setApprovalRule] = useState<ApprovalRule | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [databaseMode, setDatabaseMode] = useState(false)

  // Initialize data on mount
  useEffect(() => {
    initializeData()
  }, [databaseMode])

  const initializeData = async () => {
    setIsLoading(true)
    
    if (databaseMode) {
      await loadDataFromDatabase()
    } else {
      loadDataFromLocalStorage()
    }
    
    setIsLoading(false)
  }

  const loadDataFromDatabase = async () => {
    try {
      // Load companies (get first one for demo)
      const companies = await CompanyService.getAll()
      if (companies.length > 0) {
        setCompany(companies[0])
        
        // Load users for the company
        const companyUsers = await UserService.getByCompany(companies[0].id)
        setUsers(companyUsers)
        
        // Load expenses for the company
        const companyExpenses = await ExpenseService.getByCompany(companies[0].id)
        setExpenses(companyExpenses)
      }
    } catch (error) {
      console.error('Failed to load data from database:', error)
      // Fall back to localStorage
      setDatabaseMode(false)
      loadDataFromLocalStorage()
    }
  }

  const loadDataFromLocalStorage = () => {
    if (!isBrowser) return

    // Load existing localStorage data
    const savedCompany = localStorage.getItem("company")
    const savedUsers = localStorage.getItem("users")
    const savedExpenses = localStorage.getItem("expenses")
    const savedApprovalRule = localStorage.getItem("approvalRule")

    if (savedCompany) {
      setCompany(JSON.parse(savedCompany))
    } else {
      // Create default company
      const defaultCompany: Company = {
        id: "company-1",
        name: "ExpenseFlow Demo Company",
        currency: "USD",
        createdAt: new Date().toISOString(),
      }
      setCompany(defaultCompany)
      localStorage.setItem("company", JSON.stringify(defaultCompany))
    }

    if (savedUsers) {
      setUsers(JSON.parse(savedUsers))
    } else {
      // Create default admin user
      const defaultAdmin: User = {
        id: "user-1",
        email: "admin@expenseflow.com",
        name: "System Administrator",
        role: "admin",
        companyId: "company-1",
        createdAt: new Date().toISOString(),
      }
      setUsers([defaultAdmin])
      localStorage.setItem("users", JSON.stringify([defaultAdmin]))
    }

    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses))
    }

    if (savedApprovalRule) {
      setApprovalRule(JSON.parse(savedApprovalRule))
    } else {
      const defaultRule: ApprovalRule = {
        id: "rule-1",
        companyId: company?.id || "",
        isManagerApproverRequired: true,
        sequence: [
          { step: 1, role: "manager" as UserRole }
        ],
        createdAt: new Date().toISOString()
      }
      setApprovalRule(defaultRule)
      localStorage.setItem("approvalRule", JSON.stringify(defaultRule))
    }
  }

  const toggleDatabaseMode = () => {
    setDatabaseMode(!databaseMode)
    console.log(databaseMode ? 'Switched to localStorage mode' : 'Switched to database mode')
  }

  const initializeDatabase = async (): Promise<boolean> => {
    try {
      // Try to create a test company to verify database connection
      const testCompany = await CompanyService.create("Test Company", "USD")
      console.log('Database connection successful:', testCompany.name)
      return true
    } catch (error) {
      console.error('Database connection failed:', error)
      return false
    }
  }

  const login = async (email: string, password?: string): Promise<User | null> => {
    let user: User | null = null

    if (databaseMode) {
      // Database authentication
      if (password) {
        user = await UserService.verifyPassword(email, password)
      } else {
        user = await UserService.findByEmail(email)
      }
    } else {
      // localStorage authentication (existing logic)
      user = users.find(u => u.email === email) || null
    }

    if (user) {
      setCurrentUser(user)
      if (isBrowser) {
        localStorage.setItem("currentUser", JSON.stringify(user))
      }
    }

    return user
  }

  const logout = () => {
    setCurrentUser(null)
    if (isBrowser) {
      localStorage.removeItem("currentUser")
    }
  }

  const createCompany = async (name: string, currency: string) => {
    if (databaseMode) {
      const newCompany = await CompanyService.create(name, currency)
      setCompany(newCompany)
    } else {
      const newCompany: Company = {
        id: `company-${Date.now()}`,
        name,
        currency,
        createdAt: new Date().toISOString(),
      }
      setCompany(newCompany)
      if (isBrowser) {
        localStorage.setItem("company", JSON.stringify(newCompany))
      }
    }
  }

  const updateCompanyCurrency = (currency: string) => {
    if (company) {
      const updatedCompany = { ...company, currency }
      setCompany(updatedCompany)
      if (isBrowser) {
        localStorage.setItem("company", JSON.stringify(updatedCompany))
      }
    }
  }

  const createUser = async (email: string, name: string, role: User["role"], managerId?: string) => {
    const password = Math.random().toString(36).slice(-8)

    let newUser: User

    if (databaseMode && company) {
      const hashedPassword = await import('bcryptjs').then(bcrypt => bcrypt.hash(password, 10))
      newUser = await UserService.create(email, name, hashedPassword, role as "admin" | "manager" | "employee", company.id, managerId)
    } else {
      newUser = {
        id: `user-${Date.now()}`,
        email,
        name,
        role,
        companyId: company?.id || "company-1",
        managerId,
        createdAt: new Date().toISOString(),
        password,
      }

      const updatedUsers = [...users, newUser]
      setUsers(updatedUsers)
      if (isBrowser) {
        localStorage.setItem("users", JSON.stringify(updatedUsers))
      }
    }

    // Send credentials email
    await sendCredentialsEmail(newUser, password)

    // Refresh users list if in database mode
    if (databaseMode && company) {
      const updatedUsers = await UserService.getByCompany(company.id)
      setUsers(updatedUsers)
    }

    console.log(`[v0] User created: ${email} with password: ${password}`)
  }

  const updateUserRole = async (userId: string, role: User["role"]) => {
    if (databaseMode) {
      await UserService.updateRole(userId, role)
      if (company) {
        const updatedUsers = await UserService.getByCompany(company.id)
        setUsers(updatedUsers)
      }
    } else {
      const updatedUsers = users.map(user =>
        user.id === userId ? { ...user, role } : user
      )
      setUsers(updatedUsers)
      if (isBrowser) {
        localStorage.setItem("users", JSON.stringify(updatedUsers))
      }
    }
  }

  const updateUserManager = async (userId: string, managerId: string) => {
    if (databaseMode) {
      await UserService.updateManager(userId, managerId === "none" ? null : managerId)
      if (company) {
        const updatedUsers = await UserService.getByCompany(company.id)
        setUsers(updatedUsers)
      }
    } else {
      const updatedUsers = users.map(user =>
        user.id === userId ? { ...user, managerId: managerId === "none" ? undefined : managerId } : user
      )
      setUsers(updatedUsers)
      if (isBrowser) {
        localStorage.setItem("users", JSON.stringify(updatedUsers))
      }
    }
  }

  const createExpense = async (
    amount: number,
    currency: string,
    category: string,
    description: string,
    date: string,
    receiptUrl?: string,
    ocrData?: any,
  ): Promise<Expense> => {
    if (!currentUser || !company) {
      throw new Error("User or company not found")
    }

    const expenseData = {
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      amount,
      currency,
      category,
      description,
      date,
      companyId: company.id,
      receiptUrl,
      ocrData,
    }

    let newExpense: Expense

    if (databaseMode) {
      newExpense = await ExpenseService.create(expenseData)
      // Refresh expenses list
      const updatedExpenses = await ExpenseService.getByCompany(company.id)
      setExpenses(updatedExpenses)
    } else {
      newExpense = {
        id: `expense-${Date.now()}-${Math.random()}`,
        ...expenseData,
        status: "pending",
        currentApprovalStep: 0,
        approvalHistory: [],
        createdAt: new Date().toISOString(),
      }

      // Handle currency conversion
      if (currency !== company.currency) {
        try {
          const converted = await convertCurrency(amount, currency, company.currency)
          newExpense.convertedAmount = converted
        } catch (error) {
          console.warn("Currency conversion failed:", error)
        }
      }

      const updatedExpenses = [...expenses, newExpense]
      setExpenses(updatedExpenses)
      if (isBrowser) {
        localStorage.setItem("expenses", JSON.stringify(updatedExpenses))
      }
    }

    // Send notification to manager
    if (currentUser.managerId && approvalRule?.isManagerApproverRequired) {
      const manager = users.find(u => u.id === currentUser.managerId)
      if (manager) {
        sendExpenseNotification(newExpense, "submitted", manager.email, manager.name)
          .then(() => console.log("[v0] Expense submission notification sent to manager"))
          .catch(err => console.error("[v0] Failed to send manager notification:", err))
      }
    }

    return newExpense
  }

  const updateExpenseStatus = async (
    expenseId: string,
    status: "approved" | "rejected",
    approverId: string,
    comment?: string
  ) => {
    if (databaseMode) {
      const approver = users.find(u => u.id === approverId)
      if (approver) {
        await ExpenseService.updateStatus(expenseId, status, approverId, approver.name, comment)
        // Refresh expenses
        if (company) {
          const updatedExpenses = await ExpenseService.getByCompany(company.id)
          setExpenses(updatedExpenses)
        }
      }
    } else {
      // localStorage logic (existing)
      const expense = expenses.find(e => e.id === expenseId)
      const approver = users.find(u => u.id === approverId)
      
      if (expense && approver) {
        const approvalRecord: ApprovalRecord = {
          approverId,
          approverName: approver.name,
          action: status,
          comment,
          timestamp: new Date().toISOString(),
          step: 1,
        }

        const updatedExpense: Expense = {
          ...expense,
          status,
          currentApprovalStep: status === "approved" ? 1 : 0,
          approvalHistory: [approvalRecord, ...expense.approvalHistory],
        }

        const updatedExpenses = expenses.map(e => e.id === expenseId ? updatedExpense : e)
        setExpenses(updatedExpenses)
        if (isBrowser) {
          localStorage.setItem("expenses", JSON.stringify(updatedExpenses))
        }

        // Send notification to employee
        const employee = users.find(u => u.id === expense.employeeId)
        if (employee) {
          sendExpenseNotification(updatedExpense, status, employee.email, employee.name)
            .then(() => console.log(`[v0] Expense ${status} notification sent to employee`))
            .catch(err => console.error(`[v0] Failed to send ${status} notification:`, err))
        }
      }
    }
  }

  const updateApprovalRule = (rule: Partial<ApprovalRule>) => {
    const updatedRule = { ...approvalRule, ...rule } as ApprovalRule
    setApprovalRule(updatedRule)
    if (isBrowser) {
      localStorage.setItem("approvalRule", JSON.stringify(updatedRule))
    }
  }

  // Auto-login from localStorage
  useEffect(() => {
    if (isBrowser) {
      const savedUser = localStorage.getItem("currentUser")
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser))
      }
    }
  }, [])

  return (
    <DataContext.Provider
      value={{
        currentUser,
        company,
        users,
        expenses,
        approvalRule,
        isLoading,
        databaseMode,
        toggleDatabaseMode,
        initializeDatabase,
        login,
        logout,
        createCompany,
        updateCompanyCurrency,
        createUser,
        updateUserRole,
        updateUserManager,
        createExpense,
        updateExpenseStatus,
        updateApprovalRule,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
