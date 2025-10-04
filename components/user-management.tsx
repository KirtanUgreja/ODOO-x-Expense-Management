"use client"

import { useState } from "react"
import { useData } from "@/lib/data-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Edit, Mail } from "lucide-react"
import type { UserRole } from "@/lib/types"

export function UserManagement() {
  const { users, createUser, updateUserRole, updateUserManager } = useData()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [showPasswordNotification, setShowPasswordNotification] = useState(false)

  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserName, setNewUserName] = useState("")
  const [newUserRole, setNewUserRole] = useState<UserRole>("employee")
  const [newUserManager, setNewUserManager] = useState<string>("")

  const managers = users.filter((u) => u.role === "manager" || u.role === "admin")

  const handleCreateUser = () => {
    if (!newUserEmail || !newUserName) return

    createUser(newUserEmail, newUserName, newUserRole, newUserManager || undefined)
    setNewUserEmail("")
    setNewUserName("")
    setNewUserRole("employee")
    setNewUserManager("")
    setIsCreateDialogOpen(false)
    setShowPasswordNotification(true)
    setTimeout(() => setShowPasswordNotification(false), 5000)
  }

  const handleUpdateRole = (userId: string, role: UserRole) => {
    updateUserRole(userId, role)
    setEditingUser(null)
  }

  const handleUpdateManager = (userId: string, managerId: string) => {
    updateUserManager(userId, managerId)
  }

  return (
    <div className="space-y-6">
      {showPasswordNotification && (
        <div className="p-4 rounded-lg bg-primary/10 border border-primary flex items-center gap-3">
          <Mail className="w-5 h-5 text-primary" />
          <p className="text-sm">User created successfully! Login credentials have been sent via email.</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage employees, managers, and their relationships</CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>Add a new employee or manager to your organization</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-user-name">Full Name</Label>
                    <Input
                      id="new-user-name"
                      placeholder="John Doe"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-user-email">Email</Label>
                    <Input
                      id="new-user-email"
                      type="email"
                      placeholder="john@company.com"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-user-role">Role</Label>
                    <Select value={newUserRole} onValueChange={(value) => setNewUserRole(value as UserRole)}>
                      <SelectTrigger id="new-user-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newUserRole === "employee" && managers.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="new-user-manager">Manager (Optional)</Label>
                      <Select value={newUserManager} onValueChange={setNewUserManager}>
                        <SelectTrigger id="new-user-manager">
                          <SelectValue placeholder="Select a manager" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No manager</SelectItem>
                          {managers.map((manager) => (
                            <SelectItem key={manager.id} value={manager.id}>
                              {manager.name} ({manager.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <Button onClick={handleCreateUser} className="w-full">
                    Create User
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-medium">{user.name}</p>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  {user.managerId && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Manager: {users.find((u) => u.id === user.managerId)?.name || "Unknown"}
                    </p>
                  )}
                </div>
                {user.role !== "admin" && (
                  <div className="flex items-center gap-2">
                    <Dialog
                      open={editingUser === user.id}
                      onOpenChange={(open) => setEditingUser(open ? user.id : null)}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit User</DialogTitle>
                          <DialogDescription>Update role and manager for {user.name}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label>Change Role</Label>
                            <Select
                              value={user.role}
                              onValueChange={(value) => handleUpdateRole(user.id, value as UserRole)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="employee">Employee</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {user.role === "employee" && managers.length > 0 && (
                            <div className="space-y-2">
                              <Label>Assign Manager</Label>
                              <Select
                                value={user.managerId || "none"}
                                onValueChange={(value) => handleUpdateManager(user.id, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a manager" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">No manager</SelectItem>
                                  {managers
                                    .filter((m) => m.id !== user.id)
                                    .map((manager) => (
                                      <SelectItem key={manager.id} value={manager.id}>
                                        {manager.name} ({manager.role})
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
