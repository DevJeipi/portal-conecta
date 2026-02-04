"use server";

import { createClient } from "@/utils/supabase/server";

export async function getDashboardStats() {
  const supabase = await createClient();

  // Data de agora
  const now = new Date();

  // Data de daqui a 48 horas
  const in48Hours = new Date();
  in48Hours.setHours(in48Hours.getHours() + 48);

  // Busca posts agendados entre agora e daqui a 48H
  const { count, error } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true }) // Só conta, não traz os dados
    .gte("scheduled_date", now.toISOString()) // Maior ou igual a agora
    .lte("scheduled_date", in48Hours.toISOString()); // Menor ou igual a 48h

  if (error) {
    console.error("Erro ao buscar stats:", error);
    return { urgentPosts: 0 };
  }

  return {
    urgentPosts: count || 0,
  };
}
