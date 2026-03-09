"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  decryptCredentialPassword,
  encryptCredentialPassword,
} from "@/lib/client-credentials-crypto";

type AuthorizedContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
};

export type ClientListItem = {
  id: string;
  name: string;
  status: "active" | "inactive";
  primary_email: string | null;
  notes: string | null;
};

export type ClientDetails = ClientListItem;

export type ClientOnboardingStep = {
  id: string;
  step_key: string;
  step_title: string;
  step_order: number;
  assigned_partner_id: string | null;
  assigned_partner_name: string | null;
  status: "pending" | "in_progress" | "done";
  note: string | null;
  completed_at: string | null;
};

export type ClientCredential = {
  id: string;
  service_name: string;
  login_email: string | null;
  url: string | null;
  notes: string | null;
  created_at: string;
  masked_password: string;
  revealed_password: string | null;
};

async function getAuthorizedAdminContext(): Promise<AuthorizedContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    throw new Error("Acesso não autorizado.");
  }

  return { supabase, userId: user.id };
}

async function seedMissingChecklistSteps(
  supabase: Awaited<ReturnType<typeof createClient>>,
  companyId: string,
) {
  const { data: admins } = await supabase
    .from("profiles")
    .select("id,email")
    .eq("role", "admin");

  const resolvePartnerByName = (ownerName: string | null) => {
    const normalizedOwner = (ownerName ?? "").trim().toLowerCase();
    if (!normalizedOwner || !admins) return null;
    return (
      admins.find((admin) =>
        String(admin.email ?? "").toLowerCase().includes(normalizedOwner),
      ) ?? null
    );
  };

  const { data: templates, error: templatesError } = await supabase
    .from("onboarding_step_templates")
    .select("step_key,step_title,step_order,default_owner_name")
    .order("step_order", { ascending: true });

  if (templatesError || !templates || templates.length === 0) {
    return;
  }

  const { data: existingRows } = await supabase
    .from("client_onboarding_steps")
    .select("step_key")
    .eq("company_id", companyId);

  const existing = new Set((existingRows ?? []).map((row) => row.step_key));
  const missing = templates.filter((template) => !existing.has(template.step_key));
  if (missing.length > 0) {
    const payload = missing.map((template) => ({
      ...(template.step_key
        ? {
            assigned_partner_id:
              resolvePartnerByName(String(template.default_owner_name ?? ""))?.id ??
              null,
            assigned_partner_name:
              String(template.default_owner_name ?? "").trim() || null,
          }
        : {}),
      company_id: companyId,
      step_key: String(template.step_key),
      step_title: String(template.step_title),
      step_order: Number(template.step_order),
      status: "pending" as const,
    }));

    await supabase.from("client_onboarding_steps").insert(payload);
  }

  // Mantém os donos fixos e o texto do checklist sincronizados com o template.
  for (const template of templates) {
    const resolvedPartner = resolvePartnerByName(
      String(template.default_owner_name ?? ""),
    );
    await supabase
      .from("client_onboarding_steps")
      .update({
        step_title: String(template.step_title),
        step_order: Number(template.step_order),
        assigned_partner_id: resolvedPartner?.id ?? null,
        assigned_partner_name:
          String(template.default_owner_name ?? "").trim() || null,
      })
      .eq("company_id", companyId)
      .eq("step_key", String(template.step_key));
  }
}

export async function syncClientsFromCompanies(formData: FormData): Promise<void> {
  void formData;
  const { supabase } = await getAuthorizedAdminContext();

  const { data: companies, error } = await supabase
    .from("companies")
    .select("id,status,primary_email")
    .order("name", { ascending: true });

  if (error || !companies) {
    throw new Error("Não foi possível sincronizar clientes.");
  }

  for (const company of companies) {
    const { data: primaryDeal } =
      !company.primary_email
        ? await supabase
            .from("deals")
            .select("email")
            .eq("company_id", company.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle()
        : { data: null };

    const updates: { primary_email?: string | null; status?: "active" | "inactive" } =
      {};

    if (!company.primary_email && primaryDeal?.email) {
      updates.primary_email = primaryDeal.email;
    }

    if (!company.status) {
      updates.status = "active";
    }

    if (Object.keys(updates).length > 0) {
      await supabase.from("companies").update(updates).eq("id", company.id);
    }

    await seedMissingChecklistSteps(supabase, String(company.id));
  }

  revalidatePath("/admin/clients");
}

export async function getClients(params?: {
  status?: string;
  query?: string;
}): Promise<ClientListItem[]> {
  const { supabase } = await getAuthorizedAdminContext();

  let query = supabase
    .from("companies")
    .select("id,name,status,primary_email,notes")
    .order("name", { ascending: true });

  if (params?.status === "active" || params?.status === "inactive") {
    query = query.eq("status", params.status);
  }

  const cleanQuery = params?.query?.trim();
  if (cleanQuery) {
    query = query.ilike("name", `%${cleanQuery}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Erro ao buscar clientes:", error);
    return [];
  }

  return (data as ClientListItem[]) ?? [];
}

export async function getClientDetails(clientId: string): Promise<ClientDetails | null> {
  const { supabase } = await getAuthorizedAdminContext();
  await seedMissingChecklistSteps(supabase, clientId);

  const { data: clientRow, error } = await supabase
    .from("companies")
    .select("id,name,status,primary_email,notes")
    .eq("id", clientId)
    .maybeSingle();

  if (error || !clientRow) return null;
  return clientRow as ClientListItem;
}

export async function getClientOnboardingSteps(
  clientId: string,
): Promise<ClientOnboardingStep[]> {
  const { supabase } = await getAuthorizedAdminContext();
  await seedMissingChecklistSteps(supabase, clientId);

  const { data, error } = await supabase
    .from("client_onboarding_steps")
    .select("*")
    .eq("company_id", clientId)
    .order("step_order", { ascending: true });

  if (error) {
    console.error("Erro ao buscar checklist de onboarding:", error);
    return [];
  }

  return (data as ClientOnboardingStep[]) ?? [];
}

export async function getClientCredentials(
  clientId: string,
  revealCredentialId?: string,
): Promise<ClientCredential[]> {
  const { supabase } = await getAuthorizedAdminContext();
  const { data, error } = await supabase
    .from("client_credentials")
    .select("*")
    .eq("company_id", clientId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar credenciais do cliente:", error);
    return [];
  }

  return (data ?? []).map((row) => {
    let revealedPassword: string | null = null;
    if (revealCredentialId && String(row.id) === revealCredentialId) {
      try {
        revealedPassword = decryptCredentialPassword(
          String(row.login_password_encrypted ?? ""),
          String(row.login_password_iv ?? ""),
        );
      } catch {
        revealedPassword = "Nao foi possivel revelar (chave invalida ou ausente).";
      }
    }

    return {
      id: String(row.id),
      service_name: String(row.service_name),
      login_email: row.login_email ? String(row.login_email) : null,
      url: row.url ? String(row.url) : null,
      notes: row.notes ? String(row.notes) : null,
      created_at: String(row.created_at),
      masked_password: "********",
      revealed_password: revealedPassword,
    };
  });
}

export async function updateClientGeneralInfo(formData: FormData) {
  const { supabase } = await getAuthorizedAdminContext();
  const clientId = String(formData.get("clientId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const primaryEmailRaw = String(formData.get("primaryEmail") ?? "").trim();
  const notesRaw = String(formData.get("notes") ?? "").trim();

  if (!clientId || !name) {
    throw new Error("Cliente inválido.");
  }

  const { error } = await supabase
    .from("companies")
    .update({
      name,
      primary_email: primaryEmailRaw || null,
      notes: notesRaw || null,
    })
    .eq("id", clientId);

  if (error) {
    console.error("Erro ao atualizar dados do cliente:", error);
    throw new Error("Não foi possível atualizar o cliente.");
  }

  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${clientId}`);
  redirect(`/admin/clients/${clientId}?tab=overview&saved=1`);
}

export async function toggleClientStatus(formData: FormData) {
  const { supabase } = await getAuthorizedAdminContext();
  const clientId = String(formData.get("clientId") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!clientId || (status !== "active" && status !== "inactive")) {
    throw new Error("Parâmetros inválidos.");
  }

  const { error } = await supabase
    .from("companies")
    .update({ status })
    .eq("id", clientId);

  if (error) {
    console.error("Erro ao atualizar status do cliente:", error);
    throw new Error("Não foi possível atualizar status do cliente.");
  }

  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${clientId}`);
  redirect(`/admin/clients/${clientId}?tab=overview&statusSaved=1`);
}

export async function updateOnboardingStep(formData: FormData) {
  const { supabase } = await getAuthorizedAdminContext();
  const stepId = String(formData.get("stepId") ?? "");
  const clientId = String(formData.get("clientId") ?? "");
  const status = String(formData.get("status") ?? "");
  const noteRaw = String(formData.get("note") ?? "").trim();

  if (!stepId || !clientId) {
    throw new Error("Passo inválido.");
  }

  const allowedStatus = ["pending", "in_progress", "done"];
  if (!allowedStatus.includes(status)) {
    throw new Error("Status inválido.");
  }

  const { error } = await supabase
    .from("client_onboarding_steps")
    .update({
      status,
      note: noteRaw || null,
      completed_at: status === "done" ? new Date().toISOString() : null,
    })
    .eq("id", stepId);

  if (error) {
    console.error("Erro ao atualizar passo de onboarding:", error);
    throw new Error("Não foi possível atualizar o checklist.");
  }

  revalidatePath(`/admin/clients/${clientId}`);
  redirect(`/admin/clients/${clientId}?tab=checklist&saved=1`);
}

export async function createClientCredential(formData: FormData) {
  const { supabase, userId } = await getAuthorizedAdminContext();
  const clientId = String(formData.get("clientId") ?? "");
  const serviceName = String(formData.get("serviceName") ?? "").trim();
  const loginEmail = String(formData.get("loginEmail") ?? "").trim();
  const loginPassword = String(formData.get("loginPassword") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!clientId || !serviceName || !loginPassword) {
    throw new Error("Serviço e senha são obrigatórios.");
  }

  const encrypted = encryptCredentialPassword(loginPassword);
  const { error } = await supabase.from("client_credentials").insert({
    company_id: clientId,
    service_name: serviceName,
    login_email: loginEmail || null,
    login_password_encrypted: encrypted.encrypted,
    login_password_iv: encrypted.iv,
    url: url || null,
    notes: notes || null,
    created_by: userId,
    updated_by: userId,
  });

  if (error) {
    console.error("Erro ao criar credencial do cliente:", error);
    throw new Error("Não foi possível salvar a credencial.");
  }

  revalidatePath(`/admin/clients/${clientId}`);
  redirect(`/admin/clients/${clientId}?tab=credentials&saved=1`);
}

export async function deleteClientCredential(formData: FormData) {
  const { supabase } = await getAuthorizedAdminContext();
  const credentialId = String(formData.get("credentialId") ?? "");
  const clientId = String(formData.get("clientId") ?? "");

  if (!credentialId || !clientId) {
    throw new Error("Credencial inválida.");
  }

  const { error } = await supabase
    .from("client_credentials")
    .delete()
    .eq("id", credentialId)
    .eq("company_id", clientId);

  if (error) {
    console.error("Erro ao excluir credencial:", error);
    throw new Error("Não foi possível excluir a credencial.");
  }

  revalidatePath(`/admin/clients/${clientId}`);
  redirect(`/admin/clients/${clientId}?tab=credentials&deleted=1`);
}
