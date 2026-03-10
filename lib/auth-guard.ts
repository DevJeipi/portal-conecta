import { createClient } from "@/utils/supabase/server";

export type AuthorizedContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  role: string;
};

/**
 * Verifica autenticação + role do banco de dados.
 * Lança erro se o usuário não for uma das roles permitidas.
 */
export async function requireRole(
  ...allowedRoles: string[]
): Promise<AuthorizedContext> {
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

  const role = profile?.role;

  if (!role || !allowedRoles.includes(role)) {
    throw new Error("Acesso não autorizado.");
  }

  return { supabase, userId: user.id, role };
}

export async function requireAdmin(): Promise<AuthorizedContext> {
  return requireRole("admin");
}

export async function requireAdminOrEmployee(): Promise<AuthorizedContext> {
  return requireRole("admin", "employee");
}

export async function requireClient(): Promise<AuthorizedContext> {
  return requireRole("client");
}
