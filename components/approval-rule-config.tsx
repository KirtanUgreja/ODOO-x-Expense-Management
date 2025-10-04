"use client"

import { useState } from "react"
import { useData } from "@/lib/data-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, ArrowRight } from "lucide-react"
import type { ApprovalStep, UserRole } from "@/lib/types"

export function ApprovalRuleConfig() {
  const { approvalRule, updateApprovalRule, users } = useData()
  const [isManagerRequired, setIsManagerRequired] = useState(approvalRule?.isManagerApproverRequired ?? true)
  const [sequence, setSequence] = useState<ApprovalStep[]>(approvalRule?.sequence ?? [])

  const handleAddStep = () => {
    const newStep: ApprovalStep = {
      step: sequence.length + 1,
      role: "manager",
    }
    setSequence([...sequence, newStep])
  }

  const handleRemoveStep = (index: number) => {
    const newSequence = sequence.filter((_, i) => i !== index).map((step, i) => ({ ...step, step: i + 1 }))
    setSequence(newSequence)
  }

  const handleUpdateStepRole = (index: number, role: UserRole) => {
    const newSequence = [...sequence]
    newSequence[index] = { ...newSequence[index], role, userId: undefined }
    setSequence(newSequence)
  }

  const handleUpdateStepUser = (index: number, userId: string) => {
    const newSequence = [...sequence]
    newSequence[index] = { ...newSequence[index], userId: userId || undefined }
    setSequence(newSequence)
  }

  const handleSave = () => {
    updateApprovalRule(isManagerRequired, sequence)
  }

  const getUsersByRole = (role: UserRole) => {
    return users.filter((u) => u.role === role)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Approval Workflow Configuration</CardTitle>
        <CardDescription>Define how expenses are approved in your organization</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Manager Approval Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-border">
          <div className="space-y-0.5">
            <Label htmlFor="manager-required" className="text-base">
              Require Manager Approval First
            </Label>
            <p className="text-sm text-muted-foreground">
              When enabled, expenses must be approved by the employee's manager before entering the approval sequence
            </p>
          </div>
          <Switch id="manager-required" checked={isManagerRequired} onCheckedChange={setIsManagerRequired} />
        </div>

        {/* Approval Sequence */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Approval Sequence</h3>
              <p className="text-sm text-muted-foreground">Define the order of approvers after manager approval</p>
            </div>
            <Button onClick={handleAddStep} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Step
            </Button>
          </div>

          {sequence.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              <p className="text-muted-foreground">No approval steps defined. Add a step to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sequence.map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Badge variant="outline" className="w-16 justify-center">
                    Step {step.step}
                  </Badge>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <Select value={step.role} onValueChange={(value) => handleUpdateStepRole(index, value as UserRole)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={step.userId || "any"} onValueChange={(value) => handleUpdateStepUser(index, value)}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Any user with this role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any {step.role}</SelectItem>
                      {getUsersByRole(step.role!).map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveStep(index)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Workflow Preview */}
        <div className="p-4 rounded-lg bg-muted/50 space-y-2">
          <h4 className="font-medium text-sm">Workflow Preview</h4>
          <div className="flex items-center gap-2 flex-wrap text-sm">
            <Badge>Employee Submits</Badge>
            <ArrowRight className="w-4 h-4" />
            {isManagerRequired && (
              <>
                <Badge variant="secondary">Manager Approves</Badge>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
            {sequence.map((step, index) => (
              <div key={index} className="flex items-center gap-2">
                <Badge variant="secondary">
                  {step.userId ? users.find((u) => u.id === step.userId)?.name : `Any ${step.role}`}
                </Badge>
                {index < sequence.length - 1 && <ArrowRight className="w-4 h-4" />}
              </div>
            ))}
            <ArrowRight className="w-4 h-4" />
            <Badge variant="default">Approved</Badge>
          </div>
        </div>

        <Button onClick={handleSave} className="w-full">
          Save Approval Rules
        </Button>
      </CardContent>
    </Card>
  )
}
