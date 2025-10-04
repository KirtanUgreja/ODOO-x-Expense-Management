"use client"

import { useState, useEffect } from "react"
import { useData } from "@/lib/data-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { UserManagement } from "@/components/user-management"
import { ApprovalRuleConfig } from "@/components/approval-rule-config"
import { EmailNotificationsPanel } from "@/components/email-notifications-panel"
import { EmailConfigWizard } from "@/components/email-config-wizard"
import { DatabaseModeToggle } from "@/components/database-mode-toggle"
import { ThemeToggle } from "@/components/theme-toggle"
import { Users, Receipt, TrendingUp, Settings, LogOut, ShieldAlert, CheckCircle, XCircle, Mail } from "lucide-react"
import { getEmailNotifications } from "@/lib/email-service"
import type { Expense } from "@/lib/types"

export function AdminDashboard() {
  const { currentUser, company, users, expenses, logout, adminOverrideExpense } = useData()
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [overrideComment, setOverrideComment] = useState("")
  const [emailCount, setEmailCount] = useState(0)

  const pendingExpenses = expenses.filter((e) => e.status === "pending")
  const approvedExpenses = expenses.filter((e) => e.status === "approved")
  const totalExpenseAmount = expenses.filter((e) => e.status === "approved").reduce((sum, e) => sum + e.amount, 0)

  useEffect(() => {
    const updateEmailCount = () => {
      const emails = getEmailNotifications()
      setEmailCount(emails.length)
      console.log("[v0] Admin dashboard - Email count updated:", emails.length)
    }

    updateEmailCount()
    const interval = setInterval(updateEmailCount, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleAdminApprove = () => {
    if (!selectedExpense) return
    adminOverrideExpense(selectedExpense.id, "approved", overrideComment || "Admin override approval")
    setSelectedExpense(null)
    setOverrideComment("")
  }

  const handleAdminReject = () => {
    if (!selectedExpense) return
    adminOverrideExpense(selectedExpense.id, "rejected", overrideComment || "Admin override rejection")
    setSelectedExpense(null)
    setOverrideComment("")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{company?.name}</h1>
              <p className="text-sm text-muted-foreground">Admin Dashboard • {currentUser?.name}</p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="outline" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-4xl grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="email-config">Email Config</TabsTrigger>
            <TabsTrigger value="emails" className="relative">
              <Mail className="w-4 h-4 mr-2" />
              Emails
              {emailCount > 0 && (
                <Badge className="ml-2 h-5 min-w-5 px-1 text-xs" variant="default">
                  {emailCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{users.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {users.filter((u) => u.role === "employee").length} employees,{" "}
                    {users.filter((u) => u.role === "manager").length} managers
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pending Expenses</CardTitle>
                  <Receipt className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{pendingExpenses.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Approved Expenses</CardTitle>
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{approvedExpenses.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">This period</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                  <Settings className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {company?.currency} {totalExpenseAmount.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Approved expenses</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Expenses</CardTitle>
                <CardDescription>
                  Latest expense submissions across your organization with admin override
                </CardDescription>
              </CardHeader>
              <CardContent>
                {expenses.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Receipt className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No expenses submitted yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {expenses
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((expense) => (
                        <div
                          key={expense.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-border"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <p className="font-medium">{expense.employeeName}</p>
                              <Badge
                                variant={
                                  expense.status === "approved"
                                    ? "default"
                                    : expense.status === "rejected"
                                      ? "destructive"
                                      : "secondary"
                                }
                              >
                                {expense.status}
                              </Badge>
                              {expense.approvalHistory.some((h) => h.step === -1) && (
                                <Badge variant="outline" className="bg-purple-500/10 text-purple-500">
                                  <ShieldAlert className="w-3 h-3 mr-1" />
                                  Admin Override
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{expense.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {expense.category} • {new Date(expense.date).toLocaleDateString()}
                            </p>
                            {expense.convertedAmount && expense.currency !== company?.currency && (
                              <p className="text-xs text-primary mt-1">
                                Converted: {company?.currency} {expense.convertedAmount.toFixed(2)}
                              </p>
                            )}
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <div>
                              <p className="font-bold">
                                {expense.currency} {expense.amount.toLocaleString()}
                              </p>
                            </div>
                            {expense.status === "pending" && (
                              <Dialog
                                open={selectedExpense?.id === expense.id}
                                onOpenChange={(open) => {
                                  if (!open) {
                                    setSelectedExpense(null)
                                    setOverrideComment("")
                                  }
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" onClick={() => setSelectedExpense(expense)}>
                                    <ShieldAlert className="w-4 h-4 mr-2" />
                                    Override
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Admin Override</DialogTitle>
                                    <DialogDescription>
                                      Bypass approval workflow and directly approve or reject this expense
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 pt-4">
                                    <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                                      <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Employee</span>
                                        <span className="font-medium">{expense.employeeName}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Amount</span>
                                        <span className="font-bold text-lg">
                                          {expense.currency} {expense.amount.toLocaleString()}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Category</span>
                                        <span className="font-medium">{expense.category}</span>
                                      </div>
                                      <div className="pt-2 border-t border-border">
                                        <p className="text-sm text-muted-foreground mb-1">Description</p>
                                        <p className="text-sm">{expense.description}</p>
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <Label htmlFor="override-comment">Override Reason</Label>
                                      <Textarea
                                        id="override-comment"
                                        placeholder="Explain why you're overriding the approval workflow..."
                                        value={overrideComment}
                                        onChange={(e) => setOverrideComment(e.target.value)}
                                        rows={3}
                                      />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                      <Button onClick={handleAdminReject} variant="destructive" className="flex-1">
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Reject
                                      </Button>
                                      <Button onClick={handleAdminApprove} className="flex-1">
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Approve
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="settings">
            <ApprovalRuleConfig />
          </TabsContent>

          <TabsContent value="database">
            <DatabaseModeToggle />
          </TabsContent>

          <TabsContent value="email-config">
            <EmailConfigWizard />
          </TabsContent>

          <TabsContent value="emails">
            <EmailNotificationsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
