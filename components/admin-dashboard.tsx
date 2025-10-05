"use client"

import { useState, useEffect } from "react"
import { useData } from "@/lib/data-context-supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
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

import { ThemeToggle } from "@/components/theme-toggle"
import { SmoothScroll } from "@/components/smooth-scroll"
import { Users, Receipt, TrendingUp, Settings, LogOut, ShieldAlert, CheckCircle, XCircle, Mail, Download } from "lucide-react"
import { getEmailNotifications } from "@/lib/email-service"
import { generateExpensePDF, generateBulkExpensePDF } from "@/lib/pdf-service"
import type { Expense } from "@/lib/types"

export function AdminDashboard() {
  const { currentUser, company, users, expenses, logout, adminOverrideExpense } = useData()
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [overrideComment, setOverrideComment] = useState("")
  const [emailCount, setEmailCount] = useState(0)
  const [selectedManagerFilter, setSelectedManagerFilter] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const pendingExpenses = expenses.filter((e) => e.status === "pending")
  const approvedExpenses = expenses.filter((e) => e.status === "approved")
  const totalExpenseAmount = expenses.filter((e) => e.status === "approved").reduce((sum, e) => sum + e.amount, 0)
  
  // Get managers for filter dropdown
  const managers = users.filter((u) => u.role === "manager")
  
  // Filter expenses by selected manager
  const filteredExpenses = selectedManagerFilter === "all" 
    ? expenses 
    : expenses.filter((expense) => {
        const employee = users.find((u) => u.id === expense.employeeId)
        return employee?.managerId === selectedManagerFilter
      })

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
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{company?.name}</h1>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">Admin Dashboard • {currentUser?.name}</p>
                <Badge className="bg-purple-600 text-white hover:bg-purple-700 text-xs">
                  ADMIN
                </Badge>
              </div>
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

      <SmoothScroll>
        <div className="min-h-screen bg-background pt-24">
          <div className="container mx-auto px-6 py-8">
          <div className="space-y-6">
            <div className="bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px] grid grid-cols-4 max-w-3xl w-full">
              <button
                onClick={() => setActiveTab("overview")}
                className={`inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] ${
                  activeTab === "overview" ? "bg-background text-foreground shadow-sm" : "hover:bg-background/50"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] ${
                  activeTab === "users" ? "bg-background text-foreground shadow-sm" : "hover:bg-background/50"
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] ${
                  activeTab === "settings" ? "bg-background text-foreground shadow-sm" : "hover:bg-background/50"
                }`}
              >
                Settings
              </button>
              <button
                onClick={() => setActiveTab("emails")}
                className={`inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] relative ${
                  activeTab === "emails" ? "bg-background text-foreground shadow-sm" : "hover:bg-background/50"
                }`}
              >
                <Mail className="w-4 h-4 mr-2" />
                Emails
                {emailCount > 0 && (
                  <Badge className="ml-2 h-5 min-w-5 px-1 text-xs" variant="default">
                    {emailCount}
                  </Badge>
                )}
              </button>
            </div>

            {activeTab === "overview" && (
              <div className="space-y-6">
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

            <Card className="h-[600px] flex flex-col">
              <CardHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Expenses</CardTitle>
                    <CardDescription>
                      Latest expense submissions across your organization with admin override
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Label className="text-sm font-medium">Filters:</Label>
                    <Select value={selectedManagerFilter} onValueChange={setSelectedManagerFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Manager" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Managers</SelectItem>
                        {managers.map((manager) => (
                          <SelectItem key={manager.id} value={manager.id}>
                            {manager.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-36"
                      placeholder="From"
                    />
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-36"
                      placeholder="To"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        let filtered = filteredExpenses
                        if (dateFrom) filtered = filtered.filter(e => new Date(e.date) >= new Date(dateFrom))
                        if (dateTo) filtered = filtered.filter(e => new Date(e.date) <= new Date(dateTo))
                        const title = `Expense Report ${dateFrom ? `from ${dateFrom}` : ''} ${dateTo ? `to ${dateTo}` : ''} ${selectedManagerFilter !== 'all' ? `- ${managers.find(m => m.id === selectedManagerFilter)?.name}` : ''}`
                        generateBulkExpensePDF(filtered, company!, users, title)
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                {filteredExpenses.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Receipt className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>{selectedManagerFilter === "all" ? "No expenses submitted yet" : "No expenses found for selected manager"}</p>
                  </div>
                ) : (
                  <div className="h-full overflow-y-auto scrollbar-hide space-y-4 pr-2">
                    {filteredExpenses
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((expense) => (
                        <div
                          key={expense.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-border"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <p className="font-medium">{expense.employeeName}</p>
                              {expense.receiptUrl && (
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                  📎 Receipt
                                </Badge>
                              )}
                              {(() => {
                                const employee = users.find((u) => u.id === expense.employeeId)
                                const manager = employee?.managerId ? users.find((u) => u.id === employee.managerId) : null
                                const managerApproval = expense.approvalHistory.find(h => h.approverId === manager?.id)
                                return manager ? (
                                  <>
                                    <Badge variant="outline" className="text-xs">
                                      Manager: {manager.name}
                                    </Badge>
                                    {managerApproval && (
                                      <Badge variant={managerApproval.action === "approved" ? "default" : "destructive"} className="text-xs">
                                        Manager {managerApproval.action}
                                      </Badge>
                                    )}
                                  </>
                                ) : null
                              })()}
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
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                const employee = users.find(u => u.id === expense.employeeId)
                                if (employee) generateExpensePDF(expense, company!, employee)
                              }}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              PDF
                            </Button>
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
                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
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
                                      {expense.receiptUrl && (
                                        <div className="pt-2 border-t border-border">
                                          <p className="text-sm text-muted-foreground mb-2">Receipt</p>
                                          <img
                                            src={expense.receiptUrl}
                                            alt="Receipt"
                                            className="max-w-full h-auto rounded border border-border cursor-pointer"
                                            onClick={() => window.open(expense.receiptUrl, '_blank')}
                                          />
                                        </div>
                                      )}
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
              </div>
            )}

            {activeTab === "users" && (
              <div>
                <UserManagement />
              </div>
            )}

            {activeTab === "settings" && (
              <div>
                <ApprovalRuleConfig />
              </div>
            )}

            {activeTab === "emails" && (
              <div>
                <EmailNotificationsPanel />
              </div>
            )}
          </div>
          </div>
        </div>
      </SmoothScroll>
    </>
  )
}
