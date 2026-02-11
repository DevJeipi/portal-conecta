"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getClients() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("companies").select("*");

  if (error) {
    console.error("Erro ao buscar companies:", error);
  }

  return data || [];
}

export async function getCalendarPosts(clientId?: string) {
  const supabase = await createClient();

  let query = supabase.from("content_posts").select(`
      *,
      companies:company_id (id, name)
    `);

  if (clientId && clientId !== "all") {
    query = query.eq("company_id", clientId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar posts:", error);
  }

  console.log("Posts retornados:", JSON.stringify(data, null, 2));

  return data || [];
}

export async function createPost(formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const date = formData.get("date") as string;
  const time = (formData.get("time") as string) || "12:00";
  const clientId = formData.get("clientId") as string;
  const description = (formData.get("description") as string) || null;

  console.log("Tentando criar post para a empresa:", clientId);

  const scheduledDate = new Date(`${date}T${time}:00`);

  const insertData: Record<string, any> = {
    title,
    post_date: scheduledDate.toISOString(),
    company_id: clientId,
    status: "planned",
  };

  // Só inclui description se tiver valor (evita erro caso coluna não exista)
  if (description) {
    insertData.description = description;
  }

  const { error } = await supabase.from("content_posts").insert(insertData);

  if (error) {
    console.error("Erro ao criar post:", error);
    throw new Error(`Erro ao criar post: ${error.message}`);
  }

  revalidatePath("/admin/calendar/posts");
}

export async function confirmPost(postId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("content_posts")
    .update({ status: "posted" })
    .eq("id", postId);

  if (error) {
    console.error("Erro ao confirmar post:", error);
    throw new Error(`Erro ao confirmar post: ${error.message}`);
  }

  revalidatePath("/admin/calendar/posts");
}

export async function updatePost(postId: string, formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const date = formData.get("date") as string;
  const time = (formData.get("time") as string) || "12:00";
  const clientId = formData.get("clientId") as string;
  const description = (formData.get("description") as string) || null;

  const scheduledDate = new Date(`${date}T${time}:00`);

  const updateData: Record<string, any> = {
    title,
    post_date: scheduledDate.toISOString(),
    company_id: clientId,
  };

  // Só inclui description se foi preenchida
  if (description !== null) {
    updateData.description = description;
  }

  const { error } = await supabase
    .from("content_posts")
    .update(updateData)
    .eq("id", postId);

  if (error) {
    console.error("Erro ao atualizar post:", error);
    throw new Error(`Erro ao atualizar post: ${error.message}`);
  }

  revalidatePath("/admin/calendar/posts");
}

export async function deletePost(postId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("content_posts")
    .delete()
    .eq("id", postId);

  if (error) {
    throw new Error("Erro ao deletar post");
  }

  revalidatePath("/admin/calendar/posts");
}
