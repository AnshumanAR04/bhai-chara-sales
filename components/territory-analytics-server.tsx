import { createServerSupabaseClient } from "@/lib/supabase"
import { subDays } from "date-fns"
import { TerritoryAnalyticsClient } from "./territory-analytics-client"

interface TerritoryAnalyticsServerProps {
  searchParams: {
    timeRange?: string
    startDate?: string
    endDate?: string
  }
}

export async function TerritoryAnalyticsServer({ searchParams }: TerritoryAnalyticsServerProps) {
  const supabase = await createServerSupabaseClient()

  // Calculate date range
  const getDateRange = (timeRange: string) => {
    const ranges = {
      "7d": { days: 7 },
      "30d": { days: 30 },
      "90d": { days: 90 },
      "6m": { days: 180 },
      "1y": { days: 365 },
      all: { days: 365 },
    }
    return ranges[timeRange as keyof typeof ranges] || ranges["30d"]
  }

  const range = getDateRange(searchParams.timeRange || "30d")
  const endDate = new Date()
  const startDate = subDays(endDate, range.days)

  // Fetch territory data
  const { data: leads } = await supabase
    .from("leads")
    .select("territory, status, created_at")
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString())

  const { data: purchases } = await supabase
    .from("purchases")
    .select("territory, quantity, purchase_date, product:products(price)")
    .gte("purchase_date", startDate.toISOString())
    .lte("purchase_date", endDate.toISOString())

  // Process territory data
  const territoryData = leads?.reduce((acc: any, lead) => {
    const territory = lead.territory || "Unknown"
    if (!acc[territory]) {
      acc[territory] = { leads: 0, conversions: 0, revenue: 0 }
    }
    acc[territory].leads++
    if (lead.status === "won") {
      acc[territory].conversions++
    }
    return acc
  }, {})

  // Add revenue data
  purchases?.forEach((purchase) => {
    const territory = purchase.territory || "Unknown"
    if (territoryData?.[territory]) {
      territoryData[territory].revenue += (purchase.quantity || 0) * (purchase.product?.price || 0)
    }
  })

  const chartData = Object.entries(territoryData || {}).map(([territory, data]: [string, any]) => ({
    territory,
    leads: data.leads,
    conversions: data.conversions,
    revenue: data.revenue,
    conversionRate: data.leads > 0 ? ((data.conversions / data.leads) * 100).toFixed(1) : "0",
  }))

  return <TerritoryAnalyticsClient data={chartData} />
}
