"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, X } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"

export function ProductsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const currentCategory = searchParams.get("category") || ""

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("products")
          .select("category")
          .not("category", "is", null)
          .order("category")

        if (error) throw error

        // Get unique categories
        const uniqueCategories = [...new Set(data.map((item) => item.category).filter(Boolean))]
        setCategories(uniqueCategories)
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (category === "all") {
      params.delete("category")
    } else {
      params.set("category", category)
    }
    params.delete("page")
    router.push(`/products?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push("/products")
  }

  const hasFilters = currentCategory

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Category Filter */}
        <Select value={currentCategory || "all"} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {loading ? (
              <SelectItem value="loading" disabled>
                Loading categories...
              </SelectItem>
            ) : (
              categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters - Only show when filters are active and hide after clearing */}
      {hasFilters && (
        <Button variant="outline" onClick={clearFilters} size="sm">
          <X className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  )
}
