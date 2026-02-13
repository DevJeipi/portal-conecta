import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();

    // 1. Troca o código pela sessão (Login acontece aqui)
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 2. Descobrir quem logou
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let role = "user";

      if (user && user.email) {
        // 3. Verifica se já tem perfil cadastrado
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role) {
          // Perfil já existe — usa o role cadastrado
          role = profile.role;
        } else if (!profile) {
          // Perfil não existe — verifica se o email bate com algum deal ganho
          const { data: wonDeal } = await supabase
            .from("deals")
            .select("id, company_name")
            .eq("email", user.email)
            .eq("stage", "won")
            .limit(1)
            .maybeSingle();

          if (wonDeal) {
            // Cliente reconhecido! Cria o perfil automaticamente
            await supabase.from("profiles").insert({
              id: user.id,
              email: user.email,
              role: "client",
              company_name: wonDeal.company_name ?? null,
            });
            role = "client";
          }
        }
      }

      // 4. Define para onde vai baseado no cargo descoberto
      const finalUrl =
        role === "admin"
          ? "/admin/dashboard"
          : role === "employee"
            ? "/admin/calendar/posts"
            : "/dashboard";

      const response = NextResponse.redirect(`${origin}${finalUrl}`);

      // 5. Grava o cookie de role (o proxy usa isso para controle de acesso)
      response.cookies.set("user_role", role, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 1 semana
      });

      return response;
    }
  }

  // Se der erro no login
  return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
}
