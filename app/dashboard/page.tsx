import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import DashboardTabs from "./dashboard-tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useUserContext } from "@/contexts/userContext";

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();

    

  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      redirect("/login");
    }

    const userId = session.user.id;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq('id', userId);  

    const { data: booth, error: boothError } = await supabase
      .from("booths")
      .select("name")
      .eq("id", userId) 
      .maybeSingle();

    if (profileError || boothError) {
      console.error("Erro ao buscar dados:", profileError || boothError);
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">
              Gerencie os créditos e operações da quermesse
            </p>
          </div>
          <Card>
            <CardContent className="p-6">
              <p>
                Ocorreu um erro ao carregar seu perfil. Por favor, tente
                novamente mais tarde.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    const userRole = profile[0]?.role || "user";
    const boothName = booth?.name || "Usuário";

    return (
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader>
           <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-black mt-3">
            Gerencie os créditos e operações da quermesse
          </p>
        </div>
        </div>
        </CardHeader>
        <CardContent>
          <DashboardTabs
            userRole={userRole}
            userName={boothName}
            userId={userId}
          />
        </CardContent>
        
      </Card>
    );
  } catch (error) {
    console.error("Erro inesperado no dashboard:", error);
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Gerencie os créditos e operações da quermesse
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <p>
              Ocorreu um erro ao carregar o dashboard. Por favor, tente
              novamente mais tarde.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
}
