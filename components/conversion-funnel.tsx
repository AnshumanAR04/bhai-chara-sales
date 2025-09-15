import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createServerSupabaseClient } from "@/lib/supabase"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export async function ConversionFunnel() {
  const supabase = await createServerSupabaseClient()

  const { data: leads } = await supabase.from("leads").select("status")

  // Count leads by status
  const statusCounts =
    leads?.reduce(
      (acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ) || {}

  // Define funnel stages in order
  const funnelStages = [
    { stage: "New", count: statusCounts["new"] || 0, color: "#8b5cf6" },
    { stage: "Contacted", count: statusCounts["contacted"] || 0, color: "#3b82f6" },
    { stage: "Interested", count: statusCounts["interested"] || 0, color: "#22c55e" },
    { stage: "Qualified", count: statusCounts["qualified"] || 0, color: "#facc15" },
    { stage: "Negotiation", count: statusCounts["negotiation"] || 0, color: "#f97316" },
    { stage: "Won", count: statusCounts["won"] || 0, color: "#10b981" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Lead Conversion Funnel</CardTitle>
        <p className="text-sm text-muted-foreground">Track leads through the sales process</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={funnelStages} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="stage" tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
