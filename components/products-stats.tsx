import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createServerSupabaseClient } from "@/lib/supabase"
import { Package, TrendingUp, ShoppingCart, IndianRupee } from "lucide-react"

export async function ProductsStats() {
  const supabase = await createServerSupabaseClient()

  const [{ count: totalProducts }, { data: purchases }, { data: products }] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("purchases").select("quantity, product_id, product:products(price)"),
    supabase.from("products").select("price"),
  ])

  // Calculate total revenue
  const totalRevenue =
    purchases?.reduce((sum, purchase) => {
      return sum + (purchase.quantity || 0) * (purchase.product?.price || 0)
    }, 0) || 0

  // Calculate total units sold
  const totalUnitsSold = purchases?.reduce((sum, purchase) => sum + (purchase.quantity || 0), 0) || 0

  // Calculate average product price
  const avgProductPrice =
    products && products.length > 0
      ? products.reduce((sum, product) => sum + (product.price || 0), 0) / products.length
      : 0

  // Find best selling product
  const productSales =
    purchases?.reduce(
      (acc, purchase) => {
        const productId = purchase.product_id
        acc[productId] = (acc[productId] || 0) + (purchase.quantity || 0)
        return acc
      },
      {} as Record<number, number>,
    ) || {}

  const bestSellingProductId = Object.entries(productSales).reduce(
    (best, [productId, sales]) => (sales > best.sales ? { productId: Number(productId), sales } : best),
    { productId: 0, sales: 0 },
  )

  const stats = [
    {
      title: "Total Products",
      value: totalProducts || 0,
      icon: Package,
      description: "In catalog",
    },
    {
      title: "Total Revenue",
      value: `₹${(totalRevenue / 1000).toFixed(0)}K`,
      icon: IndianRupee,
      description: "All time sales",
    },
    {
      title: "Units Sold",
      value: totalUnitsSold.toLocaleString(),
      icon: ShoppingCart,
      description: "Total quantity",
    },
    {
      title: "Avg Price",
      value: `₹${avgProductPrice.toFixed(0)}`,
      icon: TrendingUp,
      description: "Per product",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
