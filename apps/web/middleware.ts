import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // 認証が必要なパス
  const protectedPaths = ["/"];
  
  // 認証が不要なパス（ログイン・登録画面など）
  const publicPaths = ["/sign-in", "/sign-up"];
  
  const { pathname } = request.nextUrl;
  
  // 静的ファイルやAPIルートは除外
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }
  
  // アクセストークンの確認
  const accessToken = request.cookies.get("accessToken");
  
  // 保護されたパスへのアクセス
  if (protectedPaths.includes(pathname)) {
    if (!accessToken) {
      // 未ログインの場合、ログイン画面にリダイレクト
      const loginUrl = new URL("/sign-in", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // ログイン済みユーザーが認証画面にアクセスした場合
  if (publicPaths.includes(pathname) && accessToken) {
    // トップページにリダイレクト
    const homeUrl = new URL("/", request.url);
    return NextResponse.redirect(homeUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};