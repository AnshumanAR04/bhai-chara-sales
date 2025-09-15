"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase"
import { formatDistanceToNow, format } from "date-fns"
import { Phone, MapPin, Wheat, Calendar, ShoppingCart, Target } from "lucide-react"
import type { Farmer, Lead, Purchase } from "@/lib/types"

interface FarmerDetailsDialogProps {
  farmerId: number
  children: React.ReactNode
}

interface FarmerWithRelations extends Farmer {
  leads: Lead[]
  purchases: (Purchase & { product: { name: string; price: number } })[]
}

export function FarmerDetailsDialog({ farmerId, children }: FarmerDetailsDialogProps) {
  const [open, setOpen] = useState(false)
  const [farmer, setFarmer] = useState<FarmerWithRelations | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && !farmer) {
      fetchFarmerDetails()
    }
  }, [open, farmerId])

  const fetchFarmerDetails = async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("farmers")
        .select(`
          *,
          leads(*),
          purchases(*, product:products(name, price))
        `)
        .eq("id", farmerId)
        .single()

      if (error) throw error
      setFarmer(data)
    } catch (error) {
      console.error("Error fetching farmer details:", error)
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

  const totalPurchaseValue =
    farmer?.purchases?.reduce((sum, purchase) => {
      return sum + (purchase.quantity || 0) * (purchase.product?.price || 0)
    }, 0) || 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Farmer Details</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">Loading farmer details...</div>
        ) : farmer ? (
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-semibold">{farmer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{farmer.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {farmer.village}, {farmer.district}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Registered</p>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(farmer.created_at), "MMM dd, yyyy")}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Crop Type</p>
                    <div className="flex items-center space-x-2">
                      <Wheat className="h-4 w-4 text-muted-foreground" />
                      <span>{farmer.crop_type || "N/A"}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Acreage</p>
                    <span>{farmer.acreage || 0} acres</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Purchase Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <ShoppingCart className="h-5 w-5" />
                  <span>Purchase Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Purchases</p>
                    <p className="text-2xl font-bold">{farmer.purchases?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold">₹{totalPurchaseValue.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Leads */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Recent Leads ({farmer.leads?.length || 0})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {farmer.leads && farmer.leads.length > 0 ? (
                  <div className="space-y-3">
                    {farmer.leads.slice(0, 5).map((lead) => (
                      <div key={lead.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-1">
                          <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                          <p className="text-sm text-muted-foreground">{lead.notes || "No notes"}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No leads found</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Purchases */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Purchases</CardTitle>
              </CardHeader>
              <CardContent>
                {farmer.purchases && farmer.purchases.length > 0 ? (
                  <div className="space-y-3">
                    {farmer.purchases.slice(0, 5).map((purchase) => (
                      <div key={purchase.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-1">
                          <p className="font-medium">{purchase.product?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {purchase.quantity} | Price: ₹{purchase.product?.price}
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
                  <p className="text-muted-foreground">No purchases found</p>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8">Farmer not found</div>
        )}
      </DialogContent>
    </Dialog>
  )
}
