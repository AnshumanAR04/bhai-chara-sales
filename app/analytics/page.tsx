import { Suspense } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { AnalyticsOverview } from "@/components/analytics-overview"
import { SalesPerformanceChartServer } from "@/components/sales-performance-chart-server"
import { LeadConversionAnalysisServer } from "@/components/lead-conversion-analysis-server"
import { TerritoryAnalyticsServer } from "@/components/territory-analytics-server"
import { CropAnalyticsServer } from "@/components/crop-analytics-server"
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
            <SalesPerformanceChartServer searchParams={searchParams} />
          </Suspense>

          <Suspense fallback={<ChartSkeleton />}>
            <LeadConversionAnalysisServer searchParams={searchParams} />
          </Suspense>
        </div>

        {/* Territory and Crop Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Suspense fallback={<ChartSkeleton />}>
            <TerritoryAnalyticsServer searchParams={searchParams} />
          </Suspense>

          <Suspense fallback={<ChartSkeleton />}>
            <CropAnalyticsServer searchParams={searchParams} />
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
