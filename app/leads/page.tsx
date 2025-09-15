import { Suspense } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { LeadsTable } from "@/components/leads-table"
import { LeadsFilters } from "@/components/leads-filters"
import { LeadsStats } from "@/components/leads-stats"
import { AddLeadDialog } from "@/components/add-lead-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface LeadsPageProps {
  searchParams: {
    status?: string
    search?: string
    page?: string
  }
}

export default function LeadsPage({ searchParams }: LeadsPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Lead Management</h1>
            <p className="text-muted-foreground">Track and manage your sales leads</p>
          </div>
          <AddLeadDialog />
        </div>

        {/* Lead Stats */}
        <Suspense fallback={<StatsSkeleton />}>
          <LeadsStats />
        </Suspense>

        {/* Filters */}
        <LeadsFilters />

        {/* Leads Table */}
        <Suspense fallback={<TableSkeleton />}>
          <LeadsTable searchParams={searchParams} />
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

function TableSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
