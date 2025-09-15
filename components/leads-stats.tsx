import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createServerSupabaseClient } from "@/lib/supabase"
import { Users, TrendingUp, AlertTriangle } from "lucide-react"

export async function LeadsStats() {
  const supabase = await createServerSupabaseClient()

  const { data: leads } = await supabase.from("leads").select("status, created_at")

  const totalLeads = leads?.length || 0
  const newLeads = leads?.filter((lead) => lead.status === "new").length || 0
  const hotLeads = leads?.filter((lead) => ["qualified", "negotiation"].includes(lead.status)).length || 0

  // Calculate leads older than 7 days without follow-up
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const staleLeads =
    leads?.filter((lead) => {
      const createdAt = new Date(lead.created_at)
      return createdAt < sevenDaysAgo && ["new", "contacted"].includes(lead.status)
    }).length || 0

  const stats = [
    {
      title: "Total Leads",
      value: totalLeads,
      icon: Users,
      description: "All active leads",
    },
    {
      title: "New Leads",
      value: newLeads,
      icon: TrendingUp,
      description: "Require attention",
    },
    {
      title: "Hot Leads",
      value: hotLeads,
      icon: TrendingUp,
      description: "Ready to close",
    },
    {
      title: "Stale Leads",
      value: staleLeads,
      icon: AlertTriangle,
      description: "Need follow-up",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
