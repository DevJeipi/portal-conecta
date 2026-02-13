"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import type { Deal } from "./constants";

export async function getDeals(): Promise<Deal[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar deals:", error);
    return [];
  }

  return (data as Deal[]) ?? [];
}

export async function updateDealStage(dealId: string, newStage: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("deals")
    .update({ stage: newStage })
    .eq("id", dealId);

  if (error) console.error("Erro ao mover deal:", error);

  revalidatePath("/admin/pipeline");
}

export async function createDeal(formData: FormData) {
  const supabase = await createClient();

  const title = (formData.get("title") as string)?.trim();
  const company_name = (formData.get("company_name") as string)?.trim();
  const valueRaw = (formData.get("value") as string) ?? "";
  const contact_name =
    (formData.get("contact_name") as string)?.trim() || null;
  const email = (formData.get("email") as string)?.trim() || null;
  const rawDealType = (formData.get("deal_type") as string)?.trim();
  const deal_type = rawDealType === "recurring" ? "recurring" : "one_off";

  if (!title || !company_name) {
    throw new Error("Título e nome da empresa são obrigatórios.");
  }

  const numericValue =
    parseFloat(
      valueRaw
        .replace(/R\$/g, "")
        .replace(/\./g, "")
        .replace(",", ".")
        .trim(),
    ) || 0;

  const payload = {
    title,
    company_name,
    contact_name,
    email,
    value: numericValue,
    stage: "new",
    deal_type,
  };

  let { error } = await supabase.from("deals").insert(payload);

  // Compatibilidade: se a coluna deal_type ainda nao existir no banco,
  // tenta criar sem esse campo para nao quebrar o fluxo atual.
  if (error?.message?.includes("deal_type")) {
    const fallback = await supabase.from("deals").insert({
      title,
      company_name,
      contact_name,
      email,
      value: numericValue,
      stage: "new",
    });
    error = fallback.error;
  }

  if (error) {
    console.error("Erro ao criar deal:", error);
    throw new Error("Erro ao criar negociação.");
  }

  revalidatePath("/admin/pipeline");
  return { success: true };
}
