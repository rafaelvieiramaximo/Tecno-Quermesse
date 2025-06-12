import Link from "next/link"
import { UserNav } from "./user-nav"

export default function Header() {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold">Fatec Itu</h1>
          </Link>
          <span className="text-lg hidden sm:inline">Sistema de Gestão de Créditos e Débitos</span>
        </div>
        <UserNav />
      </div>
    </header>
  )
}
