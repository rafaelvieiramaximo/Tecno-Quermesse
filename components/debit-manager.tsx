"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase-client"
import { useToast } from "@/components/ui/use-toast"
import { MinusCircle, Camera, CameraOff, CheckCircle, AlertCircle, User, CreditCard } from "lucide-react"
import QrScanner from "qr-scanner"
import { useUserContext } from "@/contexts/userContext"

type ItemType = {
  id: string
  booth_id: string
  name: string
  price: number
}

interface DebitManagerProps {
  userName: string
}

export default function DebitManager({ userName }: DebitManagerProps) {
  const { userId, name } = useUserContext()
  const [items, setItems] = useState<ItemType[]>([]);
  const [itemQuantities, setItemQuantities] = useState<{ [itemId: string]: number }>({});
  const [successMessage, setSuccessMessage] = useState<string>("")


  const totalAmount = Object.entries(itemQuantities).reduce((acc, [itemId, qty]) => {
    const item = items.find(i => i.id === itemId);
    return item ? acc + item.price * qty : acc;
  }, 0);


  const { toast } = useToast()
  const videoRef = useRef<HTMLVideoElement>(null)
  const qrScannerRef = useRef<QrScanner | null>(null)

  // Estados existentes
  const [cardId, setCardId] = useState("")
  const [amount, setAmount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [cardInfo, setCardInfo] = useState<any>(null)

  // Novos estados para o scanner
  const [isScanning, setIsScanning] = useState(false)
  const [scanError, setScanError] = useState<string>("")
  const [hasCamera, setHasCamera] = useState<boolean>(true)
  const [lastScannedCode, setLastScannedCode] = useState<string>("")

  useEffect(() => {
    // Verifica se a câmera está disponível
    QrScanner.hasCamera().then(setHasCamera)

    return () => {
      // Cleanup scanner on unmount
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy()
      }
    }
  }, [])

  const startScanning = async () => {
    if (!videoRef.current || !hasCamera) return

    try {
      setScanError("")

      // Cria instância do scanner QR
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          // Verifica se o resultado é uma URL ou um ID direto
          let id = result.data

          // Se for uma URL, extrai o ID do cartão
          if (result.data.includes("/card/")) {
            const parts = result.data.split("/card/")
            id = parts[parts.length - 1]
          }

          setCardId(id)
          setLastScannedCode(result.data)
          fetchCardInfo(id)

          // Para de escanear após encontrar um código
          stopScanning()

          toast({
            title: "QR Code Escaneado",
            description: `Cartão ${id} detectado`,
          })
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: "environment",
        },
      )

      await qrScannerRef.current.start()
      setIsScanning(true)
    } catch (err) {
      setScanError("Falha ao iniciar a câmera. Verifique se você concedeu permissões de câmera.")
      console.error("Erro ao iniciar scanner QR:", err)
    }
  }

  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop()
      setIsScanning(false)
    }
  }

  const fetchCardInfo = async (id: string) => {
    if (!id) return

    try {
      const { data, error } = await supabase.from("cards").select("*").eq("id", id).single()

      if (error) throw error
      setCardInfo(data)
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Cartão não encontrado",
        variant: "destructive",
      })
      setCardInfo(null)
    }
  }

  const handleDebit = async () => {
    if (!cardId) {
      toast({
        title: "Erro",
        description: "Por favor, informe o ID do cartão",
        variant: "destructive",
      })
      return
    }

    if (totalAmount <= 0) {
      toast({
        title: "Erro",
        description: "O valor deve ser maior que zero",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Check card balance
      const { data: card, error: cardError } = await supabase.from("cards").select("balance").eq("id", cardId).single()

      if (cardError) throw cardError

      if (card.balance < totalAmount) {
        throw new Error("Saldo insuficiente")
      }

      const newBalance = card.balance - totalAmount

      // Update card balance
      const { error: updateError } = await supabase.from("cards").update({ balance: newBalance }).eq("id", cardId)

      if (updateError) {
        throw updateError
      } else {
        setSuccessMessage(`Saldo debitado com sucesso: R$ ${totalAmount}. Novo saldo: R$ ${newBalance.toFixed(2)}`)
        setTimeout(() => setSuccessMessage(""), 2000) // Clear message after 5 seconds
        setCardId("")
        setCardInfo(null)
        setItemQuantities({})
      }

      // Record transaction
      const { data: teste, error: transactionError } = await supabase.from("transactions").insert({
        card_id: cardId,
        card_name: cardInfo.name,
        amount: totalAmount,
        type: "debit",
        processed_by: userId,
      })

      if (transactionError) throw transactionError

      toast({
        title: "Sucesso",
        description: `Débito de R$ ${totalAmount.toFixed(2)} registrado com sucesso`,
      })

      // Refresh card info
      fetchCardInfo(cardId)
      setAmount(0)
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao registrar débito",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase
        .from("items")
        .select("id, booth_id, name, price")
        .eq("booth_id", userId);

      if (error) {
        console.error("Erro ao carregar itens:", error.message);
      } else {
        setItems(data || []);
      }

      setLoading(false);
    };

    if (userId) {
      fetchItems();
    }
  }, [userId]);


  const clearCardData = () => {
    setCardId("")
    setCardInfo(null)
    setLastScannedCode("")
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Sistema de Débito</h1>
        <p className="text-muted-foreground">Escaneie o QR Code do cartão ou digite o ID manualmente</p>
      </div>

      {/* Scanner QR Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Scanner QR Code
          </CardTitle>
          <CardDescription>Use a câmera para escanear o QR Code do cartão</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasCamera ? (
            <>
              <div className="relative">
                <video ref={videoRef} className="w-full h-64 bg-black rounded-lg object-cover" playsInline muted />
                {!isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                    <p className="text-white text-sm">Visualização da câmera aparecerá aqui</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {!isScanning ? (
                  <Button onClick={startScanning} className="flex-1">
                    <Camera className="w-4 h-4 mr-2" />
                    Iniciar Scanner
                  </Button>
                ) : (
                  <Button onClick={stopScanning} variant="destructive" className="flex-1">
                    <CameraOff className="w-4 h-4 mr-2" />
                    Parar Scanner
                  </Button>
                )}
              </div>

              {scanError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{scanError}</AlertDescription>
                </Alert>
              )}
            </>
          ) : (
            <Alert>
              <CameraOff className="h-4 w-4" />
              <AlertDescription>Nenhuma câmera foi detectada neste dispositivo.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Input Manual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Entrada Manual
          </CardTitle>
          <CardDescription>Digite o ID do cartão manualmente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="card-id">ID do Cartão</Label>
            <div className="flex gap-2">
              <Input
                id="card-id"
                value={cardId}
                onChange={(e) => {
                  setCardId(e.target.value)
                  if (e.target.value.length > 5) {
                    fetchCardInfo(e.target.value)
                  } else {
                    setCardInfo(null)
                  }
                }}
                placeholder="Digite o ID do cartão"
                className="flex-1"
              />
              {cardId && (
                <Button variant="outline" onClick={clearCardData}>
                  Limpar
                </Button>
              )}
            </div>
          </div>

          {lastScannedCode && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Último código escaneado:</span>
              </div>
              <p className="text-sm text-green-700 mt-1 font-mono break-all">{lastScannedCode}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações do Cartão */}
      {cardInfo && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações do Cartão
              </span>
              <Badge variant="secondary">Encontrado</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{cardInfo.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ID do Cartão</p>
                <p className="font-mono text-sm">{cardInfo.id}</p>
              </div>
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">Saldo Atual</p>
              <p className="text-2xl font-bold text-green-600">R$ {cardInfo.balance.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processamento do Débito */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MinusCircle className="w-5 h-5" />
            Registrar Débito
          </CardTitle>
          <CardDescription>Selecione os itens que estão sendo comprados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Itens disponíveis</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-2 border p-2 rounded">
                  <span className="text-sm flex-1">{item.name} — R$ {item.price.toFixed(2)}</span>
                  <Input
                    type="number"
                    min={0}
                    value={itemQuantities[item.id] || 0}
                    onChange={e => {
                      const qty = Math.max(0, Number(e.target.value));
                      setItemQuantities(prev => ({ ...prev, [item.id]: qty }));
                    }}
                    className="w-16"
                  />
                </div>
              ))}
            </div>
          </div>

          {cardInfo && (
            <div className="p-3 bg-muted rounded-lg space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Saldo atual:</span>
                <span className="font-medium">R$ {cardInfo.balance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total da compra:</span>
                <span className="font-bold text-green-700">R$ {totalAmount.toFixed(2)}</span>
              </div>
            </div>
          )}
          {successMessage && (
            <Alert className="bg-green-50 border-green-200 text-green-800 mb-2">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}
          <div className="flex justify-center">
            <Button className="flex-1 max-w-xs" onClick={handleDebit} disabled={loading || totalAmount <= 0 || !cardInfo}>
              Registrar Débito
            </Button>
          </div>
        </CardContent>
      </Card>


      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle>Como usar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            1. <><strong>Scanner:</strong> Clique em "Iniciar Scanner" e aponte a câmera para o QR Code</>
          </p>
          <p>
            2. <strong>Manual:</strong> Digite o ID do cartão no campo de entrada
          </p>
          <p>
            3. <strong>Verificação:</strong> Confirme as informações do cartão exibidas
          </p>
          <p>
            4. <strong>Débito:</strong> Informe o valor e clique em "Registrar Débito"
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
