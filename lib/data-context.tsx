"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User, Company, Expense, ApprovalRule, Currency, UserRole, ApprovalRecord } from "./types"
import { sendCredentialsEmail, sendExpenseNotification } from "./email-service"
import { convertCurrency } from "./currency-service"

interface DataContextType {
  currentUser: User | null
  company: Company | null
  users: User[]
  expenses: Expense[]
  approvalRule: ApprovalRule | null
  login: (email: string, password: string) => Promise<{ success: boolean; requiresPasswordChange?: boolean; user?: User }>
  signup: (email: string, password: string, confirmPassword: string, name: string, companyName: string, currency: Currency) => Promise<{ success: boolean; error?: string }>
  changePassword: (userId: string, newPassword: string) => void
  logout: () => void
  createUser: (email: string, name: string, role: UserRole, managerId?: string) => User
  updateUserRole: (userId: string, role: UserRole) => void
  updateUserManager: (userId: string, managerId: string) => void
  resetUserPassword: (userId: string) => string
  deleteUser: (userId: string) => void
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
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [approvalRule, setApprovalRule] = useState<ApprovalRule | null>(null)

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

    const eventSource = new EventSource('/api/events')
    
    eventSource.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data)
      
      if (type === 'users') {
        setUsers(data)
        localStorage.setItem('users', JSON.stringify(data))
      }
      if (type === 'expenses') {
        setExpenses(data)
        localStorage.setItem('expenses', JSON.stringify(data))
      }
      if (type === 'approvalRule') {
        setApprovalRule(data)
        localStorage.setItem('approvalRule', JSON.stringify(data))
      }
    }

    return () => eventSource.close()
  }, [])

  const broadcast = async (type: string, data: any) => {
    localStorage.setItem(type, JSON.stringify(data))
    
    try {
      await fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data })
      })
    } catch (error) {
      console.error('Broadcast failed:', error)
    }
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; requiresPasswordChange?: boolean; user?: User }> => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { success: false }
    }

    // Use current users state instead of localStorage for updated passwords
    const user = users.find((u) => u.email === email)

    if (user && user.password === password) {
      // Check if this is first login (admin-created user)
      if (user.isFirstLogin) {
        return { success: true, requiresPasswordChange: true, user }
      }
      
      setCurrentUser(user)
      localStorage.setItem("currentUser", JSON.stringify(user))
      return { success: true }
    }
    return { success: false }
  }

  const changePassword = (userId: string, newPassword: string) => {
    const updatedUsers = users.map((u) => 
      u.id === userId 
        ? { ...u, password: newPassword, isFirstLogin: false }
        : u
    )
    setUsers(updatedUsers)
    broadcast('users', updatedUsers)
    
    // Update current user if it's the same user
    const updatedUser = updatedUsers.find(u => u.id === userId)
    if (updatedUser && currentUser?.id === userId) {
      setCurrentUser(updatedUser)
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))
    }
  }

  const signup = async (
    email: string,
    password: string,
    confirmPassword: string,
    name: string,
    companyName: string,
    currency: Currency,
  ): Promise<{ success: boolean; error?: string }> => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { success: false, error: "Please enter a valid email address" }
    }

    // Password validation
    const passwordRequirements = [
      { test: (p: string) => p.length >= 8, message: "Password must be at least 8 characters" },
      { test: (p: string) => /[A-Z]/.test(p), message: "Password must contain uppercase letter" },
      { test: (p: string) => /[a-z]/.test(p), message: "Password must contain lowercase letter" },
      { test: (p: string) => /\d/.test(p), message: "Password must contain a number" },
      { test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p), message: "Password must contain special character" },
    ]

    for (const req of passwordRequirements) {
      if (!req.test(password)) {
        return { success: false, error: req.message }
      }
    }

    // Password confirmation
    if (password !== confirmPassword) {
      return { success: false, error: "Passwords do not match" }
    }

    // Check if email already exists
    const storedUsers = localStorage.getItem("users")
    if (storedUsers) {
      const existingUsers: User[] = JSON.parse(storedUsers)
      if (existingUsers.some(u => u.email === email)) {
        return { success: false, error: "Email already exists" }
      }
    }
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
      password,
      isEmailVerified: true, // Admin users are auto-verified
      isFirstLogin: false,
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

    return { success: true }
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
      isFirstLogin: true, // Admin-created users must change password on first login
      isEmailVerified: false, // Admin-created users don't need email verification
      createdAt: new Date().toISOString(),
    }

    const updatedUsers = [...users, newUser]
    setUsers(updatedUsers)
    broadcast('users', updatedUsers)

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
    broadcast('users', updatedUsers)
  }

  const updateUserManager = (userId: string, managerId: string) => {
    const updatedUsers = users.map((u) => (u.id === userId ? { ...u, managerId } : u))
    setUsers(updatedUsers)
    broadcast('users', updatedUsers)
  }

  const resetUserPassword = (userId: string): string => {
    const newPassword = Math.random().toString(36).slice(-8)
    const updatedUsers = users.map((u) => 
      u.id === userId 
        ? { ...u, password: newPassword, isFirstLogin: true }
        : u
    )
    setUsers(updatedUsers)
    broadcast('users', updatedUsers)
    
    const user = users.find(u => u.id === userId)
    if (user) {
      sendCredentialsEmail(user, newPassword)
        .then(() => console.log("[v0] Password reset email sent"))
        .catch((error) => console.error("[v0] Failed to send reset email:", error))
    }
    
    return newPassword
  }

  const deleteUser = (userId: string) => {
    const updatedUsers = users.filter((u) => u.id !== userId)
    setUsers(updatedUsers)
    broadcast('users', updatedUsers)
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

    const updatedExpenses = [...expenses, newExpense]
    setExpenses(updatedExpenses)
    broadcast('expenses', updatedExpenses)

    if (currency !== company!.currency) {
      convertCurrency(amount, currency, company!.currency).then((converted) => {
        newExpense.convertedAmount = converted
        setExpenses((prev) => {
          const updated = prev.map((e) => (e.id === newExpense.id ? { ...e, convertedAmount: converted } : e))
          broadcast('expenses', updated)
          return updated
        })
      })
    }

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
    setExpenses((prev) => {
      const updated = prev.map((expense) => {
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
      })
      broadcast('expenses', updated)
      return updated
    })
  }

  const adminOverrideExpense = (expenseId: string, action: "approved" | "rejected", comment?: string) => {
    if (currentUser?.role !== "admin") return

    setExpenses((prev) => {
      const updated = prev.map((expense) => {
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
      })
      broadcast('expenses', updated)
      return updated
    })
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
    broadcast('approvalRule', updatedRule)
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

  return (
    <DataContext.Provider
      value={{
        currentUser,
        company,
        users,
        expenses,
        approvalRule,
        login,
        signup,
        changePassword,
        logout,
        createUser,
        updateUserRole,
        updateUserManager,
        resetUserPassword,
        deleteUser,
        createExpense,
        updateExpenseStatus,
        adminOverrideExpense,
        updateApprovalRule,
        getManagerExpenses,
        getPendingExpensesForApprover,
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
