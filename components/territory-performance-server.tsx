import { createServerSupabaseClient } from "@/lib/supabase"
import { TerritoryPerformanceClient } from "./territory-performance-client"

export async function TerritoryPerformance() {
  const supabase = await createServerSupabaseClient()

  // Fetch territory data
  const { data: farmers } = await supabase.from("farmers").select("district")
  const { data: purchases } = await supabase
    .from("purchases")
    .select("quantity, farmer:farmers(district), product:products(price)")

  // Calculate territory performance
  const territoryData: { [key: string]: { farmers: number; revenue: number } } = {}

  farmers?.forEach((farmer) => {
    const district = farmer.district || "Unknown"
    if (!territoryData[district]) {
      territoryData[district] = { farmers: 0, revenue: 0 }
    }
    territoryData[district].farmers++
  })

  purchases?.forEach((purchase) => {
    const district = purchase.farmer?.district || "Unknown"
    if (!territoryData[district]) {
      territoryData[district] = { farmers: 0, revenue: 0 }
    }
    territoryData[district].revenue += (purchase.quantity || 0) * (purchase.product?.price || 0)
  })

  const chartData = Object.entries(territoryData).map(([district, data]) => ({
    district,
    farmers: data.farmers,
    revenue: data.revenue,
  }))

  return <TerritoryPerformanceClient data={chartData} />
}
