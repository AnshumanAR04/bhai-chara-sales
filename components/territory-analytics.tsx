import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createServerSupabaseClient } from "@/lib/supabase"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface TerritoryAnalyticsProps {
  searchParams: {
    timeRange?: string
    startDate?: string
    endDate?: string
  }
}

export async function TerritoryAnalytics({ searchParams }: TerritoryAnalyticsProps) {
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

  // Fetch territory performance data
  const { data: territoryData } = await supabase
    .from("purchases")
    .select(`
      quantity,
      purchase_date,
      product:products(price),
      farmer:farmers(district)
    `)
    .gte("purchase_date", startDate.toISOString())

  // Calculate revenue by district
  const districtRevenue =
    territoryData?.reduce(
      (acc, purchase) => {
        const district = purchase.farmer?.district || "Unknown"
        const revenue = (purchase.quantity || 0) * (purchase.product?.price || 0)
        acc[district] = (acc[district] || 0) + revenue
        return acc
      },
      {} as Record<string, number>,
    ) || {}

  // Convert to chart data
  const chartData = Object.entries(districtRevenue)
    .map(([district, revenue]) => ({
      name: district,
      value: revenue,
      percentage: 0, // Will be calculated after sorting
    }))
    .sort((a, b) => b.value - a.value)

  // Calculate percentages
  const totalRevenue = chartData.reduce((sum, item) => sum + item.value, 0)
  chartData.forEach((item) => {
    item.percentage = totalRevenue > 0 ? (item.value / totalRevenue) * 100 : 0
  })

  const COLORS = ["#8b5cf6", "#3b82f6", "#22c55e", "#facc15", "#f97316", "#ef4444", "#8b5cf6"]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Territory Performance</CardTitle>
        <p className="text-sm text-muted-foreground">Revenue distribution by district</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
              formatter={(value) => [`₹${value.toLocaleString()}`, "Revenue"]}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Top Territories */}
        <div className="mt-4 space-y-2">
          <h4 className="font-medium text-sm">Top Performing Territories</h4>
          {chartData.slice(0, 5).map((territory, index) => (
            <div key={territory.name} className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-sm font-medium">{territory.name}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">₹{territory.value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{territory.percentage.toFixed(1)}%</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
