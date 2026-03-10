import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "@/utils/supabase/env";

const publicRoutes = [
  { path: "/", whenAuthenticated: "redirect" },
  { path: "/auth/callback", whenAuthenticated: "next" },
] as const;

const REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE = "/";

async function isClientActiveForUser(
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", userId)
    .maybeSingle();

  if (!profile?.company_id) return true;

  const { data: company } = await supabase
    .from("companies")
    .select("status")
    .eq("id", profile.company_id)
    .maybeSingle();

  if (!company) return true;
  return company.status !== "inactive";
}

const getHomeByRole = (role: string) => {
  if (role === "admin") return "/admin/dashboard";
  if (role === "employee") return "/admin/calendar/posts";
  return "/dashboard";
};

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isStaticAsset =
    path === "/sw.js" ||
    path === "/manifest.json" ||
    path === "/site.webmanifest" ||
    path === "/favicon.ico" ||
    path.startsWith("/icons/") ||
    path.startsWith("/images/") ||
    /\.[a-zA-Z0-9]+$/.test(path);

  if (isStaticAsset) {
    return NextResponse.next();
  }

  const publicRoute = publicRoutes.find((route) => route.path === path);

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (!publicRoute) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE;
      const response = NextResponse.redirect(redirectUrl);
      response.cookies.delete("user_role");
      return response;
    }
    return supabaseResponse;
  }

  // SEMPRE busca a role do banco — nunca confia no cookie
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const verifiedRole = profile?.role ?? "client";

  // Atualiza o cookie com a role verificada do banco
  const cookieRole = request.cookies.get("user_role")?.value;
  if (cookieRole !== verifiedRole) {
    supabaseResponse.cookies.set("user_role", verifiedRole, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  // Controle de acesso baseado na role VERIFICADA do banco
  if (path.startsWith("/admin")) {
    if (verifiedRole === "employee" && !path.startsWith("/admin/calendar")) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/admin/calendar/posts";
      return NextResponse.redirect(redirectUrl);
    }

    if (verifiedRole !== "admin" && verifiedRole !== "employee") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (path.startsWith("/dashboard") && verifiedRole !== "client") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = getHomeByRole(verifiedRole);
    return NextResponse.redirect(redirectUrl);
  }

  if (verifiedRole === "client") {
    const active = await isClientActiveForUser(supabase, user.id);
    if (!active) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/";
      redirectUrl.searchParams.set("error", "client_inactive");
      const response = NextResponse.redirect(redirectUrl);
      response.cookies.delete("user_role");
      return response;
    }
  }

  if (publicRoute && publicRoute.whenAuthenticated === "redirect") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = getHomeByRole(verifiedRole);
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image).*)"],
};
