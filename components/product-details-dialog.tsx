"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase"
import { format } from "date-fns"
import { Package, IndianRupee, Calendar, ShoppingCart, TrendingUp, Users } from "lucide-react"
import type { Product, Purchase, Farmer } from "@/lib/types"

interface ProductDetailsDialogProps {
  productId: number
  children: React.ReactNode
}

interface ProductWithSales extends Product {
  purchases: (Purchase & { farmer: Farmer })[]
}

export function ProductDetailsDialog({ productId, children }: ProductDetailsDialogProps) {
  const [open, setOpen] = useState(false)
  const [product, setProduct] = useState<ProductWithSales | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && !product) {
      fetchProductDetails()
    }
  }, [open, productId])

  const fetchProductDetails = async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          purchases(*, farmer:farmers(name, district))
        `)
        .eq("id", productId)
        .single()

      if (error) throw error
      setProduct(data)
    } catch (error) {
      console.error("Error fetching product details:", error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (category: string | null) => {
    if (!category) return "bg-gray-100 text-gray-800"

    switch (category.toLowerCase()) {
      case "seeds":
        return "bg-green-100 text-green-800"
      case "fertilizers":
        return "bg-blue-100 text-blue-800"
      case "pesticides":
        return "bg-red-100 text-red-800"
      case "tools":
        return "bg-yellow-100 text-yellow-800"
      case "equipment":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const totalUnitsSold = product?.purchases?.reduce((sum, purchase) => sum + (purchase.quantity || 0), 0) || 0
  const totalRevenue = totalUnitsSold * (product?.price || 0)
  const uniqueCustomers = new Set(product?.purchases?.map((p) => p.farmer_id)).size || 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Product Details</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">Loading product details...</div>
        ) : product ? (
          <div className="space-y-6">
            {/* Product Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Product Information</span>
                  <Badge className={getCategoryColor(product.category)}>{product.category || "N/A"}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-semibold">{product.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <div className="flex items-center space-x-2">
                      <IndianRupee className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{product.price?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                </div>

                {product.description && (
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="text-sm bg-muted p-3 rounded-lg">{product.description}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground">Added</p>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(product.created_at), "MMM dd, yyyy")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sales Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sales Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-bold">{totalUnitsSold}</p>
                    <p className="text-sm text-muted-foreground">Units Sold</p>
                  </div>

                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                  </div>

                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-bold">{uniqueCustomers}</p>
                    <p className="text-sm text-muted-foreground">Customers</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Purchases */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <ShoppingCart className="h-5 w-5" />
                  <span>Recent Purchases ({product.purchases?.length || 0})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {product.purchases && product.purchases.length > 0 ? (
                  <div className="space-y-3">
                    {product.purchases.slice(0, 10).map((purchase) => (
                      <div key={purchase.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-1">
                          <p className="font-medium">{purchase.farmer?.name || "Unknown Farmer"}</p>
                          <p className="text-sm text-muted-foreground">
                            {purchase.farmer?.district} • Quantity: {purchase.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            ₹{((purchase.quantity || 0) * (product.price || 0)).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(purchase.purchase_date), "MMM dd, yyyy")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No purchases yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8">Product not found</div>
        )}
      </DialogContent>
    </Dialog>
  )
}
