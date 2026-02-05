"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getClients() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, email, role, company_name")
    .eq("role", "client");
  return data || [];
}

export async function getCalendarPosts(clientId?: string) {
  const supabase = await createClient();

  let query = supabase.from("posts").select(`
      *,
      profiles (company_name, email)
    `);

  if (clientId && clientId !== "all") {
    query = query.eq("client_id", clientId);
  }

  const { data } = await query;
  return data || [];
}

export async function createPost(formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const date = formData.get("date") as string;
  const clientId = formData.get("clientId") as string;

  // Define meio-dia para evitar problemas de fuso horário
  const scheduledDate = new Date(`${date}T12:00:00`);

  await supabase.from("posts").insert({
    title,
    scheduled_date: scheduledDate.toISOString(),
    client_id: clientId,
    status: "scheduled",
  });

  revalidatePath("/admin/calendar");
}

export async function confirmPost(postId: string) {
  const supabase = await createClient();

  await supabase.from("posts").update({ status: "published" }).eq("id", postId);

  revalidatePath("/admin/calendar");
}

export async function deletePost(postId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("posts").delete().eq("id", postId);

  if (error) {
    throw new Error("Erro ao deletar post");
  }

  revalidatePath("/admin/calendar");
}
