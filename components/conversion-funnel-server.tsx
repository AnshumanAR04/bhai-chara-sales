import { createServerSupabaseClient } from "@/lib/supabase"
import { ConversionFunnelClient } from "./conversion-funnel-client"

export async function ConversionFunnel() {
  const supabase = await createServerSupabaseClient()

  // Fetch leads data
  const { data: leads } = await supabase.from("leads").select("status")

  // Calculate funnel data
  const totalLeads = leads?.length || 0
  const qualifiedLeads = leads?.filter((lead) => lead.status !== "new").length || 0
  const proposalsSent = leads?.filter((lead) => ["proposal", "negotiation", "won"].includes(lead.status)).length || 0
  const wonLeads = leads?.filter((lead) => lead.status === "won").length || 0

  const funnelData = [
    { stage: "Leads", count: totalLeads, percentage: 100 },
    { stage: "Qualified", count: qualifiedLeads, percentage: totalLeads ? (qualifiedLeads / totalLeads) * 100 : 0 },
    { stage: "Proposals", count: proposalsSent, percentage: totalLeads ? (proposalsSent / totalLeads) * 100 : 0 },
    { stage: "Won", count: wonLeads, percentage: totalLeads ? (wonLeads / totalLeads) * 100 : 0 },
  ]

  return <ConversionFunnelClient data={funnelData} />
}
