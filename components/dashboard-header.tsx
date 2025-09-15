import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BarChart3, Plus, Bell, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function DashboardHeader() {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Bhai Chara Sales</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link
              href="/leads"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Leads
            </Link>
            <Link
              href="/farmers"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Farmers
            </Link>
            <Link
              href="/pipeline"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Pipeline
            </Link>
            <Link
              href="/products"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Products
            </Link>
            <Link
              href="/analytics"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Analytics
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search farmers, leads..." className="pl-10 w-64" />
            </div>

            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4" />
            </Button>

            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
