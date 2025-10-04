import { prisma } from './database'
import type { User, Company, Expense, ApprovalRecord, EmailNotification, OCRData } from './types'
import bcrypt from 'bcryptjs'

// Helper function to convert Prisma user to app user
const toPrismaUserRole = (role: string) => {
  return role.toUpperCase() as 'ADMIN' | 'MANAGER' | 'EMPLOYEE'
}

const fromPrismaUserRole = (role: string) => {
  return role.toLowerCase() as 'admin' | 'manager' | 'employee'
}

const toPrismaExpenseStatus = (status: string) => {
  return status.toUpperCase() as 'PENDING' | 'APPROVED' | 'REJECTED'
}

const fromPrismaExpenseStatus = (status: string) => {
  return status.toLowerCase() as 'pending' | 'approved' | 'rejected'
}

// Company Services
export class CompanyService {
  static async create(name: string, currency: string): Promise<Company> {
    const company = await prisma.company.create({
      data: { name, currency }
    })
    
    return {
      id: company.id,
      name: company.name,
      currency: company.currency,
      createdAt: company.createdAt.toISOString()
    }
  }

  static async findById(id: string): Promise<Company | null> {
    const company = await prisma.company.findUnique({
      where: { id }
    })
    
    if (!company) return null
    
    return {
      id: company.id,
      name: company.name,
      currency: company.currency,
      createdAt: company.createdAt.toISOString()
    }
  }

  static async getAll(): Promise<Company[]> {
    const companies = await prisma.company.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    return companies.map(company => ({
      id: company.id,
      name: company.name,
      currency: company.currency,
      createdAt: company.createdAt.toISOString()
    }))
  }
}

// User Services
export class UserService {
  static async create(
    email: string,
    name: string,
    role: 'admin' | 'manager' | 'employee',
    companyId: string,
    managerId?: string,
    password?: string
  ): Promise<User> {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null
    
    const user = await prisma.user.create({
      data: {
        email,
        name,
        role: toPrismaUserRole(role),
        companyId,
        managerId,
        password: hashedPassword
      }
    })
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: fromPrismaUserRole(user.role),
      companyId: user.companyId,
      managerId: user.managerId || undefined,
      createdAt: user.createdAt.toISOString(),
      password: password // Return plaintext for email sending
    }
  }

  static async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) return null
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: fromPrismaUserRole(user.role),
      companyId: user.companyId,
      managerId: user.managerId || undefined,
      createdAt: user.createdAt.toISOString()
    }
  }

  static async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id }
    })
    
    if (!user) return null
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: fromPrismaUserRole(user.role),
      companyId: user.companyId,
      managerId: user.managerId || undefined,
      createdAt: user.createdAt.toISOString()
    }
  }

  static async getByCompany(companyId: string): Promise<User[]> {
    const users = await prisma.user.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' }
    })
    
    return users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: fromPrismaUserRole(user.role),
      companyId: user.companyId,
      managerId: user.managerId || undefined,
      createdAt: user.createdAt.toISOString()
    }))
  }

  static async updateRole(id: string, role: 'admin' | 'manager' | 'employee'): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { role: toPrismaUserRole(role) }
    })
  }

  static async updateManager(id: string, managerId: string | null): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { managerId }
    })
  }

  static async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user || !user.password) return null
    
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) return null
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: fromPrismaUserRole(user.role),
      companyId: user.companyId,
      managerId: user.managerId || undefined,
      createdAt: user.createdAt.toISOString()
    }
  }
}

// Expense Services
export class ExpenseService {
  static async create(expenseData: Omit<Expense, 'id' | 'createdAt' | 'status' | 'currentApprovalStep' | 'approvalHistory'>): Promise<Expense> {
    const expense = await prisma.expense.create({
      data: {
        employeeId: expenseData.employeeId,
        employeeName: expenseData.employeeName,
        amount: expenseData.amount,
        currency: expenseData.currency,
        convertedAmount: expenseData.convertedAmount,
        category: expenseData.category,
        description: expenseData.description,
        date: expenseData.date,
        companyId: expenseData.companyId,
        receiptUrl: expenseData.receiptUrl,
        ocrData: expenseData.ocrData as any
      }
    })
    
    return {
      id: expense.id,
      employeeId: expense.employeeId,
      employeeName: expense.employeeName,
      amount: expense.amount,
      currency: expense.currency,
      convertedAmount: expense.convertedAmount || undefined,
      category: expense.category,
      description: expense.description,
      date: expense.date,
      status: fromPrismaExpenseStatus(expense.status),
      companyId: expense.companyId,
      currentApprovalStep: expense.currentApprovalStep,
      approvalHistory: [],
      createdAt: expense.createdAt.toISOString(),
      receiptUrl: expense.receiptUrl || undefined,
      ocrData: expense.ocrData as OCRData || undefined
    }
  }

  static async findById(id: string): Promise<Expense | null> {
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        approvalHistory: {
          orderBy: { timestamp: 'desc' }
        }
      }
    })
    
    if (!expense) return null
    
    return {
      id: expense.id,
      employeeId: expense.employeeId,
      employeeName: expense.employeeName,
      amount: expense.amount,
      currency: expense.currency,
      convertedAmount: expense.convertedAmount || undefined,
      category: expense.category,
      description: expense.description,
      date: expense.date,
      status: fromPrismaExpenseStatus(expense.status),
      companyId: expense.companyId,
      currentApprovalStep: expense.currentApprovalStep,
      approvalHistory: expense.approvalHistory.map(record => ({
        approverId: record.approverId,
        approverName: record.approverName,
        action: record.action as 'approved' | 'rejected',
        comment: record.comment || undefined,
        timestamp: record.timestamp.toISOString(),
        step: record.step
      })),
      createdAt: expense.createdAt.toISOString(),
      receiptUrl: expense.receiptUrl || undefined,
      ocrData: expense.ocrData as OCRData || undefined
    }
  }

  static async getByCompany(companyId: string): Promise<Expense[]> {
    const expenses = await prisma.expense.findMany({
      where: { companyId },
      include: {
        approvalHistory: {
          orderBy: { timestamp: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return expenses.map(expense => ({
      id: expense.id,
      employeeId: expense.employeeId,
      employeeName: expense.employeeName,
      amount: expense.amount,
      currency: expense.currency,
      convertedAmount: expense.convertedAmount || undefined,
      category: expense.category,
      description: expense.description,
      date: expense.date,
      status: fromPrismaExpenseStatus(expense.status),
      companyId: expense.companyId,
      currentApprovalStep: expense.currentApprovalStep,
      approvalHistory: expense.approvalHistory.map(record => ({
        approverId: record.approverId,
        approverName: record.approverName,
        action: record.action as 'approved' | 'rejected',
        comment: record.comment || undefined,
        timestamp: record.timestamp.toISOString(),
        step: record.step
      })),
      createdAt: expense.createdAt.toISOString(),
      receiptUrl: expense.receiptUrl || undefined,
      ocrData: expense.ocrData as OCRData || undefined
    }))
  }

  static async getByEmployee(employeeId: string): Promise<Expense[]> {
    const expenses = await prisma.expense.findMany({
      where: { employeeId },
      include: {
        approvalHistory: {
          orderBy: { timestamp: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return expenses.map(expense => ({
      id: expense.id,
      employeeId: expense.employeeId,
      employeeName: expense.employeeName,
      amount: expense.amount,
      currency: expense.currency,
      convertedAmount: expense.convertedAmount || undefined,
      category: expense.category,
      description: expense.description,
      date: expense.date,
      status: fromPrismaExpenseStatus(expense.status),
      companyId: expense.companyId,
      currentApprovalStep: expense.currentApprovalStep,
      approvalHistory: expense.approvalHistory.map(record => ({
        approverId: record.approverId,
        approverName: record.approverName,
        action: record.action as 'approved' | 'rejected',
        comment: record.comment || undefined,
        timestamp: record.timestamp.toISOString(),
        step: record.step
      })),
      createdAt: expense.createdAt.toISOString(),
      receiptUrl: expense.receiptUrl || undefined,
      ocrData: expense.ocrData as OCRData || undefined
    }))
  }

  static async updateStatus(
    id: string, 
    status: 'approved' | 'rejected', 
    approverId: string, 
    approverName: string, 
    comment?: string
  ): Promise<Expense | null> {
    // Update expense status
    await prisma.expense.update({
      where: { id },
      data: {
        status: toPrismaExpenseStatus(status),
        currentApprovalStep: status === 'approved' ? 1 : 0
      }
    })

    // Create approval record
    await prisma.approvalRecord.create({
      data: {
        expenseId: id,
        approverId,
        approverName,
        action: status,
        comment,
        step: 1
      }
    })

    // Return updated expense
    return await this.findById(id)
  }
}

// Email Notification Services
export class EmailNotificationService {
  static async create(notification: Omit<EmailNotification, 'id' | 'timestamp'>): Promise<EmailNotification> {
    const emailNotification = await prisma.emailNotification.create({
      data: {
        to: notification.to,
        subject: notification.subject,
        body: notification.body,
        type: notification.type,
        sent: false
      }
    })
    
    return {
      id: emailNotification.id,
      to: emailNotification.to,
      subject: emailNotification.subject,
      body: emailNotification.body,
      type: emailNotification.type as "credentials" | "expense_submitted" | "expense_approved" | "expense_rejected",
      timestamp: emailNotification.timestamp.toISOString()
    }
  }

  static async getAll(): Promise<EmailNotification[]> {
    const notifications = await prisma.emailNotification.findMany({
      orderBy: { timestamp: 'desc' }
    })
    
    return notifications.map(notification => ({
      id: notification.id,
      to: notification.to,
      subject: notification.subject,
      body: notification.body,
      type: notification.type as "credentials" | "expense_submitted" | "expense_approved" | "expense_rejected",
      timestamp: notification.timestamp.toISOString()
    }))
  }

  static async markAsSent(id: string): Promise<void> {
    await prisma.emailNotification.update({
      where: { id },
      data: { sent: true }
    })
  }
}
