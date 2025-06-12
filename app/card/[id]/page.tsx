"use client"

import * as React from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function CardPage({ params }: { params: { id: string } }) {
  const [card, setCard] = React.useState<any>(null)
  const [transactions, setTransactions] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const supabase = createClientComponentClient()
  const cardId = params.id

  React.useEffect(() => {
    async function fetchCardData() {
      setLoading(true)
      try {
        // Buscar informações do cartão
        const { data: cardData, error: cardError } = await supabase.from("cards").select("*").eq("id", cardId).single()

        if (cardError) {
          throw new Error("Cartão não encontrado")
        }

        setCard(cardData)

        // Buscar transações do cartão
        const { data: transactionsData, error: transactionsError } = await supabase
          .from("transactions")
          .select("*")
          .eq("card_id", cardId)
          .order("created_at", { ascending: false })

        if (transactionsError) {
          console.error("Erro ao buscar transações:", transactionsError)
        } else {
          setTransactions(transactionsData || [])
        }
      } catch (err: any) {
        console.error("Erro:", err)
        setError(err.message || "Ocorreu um erro ao buscar os dados do cartão")
      } finally {
        setLoading(false)
      }
    }

    fetchCardData()
  }, [cardId, supabase])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-10">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !card) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold text-red-500">Cartão não encontrado</h2>
              <p className="text-muted-foreground mt-2">O cartão com o ID fornecido não foi encontrado no sistema.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <CardTitle>Informações do Cartão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nome:</span>
              <span className="font-medium">{card.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Saldo Atual:</span>
              <span className="font-bold text-lg">R$ {card.balance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ID do Cartão:</span>
              <span className="text-sm font-mono">{card.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Criado em:</span>
              <span>{formatDate(card.created_at)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Histórico de Transações</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.created_at)}</TableCell>
                      <TableCell>
                        <Badge variant={transaction.type === "credit" ? "default" : "destructive"}>
                          {transaction.type === "credit" ? "Crédito" : "Débito"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">R$ {transaction.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Nenhuma transação encontrada.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
