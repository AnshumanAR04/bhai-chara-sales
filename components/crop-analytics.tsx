import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createServerSupabaseClient } from "@/lib/supabase"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface CropAnalyticsProps {
  searchParams: {
    timeRange?: string
    startDate?: string
    endDate?: string
  }
}

export async function CropAnalytics({ searchParams }: CropAnalyticsProps) {
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

  // Fetch crop performance data
  const { data: cropData } = await supabase
    .from("purchases")
    .select(`
      quantity,
      purchase_date,
      product:products(price),
      farmer:farmers(crop_type, acreage)
    `)
    .gte("purchase_date", startDate.toISOString())

  // Calculate metrics by crop type
  const cropMetrics =
    cropData?.reduce(
      (acc, purchase) => {
        const cropType = purchase.farmer?.crop_type || "Unknown"
        const revenue = (purchase.quantity || 0) * (purchase.product?.price || 0)

        if (!acc[cropType]) {
          acc[cropType] = {
            revenue: 0,
            purchases: 0,
            farmers: new Set(),
            totalAcreage: 0,
          }
        }

        acc[cropType].revenue += revenue
        acc[cropType].purchases += 1
        acc[cropType].farmers.add(purchase.farmer?.id)
        acc[cropType].totalAcreage += purchase.farmer?.acreage || 0

        return acc
      },
      {} as Record<string, { revenue: number; purchases: number; farmers: Set<any>; totalAcreage: number }>,
    ) || {}

  // Convert to chart data
  const chartData = Object.entries(cropMetrics)
    .map(([cropType, metrics]) => ({
      crop: cropType,
      revenue: metrics.revenue,
      purchases: metrics.purchases,
      farmers: metrics.farmers.size,
      avgRevenuePerAcre: metrics.totalAcreage > 0 ? metrics.revenue / metrics.totalAcreage : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Crop Performance Analysis</CardTitle>
        <p className="text-sm text-muted-foreground">Revenue and engagement by crop type</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="crop" tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
              formatter={(value, name) => [
                name === "revenue" ? `₹${value.toLocaleString()}` : value,
                name === "revenue"
                  ? "Revenue"
                  : name === "purchases"
                    ? "Purchases"
                    : name === "farmers"
                      ? "Farmers"
                      : "Avg Revenue/Acre",
              ]}
            />
            <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="revenue" />
          </BarChart>
        </ResponsiveContainer>

        {/* Crop Performance Summary */}
        <div className="mt-4 space-y-2">
          <h4 className="font-medium text-sm">Crop Performance Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chartData.slice(0, 4).map((crop) => (
              <div key={crop.crop} className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-sm">{crop.crop}</h5>
                  <span className="text-sm font-bold">₹{crop.revenue.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <div>
                    <p className="font-medium">{crop.purchases}</p>
                    <p>Purchases</p>
                  </div>
                  <div>
                    <p className="font-medium">{crop.farmers}</p>
                    <p>Farmers</p>
                  </div>
                  <div>
                    <p className="font-medium">₹{crop.avgRevenuePerAcre.toFixed(0)}</p>
                    <p>Per Acre</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
