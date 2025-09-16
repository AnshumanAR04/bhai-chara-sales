import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Target, TrendingUp, IndianRupee, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function DashboardMetrics() {
  const supabase = await createServerSupabaseClient()

  // Fetch metrics data
  const [{ count: totalLeads }, { count: totalFarmers }, { data: purchases }, { data: leadsByStatus }] =
    await Promise.all([
      supabase.from("leads").select("*", { count: "exact", head: true }),
      supabase.from("farmers").select("*", { count: "exact", head: true }),
      supabase.from("purchases").select("quantity, product:products(price)"),
      supabase.from("leads").select("status"),
    ])

  // Calculate metrics
  const totalRevenue =
    purchases?.reduce((sum, purchase) => {
      return sum + (purchase.quantity || 0) * (purchase.product?.price || 0)
    }, 0) || 0

  const wonLeads = leadsByStatus?.filter((lead) => lead.status === "won").length || 0
  const conversionRate = totalLeads ? (wonLeads / totalLeads) * 100 : 0

  const metrics = [
    {
      title: "Total Leads",
      value: totalLeads || 0,
      change: "+12%",
      trend: "up",
      icon: Target,
      description: "from last month",
    },
    {
      title: "Active Farmers",
      value: totalFarmers || 0,
      change: "+8%",
      trend: "up",
      icon: Users,
      description: "registered farmers",
    },
    {
      title: "Revenue",
      value: `₹${(totalRevenue / 1000).toFixed(1)}K`,
      change: "+23%",
      trend: "up",
      icon: IndianRupee,
      description: "this month",
    },
    {
      title: "Conversion Rate",
      value: `${conversionRate.toFixed(1)}%`,
      change: "-2%",
      trend: "down",
      icon: TrendingUp,
      description: "lead to sale",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon
        const TrendIcon = metric.trend === "up" ? ArrowUpRight : ArrowDownRight

        return (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground mb-1">{metric.value}</div>
              <div className="flex items-center space-x-2">
                <Badge variant={metric.trend === "up" ? "default" : "secondary"} className="text-xs">
                  <TrendIcon className="h-3 w-3 mr-1" />
                  {metric.change}
                </Badge>
                <p className="text-xs text-muted-foreground">{metric.description}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
