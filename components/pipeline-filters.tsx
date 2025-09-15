"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, X } from "lucide-react"

export function PipelineFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentDistrict = searchParams.get("district") || ""
  const currentCrop = searchParams.get("crop") || ""

  const handleDistrictChange = (district: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (district === "all") {
      params.delete("district")
    } else {
      params.set("district", district)
    }
    router.push(`/pipeline?${params.toString()}`)
  }

  const handleCropChange = (crop: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (crop === "all") {
      params.delete("crop")
    } else {
      params.set("crop", crop)
    }
    router.push(`/pipeline?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push("/pipeline")
  }

  const hasFilters = currentDistrict || currentCrop

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* District Filter */}
        <Select value={currentDistrict || "all"} onValueChange={handleDistrictChange}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by district" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Districts</SelectItem>
            <SelectItem value="Sonipat">Sonipat</SelectItem>
            <SelectItem value="Panipat">Panipat</SelectItem>
            <SelectItem value="Karnal">Karnal</SelectItem>
            <SelectItem value="Kurukshetra">Kurukshetra</SelectItem>
            <SelectItem value="Ambala">Ambala</SelectItem>
            <SelectItem value="Yamunanagar">Yamunanagar</SelectItem>
            <SelectItem value="Hisar">Hisar</SelectItem>
          </SelectContent>
        </Select>

        {/* Crop Filter */}
        <Select value={currentCrop || "all"} onValueChange={handleCropChange}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by crop" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Crops</SelectItem>
            <SelectItem value="Wheat">Wheat</SelectItem>
            <SelectItem value="Rice">Rice</SelectItem>
            <SelectItem value="Cotton">Cotton</SelectItem>
            <SelectItem value="Sugarcane">Sugarcane</SelectItem>
            <SelectItem value="Mustard">Mustard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      {hasFilters && (
        <Button variant="outline" onClick={clearFilters} size="sm">
          <X className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  )
}
