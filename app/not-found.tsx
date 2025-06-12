import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <h2 className="text-3xl font-bold mb-4">404 - Página não encontrada</h2>
      <p className="text-muted-foreground mb-8 max-w-md">A página que você está procurando não existe ou foi movida.</p>
      <Button asChild>
        <Link href="/login">Voltar para o login</Link>
      </Button>
    </div>
  )
}
