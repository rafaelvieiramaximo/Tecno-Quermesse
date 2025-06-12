export default function Footer() {
  return (
    <footer className="border-t py-6 bg-muted/70 ">
      <div className="container mx-auto px-4 ">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-center md:text-left font-semibold">Fatec Itu</p>
            <p className="text-center md:text-left text-sm">
              Sistema de Gestão de Créditos para Quermesse
            </p>
          </div>
          <div className="text-sm">
            &copy; {new Date().getFullYear()} Todos os direitos reservados
          </div>
        </div>
      </div>
    </footer>
  );
}
