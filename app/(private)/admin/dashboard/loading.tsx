import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LoadingDashboard() {
  return (
    <div className="w-full h-screen flex flex-col gap-6 p-2 mt-4">
      {/* 1. CABEÇALHO SKELETON */}
      <div className="flex flex-col gap-2">
        {/* Título */}
        <Skeleton className="h-9 w-48" />
        {/* Subtítulo */}
        <Skeleton className="h-4 w-87.5 sm:w-125" />
      </div>

      {/* 2. KPIs SKELETON (3 Cards) */}
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" /> {/* Label */}
              <Skeleton className="h-4 w-4 rounded-full" /> {/* Icon */}
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" /> {/* Valor Grande */}
              <Skeleton className="h-3 w-32" /> {/* Subtexto */}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 3. ÁREA PRINCIPAL SKELETON */}
      <div className="grid gap-6 md:grid-cols-7">
        {/* TABELA DE PROJETOS (Esquerda) */}
        <Card className="md:col-span-4 lg:col-span-5">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" /> {/* Título Card */}
              <Skeleton className="h-4 w-48" /> {/* Descrição */}
            </div>
            <Skeleton className="h-9 w-24" /> {/* Botão "Ver todos" */}
          </CardHeader>
          <CardContent>
            {/* Cabeçalho da Tabela Fake */}
            <div className="flex justify-between mb-4 px-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20 hidden sm:block" />
              <Skeleton className="h-4 w-20 hidden sm:block" />
              <Skeleton className="h-4 w-10" />
            </div>

            {/* Linhas da Tabela */}
            <div className="space-y-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  {/* Avatar + Nome */}
                  <div className="flex items-center gap-3 w-1/3">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  {/* Serviço */}
                  <div className="hidden sm:block w-1/4">
                    <Skeleton className="h-4 w-20" />
                  </div>
                  {/* Status Badge */}
                  <div className="hidden sm:block w-1/4">
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  {/* Data */}
                  <div className="w-10 flex justify-end">
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* COLUNA DA DIREITA (Atalhos e Dica) */}
        <div className="md:col-span-3 lg:col-span-2 flex flex-col gap-6">
          {/* Card Atalhos */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="grid gap-2">
              <Skeleton className="h-10 w-full rounded-md" /> {/* Botão 1 */}
              <Skeleton className="h-10 w-full rounded-md" /> {/* Botão 2 */}
            </CardContent>
          </Card>

          {/* Card Dica do Dia (Com fundo simulado se quiser, ou padrão) */}
          <Card className="flex-1">
            <CardHeader>
              <Skeleton className="h-6 w-28" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <Skeleton className="h-10 w-full mt-4" /> {/* Botão Ver Agenda */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
