"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

async function isClientActive(
  supabase: Awaited<ReturnType<typeof createClient>>,
  profile: { company_id?: string | null; company_name?: string | null; email?: string | null },
) {
  if (!profile.company_id) return true;

  const { data: company } = await supabase
    .from("companies")
    .select("status")
    .eq("id", profile.company_id)
    .maybeSingle();

  if (!company) return true;
  return company.status !== "inactive";
}

export async function login(formData: FormData) {
  // Cria o cliente do Supabase
  const supabase = await createClient();

  // Recebe os dados do formulário
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Tenta logar no Supabase Auth
  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Erro de Login:", error.message);
    return redirect("/?error=login_failed");
  }

  // Se logou, busca a ROLE na tabela profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, company_id, company_name, email")
    .eq("id", data.user.id)
    .single();

  const userRole = profile?.role || "client";

  if (userRole === "client") {
    const active = await isClientActive(supabase, profile ?? {});
    if (!active) {
      await supabase.auth.signOut();
      return redirect("/?error=client_inactive");
    }
  }

  // Salva o cookie extra para o Middleware ler rápido
  const cookieStore = await cookies();
  cookieStore.set("user_role", userRole, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  // Redirecionamento por role
  if (userRole === "admin") {
    redirect("/admin/dashboard");
  }

  if (userRole === "employee") {
    redirect("/admin/calendar/posts");
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();

  //  Desloga do Supabase
  await supabase.auth.signOut();

  // Apaga o cookie de permissão
  const cookieStore = await cookies();
  cookieStore.delete("user_role");

  // Manda de volta pra tela de login
  redirect("/");
}
