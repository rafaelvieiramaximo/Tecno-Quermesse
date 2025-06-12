"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import QrCodeGenerator from "@/components/qr-code-generator";
import DebitManager from "@/components/debit-manager";
import TransactionHistory from "@/components/transaction-history";
import { useState, useEffect } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import ProductPage from "@/components/products";
import SearchingQR from "@/components/searching-qr";
import CreditManager from "@/components/credit-manager";

interface DashboardTabsProps {
  userRole: string;
  userId: string;
  userName: string;
}

export default function DashboardTabs({
  userRole,
  userId,
  userName,
}: DashboardTabsProps) {
  const [mounted, setMounted] = useState(false);

  // Only render tabs after component has mounted to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
  console.log("userRole:", userRole);
}, [userRole]);

  if (!mounted) {
    return <div>Carregando...</div>;
  }


  // Se o usuário for do tipo "booth", mostrar apenas a aba de Registrar Débitos
  // if (userRole === "") {
  //   return (
  //     <Card className="p-6">
  //       <h3 className="text-xl font-semibold mb-4">Registrar Débitos</h3>
  //       <ErrorBoundary
  //         fallback={<div>Erro ao carregar o gerenciador de débitos.</div>}
  //       >
  //         <DebitManager userId={userId} />
  //       </ErrorBoundary>
  //     </Card>
  //   );
  //

  // Para outros tipos de usuário, mostrar as abas normalmente
  return (
    <Tabs defaultValue={userRole === "booth" ? "debits" : "overview"} className="space-y-4">
      {userRole == "user" ? (
        <TabsList className="grid grid-cols-2 md:grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="credit">Inserir Saldo</TabsTrigger>
        </TabsList>
      ) : (
        <TabsList className="grid grid-cols-2 md:grid-cols-2">
          <TabsTrigger value="debits">Registrar Débitos</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          
        </TabsList>
      )}

      {(userRole === "user") && (
      <TabsContent value="credit" className="space-y-4">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Inserir Saldo</h3>
          <ErrorBoundary
            fallback={<div>Erro ao carregar o gerador de QR Code.</div>}
          >
            <CreditManager userId={userId} />
          </ErrorBoundary>
        </Card>
      </TabsContent>)}

      {(userRole === "user") && (
      <TabsContent value="overview" className="space-y-4">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Gerar QR Code</h3>
          <ErrorBoundary
            fallback={<div>Erro ao carregar o gerador de QR Code.</div>}
          >
            <QrCodeGenerator userId={userId} />
          </ErrorBoundary>
        </Card>
      </TabsContent>
  )}
      {(userRole === "booth") && (
        <TabsContent value="debits" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Registrar Débitos</h3>
            <ErrorBoundary
              fallback={<div>Erro ao carregar o gerenciador de débitos.</div>}
            >
              <DebitManager userName={userName} />
            </ErrorBoundary>
          </Card>
        </TabsContent>
      )}

      {userRole === "booth" && (
        <TabsContent value="products" className="space-y-4">
          <Card className="p-6">
            <ProductPage />
          </Card>
        </TabsContent>
      )}
      {(userRole === "user") && (
      <TabsContent value="history" className="space-y-4">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">
            Histórico de Transações
          </h3>
          <ErrorBoundary
            fallback={<div>Erro ao carregar o histórico de transações.</div>}
          >
            <TransactionHistory userId={userId} userRole={userRole} />
          </ErrorBoundary>
        </Card>
      </TabsContent>
      )}
      </Tabs>
  );
}
