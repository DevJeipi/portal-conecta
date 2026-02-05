"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getMeetings(clientId?: string) {
  const supabase = await createClient();

  let query = supabase.from("meetings").select(`
      *,
      profiles (company_name, email)
    `);

  if (clientId && clientId !== "all") {
    query = query.eq("client_id", clientId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar reuniões:", error);
    return [];
  }

  return data || [];
}

export async function createMeeting(formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const date = formData.get("date") as string;
  const time = formData.get("time") as string; // Campo novo
  const link = formData.get("link") as string; // Campo novo
  const clientId = formData.get("clientId") as string;

  // Cria um objeto Date combinando Data + Hora
  // Ex: "2026-02-06" + "14:30"
  const startDateTime = new Date(`${date}T${time}`);

  const { error } = await supabase.from("meetings").insert({
    title,
    start_time: startDateTime.toISOString(), // Salva como timestamp completo
    meeting_link: link,
    client_id: clientId,
    status: "scheduled",
  });

  if (error) {
    console.error("Erro ao criar reunião:", error);
    throw new Error("Falha ao criar agendamento");
  }

  revalidatePath("/admin/calendar/meetings");
}

export async function deleteMeeting(meetingId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("meetings")
    .delete()
    .eq("id", meetingId);

  if (error) {
    throw new Error("Erro ao deletar reunião");
  }

  revalidatePath("/admin/calendar/meetings");
}
