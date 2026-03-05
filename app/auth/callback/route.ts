import { createRouteClient } from "@/utils/supabase/route";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createRouteClient();

    // 1. Troca o código pela sessão (Login acontece aqui)
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 2. Descobrir quem logou
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let role = "user";

      if (user && user.email) {
        const normalizedEmail = user.email.trim().toLowerCase();

        // 3. Verifica se já tem perfil cadastrado
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.role) {
          // Perfil já existe — usa o role cadastrado
          role = profile.role;
        } else if (!profile) {
          // 3.1 Prioriza a fila de onboarding disparada ao marcar deal como "won"
          let resolvedCompanyId: string | null = null;
          let resolvedCompanyName: string | null = null;
          let queueId: string | null = null;

          const { data: onboardingQueue } = await supabase
            .from("client_onboarding_queue")
            .select("id, company_id, company_name")
            .ilike("email", normalizedEmail)
            .eq("status", "pending")
            .limit(1)
            .maybeSingle();

          if (onboardingQueue) {
            queueId = onboardingQueue.id as string;
            resolvedCompanyId = (onboardingQueue.company_id as string | null) ?? null;
            resolvedCompanyName =
              (onboardingQueue.company_name as string | null) ?? null;
          } else {
            // 3.2 Fallback para deals ganhos antigas (antes da fila)
            const { data: wonDeal } = await supabase
              .from("deals")
              .select("company_id, company_name")
              .eq("email", normalizedEmail)
              .eq("stage", "won")
              .limit(1)
              .maybeSingle();

            resolvedCompanyId = (wonDeal?.company_id as string | null) ?? null;
            resolvedCompanyName =
              (wonDeal?.company_name as string | null) ?? null;
          }

          if (resolvedCompanyId || resolvedCompanyName) {
            const { error: createProfileError } = await supabase
              .from("profiles")
              .insert({
                id: user.id,
                email: normalizedEmail,
                role: "client",
                company_id: resolvedCompanyId,
                company_name: resolvedCompanyName,
              });

            if (!createProfileError) {
              role = "client";
              if (queueId) {
                await supabase
                  .from("client_onboarding_queue")
                  .update({
                    status: "profile_created",
                    profile_id: user.id,
                    error_message: null,
                  })
                  .eq("id", queueId);
              }
            } else if (queueId) {
              await supabase
                .from("client_onboarding_queue")
                .update({
                  status: "error",
                  error_message: createProfileError.message,
                })
                .eq("id", queueId);
              console.error("Erro ao criar profile via onboarding:", createProfileError);
            } else {
              console.error("Erro ao criar profile de cliente:", createProfileError);
            }
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
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 semana
      });

      return response;
    }
  }

  // Se der erro no login
  return NextResponse.redirect(`${origin}/?error=auth-code-error`);
}
