import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createServerSupabaseClient } from "@/lib/supabase"
import { Users, MapPin, Wheat, TrendingUp } from "lucide-react"

export async function FarmersStats() {
  const supabase = await createServerSupabaseClient()

  const [{ count: totalFarmers }, { data: farmers }, { data: purchases }] = await Promise.all([
    supabase.from("farmers").select("*", { count: "exact", head: true }),
    supabase.from("farmers").select("crop_type, acreage, district"),
    supabase.from("purchases").select("farmer_id").eq("purchase_date", new Date().toISOString().split("T")[0]),
  ])

  // Calculate total acreage
  const totalAcreage = farmers?.reduce((sum, farmer) => sum + (farmer.acreage || 0), 0) || 0

  // Count unique districts
  const uniqueDistricts = new Set(farmers?.map((f) => f.district).filter(Boolean)).size

  // Count active farmers (those with recent purchases)
  const activeFarmers = new Set(purchases?.map((p) => p.farmer_id)).size

  const stats = [
    {
      title: "Total Farmers",
      value: totalFarmers || 0,
      icon: Users,
      description: "Registered farmers",
    },
    {
      title: "Total Acreage",
      value: `${totalAcreage.toFixed(1)}`,
      icon: Wheat,
      description: "Acres under cultivation",
    },
    {
      title: "Districts Covered",
      value: uniqueDistricts,
      icon: MapPin,
      description: "Geographic reach",
    },
    {
      title: "Active This Month",
      value: activeFarmers,
      icon: TrendingUp,
      description: "Recent purchases",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
