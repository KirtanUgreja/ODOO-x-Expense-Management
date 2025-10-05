"use client"
import { useData } from "@/lib/data-context-supabase"
import { AuthPage } from "@/components/auth-page"
import { AdminDashboard } from "@/components/admin-dashboard"
import { EmployeeDashboard } from "@/components/employee-dashboard"
import { ManagerDashboard } from "@/components/manager-dashboard"

export default function Home() {
  const { currentUser } = useData()

  if (!currentUser) {
    return <AuthPage />
  }

  if (currentUser) {
    if (currentUser.role === "admin") {
      return <AdminDashboard />
    } else if (currentUser.role === "manager") {
      return <ManagerDashboard />
    } else {
      return <EmployeeDashboard />
    }
  }
}
