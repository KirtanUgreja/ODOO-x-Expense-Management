"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User, Company, Expense, ApprovalRule, Currency, UserRole, ApprovalRecord } from "./types"
import { sendCredentialsEmail, sendExpenseNotification } from "./email-service"
import { convertCurrency } from "./currency-service"
import { DatabaseService } from "./database-service"

interface DataContextType {
  currentUser: User | null
  company: Company | null
  users: User[]
  expenses: Expense[]
  approvalRule: ApprovalRule | null
  login: (email: string, password: string) => Promise<{ success: boolean; requiresPasswordChange?: boolean; user?: User }>
  signup: (email: string, password: string, confirmPassword: string, name: string, companyName: string, currency: Currency) => Promise<{ success: boolean; error?: string }>
  changePassword: (userId: string, newPassword: string) => Promise<void>
  logout: () => void
  createUser: (email: string, name: string, role: UserRole, managerId?: string) => Promise<User>
  updateUserRole: (userId: string, role: UserRole) => Promise<void>
  updateUserManager: (userId: string, managerId: string) => Promise<void>
  resetUserPassword: (userId: string) => Promise<string>
  deleteUser: (userId: string) => Promise<void>
  createExpense: (
    amount: number,
    currency: Currency,
    category: string,
    description: string,
    date: string,
    receiptUrl?: string,
    ocrData?: any,
  ) => Promise<Expense>
  updateExpenseStatus: (
    expenseId: string,
    action: "approved" | "rejected",
    approverId: string,
    comment?: string,
  ) => Promise<void>
  adminOverrideExpense: (expenseId: string, action: "approved" | "rejected", comment?: string) => Promise<void>
  updateApprovalRule: (isManagerApproverRequired: boolean, sequence: ApprovalRule["sequence"]) => Promise<void>
  getManagerExpenses: (managerId: string) => Expense[]
  getPendingExpensesForApprover: (approverId: string) => Expense[]
  refreshData: () => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [approvalRule, setApprovalRule] = useState<ApprovalRule | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshData = async () => {
    if (!currentUser?.companyId) return

    try {
      const [companyData, usersData, expensesData, approvalRuleData] = await Promise.all([
        DatabaseService.getCompany(currentUser.companyId),
        DatabaseService.getUsersByCompany(currentUser.companyId),
        DatabaseService.getExpensesByCompany(currentUser.companyId),
        DatabaseService.getApprovalRuleByCompany(currentUser.companyId),
      ])

      if (companyData) setCompany(companyData)
      setUsers(usersData)
      setExpenses(expensesData)
      if (approvalRuleData) setApprovalRule(approvalRuleData)
    } catch (error) {
      // Silently fail if Supabase not configured
    }
  }

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (currentUser) {
      refreshData()
      
      // Set up periodic refresh every 10 seconds to keep data in sync
      const intervalId = setInterval(() => {
        refreshData()
      }, 10000)
      
      return () => clearInterval(intervalId)
    }
  }, [currentUser])

  const login = async (email: string, password: string): Promise<{ success: boolean; requiresPasswordChange?: boolean; user?: User }> => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { success: false }
    }

    try {
      const user = await DatabaseService.getUserByEmail(email)
      
      if (user && user.password === password) {
        if (user.isFirstLogin) {
          return { success: true, requiresPasswordChange: true, user }
        }
        
        setCurrentUser(user)
        localStorage.setItem("currentUser", JSON.stringify(user))
        return { success: true }
      }
      return { success: false }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false }
    }
  }

  const changePassword = async (userId: string, newPassword: string) => {
    try {
      const updatedUser = await DatabaseService.updateUser(userId, {
        password: newPassword,
        isFirstLogin: false
      })
      
      setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u))
      
      if (currentUser?.id === userId) {
        setCurrentUser(updatedUser)
        localStorage.setItem("currentUser", JSON.stringify(updatedUser))
      }
    } catch (error) {
      console.error('Change password error:', error)
      throw error
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { success: false, error: "Please enter a valid email address" }
    }

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

    if (password !== confirmPassword) {
      return { success: false, error: "Passwords do not match" }
    }

    try {
      const existingUser = await DatabaseService.getUserByEmail(email)
      if (existingUser) {
        return { success: false, error: "Email already exists" }
      }

      const newCompany = await DatabaseService.createCompany({
        name: companyName,
        currency,
      })

      const newUser = await DatabaseService.createUser({
        email,
        name,
        role: "admin",
        companyId: newCompany.id,
        password,
        isEmailVerified: true,
        isFirstLogin: false,
      })

      const defaultApprovalRule = await DatabaseService.createApprovalRule({
        companyId: newCompany.id,
        sequence: [
          { step: 1, role: "manager" },
          { step: 2, role: "admin" },
        ],
        isManagerApproverRequired: true,
      })

      setCompany(newCompany)
      setCurrentUser(newUser)
      setUsers([newUser])
      setApprovalRule(defaultApprovalRule)

      localStorage.setItem("currentUser", JSON.stringify(newUser))

      return { success: true }
    } catch (error) {
      console.error('Signup error:', error)
      return { success: false, error: "Failed to create account" }
    }
  }

  const logout = () => {
    setCurrentUser(null)
    setCompany(null)
    setUsers([])
    setExpenses([])
    setApprovalRule(null)
    localStorage.removeItem("currentUser")
  }

  const createUser = async (email: string, name: string, role: UserRole, managerId?: string): Promise<User> => {
    const password = Math.random().toString(36).slice(-8)

    try {
      const newUser = await DatabaseService.createUser({
        email,
        name,
        role,
        companyId: company!.id,
        managerId,
        password,
        isFirstLogin: true,
        isEmailVerified: false,
      })

      setUsers(prev => [...prev, newUser])

      sendCredentialsEmail(newUser, password)
        .then(() => console.log("Credentials email sent successfully"))
        .catch(() => {}) // Silently fail if email not configured

      return newUser
    } catch (error) {
      console.error('Create user error:', error)
      throw error
    }
  }

  const updateUserRole = async (userId: string, role: UserRole) => {
    try {
      const updatedUser = await DatabaseService.updateUser(userId, { role })
      setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u))
    } catch (error) {
      console.error('Update user role error:', error)
      throw error
    }
  }

  const updateUserManager = async (userId: string, managerId: string) => {
    try {
      const updatedUser = await DatabaseService.updateUser(userId, { managerId })
      setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u))
    } catch (error) {
      console.error('Update user manager error:', error)
      throw error
    }
  }

  const resetUserPassword = async (userId: string): Promise<string> => {
    const newPassword = Math.random().toString(36).slice(-8)
    
    try {
      const updatedUser = await DatabaseService.updateUser(userId, {
        password: newPassword,
        isFirstLogin: true
      })
      
      setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u))
      
      const user = users.find(u => u.id === userId)
      if (user) {
        sendCredentialsEmail(user, newPassword)
          .then(() => console.log("Password reset email sent"))
          .catch(() => {})
      }
      
      return newPassword
    } catch (error) {
      console.error('Reset password error:', error)
      throw error
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      await DatabaseService.deleteUser(userId)
      setUsers(prev => prev.filter(u => u.id !== userId))
    } catch (error) {
      console.error('Delete user error:', error)
      throw error
    }
  }

  const createExpense = async (
    amount: number,
    currency: Currency,
    category: string,
    description: string,
    date: string,
    receiptUrl?: string,
    ocrData?: any,
  ): Promise<Expense> => {
    try {
      const newExpense = await DatabaseService.createExpense({
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
      })

      // Refresh data to ensure all users see the new expense
      await refreshData()

      if (currency !== company!.currency) {
        convertCurrency(amount, currency, company!.currency).then(async (converted) => {
          const updatedExpense = await DatabaseService.updateExpense(newExpense.id, {
            convertedAmount: converted
          })
          await refreshData()
        })
      }

      const employee = currentUser!
      if (employee.managerId && approvalRule?.isManagerApproverRequired) {
        const manager = users.find((u) => u.id === employee.managerId)
        if (manager) {
          sendExpenseNotification(newExpense, "submitted", manager.email, manager.name)
            .catch(() => {})
        }
      }

      return newExpense
    } catch (error) {
      console.error('Create expense error:', error)
      throw error
    }
  }

  const updateExpenseStatus = async (
    expenseId: string,
    action: "approved" | "rejected",
    approverId: string,
    comment?: string,
  ) => {
    try {
      const expense = expenses.find(e => e.id === expenseId)
      if (!expense) return

      const approver = users.find((u) => u.id === approverId)
      if (!approver) return

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
      let newStatus = expense.status
      let newStep = expense.currentApprovalStep

      if (action === "rejected") {
        newStatus = "rejected"
        if (employee) {
          sendExpenseNotification(expense, "rejected", employee.email, employee.name)
        }
      } else {
        const rule = approvalRule
        if (expense.currentApprovalStep === 0) {
          if (rule && rule.sequence.length > 0) {
            newStep = 1
            newStatus = "pending"
          } else {
            newStatus = "approved"
            if (employee) {
              sendExpenseNotification(expense, "approved", employee.email, employee.name)
            }
          }
        } else if (rule && rule.sequence.length > 0) {
          const sequenceIndex = expense.currentApprovalStep - 1
          const currentStep = rule.sequence[sequenceIndex]

          if (currentStep && (currentStep.userId === approverId || approver.role === currentStep.role)) {
            if (sequenceIndex < rule.sequence.length - 1) {
              newStep = expense.currentApprovalStep + 1
              newStatus = "pending"
            } else {
              newStatus = "approved"
              if (employee) {
                sendExpenseNotification(expense, "approved", employee.email, employee.name)
              }
            }
          }
        } else {
          newStatus = "approved"
        }
      }

      await DatabaseService.updateExpense(expenseId, {
        status: newStatus,
        currentApprovalStep: newStep,
        approvalHistory: updatedHistory,
      })

      // Refresh data to ensure all users see the updated expense
      await refreshData()
    } catch (error) {
      console.error('Update expense status error:', error)
      throw error
    }
  }

  const adminOverrideExpense = async (expenseId: string, action: "approved" | "rejected", comment?: string) => {
    if (currentUser?.role !== "admin") return

    try {
      const expense = expenses.find(e => e.id === expenseId)
      if (!expense) return

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

      await DatabaseService.updateExpense(expenseId, {
        status: action === "approved" ? "approved" : "rejected",
        approvalHistory: updatedHistory,
      })

      // Refresh data to ensure all users see the updated expense
      await refreshData()

      if (employee) {
        sendExpenseNotification(expense, action === "approved" ? "approved" : "rejected", employee.email, employee.name)
      }
    } catch (error) {
      console.error('Admin override error:', error)
      throw error
    }
  }

  const updateApprovalRule = async (isManagerApproverRequired: boolean, sequence: ApprovalRule["sequence"]) => {
    try {
      if (approvalRule) {
        const updatedRule = await DatabaseService.updateApprovalRule(approvalRule.id, {
          sequence,
          isManagerApproverRequired,
        })
        setApprovalRule(updatedRule)
      } else {
        const newRule = await DatabaseService.createApprovalRule({
          companyId: company!.id,
          sequence,
          isManagerApproverRequired,
        })
        setApprovalRule(newRule)
      }
    } catch (error) {
      console.error('Update approval rule error:', error)
      throw error
    }
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

  if (loading) {
    return <div>Loading...</div>
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
        refreshData,
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