import Link from "next/link";
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
  AlertCircle,
  ArrowUpRight,
  Calendar,
  DollarSign,
  Target,
  Video,
  Handshake,
} from "lucide-react";
import { getDashboardStats } from "./actions";
import { STAGES } from "../pipeline/constants";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);

const stageInfo = (stageId: string) =>
  STAGES.find((s) => s.id === stageId) ?? { title: stageId, dotColor: "bg-gray-400" };

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const activeStages = ["new", "discovery", "proposal", "negotiation"];
  const pipelineDeals = stats.deals.filter((d) => activeStages.includes(d.stage));
  const pipelineTotal = pipelineDeals.reduce((s, d) => s + Number(d.value || 0), 0);

  // Progresso da meta
  const goalProgress =
    stats.currentMonthGoal > 0
      ? Math.min(Math.round((stats.currentMonthRevenue / stats.currentMonthGoal) * 100), 100)
      : 0;

  return (
    <div className="w-full min-h-screen flex flex-col gap-6 p-6 pb-20">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Visão geral da agência e pipeline comercial.
          </p>
        </div>
        <p className="text-sm text-muted-foreground capitalize">
          {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {/* Posts urgentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-sm">Próximas 48h</CardDescription>
            <div className="rounded-md bg-red-500/10 p-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{stats.urgentPosts}</p>
            <p className="text-xs text-muted-foreground mt-1">Posts a publicar</p>
          </CardContent>
        </Card>

        {/* Pipeline ativo */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-sm">Pipeline ativo</CardDescription>
            <div className="rounded-md bg-sky-500/10 p-2">
              <Handshake className="h-4 w-4 text-sky-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pipelineDeals.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(pipelineTotal)} em negociação
            </p>
          </CardContent>
        </Card>

        {/* Faturamento atual */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-sm">Faturamento do mês</CardDescription>
            <div className="rounded-md bg-emerald-500/10 p-2">
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(stats.currentMonthRevenue)}</p>
            <p className="text-xs text-muted-foreground mt-1">Deals ganhos neste mês</p>
          </CardContent>
        </Card>

        {/* Meta do mês */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-sm">Meta do mês</CardDescription>
            <div className="rounded-md bg-primary/10 p-2">
              <Target className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(stats.currentMonthGoal)}</p>
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>{goalProgress}% atingido</span>
                <span>{formatCurrency(stats.currentMonthRevenue)} / {formatCurrency(stats.currentMonthGoal)}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${goalProgress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Área principal */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        {/* Pipeline Comercial (real) */}
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pipeline Comercial</CardTitle>
              <CardDescription>
                {pipelineDeals.length} negociação{pipelineDeals.length !== 1 ? "ões" : ""} em andamento
              </CardDescription>
            </div>
            <Link href="/admin/pipeline">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                Ver pipeline <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead / Cliente</TableHead>
                    <TableHead>Etapa</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pipelineDeals.slice(0, 8).map((deal) => {
                    const stage = stageInfo(deal.stage);
                    return (
                      <TableRow key={deal.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7 hidden sm:flex">
                              <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
                                {(deal.company_name || deal.title)
                                  .substring(0, 2)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {deal.company_name || deal.title}
                              </p>
                              {deal.contact_name && (
                                <p className="truncate text-xs text-muted-foreground">
                                  {deal.contact_name}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="gap-1.5 whitespace-nowrap">
                            <span className={`h-1.5 w-1.5 rounded-full ${stage.dotColor}`} />
                            {stage.title}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right hidden sm:table-cell font-medium">
                          {formatCurrency(Number(deal.value || 0))}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {pipelineDeals.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="h-20 text-center text-muted-foreground">
                        Nenhuma negociação em andamento.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Coluna lateral */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Próximas Reuniões */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Próximas reuniões</CardTitle>
                <CardDescription>Agenda dos próximos dias</CardDescription>
              </div>
              <Link href="/admin/calendar/meetings">
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                  Ver todas <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {stats.upcomingMeetings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Calendar className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma reunião agendada.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.upcomingMeetings.map((meeting) => {
                    const meetingDate = new Date(meeting.start_time);
                    const isToday =
                      meetingDate.toDateString() === new Date().toDateString();

                    return (
                      <div
                        key={meeting.id}
                        className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Video className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {meeting.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {isToday ? (
                              <span className="text-primary font-medium">Hoje</span>
                            ) : (
                              format(meetingDate, "dd/MM", { locale: ptBR })
                            )}
                            {" às "}
                            {format(meetingDate, "HH:mm")}
                          </p>
                        </div>
                        {meeting.meeting_url && (
                          <a
                            href={meeting.meeting_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm" className="shrink-0">
                              Entrar
                            </Button>
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resumo por etapa */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo do pipeline</CardTitle>
              <CardDescription>Deals por etapa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {STAGES.filter((s) => activeStages.includes(s.id)).map((stage) => {
                  const stageDeals = stats.deals.filter((d) => d.stage === stage.id);
                  const stageTotal = stageDeals.reduce(
                    (s, d) => s + Number(d.value || 0),
                    0,
                  );

                  return (
                    <div key={stage.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${stage.dotColor}`} />
                        <span className="text-sm">{stage.title}</span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {stageDeals.length}
                        </Badge>
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">
                        {formatCurrency(stageTotal)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
