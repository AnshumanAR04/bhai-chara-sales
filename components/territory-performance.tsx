import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createServerSupabaseClient } from "@/lib/supabase"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

export async function TerritoryPerformance() {
  const supabase = await createServerSupabaseClient()

  const { data: farmers } = await supabase.from("farmers").select("district")

  // Count farmers by district
  const districtCounts =
    farmers?.reduce(
      (acc, farmer) => {
        const district = farmer.district || "Unknown"
        acc[district] = (acc[district] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ) || {}

  const territoryData = Object.entries(districtCounts).map(([district, count]) => ({
    name: district,
    value: count,
  }))

  const COLORS = ["#8b5cf6", "#3b82f6", "#22c55e", "#facc15", "#f97316", "#ef4444"]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Territory Performance</CardTitle>
        <p className="text-sm text-muted-foreground">Farmer distribution by district</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={territoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {territoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
