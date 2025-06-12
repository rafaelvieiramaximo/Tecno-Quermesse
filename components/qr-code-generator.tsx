"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClientSupabaseClient } from "@/lib/supabase-client";
import { useToast } from "@/components/ui/use-toast";
import { Printer } from "lucide-react";
import  QRCode  from "qrcode";

interface QrCodeGeneratorProps {
  userId: string;
}

export default function QrCodeGenerator({ userId }: QrCodeGeneratorProps) {
  const supabase = createClientSupabaseClient();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [initialCredit, setInitialCredit] = useState<string>("");
  const [cardId, setCardId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState<string>("");

  const generateCard = async () => {
    if (!name) {
      toast({
        title: "Erro",
        description: "Por favor, informe um nome para o cartão",
        variant: "destructive",
      });
      return;
    }

    const creditValue = Number(initialCredit);

    if (initialCredit === "" || isNaN(creditValue)) {
      toast({
        title: "Erro",
        description: "Informe um valor de crédito válido.",
        variant: "destructive",
      });
      return;
    }

    if (creditValue === 0) {
      toast({
        title: "Erro",
        description: "O crédito inicial não pode ser 0.",
        variant: "destructive",
      });
      return;
    }

    if (creditValue < 0) {
      toast({
        title: "Erro",
        description: "O crédito inicial deve ser maior que zero.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("cards")
        .insert({
          name,
          balance: creditValue,
          created_by: userId,
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from("transactions").insert({
        card_id: data.id,
        card_name: name,
        amount: creditValue,
        type: "credit",
        processed_by: "caixa",
      });
      setCardId(data.id);
      toast({
        title: "Sucesso",
        description: "Cartão gerado com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao gerar cartão",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getQrCodeUrl = () => {
    if (!cardId) return "";
    return cardId;
  };

  useEffect(() => {
    if (cardId) {
      const generateQrCode = async () => {
        try {
          const url = getQrCodeUrl();
          const dataUrl = await QRCode.toDataURL(url);
          setQrImageUrl(dataUrl);
        } catch (err) {
          console.error("Erro ao gerar QR Code:", err);
        }
      };
      generateQrCode();
    }
  }, [cardId]);

  const printQRCode = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow || !qrImageUrl) return;

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code - Quermesse</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 400px;
            margin: 0 auto;
            text-align: center;
            border: 1px solid #ccc;
            padding: 20px;
          }
          .header {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
          }
          .qr-container {
            margin: 20px 0;
          }
          .footer {
            font-size: 14px;
            margin-top: 10px;
            border-top: 1px solid #eee;
            padding-top: 10px;
          }
          .card-info {
            margin: 10px 0;
          }
          .instructions {
            font-size: 12px;
            margin-top: 10px;
            font-style: italic;
            color: #666;
          }
          @media print {
            .print-button {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">Fatec Itu</div>
          <div class="card-info">
            <p><strong>Nome:</strong> ${name}</p>
          </div>
          <div class="qr-container">
            <img src="${qrImageUrl}" alt="QR Code" style="width: 200px;" />
          </div>
          <div class="card-info">
            <p><strong>ID do Cartão:</strong> ${cardId}</p>
          </div>
          <div class="instructions">
            Escaneie o QR Code acima para verificar o saldo.
          </div>
          <div class="instructions">
            Tome cuidado para não perder seu cartão. Uso único.
          </div>
          <div class="footer">Tecno Quermesse 2025 - Fatec Itu</div>
          <button class="print-button" onclick="window.print(); window.close();">Imprimir</button>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(content);
    printWindow.document.close();
  };

  const resetForm = () => {
    setName("");
    setInitialCredit("");
    setCardId(null);
    setQrImageUrl("");
  };

  return (
    <div className="space-y-6">
      {!cardId ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Participante</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do participante"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="credit">Crédito Inicial (R$)</Label>
            <Input
              id="credit"
              type="number"
              value={initialCredit}
              onChange={(e) => setInitialCredit(e.target.value)}
            />
            {initialCredit === "0" && (
              <p className="text-xs text-red-500">
                O crédito inicial não pode ser 0.
              </p>
            )}
            {initialCredit !== "" && Number(initialCredit) < 0 && (
              <p className="text-xs text-red-500">
                O crédito inicial deve ser maior que zero.
              </p>
            )}
          </div>
          <Button onClick={generateCard} disabled={loading} className="w-full">
            {loading ? "Gerando..." : "Gerar QR Code"}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            {qrImageUrl && (
              <div className="border p-4 rounded-lg bg-white">
                <img src={qrImageUrl} alt="QR Code" className="w-48 h-48" />
              </div>
            )}
            <div className="text-center">
              <p className="font-medium">{name}</p>
              <p className="text-xs text-muted-foreground">ID: {cardId}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Escaneie para verificar saldo e histórico
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={printQRCode} className="flex-1">
              <Printer className="mr-2 h-4 w-4" /> Imprimir QR Code
            </Button>
            <Button variant="outline" onClick={resetForm} className="flex-1">
              Gerar Novo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
