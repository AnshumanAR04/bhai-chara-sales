import { Suspense } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { PipelineBoard } from "@/components/pipeline-board"
import { PipelineStats } from "@/components/pipeline-stats"
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
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Sales Pipeline</h1>
            <p className="text-muted-foreground">Track opportunities through the sales process</p>
          </div>
        </div>

        {/* Pipeline Stats */}
        <Suspense fallback={<StatsSkeleton />}>
          <PipelineStats />
        </Suspense>

        {/* Filters */}
        <PipelineFilters />

        {/* Pipeline Board */}
        <Suspense fallback={<BoardSkeleton />}>
          <PipelineBoard searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  )
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-12" />
          </CardContent>
        </Card>
      ))}
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
