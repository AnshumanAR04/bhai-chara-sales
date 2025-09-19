"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createBrowserSupabaseClient } from "@/lib/supabase"
import { Target, TrendingUp, Clock, IndianRupee } from "lucide-react"
import { useEffect, useState } from "react"

interface StatsData {
  activeOpportunities: number
  conversionRate: number
  avgDealCycle: number
  totalRevenue: number
}

export function PipelineStats() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const supabase = createBrowserSupabaseClient()

        const [{ data: leads }, { data: purchases }] = await Promise.all([
          supabase.from("leads").select("status, created_at"),
          supabase.from("purchases").select("quantity, product:products(price)"),
        ])

        // Calculate pipeline metrics
        const totalOpportunities = leads?.length || 0
        const activeOpportunities = leads?.filter((lead) => !["won", "lost"].includes(lead.status)).length || 0
        const wonLeads = leads?.filter((lead) => lead.status === "won").length || 0
        const conversionRate = totalOpportunities > 0 ? (wonLeads / totalOpportunities) * 100 : 0

        // Calculate total pipeline value (estimated)
        const totalRevenue =
          purchases?.reduce((sum, purchase) => {
            return sum + (purchase.quantity || 0) * (purchase.product?.price || 0)
          }, 0) || 0

        // Calculate average deal cycle (days from creation to won)
        const wonLeadsWithDates = leads?.filter((lead) => lead.status === "won") || []
        const avgDealCycle =
          wonLeadsWithDates.length > 0
            ? wonLeadsWithDates.reduce((sum, lead) => {
                const daysSinceCreated = Math.floor(
                  (Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24),
                )
                return sum + daysSinceCreated
              }, 0) / wonLeadsWithDates.length
            : 0

        setStats({
          activeOpportunities,
          conversionRate,
          avgDealCycle,
          totalRevenue,
        })
      } catch (error) {
        console.error("Error fetching pipeline stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-12 bg-muted animate-pulse rounded mb-1" />
              <div className="h-3 w-16 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return <div>Error loading stats</div>
  }

  const statsConfig = [
    {
      title: "Active Opportunities",
      value: stats.activeOpportunities,
      icon: Target,
      description: "In pipeline",
    },
    {
      title: "Conversion Rate",
      value: `${stats.conversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      description: "Lead to sale",
    },
    {
      title: "Avg Deal Cycle",
      value: `${Math.round(stats.avgDealCycle)}d`,
      icon: Clock,
      description: "Days to close",
    },
    {
      title: "Pipeline Value",
      value: `₹${(stats.totalRevenue / 1000).toFixed(0)}K`,
      icon: IndianRupee,
      description: "Total revenue",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {statsConfig.map((stat, index) => {
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
