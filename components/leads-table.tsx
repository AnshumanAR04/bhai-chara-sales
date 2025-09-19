"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDistanceToNow } from "date-fns"
import { Phone, MapPin, Edit, Trash2 } from "lucide-react"
import { UpdateLeadStatusDialog } from "@/components/update-lead-status-dialog"
import { EditLeadDialog } from "@/components/edit-lead-dialog"
import { DeleteLeadDialog } from "@/components/delete-lead-dialog"
import { LeadDetailsDialog } from "@/components/lead-details-dialog"

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
    crop_type: string | null
    acreage: number | null
  } | null
}

interface LeadsTableProps {
  leads: Lead[]
}

export function LeadsTable({ leads }: LeadsTableProps) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "contacted":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "interested":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "qualified":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200"
      case "negotiation":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200"
      case "won":
        return "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
      case "lost":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const getPriorityColor = (status: string, createdAt: string) => {
    const daysSinceCreated = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))

    if (status === "new" && daysSinceCreated > 3) return "border-l-red-500"
    if (status === "contacted" && daysSinceCreated > 7) return "border-l-orange-500"
    if (["qualified", "negotiation"].includes(status)) return "border-l-green-500"

    return "border-l-transparent"
  }

  const handleRowClick = (lead: Lead) => {
    setSelectedLead(lead)
    setDetailsOpen(true)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Leads ({leads?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Farmer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Crop Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads?.map((lead) => (
                  <TableRow
                    key={lead.id}
                    className={`border-l-4 ${getPriorityColor(lead.status, lead.created_at)} cursor-pointer hover:bg-muted/50`}
                    onClick={() => handleRowClick(lead)}
                  >
                    <TableCell className="font-medium">
                      <div>
                        <p className="font-semibold text-foreground">{lead.farmer?.name || "Unknown"}</p>
                        <p className="text-sm text-muted-foreground">ID: {lead.farmer?.id}</p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{lead.farmer?.phone}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          <p>{lead.farmer?.village}</p>
                          <p className="text-muted-foreground">{lead.farmer?.district}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{lead.farmer?.crop_type || "N/A"}</p>
                        <p className="text-muted-foreground">{lead.farmer?.acreage} acres</p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <UpdateLeadStatusDialog leadId={lead.id} currentStatus={lead.status}>
                        <Badge className={`cursor-pointer ${getStatusColor(lead.status)}`}>{lead.status}</Badge>
                      </UpdateLeadStatusDialog>
                    </TableCell>

                    <TableCell>
                      <p className="text-sm text-muted-foreground max-w-xs truncate">{lead.notes || "No notes"}</p>
                    </TableCell>

                    <TableCell>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                      </p>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                        <EditLeadDialog leadId={lead.id} farmer={lead.farmer} status={lead.status} notes={lead.notes}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </EditLeadDialog>

                        <DeleteLeadDialog
                          leadId={lead.id}
                          farmerId={lead.farmer?.id}
                          farmerName={lead.farmer?.name || "Unknown"}
                        >
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DeleteLeadDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {(!leads || leads.length === 0) && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No leads found matching your criteria.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedLead && <LeadDetailsDialog lead={selectedLead} open={detailsOpen} onOpenChange={setDetailsOpen} />}
    </>
  )
}
