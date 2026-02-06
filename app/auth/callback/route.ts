import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Ignoramos o 'next' original para forçar o redirecionamento correto baseado no cargo

  if (code) {
    const supabase = await createClient();

    // 1. Troca o código pela sessão (Login acontece aqui)
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 2. Descobrir quem logou
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Começamos assumindo que é um usuário comum
      let role = "user";

      if (user && user.email) {
        // --- LÓGICA DE ADMIN ---
        // OPÇÃO A: Lista de Emails VIP (Mais rápido pra funcionar AGORA)
        // Substitua pelo SEU email do Google
        /*const adminEmails = [
          "conectaamarketing@gmail.com",
          "joaopedroghilardi@gmail.com",
        ];

        if (adminEmails.includes(user.email)) {
          role = "admin";
        }*/

        // Se você tiver uma coluna 'role' ou 'is_admin' no banco, use assim:

        const { data: profile } = await supabase
          .from("profiles")
          .select("role") // Certifique-se que essa coluna existe
          .eq("id", user.id)
          .single();

        if (profile?.role === "admin") {
          role = "admin";
        }
      }

      // 3. Define para onde vai baseado no cargo descoberto
      const finalUrl = role === "admin" ? "/admin/dashboard" : "/dashboard";

      // Cria a resposta de redirecionamento
      const response = NextResponse.redirect(`${origin}${finalUrl}`);

      // 4. GRAVA O COOKIE (Isso é o que faz o Middleware deixar você passar)
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
