import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// For client components only (no next/headers dependency)
export const createClientSupabaseClient = () => {
  return createClientComponentClient()
}

export type Tables = {
  cards: {
    id: string
    name: string
    balance: number
    created_by: string
    created_at: string
    updated_at: string
  }
  profiles: {
    id: string
    role: string
    created_at: string
    updated_at: string
  }
  transactions: {
    id: string
    card_id: string
    amount: number
    type: "credit" | "debit"
    processed_by: string
    created_at: string
  }
}
