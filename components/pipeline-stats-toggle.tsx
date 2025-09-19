"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import { PipelineStats } from "@/components/pipeline-stats"

export function PipelineStatsToggle() {
  const [showStats, setShowStats] = useState(false)

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setShowStats(!showStats)} className="flex items-center gap-2">
        {showStats ? "Hide Stats" : "Show Stats"}
        {showStats ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      {showStats && (
        <div className="mt-4 mb-6">
          <PipelineStats />
        </div>
      )}
    </>
  )
}
