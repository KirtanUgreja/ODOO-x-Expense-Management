"use client"

import { useState } from "react"
import { useData } from "@/lib/data-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  Database, 
  HardDrive, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Info
} from "lucide-react"

export function DatabaseModeToggle() {
  const { databaseMode, toggleDatabaseMode, initializeDatabase } = useData()
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const testDatabaseConnection = async () => {
    setIsTestingConnection(true)
    setConnectionStatus(null)

    try {
      const success = await initializeDatabase()
      setConnectionStatus({
        success,
        message: success 
          ? "Database connection successful! ✅" 
          : "Database connection failed. Check your DATABASE_URL in .env.local"
      })
    } catch (error) {
      setConnectionStatus({
        success: false,
        message: error instanceof Error ? error.message : "Unknown connection error"
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {databaseMode ? <Database className="h-5 w-5" /> : <HardDrive className="h-5 w-5" />}
              Data Storage Mode
            </CardTitle>
            <CardDescription>
              Switch between localStorage and PostgreSQL database
            </CardDescription>
          </div>
          <Badge variant={databaseMode ? "default" : "secondary"}>
            {databaseMode ? "PostgreSQL" : "localStorage"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Current Mode:</strong> {databaseMode ? "PostgreSQL Database" : "Browser localStorage"}
          </AlertDescription>
        </Alert>

        <div className="flex items-center space-x-2">
          <Switch
            id="database-mode"
            checked={databaseMode}
            onCheckedChange={toggleDatabaseMode}
          />
          <Label htmlFor="database-mode">
            Use PostgreSQL Database
          </Label>
        </div>

        {databaseMode && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-medium">Database Configuration</h4>
            
            <div className="space-y-2">
              <Button 
                variant="outline" 
                onClick={testDatabaseConnection}
                disabled={isTestingConnection}
                className="w-full sm:w-auto"
              >
                {isTestingConnection ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Database className="h-4 w-4 mr-2" />
                )}
                Test Database Connection
              </Button>
            </div>

            {connectionStatus && (
              <Alert className={connectionStatus.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                {connectionStatus.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={connectionStatus.success ? "text-green-800" : "text-red-800"}>
                  {connectionStatus.message}
                </AlertDescription>
              </Alert>
            )}

            {!connectionStatus?.success && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p><strong>Database Setup Required:</strong></p>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Install PostgreSQL on your system</li>
                      <li>Run <code className="bg-gray-100 px-1 rounded">npm run db:setup</code></li>
                      <li>Ensure DATABASE_URL is set in .env.local</li>
                      <li>Test connection above</li>
                    </ol>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Mode Comparison</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <p className="font-medium text-green-700">✅ localStorage Mode</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• No setup required</li>
                <li>• Fast for development</li>
                <li>• Data persists in browser</li>
                <li>• Limited to single user</li>
              </ul>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-blue-700">✅ PostgreSQL Mode</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Production-ready</li>
                <li>• Multi-user support</li>
                <li>• Data integrity & backups</li>
                <li>• Requires database setup</li>
              </ul>
            </div>
          </div>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> Switching modes requires a page refresh. Data from each mode is stored separately.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
