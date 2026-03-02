"use server";

import { createClient } from "@/utils/supabase/server";

async function getClientContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, company_id, company_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "client") {
    throw new Error("Acesso não autorizado.");
  }

  return {
    supabase,
    userEmail: user.email ?? null,
    companyId: profile.company_id as string | null,
    companyName: (profile.company_name as string | null) ?? null,
  };
}

export async function getClientCalendarPosts() {
  const { supabase, companyId, companyName, userEmail } = await getClientContext();
  let resolvedCompanyId = companyId;

  if (!resolvedCompanyId && companyName) {
    const { data: companyByName } = await supabase
      .from("companies")
      .select("id")
      .eq("name", companyName)
      .maybeSingle();
    resolvedCompanyId = companyByName?.id ?? null;

    if (!resolvedCompanyId) {
      const { data: companyByNameInsensitive } = await supabase
        .from("companies")
        .select("id")
        .ilike("name", companyName)
        .maybeSingle();
      resolvedCompanyId = companyByNameInsensitive?.id ?? null;
    }
  }

  if (!resolvedCompanyId && userEmail) {
    const { data: wonDeal } = await supabase
      .from("deals")
      .select("company_id")
      .eq("email", userEmail)
      .eq("stage", "won")
      .limit(1)
      .maybeSingle();
    resolvedCompanyId = wonDeal?.company_id ?? null;
  }

  if (!companyId && resolvedCompanyId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({ company_id: resolvedCompanyId })
        .eq("id", user.id);
    }
  }

  if (!resolvedCompanyId) {
    return [];
  }

  const { data, error } = await supabase
    .from("content_posts")
    .select("*")
    .eq("company_id", resolvedCompanyId)
    .order("post_date", { ascending: true });

  if (error) {
    console.error("Erro ao buscar posts do cliente:", error);
    return [];
  }

  return data || [];
}
