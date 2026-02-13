import Link from "next/link";
import {
  getCostsByMonth,
  getFinanceDeals,
  getMonthlyPlans,
} from "./actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  ReceiptText,
  ArrowUpRight,
  Repeat,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { GoalsCostsChart } from "@/components/finance/goals-costs-chart";
import { STAGES } from "../pipeline/constants";

/* ────────────────────── Tipos e constantes ────────────────────── */

type TabId = "overview" | "costs" | "recurring";

const tabs: Array<{ id: TabId; label: string }> = [
  { id: "overview", label: "Visão Geral" },
  { id: "costs", label: "Custos" },
  { id: "recurring", label: "Receitas" },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);

const monthInputValue = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const monthDisplay = (month: string) => {
  const date = new Date(`${month}-01T00:00:00`);
  if (Number.isNaN(date.getTime())) return month;
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
};

const stageLabel = (stageId: string) =>
  STAGES.find((s) => s.id === stageId)?.title ?? stageId;

/* ────────────────────── Helpers de classificação ────────────────────── */

function isRecurringByTypeOrName(deal: {
  deal_type?: string | null;
  title: string;
  company_name?: string;
}) {
  if (deal.deal_type === "recurring") return true;
  if (deal.deal_type === "one_off") return false;

  const keywords = ["recorrente", "mensal", "assinatura", "retainer", "plano", "fee"];
  const text = `${deal.title} ${deal.company_name || ""}`.toLowerCase();
  return keywords.some((kw) => text.includes(kw));
}

/* ────────────────────── Página principal ────────────────────── */

export default async function FinancePage(props: {
  searchParams: Promise<{ tab?: string; month?: string }>;
}) {
  const searchParams = await props.searchParams;

  const tab = tabs.some((t) => t.id === searchParams.tab)
    ? (searchParams.tab as TabId)
    : "overview";

  const selectedMonth = /^\d{4}-\d{2}$/.test(searchParams.month || "")
    ? (searchParams.month as string)
    : monthInputValue(new Date());

  /* ── Dados ── */
  const [
    { data: deals, warning: dealsWarning },
    { data: plans, warning: plansWarning },
    { data: costs, warning: costsWarning },
  ] = await Promise.all([
    getFinanceDeals(),
    getMonthlyPlans(selectedMonth),
    getCostsByMonth(selectedMonth),
  ]);

  const monthStart = new Date(`${selectedMonth}-01T00:00:00`);
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);

  const monthDeals = deals.filter((deal) => {
    const at = new Date(deal.created_at);
    return at >= monthStart && at < monthEnd;
  });

  const recurringDeals = monthDeals.filter((d) => isRecurringByTypeOrName(d));
  const oneOffDeals = monthDeals.filter((d) => !isRecurringByTypeOrName(d));

  const recurringRevenue = recurringDeals
    .filter((d) => d.stage === "won")
    .reduce((s, d) => s + Number(d.value || 0), 0);
  const oneOffRevenue = oneOffDeals
    .filter((d) => d.stage === "won")
    .reduce((s, d) => s + Number(d.value || 0), 0);

  const currentRevenue = recurringRevenue + oneOffRevenue;
  const totalCosts = costs.reduce((s, c) => s + Number(c.amount || 0), 0);
  const profit = currentRevenue - totalCosts;
  const currentMonthGoal = plans[0]?.revenueGoal ?? 0;
  const currentMonthCostForecast = plans[0]?.costForecast ?? 0;

  const warnings = [dealsWarning, plansWarning, costsWarning].filter(Boolean);

  return (
    <div className="w-full min-h-screen p-6 pb-20 flex flex-col gap-8">
      {/* ── Cabeçalho ── */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground text-sm">
            Acompanhe o faturamento, custos e projeções da sua operação.
          </p>
        </div>

        <p className="text-sm text-muted-foreground capitalize">
          {monthDisplay(selectedMonth)}
        </p>
      </div>

      {/* ── Avisos ── */}
      {warnings.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 p-4 text-sm text-amber-800 dark:text-amber-200">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <div className="space-y-0.5">
            {warnings.map((w) => (
              <p key={w}>{w}</p>
            ))}
          </div>
        </div>
      )}

      {/* ── Abas ── */}
      <nav className="flex items-center gap-1 border-b">
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={`/admin/finance?tab=${t.id}&month=${selectedMonth}`}
            className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.id
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            {tab === t.id && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary rounded-full" />
            )}
          </Link>
        ))}
      </nav>

      {/* ═══════════════════ ABA: VISÃO GERAL ═══════════════════ */}
      {tab === "overview" && (
        <div className="flex flex-col gap-6">
          {/* KPIs */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {/* Faturamento */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription className="text-sm">Faturamento atual</CardDescription>
                <div className="rounded-md bg-emerald-500/10 p-2">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(currentRevenue)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Receitas ganhas neste mês
                </p>
              </CardContent>
            </Card>

            {/* Custos */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription className="text-sm">Custos do mês</CardDescription>
                <div className="rounded-md bg-orange-500/10 p-2">
                  <ReceiptText className="h-4 w-4 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(totalCosts)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {costs.length} lançamento{costs.length !== 1 ? "s" : ""} registrado{costs.length !== 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>

            {/* Lucro */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription className="text-sm">Resultado</CardDescription>
                <div className={`rounded-md p-2 ${profit >= 0 ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                  {profit >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {formatCurrency(profit)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Receita &minus; custos
                </p>
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
                <p className="text-2xl font-bold">{formatCurrency(currentMonthGoal)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Custo previsto: {formatCurrency(currentMonthCostForecast)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Composição de receita */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-l-4 border-l-emerald-500">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <Repeat className="h-4 w-4 text-emerald-500" />
                <div>
                  <CardTitle className="text-base">Receita recorrente</CardTitle>
                  <CardDescription>Deals ganhos marcados como recorrente</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(recurringRevenue)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {recurringDeals.filter((d) => d.stage === "won").length} deal{recurringDeals.filter((d) => d.stage === "won").length !== 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-sky-500">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <Zap className="h-4 w-4 text-sky-500" />
                <div>
                  <CardTitle className="text-base">Receita one-off</CardTitle>
                  <CardDescription>Deals ganhos pontuais</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(oneOffRevenue)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {oneOffDeals.filter((d) => d.stage === "won").length} deal{oneOffDeals.filter((d) => d.stage === "won").length !== 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico */}
          <Card>
            <CardHeader>
              <CardTitle>Metas e custos previstos</CardTitle>
              <CardDescription>
                Projeção dos próximos meses com base no planejamento financeiro.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GoalsCostsChart data={plans} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══════════════════ ABA: CUSTOS ═══════════════════ */}
      {tab === "costs" && (
        <div className="flex flex-col gap-6">
          {/* Filtro */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Período</CardTitle>
              <CardDescription>
                Selecione um mês para ver os custos registrados ou previstos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="flex items-end gap-3">
                <input type="hidden" name="tab" value="costs" />
                <div className="grid gap-1.5">
                  <label htmlFor="month-filter" className="text-xs font-medium text-muted-foreground">
                    Mês
                  </label>
                  <Input
                    id="month-filter"
                    type="month"
                    name="month"
                    defaultValue={selectedMonth}
                    className="w-[180px]"
                  />
                </div>
                <Button type="submit" variant="outline" size="sm">
                  Aplicar
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Resumo */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Total de custos</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(totalCosts)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Itens registrados</p>
                <p className="text-2xl font-bold mt-1">{costs.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Custo médio por item</p>
                <p className="text-2xl font-bold mt-1">
                  {costs.length > 0 ? formatCurrency(totalCosts / costs.length) : "—"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabela */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento de custos</CardTitle>
              <CardDescription>
                Todos os lançamentos do mês selecionado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {costs.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          {item.category ? (
                            <Badge variant="secondary">{item.category}</Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {costs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                          Nenhum custo encontrado para este mês.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══════════════════ ABA: RECEITAS ═══════════════════ */}
      {tab === "recurring" && (
        <div className="flex flex-col gap-6">
          {/* Resumo por tipo */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200/50 dark:border-emerald-800/30">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="rounded-full bg-emerald-500/10 p-2.5">
                  <Repeat className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <CardDescription>Receitas recorrentes</CardDescription>
                  <CardTitle className="text-2xl">{formatCurrency(recurringRevenue)}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {recurringDeals.length} deal{recurringDeals.length !== 1 ? "s" : ""} classificado{recurringDeals.length !== 1 ? "s" : ""} como recorrente
                </p>
              </CardContent>
            </Card>

            <Card className="bg-sky-50/50 dark:bg-sky-950/10 border-sky-200/50 dark:border-sky-800/30">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="rounded-full bg-sky-500/10 p-2.5">
                  <Zap className="h-5 w-5 text-sky-600" />
                </div>
                <div>
                  <CardDescription>Receitas one-off</CardDescription>
                  <CardTitle className="text-2xl">{formatCurrency(oneOffRevenue)}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {oneOffDeals.length} deal{oneOffDeals.length !== 1 ? "s" : ""} classificado{oneOffDeals.length !== 1 ? "s" : ""} como one-off
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de deals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Deals do mês</CardTitle>
                <CardDescription className="capitalize">
                  {monthDisplay(selectedMonth)}
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
                      <TableHead>Deal</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Etapa</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthDeals.map((deal) => {
                      const recurring = isRecurringByTypeOrName(deal);
                      return (
                        <TableRow key={deal.id}>
                          <TableCell className="font-medium">
                            {deal.company_name || deal.title}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={
                                recurring
                                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                  : "bg-sky-500/10 text-sky-700 dark:text-sky-400"
                              }
                            >
                              {recurring ? "Recorrente" : "One-off"}
                            </Badge>
                          </TableCell>
                          <TableCell>{stageLabel(deal.stage)}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(Number(deal.value || 0))}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {monthDeals.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                          Nenhum deal encontrado neste mês.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
