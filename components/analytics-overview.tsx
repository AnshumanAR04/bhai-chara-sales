import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createServerSupabaseClient } from "@/lib/supabase"
import { TrendingUp, TrendingDown, Users, Target, IndianRupee } from "lucide-react"

interface AnalyticsOverviewProps {
  searchParams: {
    timeRange?: string
    startDate?: string
    endDate?: string
  }
}

export async function AnalyticsOverview({ searchParams }: AnalyticsOverviewProps) {
  const supabase = await createServerSupabaseClient()

  // Calculate date range
  const getDateRange = (timeRange: string) => {
    const now = new Date()
    const ranges = {
      "7d": new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      "30d": new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      "90d": new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      "6m": new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
      "1y": new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
      all: new Date("2020-01-01"),
    }
    return ranges[timeRange as keyof typeof ranges] || ranges["30d"]
  }

  const startDate = searchParams.startDate
    ? new Date(searchParams.startDate)
    : getDateRange(searchParams.timeRange || "30d")

  // Fetch current period data
  const [{ data: currentLeads }, { data: currentPurchases }, { data: currentFarmers }] = await Promise.all([
    supabase.from("leads").select("status, created_at").gte("created_at", startDate.toISOString()),
    supabase
      .from("purchases")
      .select("quantity, purchase_date, product:products(price)")
      .gte("purchase_date", startDate.toISOString()),
    supabase.from("farmers").select("created_at").gte("created_at", startDate.toISOString()),
  ])

  // Calculate previous period for comparison
  const periodLength = Date.now() - startDate.getTime()
  const previousStartDate = new Date(startDate.getTime() - periodLength)

  const [{ data: previousLeads }, { data: previousPurchases }, { data: previousFarmers }] = await Promise.all([
    supabase
      .from("leads")
      .select("status, created_at")
      .gte("created_at", previousStartDate.toISOString())
      .lt("created_at", startDate.toISOString()),
    supabase
      .from("purchases")
      .select("quantity, purchase_date, product:products(price)")
      .gte("purchase_date", previousStartDate.toISOString())
      .lt("purchase_date", startDate.toISOString()),
    supabase
      .from("farmers")
      .select("created_at")
      .gte("created_at", previousStartDate.toISOString())
      .lt("created_at", startDate.toISOString()),
  ])

  // Calculate metrics
  const currentTotalLeads = currentLeads?.length || 0
  const previousTotalLeads = previousLeads?.length || 0
  const leadsGrowth = previousTotalLeads > 0 ? ((currentTotalLeads - previousTotalLeads) / previousTotalLeads) * 100 : 0

  const currentWonLeads = currentLeads?.filter((lead) => lead.status === "won").length || 0
  const previousWonLeads = previousLeads?.filter((lead) => lead.status === "won").length || 0
  const conversionRate = currentTotalLeads > 0 ? (currentWonLeads / currentTotalLeads) * 100 : 0
  const previousConversionRate = previousTotalLeads > 0 ? (previousWonLeads / previousTotalLeads) * 100 : 0
  const conversionGrowth =
    previousConversionRate > 0 ? ((conversionRate - previousConversionRate) / previousConversionRate) * 100 : 0

  const currentRevenue =
    currentPurchases?.reduce((sum, purchase) => {
      return sum + (purchase.quantity || 0) * (purchase.product?.price || 0)
    }, 0) || 0

  const previousRevenue =
    previousPurchases?.reduce((sum, purchase) => {
      return sum + (purchase.quantity || 0) * (purchase.product?.price || 0)
    }, 0) || 0

  const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0

  const currentNewFarmers = currentFarmers?.length || 0
  const previousNewFarmers = previousFarmers?.length || 0
  const farmersGrowth =
    previousNewFarmers > 0 ? ((currentNewFarmers - previousNewFarmers) / previousNewFarmers) * 100 : 0

  const metrics = [
    {
      title: "Total Leads",
      value: currentTotalLeads,
      change: leadsGrowth,
      icon: Target,
      description: "New leads generated",
    },
    {
      title: "Conversion Rate",
      value: `${conversionRate.toFixed(1)}%`,
      change: conversionGrowth,
      icon: TrendingUp,
      description: "Lead to sale conversion",
    },
    {
      title: "Revenue",
      value: `₹${(currentRevenue / 1000).toFixed(0)}K`,
      change: revenueGrowth,
      icon: IndianRupee,
      description: "Total sales revenue",
    },
    {
      title: "New Farmers",
      value: currentNewFarmers,
      change: farmersGrowth,
      icon: Users,
      description: "Farmers registered",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon
        const isPositive = metric.change >= 0
        const TrendIcon = isPositive ? TrendingUp : TrendingDown

        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground mb-1">{metric.value}</div>
              <div className="flex items-center space-x-2">
                <Badge variant={isPositive ? "default" : "destructive"} className="text-xs">
                  <TrendIcon className="h-3 w-3 mr-1" />
                  {Math.abs(metric.change).toFixed(1)}%
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
