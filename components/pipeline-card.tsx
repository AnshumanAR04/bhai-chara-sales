"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Phone, MapPin, Wheat, Clock, ArrowRight } from "lucide-react"
import { UpdateLeadStatusDialog } from "@/components/update-lead-status-dialog"
import type { Lead, Farmer } from "@/lib/types"

interface PipelineCardProps {
  lead: Lead & { farmer: Farmer }
  daysInStage: number
  urgencyColor: string
}

export function PipelineCard({ lead, daysInStage, urgencyColor }: PipelineCardProps) {
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

  const nextStatus = getNextStatus(lead.status)

  return (
    <Card className={`border-l-4 ${urgencyColor} hover:shadow-md transition-shadow cursor-pointer`}>
      <CardContent className="p-4 space-y-3">
        {/* Farmer Info */}
        <div>
          <h4 className="font-semibold text-foreground text-sm">{lead.farmer?.name || "Unknown"}</h4>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
            <Phone className="h-3 w-3" />
            <span>{lead.farmer?.phone}</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>
            {lead.farmer?.village}, {lead.farmer?.district}
          </span>
        </div>

        {/* Crop Info */}
        <div className="flex items-center justify-between">
          <Badge className={`text-xs ${getCropColor(lead.farmer?.crop_type)}`}>{lead.farmer?.crop_type || "N/A"}</Badge>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Wheat className="h-3 w-3" />
            <span>{lead.farmer?.acreage || 0}ac</span>
          </div>
        </div>

        {/* Notes */}
        {lead.notes && (
          <p className="text-xs text-muted-foreground line-clamp-2 bg-background/50 p-2 rounded">{lead.notes}</p>
        )}

        {/* Time in Stage */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{daysInStage}d in stage</span>
          </div>

          {/* Quick Action */}
          {nextStatus && (
            <UpdateLeadStatusDialog leadId={lead.id} currentStatus={lead.status}>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                <ArrowRight className="h-3 w-3" />
              </Button>
            </UpdateLeadStatusDialog>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
