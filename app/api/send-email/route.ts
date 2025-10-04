import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASSWORD || '',
  },
  from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@expenseflow.com',
  debug: process.env.EMAIL_DEBUG === 'true',
}

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: EMAIL_CONFIG.host,
    port: EMAIL_CONFIG.port,
    secure: EMAIL_CONFIG.secure,
    auth: {
      user: EMAIL_CONFIG.auth.user,
      pass: EMAIL_CONFIG.auth.pass,
    },
    tls: {
      rejectUnauthorized: false
    }
  })
}

// Test SMTP connection
const testSMTPConnection = async () => {
  try {
    const transporter = createTransporter()
    await transporter.verify()
    return { success: true, message: 'SMTP connection verified successfully' }
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown SMTP error'
    }
  }
}

// Email template
const createEmailTemplate = (subject: string, content: string) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">ExpenseFlow</h1>
        <p style="color: #e0e6ff; margin: 10px 0 0 0;">Modern Expense Management</p>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #1e293b; margin-bottom: 20px;">${subject}</h2>
        <div style="color: #475569; font-size: 16px; line-height: 1.6;">
          ${content}
        </div>
      </div>
      <div style="background-color: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px;">
        <p>This is an automated message from ExpenseFlow. Please do not reply to this email.</p>
        <p>© ${new Date().getFullYear()} ExpenseFlow. All rights reserved.</p>
      </div>
    </div>
  `
}

// POST handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to_email, subject, html, action } = body

    // Handle connection test
    if (action === 'test-connection') {
      const result = await testSMTPConnection()
      return NextResponse.json(result)
    }

    // Validate inputs
    if (!to_email) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email address is required' 
      }, { status: 400 })
    }

    // Check SMTP configuration
    if (!EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass) {
      return NextResponse.json({ 
        success: false, 
        message: 'SMTP not configured. Please set SMTP_USER and SMTP_PASSWORD in .env.local',
        debug: {
          userSet: !!EMAIL_CONFIG.auth.user,
          passwordSet: !!EMAIL_CONFIG.auth.pass
        }
      }, { status: 400 })
    }

    // Create transporter and test connection
    const transporter = createTransporter()
    
    try {
      await transporter.verify()
    } catch (error) {
      return NextResponse.json({ 
        success: false, 
        message: 'SMTP connection failed',
        error: error instanceof Error ? error.message : 'Unknown verification error'
      }, { status: 500 })
    }

    // Prepare email
    const emailSubject = subject || 'ExpenseFlow Test Email'
    const emailContent = html || '<p>This is a test email from ExpenseFlow. If you received this, your email configuration is working!</p>'
    const emailTemplate = createEmailTemplate(emailSubject, emailContent)

    const mailOptions = {
      from: `"ExpenseFlow" <${EMAIL_CONFIG.from}>`,
      to: to_email,
      subject: emailSubject,
      html: emailTemplate,
    }

    // Send email
    const info = await transporter.sendMail(mailOptions)

    return NextResponse.json({ 
      success: true, 
      message: 'Email sent successfully',
      messageId: info.messageId
    })

  } catch (error) {
    console.error('Email error:', error)
    
    // Enhanced error messages for Gmail issues
    let errorMessage = 'Failed to send email'
    const suggestions: string[] = []
    
    if (error instanceof Error) {
      const errorStr = error.message.toLowerCase()
      
      if (errorStr.includes('invalid login') || errorStr.includes('authentication failed')) {
        errorMessage = 'Gmail authentication failed'
        suggestions.push(
          'Check your Gmail address is correct',
          'Use App Password instead of regular password',
          'Ensure 2FA is enabled on Gmail',
          'Generate new App Password at: https://myaccount.google.com/apppasswords'
        )
      } else if (errorStr.includes('timeout') || errorStr.includes('connect')) {
        errorMessage = 'Cannot connect to Gmail servers'
        suggestions.push('Check internet connection', 'Verify SMTP settings')
      }
    }
    
    return NextResponse.json({ 
      success: false, 
      message: errorMessage,
      error: error instanceof Error ? error.message : 'Unknown error',
      suggestions
    }, { status: 500 })
  }
}

// GET handler
export async function GET() {
  try {
    const configStatus = {
      smtp_configured: !!(EMAIL_CONFIG.auth.user && EMAIL_CONFIG.auth.pass),
      smtp_user: EMAIL_CONFIG.auth.user || null,
      smtp_host: EMAIL_CONFIG.host,
      smtp_port: EMAIL_CONFIG.port,
      debug_enabled: EMAIL_CONFIG.debug
    }

    if (configStatus.smtp_configured) {
      const connectionTest = await testSMTPConnection()
      return NextResponse.json({ 
        ...configStatus, 
        connection_test: connectionTest 
      })
    }

    return NextResponse.json(configStatus)
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to check email configuration',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
