"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface ChartData {
  source: string
  total: number
  converted: number
  conversionRate: string
}

interface LeadConversionAnalysisClientProps {
  data: ChartData[]
}

export function LeadConversionAnalysisClient({ data }: LeadConversionAnalysisClientProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Lead Conversion Analysis</CardTitle>
        <p className="text-sm text-muted-foreground">Conversion rates by lead source</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="source" tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
              formatter={(value, name) => [
                name === "total" ? `${value} leads` : `${value} converted`,
                name === "total" ? "Total Leads" : "Converted",
              ]}
            />
            <Bar dataKey="total" fill="#3b82f6" name="total" />
            <Bar dataKey="converted" fill="#22c55e" name="converted" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
