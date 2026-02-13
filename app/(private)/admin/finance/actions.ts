"use server";

import { createClient } from "@/utils/supabase/server";
import type { Deal } from "../pipeline/constants";

export type FinanceMonthlyPlan = {
  month: string;
  revenueGoal: number;
  costForecast: number;
};

export type FinanceCostItem = {
  id: string;
  name: string;
  category: string | null;
  amount: number;
  costMonth: string;
};

type WithWarning<T> = {
  data: T;
  warning: string | null;
};

const toMonthStartDate = (month: string) => {
  const [year, monthValue] = month.split("-").map(Number);
  return new Date(year, (monthValue || 1) - 1, 1);
};

export async function getFinanceDeals(): Promise<WithWarning<Deal[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deals")
    .select("id,title,company_name,value,stage,created_at,deal_type")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar deals para financeiro:", error);
    return { data: [], warning: "Nao foi possivel carregar os deals do pipeline." };
  }

  return { data: (data as Deal[]) ?? [], warning: null };
}

export async function getMonthlyPlans(
  fromMonth: string,
): Promise<WithWarning<FinanceMonthlyPlan[]>> {
  const supabase = await createClient();
  const fromDate = toMonthStartDate(fromMonth).toISOString();

  const { data, error } = await supabase
    .from("finance_monthly_plans")
    .select("month,revenue_goal,cost_forecast")
    .gte("month", fromDate)
    .order("month", { ascending: true });

  if (error) {
    console.error("Erro ao buscar finance_monthly_plans:", error);
    return {
      data: [],
      warning:
        "Tabela finance_monthly_plans nao encontrada ou sem permissao. Crie as colunas: month, revenue_goal, cost_forecast.",
    };
  }

  const parsed: FinanceMonthlyPlan[] = (data ?? []).map((row) => ({
    month: String(row.month),
    revenueGoal: Number(row.revenue_goal ?? 0),
    costForecast: Number(row.cost_forecast ?? 0),
  }));

  return { data: parsed, warning: null };
}

export async function getCostsByMonth(
  month: string,
): Promise<WithWarning<FinanceCostItem[]>> {
  const supabase = await createClient();

  const start = toMonthStartDate(month);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);

  const { data, error } = await supabase
    .from("finance_costs")
    .select("id,name,category,amount,cost_month")
    .gte("cost_month", start.toISOString())
    .lt("cost_month", end.toISOString())
    .order("cost_month", { ascending: true });

  if (error) {
    console.error("Erro ao buscar finance_costs:", error);
    return {
      data: [],
      warning:
        "Tabela finance_costs nao encontrada ou sem permissao. Crie as colunas: id, name, category, amount, cost_month.",
    };
  }

  const parsed: FinanceCostItem[] = (data ?? []).map((row) => ({
    id: String(row.id),
    name: String(row.name ?? "Custo sem nome"),
    category: row.category ? String(row.category) : null,
    amount: Number(row.amount ?? 0),
    costMonth: String(row.cost_month),
  }));

  return { data: parsed, warning: null };
}
