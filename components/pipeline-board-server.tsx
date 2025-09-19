import { createServerSupabaseClient } from "@/lib/supabase"
import { PipelineBoard } from "@/components/pipeline-board"

interface PipelineBoardServerProps {
  searchParams: {
    district?: string
    crop?: string
  }
}

export async function PipelineBoardServer({ searchParams }: PipelineBoardServerProps) {
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

  if (searchParams.district) {
    query = query.eq("farmer.district", searchParams.district)
  }

  if (searchParams.crop) {
    query = query.eq("farmer.crop_type", searchParams.crop)
  }

  const { data: leads, error } = await query

  if (error) {
    console.error("Error fetching pipeline data:", error)
    return <div>Error loading pipeline</div>
  }

  const filteredLeads =
    leads?.filter((lead) => {
      // Remove leads without farmer data
      if (!lead.farmer) return false

      // Apply district filter if specified
      if (searchParams.district && lead.farmer.district !== searchParams.district) {
        return false
      }

      // Apply crop filter if specified
      if (searchParams.crop && lead.farmer.crop_type !== searchParams.crop) {
        return false
      }

      return true
    }) || []

  return <PipelineBoard leads={filteredLeads} />
}
