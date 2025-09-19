"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Phone, MapPin, Calendar, User, Wheat, Edit, Save, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface LeadDetailsDialogProps {
  lead: {
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
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LeadDetailsDialog({ lead, open, onOpenChange }: LeadDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    status: lead.status,
    notes: lead.notes || "",
    farmerName: lead.farmer?.name || "",
    farmerPhone: lead.farmer?.phone || "",
    village: lead.farmer?.village || "",
    district: lead.farmer?.district || "",
    cropType: lead.farmer?.crop_type || "",
    acreage: lead.farmer?.acreage?.toString() || "",
  })
  const router = useRouter()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800"
      case "contacted":
        return "bg-yellow-100 text-yellow-800"
      case "interested":
        return "bg-green-100 text-green-800"
      case "qualified":
        return "bg-purple-100 text-purple-800"
      case "negotiation":
        return "bg-orange-100 text-orange-800"
      case "won":
        return "bg-emerald-100 text-emerald-800"
      case "lost":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleSave = async () => {
    if (!lead.farmer?.id) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      // Update farmer details
      const { error: farmerError } = await supabase
        .from("farmers")
        .update({
          name: formData.farmerName,
          phone: formData.farmerPhone,
          village: formData.village,
          district: formData.district,
          crop_type: formData.cropType || null,
          acreage: formData.acreage ? Number.parseFloat(formData.acreage) : null,
        })
        .eq("id", lead.farmer.id)

      if (farmerError) throw farmerError

      // Update lead details
      const { error: leadError } = await supabase
        .from("leads")
        .update({
          status: formData.status,
          notes: formData.notes || null,
        })
        .eq("id", lead.id)

      if (leadError) throw leadError

      setIsEditing(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating lead:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      status: lead.status,
      notes: lead.notes || "",
      farmerName: lead.farmer?.name || "",
      farmerPhone: lead.farmer?.phone || "",
      village: lead.farmer?.village || "",
      district: lead.farmer?.district || "",
      cropType: lead.farmer?.crop_type || "",
      acreage: lead.farmer?.acreage?.toString() || "",
    })
    setIsEditing(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Lead Details</span>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Lead Status */}
          <div className="space-y-2">
            <Label>Lead Status</Label>
            {isEditing ? (
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="interested">Interested</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
            )}
          </div>

          {/* Lead Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            {isEditing ? (
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Add notes about this lead..."
                rows={3}
              />
            ) : (
              <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md">{lead.notes || "No notes added"}</p>
            )}
          </div>

          <Separator />

          {/* Farmer Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Farmer Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                {isEditing ? (
                  <Input
                    value={formData.farmerName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, farmerName: e.target.value }))}
                  />
                ) : (
                  <p className="text-sm p-2 bg-muted rounded">{lead.farmer?.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone
                </Label>
                {isEditing ? (
                  <Input
                    value={formData.farmerPhone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, farmerPhone: e.target.value }))}
                  />
                ) : (
                  <p className="text-sm p-2 bg-muted rounded">{lead.farmer?.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Village
                </Label>
                {isEditing ? (
                  <Input
                    value={formData.village}
                    onChange={(e) => setFormData((prev) => ({ ...prev, village: e.target.value }))}
                  />
                ) : (
                  <p className="text-sm p-2 bg-muted rounded">{lead.farmer?.village}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>District</Label>
                {isEditing ? (
                  <Input
                    value={formData.district}
                    onChange={(e) => setFormData((prev) => ({ ...prev, district: e.target.value }))}
                  />
                ) : (
                  <p className="text-sm p-2 bg-muted rounded">{lead.farmer?.district}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Wheat className="h-4 w-4" />
                  Crop Type
                </Label>
                {isEditing ? (
                  <Input
                    value={formData.cropType}
                    onChange={(e) => setFormData((prev) => ({ ...prev, cropType: e.target.value }))}
                  />
                ) : (
                  <p className="text-sm p-2 bg-muted rounded">{lead.farmer?.crop_type || "Not specified"}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Acreage</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={formData.acreage}
                    onChange={(e) => setFormData((prev) => ({ ...prev, acreage: e.target.value }))}
                    placeholder="0"
                  />
                ) : (
                  <p className="text-sm p-2 bg-muted rounded">
                    {lead.farmer?.acreage ? `${lead.farmer.acreage} acres` : "Not specified"}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Lead Metadata */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Created
            </Label>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
