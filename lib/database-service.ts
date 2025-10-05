import { supabase } from './supabase'
import type { User, Company, Expense, ApprovalRule, UserRole } from './types'

export class DatabaseService {
  private static checkConnection() {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check your environment variables.')
    }
  }
  // Company operations
  static async createCompany(company: Omit<Company, 'id' | 'createdAt'>) {
    this.checkConnection()
    const { data, error } = await supabase!
      .from('companies')
      .insert({
        name: company.name,
        currency: company.currency,
      })
      .select()
      .single()

    if (error) throw error
    return this.mapCompanyFromDB(data)
  }

  static async getCompany(id: string) {
    this.checkConnection()
    const { data, error } = await supabase!
      .from('companies')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data ? this.mapCompanyFromDB(data) : null
  }

  // User operations
  static async createUser(user: Omit<User, 'id' | 'createdAt'>) {
    this.checkConnection()
    const { data, error } = await supabase!
      .from('users')
      .insert({
        email: user.email,
        name: user.name,
        role: user.role,
        company_id: user.companyId,
        manager_id: user.managerId || null,
        password: user.password || '',
        is_first_login: user.isFirstLogin || false,
        is_email_verified: user.isEmailVerified || false,
      })
      .select()
      .single()

    if (error) throw error
    return this.mapUserFromDB(data)
  }

  static async getUserByEmail(email: string) {
    this.checkConnection()
    const { data, error } = await supabase!
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data ? this.mapUserFromDB(data) : null
  }

  static async getUsersByCompany(companyId: string) {
    this.checkConnection()
    const { data, error } = await supabase!
      .from('users')
      .select('*')
      .eq('company_id', companyId)

    if (error) throw error
    return data.map(this.mapUserFromDB)
  }

  static async updateUser(id: string, updates: Partial<User>) {
    this.checkConnection()
    const { data, error } = await supabase!
      .from('users')
      .update({
        ...(updates.email && { email: updates.email }),
        ...(updates.name && { name: updates.name }),
        ...(updates.role && { role: updates.role }),
        ...(updates.managerId !== undefined && { manager_id: updates.managerId }),
        ...(updates.password && { password: updates.password }),
        ...(updates.isFirstLogin !== undefined && { is_first_login: updates.isFirstLogin }),
        ...(updates.isEmailVerified !== undefined && { is_email_verified: updates.isEmailVerified }),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return this.mapUserFromDB(data)
  }

  static async deleteUser(id: string) {
    this.checkConnection()
    const { error } = await supabase!
      .from('users')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Expense operations
  static async createExpense(expense: Omit<Expense, 'id' | 'createdAt'>) {
    this.checkConnection()
    const { data, error } = await supabase!
      .from('expenses')
      .insert({
        employee_id: expense.employeeId,
        employee_name: expense.employeeName,
        amount: expense.amount,
        currency: expense.currency,
        category: expense.category,
        description: expense.description,
        date: expense.date,
        status: expense.status,
        company_id: expense.companyId,
        current_approval_step: expense.currentApprovalStep,
        approval_history: expense.approvalHistory,
        receipt_url: expense.receiptUrl || null,
        ocr_data: expense.ocrData || null,
        converted_amount: expense.convertedAmount || null,
      })
      .select()
      .single()

    if (error) throw error
    return this.mapExpenseFromDB(data)
  }

  static async getExpensesByCompany(companyId: string) {
    this.checkConnection()
    const { data, error } = await supabase!
      .from('expenses')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data.map(this.mapExpenseFromDB)
  }

  static async updateExpense(id: string, updates: Partial<Expense>) {
    this.checkConnection()
    const { data, error } = await supabase!
      .from('expenses')
      .update({
        ...(updates.status && { status: updates.status }),
        ...(updates.currentApprovalStep !== undefined && { current_approval_step: updates.currentApprovalStep }),
        ...(updates.approvalHistory && { approval_history: updates.approvalHistory }),
        ...(updates.convertedAmount !== undefined && { converted_amount: updates.convertedAmount }),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return this.mapExpenseFromDB(data)
  }

  // Approval Rule operations
  static async createApprovalRule(rule: Omit<ApprovalRule, 'id' | 'createdAt'>) {
    this.checkConnection()
    const { data, error } = await supabase!
      .from('approval_rules')
      .insert({
        company_id: rule.companyId,
        sequence: rule.sequence,
        is_manager_approver_required: rule.isManagerApproverRequired,
      })
      .select()
      .single()

    if (error) throw error
    return this.mapApprovalRuleFromDB(data)
  }

  static async getApprovalRuleByCompany(companyId: string) {
    this.checkConnection()
    const { data, error } = await supabase!
      .from('approval_rules')
      .select('*')
      .eq('company_id', companyId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data ? this.mapApprovalRuleFromDB(data) : null
  }

  static async updateApprovalRule(id: string, updates: Partial<ApprovalRule>) {
    this.checkConnection()
    const { data, error } = await supabase!
      .from('approval_rules')
      .update({
        ...(updates.sequence && { sequence: updates.sequence }),
        ...(updates.isManagerApproverRequired !== undefined && { is_manager_approver_required: updates.isManagerApproverRequired }),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return this.mapApprovalRuleFromDB(data)
  }

  // Mapping functions
  private static mapCompanyFromDB(data: any): Company {
    return {
      id: data.id,
      name: data.name,
      currency: data.currency,
      createdAt: data.created_at,
    }
  }

  private static mapUserFromDB(data: any): User {
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role as UserRole,
      companyId: data.company_id,
      managerId: data.manager_id,
      password: data.password,
      isFirstLogin: data.is_first_login,
      isEmailVerified: data.is_email_verified,
      createdAt: data.created_at,
    }
  }

  private static mapExpenseFromDB(data: any): Expense {
    return {
      id: data.id,
      employeeId: data.employee_id,
      employeeName: data.employee_name,
      amount: data.amount,
      currency: data.currency,
      category: data.category,
      description: data.description,
      date: data.date,
      status: data.status,
      companyId: data.company_id,
      currentApprovalStep: data.current_approval_step,
      approvalHistory: data.approval_history || [],
      receiptUrl: data.receipt_url,
      ocrData: data.ocr_data,
      convertedAmount: data.converted_amount,
      createdAt: data.created_at,
    }
  }

  private static mapApprovalRuleFromDB(data: any): ApprovalRule {
    return {
      id: data.id,
      companyId: data.company_id,
      sequence: data.sequence || [],
      isManagerApproverRequired: data.is_manager_approver_required,
      createdAt: data.created_at,
    }
  }
}