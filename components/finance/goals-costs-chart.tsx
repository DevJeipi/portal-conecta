"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

type MonthlyPlan = {
  month: string;
  revenueGoal: number;
  costForecast: number;
};

const areaChartConfig = {
  revenueGoal: {
    label: "Meta de faturamento",
    color: "var(--color-primary)",
  },
  costForecast: {
    label: "Custo previsto",
    color: "#ff2400",
  },
} satisfies ChartConfig;

const cashFlowConfig = {
  cashFlow: {
    label: "Resultado de caixa",
    color: "#10b981",
  },
} satisfies ChartConfig;

const monthLabel = (rawDate: string) => {
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return rawDate;
  return date.toLocaleDateString("pt-BR", { month: "short" });
};

const formatCurrencyShort = (value: number) => {
  if (Math.abs(value) >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)}k`;
  }
  return `R$ ${value}`;
};

const formatCurrencyFull = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);

export function GoalsCostsChart({ data }: { data: MonthlyPlan[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        <div className="text-center space-y-1">
          <p className="font-medium">Sem dados disponíveis</p>
          <p className="text-xs">
            Crie registros em{" "}
            <code className="bg-muted px-1 rounded">finance_monthly_plans</code>{" "}
            para alimentar este gráfico.
          </p>
        </div>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    ...item,
    monthLabel: monthLabel(item.month),
    cashFlow: item.revenueGoal - item.costForecast,
  }));

  return (
    <div className="space-y-8">
      {/* Gráfico de área: Meta x Custo */}
      <ChartContainer
        config={areaChartConfig}
        className="aspect-auto h-[280px] w-full"
      >
        <AreaChart
          data={chartData}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="fillGoal" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-revenueGoal)"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="var(--color-revenueGoal)"
                stopOpacity={0.02}
              />
            </linearGradient>
            <linearGradient id="fillCost" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-costForecast)"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="var(--color-costForecast)"
                stopOpacity={0.02}
              />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="monthLabel"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={formatCurrencyShort}
            width={64}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) => {
                  const label =
                    areaChartConfig[name as keyof typeof areaChartConfig]
                      ?.label ?? name;
                  return (
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">
                        {label as string}
                      </span>
                      <span className="font-mono font-medium">
                        {formatCurrencyFull(Number(value))}
                      </span>
                    </div>
                  );
                }}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Area
            dataKey="revenueGoal"
            type="monotone"
            fill="url(#fillGoal)"
            stroke="var(--color-revenueGoal)"
            strokeWidth={2.5}
          />
          <Area
            dataKey="costForecast"
            type="monotone"
            fill="url(#fillCost)"
            stroke="var(--color-costForecast)"
            strokeWidth={2.5}
          />
        </AreaChart>
      </ChartContainer>

      {/* Gráfico de barras: Resultado de caixa */}
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-semibold">Resultado de caixa mensal</h4>
          <p className="text-xs text-muted-foreground">
            Meta de faturamento menos custo previsto por mês
          </p>
        </div>

        <ChartContainer
          config={cashFlowConfig}
          className="aspect-auto h-[200px] w-full"
        >
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="monthLabel"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatCurrencyShort}
              width={64}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => (
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Resultado</span>
                      <span className="font-mono font-medium">
                        {formatCurrencyFull(Number(value))}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Bar dataKey="cashFlow" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.cashFlow >= 0 ? "#10b981" : "#ef4444"}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>

        {/* Tabela de caixa */}
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                  Mês
                </th>
                <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
                  Meta
                </th>
                <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
                  Custo previsto
                </th>
                <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
                  Resultado
                </th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((row, index) => (
                <tr
                  key={index}
                  className="border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-2.5 font-medium capitalize">
                    {row.monthLabel}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {formatCurrencyFull(row.revenueGoal)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-orange-600">
                    {formatCurrencyFull(row.costForecast)}
                  </td>
                  <td
                    className={`px-4 py-2.5 text-right font-semibold ${
                      row.cashFlow >= 0 ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrencyFull(row.cashFlow)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
