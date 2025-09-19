"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { AlertTriangle } from "lucide-react"

interface DeleteProductDialogProps {
  productId: number
  productName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteProductDialog({ productId, productName, open, onOpenChange }: DeleteProductDialogProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setLoading(true)

    try {
      const supabase = createClient()

      await supabase.from("purchases").delete().eq("product_id", productId)
      await supabase.from("recommended_products").delete().eq("product_id", productId)

      // Then delete the product
      const { error } = await supabase.from("products").delete().eq("id", productId)

      if (error) throw error

      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error("Error deleting product:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Product
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{productName}"? This action cannot be undone and will also remove all
            related purchase records and recommendations.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? "Deleting..." : "Delete Product"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
