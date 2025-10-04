"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  CheckCircle, 
  AlertCircle, 
  Mail, 
  Send, 
  Loader2, 
  Settings, 
  TestTube,
  Copy,
  ExternalLink,
  Shield,
  Zap
} from "lucide-react"

interface EmailConfig {
  smtp_configured: boolean
  smtp_user: string | null
  smtp_host: string
  smtp_port: number
  debug_enabled: boolean
  connection_test?: {
    success: boolean
    message: string
  }
}

export function EmailConfigWizard() {
  const [config, setConfig] = useState<EmailConfig | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; debug?: any } | null>(null)
  const [testEmail, setTestEmail] = useState("")
  const [isSendingTest, setIsSendingTest] = useState(false)

  // Form state for SMTP configuration
  const [smtpUser, setSmtpUser] = useState("")
  const [smtpPassword, setSmtpPassword] = useState("")
  const [smtpFrom, setSmtpFrom] = useState("")

  useEffect(() => {
    checkEmailConfig()
  }, [])

  const checkEmailConfig = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/send-email')
      const data = await response.json()
      setConfig(data)
    } catch (error) {
      console.error('Failed to check email config:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const testConnection = async () => {
    setIsLoading(true)
    setTestResult(null)
    
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test-connection' })
      })
      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Connection test failed'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const sendTestEmail = async () => {
    if (!testEmail) {
      setTestResult({ success: false, message: "Please enter an email address" })
      return
    }

    setIsSendingTest(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_email: testEmail,
          subject: "✅ ExpenseFlow Email Test - Success!",
          html: `
            <div style="text-align: center; padding: 40px; font-family: Arial, sans-serif;">
              <h1 style="color: #10b981;">🎉 Email Test Successful!</h1>
              <p style="font-size: 18px; color: #374151;">
                Your ExpenseFlow email configuration is working perfectly!
              </p>
              <p style="color: #6b7280; margin-top: 20px;">
                Sent at: ${new Date().toLocaleString()}
              </p>
            </div>
          `
        })
      })
      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to send test email'
      })
    } finally {
      setIsSendingTest(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getStatusBadge = () => {
    if (isLoading) return <Badge variant="secondary"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Checking...</Badge>
    if (!config?.smtp_configured) return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Not Configured</Badge>
    if (config.connection_test?.success) return <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Ready</Badge>
    return <Badge variant="secondary"><Settings className="h-3 w-3 mr-1" />Configured</Badge>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Configuration Wizard
              </CardTitle>
              <CardDescription>
                Set up Gmail SMTP for sending notifications
              </CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="setup" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="setup">Setup Guide</TabsTrigger>
              <TabsTrigger value="status">Configuration Status</TabsTrigger>
              <TabsTrigger value="test">Test & Debug</TabsTrigger>
            </TabsList>
            
            <TabsContent value="setup" className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> You need a Gmail account with 2-Factor Authentication enabled to use SMTP.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="grid gap-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                    Enable 2-Factor Authentication
                  </h4>
                  <div className="ml-8 space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Required for generating App Passwords in Gmail.
                    </p>
                    <Button variant="outline" size="sm" onClick={() => window.open('https://myaccount.google.com/security', '_blank')}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Google Security Settings
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                    Generate App Password
                  </h4>
                  <div className="ml-8 space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Create a 16-character app password for ExpenseFlow.
                    </p>
                    <Button variant="outline" size="sm" onClick={() => window.open('https://myaccount.google.com/apppasswords', '_blank')}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Generate App Password
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                    Configure Environment Variables
                  </h4>
                  <div className="ml-8 space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Add these settings to your <code className="bg-gray-100 px-1 rounded">.env.local</code> file:
                    </p>
                    <div className="bg-gray-50 p-3 rounded-md font-mono text-sm space-y-1">
                      <div className="flex items-center justify-between">
                        <span>SMTP_USER=your-email@gmail.com</span>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard('SMTP_USER=your-email@gmail.com')}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>SMTP_PASSWORD=your-app-password</span>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard('SMTP_PASSWORD=your-app-password')}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>EMAIL_DEBUG=true</span>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard('EMAIL_DEBUG=true')}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Zap className="h-4 w-4" />
                  <AlertDescription>
                    After updating your <code>.env.local</code> file, restart your development server and refresh this page.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
            
            <TabsContent value="status" className="space-y-4">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Checking configuration...</span>
                </div>
              ) : config ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4">
                      <h4 className="font-medium mb-2">SMTP Configuration</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Host:</span>
                          <span className="font-mono">{config.smtp_host}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Port:</span>
                          <span className="font-mono">{config.smtp_port}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">User:</span>
                          <span className="font-mono">{config.smtp_user || 'Not set'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Debug:</span>
                          <Badge variant={config.debug_enabled ? "default" : "secondary"}>
                            {config.debug_enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium mb-2">Connection Status</h4>
                      {config.connection_test ? (
                        <div className="space-y-2">
                          <div className={`flex items-center gap-2 ${config.connection_test.success ? 'text-green-600' : 'text-red-600'}`}>
                            {config.connection_test.success ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <AlertCircle className="h-4 w-4" />
                            )}
                            <span className="text-sm">{config.connection_test.message}</span>
                          </div>
                        </div>
                      ) : (
                        <Button variant="outline" onClick={testConnection} disabled={!config.smtp_configured}>
                          <TestTube className="h-4 w-4 mr-2" />
                          Test Connection
                        </Button>
                      )}
                    </Card>
                  </div>

                  {!config.smtp_configured && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        SMTP is not configured. Please follow the setup guide to configure your Gmail credentials.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to load configuration. Please check your server logs.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
            
            <TabsContent value="test" className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Button 
                    onClick={testConnection} 
                    disabled={isLoading || !config?.smtp_configured}
                    className="w-full sm:w-auto"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <TestTube className="h-4 w-4 mr-2" />
                    )}
                    Test SMTP Connection
                  </Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="testEmail">Test Email Address</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="testEmail"
                        type="email"
                        placeholder="recipient@example.com"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        onClick={sendTestEmail}
                        disabled={isSendingTest || !testEmail || !config?.smtp_configured}
                      >
                        {isSendingTest ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        Send Test Email
                      </Button>
                    </div>
                  </div>
                </div>

                {testResult && (
                  <Alert className={testResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                    {testResult.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className="space-y-2">
                      <div className={testResult.success ? "text-green-800" : "text-red-800"}>
                        {testResult.message}
                      </div>
                      {testResult.debug && (
                        <details className="text-xs">
                          <summary className="cursor-pointer">Debug Information</summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                            {JSON.stringify(testResult.debug, null, 2)}
                          </pre>
                        </details>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
