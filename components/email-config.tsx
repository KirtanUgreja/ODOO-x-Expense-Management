"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, Mail, Server, Shield, CheckCircle, AlertCircle } from "lucide-react"
import { EmailTester } from "@/components/email-tester"

interface EmailConfigProps {
  onClose?: () => void
}

export function EmailConfig({ onClose }: EmailConfigProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [testEmail, setTestEmail] = useState("")
  const [isTestingSMTP, setIsTestingSMTP] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const emailjsConfigured = 
    process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID !== 'your_service_id' &&
    process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID

  const smtpConfigured = 
    process.env.SMTP_USER && process.env.SMTP_PASSWORD

  const testSMTPConfig = async () => {
    if (!testEmail) {
      setTestResult({ success: false, message: "Please enter a test email address" })
      return
    }

    setIsTestingSMTP(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_email: testEmail,
          to_name: "Test User",
          subject: "ExpenseFlow Email Test",
          html: "This is a test email from ExpenseFlow. If you received this, your email configuration is working correctly!"
        })
      })

      const result = await response.json()
      setTestResult({
        success: response.ok,
        message: result.message || (response.ok ? "Test email sent successfully!" : "Failed to send test email")
      })
    } catch (error) {
      setTestResult({
        success: false,
        message: "Network error while testing email configuration"
      })
    } finally {
      setIsTestingSMTP(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Email Configuration</h2>
          <p className="text-muted-foreground">
            Configure email services to send notifications to users
          </p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4" />
              EmailJS Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {emailjsConfigured ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Configured
                  </Badge>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                    Not Configured
                  </Badge>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Server className="w-4 h-4" />
              SMTP Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {smtpConfigured ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Configured
                  </Badge>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                    Not Configured
                  </Badge>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4" />
              Email Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Secured
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="emailjs">EmailJS Setup</TabsTrigger>
          <TabsTrigger value="smtp">SMTP Setup</TabsTrigger>
          <TabsTrigger value="test">Test Email</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Service Overview</CardTitle>
              <CardDescription>
                ExpenseFlow supports two email methods for sending notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4" />
                    EmailJS (Client-side)
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Simple setup, runs in the browser, good for development and small applications.
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>✅ Easy to set up</li>
                    <li>✅ No server required</li>
                    <li>⚠️ Limited sending rate</li>
                    <li>⚠️ Exposed credentials</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold flex items-center gap-2 mb-2">
                    <Server className="w-4 h-4" />
                    SMTP (Server-side)
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Production-ready, secure, supports all email providers.
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>✅ Secure credentials</li>
                    <li>✅ Higher sending limits</li>
                    <li>✅ Professional emails</li>
                    <li>⚠️ Requires server setup</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emailjs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>EmailJS Configuration</CardTitle>
              <CardDescription>
                Set up EmailJS for client-side email sending
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  EmailJS is great for development but consider SMTP for production due to security and rate limiting.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Step 1: Create EmailJS Account</Label>
                  <p className="text-sm text-muted-foreground">
                    Visit <a href="https://www.emailjs.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">emailjs.com</a> and create a free account.
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Step 2: Add Environment Variables</Label>
                  <div className="bg-muted rounded-lg p-3 text-sm font-mono">
                    <div className="flex items-center justify-between">
                      <span>NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id</span>
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard("NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id")}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key</span>
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard("NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key")}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Step 3: Create Email Templates</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Create templates in EmailJS dashboard with these variables:
                  </p>
                  <div className="bg-muted rounded-lg p-3 text-sm">
                    <div><strong>Credentials Template:</strong> {`{{to_name}}, {{user_email}}, {{user_password}}, {{user_role}}`}</div>
                    <div><strong>Expense Template:</strong> {`{{to_name}}, {{expense_amount}}, {{expense_category}}, {{employee_name}}`}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="smtp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SMTP Configuration</CardTitle>
              <CardDescription>
                Configure server-side email sending with SMTP
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="w-4 h-4" />
                <AlertDescription>
                  SMTP configuration is recommended for production environments. Credentials are securely stored server-side.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Gmail Setup</Label>
                  <div className="bg-muted rounded-lg p-3 text-sm font-mono space-y-1">
                    <div>SMTP_HOST=smtp.gmail.com</div>
                    <div>SMTP_PORT=587</div>
                    <div>SMTP_SECURE=false</div>
                    <div>SMTP_USER=your_email@gmail.com</div>
                    <div>SMTP_PASSWORD=your_app_password</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Note: Use App Password, not your regular Gmail password
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Other Providers</Label>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div><strong>Outlook:</strong> smtp.live.com:587</div>
                    <div><strong>Yahoo:</strong> smtp.mail.yahoo.com:587</div>
                    <div><strong>Custom:</strong> Contact your email provider for SMTP settings</div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Environment Variables</Label>
                  <div className="bg-muted rounded-lg p-3 text-sm font-mono space-y-1">
                    <div className="flex items-center justify-between">
                      <span>SMTP_HOST=smtp.gmail.com</span>
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard("SMTP_HOST=smtp.gmail.com")}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>SMTP_PORT=587</span>
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard("SMTP_PORT=587")}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>SMTP_USER=your_email@gmail.com</span>
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard("SMTP_USER=your_email@gmail.com")}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>SMTP_PASSWORD=your_app_password</span>
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard("SMTP_PASSWORD=your_app_password")}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EmailTester />
            
            <Card>
              <CardHeader>
                <CardTitle>Configuration Status</CardTitle>
                <CardDescription>
                  Current email service configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">EmailJS:</span>
                    {emailjsConfigured ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Ready
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                        Not Configured
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">SMTP:</span>
                    {smtpConfigured ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Ready
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                        Not Configured
                      </Badge>
                    )}
                  </div>
                </div>

                <Alert>
                  <Mail className="w-4 h-4" />
                  <AlertDescription>
                    {emailjsConfigured || smtpConfigured ? (
                      "Email notifications are enabled! Test the configuration using the email tester."
                    ) : (
                      "No email service is configured. Set up EmailJS or SMTP to enable notifications."
                    )}
                  </AlertDescription>
                </Alert>
                
                <div className="text-sm text-muted-foreground space-y-2">
                  <p><strong>How it works:</strong></p>
                  <ul className="space-y-1 pl-4">
                    <li>• System tries EmailJS first (if configured)</li>
                    <li>• Falls back to SMTP if EmailJS fails</li>
                    <li>• Stores notifications locally for tracking</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
