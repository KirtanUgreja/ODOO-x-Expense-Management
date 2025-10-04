import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create default company
  const company = await prisma.company.upsert({
    where: { id: 'company-1' },
    update: {},
    create: {
      id: 'company-1',
      name: 'ExpenseFlow Demo Company',
      currency: 'USD'
    }
  })

  console.log('✅ Created company:', company.name)

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@expenseflow.com' },
    update: {},
    create: {
      id: 'user-admin',
      email: 'admin@expenseflow.com',
      name: 'System Administrator',
      role: 'ADMIN',
      companyId: company.id,
      password: adminPassword
    }
  })

  console.log('✅ Created admin user:', adminUser.email, '(password: admin123)')

  // Create manager user
  const managerPassword = await bcrypt.hash('manager123', 10)
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@expenseflow.com' },
    update: {},
    create: {
      id: 'user-manager',
      email: 'manager@expenseflow.com',
      name: 'Jane Manager',
      role: 'MANAGER',
      companyId: company.id,
      password: managerPassword
    }
  })

  console.log('✅ Created manager user:', managerUser.email, '(password: manager123)')

  // Create employee user
  const employeePassword = await bcrypt.hash('employee123', 10)
  const employeeUser = await prisma.user.upsert({
    where: { email: 'employee@expenseflow.com' },
    update: {},
    create: {
      id: 'user-employee',
      email: 'employee@expenseflow.com',
      name: 'John Employee',
      role: 'EMPLOYEE',
      companyId: company.id,
      managerId: managerUser.id,
      password: employeePassword
    }
  })

  console.log('✅ Created employee user:', employeeUser.email, '(password: employee123)')

  // Create sample expense
  const sampleExpense = await prisma.expense.create({
    data: {
      id: 'expense-1',
      employeeId: employeeUser.id,
      employeeName: employeeUser.name,
      amount: 125.50,
      currency: 'USD',
      category: 'Travel',
      description: 'Business trip to client meeting',
      date: new Date().toISOString().split('T')[0],
      companyId: company.id,
      status: 'PENDING'
    }
  })

  console.log('✅ Created sample expense:', sampleExpense.description)

  // Create default approval rule
  const approvalRule = await prisma.approvalRule.create({
    data: {
      companyId: company.id,
      isManagerApproverRequired: true,
      isAdminApprovalRequired: false,
      amountThreshold: 1000
    }
  })

  console.log('✅ Created approval rule with threshold:', approvalRule.amountThreshold)

  console.log('\n🎉 Database seeded successfully!')
  console.log('\n📝 Test Accounts:')
  console.log('Admin: admin@expenseflow.com / admin123')
  console.log('Manager: manager@expenseflow.com / manager123')
  console.log('Employee: employee@expenseflow.com / employee123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
