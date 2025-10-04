"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User, Company, Expense, ApprovalRule, Currency, UserRole, ApprovalRecord } from "./types"
import { sendCredentialsEmail, sendExpenseNotification } from "./email-service"
import { convertCurrency } from "./currency-service"
import { UserService, CompanyService, ExpenseService } from "./database-services"

interface DataContextType {
  currentUser: User | null
  company: Company | null
  users: User[]
  expenses: Expense[]
  approvalRule: ApprovalRule | null
  databaseMode: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string, name: string, companyName: string, currency: Currency) => Promise<boolean>
  logout: () => void
  createUser: (email: string, name: string, role: UserRole, managerId?: string) => User
  updateUserRole: (userId: string, role: UserRole) => void
  updateUserManager: (userId: string, managerId: string) => void
  createExpense: (
    amount: number,
    currency: Currency,
    category: string,
    description: string,
    date: string,
    receiptUrl?: string,
    ocrData?: any,
  ) => Expense
  updateExpenseStatus: (
    expenseId: string,
    action: "approved" | "rejected",
    approverId: string,
    comment?: string,
  ) => void
  adminOverrideExpense: (expenseId: string, action: "approved" | "rejected", comment?: string) => void
  updateApprovalRule: (isManagerApproverRequired: boolean, sequence: ApprovalRule["sequence"]) => void
  getManagerExpenses: (managerId: string) => Expense[]
  getPendingExpensesForApprover: (approverId: string) => Expense[]
  toggleDatabaseMode: () => void
  initializeDatabase: () => Promise<boolean>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [approvalRule, setApprovalRule] = useState<ApprovalRule | null>(null)
  const [databaseMode, setDatabaseMode] = useState<boolean>(false)

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser")
    const storedCompany = localStorage.getItem("company")
    const storedUsers = localStorage.getItem("users")
    const storedExpenses = localStorage.getItem("expenses")
    const storedApprovalRule = localStorage.getItem("approvalRule")

    if (storedUser) setCurrentUser(JSON.parse(storedUser))
    if (storedCompany) setCompany(JSON.parse(storedCompany))
    if (storedUsers) setUsers(JSON.parse(storedUsers))
    if (storedExpenses) setExpenses(JSON.parse(storedExpenses))
    if (storedApprovalRule) setApprovalRule(JSON.parse(storedApprovalRule))
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    const storedUsers = localStorage.getItem("users")
    if (!storedUsers) return false

    const allUsers: User[] = JSON.parse(storedUsers)
    const user = allUsers.find((u) => u.email === email)

    if (user) {
      setCurrentUser(user)
      localStorage.setItem("currentUser", JSON.stringify(user))
      return true
    }
    return false
  }

  const signup = async (
    email: string,
    password: string,
    name: string,
    companyName: string,
    currency: Currency,
  ): Promise<boolean> => {
    const companyId = `company-${Date.now()}`
    const userId = `user-${Date.now()}`

    const newCompany: Company = {
      id: companyId,
      name: companyName,
      currency,
      createdAt: new Date().toISOString(),
    }

    const newUser: User = {
      id: userId,
      email,
      name,
      role: "admin",
      companyId,
      createdAt: new Date().toISOString(),
    }

    const defaultApprovalRule: ApprovalRule = {
      id: `rule-${Date.now()}`,
      companyId,
      sequence: [
        { step: 1, role: "manager" },
        { step: 2, role: "admin" },
      ],
      isManagerApproverRequired: true,
      createdAt: new Date().toISOString(),
    }

    setCompany(newCompany)
    setCurrentUser(newUser)
    setUsers([newUser])
    setApprovalRule(defaultApprovalRule)

    localStorage.setItem("company", JSON.stringify(newCompany))
    localStorage.setItem("currentUser", JSON.stringify(newUser))
    localStorage.setItem("users", JSON.stringify([newUser]))
    localStorage.setItem("approvalRule", JSON.stringify(defaultApprovalRule))

    return true
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem("currentUser")
  }

  const createUser = (email: string, name: string, role: UserRole, managerId?: string): User => {
    const password = Math.random().toString(36).slice(-8)

    console.log("[v0] Creating user:", { email, name, role, managerId })

    const newUser: User = {
      id: `user-${Date.now()}-${Math.random()}`,
      email,
      name,
      role,
      companyId: company!.id,
      managerId,
      password,
      createdAt: new Date().toISOString(),
    }

    const updatedUsers = [...users, newUser]
    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))

    console.log("[v0] User created, sending credentials email...")
    // Send email asynchronously (don't wait for completion)
    sendCredentialsEmail(newUser, password)
      .then(() => console.log("[v0] Credentials email sent successfully"))
      .catch((error) => console.error("[v0] Failed to send credentials email:", error))

    return newUser
  }

  const updateUserRole = (userId: string, role: UserRole) => {
    const updatedUsers = users.map((u) => (u.id === userId ? { ...u, role } : u))
    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))
  }

  const updateUserManager = (userId: string, managerId: string) => {
    const updatedUsers = users.map((u) => (u.id === userId ? { ...u, managerId } : u))
    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))
  }

  const createExpense = (
    amount: number,
    currency: Currency,
    category: string,
    description: string,
    date: string,
    receiptUrl?: string,
    ocrData?: any,
  ): Expense => {
    const newExpense: Expense = {
      id: `expense-${Date.now()}-${Math.random()}`,
      employeeId: currentUser!.id,
      employeeName: currentUser!.name,
      amount,
      currency,
      category,
      description,
      date,
      status: "pending",
      companyId: company!.id,
      currentApprovalStep: 0,
      approvalHistory: [],
      receiptUrl,
      ocrData,
      createdAt: new Date().toISOString(),
    }

    if (currency !== company!.currency) {
      convertCurrency(amount, currency, company!.currency).then((converted) => {
        newExpense.convertedAmount = converted
        const updatedExpenses = expenses.map((e) => (e.id === newExpense.id ? newExpense : e))
        setExpenses(updatedExpenses)
        localStorage.setItem("expenses", JSON.stringify(updatedExpenses))
      })
    }

    const updatedExpenses = [...expenses, newExpense]
    setExpenses(updatedExpenses)
    localStorage.setItem("expenses", JSON.stringify(updatedExpenses))

    const employee = currentUser!
    if (employee.managerId && approvalRule?.isManagerApproverRequired) {
      const manager = users.find((u) => u.id === employee.managerId)
      if (manager) {
        sendExpenseNotification(newExpense, "submitted", manager.email, manager.name)
          .then(() => console.log("[v0] Expense submission notification sent to manager"))
          .catch((error) => console.error("[v0] Failed to send submission notification:", error))
      }
    }

    return newExpense
  }

  const updateExpenseStatus = (
    expenseId: string,
    action: "approved" | "rejected",
    approverId: string,
    comment?: string,
  ) => {
    setExpenses((prev) =>
      prev.map((expense) => {
        if (expense.id !== expenseId) return expense

        const approver = users.find((u) => u.id === approverId)
        if (!approver) return expense

        const employee = users.find((u) => u.id === expense.employeeId)

        const newHistory: ApprovalRecord = {
          step: expense.currentApprovalStep,
          approverId,
          approverName: approver.name,
          action,
          timestamp: new Date().toISOString(),
          comment,
        }

        const updatedHistory = [...expense.approvalHistory, newHistory]

        if (action === "rejected") {
          if (employee) {
            sendExpenseNotification(expense, "rejected", employee.email, employee.name)
              .then(() => console.log("[v0] Rejection notification sent"))
              .catch((error) => console.error("[v0] Failed to send rejection notification:", error))
          }
          return {
            ...expense,
            status: "rejected",
            approvalHistory: updatedHistory,
          }
        }

        const rule = approvalRule

        if (expense.currentApprovalStep === 0) {
          if (rule && rule.sequence.length > 0) {
            return {
              ...expense,
              currentApprovalStep: 1,
              approvalHistory: updatedHistory,
              status: "pending",
            }
          } else {
            if (employee) {
              sendExpenseNotification(expense, "approved", employee.email, employee.name)
                .then(() => console.log("[v0] Approval notification sent"))
                .catch((error) => console.error("[v0] Failed to send approval notification:", error))
            }
            return {
              ...expense,
              status: "approved",
              approvalHistory: updatedHistory,
            }
          }
        }

        if (rule && rule.sequence.length > 0) {
          const sequenceIndex = expense.currentApprovalStep - 1
          const currentStep = rule.sequence[sequenceIndex]

          if (!currentStep) return expense

          if (currentStep.userId) {
            return {
              ...expense,
              currentApprovalStep: expense.currentApprovalStep + 1,
              approvalHistory: updatedHistory,
              status: "pending",
            }
          }

          if (approver.role === currentStep.role) {
            if (sequenceIndex < rule.sequence.length - 1) {
              return {
                ...expense,
                currentApprovalStep: expense.currentApprovalStep + 1,
                approvalHistory: updatedHistory,
                status: "pending",
              }
            } else {
              if (employee) {
                sendExpenseNotification(
                  expense,
                  action === "approved" ? "approved" : "rejected",
                  employee.email,
                  employee.name,
                )
                  .then(() => console.log(`[v0] ${action} notification sent`))
                  .catch((error) => console.error(`[v0] Failed to send ${action} notification:`, error))
              }
              return {
                ...expense,
                status: action === "approved" ? "approved" : "rejected",
                approvalHistory: updatedHistory,
              }
            }
          }
        }

        return {
          ...expense,
          status: "approved",
          approvalHistory: updatedHistory,
        }
      }),
    )
  }

  const adminOverrideExpense = (expenseId: string, action: "approved" | "rejected", comment?: string) => {
    if (currentUser?.role !== "admin") return

    setExpenses((prev) =>
      prev.map((expense) => {
        if (expense.id !== expenseId) return expense

        const employee = users.find((u) => u.id === expense.employeeId)

        const newHistory: ApprovalRecord = {
          step: -1,
          approverId: currentUser.id,
          approverName: `${currentUser.name} (Admin Override)`,
          action,
          timestamp: new Date().toISOString(),
          comment: comment || "Admin override",
        }

        const updatedHistory = [...expense.approvalHistory, newHistory]

        if (employee) {
          sendExpenseNotification(
            expense,
            action === "approved" ? "approved" : "rejected",
            employee.email,
            employee.name,
          )
        }

        return {
          ...expense,
          status: action === "approved" ? "approved" : "rejected",
          approvalHistory: updatedHistory,
        }
      }),
    )
  }

  const updateApprovalRule = (isManagerApproverRequired: boolean, sequence: ApprovalRule["sequence"]) => {
    const updatedRule: ApprovalRule = {
      id: approvalRule?.id || `rule-${Date.now()}`,
      companyId: company!.id,
      sequence,
      isManagerApproverRequired,
      createdAt: approvalRule?.createdAt || new Date().toISOString(),
    }

    setApprovalRule(updatedRule)
    localStorage.setItem("approvalRule", JSON.stringify(updatedRule))
  }

  const getManagerExpenses = (managerId: string): Expense[] => {
    const managedEmployees = users.filter((u) => u.managerId === managerId).map((u) => u.id)
    return expenses.filter((e) => managedEmployees.includes(e.employeeId))
  }

  const getPendingExpensesForApprover = (approverId: string): Expense[] => {
    const approver = users.find((u) => u.id === approverId)
    if (!approver) return []

    return expenses.filter((expense) => {
      if (expense.status !== "pending") return false

      const employee = users.find((u) => u.id === expense.employeeId)
      const rule = approvalRule

      if (expense.currentApprovalStep === 0) {
        if (rule?.isManagerApproverRequired) {
          return employee?.managerId === approverId
        } else {
          return false
        }
      }

      if (rule && rule.sequence.length > 0) {
        const sequenceIndex = expense.currentApprovalStep - 1
        const currentStep = rule.sequence[sequenceIndex]

        if (!currentStep) return false

        if (currentStep.userId) {
          return currentStep.userId === approverId
        }

        return approver.role === currentStep.role
      }

      return false
    })
  }

  const toggleDatabaseMode = () => {
    const newMode = !databaseMode
    setDatabaseMode(newMode)
    localStorage.setItem("databaseMode", JSON.stringify(newMode))
    
    if (newMode) {
      // When switching to database mode, load data from database
      loadDataFromDatabase()
    }
  }

  const initializeDatabase = async (): Promise<boolean> => {
    try {
      // Test database connection by trying to create a test query
      const testResult = await fetch('/api/database/test', { method: 'GET' })
      return testResult.ok
    } catch (error) {
      console.error('Database connection failed:', error)
      return false
    }
  }

  const loadDataFromDatabase = async () => {
    if (!databaseMode) return

    try {
      // Load company data
      if (currentUser?.companyId) {
        const companyData = await CompanyService.findById(currentUser.companyId)
        if (companyData) setCompany(companyData)
      }

      // Load users data
      if (company?.id) {
        const usersData = await UserService.getByCompany(company.id)
        setUsers(usersData)
      }

      // Load expenses data
      if (company?.id) {
        const expensesData = await ExpenseService.getByCompany(company.id)
        setExpenses(expensesData)
      }
    } catch (error) {
      console.error('Failed to load data from database:', error)
    }
  }

  // Initialize database mode from localStorage
  useEffect(() => {
    const storedDatabaseMode = localStorage.getItem("databaseMode")
    if (storedDatabaseMode) {
      setDatabaseMode(JSON.parse(storedDatabaseMode))
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
        databaseMode,
        login,
        signup,
        logout,
        createUser,
        updateUserRole,
        updateUserManager,
        createExpense,
        updateExpenseStatus,
        adminOverrideExpense,
        updateApprovalRule,
        getManagerExpenses,
        getPendingExpensesForApprover,
        toggleDatabaseMode,
        initializeDatabase,
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
