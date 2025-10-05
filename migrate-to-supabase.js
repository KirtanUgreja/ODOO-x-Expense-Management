// Migration script to move data from localStorage to Supabase
// Run this in browser console after setting up Supabase

const migrateToSupabase = async () => {
  console.log('Starting migration to Supabase...')
  
  // Get data from localStorage
  const company = JSON.parse(localStorage.getItem('company') || 'null')
  const users = JSON.parse(localStorage.getItem('users') || '[]')
  const expenses = JSON.parse(localStorage.getItem('expenses') || '[]')
  const approvalRule = JSON.parse(localStorage.getItem('approvalRule') || 'null')
  
  if (!company) {
    console.log('No company data found in localStorage')
    return
  }
  
  console.log('Found data:', { company, users: users.length, expenses: expenses.length, approvalRule })
  
  try {
    // Import Supabase client (make sure it's available)
    const { supabase } = window
    
    if (!supabase) {
      console.error('Supabase client not found. Make sure it\'s loaded.')
      return
    }
    
    // 1. Migrate company
    console.log('Migrating company...')
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .insert({
        id: company.id,
        name: company.name,
        currency: company.currency,
        created_at: company.createdAt
      })
      .select()
    
    if (companyError) {
      console.error('Company migration error:', companyError)
      return
    }
    console.log('Company migrated successfully')
    
    // 2. Migrate users
    console.log('Migrating users...')
    for (const user of users) {
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          company_id: user.companyId,
          manager_id: user.managerId || null,
          password: user.password || '',
          is_first_login: user.isFirstLogin || false,
          is_email_verified: user.isEmailVerified || false,
          created_at: user.createdAt
        })
      
      if (userError) {
        console.error('User migration error:', userError, user)
      } else {
        console.log('User migrated:', user.email)
      }
    }
    
    // 3. Migrate expenses
    console.log('Migrating expenses...')
    for (const expense of expenses) {
      const { error: expenseError } = await supabase
        .from('expenses')
        .insert({
          id: expense.id,
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
          approval_history: expense.approvalHistory || [],
          receipt_url: expense.receiptUrl || null,
          ocr_data: expense.ocrData || null,
          converted_amount: expense.convertedAmount || null,
          created_at: expense.createdAt
        })
      
      if (expenseError) {
        console.error('Expense migration error:', expenseError, expense)
      } else {
        console.log('Expense migrated:', expense.id)
      }
    }
    
    // 4. Migrate approval rule
    if (approvalRule) {
      console.log('Migrating approval rule...')
      const { error: ruleError } = await supabase
        .from('approval_rules')
        .insert({
          id: approvalRule.id,
          company_id: approvalRule.companyId,
          sequence: approvalRule.sequence || [],
          is_manager_approver_required: approvalRule.isManagerApproverRequired,
          created_at: approvalRule.createdAt
        })
      
      if (ruleError) {
        console.error('Approval rule migration error:', ruleError)
      } else {
        console.log('Approval rule migrated successfully')
      }
    }
    
    console.log('Migration completed successfully!')
    console.log('You can now switch to the Supabase data context.')
    
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { migrateToSupabase }
} else {
  window.migrateToSupabase = migrateToSupabase
}