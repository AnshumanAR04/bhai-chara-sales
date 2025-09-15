import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { createServerSupabaseClient } from "@/lib/supabase"
import { formatDistanceToNow } from "date-fns"

export async function RecentActivity() {
  const supabase = await createServerSupabaseClient()

  const { data: recentLeads } = await supabase
    .from("leads")
    .select(`
      id,
      status,
      notes,
      created_at,
      farmer:farmers(name, phone)
    `)
    .order("created_at", { ascending: false })
    .limit(10)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800"
      case "contacted":
        return "bg-yellow-100 text-yellow-800"
      case "interested":
        return "bg-green-100 text-green-800"
      case "qualified":
        return "bg-purple-100 text-purple-800"
      case "negotiation":
        return "bg-orange-100 text-orange-800"
      case "won":
        return "bg-emerald-100 text-emerald-800"
      case "lost":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        <p className="text-sm text-muted-foreground">Latest lead updates and interactions</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentLeads?.map((lead) => (
            <div
              key={lead.id}
              className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(lead.farmer?.name || "Unknown")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{lead.farmer?.name || "Unknown Farmer"}</p>
                  <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                </div>

                <p className="text-sm text-muted-foreground">{lead.notes || "No notes available"}</p>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{lead.farmer?.phone}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
