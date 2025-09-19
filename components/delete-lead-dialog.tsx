"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { AlertTriangle } from "lucide-react"

interface DeleteLeadDialogProps {
  leadId: number
  farmerId: number
  farmerName: string
  children: React.ReactNode
}

export function DeleteLeadDialog({ leadId, farmerId, farmerName, children }: DeleteLeadDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleteFarmer, setDeleteFarmer] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      if (deleteFarmer) {
        // Delete farmer (this will cascade delete the lead due to foreign key constraint)
        const { error: farmerError } = await supabase.from("farmers").delete().eq("id", farmerId)

        if (farmerError) throw farmerError
      } else {
        // Delete only the lead
        const { error: leadError } = await supabase.from("leads").delete().eq("id", leadId)

        if (leadError) throw leadError
      }

      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error deleting lead:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Delete Lead
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. Are you sure you want to delete this lead?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm">
              <strong>Farmer:</strong> {farmerName}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="deleteFarmer"
              checked={deleteFarmer}
              onCheckedChange={(checked) => setDeleteFarmer(checked as boolean)}
            />
            <Label htmlFor="deleteFarmer" className="text-sm">
              Also delete farmer record (this will remove all associated leads and data)
            </Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading} variant="destructive">
              {loading ? "Deleting..." : "Delete Lead"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
