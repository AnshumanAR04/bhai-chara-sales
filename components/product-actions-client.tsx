"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import { EditProductDialog } from "@/components/edit-product-dialog"
import { DeleteProductDialog } from "@/components/delete-product-dialog"

interface ProductActionsClientProps {
  productId: number
  productName: string
}

export function ProductActionsClient({ productId, productName }: ProductActionsClientProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setEditOpen(true)}>
        <Edit className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(true)}>
        <Trash2 className="h-4 w-4" />
      </Button>

      <EditProductDialog productId={productId} open={editOpen} onOpenChange={setEditOpen} />

      <DeleteProductDialog
        productId={productId}
        productName={productName}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  )
}
