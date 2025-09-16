"use client"

import { Suspense } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { AnalyticsOverview } from "@/components/analytics-overview"
import { SalesPerformanceChart } from "@/components/sales-performance-chart"
import { LeadConversionAnalysis } from "@/components/lead-conversion-analysis"
import { TerritoryAnalytics } from "@/components/territory-analytics"
import { CropAnalytics } from "@/components/crop-analytics"
import { TimeRangeSelector } from "@/components/time-range-selector"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface AnalyticsPageProps {
  searchParams: {
    timeRange?: string
    startDate?: string
    endDate?: string
  }
}

export default function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics & Insights</h1>
            <p className="text-muted-foreground">Deep dive into your sales performance and trends</p>
          </div>
          <TimeRangeSelector />
        </div>

        {/* Analytics Overview */}
        <Suspense fallback={<OverviewSkeleton />}>
          <AnalyticsOverview searchParams={searchParams} />
        </Suspense>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Suspense fallback={<ChartSkeleton />}>
            <SalesPerformanceChart searchParams={searchParams} />
          </Suspense>

          <Suspense fallback={<ChartSkeleton />}>
            <LeadConversionAnalysis searchParams={searchParams} />
          </Suspense>
        </div>

        {/* Territory and Crop Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Suspense fallback={<ChartSkeleton />}>
            <TerritoryAnalytics searchParams={searchParams} />
          </Suspense>

          <Suspense fallback={<ChartSkeleton />}>
            <CropAnalytics searchParams={searchParams} />
          </Suspense>
        </div>
      </main>
    </div>
  )
}

function OverviewSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-12 mb-2" />
            <Skeleton className="h-3 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ChartSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-64 w-full" />
      </CardContent>
    </Card>
  )
}
