"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Mail, Send, Loader2 } from "lucide-react"

export function EmailTester() {
  const [testEmail, setTestEmail] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  // Check if SMTP is configured
  const isConfigured = process.env.SMTP_USER && process.env.SMTP_PASSWORD

  const sendTestEmail = async () => {
    if (!testEmail) {
      setResult({ success: false, message: "Please enter an email address" })
      return
    }

    setIsSending(true)
    setResult(null)

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to_email: testEmail,
          to_name: "Test User",
          subject: "✅ ExpenseFlow Email Test - Success!",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">✅ Email Test Successful!</h1>
                <p style="color: #e0e6ff; margin: 10px 0 0 0;">ExpenseFlow Email System</p>
              </div>
              
              <div style="background-color: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px;">
                <h2 style="color: #1e293b; margin-bottom: 20px;">🎉 Congratulations!</h2>
                
                <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                  Your email configuration is working perfectly! This means:
                </p>
                
                <div style="background-color: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #10b981;">
                  <ul style="margin: 0; padding-left: 20px; color: #1e293b;">
                    <li style="margin-bottom: 8px;">✅ SMTP settings are correct</li>
                    <li style="margin-bottom: 8px;">✅ Authentication is working</li>
                    <li style="margin-bottom: 8px;">✅ Email delivery is functional</li>
                    <li style="margin-bottom: 8px;">✅ Users will receive notifications</li>
                  </ul>
                </div>
                
                <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                  ExpenseFlow will now automatically send:
                </p>
                
                <ul style="color: #64748b; padding-left: 20px;">
                  <li>Welcome emails with login credentials</li>
                  <li>Expense submission notifications to managers</li>
                  <li>Approval/rejection alerts to employees</li>
                </ul>
                
                <div style="text-align: center; margin: 30px 0;">
                  <p style="color: #10b981; font-weight: 600; font-size: 18px;">
                    🚀 Your email system is ready!
                  </p>
                </div>
                
                <hr style="border: none; height: 1px; background-color: #e2e8f0; margin: 20px 0;">
                
                <p style="color: #64748b; font-size: 14px; text-align: center; margin: 0;">
                  This is an automated test email from ExpenseFlow<br>
                  Sent on ${new Date().toLocaleString()}
                </p>
              </div>
            </div>
          `
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult({
          success: true,
          message: "✅ Test email sent successfully! Check your inbox (and spam folder)."
        })
      } else {
        setResult({
          success: false,
          message: `❌ Failed to send email: ${data.message || 'Unknown error'}`
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: `❌ Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Email Tester
        </CardTitle>
        <CardDescription>
          Send a test email to verify your configuration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Configuration Status */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">SMTP Status:</span>
          {isConfigured ? (
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <CheckCircle className="w-3 h-3 mr-1" />
              Configured
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-amber-100 text-amber-700">
              <AlertCircle className="w-3 h-3 mr-1" />
              Not Configured
            </Badge>
          )}
        </div>

        {/* Email Input */}
        <div className="space-y-2">
          <Label htmlFor="test-email">Test Email Address</Label>
          <Input
            id="test-email"
            type="email"
            placeholder="user@example.com"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
          />
        </div>

        {/* Send Button */}
        <Button 
          onClick={sendTestEmail} 
          disabled={!testEmail || isSending}
          className="w-full"
        >
          {isSending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Test Email
            </>
          )}
        </Button>

        {/* Result */}
        {result && (
          <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            {result.success ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <AlertDescription className={result.success ? "text-green-700" : "text-red-700"}>
              {result.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Configuration Help */}
        {!isConfigured && (
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              Email is not configured. Please set up SMTP settings in your <code>.env.local</code> file.
              Check the Gmail Setup guide for detailed instructions.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
