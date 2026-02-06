import { NextResponse, type NextRequest } from "next/server";

// Rotas que não precisam de login
const publicRoutes = [
  { path: "/", whenAuthenticated: "redirect" },
  { path: "/auth/callback", whenAuthenticated: "next" },
] as const;

const REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE = "/";

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const publicRoute = publicRoutes.find((route) => route.path === path);

  // AQUI ESTÁ A CORREÇÃO:
  // Não buscamos 'token' nem 'sb-auth-token'.
  // Confiamos no cookie que VOCÊ criou no actions.ts
  const userRole = request.cookies.get("user_role")?.value;

  // 1. Se NÃO tem role e tenta acessar página privada -> Chuta para Login
  if (!userRole && !publicRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE;

    // Limpa qualquer lixo de cookie para evitar loops
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.delete("user_role");
    return response;
  }

  // 2. Se TEM role (está logado)
  if (userRole) {
    // Se tentar acessar login/home, manda para o dashboard correto
    if (publicRoute && publicRoute.whenAuthenticated === "redirect") {
      const redirectUrl = request.nextUrl.clone();
      if (userRole === "admin") {
        redirectUrl.pathname = "/admin/dashboard";
      } else {
        redirectUrl.pathname = "/dashboard";
      }
      return NextResponse.redirect(redirectUrl);
    }

    // Proteção de Rota Admin (Cliente tentando entrar em /admin)
    if (path.startsWith("/admin") && userRole !== "admin") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
