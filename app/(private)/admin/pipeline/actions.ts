"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import type { Deal } from "./constants";

type DealRow = {
  id: string;
  title: string;
  email: string | null;
  company_id: string | null;
  company_name: string | null;
  stage: string;
};

type OnboardingQueueStatus = "queued" | "skipped_no_email" | "failed";
type CompanyResolveStatus = "not_needed" | "linked_existing" | "created" | "failed";
type CompanyErrorCode =
  | "missing_company_name"
  | "permission_denied"
  | "constraint_violation"
  | "unknown";

async function ensureCompanyForDeal(
  supabase: Awaited<ReturnType<typeof createClient>>,
  deal: DealRow,
) {
  if (deal.company_id) {
    return {
      companyId: deal.company_id,
      status: "not_needed" as CompanyResolveStatus,
      errorCode: null as CompanyErrorCode | null,
    };
  }

  const companyName = deal.company_name?.trim();
  if (!companyName) {
    return {
      companyId: null,
      status: "failed" as CompanyResolveStatus,
      errorCode: "missing_company_name" as CompanyErrorCode,
    };
  }

  const { data: existingByName } = await supabase
    .from("companies")
    .select("id")
    .eq("name", companyName)
    .maybeSingle();

  if (existingByName?.id) {
    return {
      companyId: existingByName.id as string,
      status: "linked_existing" as CompanyResolveStatus,
      errorCode: null as CompanyErrorCode | null,
    };
  }

  const { data: existingByNameInsensitive } = await supabase
    .from("companies")
    .select("id")
    .ilike("name", companyName)
    .maybeSingle();

  if (existingByNameInsensitive?.id) {
    return {
      companyId: existingByNameInsensitive.id as string,
      status: "linked_existing" as CompanyResolveStatus,
      errorCode: null as CompanyErrorCode | null,
    };
  }

  const { data: insertedCompany, error } = await supabase
    .from("companies")
    .insert({
      name: companyName,
      status: "active",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Erro ao criar company para deal ganho:", error);
    const { data: companyAfterError } = await supabase
      .from("companies")
      .select("id")
      .ilike("name", companyName)
      .maybeSingle();
    if (companyAfterError?.id) {
      return {
        companyId: companyAfterError.id as string,
        status: "linked_existing" as CompanyResolveStatus,
        errorCode: null as CompanyErrorCode | null,
      };
    }

    const errorCode: CompanyErrorCode =
      error.code === "42501"
        ? "permission_denied"
        : error.code === "23514"
          ? "constraint_violation"
          : "unknown";

    return {
      companyId: null,
      status: "failed" as CompanyResolveStatus,
      errorCode,
    };
  }

  return {
    companyId: (insertedCompany?.id as string | undefined) ?? null,
    status: "created" as CompanyResolveStatus,
    errorCode: null as CompanyErrorCode | null,
  };
}

async function queueClientOnboarding(
  supabase: Awaited<ReturnType<typeof createClient>>,
  deal: DealRow,
  resolvedCompanyId: string | null,
) : Promise<OnboardingQueueStatus> {
  if (!deal.email) return "skipped_no_email";

  const normalizedEmail = deal.email.trim().toLowerCase();
  if (!normalizedEmail) return "skipped_no_email";

  const { data: existingQueue, error: existingQueueError } = await supabase
    .from("client_onboarding_queue")
    .select("id")
    .ilike("email", normalizedEmail)
    .limit(1)
    .maybeSingle();

  if (existingQueueError) {
    console.error(
      "Erro ao buscar fila de onboarding do cliente (deal ganho):",
      existingQueueError,
    );
    return "failed";
  }

  if (existingQueue?.id) {
    const { error: updateQueueError } = await supabase
      .from("client_onboarding_queue")
      .update({
        deal_id: deal.id,
        email: normalizedEmail,
        company_id: resolvedCompanyId,
        company_name: deal.company_name,
        source: "deal_won",
        status: "pending",
        error_message: null,
      })
      .eq("id", existingQueue.id);

    if (updateQueueError) {
      console.error(
        "Erro ao atualizar fila de onboarding do cliente:",
        updateQueueError,
      );
      return "failed";
    }

    return "queued";
  }

  const { error: insertQueueError } = await supabase
    .from("client_onboarding_queue")
    .insert({
      deal_id: deal.id,
      email: normalizedEmail,
      company_id: resolvedCompanyId,
      company_name: deal.company_name,
      source: "deal_won",
      status: "pending",
    });

  if (insertQueueError) {
    console.error("Erro ao inserir fila de onboarding do cliente:", insertQueueError);
    return "failed";
  }

  return "queued";
}

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

export async function updateDealStage(
  dealId: string,
  newStage: string,
): Promise<{
  success: boolean;
  onboardingQueueStatus?: OnboardingQueueStatus;
  companyStatus?: CompanyResolveStatus;
  companyErrorCode?: CompanyErrorCode | null;
}> {
  const supabase = await createClient();

  if (newStage === "won") {
    const { data: dealData, error: dealError } = await supabase
      .from("deals")
      .select("id, title, email, company_id, company_name, stage")
      .eq("id", dealId)
      .maybeSingle();

    if (dealError || !dealData) {
      console.error("Erro ao buscar deal para marcar como ganha:", dealError);
      return {
        success: false,
        onboardingQueueStatus: "failed" as const,
        companyStatus: "failed" as const,
        companyErrorCode: "unknown" as const,
      };
    }

    const deal = dealData as DealRow;
    const companyResolution = await ensureCompanyForDeal(supabase, deal);
    const resolvedCompanyId = companyResolution.companyId;

    const { error: updateError } = await supabase
      .from("deals")
      .update({
        stage: newStage,
        company_id: resolvedCompanyId ?? deal.company_id ?? null,
      })
      .eq("id", dealId);

    if (updateError) {
      console.error("Erro ao mover deal para ganho:", updateError);
      return {
        success: false,
        onboardingQueueStatus: "failed" as const,
        companyStatus: companyResolution.status,
        companyErrorCode: companyResolution.errorCode,
      };
    }

    const onboardingQueueStatus = await queueClientOnboarding(
      supabase,
      deal,
      resolvedCompanyId ?? deal.company_id,
    );

    revalidatePath("/admin/pipeline");
    return {
      success: true,
      onboardingQueueStatus,
      companyStatus: companyResolution.status,
      companyErrorCode: companyResolution.errorCode,
    };
  }

  const { error } = await supabase
    .from("deals")
    .update({ stage: newStage })
    .eq("id", dealId);

  if (error) {
    console.error("Erro ao mover deal:", error);
    return { success: false };
  }

  revalidatePath("/admin/pipeline");
  return { success: true };
}

export async function deleteDeal(dealId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("deals").delete().eq("id", dealId);

  if (error) {
    console.error("Erro ao deletar deal:", error);
    return { success: false };
  }

  revalidatePath("/admin/pipeline");
  return { success: true };
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
