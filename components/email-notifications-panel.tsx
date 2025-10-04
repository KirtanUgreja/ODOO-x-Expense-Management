"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Mail, Clock } from "lucide-react"
import { getEmailNotifications } from "@/lib/email-service"
import type { EmailNotification } from "@/lib/types"

export function EmailNotificationsPanel() {
  const [notifications, setNotifications] = useState<EmailNotification[]>([])

  useEffect(() => {
    const loadNotifications = () => {
      setNotifications(getEmailNotifications())
    }

    loadNotifications()
    const interval = setInterval(loadNotifications, 2000)
    return () => clearInterval(interval)
  }, [])

  const getTypeBadge = (type: EmailNotification["type"]) => {
    const variants: Record<EmailNotification["type"], string> = {
      credentials: "bg-purple-500/10 text-purple-500",
      expense_submitted: "bg-blue-500/10 text-blue-500",
      expense_approved: "bg-green-500/10 text-green-500",
      expense_rejected: "bg-red-500/10 text-red-500",
    }
    return variants[type]
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-purple-500" />
          <CardTitle>Email Notifications</CardTitle>
        </div>
        <CardDescription>Simulated email notifications sent by the system</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No emails sent yet</p>
          ) : (
            <div className="space-y-4">
              {notifications
                .slice()
                .reverse()
                .map((notification) => (
                  <div key={notification.id} className="border border-border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{notification.subject}</p>
                        <p className="text-xs text-muted-foreground truncate">To: {notification.to}</p>
                      </div>
                      <Badge className={getTypeBadge(notification.type)} variant="secondary">
                        {notification.type.replace("_", " ")}
                      </Badge>
                    </div>
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap bg-muted/50 p-2 rounded">
                      {notification.body}
                    </pre>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(notification.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
