import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createServerSupabaseClient } from "@/lib/supabase"
import { Target, TrendingUp, Clock, IndianRupee } from "lucide-react"

export async function PipelineStats() {
  const supabase = await createServerSupabaseClient()

  const [{ data: leads }, { data: purchases }] = await Promise.all([
    supabase.from("leads").select("status, created_at"),
    supabase.from("purchases").select("quantity, product:products(price)"),
  ])

  // Calculate pipeline metrics
  const totalOpportunities = leads?.length || 0
  const activeOpportunities = leads?.filter((lead) => !["won", "lost"].includes(lead.status)).length || 0
  const wonLeads = leads?.filter((lead) => lead.status === "won").length || 0
  const conversionRate = totalOpportunities > 0 ? (wonLeads / totalOpportunities) * 100 : 0

  // Calculate total pipeline value (estimated)
  const totalRevenue =
    purchases?.reduce((sum, purchase) => {
      return sum + (purchase.quantity || 0) * (purchase.product?.price || 0)
    }, 0) || 0

  // Calculate average deal cycle (days from creation to won)
  const wonLeadsWithDates = leads?.filter((lead) => lead.status === "won") || []
  const avgDealCycle =
    wonLeadsWithDates.length > 0
      ? wonLeadsWithDates.reduce((sum, lead) => {
          const daysSinceCreated = Math.floor(
            (Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24),
          )
          return sum + daysSinceCreated
        }, 0) / wonLeadsWithDates.length
      : 0

  const stats = [
    {
      title: "Active Opportunities",
      value: activeOpportunities,
      icon: Target,
      description: "In pipeline",
    },
    {
      title: "Conversion Rate",
      value: `${conversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      description: "Lead to sale",
    },
    {
      title: "Avg Deal Cycle",
      value: `${Math.round(avgDealCycle)}d`,
      icon: Clock,
      description: "Days to close",
    },
    {
      title: "Pipeline Value",
      value: `₹${(totalRevenue / 1000).toFixed(0)}K`,
      icon: IndianRupee,
      description: "Total revenue",
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
