"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, X } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"

export function PipelineFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [districts, setDistricts] = useState<string[]>([])
  const [crops, setCrops] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const currentDistrict = searchParams.get("district") || ""
  const currentCrop = searchParams.get("crop") || ""

  useEffect(() => {
    const fetchFiltersData = async () => {
      const supabase = createClient()

      try {
        // Fetch unique districts
        const { data: districtData } = await supabase
          .from("farmers")
          .select("district")
          .not("district", "is", null)
          .not("district", "eq", "")

        // Fetch unique crops
        const { data: cropData } = await supabase
          .from("farmers")
          .select("crop_type")
          .not("crop_type", "is", null)
          .not("crop_type", "eq", "")

        if (districtData) {
          const uniqueDistricts = [...new Set(districtData.map((item) => item.district))].sort()
          setDistricts(uniqueDistricts)
        }

        if (cropData) {
          const uniqueCrops = [...new Set(cropData.map((item) => item.crop_type))].sort()
          setCrops(uniqueCrops)
        }
      } catch (error) {
        console.error("Error fetching filter data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFiltersData()
  }, [])

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
            {loading ? (
              <SelectItem value="loading" disabled>
                Loading...
              </SelectItem>
            ) : (
              districts.map((district) => (
                <SelectItem key={district} value={district}>
                  {district}
                </SelectItem>
              ))
            )}
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
            {loading ? (
              <SelectItem value="loading" disabled>
                Loading...
              </SelectItem>
            ) : (
              crops.map((crop) => (
                <SelectItem key={crop} value={crop}>
                  {crop}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters - only show when filters are applied */}
      {hasFilters && (
        <Button variant="outline" onClick={clearFilters} size="sm">
          <X className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  )
}
