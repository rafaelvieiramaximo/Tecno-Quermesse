"use client"

import { useEffect, useState } from "react"
import { createClientSupabaseClient } from "@/lib/supabase-client"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Search, RefreshCw } from "lucide-react"

interface TransactionHistoryProps {
  userId: string
  userRole: string
}

export default function TransactionHistory({ userId, userRole }: TransactionHistoryProps) {
  const supabase = createClientSupabaseClient()
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [isFiltering, setIsFiltering] = useState(false)

  

  const fetchTransactions = async (filterValue = "") => {
    setLoading(true)
    try {
      const {data: dados} = await supabase.from('transactions').select("*")

      if (filterValue) {
        // First, try to filter by card ID
        const { data: cardData, error } = await supabase
  .from("transactions")
  .select("*")
  .or(`card_name.ilike.%${filterValue}%,type.ilike.%${filterValue}%`)
  .limit(50);


  console.log(cardData);  
  

        if (cardData && cardData.length > 0) {
          return setTransactions(cardData)
        } else {
          setTransactions([])
          setLoading(false)
          return
        }
      }

      return setTransactions(dados || []);
    } catch (error) {
      console.error("Error fetching transactions:", error)
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilter = () => {
    setIsFiltering(true)
    fetchTransactions(filter)
  }

  const clearFilter = () => {
    setFilter("")
    setIsFiltering(false)
    fetchTransactions("")
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1 space-y-2">
          <Label htmlFor="filter">Filtrar por ID do Cartão ou Nome</Label>
          <div className="flex gap-2">
            <Input
              id="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Digite o ID ou nome do cartão"
              className="flex-1"
            />
            <Button onClick={handleFilter} disabled={loading}>
              <Search className="h-4 w-4 mr-2" /> Filtrar
            </Button>
            {isFiltering && (
              <Button variant="outline" onClick={clearFilter} disabled={loading}>
                <RefreshCw className="h-4 w-4 mr-2" /> Limpar
              </Button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : transactions.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground">
            {isFiltering ? "Nenhuma transação encontrada com o filtro aplicado" : "Nenhuma transação encontrada"}
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Cartão</TableHead>
                <TableHead>ID do Cartão</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction, idx) => {
                return(
                <TableRow key={idx}>
                  <TableCell className="font-medium">{formatDate(transaction.created_at)}</TableCell>
                  <TableCell>{transaction?.card_name || "Desconhecido"}</TableCell>
                  <TableCell className="font-mono text-xs">{transaction.card_id.substring(0, 8)}...</TableCell>
                  <TableCell>
                    <Badge variant={transaction.type === "credit" ? "default" : "destructive"}>
                      {transaction.type === "credit" ? "Crédito" : "Débito"}
                    </Badge>
                  </TableCell>
                  <TableCell className="">{transaction.processed_by}</TableCell>
                  <TableCell className="text-right">R$ {transaction.amount.toFixed(2)}</TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
