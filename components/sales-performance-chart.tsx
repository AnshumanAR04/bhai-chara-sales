import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createServerSupabaseClient } from "@/lib/supabase"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { format, subDays, eachDayOfInterval } from "date-fns"

interface SalesPerformanceChartProps {
  searchParams: {
    timeRange?: string
    startDate?: string
    endDate?: string
  }
}

export async function SalesPerformanceChart({ searchParams }: SalesPerformanceChartProps) {
  const supabase = await createServerSupabaseClient()

  // Calculate date range
  const getDateRange = (timeRange: string) => {
    const now = new Date()
    const ranges = {
      "7d": { days: 7, format: "MMM dd" },
      "30d": { days: 30, format: "MMM dd" },
      "90d": { days: 90, format: "MMM dd" },
      "6m": { days: 180, format: "MMM yyyy" },
      "1y": { days: 365, format: "MMM yyyy" },
      all: { days: 365, format: "MMM yyyy" },
    }
    return ranges[timeRange as keyof typeof ranges] || ranges["30d"]
  }

  const range = getDateRange(searchParams.timeRange || "30d")
  const endDate = new Date()
  const startDate = subDays(endDate, range.days)

  // Fetch sales data
  const { data: purchases } = await supabase
    .from("purchases")
    .select("quantity, purchase_date, product:products(price)")
    .gte("purchase_date", startDate.toISOString())
    .lte("purchase_date", endDate.toISOString())
    .order("purchase_date")

  // Fetch leads data
  const { data: leads } = await supabase
    .from("leads")
    .select("created_at, status")
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString())
    .order("created_at")

  // Generate date intervals
  const dateIntervals = eachDayOfInterval({ start: startDate, end: endDate })

  // Process data by date
  const chartData = dateIntervals.map((date) => {
    const dateStr = format(date, "yyyy-MM-dd")

    // Calculate daily revenue
    const dailyRevenue =
      purchases
        ?.filter((purchase) => format(new Date(purchase.purchase_date), "yyyy-MM-dd") === dateStr)
        ?.reduce((sum, purchase) => sum + (purchase.quantity || 0) * (purchase.product?.price || 0), 0) || 0

    // Calculate daily leads
    const dailyLeads = leads?.filter((lead) => format(new Date(lead.created_at), "yyyy-MM-dd") === dateStr)?.length || 0

    // Calculate daily conversions
    const dailyConversions =
      leads?.filter((lead) => format(new Date(lead.created_at), "yyyy-MM-dd") === dateStr && lead.status === "won")
        ?.length || 0

    return {
      date: format(date, range.format),
      revenue: dailyRevenue,
      leads: dailyLeads,
      conversions: dailyConversions,
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Sales Performance Trends</CardTitle>
        <p className="text-sm text-muted-foreground">Revenue, leads, and conversions over time</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
              formatter={(value, name) => [
                name === "revenue" ? `₹${value}` : value,
                name === "revenue" ? "Revenue" : name === "leads" ? "Leads" : "Conversions",
              ]}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="leads"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="conversions"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
