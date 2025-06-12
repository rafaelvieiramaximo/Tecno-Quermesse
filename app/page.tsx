import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export default async function HomePage() {
  const supabase = createServerSupabaseClient()

  // Verificar se o usuário está autenticado
  const { data } = await supabase.auth.getSession()

  // Redirecionar com base no estado de autenticação
  if (data.session) {
    // Se o usuário estiver autenticado, redirecionar para o dashboard
    redirect("/dashboard")
  } else {
    // Se o usuário não estiver autenticado, redirecionar para a página de login
    redirect("/login")
  }

  // Este código nunca será executado devido ao redirecionamento acima,
  // mas é necessário para satisfazer o TypeScript
  return null
}
