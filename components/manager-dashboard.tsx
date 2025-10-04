"use client"

import { useState } from "react"
import { useData } from "@/lib/data-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { ThemeToggle } from "@/components/theme-toggle"
import { Receipt, Clock, CheckCircle, XCircle, LogOut, Users, ArrowRightLeft, Download } from "lucide-react"
import { generateExpensePDF, generateBulkExpensePDF } from "@/lib/pdf-service"
import type { Expense } from "@/lib/types"

export function ManagerDashboard() {
  const { currentUser, company, expenses, users, getPendingExpensesForApprover, updateExpenseStatus, logout } =
    useData()
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [comment, setComment] = useState("")
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const pendingForMe = getPendingExpensesForApprover(currentUser?.id || "")
  const myTeamExpenses = expenses.filter((e) => {
    const employee = users.find((u) => u.id === e.employeeId)
    return employee?.managerId === currentUser?.id
  })
  
  const myTeamMembers = users.filter((u) => u.managerId === currentUser?.id)
  
  const filteredTeamExpenses = selectedEmployeeFilter === "all" 
    ? myTeamExpenses 
    : myTeamExpenses.filter((e) => e.employeeId === selectedEmployeeFilter)
  const approvedByMe = myTeamExpenses.filter((e) =>
    e.approvalHistory.some((h) => h.approverId === currentUser?.id && h.action === "approved"),
  )

  const handleApprove = () => {
    if (!selectedExpense || !currentUser) return
    updateExpenseStatus(selectedExpense.id, "approved", currentUser.id, comment || undefined)
    setSelectedExpense(null)
    setComment("")
  }

  const handleReject = () => {
    if (!selectedExpense || !currentUser) return
    updateExpenseStatus(selectedExpense.id, "rejected", currentUser.id, comment || undefined)
    setSelectedExpense(null)
    setComment("")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Manager Dashboard</h1>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  {currentUser?.name} • {company?.name}
                </p>
                <Badge className="bg-blue-600 text-white hover:bg-blue-700 text-xs">
                  MANAGER
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

      <div className="pt-32">
        <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingForMe.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting your review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Team Expenses</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{myTeamExpenses.length}</div>
              <p className="text-xs text-muted-foreground mt-1">From your team</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Approved by You</CardTitle>
              <CheckCircle className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{approvedByMe.length}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Receipt className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{users.filter((u) => u.managerId === currentUser?.id).length}</div>
              <p className="text-xs text-muted-foreground mt-1">Direct reports</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Approvals */}
        <Card className="mb-8 h-[500px] flex flex-col">
          <CardHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>Review and approve expenses from your team</CardDescription>
              </div>
              {pendingForMe.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateBulkExpensePDF(pendingForMe, company!, users, "Pending Approvals Report")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Pending PDF
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            {pendingForMe.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No pending approvals</p>
              </div>
            ) : (
              <div className="h-full overflow-y-auto scrollbar-hide space-y-4 pr-2">
                {pendingForMe.map((expense) => (
                  <div
                    key={expense.id}
                    className="p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{expense.description}</h3>
                          <Badge variant="secondary">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span className="font-medium">{expense.employeeName}</span>
                          <span>•</span>
                          <span>{expense.category}</span>
                          <span>•</span>
                          <span>{new Date(expense.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Submitted {new Date(expense.createdAt).toLocaleDateString()}
                        </p>
                        {expense.convertedAmount && expense.currency !== company?.currency && (
                          <div className="flex items-center gap-2 mt-2 text-sm text-primary">
                            <ArrowRightLeft className="w-3 h-3" />
                            <span>
                              {expense.currency} {expense.amount.toLocaleString()} ≈ {company?.currency}{" "}
                              {expense.convertedAmount.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold mb-3">
                          {expense.currency} {expense.amount.toLocaleString()}
                        </p>
                        <Dialog
                          open={selectedExpense?.id === expense.id}
                          onOpenChange={(open) => {
                            if (!open) {
                              setSelectedExpense(null)
                              setComment("")
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button onClick={() => setSelectedExpense(expense)}>Review</Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
                            <DialogHeader>
                              <DialogTitle>Review Expense</DialogTitle>
                              <DialogDescription>Approve or reject this expense claim</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              {/* Expense Details */}
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
                                {expense.convertedAmount && expense.currency !== company?.currency && (
                                  <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Converted Amount</span>
                                    <span className="font-medium text-primary">
                                      {company?.currency} {expense.convertedAmount.toFixed(2)}
                                    </span>
                                  </div>
                                )}
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Category</span>
                                  <span className="font-medium">{expense.category}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Date</span>
                                  <span className="font-medium">{new Date(expense.date).toLocaleDateString()}</span>
                                </div>
                                <div className="pt-2 border-t border-border">
                                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                                  <p className="text-sm">{expense.description}</p>
                                </div>
                                {expense.receiptUrl && (
                                  <div className="pt-2 border-t border-border">
                                    <p className="text-sm text-muted-foreground mb-2">Receipt</p>
                                    <img
                                      src={expense.receiptUrl || "/placeholder.svg"}
                                      alt="Receipt"
                                      className="max-w-full h-auto rounded border border-border"
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Comment */}
                              <div className="space-y-2">
                                <Label htmlFor="comment">Comment (Optional)</Label>
                                <Textarea
                                  id="comment"
                                  placeholder="Add a comment about this expense..."
                                  value={comment}
                                  onChange={(e) => setComment(e.target.value)}
                                  rows={3}
                                />
                              </div>

                              {/* Actions */}
                              <div className="flex gap-3 pt-4">
                                <Button onClick={handleReject} variant="destructive" className="flex-1">
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject
                                </Button>
                                <Button onClick={handleApprove} className="flex-1">
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approve
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>

                    {/* Previous Approval History */}
                    {expense.approvalHistory.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-sm font-medium mb-2">Previous Approvals</p>
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

        {/* All Team Expenses */}
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Team Expense History</CardTitle>
                <CardDescription>All expenses from your team members</CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Label className="text-sm font-medium">Filters:</Label>
                <Select value={selectedEmployeeFilter} onValueChange={setSelectedEmployeeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employees</SelectItem>
                    {myTeamMembers.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
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
                    let filtered = filteredTeamExpenses
                    if (dateFrom) filtered = filtered.filter(e => new Date(e.date) >= new Date(dateFrom))
                    if (dateTo) filtered = filtered.filter(e => new Date(e.date) <= new Date(dateTo))
                    const employeeName = selectedEmployeeFilter !== 'all' ? myTeamMembers.find(e => e.id === selectedEmployeeFilter)?.name : 'Team'
                    const title = `${employeeName} Expenses ${dateFrom ? `from ${dateFrom}` : ''} ${dateTo ? `to ${dateTo}` : ''}`
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
            {filteredTeamExpenses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Receipt className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>{selectedEmployeeFilter === "all" ? "No team expenses yet" : "No expenses found for selected employee"}</p>
              </div>
            ) : (
              <div className="h-full overflow-y-auto scrollbar-hide space-y-4 pr-2">
                {filteredTeamExpenses
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
                        <p className="text-sm text-muted-foreground">{expense.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {expense.category} • {new Date(expense.date).toLocaleDateString()}
                        </p>
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
                          {expense.convertedAmount && expense.currency !== company?.currency && (
                            <p className="text-xs text-primary mt-1">
                              {company?.currency} {expense.convertedAmount.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}
