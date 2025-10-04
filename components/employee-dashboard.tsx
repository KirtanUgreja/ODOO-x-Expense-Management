"use client"

import { useState } from "react"
import { useData } from "@/lib/data-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExpenseSubmissionForm } from "@/components/expense-submission-form"
import { ThemeToggle } from "@/components/theme-toggle"
import { Receipt, TrendingUp, Clock, CheckCircle, XCircle, LogOut, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function EmployeeDashboard() {
  const { currentUser, company, expenses, logout } = useData()
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false)

  const myExpenses = expenses.filter((e) => e.employeeId === currentUser?.id)
  const pendingExpenses = myExpenses.filter((e) => e.status === "pending")
  const approvedExpenses = myExpenses.filter((e) => e.status === "approved")
  const rejectedExpenses = myExpenses.filter((e) => e.status === "rejected")
  const totalApprovedAmount = approvedExpenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">My Expenses</h1>
              <p className="text-sm text-muted-foreground">
                {currentUser?.name} • {company?.name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center justify-center">
                    <Plus className="w-4 h-4 mr-1" />
                    Submit Expense
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Submit New Expense</DialogTitle>
                    <DialogDescription>Fill in the details of your expense claim</DialogDescription>
                  </DialogHeader>
                  <ExpenseSubmissionForm onSuccess={() => setIsSubmitDialogOpen(false)} />
                </DialogContent>
              </Dialog>
              <Button variant="outline" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <Receipt className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{myExpenses.length}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingExpenses.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{approvedExpenses.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Ready for reimbursement</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {company?.currency} {totalApprovedAmount.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Approved expenses</p>
            </CardContent>
          </Card>
        </div>

        {/* Expense History */}
        <Card>
          <CardHeader>
            <CardTitle>Expense History</CardTitle>
            <CardDescription>Track the status of all your submitted expenses</CardDescription>
          </CardHeader>
          <CardContent>
            {myExpenses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Receipt className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="mb-4">No expenses submitted yet</p>
                <Button onClick={() => setIsSubmitDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Submit Your First Expense
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {myExpenses
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((expense) => (
                    <div
                      key={expense.id}
                      className="p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{expense.description}</h3>
                            <Badge
                              variant={
                                expense.status === "approved"
                                  ? "default"
                                  : expense.status === "rejected"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {expense.status === "approved" && <CheckCircle className="w-3 h-3 mr-1" />}
                              {expense.status === "rejected" && <XCircle className="w-3 h-3 mr-1" />}
                              {expense.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                              {expense.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{expense.category}</span>
                            <span>•</span>
                            <span>{new Date(expense.date).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>Submitted {new Date(expense.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">
                            {expense.currency} {expense.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Approval History */}
                      {expense.approvalHistory.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <p className="text-sm font-medium mb-2">Approval History</p>
                          <div className="space-y-2">
                            {expense.approvalHistory.map((record, index) => (
                              <div key={index} className="flex items-center gap-3 text-sm">
                                <Badge variant="outline" className="w-16 justify-center">
                                  Step {record.step}
                                </Badge>
                                <span className="text-muted-foreground">{record.approverName}</span>
                                <Badge variant={record.action === "approved" ? "default" : "destructive"}>
                                  {record.action}
                                </Badge>
                                {record.comment && (
                                  <span className="text-muted-foreground italic">"{record.comment}"</span>
                                )}
                                <span className="text-muted-foreground ml-auto">
                                  {new Date(record.timestamp).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
