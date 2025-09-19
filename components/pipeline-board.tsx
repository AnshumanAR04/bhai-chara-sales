"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PipelineCard } from "@/components/pipeline-card"
import { PipelineDropZone } from "@/components/pipeline-drop-zone"
import { createClient } from "@/lib/supabase"

interface Lead {
  id: string
  status: string
  notes: string | null
  created_at: string
  farmer: {
    id: string
    name: string
    phone: string
    village: string
    district: string
    crop_type: string
    acreage: number
  } | null
}

interface PipelineBoardProps {
  leads: Lead[]
}

const PIPELINE_STAGES = [
  { id: "new", title: "New Leads", color: "bg-blue-50 border-blue-200", headerColor: "text-blue-700" },
  { id: "contacted", title: "Contacted", color: "bg-yellow-50 border-yellow-200", headerColor: "text-yellow-700" },
  { id: "interested", title: "Interested", color: "bg-green-50 border-green-200", headerColor: "text-green-700" },
  { id: "qualified", title: "Qualified", color: "bg-purple-50 border-purple-200", headerColor: "text-purple-700" },
  { id: "negotiation", title: "Negotiation", color: "bg-orange-50 border-orange-200", headerColor: "text-orange-700" },
  { id: "won", title: "Won", color: "bg-emerald-50 border-emerald-200", headerColor: "text-emerald-700" },
]

export function PipelineBoard({ leads: initialLeads }: PipelineBoardProps) {
  const [leads, setLeads] = useState(initialLeads)
  const supabase = createClient()

  const handleLeadStatusUpdate = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("leads").update({ status: newStatus }).eq("id", leadId)

      if (error) {
        console.error("Error updating lead status:", error)
        return false
      }

      // Update local state
      setLeads((prevLeads) => prevLeads.map((lead) => (lead.id === leadId ? { ...lead, status: newStatus } : lead)))

      return true
    } catch (error) {
      console.error("Error updating lead status:", error)
      return false
    }
  }

  // Group leads by status
  const leadsByStatus = PIPELINE_STAGES.reduce(
    (acc, stage) => {
      acc[stage.id] = leads.filter((lead) => lead.status === stage.id)
      return acc
    },
    {} as Record<string, Lead[]>,
  )

  const getDaysInStage = (createdAt: string) => {
    return Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))
  }

  const getUrgencyColor = (status: string, daysInStage: number) => {
    if (status === "new" && daysInStage > 3) return "border-l-red-500"
    if (status === "contacted" && daysInStage > 7) return "border-l-orange-500"
    if (["qualified", "negotiation"].includes(status) && daysInStage > 14) return "border-l-yellow-500"
    return "border-l-transparent"
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {PIPELINE_STAGES.map((stage) => {
        const stageLeads = leadsByStatus[stage.id] || []

        return (
          <PipelineDropZone key={stage.id} targetStatus={stage.id} onLeadStatusUpdate={handleLeadStatusUpdate}>
            <Card className={`${stage.color} min-h-[500px]`}>
              <CardHeader className="pb-3">
                <CardTitle className={`text-sm font-semibold ${stage.headerColor} flex items-center justify-between`}>
                  <span>{stage.title}</span>
                  <Badge variant="secondary" className="ml-2">
                    {stageLeads.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stageLeads.map((lead) => {
                  const daysInStage = getDaysInStage(lead.created_at)
                  const urgencyColor = getUrgencyColor(lead.status, daysInStage)

                  return (
                    <PipelineCard key={lead.id} lead={lead} daysInStage={daysInStage} urgencyColor={urgencyColor} />
                  )
                })}

                {stageLeads.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No leads in this stage</p>
                    <p className="text-xs mt-1">Drop leads here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </PipelineDropZone>
        )
      })}
    </div>
  )
}
