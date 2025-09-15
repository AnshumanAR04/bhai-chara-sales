"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase"
import { formatDistanceToNow, format } from "date-fns"
import { Phone, MapPin, Wheat, Calendar } from "lucide-react"
import type { Lead, Farmer, Purchase } from "@/lib/types"

interface OpportunityDetailsDialogProps {
  leadId: number
  children: React.ReactNode
}

interface LeadWithDetails extends Lead {
  farmer: Farmer
  purchases: (Purchase & { product: { name: string; price: number } })[]
}

export function OpportunityDetailsDialog({ leadId, children }: OpportunityDetailsDialogProps) {
  const [open, setOpen] = useState(false)
  const [opportunity, setOpportunity] = useState<LeadWithDetails | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && !opportunity) {
      fetchOpportunityDetails()
    }
  }, [open, leadId])

  const fetchOpportunityDetails = async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("leads")
        .select(`
          *,
          farmer:farmers(*),
          farmer.purchases(*, product:products(name, price))
        `)
        .eq("id", leadId)
        .single()

      if (error) throw error
      setOpportunity(data)
    } catch (error) {
      console.error("Error fetching opportunity details:", error)
    } finally {
      setLoading(false)
    }
  }

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

  const getDaysInStage = (createdAt: string) => {
    return Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))
  }

  const totalPurchaseValue =
    opportunity?.farmer?.purchases?.reduce((sum, purchase) => {
      return sum + (purchase.quantity || 0) * (purchase.product?.price || 0)
    }, 0) || 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Opportunity Details</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">Loading opportunity details...</div>
        ) : opportunity ? (
          <div className="space-y-6">
            {/* Opportunity Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Opportunity Overview</span>
                  <Badge className={getStatusColor(opportunity.status)}>{opportunity.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Farmer</p>
                    <p className="font-semibold">{opportunity.farmer?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Days in Stage</p>
                    <p className="font-semibold">{getDaysInStage(opportunity.created_at)} days</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(opportunity.created_at), "MMM dd, yyyy")}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <span>{formatDistanceToNow(new Date(opportunity.created_at), { addSuffix: true })}</span>
                  </div>
                </div>

                {opportunity.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="text-sm bg-muted p-3 rounded-lg">{opportunity.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Farmer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Farmer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Contact</p>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{opportunity.farmer?.phone}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {opportunity.farmer?.village}, {opportunity.farmer?.district}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Crop Type</p>
                    <div className="flex items-center space-x-2">
                      <Wheat className="h-4 w-4 text-muted-foreground" />
                      <span>{opportunity.farmer?.crop_type || "N/A"}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Acreage</p>
                    <span>{opportunity.farmer?.acreage || 0} acres</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Purchase History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Purchase History</span>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-lg font-bold">₹{totalPurchaseValue.toLocaleString()}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {opportunity.farmer?.purchases && opportunity.farmer.purchases.length > 0 ? (
                  <div className="space-y-3">
                    {opportunity.farmer.purchases.map((purchase) => (
                      <div key={purchase.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-1">
                          <p className="font-medium">{purchase.product?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {purchase.quantity} | Unit Price: ₹{purchase.product?.price}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            ₹{((purchase.quantity || 0) * (purchase.product?.price || 0)).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(purchase.purchase_date), "MMM dd, yyyy")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No purchase history</p>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8">Opportunity not found</div>
        )}
      </DialogContent>
    </Dialog>
  )
}
