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
import { MinusCircle, Camera, CameraOff, CheckCircle, AlertCircle, User, CreditCard, PlusCircle } from "lucide-react"
import QrScanner from "qr-scanner"

interface CreditManagerProps {
  userId: string
}

export default function CreditManager({ userId }: CreditManagerProps) {
  const [successMessage, setSuccessMessage] = useState<string>("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const qrScannerRef = useRef<QrScanner | null>(null)
  const { toast } = useToast();

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

  const handleDebitCredit = async () => {
    if (!cardId) {
      toast({
        title: "Erro",
        description: "Por favor, informe o ID do cartão",
        variant: "destructive",
      })
      return
    }

    if (amount <= 0) {
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

      const newBalance = card.balance + amount

      // Update card balance
      const { error: updateError } = await supabase.from("cards").update({ balance: newBalance }).eq("id", cardId)

      if (updateError) {
        throw updateError
      } else {
        setSuccessMessage(`Crédito de R$ ${amount.toFixed(2)} foi registrado com sucesso`)
        setTimeout(() =>{
          setSuccessMessage("")
          window.location.reload()
        }, 2000)
      }


      // // Record transaction
      // const { error: transactionError } = await supabase.from("transactions").insert({
      //   card_id: cardId,
      //   card_name: cardInfo.name,
      //   amount,
      //   type: "credit",
      //   processed_by: "caixa",
      // })
      // if (transactionError) throw transactionError

      // toast({
      //   title: "Sucesso",
      //   description: `Crédito de R$ ${amount.toFixed(2)} foi registrado com sucesso`,
      // })

      // Refresh card info
      fetchCardInfo(cardId)
      setAmount(0)
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao registrar crédito",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const clearCardData = () => {
    setCardId("")
    setCardInfo(null)
    setLastScannedCode("")
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Sistema de Crédito</h1>
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

      {/* Processamento do Crédito */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5" />
            Registrar Crédito
          </CardTitle>
          <CardDescription>Informe o valor a ser creditado no cartão</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor a Creditar (R$)</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="0,00"
            />
          </div>

          {cardInfo && amount > 0 && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm">Saldo atual:</span>
                <span className="font-medium">R$ {cardInfo.balance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Valor do crédito:</span>
                <span className="font-medium text-green-600">+ R$ {amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t mt-2">
                <span className="text-sm font-medium">Saldo após crédito:</span>
                <span className={`font-bold ${cardInfo.balance + amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                  R$ {(cardInfo.balance + amount).toFixed(2)}
                </span>
              </div>
            </div>
          )}
          {successMessage && (
            <Alert className="bg-green-50 border-green-200 text-green-800 mb-2">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}
          <Button
            onClick={() => { handleDebitCredit() }}
            disabled={loading || !cardInfo || amount <= 0}
            className="w-full"
            size="lg"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            {loading ? "Processando..." : `Registrar Crédito de R$ ${amount.toFixed(2)}`}
          </Button>
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
            2. <strong>Manual:</strong> Ou digite o ID do cartão no campo de entrada
          </p>
          <p>
            3. <strong>Verificação:</strong> Confirme as informações do cartão exibidas
          </p>
          <p>
            4. <strong>Crédito:</strong> Informe o valor e clique em "Registrar Crédito"
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
