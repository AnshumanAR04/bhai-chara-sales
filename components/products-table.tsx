import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createServerSupabaseClient } from "@/lib/supabase"
import { formatDistanceToNow } from "date-fns"
import { Package, IndianRupee, Edit, Trash2, TrendingUp } from "lucide-react"
import { ProductDetailsDialog } from "@/components/product-details-dialog"

interface ProductsTableProps {
  searchParams: {
    category?: string
    search?: string
    page?: string
  }
}

export async function ProductsTable({ searchParams }: ProductsTableProps) {
  const supabase = await createServerSupabaseClient()

  let query = supabase
    .from("products")
    .select(`
      id,
      name,
      description,
      price,
      category,
      created_at
    `)
    .order("created_at", { ascending: false })

  // Apply filters
  if (searchParams.category) {
    query = query.eq("category", searchParams.category)
  }

  if (searchParams.search) {
    query = query.or(`name.ilike.%${searchParams.search}%,description.ilike.%${searchParams.search}%`)
  }

  const { data: products, error } = await query

  if (error) {
    console.error("Error fetching products:", error)
    return <div>Error loading products</div>
  }

  // Fetch sales data for each product
  const { data: salesData } = await supabase
    .from("purchases")
    .select("product_id, quantity")
    .in("product_id", products?.map((p) => p.id) || [])

  // Calculate sales metrics for each product
  const productSales =
    salesData?.reduce(
      (acc, sale) => {
        const productId = sale.product_id
        acc[productId] = {
          totalSold: (acc[productId]?.totalSold || 0) + (sale.quantity || 0),
          totalRevenue: (acc[productId]?.totalRevenue || 0) + (sale.quantity || 0) * 0, // Will be calculated with product price
        }
        return acc
      },
      {} as Record<number, { totalSold: number; totalRevenue: number }>,
    ) || {}

  // Calculate revenue with product prices
  products?.forEach((product) => {
    if (productSales[product.id]) {
      productSales[product.id].totalRevenue = productSales[product.id].totalSold * (product.price || 0)
    }
  })

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Products ({products?.length || 0})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Sales Performance</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products?.map((product) => {
                const sales = productSales[product.id] || { totalSold: 0, totalRevenue: 0 }

                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      <div>
                        <p className="font-semibold text-foreground">{product.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {product.description || "No description"}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge className={getCategoryColor(product.category)}>{product.category || "N/A"}</Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{product.price?.toLocaleString() || 0}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Package className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{sales.totalSold} units sold</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-medium">₹{sales.totalRevenue.toLocaleString()}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(product.created_at), { addSuffix: true })}
                      </p>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <ProductDetailsDialog productId={product.id}>
                          <Button variant="ghost" size="sm">
                            <Package className="h-4 w-4" />
                          </Button>
                        </ProductDetailsDialog>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {(!products || products.length === 0) && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products found matching your criteria.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
