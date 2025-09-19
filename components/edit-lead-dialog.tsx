"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface EditLeadDialogProps {
  leadId: number
  farmer: {
    id: number
    name: string
    phone: string
    village: string | null
    district: string | null
    crop_type: string | null
    acreage: number | null
  }
  status: string
  notes: string | null
  children: React.ReactNode
}

export function EditLeadDialog({ leadId, farmer, status, notes, children }: EditLeadDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    farmerName: farmer.name,
    phone: farmer.phone,
    village: farmer.village || "",
    district: farmer.district || "",
    cropType: farmer.crop_type || "",
    acreage: farmer.acreage?.toString() || "",
    status: status,
    notes: notes || "",
  })

  // Reset form data when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        farmerName: farmer.name,
        phone: farmer.phone,
        village: farmer.village || "",
        district: farmer.district || "",
        cropType: farmer.crop_type || "",
        acreage: farmer.acreage?.toString() || "",
        status: status,
        notes: notes || "",
      })
    }
  }, [open, farmer, status, notes])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      // Update farmer information
      const { error: farmerError } = await supabase
        .from("farmers")
        .update({
          name: formData.farmerName,
          phone: formData.phone,
          village: formData.village || null,
          district: formData.district || null,
          crop_type: formData.cropType || null,
          acreage: formData.acreage ? Number.parseFloat(formData.acreage) : null,
        })
        .eq("id", farmer.id)

      if (farmerError) throw farmerError

      // Update lead information
      const { error: leadError } = await supabase
        .from("leads")
        .update({
          status: formData.status,
          notes: formData.notes || null,
        })
        .eq("id", leadId)

      if (leadError) throw leadError

      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating lead:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="farmerName">Farmer Name *</Label>
              <Input
                id="farmerName"
                value={formData.farmerName}
                onChange={(e) => setFormData({ ...formData, farmerName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="village">Village</Label>
              <Input
                id="village"
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Input
                id="district"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cropType">Crop Type</Label>
              <Input
                id="cropType"
                value={formData.cropType}
                onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="acreage">Acreage</Label>
              <Input
                id="acreage"
                type="number"
                step="0.1"
                value={formData.acreage}
                onChange={(e) => setFormData({ ...formData, acreage: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
