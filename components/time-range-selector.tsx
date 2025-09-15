"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "lucide-react"

export function TimeRangeSelector() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentTimeRange = searchParams.get("timeRange") || "30d"

  const handleTimeRangeChange = (timeRange: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("timeRange", timeRange)

    // Remove custom date params when selecting preset ranges
    if (timeRange !== "custom") {
      params.delete("startDate")
      params.delete("endDate")
    }

    router.push(`/analytics?${params.toString()}`)
  }

  return (
    <Select value={currentTimeRange} onValueChange={handleTimeRangeChange}>
      <SelectTrigger className="w-48">
        <Calendar className="h-4 w-4 mr-2" />
        <SelectValue placeholder="Select time range" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="7d">Last 7 days</SelectItem>
        <SelectItem value="30d">Last 30 days</SelectItem>
        <SelectItem value="90d">Last 90 days</SelectItem>
        <SelectItem value="6m">Last 6 months</SelectItem>
        <SelectItem value="1y">Last year</SelectItem>
        <SelectItem value="all">All time</SelectItem>
      </SelectContent>
    </Select>
  )
}
