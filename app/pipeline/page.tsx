import { Suspense } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { PipelineBoardServer } from "@/components/pipeline-board-server"
import { PipelineStatsToggle } from "@/components/pipeline-stats-toggle"
import { PipelineFilters } from "@/components/pipeline-filters"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface PipelinePageProps {
  searchParams: {
    district?: string
    crop?: string
  }
}

export default function PipelinePage({ searchParams }: PipelinePageProps) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Header with Stats Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">Sales Pipeline</h1>
            <p className="text-muted-foreground text-sm">Track opportunities through the sales process</p>
          </div>
          <PipelineStatsToggle />
        </div>

        {/* Filters */}
        <Suspense fallback={<div className="h-16" />}>
          <PipelineFilters />
        </Suspense>

        {/* Pipeline Board */}
        <Suspense fallback={<BoardSkeleton />}>
          <PipelineBoardServer searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  )
}

function BoardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="h-96">
          <CardContent className="p-4">
            <Skeleton className="h-6 w-20 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
