"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardTabs from "../dashboard/dashboard-tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function BarracaPage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // marca que já estamos no cliente

    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/login");
    } else {
      try {
        const userObj = JSON.parse(user);
        setUserId(userObj.userId || "");
        setName(userObj.name || "");
      } catch {
        setUserId("");
        setName("");
      }
    }
  }, [router]);

  if (!isClient) return null; // evita renderizar antes do cliente estar pronto

  return (
    <main style={{ padding: "2rem" }}>
      <Card className="bg-white/70 backdrop-blur-sm" >
        <CardHeader>
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-bold">Painel da {name}</h1>
            <p className="mb-6">Bem-vindo ao painel da sua barraca!</p>
          </div>
        </CardHeader>
        <CardContent>
          <DashboardTabs userRole="booth" userId={userId} userName={name} />
        </CardContent>
      </Card>
    </main>
  );
}
