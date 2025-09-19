import { createServerSupabaseClient } from "@/lib/supabase"
import { LeadsTable } from "@/components/leads-table"

interface LeadsTableServerProps {
  searchParams: {
    status?: string
    page?: string
  }
}

export async function LeadsTableServer({ searchParams }: LeadsTableServerProps) {
  const supabase = await createServerSupabaseClient()

  let query = supabase
    .from("leads")
    .select(`
      id,
      status,
      notes,
      created_at,
      farmer:farmers(
        id,
        name,
        phone,
        village,
        district,
        crop_type,
        acreage
      )
    `)
    .order("created_at", { ascending: false })

  if (searchParams.status) {
    query = query.eq("status", searchParams.status)
  }

  const { data: leads, error } = await query

  if (error) {
    console.error("Error fetching leads:", error)
    return <div>Error loading leads</div>
  }

  return <LeadsTable leads={leads || []} />
}
