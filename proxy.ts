import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "@/utils/supabase/env";

// Rotas que não precisam de login
const publicRoutes = [
  { path: "/", whenAuthenticated: "redirect" },
  { path: "/auth/callback", whenAuthenticated: "next" },
] as const;

const REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE = "/";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const publicRoute = publicRoutes.find((route) => route.path === path);

  const userRole = request.cookies.get("user_role")?.value;
  const getHomeByRole = (role: string) => {
    if (role === "admin") return "/admin/dashboard";
    if (role === "employee") return "/admin/calendar/posts";
    return "/dashboard";
  };

  if (userRole) {
    if (publicRoute && publicRoute.whenAuthenticated === "redirect") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = getHomeByRole(userRole);
      return NextResponse.redirect(redirectUrl);
    }

    if (path.startsWith("/admin")) {
      // Employee so pode acessar o modulo de calendario do admin.
      if (userRole === "employee" && !path.startsWith("/admin/calendar")) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/admin/calendar/posts";
        return NextResponse.redirect(redirectUrl);
      }

      if (userRole !== "admin" && userRole !== "employee") {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/dashboard";
        return NextResponse.redirect(redirectUrl);
      }
    }

    // /dashboard e area exclusiva de cliente.
    if (path.startsWith("/dashboard") && userRole !== "client") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = getHomeByRole(userRole);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Renova a sessão do Supabase Auth a cada request para manter os tokens válidos
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
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
    },
  );

  // getUser() força a renovação do token se estiver expirado
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

  if (!userRole) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const resolvedRole = profile?.role ?? "client";
    supabaseResponse.cookies.set("user_role", resolvedRole, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });

    if (publicRoute && publicRoute.whenAuthenticated === "redirect") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = getHomeByRole(resolvedRole);
      return NextResponse.redirect(redirectUrl);
    }

    if (path.startsWith("/admin")) {
      if (resolvedRole === "employee" && !path.startsWith("/admin/calendar")) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/admin/calendar/posts";
        return NextResponse.redirect(redirectUrl);
      }

      if (resolvedRole !== "admin" && resolvedRole !== "employee") {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/dashboard";
        return NextResponse.redirect(redirectUrl);
      }
    }

    if (path.startsWith("/dashboard") && resolvedRole !== "client") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = getHomeByRole(resolvedRole);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
