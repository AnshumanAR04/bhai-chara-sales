import { createBrowserClient, createServerClient } from "@supabase/ssr"

// Client-side Supabase client
export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_BHAI_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)
}

// Server-side Supabase client
export async function createServerSupabaseClient() {
  const { cookies } = await import("next/headers")
  const cookieStore = cookies()

  return createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}
