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

  // Dados Fakes para visualização (depois virão do Supabase)
  const projects = [
    {
      id: 1,
      client: "Hering Store",
      type: "Tráfego Pago",
      status: "active",
      date: "12/02/2026",
    },
    {
      id: 2,
      client: "O Pace Financeiro",
      type: "Lançamento",
      status: "warning",
      date: "10/02/2026",
    },
    {
      id: 3,
      client: "J&S Metais",
      type: "Vídeo Institucional",
      status: "completed",
      date: "05/02/2026",
    },
    {
      id: 4,
      client: "Dr. Marcos",
      type: "Social Media",
      status: "active",
      date: "15/02/2026",
    },
  ];

  return (
    <div className="w-full h-screen flex flex-col gap-6 p-2 mt-4">
      {/* 1. CABEÇALHO E AÇÕES */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-800">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo de volta, Admin. Aqui está o resumo da agência hoje.
            Estamos em período de testes!
          </p>
        </div>
      </div>

      {/* 2. KPIs (Indicadores Principais) */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas 48h</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.urgentPosts}
            </div>
            <p className="text-xs text-muted-foreground">Posts agendados</p>
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
            <p className="text-xs text-muted-foreground">+20% esse mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Faturamento Atual
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">134.678,50</div>
            <p className="text-xs text-muted-foreground">
              +15% em relação ao mês passado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. ÁREA PRINCIPAL */}
      <div className="grid gap-6 md:grid-cols-7">
        {/* TABELA DE PROJETOS RECENTES (Ocupa 4 colunas) */}
        <Card className="md:col-span-4 lg:col-span-5">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Me deem ideias</CardTitle>
              <CardDescription>Eu não sei o que botar aqui.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="gap-1">
              Ver todos <ArrowUpRight size={16} />
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Prazo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                          {project.client.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {project.client}
                    </TableCell>
                    <TableCell>{project.type}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          project.status === "active"
                            ? "default"
                            : project.status === "warning"
                              ? "destructive"
                              : "secondary"
                        }
                        className={
                          project.status === "active"
                            ? "bg-green-500 hover:bg-green-600"
                            : project.status === "warning"
                              ? "bg-yellow-500 hover:bg-yellow-600"
                              : ""
                        }
                      >
                        {project.status === "active"
                          ? "Em dia"
                          : project.status === "warning"
                            ? "Atenção"
                            : "Concluído"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{project.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* ATALHOS RÁPIDOS E CALENDÁRIO MINI (Ocupa 3 colunas) */}
        <div className="md:col-span-3 lg:col-span-2 flex flex-col gap-6">
          {/* Atalhos */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button
                variant="outline"
                className="w-full justify-start text-left"
              >
                <Plus className="mr-2 h-4 w-4" /> Sei lá
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-left"
              >
                <Users className="mr-2 h-4 w-4" /> Uma hora coloco algo
              </Button>
            </CardContent>
          </Card>

          {/* Resumo Financeiro ou Calendário */}
          <Card className="flex-1 bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-white">Dica do Dia</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm opacity-90">
                Se você parar pra pensar, vai estar pensando parado!
              </p>
              <Button
                variant="secondary"
                className="mt-4 w-full text-primary hover:bg-white"
              >
                Ver Agenda
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
