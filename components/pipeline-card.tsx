"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Phone, MapPin, Wheat, Clock, ArrowRight } from "lucide-react"
import { UpdateLeadStatusDialog } from "@/components/update-lead-status-dialog"
import { LeadDetailsDialog } from "@/components/lead-details-dialog"
import { useRouter } from "next/navigation"
import type { Lead, Farmer } from "@/lib/types"

interface PipelineCardProps {
  lead: Lead & { farmer: Farmer }
  daysInStage: number
  urgencyColor: string
}

export function PipelineCard({ lead, daysInStage, urgencyColor }: PipelineCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const router = useRouter()

  const getCropColor = (cropType: string | null) => {
    if (!cropType) return "bg-gray-100 text-gray-800"

    switch (cropType.toLowerCase()) {
      case "wheat":
        return "bg-yellow-100 text-yellow-800"
      case "rice":
        return "bg-green-100 text-green-800"
      case "cotton":
        return "bg-blue-100 text-blue-800"
      case "sugarcane":
        return "bg-purple-100 text-purple-800"
      case "mustard":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getNextStatus = (currentStatus: string) => {
    const statusFlow = {
      new: "contacted",
      contacted: "interested",
      interested: "qualified",
      qualified: "negotiation",
      negotiation: "won",
    }
    return statusFlow[currentStatus as keyof typeof statusFlow]
  }

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        leadId: lead.id,
        currentStatus: lead.status,
      }),
    )
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open details if clicking on the arrow button
    if ((e.target as HTMLElement).closest("button")) {
      return
    }
    setShowDetails(true)
  }

  const nextStatus = getNextStatus(lead.status)

  return (
    <>
      <Card
        className={`border-l-4 ${urgencyColor} hover:shadow-md transition-all cursor-pointer ${
          isDragging ? "opacity-50 rotate-2" : ""
        }`}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={handleCardClick}
      >
        <CardContent className="p-3 space-y-2">
          {/* Farmer Info */}
          <div>
            <h4 className="font-semibold text-foreground text-sm leading-tight">{lead.farmer?.name || "Unknown"}</h4>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-0.5">
              <Phone className="h-3 w-3" />
              <span>{lead.farmer?.phone}</span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="truncate">
              {lead.farmer?.village}, {lead.farmer?.district}
            </span>
          </div>

          {/* Crop Info */}
          <div className="flex items-center justify-between">
            <Badge className={`text-xs px-2 py-0.5 ${getCropColor(lead.farmer?.crop_type)}`}>
              {lead.farmer?.crop_type || "N/A"}
            </Badge>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Wheat className="h-3 w-3" />
              <span>{lead.farmer?.acreage || 0}ac</span>
            </div>
          </div>

          {/* Notes */}
          {lead.notes && (
            <p className="text-xs text-muted-foreground line-clamp-1 bg-background/50 p-1.5 rounded text-ellipsis">
              {lead.notes}
            </p>
          )}

          {/* Time in Stage */}
          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{daysInStage}d</span>
            </div>

            {/* Quick Action */}
            {nextStatus && (
              <UpdateLeadStatusDialog leadId={lead.id} currentStatus={lead.status}>
                <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={(e) => e.stopPropagation()}>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </UpdateLeadStatusDialog>
            )}
          </div>
        </CardContent>
      </Card>

      <LeadDetailsDialog lead={lead} open={showDetails} onOpenChange={setShowDetails} />
    </>
  )
}
