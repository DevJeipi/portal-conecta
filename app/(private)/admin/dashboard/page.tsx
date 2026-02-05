import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users,
  Briefcase,
  AlertCircle,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import { getDashboardStats } from "@/app/(private)/admin/dashboard/actions";

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  // Dados Fakes atualizados para o contexto de CRM / Comercial
  const deals = [
    {
      id: 1,
      client: "Luvas Rei",
      status: "negotiating", // Em negociação
      last_contact: "12/02",
    },
    {
      id: 2,
      client: "O Pace Financeiro",
      status: "waiting", // Aguardando
      last_contact: "10/02",
    },
    {
      id: 3,
      client: "J&S Metais",
      status: "closed", // Fechado
      last_contact: "05/02",
    },
    {
      id: 4,
      client: "Dr. Marcos",
      status: "to_contact", // À contatar
      last_contact: "Hoje",
    },
  ];

  // Helper para renderizar o status visualmente
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "to_contact":
        return { label: "À Contatar", color: "bg-blue-500 hover:bg-blue-600" };
      case "waiting":
        return {
          label: "Aguardando",
          color: "bg-yellow-500 hover:bg-yellow-600",
        };
      case "negotiating":
        return {
          label: "Em Negociação",
          color: "bg-purple-500 hover:bg-purple-600",
        };
      case "closed":
        return { label: "Fechado", color: "bg-green-500 hover:bg-green-600" };
      default:
        return { label: status, color: "bg-gray-500" };
    }
  };

  return (
    // AJUSTE MOBILE 1: min-h-screen ao invés de h-screen para permitir scroll
    <div className="w-full min-h-screen flex flex-col gap-6 p-2 mt-4 pb-20">
      {/* 1. CABEÇALHO E AÇÕES */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-800">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Visão geral da agência e pipeline comercial.
          </p>
        </div>
      </div>

      {/* 2. KPIs (Grid ajustado para empilhar no mobile automaticamente) */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas 48h</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.urgentPosts}
            </div>
            <p className="text-xs text-muted-foreground">Posts a publicar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clientes Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 novos este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 134k</div>
            <p className="text-xs text-muted-foreground">
              Previsão de fechamento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. ÁREA PRINCIPAL */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-7">
        {/* TABELA COMERCIAL (Ocupa espaço maior no desktop) */}
        <Card className="col-span-1 md:col-span-4 lg:col-span-5">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pipeline Comercial</CardTitle>
              <CardDescription>
                Acompanhamento de leads e negociações.
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="gap-1">
              Ver CRM <ArrowUpRight size={16} />
            </Button>
          </CardHeader>
          <CardContent>
            {/* AJUSTE MOBILE 2: Wrapper para scroll horizontal na tabela */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead / Cliente</TableHead>
                    <TableHead>Status</TableHead>
                    {/* Esconde data em telas muito pequenas */}
                    <TableHead className="text-right hidden sm:table-cell">
                      Últ. Contato
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deals.map((deal) => {
                    const badgeInfo = getStatusBadge(deal.status);

                    return (
                      <TableRow key={deal.id}>
                        <TableCell className="font-medium flex items-center gap-2 whitespace-nowrap">
                          <Avatar className="h-6 w-6 hidden sm:flex">
                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                              {deal.client.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {deal.client}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${badgeInfo.color} hover:${badgeInfo.color} text-white whitespace-nowrap`}
                          >
                            {badgeInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right hidden sm:table-cell">
                          {deal.last_contact}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* ATALHOS RÁPIDOS (Coluna lateral) */}
        <div className="col-span-1 md:col-span-3 lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button
                variant="outline"
                className="w-full justify-start text-left"
              >
                <Plus className="mr-2 h-4 w-4" /> Novo Lead
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-left"
              >
                <Users className="mr-2 h-4 w-4" /> Equipe
              </Button>
            </CardContent>
          </Card>

          <Card className="flex-1 bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-white">Foco do Dia</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm opacity-90">
                Você tem 2 propostas pendentes em "Aguardando" há mais de 3
                dias. Que tal um follow-up?
              </p>
              <Button
                variant="secondary"
                className="mt-4 w-full text-primary hover:bg-white"
              >
                Ver Propostas
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
