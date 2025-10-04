import emailjs from '@emailjs/browser'
import type { EmailNotification, User, Expense } from "./types"

// EmailJS Configuration
const EMAILJS_CONFIG = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'your_service_id',
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'your_public_key',
  templates: {
    credentials: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_CREDENTIALS || 'template_credentials',
    expenseNotification: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_EXPENSE || 'template_expense',
  }
}

// Initialize EmailJS
if (typeof window !== 'undefined') {
  emailjs.init(EMAILJS_CONFIG.publicKey)
}

// Email sending function using EmailJS
async function sendEmailViaEmailJS(templateId: string, templateParams: any): Promise<boolean> {
  if (typeof window === 'undefined') {
    console.log('[EmailJS] Server-side rendering, skipping email send')
    return false
  }

  try {
    const result = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      templateId,
      templateParams,
      EMAILJS_CONFIG.publicKey
    )
    console.log('[EmailJS] Email sent successfully:', result.text)
    return true
  } catch (error) {
    console.error('[EmailJS] Failed to send email:', error)
    return false
  }
}

// Fallback: Send email via API route (server-side)
async function sendEmailViaAPI(emailData: any): Promise<boolean> {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    })

    const result = await response.json()
    
    if (response.ok && result.success) {
      console.log('[API] Email sent successfully via server')
      return true
    } else {
      console.error('[API] Failed to send email via server:', result.message || 'Unknown error')
      return false
    }
  } catch (error) {
    console.error('[API] Error sending email via server:', error)
    return false
  }
}

export async function sendCredentialsEmail(user: User, password: string): Promise<EmailNotification> {
  console.log("[v0] Sending credentials email to:", user.email)

  const emailData = {
    to_email: user.email,
    to_name: user.name,
    user_email: user.email,
    user_password: password,
    user_role: user.role.charAt(0).toUpperCase() + user.role.slice(1),
    from_name: "ExpenseFlow Team"
  }

  const email: EmailNotification = {
    id: `email-${Date.now()}`,
    to: user.email,
    subject: "Your ExpenseFlow Account Credentials",
    body: `
Hello ${user.name},

Your account has been created successfully!

Login Credentials:
Email: ${user.email}
Password: ${password}
Role: ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}

Please login at your earliest convenience and change your password.

Best regards,
ExpenseFlow Team
    `.trim(),
    timestamp: new Date().toISOString(),
    type: "credentials",
  }

  // Try to send actual email
  let emailSent = false
  
  // Method 1: Try EmailJS first
  if (EMAILJS_CONFIG.serviceId !== 'your_service_id') {
    emailSent = await sendEmailViaEmailJS(EMAILJS_CONFIG.templates.credentials, emailData)
  }
  
  // Method 2: Fallback to API route if EmailJS fails
  if (!emailSent) {
    emailSent = await sendEmailViaAPI({
      to_email: emailData.to_email,
      subject: email.subject,
      html: email.body.replace(/\n/g, '<br>')
    })
  }

  // Store in localStorage for tracking (regardless of send status)
  const notifications = JSON.parse(localStorage.getItem("emailNotifications") || "[]")
  const emailWithStatus = { ...email, sent: emailSent }
  notifications.push(emailWithStatus)
  localStorage.setItem("emailNotifications", JSON.stringify(notifications))

  console.log(`[v0] Email ${emailSent ? 'sent and' : 'failed to send but'} stored. Total emails:`, notifications.length)

  return email
}

export async function sendExpenseNotification(
  expense: Expense,
  type: "submitted" | "approved" | "rejected",
  recipientEmail: string,
  recipientName: string,
): Promise<EmailNotification> {
  console.log("[v0] Sending expense notification:", type, "to:", recipientEmail)

  let subject = ""
  let body = ""
  let statusColor = ""
  let statusText = ""

  switch (type) {
    case "submitted":
      subject = `New Expense Submitted - ${expense.category}`
      statusColor = "#f59e0b"
      statusText = "SUBMITTED"
      body = `
Hello ${recipientName},

A new expense has been submitted for your review.

Expense Details:
Employee: ${expense.employeeName}
Amount: ${expense.amount} ${expense.currency}
Category: ${expense.category}
Description: ${expense.description}
Date: ${expense.date}
Status: Pending Review

Please review and approve/reject this expense at your earliest convenience.

Best regards,
ExpenseFlow Team
      `.trim()
      break

    case "approved":
      subject = `Expense Approved - ${expense.category}`
      statusColor = "#10b981"
      statusText = "APPROVED"
      body = `
Hello ${recipientName},

Great news! Your expense has been approved and will be processed for reimbursement.

Expense Details:
Amount: ${expense.amount} ${expense.currency}
Category: ${expense.category}
Description: ${expense.description}
Date: ${expense.date}
Status: Approved

You can expect reimbursement within 5-7 business days.

Best regards,
ExpenseFlow Team
      `.trim()
      break

    case "rejected":
      subject = `Expense Rejected - ${expense.category}`
      statusColor = "#ef4444"
      statusText = "REJECTED"
      body = `
Hello ${recipientName},

Unfortunately, your expense has been rejected.

Expense Details:
Amount: ${expense.amount} ${expense.currency}
Category: ${expense.category}
Description: ${expense.description}
Date: ${expense.date}
Status: Rejected

Please contact your manager for more details or resubmit with additional information.

Best regards,
ExpenseFlow Team
      `.trim()
      break
  }

  const emailData = {
    to_email: recipientEmail,
    to_name: recipientName,
    expense_id: expense.id,
    employee_name: expense.employeeName,
    expense_amount: expense.amount,
    expense_currency: expense.currency,
    expense_category: expense.category,
    expense_description: expense.description,
    expense_date: expense.date,
    status_text: statusText,
    status_color: statusColor,
    subject: subject,
    from_name: "ExpenseFlow Team"
  }

  const email: EmailNotification = {
    id: `email-${Date.now()}`,
    to: recipientEmail,
    subject,
    body,
    timestamp: new Date().toISOString(),
    type: type === "submitted" ? "expense_submitted" : type === "approved" ? "expense_approved" : "expense_rejected",
  }

  // Try to send actual email
  let emailSent = false
  
  // Method 1: Try EmailJS first
  if (EMAILJS_CONFIG.serviceId !== 'your_service_id') {
    emailSent = await sendEmailViaEmailJS(EMAILJS_CONFIG.templates.expenseNotification, emailData)
  }
  
  // Method 2: Fallback to API route if EmailJS fails
  if (!emailSent) {
    emailSent = await sendEmailViaAPI({
      to_email: emailData.to_email,
      subject: subject,
      html: body.replace(/\n/g, '<br>')
    })
  }

  // Store in localStorage for tracking (regardless of send status)
  const notifications = JSON.parse(localStorage.getItem("emailNotifications") || "[]")
  const emailWithStatus = { ...email, sent: emailSent }
  notifications.push(emailWithStatus)
  localStorage.setItem("emailNotifications", JSON.stringify(notifications))

  console.log(`[v0] Email ${emailSent ? 'sent and' : 'failed to send but'} stored. Total emails:`, notifications.length)

  return email
}

export function getEmailNotifications(): EmailNotification[] {
  const notifications = JSON.parse(localStorage.getItem("emailNotifications") || "[]")
  console.log("[v0] Retrieved email notifications:", notifications.length)
  return notifications
}
