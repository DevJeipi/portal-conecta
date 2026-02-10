"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type Deal = {
  id: string;
  title: string;
  company_name: string;
  value: number;
  status: "new" | "contacted" | "proposal" | "negotiation" | "won" | "lost";
  updated_at: string;
  email?: string;
};

export async function getDeals() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("deals")
    .select("*")
    .order("updated_at", { ascending: false });
  return (data as Deal[]) || [];
}

export async function updateDealStatus(dealId: string, newStatus: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("deals")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", dealId);

  if (error) console.error("Erro ao mover card:", error);

  revalidatePath("/admin/pipeline");
}

export async function convertDealToClient(
  dealId: string,
  email: string,
  name: string,
) {
  const supabase = await createClient();

  // 1. Aqui você chamaria sua função de criar usuário (auth.signUp ou admin.createUser)
  // Vou simular apenas o vínculo para não complicar o exemplo agora

  console.log(`Criando usuário para ${email}...`);

  // 2. Atualiza o deal marcando que ele virou cliente (opcional, se criou coluna converted_client_id)
  // await supabase.from("deals").update({ converted_client_id: novoUserId }).eq('id', dealId);

  revalidatePath("/admin/pipeline");
  return { success: true };
}

export async function createDeal(formData: FormData) {
  const supabase = await createClient();

  const title = (formData.get("title") as string)?.trim();
  const company_name = (formData.get("company_name") as string)?.trim();
  const valueRaw = (formData.get("value") as string) ?? "";
  const contact_name = (formData.get("contact_name") as string)?.trim() ?? null;
  const email = (formData.get("email") as string)?.trim() || null;

  if (!title || !company_name) {
    throw new Error("Título e nome da empresa são obrigatórios.");
  }

  // Limpa o valor monetário para salvar como numero (tira R$, pontos, etc)
  // Ex: "R$ 1.200,50" ou "1200,50" vira 1200.50
  const numericValue =
    parseFloat(
      valueRaw.replace(/R\$/g, "").replace(/\./g, "").replace(",", ".").trim(),
    ) || 0;

  const { error } = await supabase.from("deals").insert({
    title,
    company_name,
    contact_name,
    email,
    value: numericValue,
    status: "new", // Todo deal começa na primeira coluna
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Erro ao criar deal:", error);
    throw new Error("Erro ao criar negociação");
  }

  revalidatePath("/admin/pipeline");
  return { success: true };
}
