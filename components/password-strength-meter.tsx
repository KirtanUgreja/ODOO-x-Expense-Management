"use client"

import { useMemo, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Check, X } from "lucide-react"

interface PasswordStrengthMeterProps {
  password: string
  onValidityChange?: (isValid: boolean) => void
}

interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
}

const requirements: PasswordRequirement[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "Contains uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "Contains lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "Contains number", test: (p) => /\d/.test(p) },
  { label: "Contains special character", test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
]

export function PasswordStrengthMeter({ password, onValidityChange }: PasswordStrengthMeterProps) {
  const { strength, score, isValid } = useMemo(() => {
    const passedRequirements = requirements.filter(req => req.test(password))
    const score = passedRequirements.length
    const isValid = score === requirements.length
    
    let strength = "Very Weak"
    if (score >= 5) strength = "Very Strong"
    else if (score >= 4) strength = "Strong"
    else if (score >= 3) strength = "Medium"
    else if (score >= 2) strength = "Weak"
    
    return { strength, score, isValid }
  }, [password])

  useEffect(() => {
    onValidityChange?.(isValid)
  }, [isValid, onValidityChange])

  if (!password) return null

  const progressValue = (score / requirements.length) * 100
  const progressColor = score >= 5 ? "bg-green-500" : score >= 3 ? "bg-yellow-500" : "bg-red-500"

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Password Strength</span>
          <span className={`text-sm font-medium ${
            score >= 5 ? "text-green-600" : 
            score >= 3 ? "text-yellow-600" : 
            "text-red-600"
          }`}>
            {strength}
          </span>
        </div>
        <div className="relative">
          <Progress value={progressValue} className="h-2" />
          <div 
            className={`absolute top-0 left-0 h-full transition-all duration-300 rounded-full ${progressColor}`}
            style={{ width: `${progressValue}%` }}
          />
        </div>
      </div>
      
      <div className="space-y-1">
        {requirements.map((req, index) => {
          const passed = req.test(password)
          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              {passed ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <X className="w-4 h-4 text-red-500" />
              )}
              <span className={passed ? "text-green-700" : "text-red-700"}>
                {req.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}