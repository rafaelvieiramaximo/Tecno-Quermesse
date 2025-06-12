"use client"

import { Button } from "@/components/ui/button"
import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <h2 className="text-3xl font-bold mb-4">Algo deu errado!</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()}>Tentar novamente</Button>
        <Button variant="outline" onClick={() => (window.location.href = "/")}>
          Voltar para o início
        </Button>
      </div>
    </div>
  )
}
