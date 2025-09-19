"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface EditProductDialogProps {
  productId: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditProductDialog({ productId, open, onOpenChange }: EditProductDialogProps) {
  const [loading, setLoading] = useState(false)
  const [loadingProduct, setLoadingProduct] = useState(true)
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
  })

  useEffect(() => {
    if (open && productId) {
      const loadProduct = async () => {
        setLoadingProduct(true)
        try {
          const supabase = createClient()
          const { data, error } = await supabase.from("products").select("*").eq("id", productId).single()

          if (error) throw error

          setFormData({
            name: data.name || "",
            description: data.description || "",
            price: data.price?.toString() || "",
            category: data.category || "",
          })
        } catch (error) {
          console.error("Error loading product:", error)
        } finally {
          setLoadingProduct(false)
        }
      }

      loadProduct()
    }
  }, [open, productId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from("products")
        .update({
          name: formData.name,
          description: formData.description || null,
          price: formData.price ? Number.parseFloat(formData.price) : null,
          category: formData.category || null,
        })
        .eq("id", productId)

      if (error) throw error

      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating product:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>

        {loadingProduct ? (
          <div className="py-8 text-center">Loading product...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Product Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price (₹)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Enter category"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Product"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
