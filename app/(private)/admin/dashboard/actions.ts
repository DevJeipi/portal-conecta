"use server";

import { createClient } from "@/utils/supabase/server";
import type { Deal } from "../pipeline/constants";

export type DashboardStats = {
  urgentPosts: number;
  deals: Deal[];
  upcomingMeetings: Array<{
    id: string;
    title: string;
    start_time: string;
    meeting_url: string | null;
  }>;
  currentMonthRevenue: number;
  currentMonthGoal: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const now = new Date();

  // Data de daqui a 48 horas
  const in48Hours = new Date();
  in48Hours.setHours(in48Hours.getHours() + 48);

  // Início do mês atual
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Busca posts agendados entre agora e daqui a 48H
  const postsPromise = supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .gte("scheduled_date", now.toISOString())
    .lte("scheduled_date", in48Hours.toISOString());

  // Busca deals reais do pipeline
  const dealsPromise = supabase
    .from("deals")
    .select("id,title,company_name,value,stage,created_at,deal_type,contact_name,email")
    .order("created_at", { ascending: false });

  // Busca próximas reuniões (a partir de agora, limite 5)
  const meetingsPromise = supabase
    .from("meetings")
    .select("id,title,start_time,meeting_url")
    .gte("start_time", now.toISOString())
    .order("start_time", { ascending: true })
    .limit(5);

  // Busca meta do mês atual
  const planPromise = supabase
    .from("finance_monthly_plans")
    .select("revenue_goal")
    .eq("month", monthStart.toISOString().split("T")[0])
    .maybeSingle();

  const [postsResult, dealsResult, meetingsResult, planResult] =
    await Promise.all([postsPromise, dealsPromise, meetingsPromise, planPromise]);

  // Posts urgentes
  const urgentPosts = postsResult.count || 0;

  // Deals
  const deals = (dealsResult.data as Deal[]) ?? [];

  // Faturamento do mês atual (deals won neste mês)
  const currentMonthRevenue = deals
    .filter(
      (d) =>
        d.stage === "won" &&
        new Date(d.created_at).getTime() >= monthStart.getTime(),
    )
    .reduce((sum, d) => sum + Number(d.value || 0), 0);

  // Reuniões
  const upcomingMeetings = (meetingsResult.data ?? []).map((m) => ({
    id: String(m.id),
    title: String(m.title),
    start_time: String(m.start_time),
    meeting_url: m.meeting_url ? String(m.meeting_url) : null,
  }));

  // Meta
  const currentMonthGoal = Number(planResult.data?.revenue_goal ?? 0);

  return {
    urgentPosts,
    deals,
    upcomingMeetings,
    currentMonthRevenue,
    currentMonthGoal,
  };
}
