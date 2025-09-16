import { createServerSupabaseClient } from "@/lib/supabase"
import { subDays } from "date-fns"
import { LeadConversionAnalysisClient } from "./lead-conversion-analysis-client"

interface LeadConversionAnalysisServerProps {
  searchParams: {
    timeRange?: string
    startDate?: string
    endDate?: string
  }
}

export async function LeadConversionAnalysisServer({ searchParams }: LeadConversionAnalysisServerProps) {
  const supabase = await createServerSupabaseClient()

  // Calculate date range
  const getDateRange = (timeRange: string) => {
    const now = new Date()
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

  // Fetch leads data
  const { data: leads } = await supabase
    .from("leads")
    .select("created_at, status, source")
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString())
    .order("created_at")

  // Process conversion data by source
  const sourceData = leads?.reduce((acc: any, lead) => {
    const source = lead.source || "Unknown"
    if (!acc[source]) {
      acc[source] = { total: 0, converted: 0 }
    }
    acc[source].total++
    if (lead.status === "won") {
      acc[source].converted++
    }
    return acc
  }, {})

  const chartData = Object.entries(sourceData || {}).map(([source, data]: [string, any]) => ({
    source,
    total: data.total,
    converted: data.converted,
    conversionRate: ((data.converted / data.total) * 100).toFixed(1),
  }))

  return <LeadConversionAnalysisClient data={chartData} />
}
