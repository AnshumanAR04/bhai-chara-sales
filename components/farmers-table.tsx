import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createServerSupabaseClient } from "@/lib/supabase"
import { formatDistanceToNow } from "date-fns"
import { Phone, MapPin, Edit, Trash2, Eye, Wheat } from "lucide-react"
import { FarmerDetailsDialog } from "@/components/farmer-details-dialog"

interface FarmersTableProps {
  searchParams: {
    crop?: string
    district?: string
    search?: string
    page?: string
  }
}

export async function FarmersTable({ searchParams }: FarmersTableProps) {
  const supabase = await createServerSupabaseClient()

  let query = supabase
    .from("farmers")
    .select(`
      id,
      name,
      phone,
      village,
      district,
      crop_type,
      acreage,
      created_at
    `)
    .order("created_at", { ascending: false })

  // Apply filters
  if (searchParams.crop) {
    query = query.eq("crop_type", searchParams.crop)
  }

  if (searchParams.district) {
    query = query.eq("district", searchParams.district)
  }

  if (searchParams.search) {
    query = query.or(`name.ilike.%${searchParams.search}%,phone.ilike.%${searchParams.search}%`)
  }

  const { data: farmers, error } = await query

  if (error) {
    console.error("Error fetching farmers:", error)
    return <div>Error loading farmers</div>
  }

  const getCropColor = (cropType: string | null) => {
    if (!cropType) return "bg-gray-100 text-gray-800"

    switch (cropType.toLowerCase()) {
      case "wheat":
        return "bg-yellow-100 text-yellow-800"
      case "rice":
        return "bg-green-100 text-green-800"
      case "cotton":
        return "bg-blue-100 text-blue-800"
      case "sugarcane":
        return "bg-purple-100 text-purple-800"
      case "mustard":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Farmers ({farmers?.length || 0})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Farmer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Crop & Acreage</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {farmers?.map((farmer) => (
                <TableRow key={farmer.id}>
                  <TableCell className="font-medium">
                    <div>
                      <p className="font-semibold text-foreground">{farmer.name}</p>
                      <p className="text-sm text-muted-foreground">ID: {farmer.id}</p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{farmer.phone}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        <p>{farmer.village || "N/A"}</p>
                        <p className="text-muted-foreground">{farmer.district || "N/A"}</p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <Badge className={getCropColor(farmer.crop_type)}>{farmer.crop_type || "N/A"}</Badge>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Wheat className="h-3 w-3" />
                        <span>{farmer.acreage || 0} acres</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(farmer.created_at), { addSuffix: true })}
                    </p>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <FarmerDetailsDialog farmerId={farmer.id}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </FarmerDetailsDialog>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {(!farmers || farmers.length === 0) && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No farmers found matching your criteria.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
