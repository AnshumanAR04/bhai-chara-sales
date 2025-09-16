"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface ChartData {
  territory: string
  leads: number
  conversions: number
  revenue: number
  conversionRate: string
}

interface TerritoryAnalyticsClientProps {
  data: ChartData[]
}

export function TerritoryAnalyticsClient({ data }: TerritoryAnalyticsClientProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Territory Performance</CardTitle>
        <p className="text-sm text-muted-foreground">Sales performance by territory</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="territory" tick={{ fontSize: 12 }} className="text-muted-foreground" />
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
            <Bar dataKey="leads" fill="#3b82f6" name="leads" />
            <Bar dataKey="conversions" fill="#22c55e" name="conversions" />
            <Bar dataKey="revenue" fill="#8b5cf6" name="revenue" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
