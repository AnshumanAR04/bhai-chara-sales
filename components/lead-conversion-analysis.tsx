import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createServerSupabaseClient } from "@/lib/supabase"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface LeadConversionAnalysisProps {
  searchParams: {
    timeRange?: string
    startDate?: string
    endDate?: string
  }
}

export async function LeadConversionAnalysis({ searchParams }: LeadConversionAnalysisProps) {
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

  const { data: leads } = await supabase.from("leads").select("status").gte("created_at", startDate.toISOString())

  // Count leads by status
  const statusCounts =
    leads?.reduce(
      (acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ) || {}

  // Define conversion funnel stages
  const funnelData = [
    {
      stage: "New",
      count: statusCounts["new"] || 0,
      color: "#3b82f6",
      percentage: 100,
    },
    {
      stage: "Contacted",
      count: statusCounts["contacted"] || 0,
      color: "#8b5cf6",
      percentage: statusCounts["new"] > 0 ? ((statusCounts["contacted"] || 0) / statusCounts["new"]) * 100 : 0,
    },
    {
      stage: "Interested",
      count: statusCounts["interested"] || 0,
      color: "#22c55e",
      percentage:
        statusCounts["contacted"] > 0 ? ((statusCounts["interested"] || 0) / statusCounts["contacted"]) * 100 : 0,
    },
    {
      stage: "Qualified",
      count: statusCounts["qualified"] || 0,
      color: "#facc15",
      percentage:
        statusCounts["interested"] > 0 ? ((statusCounts["qualified"] || 0) / statusCounts["interested"]) * 100 : 0,
    },
    {
      stage: "Negotiation",
      count: statusCounts["negotiation"] || 0,
      color: "#f97316",
      percentage:
        statusCounts["qualified"] > 0 ? ((statusCounts["negotiation"] || 0) / statusCounts["qualified"]) * 100 : 0,
    },
    {
      stage: "Won",
      count: statusCounts["won"] || 0,
      color: "#10b981",
      percentage:
        statusCounts["negotiation"] > 0 ? ((statusCounts["won"] || 0) / statusCounts["negotiation"]) * 100 : 0,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Lead Conversion Analysis</CardTitle>
        <p className="text-sm text-muted-foreground">Conversion rates between pipeline stages</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={funnelData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="stage" tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
              formatter={(value, name) => [
                name === "count" ? `${value} leads` : `${value}%`,
                name === "count" ? "Count" : "Conversion Rate",
              ]}
            />
            <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="count" />
          </BarChart>
        </ResponsiveContainer>

        {/* Conversion Rates Summary */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
          {funnelData.slice(1).map((stage, index) => (
            <div key={stage.stage} className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium">{stage.stage}</p>
              <p className="text-lg font-bold" style={{ color: stage.color }}>
                {stage.percentage.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">conversion rate</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
