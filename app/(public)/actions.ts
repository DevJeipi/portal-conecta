"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

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
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  // Agora sim essas variáveis existem para serem logadas
  console.log("------------------------------------------------");
  console.log("ID do Usuário:", data.user.id);
  console.log("Erro ao buscar perfil?", profileError);
  console.log("Dados do perfil encontrados:", profile);
  console.log("------------------------------------------------");

  const userRole = profile?.role || "client";

  // Salva o cookie extra para o Middleware ler rápido
  const cookieStore = await cookies();
  cookieStore.set("user_role", userRole, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  // Redirecionamento
  if (userRole === "admin") {
    redirect("/admin/dashboard");
  } else {
    redirect("/dashboard");
  }
}
