import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export const supabase = createClientComponentClient<Database>()

type Database = {
  public: {
    Tables: Tables
  }
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
    type: "debit"
    processed_by: string
    created_at: string
  }
}
