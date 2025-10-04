import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes publiques
  const publicRoutes = ["/auth/login", "/auth/register", "/auth/error"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Obtenir le token JWT
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Rediriger vers login si non authentifié et route protégée
  if (!token && !isPublicRoute) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Rediriger vers dashboard si authentifié et sur page de login
  if (token && pathname.startsWith("/auth/login")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Extraction du tenant depuis le sous-domaine (pour production)
  const hostname = request.headers.get("host") || "";
  const subdomain = hostname.split(".")[0];

  // Vérifier que l'utilisateur appartient au bon tenant
  if (
    token &&
    subdomain &&
    subdomain !== "localhost:3000" &&
    subdomain !== "www"
  ) {
    const tenantSlug = token.tenantSlug as string;
    if (subdomain !== tenantSlug) {
      // Rediriger vers le bon sous-domaine
      const correctUrl = new URL(request.url);
      correctUrl.hostname = `${tenantSlug}.${hostname.split(".").slice(1).join(".")}`;
      return NextResponse.redirect(correctUrl);
    }
  }

  // Ajouter les headers de tenant pour les requêtes API
  const response = NextResponse.next();
  if (token) {
    response.headers.set("x-tenant-id", token.tenantId as string);
    response.headers.set("x-tenant-slug", token.tenantSlug as string);
    response.headers.set("x-user-id", token.id as string);
    response.headers.set("x-user-role", token.role as string);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png$|manifest.json).*)",
  ],
};
