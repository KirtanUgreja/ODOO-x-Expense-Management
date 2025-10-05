"use client"

import type React from "react"

import { useState } from "react"
import { useData } from "@/lib/data-context-supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ThemeToggle } from "@/components/theme-toggle"
import { PasswordStrengthMeter } from "@/components/password-strength-meter"
import { PasswordChangeDialog } from "@/components/password-change-dialog"
import type { Currency, User } from "@/lib/types"
import { Receipt, TrendingUp, Shield, Zap, AlertCircle } from "lucide-react"

export function AuthPage() {
  const { login, signup, changePassword } = useData()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("login")
  const [error, setError] = useState("")
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [pendingUser, setPendingUser] = useState<User | null>(null)

  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("")
  const [signupName, setSignupName] = useState("")
  const [signupCompanyName, setSignupCompanyName] = useState("")
  const [signupCurrency, setSignupCurrency] = useState<Currency>("USD")
  const [isSignupPasswordValid, setIsSignupPasswordValid] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    
    const result = await login(loginEmail, loginPassword)
    setIsLoading(false)
    
    if (!result.success) {
      setError("Invalid email or password")
    } else if (result.requiresPasswordChange && result.user) {
      setPendingUser(result.user)
      setShowPasswordChange(true)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    
    const result = await signup(
      signupEmail, 
      signupPassword, 
      signupConfirmPassword,
      signupName, 
      signupCompanyName, 
      signupCurrency
    )
    
    setIsLoading(false)
    
    if (!result.success && result.error) {
      setError(result.error)
    }
  }

  const handlePasswordChange = (newPassword: string) => {
    if (pendingUser) {
      changePassword(pendingUser.id, newPassword)
      setShowPasswordChange(false)
      setPendingUser(null)
      setLoginEmail("")
      setLoginPassword("")
    }
  }

  const passwordsMatch = signupPassword === signupConfirmPassword
  const showConfirmError = signupConfirmPassword && !passwordsMatch

  return (
    <>
      <PasswordChangeDialog
        open={showPasswordChange}
        onPasswordChange={handlePasswordChange}
        userEmail={pendingUser?.email || ""}
      />
      
      <div className="min-h-screen flex">
      {/* Left side - Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-background to-background p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Receipt className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">ExpenseFlow</span>
          </div>

          <div className="space-y-8 max-w-md">
            <div>
              <h1 className="text-5xl font-bold mb-4 text-balance">Expense management, reimagined</h1>
              <p className="text-xl text-muted-foreground text-pretty">
                Streamline approvals, eliminate paperwork, and get reimbursed faster with intelligent workflows.
              </p>
            </div>

            <div className="grid gap-6 pt-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Lightning Fast Approvals</h3>
                  <p className="text-sm text-muted-foreground">
                    Multi-level approval workflows that adapt to your organization
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Complete Transparency</h3>
                  <p className="text-sm text-muted-foreground">Track every expense from submission to reimbursement</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Smart Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    Gain insights into spending patterns and optimize budgets
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">Built for modern teams. Trusted by companies worldwide.</div>
      </div>

      {/* Right side - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="absolute top-8 right-8">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Receipt className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold">ExpenseFlow</span>
            </div>
          </div>

          <div className="w-full">
            <div className="grid w-full grid-cols-2 mb-8 p-1 bg-muted rounded-lg">
              <button
                onClick={() => setActiveTab("login")}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 ease-in-out ${
                  activeTab === "login"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setActiveTab("signup")}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 ease-in-out ${
                  activeTab === "signup"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign Up
              </button>
            </div>

            <div className="relative overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(${activeTab === "login" ? "0%" : "-100%"})` }}
              >
                <div className="w-full flex-shrink-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Welcome back</CardTitle>
                      <CardDescription>Enter your credentials to access your account</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}
                        
                        <div className="space-y-2">
                          <Label htmlFor="login-email">Email</Label>
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="you@company.com"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="login-password">Password</Label>
                          <Input
                            id="login-password"
                            type="password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading ? "Logging in..." : "Login"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
                <div className="w-full flex-shrink-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Create your account</CardTitle>
                      <CardDescription>Get started with ExpenseFlow in seconds</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSignup} className="space-y-4">
                        {error && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}
                        
                        <div className="space-y-2">
                          <Label htmlFor="signup-name">Full Name</Label>
                          <Input
                            id="signup-name"
                            placeholder="John Doe"
                            value={signupName}
                            onChange={(e) => setSignupName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-email">Email</Label>
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="you@company.com"
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-password">Password</Label>
                          <Input
                            id="signup-password"
                            type="password"
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            required
                          />
                        </div>
                        
                        <PasswordStrengthMeter 
                          password={signupPassword} 
                          onValidityChange={setIsSignupPasswordValid}
                        />
                        
                        <div className="space-y-2">
                          <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                          <Input
                            id="signup-confirm-password"
                            type="password"
                            value={signupConfirmPassword}
                            onChange={(e) => setSignupConfirmPassword(e.target.value)}
                            className={showConfirmError ? "border-red-500" : ""}
                            required
                          />
                          {showConfirmError && (
                            <p className="text-sm text-red-600">Passwords do not match</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-company">Company Name</Label>
                          <Input
                            id="signup-company"
                            placeholder="Acme Inc."
                            value={signupCompanyName}
                            onChange={(e) => setSignupCompanyName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-currency">Company Currency</Label>
                          <Select value={signupCurrency} onValueChange={(value) => setSignupCurrency(value as Currency)}>
                            <SelectTrigger id="signup-currency">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">USD - US Dollar</SelectItem>
                              <SelectItem value="EUR">EUR - Euro</SelectItem>
                              <SelectItem value="GBP">GBP - British Pound</SelectItem>
                              <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                              <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                              <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={isLoading || !isSignupPasswordValid || !passwordsMatch || !signupPassword || !signupConfirmPassword}
                        >
                          {isLoading ? "Creating account..." : "Create Account"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
