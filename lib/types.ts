export interface Farmer {
  id: number
  name: string
  phone: string
  village?: string
  district?: string
  crop_type?: string
  acreage?: number
  created_at: string
}

export interface Lead {
  id: number
  farmer_id: number
  status: string
  notes?: string
  created_at: string
}

export interface Product {
  id: number
  name: string
  description?: string
  price?: number
  category?: string
  created_at: string
}

export interface Purchase {
  id: number
  farmer_id: number
  product_id: number
  quantity?: number
  purchase_date: string
}
