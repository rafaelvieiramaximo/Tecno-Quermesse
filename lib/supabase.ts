import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// For server components only (App Router)
export const createServerSupabaseClient = () => {
  const cookieStore = cookies();
  return createServerComponentClient({ cookies: () => cookieStore });
};

// For client components (both App Router and Pages Router)
export const createClientSupabaseClient = () => {
  return createClientComponentClient();
};

export type Tables = {
  cards: {
    id: string;
    name: string;
    balance: number;
    created_by: string;
    created_at: string;
    updated_at: string;
  };
  profiles: {
    id: string;
    role: string;
    created_at: string;
    updated_at: string;
  };
  transactions: {
    id: string;
    card_id: string;
    amount: number;
    type: "credit" | "debit";
    processed_by: string;
    created_at: string;
  };
  booths: {
    id: string;
    name: string;
    created_by: string;
    updated_at: string;
  };
};
