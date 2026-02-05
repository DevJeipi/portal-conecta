import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingCalendar() {
  return (
    // Mantendo exatamente as mesmas classes do seu CalendarView container
    <div className="flex flex-col w-full h-screen p-4 space-y-4 overflow-hidden">
      {/* --- HEADER SKELETON --- */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Lado Esquerdo: Mês + Setas */}
        <div className="flex items-center gap-4">
          {/* Título do Mês */}
          <Skeleton className="h-8 w-48 rounded-md" />
          {/* Botões de Navegação (Setas) */}
          <div className="flex items-center border rounded-md bg-white">
            <div className="h-10 w-10 flex items-center justify-center border-r">
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <div className="h-10 w-10 flex items-center justify-center">
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
          </div>
        </div>

        {/* Lado Direito: Filtro + Botão */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Select de Clientes */}
          <Skeleton className="h-10 w-[200px] rounded-md" />
          {/* Botão Novo Post */}
          <Skeleton className="h-10 w-[110px] rounded-md" />
        </div>
      </div>

      {/* --- GRID DO CALENDÁRIO SKELETON --- */}
      <div className="flex-1 border rounded-lg shadow-sm bg-white overflow-hidden flex flex-col">
        {/* Cabeçalho dos Dias (Dom, Seg, Ter...) */}
        <div className="grid grid-cols-7 border-b bg-neutral-50 shrink-0">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="py-2 flex justify-center">
              <Skeleton className="h-4 w-8 bg-neutral-200" />
            </div>
          ))}
        </div>

        {/* Células dos Dias */}
        <div className="grid grid-cols-7 flex-1 auto-rows-fr">
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className="min-h-30 border-b border-r p-2 flex flex-col gap-2 bg-white"
            >
              {/* Número do dia (Alinhado à direita) */}
              <div className="flex justify-end mb-2">
                <Skeleton className="h-4 w-4 rounded-sm" />
              </div>

              {/* Simulação de Posts (Alguns dias tem, outros não) */}
              {i % 4 === 0 && (
                <Skeleton className="h-7 w-full rounded-md bg-blue-50/50" />
              )}
              {i % 7 === 0 && (
                <>
                  <Skeleton className="h-7 w-full rounded-md bg-green-50/50" />
                  <Skeleton className="h-7 w-3/4 rounded-md bg-blue-50/50" />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
